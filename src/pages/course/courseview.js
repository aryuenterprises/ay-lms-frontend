import MainCard from 'components/MainCard';
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
  Card,
  CardContent,
  Typography,
  FormLabel,
  CardMedia,
  MenuItem,
  CircularProgress,
  InputAdornment,
  Tooltip,
  Chip,
  FormControl,
  Select,
  CardActions,
  Autocomplete
} from '@mui/material';
import 'assets/css/commonStyle.css';
import { CardEdit, CardRemove, CloseCircle, CloseSquare, DocumentUpload, Eye, SearchNormal1 } from 'iconsax-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { PopupTransition } from 'components/@extended/Transitions';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { APP_PATH_BASE_URL } from 'config';
import Swal from 'sweetalert2';
import defaultImage from 'assets/images/course/course_default.svg';
import axiosInstance from 'utils/axios';
import { usePermission } from 'hooks/usePermission';

const CourseView = () => {
  const navigate = useNavigate();
  const { checkPermission } = usePermission();

  const canCreate = checkPermission('Course', 'create');
  const canUpdate = checkPermission('Course', 'update');
  const canDelete = checkPermission('Course', 'delete');

  const [loading, setIsLoading] = useState(false);
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
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }, [userType, userId, regId]);

  // In your render/return:
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

  // console.log('formik error :', formik.errors);
  // console.log('formik values :', formik.values);

  const handleDelete = async (id) => {
    // Show confirmation dialog first
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
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
    <MainCard>
      <Grid container justifyContent="space-between" alignItems="center" my={3} spacing={2}>
        <Grid item xs={12}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} width="100%">
            <Grid item display="flex" flexDirection={{ xs: 'column', sm: 'row' }}>
              <Grid item xs={12} md={10}>
                <Stack direction="row" alignItems="center" spacing={2}>
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
                          <SearchNormal1 size={20} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          {searchTerm && (
                            <IconButton onClick={handleClearSearch} edge="end" size="small">
                              <CloseSquare size={20} />
                            </IconButton>
                          )}
                        </InputAdornment>
                      )
                    }}
                    sx={{ width: 220 }}
                  />
                  {(userType === 'admin' || userType === 'super_admin') && (
                    <>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        variant="outlined"
                        placeholder="Filter by category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              {selectedCategory && (
                                <IconButton onClick={handleClearCategory} edge="end" size="small" style={{ marginRight: 10 }}>
                                  <CloseSquare size={20} />
                                </IconButton>
                              )}
                            </InputAdornment>
                          )
                        }}
                        sx={{ width: 260 }}
                        SelectProps={{
                          displayEmpty: true
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
                    </>
                  )}
                </Stack>
              </Grid>
            </Grid>
            <Grid item xs={12} textAlign="right">
              {(userType === 'admin' || userType === 'super_admin') && canCreate && (
                <Button variant="contained" onClick={handleCourseAdd}>
                  Add More
                </Button>
              )}
            </Grid>
          </Stack>
        </Grid>
      </Grid>
      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 300 }}>
          <CircularProgress />
        </Stack>
      ) : filteredCourses && Array.isArray(filteredCourses) && filteredCourses.length > 0 ? (
        <Grid container spacing={4}>
          {filteredCourses &&
            Array.isArray(filteredCourses) &&
            filteredCourses.map((course) => (
              <Grid item xs={12} sm={6} md={3} key={course.course_id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 40px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Box
                    onClick={() => handleCardClick(course.course_id, course)}
                    sx={{ cursor: 'pointer', flexGrow: 1, display: 'flex', flexDirection: 'column' }}
                  >
                    <CardMedia
                      component="img"
                      height="160"
                      image={course.course_pic_url || defaultImage}
                      alt={course.course_name}
                      sx={{ objectFit: 'contain',padding:"20px" }}
                      onError={(e) => {
                        e.target.src = defaultImage;
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                        <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 600, color: 'secondary.dark' }}>
                          {course.course_name}
                        </Typography>
                        {(userType === 'admin' || userType === 'super_admin') && (
                          <Chip
                            label={course.status}
                            size="small"
                            sx={{
                              backgroundColor: course.status === 'Active' ? 'success.lighter' : 'error.lighter',
                              color: course.status === 'Active' ? 'success.main' : 'error.main',
                              fontWeight: 'bold',
                              borderRadius: '10px'
                            }}
                          />
                        )}
                      </Stack>
                    </CardContent>
                  </Box>

                  <CardActions sx={{ justifyContent: 'space-between', p: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                    <Tooltip title="View">
                      <IconButton onClick={() => handleCardClick(course.course_id, course)} size="small" color="secondary">
                        <Eye fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Typography variant="caption" color="text.secondary">
                      {course.duration} month{course.duration > 1 && 's'}
                    </Typography>

                    {userType === 'admin' || userType === 'super_admin' ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {canUpdate && (
                          <Tooltip title="Edit">
                            <IconButton onClick={() => handleCourseEdit(course)} size="small" color="secondary">
                              <CardEdit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canDelete && (
                          <Tooltip title="Delete">
                            <IconButton onClick={() => handleDelete(course.course_id)} size="small" color="error">
                              <CardRemove fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    ) : (
                      <Button onClick={() => handleCardClick(course.course_id, course)} size="small" variant="outlined" color="primary">
                        More
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
        </Grid>
      ) : (
        // Show "No courses found" message when array is empty
        <Grid item xs={12}>
          <Typography variant="h6" align="center" sx={{ py: 4 }}>
            No courses found
          </Typography>
        </Grid>
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
          {currentCourse ? 'Edit Course' : 'Add Course'}
          <IconButton color="dark" onClick={handleClose} edge="end" size="big" aria-label="close" title="close">
            <CloseSquare height={30} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={formik.handleSubmit}>
            <Grid container>
              <Grid item xs={6} p={1} sx={{ mt: 2 }}>
                <Stack spacing={1}>
                  <FormLabel>Course Category*</FormLabel>
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
                    SelectProps={{
                      displayEmpty: true
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
              <Grid item xs={6} p={1} sx={{ mt: 2 }}>
                <Stack spacing={1}>
                  <FormLabel>Course Name*</FormLabel>
                  <TextField
                    fullWidth
                    id="course_name"
                    name="course_name"
                    placeholder="Course Name"
                    value={formik.values.course_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.course_name && Boolean(formik.errors.course_name)}
                    helperText={formik.touched.course_name && formik.errors.course_name}
                  />
                </Stack>
              </Grid>
              <Grid item xs={6} p={1} sx={{ mt: 2 }}>
                <Stack spacing={1}>
                  <FormLabel>Course Duration (month)*</FormLabel>
                  <TextField
                    select
                    fullWidth
                    name="duration"
                    id="duration"
                    placeholder="Course Duration in month"
                    value={formik.values.duration}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.duration && Boolean(formik.errors.duration)}
                    helperText={formik.touched.duration && formik.errors.duration}
                    SelectProps={{
                      displayEmpty: true
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
              <Grid item xs={6} p={1} sx={{ mt: 2 }}>
                <Stack spacing={1}>
                  <FormLabel>Course Fee*</FormLabel>
                  <TextField
                    fullWidth
                    id="fee"
                    name="fee"
                    placeholder="Course Fee"
                    value={formik.values.fee}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.fee && Boolean(formik.errors.fee)}
                    helperText={formik.touched.fee && formik.errors.fee}
                  />
                </Stack>
              </Grid>
              <Grid item xs={6} p={1} sx={{ mt: 2 }}>
                <Stack spacing={1}>
                  <FormLabel>Course Status*</FormLabel>
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
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </TextField>
                </Stack>
              </Grid>
              <Grid item xs={6} p={1} sx={{ mt: 2 }}>
                <Stack spacing={1}>
                  <FormLabel>Currency Type*</FormLabel>
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
                  />
                </Stack>
              </Grid>
              {/*Notes*/}
              {/* {formik.values.status === 'Inactive' && (
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
              )} */}
              <Grid item xs={12} p={1} sx={{ mt: 2 }}>
                <Stack spacing={1}>
                  <FormLabel>Course Picture</FormLabel>
                  <label htmlFor="course_pic" style={{ cursor: 'pointer' }}>
                    <Box
                      display="flex"
                      gap={2}
                      p={1}
                      sx={{
                        border: '1px dashed',
                        borderColor: 'grey.400',
                        borderRadius: 1,
                        '&:hover': {
                          borderColor: 'grey.800',
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <DocumentUpload />
                      <Typography>Choose Image</Typography>
                      <TextField
                        type="file"
                        sx={{ display: 'none' }}
                        id="course_pic"
                        placeholder="Outlined"
                        variant="outlined"
                        onChange={handleImageChange}
                      />
                    </Box>
                  </label>

                  {selectedImage ? (
                    <Box mt={2}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        gap={2}
                        padding={1}
                        sx={{
                          border: '1px dashed',
                          borderColor: 'grey.400',
                          borderRadius: 1,
                          '&:hover': {
                            borderColor: 'grey.800',
                            backgroundColor: 'action.hover'
                          }
                        }}
                      >
                        <Typography variant="body5" fontWeight={600}>
                          Preview:
                        </Typography>
                        <Typography variant="body5" fontWeight="medium">
                          {selectedImage.name}
                        </Typography>
                        <IconButton size="small" onClick={() => setSelectedImage(null)} sx={{ color: 'text.secondary' }}>
                          <CloseCircle color="red" size="large" />
                        </IconButton>
                      </Box>
                      <Stack
                        sx={{
                          border: '1px dashed',
                          borderColor: 'grey.400',
                          borderRadius: 1,
                          width: 'fit-content',
                          '&:hover': {
                            borderColor: 'grey.800',
                            backgroundColor: 'action.hover'
                          }
                        }}
                        mt={1}
                        borderRadius={1}
                        p={1}
                      >
                        <img
                          src={URL.createObjectURL(selectedImage)}
                          alt="Course preview"
                          style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '10px' }}
                        />
                      </Stack>
                    </Box>
                  ) : currentCourse?.course_pic_url ? (
                    <Box mt={2}>
                      <FormLabel variant="body2">Current Image:</FormLabel>
                      <Stack
                        sx={{
                          border: '1px dashed',
                          borderColor: 'grey.400',
                          borderRadius: 1,
                          width: 'fit-content',
                          '&:hover': {
                            borderColor: 'grey.800',
                            backgroundColor: 'action.hover'
                          }
                        }}
                        mt={1}
                        borderRadius={1}
                        p={1}
                      >
                        <img
                          src={currentCourse.course_pic_url}
                          alt="Current course"
                          style={{
                            width: '150px',
                            height: '150px',
                            objectFit: 'contain',
                            display: 'block'
                          }}
                        />
                      </Stack>
                    </Box>
                  ) : null}
                </Stack>
              </Grid>
            </Grid>
            <DialogActions sx={{ mt: 3 }}>
              <Button onClick={handleClose} disabled={formik.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
                {currentCourse ? 'Update' : 'Submit'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </MainCard>
  );
};

export default CourseView;
