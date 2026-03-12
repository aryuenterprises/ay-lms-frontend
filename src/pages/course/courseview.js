import MainCard from 'components/MainCard';
import 'assets/css/commonStyle.css';
import { CloseCircle, CloseSquare, DocumentUpload, Edit, SearchNormal1, Trash } from 'iconsax-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { PopupTransition } from 'components/@extended/Transitions';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { APP_PATH_BASE_URL } from 'config';
import Swal from 'sweetalert2';
import axiosInstance from 'utils/axios';
import { usePermission } from 'hooks/usePermission';
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
  Typography,
  FormLabel,
  MenuItem,
  InputAdornment,
  FormControl,
  Select,
  Autocomplete,
  Chip,
  Paper
} from '@mui/material';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Visibility } from '@mui/icons-material';

const CourseView = () => {
  const navigate = useNavigate();
  const { checkPermission } = usePermission();

  const canCreate = checkPermission('Course', 'create');
  const canUpdate = checkPermission('Course', 'update');
  const canDelete = checkPermission('Course', 'delete');

  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const auth = JSON.parse(localStorage.getItem('auth'));
  const userId = auth?.user?.employee_id || auth?.user?.user_id;
  const regId = auth?.user?.student_id;
  const userType = auth?.loginType;

  const fetchData = useCallback(async () => {
    try {
      let response;
      setError(null); // Reset error state

      if (userType === 'admin' || userType === 'super_admin') {
        response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/courses`);
      } else if (userType === 'tutor') {
        response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/trainer/${userId}/courses`);
      } else {
        response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/student_profile/${regId}/courses`);
      }
      // console.log('response :', response);
      setCourses(response.data.data || []);
      setCategories(response.data.categories || []);
      setCurrencies(response.data.currencies || []);
    } catch (err) {
      setError(err.response?.message || 'Failed to fetch courses');
      setCourses([]); // Reset to empty array on error
    }
  }, [userType, userId, regId]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (!course) return false; // Additional safety check
      const matchesSearch =
        !searchTerm ||
        course.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = !selectedCategory || course.course_category === selectedCategory;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && course.status === 'Active') ||
        (statusFilter === 'inactive' && course.status === 'Inactive');

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [courses, searchTerm, selectedCategory, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCardClick = (courseId, course) => {
    if (course) {
      navigate(`/course/${courseId}`, {
        state: {
          title: course.course_name,
          courseData: course
        }
      });
    }
  };

  const handleCourseAdd = () => {
    setCurrentCourse(null);
    setSelectedImage(null);
    setOpen(true);
  };

  const handleCourseEdit = (course) => {
    setCurrentCourse(course);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null);
    formik.resetForm();
  };

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  const validationSchema = Yup.object().shape({
    course_name: Yup.string().required('Course name is required'),
    // description: Yup.string().required('Course description is required'),
    course_category: Yup.string().required('Course category is required'),
    duration: Yup.number()
      .typeError('Duration must be a number')
      .positive('Duration must be positive')
      .required('Course duration is required'),
    fee: Yup.number().typeError('Fee must be a number').min(0, 'Fee cannot be negative').required('Course fee is required'),
    status: Yup.string().required('Status is required'),
    currency_type: Yup.string().required('Currency type is required')
  });

  const initialValues = {
    course_name: '',
    // description: '',
    course_category: '',
    duration: '',
    fee: '',
    status: 'Active',
    currency_type: '',
    notes: ''
  };

  const formik = useFormik({
    initialValues: currentCourse || initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const formData = new FormData();

        // Append all form values
        formData.append('course_name', values.course_name);
        formData.append('description', values.description);
        formData.append('course_category', values.course_category);
        formData.append('duration', values.duration);
        formData.append('fee', values.fee);
        formData.append('status', values.status);
        formData.append('currency_type', values.currency_type);

        // if (values.status === 'Inactive') {
        //   formData.append('notes', values.notes);
        // }

        // Append image if selected
        if (selectedImage) {
          formData.append('course_pic', selectedImage);
        } else if (currentCourse && !selectedImage) {
          // If updating but no new image, ensure we keep the existing image
          formData.append('keep_existing_image', 'true');
        }

        let response;
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        };

        if (currentCourse) {
          // Update existing course
          response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/courses/${currentCourse.course_id}`, formData, config);
        } else {
          // Add new course
          response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/courses`, formData, config);
        }

        if (response.data.success === true) {
          Swal.fire({
            title: 'Success!',
            text: currentCourse ? 'Course updated successfully!' : 'Course added successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          resetForm();
          handleClose();
          fetchData(); // Refresh data after successful submission
        } else {
          Swal.fire({
            title: 'Error!',
            text: response.data.message || 'Error submitting data.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      } catch (error) {
        let errorMessage = 'Error submitting course data. Please try again.';

        if (error.response?.data) {
          const errorData = error.response.data;
          const firstError = Object.values(errorData)[0]?.[0];

          if (firstError) {
            errorMessage = firstError;
          }
        }

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

  const handleDelete = async (id) => {
    // Show confirmation dialog first
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D63031',
      cancelButtonColor: '#636E67',
      confirmButtonText: 'Yes, delete it!'
    });

    // If user confirms, proceed with deletion
    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/courses/${id}/archive`);
        if (response.data.success === true) {
          Swal.fire({
            title: 'Success!',
            text: 'Course deleted successfully!',
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
          text: error.response?.data?.message || 'Failed to delete course.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  if (error) {
    return (
      <MainCard sx={{ borderRadius: 2 }}>
        <Box p={3} color="error.main">
          Error: {error}
        </Box>
      </MainCard>
    );
  }

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleClearCategory = () => {
    setSelectedCategory('');
  };

  const handleStatusClear = () => {
    setStatusFilter('all');
  };

  return (
    <MainCard
      sx={{
        border: 'none',
        boxShadow: '0 20px 40px -10px rgba(106, 27, 154, 0.15)',
        borderRadius: 3,
        overflow: 'hidden'
      }}
    >
      {/* Modern Header Section with Gradient */}
      <Box>
        <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
          <Grid item xs={12}>
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
              <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap" gap={1}>
                {/* Modern Search Field */}
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchNormal1 size={18} color="#9c27b0" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {searchTerm && (
                          <IconButton onClick={handleClearSearch} edge="end" size="small" sx={{ color: '#6a1b9a' }}>
                            <CloseSquare size={18} />
                          </IconButton>
                        )}
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    width: 240,

                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: 3,
                      '&:hover fieldset': {
                        borderColor: '#d1b8e0'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6a1b9a',
                        borderWidth: 2
                      }
                    }
                  }}
                />

                {(userType === 'admin' || userType === 'super_admin') && (
                  <>
                    {/* Modern Category Select */}
                    <TextField
                      select
                      size="small"
                      variant="outlined"
                      placeholder="Filter by category"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {selectedCategory && (
                              <IconButton onClick={handleClearCategory} edge="end" size="small" sx={{ color: '#6a1b9a', mr: 1 }}>
                                <CloseSquare size={18} />
                              </IconButton>
                            )}
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        width: 260,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'white',
                          borderRadius: 3
                        }
                      }}
                      SelectProps={{
                        displayEmpty: true,
                        MenuProps: {
                          PaperProps: {
                            sx: {
                              borderRadius: 2,
                              boxShadow: '0 10px 30px rgba(106, 27, 154, 0.1)',
                              '& .MuiMenuItem-root': {
                                '&:hover': {
                                  backgroundColor: '#f3e5f5'
                                },
                                '&.Mui-selected': {
                                  backgroundColor: '#e1bee7',
                                  '&:hover': {
                                    backgroundColor: '#ce93d8'
                                  }
                                }
                              }
                            }
                          }
                        }
                      }}
                    >
                      <MenuItem value="" disabled>
                        All Categories
                      </MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category.category_id} value={category.category_name}>
                          {category.category_name}
                        </MenuItem>
                      ))}
                    </TextField>

                    {/* Modern Status Select */}
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        displayEmpty
                        sx={{
                          backgroundColor: 'white',
                          borderRadius: 3,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#d1b8e0'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#6a1b9a',
                            borderWidth: 2
                          }
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              borderRadius: 2,
                              boxShadow: '0 10px 30px rgba(106, 27, 154, 0.1)'
                            }
                          }
                        }}
                        renderValue={(selected) => {
                          if (selected === 'all') return 'Select Status';
                          return selected === 'active' ? 'Active' : 'Inactive';
                        }}
                        endAdornment={
                          statusFilter !== 'all' && (
                            <InputAdornment position="end" sx={{ mr: 2 }}>
                              <IconButton onClick={handleStatusClear} edge="end" size="small" sx={{ color: '#6a1b9a' }}>
                                <CloseSquare size={16} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }
                      >
                        <MenuItem value="all">Select Status</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                      </Select>
                    </FormControl>
                  </>
                )}
              </Stack>

              {/* Modern Add Button */}
              {(userType === 'admin' || userType === 'super_admin') && canCreate && (
                <Button
                  variant="contained"
                  onClick={handleCourseAdd}
                  sx={{
                    background: 'white',
                    color: '#6a1b9a',
                    borderRadius: 3,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    '&:hover': {
                      background: '#f3e5f5',
                      boxShadow: '0 6px 15px rgba(106, 27, 154, 0.2)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  + Add New Course
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Modern DataTable */}
      <Box sx={{ p: 3 }}>
        <DataTable
          value={filteredCourses}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 20, 50]}
          dataKey="course_id"
          emptyMessage="No courses found."
          rowHover
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} courses"
          paginatorClassName="modern-paginator"
          className="modern-data-table"
          // sx={{
          //   '& .p-datatable-wrapper': {
          //     borderRadius: 2,
          //     overflow: 'hidden'
          //   },
          //   '& .p-datatable-thead > tr > th': {
          //     background: 'linear-gradient(135deg, #ff2807 0%, #f3e5f5 100%)',
          //     color: '#4a148c',
          //     fontWeight: 600,
          //     fontSize: '0.9rem',
          //     padding: '1rem',
          //     borderBottom: '2px solid #d1b8e0'
          //   },
          //   '& .p-datatable-tbody > tr': {
          //     transition: 'all 0.2s ease',
          //     '&:hover': {
          //       background: '#faf5ff !important',
          //       boxShadow: '0 2px 8px rgba(106, 27, 154, 0.1)'
          //     },
          //     '& > td': {
          //       padding: '0.75rem 1rem',
          //       borderBottom: '1px solid #f0e4f5'
          //     }
          //   }
          // }}
        >
          {/* S.No - Row Index */}
          <Column
            header="S.No"
            body={(data, options) => (
              <Chip
                label={options.rowIndex + 1}
                size="small"
                sx={{
                  backgroundColor: '#f3e5f5',
                  color: '#6a1b9a',
                  minWidth: 32
                }}
              />
            )}
            // style={{ width: '4rem' }}
          />

          {/* Course Image */}
          <Column
            header="Course"
            body={(rowData) => (
              <Box display="flex" alignItems="center" gap={2}>
                {/* <img
        src={rowData.course_pic_url || defaultImage}
        alt={rowData.course_name}
        style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '20px',
                      border: '2px solid #d1b8e0',
                      objectFit:'contain',
                      
                    }}
        onError={(e) => (e.target.src = defaultImage)}
      /> */}
                <Typography fontWeight={500}>{rowData.course_name}</Typography>
              </Box>
            )}
          />

          {/* Conditional Status Column */}
          {(userType === 'admin' || userType === 'super_admin') && (
            <Column
              field="status"
              header="Status"
              body={(rowData) => (
                <Chip
                  label={rowData.status}
                  size="small"
                  sx={{
                    backgroundColor: rowData.status === 'Active' ? '#e8f5e9' : '#ffebee',
                    color: rowData.status === 'Active' ? '#2e7d32' : '#c62828',
                    fontWeight: 600,
                    borderRadius: 2
                  }}
                />
              )}
            />
          )}

          {/* Duration */}
          <Column
            field="duration"
            header="Duration"
            body={(rowData) => (
              <Typography variant="body2">
                {rowData.duration} month{rowData.duration > 1 ? 's' : ''}
              </Typography>
            )}
          />

          {/* Actions */}
          <Column
            header="Actions"
            body={(rowData) => (
              <Stack direction="row" spacing={1}>
                <IconButton
                  onClick={() => handleCardClick(rowData.course_id, rowData)}
                  sx={{
                    color: '#6a1b9a',
                    '&:hover': { backgroundColor: '#f3e5f5' }
                  }}
                >
                  <Visibility size={18} />
                </IconButton>
                {(userType === 'admin' || userType === 'super_admin') && canUpdate && (
                  <IconButton
                    onClick={() => handleCourseEdit(rowData)}
                    sx={{
                      color: '#9c27b0',
                      '&:hover': { backgroundColor: '#f3e5f5' }
                    }}
                  >
                    <Edit size={18} />
                  </IconButton>
                )}
                {(userType === 'admin' || userType === 'super_admin') && canDelete && (
                  <IconButton
                    onClick={() => handleDelete(rowData)}
                    sx={{
                      color: '#c62828',
                      '&:hover': { backgroundColor: '#ffebee' }
                    }}
                  >
                    <Trash size={18} />
                  </IconButton>
                )}
              </Stack>
            )}
            bodyStyle={{ textAlign: 'right' }}
          />
        </DataTable>
      </Box>

      {/* Modern Dialog */}
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
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 25px 50px -12px rgba(106, 27, 154, 0.25)',
            overflow: 'hidden'
          }
        }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, rgba(106, 27, 154,0.8)  0%, rgba(106, 27, 154,0.7) 100%)',
            color: 'white',
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            {currentCourse ? 'Edit Course' : 'Add New Course'}
          </Typography>
          <IconButton color="inherit" onClick={handleClose} edge="end" size="medium" title="close">
            <CloseSquare height={24} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, backgroundColor: 'rgba(240, 232, 245,0.2)' }}>
          <form onSubmit={formik.handleSubmit} style={{ paddingTop: '20px' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel sx={{ color: '#4a148c', fontWeight: 600 }}>Course Category*</FormLabel>
                  <TextField
                    select
                    fullWidth
                    id="course_category"
                    name="course_category"
                    value={formik.values.course_category || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.course_category && Boolean(formik.errors.course_category)}
                    helperText={formik.touched.course_category && formik.errors.course_category}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: '#d1b8e0' },
                        '&.Mui-focused fieldset': { borderColor: '#6a1b9a' }
                      }
                    }}
                    SelectProps={{
                      displayEmpty: true,
                      MenuProps: {
                        PaperProps: {
                          sx: { borderRadius: 2 }
                        }
                      }
                    }}
                  >
                    <MenuItem value="">Select category</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.category_id} value={category.category_name}>
                        {category.category_name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel sx={{ color: '#4a148c', fontWeight: 600 }}>Course Name*</FormLabel>
                  <TextField
                    fullWidth
                    id="course_name"
                    name="course_name"
                    placeholder="Enter course name"
                    value={formik.values.course_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.course_name && Boolean(formik.errors.course_name)}
                    helperText={formik.touched.course_name && formik.errors.course_name}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: '#d1b8e0' },
                        '&.Mui-focused fieldset': { borderColor: '#6a1b9a' }
                      }
                    }}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel sx={{ color: '#4a148c', fontWeight: 600 }}>Course Duration (months)*</FormLabel>
                  <TextField
                    select
                    fullWidth
                    name="duration"
                    id="duration"
                    value={formik.values.duration}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.duration && Boolean(formik.errors.duration)}
                    helperText={formik.touched.duration && formik.errors.duration}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        borderRadius: 2
                      }
                    }}
                    SelectProps={{
                      displayEmpty: true,
                      MenuProps: {
                        PaperProps: {
                          sx: { borderRadius: 2 }
                        }
                      }
                    }}
                  >
                    <MenuItem value="">Select Duration</MenuItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                      <MenuItem key={month} value={month.toString()}>
                        {month} month{month !== 1 ? 's' : ''}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel sx={{ color: '#4a148c', fontWeight: 600 }}>Course Fee*</FormLabel>
                  <TextField
                    fullWidth
                    id="fee"
                    name="fee"
                    placeholder="Enter course fee"
                    value={formik.values.fee}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.fee && Boolean(formik.errors.fee)}
                    helperText={formik.touched.fee && formik.errors.fee}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        borderRadius: 2
                      }
                    }}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel sx={{ color: '#4a148c', fontWeight: 600 }}>Course Status*</FormLabel>
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        borderRadius: 2
                      }
                    }}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </TextField>
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel sx={{ color: '#4a148c', fontWeight: 600 }}>Currency Type*</FormLabel>
                  <Autocomplete
                    options={currencies || []}
                    getOptionLabel={(option) => `${option.name} - ${option.symbol} (${option.code})`}
                    value={currencies?.find((currency) => currency.code === formik.values.currency_type) || null}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('currency_type', newValue ? newValue.code : '');
                    }}
                    onBlur={formik.handleBlur}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select currency..."
                        name="currency_type"
                        error={formik.touched.currency_type && Boolean(formik.errors.currency_type)}
                        helperText={formik.touched.currency_type && formik.errors.currency_type}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            borderRadius: 2
                          }
                        }}
                      />
                    )}
                    filterOptions={(options, state) => {
                      return options.filter(
                        (option) =>
                          option.name.toLowerCase().includes(state.inputValue.toLowerCase()) ||
                          option.code.toLowerCase().includes(state.inputValue.toLowerCase()) ||
                          option.symbol.toLowerCase().includes(state.inputValue.toLowerCase())
                      );
                    }}
                    isOptionEqualToValue={(option, value) => option.code === value?.code}
                    renderOption={(props, option) => (
                      <li {...props} key={option.code}>
                        {option.name} - {option.symbol} ({option.code})
                      </li>
                    )}
                    PaperComponent={(props) => <Paper {...props} sx={{ borderRadius: 2 }} />}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <FormLabel sx={{ color: '#4a148c', fontWeight: 600 }}>Course Picture</FormLabel>
                  <label htmlFor="course_pic" style={{ cursor: 'pointer' }}>
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={2}
                      p={2}
                      sx={{
                        border: '2px dashed #d1b8e0',
                        borderRadius: 3,
                        backgroundColor: 'white',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: '#6a1b9a',
                          backgroundColor: '#faf5ff'
                        }
                      }}
                    >
                      <DocumentUpload color="#6a1b9a" size={24} />
                      <Typography color="#6a1b9a" fontWeight={500}>
                        Click to upload course image
                      </Typography>
                      <TextField type="file" sx={{ display: 'none' }} id="course_pic" onChange={handleImageChange} />
                    </Box>
                  </label>

                  {selectedImage ? (
                    <Box mt={2} p={2} sx={{ backgroundColor: 'white', borderRadius: 2, border: '1px solid #d1b8e0' }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography variant="body2" color="#4a148c" fontWeight={600}>
                          Preview:
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="caption" color="textSecondary">
                            {selectedImage.name}
                          </Typography>
                          <IconButton size="small" onClick={() => setSelectedImage(null)} sx={{ color: '#c62828' }}>
                            <CloseCircle size={20} />
                          </IconButton>
                        </Box>
                      </Box>
                      <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="Course preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          borderRadius: '8px',
                          objectFit: 'cover'
                        }}
                      />
                    </Box>
                  ) : currentCourse?.course_pic_url ? (
                    <Box mt={2} p={2} sx={{ backgroundColor: 'white', borderRadius: 2, border: '1px solid #d1b8e0' }}>
                      <Typography variant="body2" color="#4a148c" fontWeight={600} mb={2}>
                        Current Image:
                      </Typography>
                      <img
                        src={currentCourse.course_pic_url}
                        alt="Current course"
                        style={{
                          width: '150px',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '2px solid #d1b8e0'
                        }}
                      />
                    </Box>
                  ) : null}
                </Stack>
              </Grid>
            </Grid>

            <DialogActions sx={{ mt: 3, px: 0 }}>
              <Button
                onClick={handleClose}
                disabled={formik.isSubmitting}
                sx={{
                  color: '#6a1b9a',
                  borderRadius: 2,
                  px: 3,
                  '&:hover': {
                    backgroundColor: '#f3e5f5'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={formik.isSubmitting}
                sx={{
                  background: 'linear-gradient(135deg, #6a1b9a 0%, #9c27b0 100%)',
                  borderRadius: 2,
                  px: 4,
                  py: 1,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%)',
                    boxShadow: '0 4px 15px rgba(106, 27, 154, 0.3)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {currentCourse ? 'Update Course' : 'Create Course'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </MainCard>
  );
};

export default CourseView;