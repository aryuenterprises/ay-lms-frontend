import React, { useState, useEffect, useCallback } from 'react';
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
  Tooltip
  // Chip
} from '@mui/material';
import { BoxAdd, CloseSquare, Edit, Trash } from 'iconsax-react';
import { useFormik } from 'formik';
import axiosInstance from 'utils/axios';
import * as Yup from 'yup';
import { PopupTransition } from 'components/@extended/Transitions';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

//css import
import 'assets/css/commonStyle.css';
import 'assets/css/DataTable.css';
import MainCard from 'components/MainCard';
import { APP_PATH_BASE_URL } from 'config';
import Swal from 'sweetalert2';

const CmsList = () => {
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorContent, setEditorContent] = useState('');

  // Fetch CMS data from API
  const fetchCmsData = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/cms`);
      const data = response.data.data.map((page, index) => ({
        ...page,
        sno: index + 1
      }));
      setPages(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching CMS data:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCmsData();
  }, [fetchCmsData]);

  const handleOpen = () => {
    setCurrentPage(null);
    setEditorContent('');
    setOpen(true);
  };

  const handleEdit = (page) => {
    setCurrentPage(page);
    setEditorContent(page.description || '');
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      // Confirmation dialog
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      // If user cancels, exit the function
      if (!result.isConfirmed) return;

      // Perform the API call
      await axiosInstance.patch(`${APP_PATH_BASE_URL}api/cms/${id}/archive`);

      // Update local state
      setPages(pages.filter((page) => page.id !== id));

      // Show success message
      Swal.fire({
        title: 'Deleted!',
        text: 'Your page has been deleted.',
        icon: 'success',
        showConfirmButton: true
      });
    } catch (error) {
      console.error('Error deleting CMS page:', error);

      // Show error message
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete the page. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    formik.resetForm();
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    link: Yup.string().required('Link is required')
  });

  const formik = useFormik({
    initialValues: {
      title: currentPage?.title || '',
      link: currentPage?.link || '',
      description: currentPage?.description || ''
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          description: editorContent
        };

        if (currentPage) {
          // Update existing page
          const response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/cms/${currentPage.id}/`, payload);
          if (response.data.success === true) {
            Swal.fire({
              title: 'Success!',
              text: response.data.message,
              icon: 'success',
              confirmButtonText: 'OK'
            });
            setPages(pages.map((page) => (page.id === currentPage.id ? response.data.data : page)));
          }
        } else {
          // Add new page
          const response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/cms`, payload);
          if (response.data.success === true) {
            Swal.fire({
              title: 'Success!',
              text: response.data.message,
              icon: 'success',
              confirmButtonText: 'OK'
            });
            setPages([...pages, response.data.data]);
          }
        }
        handleClose();
      } catch (error) {
        console.error('Error saving CMS page:', error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  // ReactQuill modules configuration
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ color: [] }, { background: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ align: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['link', 'image', 'video'],
      ['code-block'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  };

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'color',
    'background',
    'script',
    'align',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'video',
    'code-block'
  ];

  const columns = [
    {
      name: 'S.No',
      selector: (row) => row.sno,
      sortable: true,
      width: '80px'
    },
    {
      name: 'Title',
      selector: (row) => row.title,
      sortable: true
    },
    {
      name: 'Link',
      selector: (row) => (
        <a href={`${row.link}`} target="_blank" rel="noopener noreferrer">
          {row.link}
        </a>
      ),
      sortable: true
    },
    // {
    //   name: 'Status',
    //   selector: (row) => {
    //     switch (row.status) {
    //       case 'active':
    //         return <Chip color="success" label="Active" size="small" variant="light" />;
    //       case 'inactive':
    //         return <Chip color="error" label="In Active" size="small" variant="light" />;
    //       default:
    //         return <Chip label="Unknown" size="small" variant="light" />;
    //     }
    //   },
    //   sortable: true,
    //   width: '100px'
    // },
    {
      name: 'Actions',
      cell: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit">
            <IconButton variant="contained" color="info" onClick={() => handleEdit(row)}>
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton variant="contained" color="error" onClick={() => handleDelete(row.id)}>
              <Trash />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <MainCard>
      <Grid item container justifyContent="flex-end" mb={3}>
        <Grid item>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex' }}>
              <Button color="success" variant="contained" startIcon={<BoxAdd />} onClick={handleOpen}>
                Add New Page
              </Button>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      <DataTable
        columns={columns}
        data={pages}
        pagination
        progressPending={loading}
        paginationPerPage={10}
        paginationRowsPerPageOptions={[5, 10, 20, 30]}
        highlightOnHover
        responsive
      />

      {/* Add/Edit CMS Page Dialog */}
      <Dialog
        maxWidth="md"
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
          {currentPage ? 'Edit Page' : 'Add New Page'}
          <IconButton color="dark" onClick={handleClose} edge="end" size="big" aria-label="close">
            <CloseSquare />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <FormLabel>Title *</FormLabel>
                  <TextField
                    fullWidth
                    id="title"
                    name="title"
                    placeholder="e.g., About Us, Privacy Policy"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.title && Boolean(formik.errors.title)}
                    helperText={formik.touched.title && formik.errors.title}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <FormLabel>Link *</FormLabel>
                  <TextField
                    fullWidth
                    id="link"
                    name="link"
                    placeholder="e.g., https://example.com"
                    value={formik.values.link}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.link && Boolean(formik.errors.link)}
                    helperText={formik.touched.link && formik.errors.link}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <FormLabel>Description *</FormLabel>
                  <Box sx={{ height: 300, mb: 3 }}>
                    <ReactQuill
                      theme="snow"
                      value={editorContent}
                      onChange={setEditorContent}
                      modules={quillModules}
                      formats={formats}
                      style={{ height: '250px' }}
                    />
                  </Box>
                </Stack>
              </Grid>
            </Grid>
            <DialogActions sx={{ mt: 3 }}>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
                {currentPage ? 'Update Page' : 'Add Page'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </MainCard>
  );
};

export default CmsList;
