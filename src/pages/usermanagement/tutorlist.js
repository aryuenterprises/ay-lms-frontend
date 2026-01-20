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
import { UserAdd, UserEdit, Eye, EyeSlash, CloseSquare, SearchNormal1, UserTag } from 'iconsax-react';
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

const TutorTable = () => {
  const navigate = useNavigate();
  const { checkPermission } = usePermission();

  const canCreate = checkPermission('Tutors', 'create');
  const canUpdate = checkPermission('Tutors', 'update');
  const canDelete = checkPermission('Tutors', 'delete');

  const [loading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [roles, setRoles] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [open, setOpen] = useState(false);
  const [currentTrainer, setCurrentTrainer] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNotesField, setShowNotesField] = useState(false);
  const [error, setError] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  // const [openViewDedails, setOpenViewDedails] = useState(false);
  // const [selectedTutor, setSelectedTutor] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  // const [typeFilter, setTypeFilter] = useState('all');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState('');
  const [rowActions, setRowActions] = useState({});
  const [notespopup, setNotesPopup] = useState(false);
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const auth = JSON.parse(localStorage.getItem('auth'));
  const userType = auth?.loginType;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/trainer_list`);
      const result = response.data;
      setData(result?.trainer_data || []);
      setRoles(result?.roles || []);
      setCourses(result?.courses || []);
      setBatches(result?.batches || []);
      setCategories(result?.categories || []);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handler functions to maintain consistency
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedCourse(null);
    setSelectedBatch(null);
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSelectedBatch(null);
  };

  const handleBatchSelect = (batch) => {
    setSelectedBatch(batch);
  };

  const handleOpen = () => {
    setCurrentTrainer(null);
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
        navigate(`/tutors/${data.employee_id}`, {
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

  const handleViewBatch = useCallback(
    (data) => {
      if (data) {
        navigate(`/batch`, {
          state: {
            N_UserId: data.trainer_id,
            N_UserType: 'tutor'
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

    password: currentTrainer
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

    status: Yup.string().required('Status is required'),

    notes: Yup.string().when(['status'], {
      is: (status) => {
        // Check if status has changed from initial value
        const initialStatus = currentTrainer?.status ?? 'active';
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
    initialValues: {
      employee_id: currentTrainer?.employee_id || '',
      full_name: currentTrainer?.full_name || '',
      username: currentTrainer?.username || '',
      user_type: 'tutor',
      password: '',
      email: currentTrainer?.email || '',
      contact_no: currentTrainer?.contact_no || '',
      gender: currentTrainer?.gender || '',
      specialization: currentTrainer?.specialization || '',
      working_hours: currentTrainer?.working_hours || '',
      status: currentTrainer?.status || 'active',
      notes: '',
      role_id: currentTrainer?.role || ''
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      // Prevent multiple submissions
      if (isSubmitting) return;

      setIsSubmitting(true);
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
          notes: values.notes
        };

        let response;
        if (currentTrainer) {
          // Update existing trainer
          response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/trainers/${currentTrainer.employee_id}`, tutorData);
        } else {
          // Add new trainer
          response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/trainers`, tutorData);
        }

        if (response.data.success === true) {
          const role = values.user_type === 'tutor' ? 'Tutor' : 'Admin';
          const action = currentTrainer ? 'updated' : 'added';

          Swal.fire({
            title: 'Success!',
            text: `${role} ${action} successfully!`,
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
        setIsSubmitting(false);
      }
    }
  });

  // Add this useEffect to track status changes
  useEffect(() => {
    // Show notes field only when status changes from initial value
    if (formik.values.status !== (currentTrainer?.status || 'active')) {
      setShowNotesField(true);
    } else {
      setShowNotesField(false);
    }
  }, [formik.values.status, currentTrainer?.status]);

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
          <Tooltip title="Batch">
            <IconButton variant="contained" color="secondary" onClick={() => handleViewBatch(row)}>
              <UserTag />
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
      width: '300px'
    }
  ];

  const handleEdit = (trainer) => {
    setCurrentTrainer(trainer);
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
            text: 'Tutor deleted successfully!',
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

  const { filteredCategories, filteredCourses, filteredBatches, filteredTutors } = useMemo(() => {
    // Filter tutors based on all criteria
    const filteredTutors = data.filter((tutor) => {
      // Search filter
      if (filterText) {
        const searchTermLower = filterText.toLowerCase();
        const matchesSearch =
          tutor.full_name?.toLowerCase().includes(searchTermLower) ||
          tutor.email?.toLowerCase().includes(searchTermLower) ||
          tutor.contact_no?.toLowerCase().includes(searchTermLower) ||
          tutor.employee_id?.toLowerCase().includes(searchTermLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const isActive = statusFilter === 'active';
        if ((tutor.status === 'active') !== isActive) return false;
      }

      // Category filter - Check if array contains the category_id
      if (selectedCategory?.category_id) {
        const tutorCategories = tutor.category_id || [];
        if (!tutorCategories.includes(selectedCategory.category_id)) return false;
      }

      // Course filter - Check if array contains the course_id
      if (selectedCourse?.course_id) {
        const tutorCourses = tutor.course_id || [];
        if (!tutorCourses.includes(selectedCourse.course_id)) return false;
      }

      // Batch filter - Check if array contains the batch_id
      if (selectedBatch?.batch_id) {
        const tutorBatches = tutor.batch_id || [];
        if (!tutorBatches.includes(selectedBatch.batch_id)) return false;
      }

      return true;
    });

    // Filter categories, courses, batches based on selections
    let filteredCategories = categories;
    let filteredCourses = courses;
    let filteredBatches = batches;

    // Filter categories based on selection
    if (selectedCategory?.category_id) {
      filteredCategories = categories.filter((cat) => cat.category_id === selectedCategory.category_id);

      // Filter courses by category
      filteredCourses = courses.filter((course) => course.category_id === selectedCategory.category_id);

      // Filter batches by category
      filteredBatches = batches.filter((batch) => batch.category_id === selectedCategory.category_id);
    }

    // Filter courses based on selection
    if (selectedCourse?.course_id) {
      const selectedCourseData = courses.find((c) => c.course_id === selectedCourse.course_id);

      if (selectedCourseData) {
        // Filter categories to show only the category of selected course
        filteredCategories = categories.filter((cat) => cat.category_id === selectedCourseData.category_id);

        // Show only the selected course
        filteredCourses = courses.filter((course) => course.course_id === selectedCourse.course_id);

        // Filter batches by course
        filteredBatches = batches.filter((batch) => batch.course_id === selectedCourse.course_id);
      }
    }

    // Filter batches based on selection
    if (selectedBatch?.batch_id) {
      const selectedBatchData = batches.find((b) => b.batch_id === selectedBatch.batch_id);

      if (selectedBatchData) {
        // Use the batch's category and course IDs to filter
        filteredCategories = categories.filter((cat) => cat.category_id === selectedBatchData.category_id);

        filteredCourses = courses.filter((course) => course.course_id === selectedBatchData.course_id);

        // Show only the selected batch
        filteredBatches = batches.filter((batch) => batch.batch_id === selectedBatch.batch_id);
      }
    }

    return {
      filteredCategories,
      filteredCourses,
      filteredBatches,
      filteredTutors
    };
  }, [data, categories, courses, batches, selectedCategory, selectedCourse, selectedBatch, statusFilter, filterText]);

  const filteredItems = filteredTutors.map((item, index) => ({
    ...item,
    sno: index + 1
  }));

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
      <Grid container justifyContent="space-between" alignItems="flex-start" spacing={2} my={3}>
        {/* Filters Section */}
        <Grid item xs={12} md={10}>
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
              {/* Search Field - Always full width on mobile */}
              <TextField
                placeholder="Search by name, ID, email, or phone..."
                variant="outlined"
                size="small"
                sx={{
                  minWidth: { xs: '100%', sm: 250 },
                  flexGrow: 1
                }}
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
              {(userType === 'admin' || userType === 'super_admin') && (
                <>
                  {/* Category Filter */}
                  <Autocomplete
                    id="category_id"
                    options={filteredCategories || []}
                    getOptionLabel={(option) => option.category_name || ''}
                    value={selectedCategory}
                    onChange={(event, newValue) => {
                      handleCategorySelect(newValue);
                    }}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Filter by category..."
                        InputProps={{
                          ...params.InputProps
                        }}
                      />
                    )}
                    filterOptions={(options = [], state) => {
                      return options.filter((option) => option.category_name?.toLowerCase().includes(state.inputValue.toLowerCase()));
                    }}
                    isOptionEqualToValue={(option, value) => option.category_id === value.category_id}
                    renderOption={(props, option) => (
                      <li {...props} key={option.category_id}>
                        {option.category_name}
                      </li>
                    )}
                  />

                  {/* Course Filter */}
                  <Autocomplete
                    id="course_id"
                    options={filteredCourses || []}
                    getOptionLabel={(option) => option.course_name || ''}
                    value={selectedCourse}
                    onChange={(event, newValue) => {
                      handleCourseSelect(newValue);
                    }}
                    size="small"
                    renderInput={(params) => <TextField {...params} placeholder="Filter by course..." />}
                    filterOptions={(options = [], state) => {
                      return options.filter((option) => option.course_name?.toLowerCase().includes(state.inputValue.toLowerCase()));
                    }}
                    isOptionEqualToValue={(option, value) => option.course_id === value.course_id}
                    renderOption={(props, option) => (
                      <li {...props} key={option.course_id}>
                        {option.course_name}
                      </li>
                    )}
                  />

                  {/* Batch Filter */}
                  <Autocomplete
                    id="batch_id"
                    options={filteredBatches || []}
                    getOptionLabel={(option) => option.title || ''}
                    value={selectedBatch}
                    onChange={(event, newValue) => {
                      handleBatchSelect(newValue);
                    }}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Filter by batch..."
                        InputProps={{
                          ...params.InputProps
                        }}
                      />
                    )}
                    filterOptions={(options = [], state) => {
                      return options.filter((option) => option.title?.toLowerCase().includes(state.inputValue.toLowerCase()));
                    }}
                    isOptionEqualToValue={(option, value) => option.batch_id === value.batch_id}
                    renderOption={(props, option) => (
                      <li {...props} key={option.batch_id}>
                        {option.title}
                      </li>
                    )}
                  />
                </>
              )}

              {/* Status Filter */}
              <FormControl size="small" sx={{ minWidth: 'auto !important' }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  displayEmpty
                  sx={{ maxWidth: '200px' }}
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

        {/* Add Button Section */}
        <Grid
          item
          xs={12}
          md={2}
          sx={{
            textAlign: { xs: 'left', md: 'right' },
            mt: { xs: 1, md: 0 }
          }}
        >
          {(userType === 'admin' || userType === 'super_admin') && canCreate && (
            <Button
              color="success"
              variant="contained"
              startIcon={<UserAdd />}
              onClick={handleOpen}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Add
            </Button>
          )}
        </Grid>
      </Grid>
    );
  }, [
    filterText,
    resetPaginationToggle,
    statusFilter,
    canCreate,
    filteredCategories,
    filteredCourses,
    filteredBatches,
    selectedCategory,
    selectedCourse,
    selectedBatch,
    userType
  ]);

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
          {currentTrainer ? 'Edit Trainer' : 'Add New Trainer'}
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
              {!currentTrainer && (
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

              <Grid item xs={12}>
                <DialogActions>
                  <Button onClick={handleClose}>Cancel</Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={formik.isSubmitting} // Disable when submitting
                  >
                    {formik.isSubmitting ? 'Processing...' : currentTrainer ? 'Update' : 'Add'}
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
                                  backgroundColor: note.status === 'active' ? 'success.main' : 'error.main'
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
                                label={note.status === 'active' ? 'Active' : 'Inactive'}
                                sx={{
                                  color: note.status === 'active' ? 'success.dark' : 'error.dark',
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

export default TutorTable;
