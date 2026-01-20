import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  IconButton,
  Paper,
  Box,
  Stack,
  FormLabel,
  Autocomplete,
  InputAdornment
} from '@mui/material';
import { Add as AddIcon, Assignment } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { useNavigate } from 'react-router';
import { APP_PATH_BASE_URL } from 'config';
import axiosInstance from 'utils/axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { CloseSquare, Edit, SearchNormal1, Trash } from 'iconsax-react';
import { usePermission } from 'hooks/usePermission';

// Validation Schema
const moduleValidationSchema = Yup.object({
  test_name: Yup.string()
    .required('Module title is required')
    .trim()
    .matches(/^.*\S.*$/, 'Module title cannot be blank or only spaces'),
  course_id: Yup.string()
    .required('Course selection is required')
    .trim()
    .matches(/^.*\S.*$/, 'Course selection cannot be only spaces'),
  description: Yup.string().optional(),
  total_marks: Yup.number().required('Total marks is required').positive('Total marks must be positive')
});

// Main Assessment List Component
const AssessmentList = () => {
  const navigate = useNavigate();
  const { checkPermission } = usePermission();

  const canCreate = checkPermission('Assessment', 'create');
  const canUpdate = checkPermission('Assessment', 'update');
  const canDelete = checkPermission('Assessment', 'delete');

  const [modules, setModules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const formik = useFormik({
    initialValues: {
      test_name: '',
      course_id: '',
      description: '',
      total_marks: ''
      // duration: ''
    },
    validationSchema: moduleValidationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const payload = {
          test_name: values.test_name,
          course_id: values.course_id,
          description: values.description,
          total_marks: parseInt(values.total_marks)
          // duration: values.duration
        };

        let response;

        if (editingModule) {
          // Update existing module
          response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/test/${editingModule.test_id}`, payload);
        } else {
          // Create new module
          response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/test`, payload);
        }

        // console.log('API Response:', response.data);

        if (response.data.success === true) {
          Swal.fire({
            title: 'Success!',
            text: response.data.message,
            icon: 'success',
            showConfirmButton: true,
            confirmButtonText: 'OK'
          });
          // Refresh the data
          fetchData();
        } else {
          Swal.fire({
            title: 'Error!',
            text: response.data.message,
            icon: 'error',
            showConfirmButton: true,
            confirmButtonText: 'OK'
          });
        }

        setOpenDialog(false);
        setEditingModule(null);
        resetForm();
      } catch (error) {
        console.error('API Error:', error);
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'An error occurred',
          icon: 'error',
          showConfirmButton: true,
          confirmButtonText: 'OK'
        });
      } finally {
        setSubmitting(false);
      }
    }
  });

  const fetchData = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/test`);
      const result = response.data;
      const data = result.data?.map((item, index) => ({
        sno: index + 1,
        ...item
      }));
      setCourses(result.courses);
      setModules(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching student data:', err);
    }
  }, []);

  const filteredmodules = useMemo(() => {
    return modules.filter((course) => {
      if (!course) return false; // Additional safety check

      // Check if course matches search term
      const matchesSearch =
        !searchTerm ||
        course.course.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.test_name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Check if course matches selected course filter
      const matchesCourse = !selectedCourse || course.course.course_id === selectedCourse.course_id;

      // Return true only if both conditions are met
      return matchesSearch && matchesCourse;
    });
  }, [modules, selectedCourse, searchTerm]);

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Load sample data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditModule = (module) => {
    setEditingModule(module);
    formik.setValues({
      test_name: module.test_name || '',
      course_id: module.course_id || '',
      description: module.description || '',
      total_marks: module.total_marks || ''
      // duration: module.duration || ''
    });
    setOpenDialog(true);
  };

  const handleDeleteModule = async (moduleId) => {
    try {
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
        const response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/test/${moduleId}/archive`);

        if (response.data.success) {
          Swal.fire('Deleted!', response.data.message, 'success');
          // Refresh the data
          fetchData();
        } else {
          Swal.fire('Error!', response.data.message, 'error');
        }
      }
    } catch (error) {
      Swal.fire('Error!', 'Failed to delete module', 'error');
    }
  };

  const handleModuleClick = (module) => {
    navigate(`/assessment/questions/${module.test_id}`, { state: { module } });
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingModule(null);
    formik.resetForm();
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

  return (
    <>
      <MainCard>
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
                />

                <Autocomplete
                  id="course_id"
                  options={courses || []}
                  getOptionLabel={(option) => option.course_name || ''}
                  value={selectedCourse}
                  onChange={(event, newValue) => {
                    setSelectedCourse(newValue);
                  }}
                  size="small"
                  sx={{
                    minWidth: { xs: '100%', sm: 180, md: 200 },
                    flex: '1 1 auto'
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Filter by course..."
                      InputProps={{
                        ...params.InputProps
                      }}
                    />
                  )}
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
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={2} direction="row" justifyContent="flex-end">
              {canCreate && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    formik.resetForm();
                    setOpenDialog(true);
                  }}
                  sx={{
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem'
                  }}
                  color="success"
                >
                  Create New Module
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {filteredmodules.map((module) => (
            <Grid item xs={12} md={6} lg={4} key={module.test_id}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    borderColor: 'secondary.light'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      width: '100%'
                    }}
                  >
                    <Typography
                      variant="h5"
                      component="h2"
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        flex: 1,
                        wordBreak: 'break-word' // to wrap long words if any
                      }}
                    >
                      {module.test_name}
                    </Typography>
                    <Chip
                      label={module.course.course_name}
                      color="secondary"
                      // variant="outlined"
                      size="small"
                      sx={{
                        mb: 1,
                        fontWeight: 500,
                        backgroundColor: 'secondary.light',
                        color: 'secondary.dark',
                        alignSelf: 'flex-start',
                        ml: 2, // margin between text and chip
                        whiteSpace: 'nowrap' // keep chip label on one line
                      }}
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      minHeight: 40,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {module.description || 'Attend all the questions.'}
                  </Typography>

                  <Box
                    sx={{
                      backgroundColor: 'grey.50',
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* <QuestionAnswer fontSize="small" color="primary" /> */}
                        <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                          Questions:
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {module.question_count}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* <Grade fontSize="small" color="primary" /> */}
                        <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                          Total Marks:
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {module.total_marks}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                  <Button
                    size="small"
                    onClick={() => handleModuleClick(module)}
                    sx={{
                      fontWeight: 500,
                      borderRadius: 1,
                      px: 2
                    }}
                  >
                    Manage Questions
                  </Button>
                  <Box>
                    {canUpdate && (
                      <IconButton
                        size="small"
                        onClick={() => handleEditModule(module)}
                        aria-label="edit"
                        sx={{
                          color: 'secondary.main',
                          '&:hover': { backgroundColor: 'secondary.light' }
                        }}
                      >
                        <Edit />
                      </IconButton>
                    )}
                    {canDelete && (
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteModule(module.test_id)}
                        aria-label="delete"
                        sx={{
                          color: 'error.main',
                          '&:hover': { backgroundColor: 'error.lighter' }
                        }}
                      >
                        <Trash />
                      </IconButton>
                    )}
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredmodules.length === 0 && (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              mt: 4,
              borderRadius: 3,
              backgroundColor: 'grey.50'
            }}
          >
            <Assignment sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.7 }} />
            <Typography variant="h5" gutterBottom color="text.secondary">
              No Assessment Modules Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
              Create your first assessment module to organize questions and tests for your courses.
            </Typography>
          </Paper>
        )}
      </MainCard>

      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle
            sx={{
              fontWeight: 600,
              py: 2,
              mb: 2
            }}
          >
            {editingModule ? 'Edit Assessment Module' : 'Create New Assessment Module'}
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel sx={{ fontWeight: 600 }}>Module Title *</FormLabel>
                  <TextField
                    autoFocus
                    name="test_name"
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={formik.values.test_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.test_name && Boolean(formik.errors.test_name)}
                    helperText={formik.touched.test_name && formik.errors.test_name}
                    placeholder="Enter module title"
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel sx={{ fontWeight: 600 }}>Course *</FormLabel>
                  <Autocomplete
                    id="course_id"
                    options={courses || []}
                    getOptionLabel={(option) => option.course_name}
                    value={courses?.find((course) => course.course_id === formik.values.course_id) || null}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('course_id', newValue ? newValue.course_id : '');
                    }}
                    onBlur={formik.handleBlur}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="course_id"
                        placeholder="Select a course..."
                        size="small"
                        error={formik.touched.course_id && Boolean(formik.errors.course_id)}
                        helperText={formik.touched.course_id && formik.errors.course_id}
                      />
                    )}
                    filterOptions={(options = [], state) => {
                      return options.filter((option) => option.course_name.toLowerCase().includes(state.inputValue.toLowerCase()));
                    }}
                    isOptionEqualToValue={(option, value) => option.course_id === value.course_id}
                    renderOption={(props, option) => (
                      <li {...props} key={option.course_id}>
                        {option.course_name}
                      </li>
                    )}
                    noOptionsText="No courses found"
                    loadingText="Loading..."
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel sx={{ fontWeight: 600 }}>Total Marks *</FormLabel>
                  <TextField
                    name="total_marks"
                    fullWidth
                    type="number"
                    variant="outlined"
                    size="small"
                    value={formik.values.total_marks}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.total_marks && Boolean(formik.errors.total_marks)}
                    helperText={formik.touched.total_marks && formik.errors.total_marks}
                    inputProps={{ min: 1 }}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <FormLabel sx={{ fontWeight: 600 }}>Description</FormLabel>
                  <TextField
                    name="description"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={3}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                    placeholder="Describe the purpose of this assessment module..."
                  />
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleDialogClose} sx={{ borderRadius: 1 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting} sx={{ borderRadius: 1, px: 3 }}>
              {editingModule ? 'Save Changes' : 'Create Module'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default AssessmentList;
