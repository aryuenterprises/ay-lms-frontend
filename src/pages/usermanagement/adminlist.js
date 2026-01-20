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
  MenuItem,
  FormLabel,
  InputAdornment,
  Chip,
  // FormHelperText,
  CircularProgress,
  Tooltip,
  Typography,
  // Autocomplete,
  FormControl,
  Select,
  Autocomplete,
  FormHelperText
} from '@mui/material';
import { UserAdd, UserEdit, Eye, EyeSlash, CloseSquare, SearchNormal1 } from 'iconsax-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { PopupTransition } from 'components/@extended/Transitions';
import { APP_PATH_BASE_URL } from 'config';
import Swal from 'sweetalert2';
import { usePermission } from '../../hooks/usePermission';

//css import
import 'assets/css/commonStyle.css';
import 'assets/css/DataTable.css';
import MainCard from 'components/MainCard';
import { Capitalise } from 'utils/capitalise';
import axiosInstance from 'utils/axios';
import { Notes } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { formatDateTime } from 'utils/dateUtils';

const AdminTable = () => {
  const navigate = useNavigate();
  const { checkPermission } = usePermission();

  const canCreate = checkPermission('Admins', 'create');
  const canUpdate = checkPermission('Admins', 'update');
  const canDelete = checkPermission('Admins', 'delete');

  const [loading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState('');
  const [rowActions, setRowActions] = useState({});
  const [notespopup, setNotesPopup] = useState(false);
  const [notes, setNotes] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/admins`);
      const motifyData = response.data.trainer_data.map((item, index) => {
        return {
          ...item,
          sno: index + 1
        };
      });
      setData(motifyData);
      setRoles(response.data.roles);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpen = () => {
    setCurrentAdmin(null);
    setOpen(true);
  };

  const handleAction = (e, row) => {
    const selectedValue = e.target.value;

    setRowActions((prev) => ({
      ...prev,
      [row.employee_id]: selectedValue
    }));

    switch (selectedValue) {
      case 'Reset Password':
        handleResetPassword(row);
        break;
      case 'Delete':
        handleDelete(row.employee_id);
        break;
      case 'action':
        // Do nothing or default behavior
        break;
      default:
        break;
    }
  };

  const handleClose = () => {
    formik.resetForm();
    setOpen(false);
    setResetDialogOpen(false);
    setSelectedUser(null);
    setPassword('');
    setNotesPopup(false);
    setNotes('');
    setRowActions({});
  };

  const handleView = useCallback(
    (data) => {
      if (data) {
        navigate(`/admins/${data.employee_id}`, {
          state: {
            name: data.full_name,
            student_id: data.employee_id,
            user_type: data.user_type
          }
        });
      }
    },
    [navigate]
  );

  const handleNotes = async (data) => {
    setNotesPopup(true);
    setNotes(data.notes);
  };

  // Validation schema
  const validationSchema = Yup.object().shape({
    full_name: Yup.string()
      .required('Name is required')
      .min(3, 'Name must be at least 3 characters')
      .matches(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces')
      .test('no-only-spaces', 'Name cannot be only spaces', (value) => {
        return value && value.trim().length > 0;
      }),

    employee_id: Yup.string()
      .required('Employee id is required')
      .test('no-only-spaces', 'Employee ID cannot be only spaces', (value) => {
        return value && value.trim().length > 0;
      }),

    contact_no: Yup.string()
      .required('Mobile is required')
      .matches(/^[0-9]+$/, 'Mobile must contain only numbers')
      .min(10, 'Mobile must be at least 10 digits')
      .max(15, 'Mobile must not exceed 15 digits'),

    password: currentAdmin
      ? Yup.string()
      : Yup.string()
          .required('Password is required')
          .min(8, 'Password must be at least 8 characters')
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
          ),

    email: Yup.string().required('Email is required').email('Email is invalid'),

    username: Yup.string()
      .required('User name is required')
      .min(3, 'User name must be at least 3 characters')
      .test('no-only-spaces', 'Username cannot be only spaces', (value) => {
        return value && value.trim().length > 0;
      }),

    // user_type: Yup.string().nullable().required('User type is required'),

    gender: Yup.string().required('Gender is required'),

    specialization: Yup.string()
      .required('Specialization is required')
      .test('no-only-spaces', 'Specialization cannot be only spaces', (value) => {
        return value && value.trim().length > 0;
      }),

    working_hours: Yup.string()
      .required('Working Hours is required')
      .test('no-only-spaces', 'Working hours cannot be only spaces', (value) => {
        return value && value.trim().length > 0;
      }),

    status: Yup.string().required('Status is required')

    // notes: Yup.string().when('status', {
    //   is: (val) => val === 'inactive',
    //   then: () =>
    //     Yup.string()
    //       .required('Notes is required')
    //       .test('no-only-spaces', 'Notes cannot be only spaces', (value) => {
    //         return value && value.trim().length > 0;
    //       }),
    //   otherwise: () => Yup.string()
    // })
  });

  const formik = useFormik({
    initialValues: {
      employee_id: currentAdmin?.employee_id || '',
      full_name: currentAdmin?.full_name || '',
      username: currentAdmin?.username || '',
      user_type: 'admin',
      password: '',
      email: currentAdmin?.email || '',
      contact_no: currentAdmin?.contact_no || '',
      gender: currentAdmin?.gender || '',
      specialization: currentAdmin?.specialization || '',
      working_hours: currentAdmin?.working_hours || '',
      status: currentAdmin?.status || 'active',
      notes: currentAdmin?.notes || '',
      role_id: currentAdmin?.role || ''
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const tutorData = {
          employee_id: values.employee_id,
          full_name: values.full_name,
          username: values.username,
          password: values.password,
          user_type: values.user_type,
          email: values.email,
          contact_no: values.contact_no,
          gender: values.gender,
          specialization: values.specialization,
          working_hours: values.working_hours,
          status: values.status,
          ...(values.status === 'inactive' && { notes: values.notes }),
          ...(values.user_type === 'admin' && { role: values.role_id })
        };

        let response;
        if (currentAdmin) {
          // Update existing trainer
          response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/trainers/${currentAdmin.employee_id}`, tutorData);
        } else {
          // Add new trainer
          response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/trainers`, tutorData);
        }

        if (response.data.success === true) {
          const role = values.user_type === 'tutor' ? 'Tutor' : 'Admin';
          const action = currentAdmin ? 'updated' : 'added';

          Swal.fire({
            title: 'Success!',
            text: `${role} ${action} successfully!`,
            icon: 'success',
            confirmButtonText: 'OK'
          });

          resetForm();
          handleClose();
          fetchData();
        } else {
          Swal.fire({
            title: 'Error!',
            text: response?.data?.message || 'Error submitting tutor data. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      } catch (error) {
        console.error('Error submitting tutor data:', error);
        Swal.fire({
          title: 'Error!',
          text: error.message || 'Error submitting tutor data. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        setSubmitting(false);
      }
    }
  });
  // console.log('formik values', formik.values);
  const columns = [
    {
      name: 'S.No',
      selector: (row) => row.sno,
      sortable: true,
      width: '80px'
    },
    {
      name: 'Employee Id',
      selector: (row) => row.employee_id,
      sortable: true,
      width: '150px'
    },
    {
      name: 'Name',
      selector: (row) => Capitalise(row.full_name),
      sortable: true,
      width: '150px'
    },
    // {
    //   name: 'User Type',
    //   selector: (row) => Capitalise(row.user_type),
    //   sortable: true
    // },
    {
      name: 'Mobile',
      selector: (row) => row.contact_no,
      sortable: true,
      width: '150px'
    },
    {
      name: 'Email',
      selector: (row) => row.email,
      sortable: true,
      width: '300px'
    },
    {
      name: 'Role',
      selector: (row) => row.role_name,
      sortable: true,
      width: '150px'
    },
    {
      name: 'Status',
      cell: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={row.status === 'active' ? 'Active' : 'In active'}
            sx={{
              backgroundColor: row.status === 'active' ? 'success.lighter' : 'error.lighter',
              color: row.status === 'active' ? 'success.main' : 'error.main'
            }}
          />
        </Box>
      ),
      sortable: true,
      width: '120px'
    },
    {
      name: 'Actions',
      cell: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View">
            <IconButton variant="contained" color="secondary" onClick={() => handleView(row)}>
              <Eye />
            </IconButton>
          </Tooltip>
          {canUpdate && (
            <Tooltip title="Edit">
              <IconButton color="info" variant="contained" onClick={() => handleEdit(row)}>
                <UserEdit />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Notes">
            <IconButton color="success" variant="contained" onClick={() => handleNotes(row)}>
              <Notes />
            </IconButton>
          </Tooltip>
          {canUpdate || canDelete ? (
            <Select
              value={rowActions[row.employee_id] || 'action'}
              onChange={(e) => handleAction(e, row)}
              sx={{ width: '100px', height: '30px', mt: 0.5 }}
            >
              <MenuItem value="action">Action</MenuItem>
              {canUpdate && <MenuItem value="Reset Password">Reset Password</MenuItem>}
              {canDelete && <MenuItem value="Delete">Delete</MenuItem>}
            </Select>
          ) : null}
        </Box>
      ),
      width: '280px'
    }
  ];

  const handleEdit = (trainer) => {
    setCurrentAdmin(trainer);
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
        const response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/trainers/${id}/archive`, {
          user_type: 'admin'
        });
        if (response.data.success === true) {
          Swal.fire({
            title: 'Success!',
            text: 'Admin deleted successfully!',
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
          text: error.response?.data?.message || 'Failed to delete tutor.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setResetDialogOpen(true);
  };

  const handleResetSubmit = async () => {
    // Example API call:
    const res = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/trainer/${selectedUser.employee_id}/reset_password`, {
      new_password: password
    });
    if (res.data.success === true) {
      await Swal.fire({
        title: 'Success!',
        text: 'Password reset successfully',
        icon: 'success',
        showConfirmButton: true,
        confirmButtonText: 'OK'
      });
    } else {
      await Swal.fire({
        title: 'Error!',
        text: res?.data?.message || 'Error resetting password',
        icon: 'error',
        showConfirmButton: true,
        confirmButtonText: 'OK'
      });
    }
    setResetDialogOpen(false);
    handleClose();
  };

  const subHeaderComponentMemo = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText('');
      }
    };

    const handleStatusClear = () => {
      setStatusFilter('all');
    };

    // const handleTypeClear = () => {
    //   setTypeFilter('all');
    // };

    return (
      <Grid container justifyContent="space-between" alignItems="center" my={3}>
        <Grid item xs={12} md={8} display="flex" flexDirection={{ xs: 'column', sm: 'row' }}>
          <Stack direction="row" spacing={2}>
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
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                endAdornment={
                  statusFilter !== 'all' && (
                    <InputAdornment position="end" sx={{ mr: 3 }}>
                      <IconButton onClick={handleStatusClear} edge="end" size="small">
                        <CloseSquare size={16} />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              >
                <MenuItem value="all">Select Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">In active</MenuItem>
              </Select>
            </FormControl>
            {/* <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                endAdornment={
                  typeFilter !== 'all' && (
                    <InputAdornment position="end" sx={{ mr: 3 }}>
                      <IconButton onClick={handleTypeClear} edge="end" size="small">
                        <CloseSquare size={16} />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              >
                <MenuItem value="all">Select UserType</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="tutor">Tutor</MenuItem>
              </Select>
            </FormControl> */}
          </Stack>
        </Grid>
        <Grid item xs={12} md={4} textAlign="right">
          {canCreate && (
            <Button color="success" variant="contained" startIcon={<UserAdd />} onClick={handleOpen}>
              Add
            </Button>
          )}
        </Grid>
      </Grid>
    );
  }, [filterText, resetPaginationToggle, statusFilter, canCreate]);

  const filteredItems = useMemo(() => {
    return data?.filter((item) => {
      // Text search filter
      const matchesText =
        filterText === '' ||
        (item.full_name && item.full_name.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.employee_id && item.employee_id.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.email && item.email.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.contact_no && item.contact_no.includes(filterText)) ||
        (item.user_type && item.user_type.includes(filterText));

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && item.status === 'active') ||
        (statusFilter === 'inactive' && item.status === 'inactive');

      // Type filter
      //   const matchesType =
      //     typeFilter === 'all' ||
      //     (typeFilter === 'admin' && item.user_type === 'admin') ||
      //     (typeFilter === 'tutor' && item.user_type === 'tutor');

      return matchesText && matchesStatus;
    });
  }, [data, filterText, statusFilter]);

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
    <MainCard sx={{ borderRadius: 2 }}>
      {subHeaderComponentMemo}

      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 300 }}>
          <CircularProgress />
        </Stack>
      ) : (
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
      )}
      {/* Add/Edit Tutor Dialog */}
      <Dialog
        maxWidth="sm"
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
          {currentAdmin ? 'Edit Trainer' : 'Add New Trainer'}
          <IconButton color="dark" onClick={handleClose} edge="end" size="big" aria-label="close" title="close">
            <CloseSquare height={80} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <form autoComplete="off" noValidate onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              {/* Employee ID */}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Employee Id*</FormLabel>
                  <TextField
                    fullWidth
                    id="employee_id"
                    name="employee_id"
                    value={formik.values.employee_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.employee_id && Boolean(formik.errors.employee_id)}
                    helperText={formik.touched.employee_id && formik.errors.employee_id}
                  />
                </Stack>
              </Grid>

              {/* Full Name */}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Name*</FormLabel>
                  <TextField
                    fullWidth
                    id="full_name"
                    name="full_name"
                    value={formik.values.full_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.full_name && Boolean(formik.errors.full_name)}
                    helperText={formik.touched.full_name && formik.errors.full_name}
                  />
                </Stack>
              </Grid>

              {/* Username */}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>User Name*</FormLabel>
                  <TextField
                    fullWidth
                    id="username"
                    name="username"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.username && Boolean(formik.errors.username)}
                    helperText={formik.touched.username && formik.errors.username}
                    autoComplete="new-username"
                  />
                </Stack>
              </Grid>

              {/* Password (only for new trainers) */}
              {!currentAdmin && (
                <Grid item xs={12} md={6}>
                  <Stack sx={{ mt: 2, gap: 1 }}>
                    <FormLabel>Password*</FormLabel>
                    <TextField
                      fullWidth
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.password && Boolean(formik.errors.password)}
                      helperText={formik.touched.password && formik.errors.password}
                      autoComplete="new-password"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <Eye /> : <EyeSlash />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Stack>
                </Grid>
              )}

              {/* User Type */}
              {/* <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>User Type*</FormLabel>
                  <TextField
                    select
                    fullWidth
                    id="user_type"
                    name="user_type"
                    value={formik.values.user_type} // Ensure empty string if undefined/null
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.user_type && Boolean(formik.errors.user_type)}
                    helperText={formik.touched.user_type && formik.errors.user_type}
                    SelectProps={{
                      displayEmpty: true
                    }}
                  >
                    <MenuItem value="">Select type</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="tutor">Tutor</MenuItem>
                  </TextField>
                </Stack>
              </Grid> */}

              {/* role */}
              {formik.values.user_type === 'admin' && (
                <Grid item xs={12} md={6}>
                  <Stack sx={{ mt: 2, gap: 1 }}>
                    <FormLabel>Role*</FormLabel>
                    <Autocomplete
                      id="role_id"
                      options={roles || []}
                      getOptionLabel={(option) => option?.name}
                      value={roles?.find((role) => role.role_id === formik.values?.role_id) || null}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('role_id', newValue?.role_id || '');
                      }}
                      onBlur={formik.handleBlur}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Search role..."
                          error={formik.touched.role_id && Boolean(formik.errors.role_id)}
                        />
                      )}
                      filterOptions={(options = [], state) => {
                        return options.filter((option) => option.name.toLowerCase().includes(state.inputValue.toLowerCase()));
                      }}
                      isOptionEqualToValue={(option, value) => option.role_id === value.role_id}
                      renderOption={(props, option) => (
                        <li {...props} key={option.role_id}>
                          {option.name}
                        </li>
                      )}
                    />
                    {formik.touched.role_id && formik.errors.role_id && <FormHelperText error>{formik.errors.role_id}</FormHelperText>}
                  </Stack>
                </Grid>
              )}

              {/* Email */}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Email Address*</FormLabel>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                </Stack>
              </Grid>

              {/* Phone Number */}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Phone Number*</FormLabel>
                  <TextField
                    fullWidth
                    id="contact_no"
                    name="contact_no"
                    value={formik.values.contact_no}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.contact_no && Boolean(formik.errors.contact_no)}
                    helperText={formik.touched.contact_no && formik.errors.contact_no}
                  />
                </Stack>
              </Grid>

              {/* Gender */}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Gender*</FormLabel>
                  <TextField
                    select
                    fullWidth
                    id="gender"
                    name="gender"
                    value={formik.values.gender}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.gender && Boolean(formik.errors.gender)}
                    helperText={formik.touched.gender && formik.errors.gender}
                    SelectProps={{
                      displayEmpty: true
                    }}
                  >
                    <MenuItem value="">Select Gender</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </TextField>
                </Stack>
              </Grid>

              {/* Specialization */}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Specialization*</FormLabel>
                  <TextField
                    fullWidth
                    id="specialization"
                    name="specialization"
                    value={formik.values.specialization}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.specialization && Boolean(formik.errors.specialization)}
                    helperText={formik.touched.specialization && formik.errors.specialization}
                  />
                </Stack>
              </Grid>

              {/* Working Hours */}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Working Hours*</FormLabel>
                  <TextField
                    fullWidth
                    id="working_hours"
                    name="working_hours"
                    value={formik.values.working_hours}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.working_hours && Boolean(formik.errors.working_hours)}
                    helperText={formik.touched.working_hours && formik.errors.working_hours}
                  />
                </Stack>
              </Grid>

              {/* Courses Assigned */}
              {/* <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Courses Assigned</FormLabel>
                  <Autocomplete
                    multiple
                    id="courses_assigned"
                    options={courses || []}
                    getOptionLabel={(option) => option.course_name}
                    value={courses?.filter((course) => formik.values.courses_assigned.includes(course.course_id))}
                    onChange={(event, newValue) => {
                      formik.setFieldValue(
                        'courses_assigned',
                        newValue.map((course) => course.course_id)
                      );
                    }}
                    onBlur={formik.handleBlur}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Search courses..."
                        error={formik.touched.courses_assigned && Boolean(formik.errors.courses_assigned)}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((course, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={course.course_id}
                          label={course.course_name}
                          variant="outlined"
                          color="secondary"
                          size="small"
                        />
                      ))
                    }
                    filterOptions={(options = [], state) => {
                      return options.filter((option) => option.course_name.toLowerCase().includes(state.inputValue.toLowerCase()));
                    }}
                    isOptionEqualToValue={(option, value) => option.course_id === value.course_id}
                    renderOption={(props, option) => (
                      <li {...props} key={option.course_id}>
                        {option.course_name}
                      </li>
                    )}
                  />
                  {formik.touched.courses_assigned && formik.errors.courses_assigned && (
                    <FormHelperText error>{formik.errors.courses_assigned}</FormHelperText>
                  )}
                </Stack>
              </Grid> */}

              {/* Students Assigned */}
              {/* <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Students Assigned</FormLabel>
                  <Autocomplete
                    multiple
                    id="students_assigned"
                    options={students || []}
                    getOptionLabel={(option) => option.full_name}
                    value={students?.filter((student) => formik.values.students_assigned.includes(student.registration_id))}
                    onChange={(event, newValue) => {
                      formik.setFieldValue(
                        'students_assigned',
                        newValue.map((student) => student.registration_id)
                      );
                    }}
                    onBlur={formik.handleBlur}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Search students..."
                        error={formik.touched.students_assigned && Boolean(formik.errors.students_assigned)}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((student, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={student.registration_id}
                          label={student.full_name}
                          variant="outlined"
                          color="secondary"
                          size="small"
                        />
                      ))
                    }
                    filterOptions={(options = [], state) => {
                      return options.filter(
                        (option) =>
                          option.full_name.toLowerCase().includes(state.inputValue.toLowerCase()) ||
                          option.registration_id.toLowerCase().includes(state.inputValue.toLowerCase())
                      );
                    }}
                    isOptionEqualToValue={(option, value) => option.registration_id === value.registration_id}
                    renderOption={(props, option) => (
                      <li {...props} key={option.registration_id}>
                        {option.full_name}
                      </li>
                    )}
                    noOptionsText="No students found"
                  />
                  {formik.touched.students_assigned && formik.errors.students_assigned && (
                    <FormHelperText error>{formik.errors.students_assigned}</FormHelperText>
                  )}
                </Stack>
              </Grid> */}

              {/* Status */}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Status*</FormLabel>
                  <TextField
                    select
                    fullWidth
                    id="status"
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.status && Boolean(formik.errors.status)}
                    helperText={formik.touched.status && formik.errors.status}
                    SelectProps={{
                      displayEmpty: true
                    }}
                  >
                    <MenuItem value="">Select status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </TextField>
                </Stack>
              </Grid>

              {/*Notes*/}
              {formik.values.status === 'inactive' && (
                <Grid item xs={12}>
                  <Stack sx={{ mt: 2, gap: 1 }}>
                    <FormLabel>Notes*</FormLabel>
                    <TextField
                      fullWidth
                      id="notes"
                      placeholder="Notes"
                      name="notes"
                      multiline
                      rows={4}
                      value={formik.values.notes}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.notes && Boolean(formik.errors.notes)}
                      helperText={formik.touched.notes && formik.errors.notes}
                    />
                  </Stack>
                </Grid>
              )}

              <Grid item xs={12}>
                <DialogActions>
                  <Button onClick={handleClose}>Cancel</Button>
                  <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
                    {currentAdmin ? 'Update' : 'Add'}
                  </Button>
                </DialogActions>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
      </Dialog>
      {/* Reset Password Tutor Dialog */}
      <Dialog
        maxWidth="xs"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        open={resetDialogOpen}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') handleClose();
        }}
        BackdropProps={{
          onClick: (event) => event.stopPropagation()
        }}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle className="dialogTitle" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          Reset Password
          <IconButton color="dark" onClick={handleClose} edge="end" size="big" aria-label="close" title="close">
            <CloseSquare height={30} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <FormLabel>Reset Password</FormLabel>
                <TextField
                  autoFocus
                  margin="dense"
                  placeholder="New Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <Eye /> : <EyeSlash />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{ mt: 2 }}
                />
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleResetSubmit} variant="contained" color="primary">
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>
      {/* Notes Dialog */}
      <Dialog
        maxWidth="xs"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        open={notespopup}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') handleClose();
        }}
        BackdropProps={{
          onClick: (event) => event.stopPropagation()
        }}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle className="dialogTitle" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          Notes
          <IconButton color="dark" onClick={handleClose} edge="end" size="big" aria-label="close" title="close">
            <CloseSquare height={30} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {notes && notes.length > 0 ? (
                  notes.map((note) => (
                    <Box
                      key={note.id}
                      sx={{
                        mt: 2,
                        padding: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        backgroundColor: 'background.paper'
                      }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        Status: <Chip label={note.status || '-'} color={note.status === 'Inactive' ? 'error' : 'success'} size="small" />
                      </Typography>
                      <Typography variant="subtitle2" gutterBottom>
                        Reason: {note.reason || 'No reason provided'}
                      </Typography>
                      <Typography variant="subtitle2" gutterBottom>
                        Created By: {note.created_by_name} -{' '}
                        <Typography variant="caption"> {formatDateTime(note.created_date)} </Typography>
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>No notes available</Typography>
                )}
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default AdminTable;
