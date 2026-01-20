import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  // Avatar,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Box,
  Grid,
  Container,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  // Autocomplete,
  FormControl,
  // InputLabel,
  // Select,
  // MenuItem,
  FormHelperText,
  Switch,
  Autocomplete,
  FormLabel,
  InputAdornment,
  Select,
  MenuItem,
  CardActions,
  Paper
  // useTheme
  // FormControlLabel
} from '@mui/material';
import { Add, Edit, People, Calendar, Building, CloseSquare, Trash, SearchNormal1, Eye, User } from 'iconsax-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { APP_PATH_BASE_URL } from 'config';
import Swal from 'sweetalert2';
// import { formatDateforInput } from 'utils/formatDateForInput';
import { formatDate } from 'utils/formatDate';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axiosInstance from 'utils/axios';
import { formatDateTime } from 'utils/dateUtils';
import MainCard from 'components/MainCard';
import useDate from '../../config';
import { usePermission } from 'hooks/usePermission';
import { Capitalise } from 'utils/capitalise';
import { useLocation } from 'react-router';

const BatchManagement = () => {
  // const theme = useTheme();
  const { checkPermission } = usePermission();

  const location = useLocation();
  const { N_UserId, N_UserType } = location.state || {};

  const canCreate = checkPermission('Batch', 'create');
  const canUpdate = checkPermission('Batch', 'update');
  const canDelete = checkPermission('Batch', 'delete');

  const auth = JSON.parse(localStorage.getItem('auth'));
  // const userId = auth?.user?.employee_id || auth?.user?.user_id;
  const trainer_id = auth.user.trainer_id || auth.user.student_id;
  const userType = auth?.loginType;

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(null);
  const [courses, setCourses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [students, setStudents] = useState([]);
  const [category, setCategory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewSchedulesDialogOpen, setViewSchedulesDialogOpen] = useState(false);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      let batchesRes = null;
      // Fetch all data in parallel
      if (userType === 'admin' || userType === 'super_admin') {
        [batchesRes] = await Promise.all([axiosInstance.get(`api/batches`)]);
      } else if (userType === 'tutor') {
        [batchesRes] = await Promise.all([axiosInstance.get(`api/batches/trainer/${trainer_id}`)]);
      } else {
        [batchesRes] = await Promise.all([axiosInstance.get(`api/batches/student/${trainer_id}`)]);
      }
      setBatches(batchesRes.data.batches || []);
      setCategory(batchesRes.data.active_category || batchesRes.data.categories || []);
      setCourses(batchesRes.data.active_course || batchesRes.data.active_courses || []);
      setTrainers(batchesRes.data.active_trainer || []);
      setStudents(batchesRes.data.active_student || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [userType, trainer_id]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setSelectedBatch(null);
  };

  const handleTrainerSelect = (trainer) => {
    setSelectedBatch(null);
    setSelectedTrainer(trainer);
  };

  // Simplified unified filtering logic
  const { filteredCategories, filteredCourses, filteredBatches, filteredStudents, filteredTrainers } = useMemo(() => {
    // Filter batches based on all criteria
    const filteredBatches = batches.filter((batch) => {
      // Search filter
      if (searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch =
          batch.title?.toLowerCase().includes(searchTermLower) ||
          batch.trainer_name?.toLowerCase().includes(searchTermLower) ||
          batch.course_name?.toLowerCase().includes(searchTermLower) ||
          batch.batch_name?.toLowerCase().includes(searchTermLower) ||
          batch.batch_id?.toString().includes(searchTerm) ||
          batch.students?.some((student) => student?.full_name?.toLowerCase().includes(searchTermLower));

        if (!matchesSearch) return false;
      }

      if (N_UserId && N_UserType) {
        if (N_UserType === 'tutor') {
          if (batch.trainer_id !== N_UserId) return false;
        } else if (N_UserType === 'student') {
          const isStudentInBatch = batch.students?.some((student) => student.student_id === N_UserId);
          if (!isStudentInBatch) return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all') {
        const matchesStatus = statusFilter === 'active' ? batch.status : !batch.status;
        if (!matchesStatus) return false;
      }

      // Selection filters - CORRECTED ID COMPARISONS
      if (selectedBatch?.id) {
        // Compare batch IDs directly
        if (batch.id !== selectedBatch.id) return false;
      } else if (selectedCourse?.course_id) {
        // Compare course IDs - ensure same data type (both numbers or both strings)
        const hasCourse = batch.course === selectedCourse.course_id;
        if (!hasCourse) return false;
      } else if (selectedCategory?.category_id) {
        // Compare category IDs - ensure same data type
        const hasCategory = batch.category === selectedCategory.category_id;
        if (!hasCategory) return false;
      }

      // Student filter - filter batches that contain the selected student
      if (selectedStudent?.student_id) {
        const hasStudent = batch.students?.some((student) => student.student_id === selectedStudent.student_id);
        if (!hasStudent) return false;
      }

      // Trainer filter - filter batches assigned to the selected trainer
      if (selectedTrainer?.trainer_id) {
        if (batch.trainer_id !== selectedTrainer.trainer_id) return false;
      }

      return true;
    });

    // Filter categories and courses based on selections only - CORRECTED
    let filteredCategories = category;
    let filteredCourses = courses;
    let filteredStudents = students;
    let filteredTrainers = trainers;

    if (selectedBatch?.id) {
      const selectedBatchData = batches.find((b) => b.id === selectedBatch.id);

      if (selectedBatchData) {
        // Use the batch's category and course IDs to filter
        filteredCategories = category.filter((cat) => cat.category_id === selectedBatchData.category);
        filteredCourses = courses.filter((course) => course.course_id === selectedBatchData.course);
        // Filter students and trainers for this specific batch
        filteredStudents = students.filter((student) =>
          selectedBatchData.students?.some((batchStudent) => batchStudent.student_id === student.student_id)
        );
        filteredTrainers = trainers.filter((trainer) => trainer.trainer_id === selectedBatchData.trainer_id);
      }
    } else if (selectedCourse?.course_id) {
      const selectedCourseData = courses.find((c) => c.course_id === selectedCourse.course_id);

      if (selectedCourseData) {
        filteredCategories = category.filter((cat) => cat.category_id === (selectedCourseData.category_id || selectedCourseData.category));
        // Show only the selected course
        filteredCourses = courses.filter((course) => course.course_id === selectedCourse.course_id);

        filteredStudents = students.filter((student) =>
          filteredBatches.some(
            (batch) =>
              batch.course === selectedCourse.course_id &&
              batch.students?.some((batchStudent) => batchStudent.student_id === student.student_id)
          )
        );

        filteredTrainers = trainers.filter((trainer) =>
          filteredBatches.some((batch) => batch.course === selectedCourse.course_id && batch.trainer_id === trainer.trainer_id)
        );
      }
    } else if (selectedCategory?.category_id) {
      filteredCategories = category.filter((cat) => cat.category_id === selectedCategory.category_id);
      filteredCourses = courses.filter((course) => (course.category_id || course.course_category_id) === selectedCategory.category_id);

      // Filter students and trainers for batches in this category
      filteredStudents = students.filter((student) =>
        filteredBatches.some(
          (batch) =>
            batch.category === selectedCategory.category_id &&
            batch.students?.some((batchStudent) => batchStudent.student_id === student.student_id)
        )
      );

      filteredTrainers = trainers.filter((trainer) =>
        filteredBatches.some((batch) => batch.category === selectedCategory.category_id && batch.trainer_id === trainer.trainer_id)
      );
    } else if (selectedStudent?.student_id) {
      // Filter based on selected student
      const studentBatches = filteredBatches.filter((batch) =>
        batch.students?.some((student) => student.student_id === selectedStudent.student_id)
      );

      // Get unique categories and courses from student's batches
      const studentCategories = [...new Set(studentBatches.map((batch) => batch.category))];
      const studentCourses = [...new Set(studentBatches.map((batch) => batch.course))];

      filteredCategories = category.filter((cat) => studentCategories.includes(cat.category_id));
      filteredCourses = courses.filter((course) => studentCourses.includes(course.course_id));
      filteredTrainers = trainers.filter((trainer) => studentBatches.some((batch) => batch.trainer_id === trainer.trainer_id));
    } else if (selectedTrainer?.trainer_id) {
      // Filter based on selected trainer
      const trainerBatches = filteredBatches.filter((batch) => batch.trainer_id === selectedTrainer.trainer_id);

      // Get unique categories and courses from trainer's batches
      const trainerCategories = [...new Set(trainerBatches.map((batch) => batch.category))];
      const trainerCourses = [...new Set(trainerBatches.map((batch) => batch.course))];

      filteredCategories = category.filter((cat) => trainerCategories.includes(cat.category_id));
      filteredCourses = courses.filter((course) => trainerCourses.includes(course.course_id));
      filteredStudents = students.filter((student) =>
        trainerBatches.some((batch) => batch.students?.some((batchStudent) => batchStudent.student_id === student.student_id))
      );
    }

    return {
      filteredCategories,
      filteredCourses,
      filteredBatches,
      filteredStudents,
      filteredTrainers
    };
  }, [
    category,
    courses,
    batches,
    students,
    trainers,
    selectedCategory,
    selectedCourse,
    selectedStudent,
    selectedTrainer,
    selectedBatch,
    searchTerm,
    statusFilter,
    N_UserId,
    N_UserType
  ]);

  // Form validation schema
  const validationSchema = Yup.object().shape({
    title: Yup.string()
      .required('Batch title is required')
      .test('non-empty', 'Batch title cannot be empty', (value) => {
        return value && value.trim().length > 0;
      }),
    slots: Yup.number().required('Number of slots is required').min(1, 'Slots must be at least 1').integer('Slots must be a whole number'),
    start_date: Yup.string().required('Start date is required'),
    end_date: Yup.string()
      .required('End date is required')
      .test('end-date-after-start', 'End date must be after start date', function (value) {
        const { start_date } = this.parent;
        if (!start_date || !value) return true;
        return new Date(value) >= new Date(start_date);
      }),
    start_time: Yup.string().required('Start time is required'),
    end_time: Yup.string()
      .required('End time is required')
      .test('end-time-after-start', 'End time must be after start time', function (value) {
        const { start_time, start_date, end_date } = this.parent;

        if (!start_time || !value) return true;

        // If same date, check times
        if (start_date === end_date) {
          return value > start_time;
        }

        return true;
      }),
    course_id: Yup.number().required('Course is required'),
    trainer: Yup.string().required('Trainer is required'),
    students: Yup.array()
      .of(Yup.number())
      .test('students-within-slots', 'Number of students cannot exceed available slots', function (value) {
        const { slots } = this.parent;
        if (!value || !slots) return true;
        return value.length <= slots;
      })
  });

  const formik = useFormik({
    initialValues: {
      title: '',
      slots: '',
      start_date: '',
      end_date: '',
      start_time: '',
      end_time: '',
      course_id: '',
      trainer: '',
      students: []
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        const startTimeWithSeconds = values.start_time ? `${values.start_time}:00` : '';
        const endTimeWithSeconds = values.end_time ? `${values.end_time}:00` : '';

        // Prepare the data in the required format

        if (currentBatch) {
          // Update existing batch
          const res = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/batches/${currentBatch.id}`, {
            title: values.title,
            slots: values.slots,
            start_date: formatDate(values.start_date),
            end_date: formatDate(values.end_date),
            start_time: startTimeWithSeconds,
            end_time: endTimeWithSeconds,
            course: values.course_id,
            trainer: values.trainer,
            students: values.students
          });
          if (res.data.success === false) {
            await Swal.fire({
              title: 'Error!',
              text: res.data.message,
              icon: 'error',
              showConfirmButton: true,
              confirmButtonText: 'OK'
            });
          } else {
            // Show success message for update
            await Swal.fire({
              title: 'Success!',
              text: res.data.message,
              icon: 'success',
              showConfirmButton: true,
              confirmButtonText: 'OK'
            });
          }
        } else {
          // Add new batch
          const res = await axiosInstance.post(`${APP_PATH_BASE_URL}api/batches`, {
            title: values.title,
            slots: values.slots,
            start_date: formatDate(values.start_date),
            end_date: formatDate(values.end_date),
            start_time: startTimeWithSeconds,
            end_time: endTimeWithSeconds,
            course: values.course_id,
            trainer: values.trainer,
            students: values.students
          });
          if (res.data.success === true) {
            // Show success message for create
            await Swal.fire({
              title: 'Success!',
              text: res.data.message,
              icon: 'success',
              showConfirmButton: true,
              confirmButtonText: 'OK'
            });
          } else {
            await Swal.fire({
              title: 'Error!',
              text: res.data.message,
              icon: 'error',
              showConfirmButton: true,
              confirmButtonText: 'OK'
            });
          }
        }
        fetchAllData();
        handleCloseDialog();
      } catch (err) {
        console.error('Error saving batch:', err);

        // Show error message
        await Swal.fire({
          title: 'Error!',
          text: err.response?.data?.message || err.message || 'Failed to save batch',
          icon: 'error'
        });

        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  });

  const handleView = (batch) => {
    setCurrentBatch(batch);
    setViewDialogOpen(true);
  };

  const handleViewSchedules = (batch) => {
    setCurrentBatch(batch);
    setViewSchedulesDialogOpen(true);
  };

  const handleStatusChange = async (batch, status) => {
    try {
      const newStatus = status; // Toggle status (true -> false, false -> true)
      const actionText = newStatus ? 'activate' : 'deactivate';

      const result = await Swal.fire({
        title: `${newStatus ? 'Activate' : 'Deactivate'} Batch`,
        text: `Are you sure you want to ${actionText} this batch?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      });

      // If user cancels, return early
      if (!result.isConfirmed) return;

      setLoading(true);
      const res = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/batches/${batch.id}`, {
        status
      });
      if (res.data.success === false) {
        await Swal.fire({
          title: 'Error!',
          text: res.data.message,
          icon: 'error',
          showConfirmButton: true,
          confirmButtonText: 'OK'
        });
        return;
      }
      // Update state
      setBatches(batches.map((b) => (b.batch_id === batch.batch_id ? { ...b, status: newStatus } : b)));

      Swal.fire({
        title: 'Success',
        text: `Batch has been ${actionText}d successfully!`,
        icon: 'success',
        showConfirmButton: true
      });
    } catch (err) {
      console.error('Error changing status:', err);
      setError(err.message);
      Swal.fire('Error', 'Failed to change status. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (batch) => {
    setCurrentBatch(batch);
    formik.setValues({
      title: batch.title,
      slots: batch.slots,
      start_time: batch.start_time,
      end_time: batch.end_time,
      start_date: batch.start_date,
      end_date: batch.end_date,
      course_id: batch.course,
      trainer: batch.trainer_id,
      students: batch.students.map((student) => student.student_id)
    });
    setEditDialogOpen(true);
  };

  const handleAdd = () => {
    setCurrentBatch(null);
    formik.resetForm();
    setEditDialogOpen(true);
  };

  const handleDelete = async (batch) => {
    try {
      const result = await Swal.fire({
        title: 'Delete Batch',
        text: 'Are you sure you want to delete this batch?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      });

      // If user cancels, return early
      if (!result.isConfirmed) return;

      setLoading(true);
      const res = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/batches/${batch.id}/archive`);

      if (res.data.success === false) {
        await Swal.fire({
          title: 'Error!',
          text: res.data.message,
          icon: 'error',
          showConfirmButton: true,
          confirmButtonText: 'OK'
        });
        return;
      }
      // Update state
      setBatches(batches.filter((b) => b.id !== batch.id));

      // Show success message
      await Swal.fire({
        title: 'Deleted!',
        text: 'The batch has been deleted successfully.',
        icon: 'success'
      });
    } catch (err) {
      console.error('Error deleting batch:', err);

      // Show error message
      await Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to delete batch',
        icon: 'error'
      });

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setViewDialogOpen(false);
    setEditDialogOpen(false);
    setViewSchedulesDialogOpen(false);
    setCurrentBatch(null);
    formik.resetForm();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleStatusClear = () => {
    setStatusFilter('all');
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography color="error">Error: {error}</Typography>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </Container>
    );
  }

  return (
    <MainCard sx={{ py: 4 }}>
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
              {/* Search Field */}
              <TextField
                size="small"
                variant="outlined"
                placeholder="Search..."
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
                sx={{
                  minWidth: { xs: '100%', sm: 250 },
                  flexGrow: 1
                }}
              />
              {(userType === 'admin' || userType === 'super_admin') && (
                <>
                  {/* Trainer Filter */}
                  <Autocomplete
                    id="trainer_id"
                    options={filteredTrainers || []}
                    getOptionLabel={(option) => option.full_name || ''}
                    value={selectedCategory}
                    onChange={(event, newValue) => {
                      handleTrainerSelect(newValue);
                    }}
                    size="small"
                    sx={{
                      minWidth: { xs: '100%', sm: 180, md: 200 },
                      flex: '1 1 auto'
                    }}
                    className="filter-item"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Filter by trainer..."
                        InputProps={{
                          ...params.InputProps
                        }}
                      />
                    )}
                    filterOptions={(options = [], state) => {
                      return options.filter((option) => option.full_name?.toLowerCase().includes(state.inputValue.toLowerCase()));
                    }}
                    isOptionEqualToValue={(option, value) => option.trainer_id === value.trainer_id}
                    renderOption={(props, option) => (
                      <li {...props} key={option.trainer_id}>
                        {option.full_name}
                      </li>
                    )}
                  />

                  {/* Students Filter */}
                  <Autocomplete
                    id="students_id"
                    options={filteredStudents || []}
                    getOptionLabel={(option) => option.full_name || ''}
                    value={selectedCategory}
                    onChange={(event, newValue) => {
                      handleStudentSelect(newValue);
                    }}
                    size="small"
                    sx={{
                      minWidth: { xs: '100%', sm: 180, md: 200 },
                      flex: '1 1 auto'
                    }}
                    className="filter-item"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Filter by student..."
                        InputProps={{
                          ...params.InputProps
                        }}
                      />
                    )}
                    filterOptions={(options = [], state) => {
                      return options.filter((option) => option.full_name?.toLowerCase().includes(state.inputValue.toLowerCase()));
                    }}
                    isOptionEqualToValue={(option, value) => option.student_id === value.student_id}
                    renderOption={(props, option) => (
                      <li {...props} key={option.student_id}>
                        {option.full_name}
                      </li>
                    )}
                  />

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
                    sx={{
                      minWidth: { xs: '100%', sm: 180, md: 200 },
                      flex: '1 1 auto'
                    }}
                    className="filter-item"
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
                    sx={{
                      minWidth: { xs: '100%', sm: 180, md: 200 },
                      flex: '1 1 auto'
                    }}
                    className="filter-item"
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
                    sx={{
                      minWidth: { xs: '100%', sm: 180, md: 200 },
                      flex: '1 1 auto'
                    }}
                    className="filter-item"
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
              {(userType === 'super_admin' || userType === 'admin') && (
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
                    <MenuItem value="inActive">In active</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <Stack spacing={2} direction="row" justifyContent="flex-end">
            {canCreate && (
              <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
                Add New Batch
              </Button>
            )}
          </Stack>
        </Grid>
      </Grid>

      {filteredBatches.length === 0 ? (
        <Typography variant="body1" textAlign="center" py={4}>
          No batches found. Create a new batch to get started.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredBatches.map((batch) => (
            <Grid item xs={12} sm={6} md={4} key={batch?.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderLeft: '4px solid',
                  borderLeftColor: batch?.status ? 'success.main' : 'error.main',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent onClick={() => handleView(batch)} sx={{ flexGrow: 1, pb: 1 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6">{batch?.title || batch?.batch_name}</Typography>
                    </Box>
                    <Stack direction="row">
                      {canUpdate && (
                        <Tooltip title="Status">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(batch, !batch?.status); // pass the toggled value
                            }}
                            sx={{ mr: 1 }}
                          >
                            <Switch size="medium" checked={batch?.status} color={batch?.status ? 'success' : 'error'} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canUpdate && (
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(batch);
                            }}
                          >
                            <Edit size="20" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canDelete && (
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(batch);
                            }}
                          >
                            <Trash size="20" color="red" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  {/* Batch Information */}
                  <Stack spacing={1.5}>
                    {/* Date */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Calendar size="16" />
                        <Typography variant="body2" color="text.secondary">
                          Start Date
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="500">
                        {formatDateTime(batch?.start_date, { includeTime: false })}
                      </Typography>
                    </Box>

                    {/* Students Count */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <User size="16" />
                        <Typography variant="body2" color="text.secondary">
                          Students
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="500">
                        {batch?.students?.length || 0}
                      </Typography>
                    </Box>

                    {/* Slots Information */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <People size="16" />
                        <Typography variant="body2" color="text.secondary">
                          Available Slots
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="500">
                        {batch?.available_slots || 0} / {batch?.slots || 0}
                      </Typography>
                    </Box>

                    {/* Course Sessions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Building size="16" />
                        <Typography variant="body2" color="text.secondary">
                          Schedules
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="500">
                        {batch?.schedules?.length || 0}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>

                {/* Card Actions */}
                <CardActions sx={{ pt: 0, pb: 2, px: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%'
                    }}
                  >
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleView(batch)}
                        sx={{
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1
                        }}
                      >
                        <Eye size="18" />
                      </IconButton>
                    </Tooltip>

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleViewSchedules(batch)}
                      sx={{
                        minWidth: 'auto',
                        px: 2
                      }}
                    >
                      View Schedules
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* VIEW DIALOG - Read Only */}
      <Dialog open={viewDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight="600">
              Batch Details
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseSquare />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          {currentBatch && (
            <Stack spacing={2}>
              <Grid container spacing={2}>
                {/* Main Details */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                        Batch Information
                      </Typography>
                      <Stack spacing={2}>
                        {/* Course */}
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Course
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {currentBatch.course_name || 'Not assigned'}
                          </Typography>
                        </Box>

                        {/* Trainer */}
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Trainer
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {currentBatch.trainer_name || 'Not assigned'}
                          </Typography>
                        </Box>

                        {/* Date Range */}
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Date Range
                          </Typography>
                          <Typography variant="body1">
                            {formatDateTime(currentBatch.start_date, { includeTime: false })} —{' '}
                            {formatDateTime(currentBatch.end_date, { includeTime: false })}
                          </Typography>
                        </Box>

                        {/* Time Slot */}
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Time Slot
                          </Typography>
                          <Typography variant="body1">
                            {formatDateTime(currentBatch.start_time, { timeOnly: true })} -{' '}
                            {formatDateTime(currentBatch.end_time, { timeOnly: true })}
                          </Typography>
                        </Box>

                        {/* Timestamps */}
                        <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Created
                          </Typography>
                          <Typography variant="body2">
                            {currentBatch.created_at ? formatDateTime(currentBatch.created_at, { includeTime: true }) : '-'}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Weekly Schedule */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent sx={{ p: 1.5 }}>
                      <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                        Weekly Schedule
                      </Typography>
                      <Stack spacing={0.5}>
                        {currentBatch.weekly_schedule?.length > 0 ? (
                          currentBatch.weekly_schedule.map((schedule, idx) => {
                            const day = schedule.split(' ')[0];
                            const timePart = schedule.split(' ').slice(1).join(' ').split(',')[0].split('&')[0].trim();
                            return (
                              <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.98rem' }}>
                                <span>{day}</span>
                                <span style={{ color: 'gray' }}>{timePart}</span>
                              </Box>
                            );
                          })
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No schedule
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              {/* Students List at Bottom */}
              <Paper variant="outlined" sx={{ p: 1.5, maxHeight: 200, overflow: 'auto' }}>
                <Typography variant="subtitle2" fontWeight="600" mb={1}>
                  Students ({currentBatch.students?.length || 0})
                </Typography>
                <Grid container spacing={1}>
                  {currentBatch.students?.length > 0 ? (
                    currentBatch.students.map((student, idx) => (
                      <Grid item xs={6} key={idx}>
                        <Box
                          sx={{
                            p: 1,
                            border: '1px solid #eee',
                            borderRadius: 1,
                            backgroundColor: '#fafafa'
                          }}
                        >
                          <Typography variant="body2" fontWeight="500">
                            {Capitalise(student.full_name) || 'Unknown Student'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {student.registration_id}
                          </Typography>
                        </Box>
                      </Grid>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                      No students enrolled
                    </Typography>
                  )}
                </Grid>
              </Paper>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Close
          </Button>
          {canUpdate && (
            <Button
              variant="contained"
              onClick={() => {
                handleCloseDialog();
                handleEdit(currentBatch);
              }}
            >
              Edit Batch
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* VIEW Schedule - Read Only */}
      <Dialog open={viewSchedulesDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="div" fontWeight="600">
            Batch Schedule Details
          </Typography>
          <IconButton onClick={handleCloseDialog} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseSquare />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {currentBatch && (
            <>
              {/* Header Section */}
              <Box mb={3}>
                <Typography variant="h5" gutterBottom fontWeight="600">
                  {currentBatch.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Chip label={currentBatch.status ? 'Active' : 'Inactive'} variant="outlined" size="small" />
                  <Typography variant="body2" color="text.secondary">
                    ID: {currentBatch.batch_id}
                  </Typography>
                  {currentBatch.is_archived && <Chip label="Archived" variant="outlined" color="error" size="small" />}
                </Box>
              </Box>

              {/* Course & Trainer Information */}
              {currentBatch.course_trainer_assignments?.[0] && (
                <Box mb={3}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="600">
                    Course & Trainer Information
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Course
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {courses.find((c) => c.course_id === currentBatch.course_trainer_assignments[0].course_id)?.course_name ||
                              'Not assigned'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Trainer
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {currentBatch.course_trainer_assignments[0].trainer_name || 'Not assigned'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {currentBatch.course_trainer_assignments[0].employee_id}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              )}

              {/* Schedules Section */}
              <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight="600">
                  Session Schedules ({currentBatch.schedules?.length || 0})
                </Typography>

                {currentBatch.schedules?.length > 0 ? (
                  <Grid container spacing={2}>
                    {currentBatch.schedules.map((schedule, index) => (
                      <Grid item xs={12} md={6} lg={4} key={index}>
                        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                          {/* Schedule Header */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="body2" fontWeight="600">
                              Session {index + 1}
                            </Typography>
                            <Chip label={schedule?.status || 'Scheduled'} size="small" variant="outlined" />
                          </Box>

                          {/* Schedule Details */}
                          <Stack spacing={2}>
                            {/* Date */}
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Date
                              </Typography>
                              <Typography variant="body2" fontWeight="500">
                                {schedule?.scheduled_date
                                  ? formatDateTime(schedule.scheduled_date, { includeTime: false })
                                  : 'Not scheduled'}
                              </Typography>
                            </Box>

                            {/* Time */}
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Time
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight="500">
                                  {formatDateTime(schedule?.start_time, { timeOnly: true }) || '--:--'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  -
                                </Typography>
                                <Typography variant="body2" fontWeight="500">
                                  {formatDateTime(schedule?.end_time, { timeOnly: true }) || '--:--'}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Additional Information */}
                            {(schedule?.room_number || schedule?.topic) && (
                              <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                                <Stack spacing={1}>
                                  {schedule?.room_number && (
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        Room
                                      </Typography>
                                      <Typography variant="body2">{schedule.room_number}</Typography>
                                    </Box>
                                  )}
                                  {schedule?.topic && (
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        Topic
                                      </Typography>
                                      <Typography variant="body2">{schedule.topic}</Typography>
                                    </Box>
                                  )}
                                </Stack>
                              </Box>
                            )}
                          </Stack>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  /* Empty State */
                  <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Schedules Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      There are no schedules available for this batch.
                    </Typography>
                  </Paper>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Batch Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentBatch ? 'Edit Batch' : 'Add New Batch'}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500]
            }}
          >
            <CloseSquare />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Batch Title */}
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel>Batch Title*</FormLabel>
                  <TextField
                    fullWidth
                    id="title"
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    error={formik.touched.title && Boolean(formik.errors.title)}
                    helperText={formik.touched.title && formik.errors.title}
                    onBlur={formik.handleBlur}
                    placeholder="Enter batch title"
                  />
                </Stack>
              </Grid>

              {/* Batch Slots */}
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel>Slots*</FormLabel>
                  <TextField
                    fullWidth
                    id="slots"
                    name="slots"
                    type="number"
                    value={formik.values.slots}
                    onChange={formik.handleChange}
                    error={formik.touched.slots && Boolean(formik.errors.slots)}
                    helperText={formik.touched.slots && formik.errors.slots}
                    onBlur={formik.handleBlur}
                    placeholder="Enter batch slots"
                    inputProps={{ min: 1 }}
                  />
                </Stack>
              </Grid>

              {/* Start Date */}
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel>Start Date*</FormLabel>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      format={useDate.dateFormat}
                      minDate={new Date()}
                      value={formik.values.start_date ? new Date(formik.values.start_date) : null}
                      onChange={(newValue) => {
                        formik.setFieldValue('start_date', newValue);
                        // Reset end date if it's before start date
                        if (formik.values.end_date && newValue > new Date(formik.values.end_date)) {
                          formik.setFieldValue('end_date', null);
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          name: 'start_date',
                          error: formik.touched.start_date && Boolean(formik.errors.start_date),
                          helperText: formik.touched.start_date && formik.errors.start_date,
                          onBlur: formik.handleBlur,
                          placeholder: 'Select start date'
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Stack>
              </Grid>

              {/* End Date */}
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel>End Date*</FormLabel>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      format={useDate.dateFormat}
                      minDate={formik.values.start_date ? new Date(formik.values.start_date) : new Date()}
                      value={formik.values.end_date ? new Date(formik.values.end_date) : null}
                      onChange={(newValue) => {
                        formik.setFieldValue('end_date', newValue);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          name: 'end_date',
                          error: formik.touched.end_date && Boolean(formik.errors.end_date),
                          helperText: formik.touched.end_date && formik.errors.end_date,
                          onBlur: formik.handleBlur,
                          placeholder: 'Select end date'
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Stack>
              </Grid>

              {/* Start Time */}
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel>Start Time*</FormLabel>
                  <TextField
                    fullWidth
                    type="time"
                    id="start_time"
                    name="start_time"
                    value={formik.values.start_time || ''}
                    onChange={formik.handleChange}
                    error={formik.touched.start_time && Boolean(formik.errors.start_time)}
                    helperText={formik.touched.start_time && formik.errors.start_time}
                    onBlur={formik.handleBlur}
                    InputLabelProps={{
                      shrink: true
                    }}
                    inputProps={{
                      step: 300 // 5 min intervals
                    }}
                  />
                </Stack>
              </Grid>

              {/* End Time */}
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel>End Time*</FormLabel>
                  <TextField
                    fullWidth
                    type="time"
                    id="end_time"
                    name="end_time"
                    value={formik.values.end_time || ''}
                    onChange={formik.handleChange}
                    error={formik.touched.end_time && Boolean(formik.errors.end_time)}
                    helperText={formik.touched.end_time && formik.errors.end_time}
                    onBlur={formik.handleBlur}
                    InputLabelProps={{
                      shrink: true
                    }}
                    inputProps={{
                      step: 300 // 5 min intervals
                    }}
                  />
                </Stack>
              </Grid>

              {/* Course Selection */}
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel>Course*</FormLabel>
                  <Autocomplete
                    options={courses || []}
                    getOptionLabel={(option) => option.course_name}
                    value={courses?.find((course) => course.course_id === formik.values.course_id) || null}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('course_id', newValue ? newValue.course_id : '');
                    }}
                    onBlur={() => formik.setFieldTouched('course_id', true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select course"
                        error={formik.touched.course_id && Boolean(formik.errors.course_id)}
                        helperText={formik.touched.course_id && formik.errors.course_id}
                      />
                    )}
                    filterOptions={(options = [], state) => {
                      return options.filter(
                        (option) =>
                          option.course_name.toLowerCase().includes(state.inputValue.toLowerCase()) ||
                          option.course_id.toString().includes(state.inputValue)
                      );
                    }}
                    isOptionEqualToValue={(option, value) => option.course_id === value.course_id}
                    renderOption={(props, option) => (
                      <li {...props} key={option.course_id}>
                        {option.course_name}
                      </li>
                    )}
                  />
                </Stack>
              </Grid>

              {/* Trainer Selection */}
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel>Trainer*</FormLabel>
                  <Autocomplete
                    options={trainers}
                    getOptionLabel={(option) => `${option.full_name} (${option.employee_id})`}
                    value={trainers.find((trainer) => trainer.trainer_id === formik.values.trainer) || null}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('trainer', newValue ? newValue.trainer_id : '');
                      formik.setFieldValue('employee_id', newValue ? newValue.employee_id : '');
                    }}
                    onBlur={() => {
                      formik.setFieldTouched('trainer', true);
                      formik.setFieldTouched('employee_id', true);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select trainer"
                        error={formik.touched.trainer && Boolean(formik.errors.trainer)}
                        helperText={formik.touched.trainer && formik.errors.trainer}
                      />
                    )}
                    filterOptions={(options, state) => {
                      return options.filter(
                        (option) =>
                          option.full_name.toLowerCase().includes(state.inputValue.toLowerCase()) ||
                          option.employee_id.toString().includes(state.inputValue)
                      );
                    }}
                    isOptionEqualToValue={(option, value) => option.trainer_id === value.trainer_id}
                    renderOption={(props, option) => (
                      <li {...props} key={option.trainer_id}>
                        <Box>
                          <div>{option.full_name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>ID: {option.employee_id}</div>
                        </Box>
                      </li>
                    )}
                  />
                </Stack>
              </Grid>

              {/* Students Multi-select */}
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <FormLabel>Students</FormLabel>
                  <Autocomplete
                    multiple
                    options={students || []}
                    getOptionLabel={(option) => `${option.full_name} (${option.registration_id})`}
                    value={students?.filter((student) => formik.values.students?.includes(student.student_id)) || []}
                    onChange={(event, newValue) => {
                      const studentIds = newValue.map((student) => student.student_id);
                      formik.setFieldValue('students', studentIds);
                    }}
                    onBlur={() => formik.setFieldTouched('students', true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select students"
                        error={formik.touched.students && Boolean(formik.errors.students)}
                        helperText={
                          (formik.touched.students && formik.errors.students) ||
                          `Selected: ${formik.values.students?.length || 0}/${formik.values.slots || 0} slots`
                        }
                      />
                    )}
                    filterOptions={(options = [], state) => {
                      return options.filter(
                        (option) =>
                          option.full_name.toLowerCase().includes(state.inputValue.toLowerCase()) ||
                          option.registration_id.toString().includes(state.inputValue)
                      );
                    }}
                    isOptionEqualToValue={(option, value) => option.student_id === value.student_id}
                    renderOption={(props, option) => (
                      <li {...props} key={option.student_id}>
                        <Box>
                          <div>{option.full_name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>Registration ID: {option.registration_id}</div>
                        </Box>
                      </li>
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip label={option.full_name} {...getTagProps({ index })} size="small" key={option.student_id} />
                      ))
                    }
                  />
                  <FormHelperText>
                    {formik.values.students?.length > 0
                      ? `Selected ${formik.values.students.length} out of ${formik.values.slots || 0} slots`
                      : 'Select students for this batch (optional)'}
                  </FormHelperText>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={formik.submitForm}
            variant="contained"
            disabled={formik.isSubmitting}
            startIcon={formik.isSubmitting ? <CircularProgress size={16} /> : null}
          >
            {formik.isSubmitting ? 'Saving...' : currentBatch ? 'Update Batch' : 'Create Batch'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default BatchManagement;
