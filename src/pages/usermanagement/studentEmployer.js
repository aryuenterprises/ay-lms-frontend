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
  CircularProgress,
  Tooltip,
  // Select,
  // MenuItem,
  Autocomplete,
  Chip,
  MenuItem,
  FormControl,
  Select,
  Typography
} from '@mui/material';
import { UserAdd, UserEdit, Eye, CloseSquare, SearchNormal1, EyeSlash } from 'iconsax-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { PopupTransition } from 'components/@extended/Transitions';
import Swal from 'sweetalert2';
import MainCard from 'components/MainCard';

//css import
import 'assets/css/commonStyle.css';
import 'assets/css/DataTable.css';

// Imports
import { APP_PATH_BASE_URL } from 'config';
import { Capitalise } from 'utils/capitalise';
import axiosInstance from 'utils/axios';
import { Notes } from '@mui/icons-material';
import { usePermission } from 'hooks/usePermission';
import { formatDateTime } from 'utils/dateUtils';

const StudentEmployerTable = () => {
  const { checkPermission } = usePermission();

  const canCreate = checkPermission('Organization Employer', 'create');
  const canUpdate = checkPermission('Organization Employer', 'update');
  const canDelete = checkPermission('Organization Employer', 'delete');

  const [companies, setCompanies] = useState([]);
  const [loading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [error, setError] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showNotesField, setShowNotesField] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [rowActions, setRowActions] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [notespopup, setNotesPopup] = useState(false);
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/subadmin`);
      const result = response.data;
      const company = result.companies;
      const data = result.data?.map((item, index) => ({
        sno: index + 1,
        ...item
      }));
      setData(data || []);
      setCompanies(company || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching student data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpen = () => {
    setCurrentStudent(null);
    setOpen(true);
    setShowNotesField(false);
  };

  const handleAction = (e, row) => {
    const selectedValue = e.target.value;

    setRowActions((prev) => ({
      ...prev,
      [row.employer_id]: selectedValue
    }));

    switch (selectedValue) {
      case 'Reset Password':
        handleResetPassword(row);
        break;
      case 'Delete':
        handleDelete(row.employer_id);
        break;
      case 'action':
        // Do nothing or default behavior
        break;
      default:
        break;
    }
  };

  const handleClose = () => {
    setOpen(false);
    formik.resetForm();
    setResetDialogOpen(false);
    setSelectedUser(null);
    setPassword('');
    setNotesPopup(false);
    setNotes('');
    setRowActions({});
  };

  const handleNotes = async (data) => {
    setNotesPopup(true);
    setNotes(data.notes);
  };

  const handleEdit = useCallback((student) => {
    setCurrentStudent(student);
    setOpen(true);
    setShowNotesField(false);
  }, []);

  const handleDelete = useCallback(
    async (id) => {
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
          setIsLoading(true);
          const response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/subadmin/${id}/archive`, {
            user_type: 'admin'
          });

          if (response.data.success) {
            await Swal.fire({
              title: 'Success!',
              text: 'Student employer deleted successfully!',
              icon: 'success',
              confirmButtonText: 'OK'
            });
            fetchData();
          } else {
            throw new Error(response.data.message || 'Error deleting data');
          }
        } catch (error) {
          console.error('Delete error:', error);
          Swal.fire({
            title: 'Error!',
            text: error.response?.data?.message || 'Failed to delete student employer.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        } finally {
          setIsLoading(false);
        }
      }
    },
    [fetchData]
  );

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setResetDialogOpen(true);
  };

  const handleResetSubmit = async () => {
    // Example API call:
    const res = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/subadmin/${selectedUser.employer_id}/reset_password`, {
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

  const columns = [
    {
      name: 'S.No',
      selector: (row) => row.sno,
      sortable: true,
      width: '100px'
    },
    {
      name: 'Organization Name',
      selector: (row) => Capitalise(row.company_name),
      sortable: true,
      width: '200px'
    },
    {
      name: 'Full Name',
      selector: (row) => Capitalise(row.full_name),
      sortable: true,
      width: '200px'
    },
    {
      name: 'Mobile',
      selector: (row) => row.phone_no,
      sortable: true,
      width: '150px'
    },
    {
      name: 'Email',
      selector: (row) => row.email,
      sortable: true,
      width: '200px'
    },
    {
      name: 'Designation',
      selector: (row) => row.designation,
      sortable: true,
      width: '200px'
    },
    {
      name: 'Status',
      selector: (row) => row.status,
      cell: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={row.status === true ? 'Active' : 'In active'}
            sx={{
              backgroundColor: row.status === true ? 'success.lighter' : 'error.lighter',
              color: row.status === true ? 'success.main' : 'error.main'
            }}
          />
        </Box>
      ),
      sortable: true,
      width: '150px'
    },
    {
      name: 'Actions',
      cell: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
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
          {canDelete || canUpdate ? (
            <Select
              value={rowActions[row.employer_id] || 'action'}
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
      width: '250px'
    }
  ];

  const validationSchema = Yup.object().shape({
    company: Yup.string()
      .required('Organization is required')
      .test('no-only-spaces', 'Organization cannot be only spaces', (value) => {
        return value && value.trim().length > 0;
      }),

    full_name: Yup.string()
      .required('Full name is required')
      .matches(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces')
      .test('no-only-spaces', 'Full name cannot be only spaces', (value) => {
        return value && value.trim().length > 0;
      }),

    email: Yup.string().required('Email is required').email('Email is invalid'),

    phone_no: Yup.string()
      .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
      .required('Phone number is required'),

    designation: Yup.string()
      .required('Designation is required')
      .test('no-only-spaces', 'Designation cannot be only spaces', (value) => {
        return value && value.trim().length > 0;
      }),

    username: Yup.string()
      .required('Username is required')
      .min(3, 'Username must be at least 3 characters')
      .test('no-only-spaces', 'Username cannot be only spaces', (value) => {
        return value && value.trim().length > 0;
      }),

    password: currentStudent
      ? Yup.string()
      : Yup.string()
          .required('Password is required')
          .min(8, 'Password must be at least 8 characters')
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            'Password must contain at least one uppercase letter, one number, and one special character'
          ),

    notes: Yup.string().when(['status'], {
      is: (status) => {
        // Check if status has changed from initial value
        const initialStatus = currentStudent?.status ?? true;
        return status !== initialStatus;
      },
      then: () =>
        Yup.string()
          .required('Notes are required')
          .test('no-only-spaces', 'Notes cannot be only spaces', (value) => {
            return value && value.trim().length > 0;
          }),
      otherwise: () => Yup.string().notRequired()
    })
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      company: currentStudent?.company || '',
      full_name: currentStudent?.full_name || '',
      email: currentStudent?.email || '',
      phone_no: currentStudent?.phone_no || '',
      designation: currentStudent?.designation || '',
      username: currentStudent?.username || '',
      password: currentStudent?.password || '',
      status: currentStudent?.status ?? true,
      notes: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      // Prevent multiple submissions
      if (isSubmitting) return;

      setIsSubmitting(true);
      const formData = new FormData();

      // Append all fields
      formData.append('company', values.company);
      formData.append('full_name', values.full_name);
      formData.append('email', values.email);
      formData.append('phone_no', values.phone_no);
      formData.append('designation', values.designation);
      formData.append('username', values.username);
      formData.append('status', values.status);
      if (!currentStudent) {
        formData.append('password', values.password);
      }

      formData.append('notes', values.notes);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      try {
        let response;

        if (currentStudent) {
          response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/subadmin/${currentStudent.employer_id}`, formData, config);
        } else {
          response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/subadmin`, formData, config);
        }

        if (response.data.success === true) {
          Swal.fire({
            title: 'Success!',
            text: currentStudent ? 'Student employer updated successfully!' : 'Student employer added successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          resetForm();
          setShowNotesField(false);
          handleClose();
          fetchData();
        } else {
          Swal.fire({
            title: 'Error!',
            text: response?.data?.message || 'Error submitting student employer data. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Error submitting student employer data. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        setSubmitting(false);
        setIsSubmitting(false);
      }
    }
  });

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

    return (
      <Grid container justifyContent="space-between" alignItems="center" my={3} spacing={2}>
        <Grid item xs={12}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} width="100%">
            {/* Filters Container - Wraps to next row */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 2,
                width: { xs: '100%', sm: 'auto' },
                '& > *': {
                  minWidth: { xs: 'calc(50% - 8px)', sm: 200 },
                  flexGrow: 1
                }
              }}
            >
              <TextField
                placeholder="Search by name, ID, email, or phone..."
                variant="outlined"
                size="small"
                sx={{
                  minWidth: { xs: '100%', sm: 250 },
                  flexGrow: 1
                }}
                autoComplete="nope"
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

              <Autocomplete
                id="company_id"
                options={companies || []}
                getOptionLabel={(option) => option.company_name}
                value={selectedCompany}
                onChange={(event, newValue) => {
                  setSelectedCompany(newValue);
                }}
                size="small"
                sx={{
                  minWidth: { xs: '100%', sm: 180, md: 200 },
                  flex: '1 1 auto'
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Filter by organization..."
                    InputProps={{
                      ...params.InputProps
                    }}
                  />
                )}
                filterOptions={(options = [], state) => {
                  return options.filter((option) => option.company_name?.toLowerCase().includes(state.inputValue.toLowerCase()));
                }}
                isOptionEqualToValue={(option, value) => option.company_id === value.company_id}
                renderOption={(props, option) => (
                  <li {...props} key={option.company_id}>
                    {option.company_name}
                  </li>
                )}
              />

              <FormControl
                size="small"
                sx={{
                  minWidth: { xs: '100%', sm: 180 },
                  flex: { xs: '1 1 100%', sm: '0 1 auto' },
                  maxWidth: { sm: 250 }
                }}
              >
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
            </Box>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack spacing={2} direction="row" justifyContent="flex-end">
            {canCreate && (
              <Button color="success" variant="contained" startIcon={<UserAdd />} onClick={handleOpen}>
                Add
              </Button>
            )}
          </Stack>
        </Grid>
      </Grid>
    );
  }, [filterText, resetPaginationToggle, selectedCompany, companies, statusFilter, canCreate]);

  // Add this useEffect to track status changes
  useEffect(() => {
    if (currentStudent) {
      // For edit mode: show notes field only when status changes from initial value
      const initialStatus = currentStudent.status ?? true;
      if (formik.values.status !== initialStatus) {
        setShowNotesField(true);
      } else {
        setShowNotesField(false);
      }
    } else {
      // For add mode: always hide notes field initially
      setShowNotesField(false);
    }
  }, [formik.values.status, currentStudent]);

  const filteredItems = useMemo(() => {
    return data.filter((item) => {
      // Text search filter
      const matchesText =
        filterText === '' ||
        (item.company_name && item.company_name.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.full_name && item.full_name.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.email && item.email.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.phone_no && item.phone_no.includes(filterText));

      // Organization filter - handle null values safely
      const matchesCompany = selectedCompany === null || selectedCompany === '' || item.company === selectedCompany.company_id;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && item.status === true) ||
        (statusFilter === 'inactive' && item.status === false);
      return matchesText && matchesCompany && matchesStatus;
    });
  }, [data, filterText, selectedCompany, statusFilter]);

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
          responsive
        />
      )}

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
          {currentStudent ? 'Edit Organization Employer' : 'Add New Organization Employer'}
          <IconButton color="dark" onClick={handleClose} edge="end" size="big" aria-label="close" title="close">
            <CloseSquare height={30} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              {/* Organization Dropdown */}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Organization*</FormLabel>
                  <Autocomplete
                    id="company"
                    options={companies || []}
                    getOptionLabel={(option) => option.company_name}
                    value={companies?.find((company) => company.company_id === formik.values.company) || null}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('company', newValue ? newValue.company_id : '');
                    }}
                    onBlur={formik.handleBlur}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select organization..."
                        error={formik.touched.company && Boolean(formik.errors.company)}
                        helperText={formik.touched.company && formik.errors.company}
                      />
                    )}
                    filterOptions={(options = [], state) => {
                      return options.filter((option) => option.company_name?.toLowerCase().includes(state.inputValue.toLowerCase()));
                    }}
                    isOptionEqualToValue={(option, value) => option.company_id === value.company_id}
                    renderOption={(props, option) => (
                      <li {...props} key={option.company_id}>
                        {option.company_name}
                      </li>
                    )}
                  />
                </Stack>
              </Grid>

              {/* Full Name */}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Full Name*</FormLabel>
                  <TextField
                    fullWidth
                    id="full_name"
                    placeholder="Full Name"
                    name="full_name"
                    value={formik.values.full_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.full_name && Boolean(formik.errors.full_name)}
                    helperText={formik.touched.full_name && formik.errors.full_name}
                  />
                </Stack>
              </Grid>

              {/* Email */}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Email*</FormLabel>
                  <TextField
                    fullWidth
                    id="email"
                    placeholder="Email"
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

              {/* Phone */}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Phone*</FormLabel>
                  <TextField
                    fullWidth
                    id="phone_no"
                    placeholder="Phone"
                    name="phone_no"
                    type="number"
                    value={formik.values.phone_no}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.phone_no && Boolean(formik.errors.phone_no)}
                    helperText={formik.touched.phone_no && formik.errors.phone_no}
                  />
                </Stack>
              </Grid>

              {/* Designation */}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Designation*</FormLabel>
                  <TextField
                    fullWidth
                    id="designation"
                    placeholder="Designation"
                    name="designation"
                    value={formik.values.designation}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.designation && Boolean(formik.errors.designation)}
                    helperText={formik.touched.designation && formik.errors.designation}
                  />
                </Stack>
              </Grid>

              {/* Username */}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Username*</FormLabel>
                  <TextField
                    fullWidth
                    id="username"
                    placeholder="Username"
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

              {/* Password */}
              {!currentStudent && (
                <Grid item xs={12} md={6}>
                  <Stack sx={{ mt: 2, gap: 1 }}>
                    <FormLabel>Password*</FormLabel>
                    <TextField
                      fullWidth
                      id="password"
                      placeholder="Password"
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

              {/*Status*/}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Status*</FormLabel>
                  <TextField
                    select
                    fullWidth
                    id="status"
                    name="status"
                    value={formik.values.status} // This should be boolean
                    onChange={formik.handleChange} // Use formik's handleChange directly
                    onBlur={formik.handleBlur}
                    error={formik.touched.status && Boolean(formik.errors.status)}
                    helperText={formik.touched.status && formik.errors.status}
                  >
                    <MenuItem value={true}>Active</MenuItem>
                    <MenuItem value={false}>Inactive</MenuItem>
                  </TextField>
                </Stack>
              </Grid>
              {/* Notes - Show only when status is changed */}
              {showNotesField && (
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
            </Grid>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={formik.isSubmitting} // Disable when submitting
              >
                {formik.isSubmitting ? 'Processing...' : currentStudent ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
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
        maxWidth="sm"
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
        <DialogContent sx={{ borderBottom: 1, borderColor: 'divider', py: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack spacing={3} sx={{ mt: 1 }}>
                {notes && notes.length > 0 ? (
                  notes.map((note) => (
                    <Box
                      key={note.id}
                      sx={{
                        p: 3,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      <Grid container spacing={3} alignItems="flex-start">
                        {/* Created By with enhanced styling */}
                        <Grid item xs={12} sm={3}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">
                              CREATED BY
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  backgroundColor: note.status === false ? 'success.main' : 'error.main'
                                }}
                              />
                              <Typography variant="body1" fontWeight="medium" fontSize="1.1rem">
                                {note.created_by || '-'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Reason with enhanced text wrapping */}
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">
                              REASON
                            </Typography>
                            <Box
                              sx={{
                                p: 1.5,
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1,
                                backgroundColor: 'grey.50',
                                minHeight: '60px',
                                display: 'flex',
                                alignItems: 'flex-start'
                              }}
                            >
                              <Typography
                                variant="body1"
                                sx={{
                                  lineHeight: 1.5,
                                  wordWrap: 'break-word',
                                  overflowWrap: 'break-word',
                                  whiteSpace: 'normal',
                                  wordBreak: 'break-word',
                                  width: '100%'
                                }}
                              >
                                {note.reason || '-'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Date with improved formatting */}
                        <Grid item xs={12} sm={3}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">
                              DATE
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                backgroundColor: 'action.hover',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                display: 'inline-block',
                                width: 'fit-content'
                              }}
                            >
                              {formatDateTime(note.created_at, { includeTime: false }) || '-'}
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Status with badge styling */}
                        <Grid item xs={12} sm={2}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">
                              STATUS
                            </Typography>
                            <Box
                              sx={{
                                borderRadius: 2,
                                width: 'fit-content'
                              }}
                            >
                              <Chip
                                label={note.status === false ? 'Active' : 'Inactive'}
                                sx={{
                                  color: note.status === false ? 'success.dark' : 'error.dark',
                                  fontWeight: 600
                                }}
                              />
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  ))
                ) : (
                  <Box
                    sx={{
                      p: 6,
                      textAlign: 'center',
                      border: 2,
                      borderColor: 'divider',
                      borderStyle: 'dashed',
                      borderRadius: 3,
                      backgroundColor: 'action.hover',
                      my: 2
                    }}
                  >
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Notes Available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      There are no notes to display at the moment.
                    </Typography>
                  </Box>
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

export default StudentEmployerTable;
