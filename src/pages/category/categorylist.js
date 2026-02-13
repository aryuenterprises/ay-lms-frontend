import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable from 'react-data-table-component';
import {
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Stack,
  Grid,
  IconButton,
  FormLabel,
  InputAdornment,
  Tooltip,
  Switch
} from '@mui/material';
import axiosInstance from 'utils/axios';
import { BoxAdd, CloseSquare, Edit, SearchNormal1, Trash } from 'iconsax-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { PopupTransition } from 'components/@extended/Transitions';
import Swal from 'sweetalert2';

//css import
import 'assets/css/commonStyle.css';
import 'assets/css/DataTable.css';
import MainCard from 'components/MainCard';
import { APP_PATH_BASE_URL } from 'config';
import { usePermission } from 'hooks/usePermission';

const CategoryList = () => {
  const { checkPermission } = usePermission();

  const canCreate = checkPermission('Category', 'create');
  const canUpdate = checkPermission('Category', 'update');
  const canDelete = checkPermission('Category', 'delete');

  const [open, setOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [filterText, setFilterText] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/course_categories`);
      const result = response.data;
      setCategories(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpen = () => {
    setCurrentCategory(null);
    setOpen(true);
  };

  const filteredItems = categories.filter(
    (item) => item.category_name && item.category_name.toLowerCase().includes(filterText.toLowerCase())
  );

  const subHeaderComponentMemo = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText('');
      }
    };

    return (
      <Grid container justifyContent="space-between" alignItems="center" my={3}>
        <Grid item xs={12} md={6}>
          <TextField
            placeholder="Search..."
            variant="outlined"
            size="small"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchNormal1 size={20} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {filterText && (
                    <IconButton onClick={handleClear} edge="end" size="small">
                      <CloseSquare size={20} />
                    </IconButton>
                  )}
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} md={6} textAlign="right">
          {canCreate && (
            <Button color="success" variant="contained" startIcon={<BoxAdd />} onClick={handleOpen}>
              Add
            </Button>
          )}
        </Grid>
      </Grid>
    );
  }, [filterText, resetPaginationToggle, canCreate]);

  const handleEdit = (category) => {
    setCurrentCategory(category);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        // const response = await axiosInstance.delete(`${APP_PATH_BASE_URL}api/course_categories/${name}`);
        const response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/course_categories/${id}/archive`);
        if (response.data.success === true) {
          Swal.fire({
            title: 'Success!',
            text: 'Category has been deleted.',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          fetchData();
        } else {
          Swal.fire({
            title: 'Error!',
            text: response?.data?.message || 'Error deleting data.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to delete category.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    formik.resetForm();
  };

  const handleStatusChange = async (category, status) => {
    try {
      const newStatus = status; // Toggle status (true -> false, false -> true)
      const actionText = newStatus ? 'activate' : 'deactivate';

      const result = await Swal.fire({
        title: `${newStatus ? 'Activate' : 'Deactivate'} Category`,
        text: `Are you sure you want to ${actionText} this category?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      });

      // If user cancels, return early
      if (!result.isConfirmed) return;

      setLoading(true);
      await axiosInstance.patch(`${APP_PATH_BASE_URL}api/course_categories/${category.category_id}`, {
        status
      });

      // Update state
      setCategories(categories.map((c) => (c.category_id === category.category_id ? { ...c, status: newStatus } : c)));

      Swal.fire({
        title: 'Success',
        text: `Category has been ${actionText}d successfully!`,
        icon: 'success',
        showConfirmButton: true
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      category_name: currentCategory?.category_name || ''
    },
    validationSchema: Yup.object().shape({
      category_name: Yup.string()
        .required('Category name is required')
        .matches(/^[A-Za-z_]+(?: [A-Za-z_]+)*$/, 'Category name can only contain letters, spaces between words')
        .trim() // removes leading and trailing spaces
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        // Create the payload object correctly
        const payload = {
          category_name: values.category_name.trim() // Trim the value before sending
        };

        const method = currentCategory ? 'PUT' : 'POST';
        const url = currentCategory
          ? `${APP_PATH_BASE_URL}api/course_categories/${currentCategory.category_id}`
          : `${APP_PATH_BASE_URL}api/course_categories`;

        // Use the correct axios syntax - data should be passed as a property
        const response = await axiosInstance({
          method: method,
          url: url,
          data: payload // Use 'data' instead of 'payload'
        });

        const result = response.data;

        if (result.success === true) {
          Swal.fire({
            title: 'Success!',
            text: currentCategory ? 'Category updated successfully!' : 'Category added successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });

          resetForm();
          fetchData();
          handleClose();
        } else {
          const errorMessage = result.message;
          Swal.fire({
            title: 'Error!',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        Swal.fire({
          title: 'Error!',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        setSubmitting(false);
      }
    }
  });

  const columns = [
    {
      name: 'Sno',
      selector: (row, index) => index + 1,
      sortable: true,
      width: '80px'
    },
    {
      name: 'Name',
      selector: (row) => row.category_name,
      sortable: true
    },
    ...(canUpdate || canDelete
      ? [
          {
            name: 'Actions',
            cell: (row) => (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {/* Add the status toggle button here */}
                {canUpdate && (
                  <Tooltip title="Status">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(row, !row.status); // pass the toggled value
                      }}
                      sx={{ mr: 1 }}
                    >
                      <Switch size="medium" checked={row?.status === true} color={row?.status ? 'success' : 'error'} />
                    </IconButton>
                  </Tooltip>
                )}
                {canUpdate && (
                  <Tooltip title="Edit">
                    <IconButton color="info" variant="contained" onClick={() => handleEdit(row)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                )}
                {canDelete && (
                  <Tooltip title="Delete">
                    <IconButton variant="contained" color="error" onClick={() => handleDelete(row.category_id)}>
                      <Trash />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            )
          }
        ]
      : [])
  ];

  if (error) {
    return (
      <MainCard sx={{ borderRadius: 2 }}>
        <Box p={3} color="error.main">
          Error: {error}
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard>
      {subHeaderComponentMemo}

      <DataTable
        columns={columns}
        data={filteredItems}
        pagination
        paginationPerPage={10}
        paginationRowsPerPageOptions={[5, 10, 20, 30]}
        highlightOnHover
        progressPending={loading}
        responsive
      />

      {/* Add/Edit Category Dialog */}
      <Dialog
        maxWidth="xs"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') handleClose();
        }}
        BackdropProps={{
          onClick: (event) => event.stopPropagation()
        }}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle className="dialogTitle">
          {currentCategory ? 'Edit Category' : 'Add Category'}
          <IconButton color="dark" onClick={handleClose} edge="end" size="big" aria-label="close">
            <CloseSquare />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <FormLabel>Category Name*</FormLabel>
                  <TextField
                    fullWidth
                    id="category_name"
                    name="category_name"
                    placeholder="e.g., CMS, Full Stack Development"
                    value={formik.values.category_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.category_name && Boolean(formik.errors.category_name)}
                    helperText={formik.touched.category_name && formik.errors.category_name}
                  />
                </Stack>
              </Grid>
            </Grid>
            <DialogActions sx={{ mt: 3 }}>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained">
                {currentCategory ? 'Update' : 'Submit'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </MainCard>
  );
};

export default CategoryList;
