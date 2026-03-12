import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Add,
  Edit,
  People,
  Calendar,
  CloseSquare,
  Trash,
  SearchNormal1,
  Eye,
  User,
  Category,
  Book,
  Briefcase,
  Status,
  Clock,
  Book1
} from 'iconsax-react';
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
import {
  Card,
  CardContent,
  Typography,
  Chip,
  // Avatar,
  Stack,
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
  Paper,
  Avatar
} from '@mui/material';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Map } from '@mui/icons-material';

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

  // console.log("batches",batches)

  const handleStatusChange = async (batch, status) => {
    try {
      const newStatus = status; // Toggle status (true -> false, false -> true)
      const actionText = newStatus ? 'activate' : 'deactivate';

      const result = await Swal.fire({
        title: `${newStatus ? 'Activate' : 'Deactivate'} Batch`,
        text: `Are you sure you want to ${actionText} this batch?`,
        icon: 'warning',
        confirmButtonColor: '#D63031',
        cancelButtonColor:'#636E67',
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

      // console.log("res",res)

      // console.log(batch)
      // console.log(batch.batch_id)
      // console.log(batches)
      // // Update state
      // console.log(newStatus,"status now",batch.batch_id)

      // console.log(res.data.data.batch_id)
      setBatches(batches.map((b) => (b.id === res.data.data.batch_id ? { ...b, status: newStatus } : b)));

      let a = batches.map((b) => (b.id === res.data.data.batch_id ? { ...b, status: newStatus } : b));

      console.log('a', a);

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
        confirmButtonColor: '#D63031',
        cancelButtonColor:'#636E67',
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
        confirmButtonColor: '#D63031',
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
    <>
      <MainCard
        sx={{
          py: 4,
          border: 'none',
          boxShadow: '0 20px 40px -10px rgba(106, 27, 154, 0.15)',
          borderRadius: 3
        }}
      >
        <Box sx={{ px: { xs: 2, sm: 3 } }}>
          {/* Filter Bar Container */}
          <Stack spacing={2} sx={{ mb: 3 }}>
            {/* Search and Filters Row */}
            <Box>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{
                  flexWrap: 'wrap',
                  alignItems: 'flex-start'
                }}
              >
                {/* Search Field */}
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Search batches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchNormal1 size={20} color="#9c27b0" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {searchTerm && (
                          <IconButton onClick={handleClearSearch} edge="end" size="small" sx={{ color: '#6a1b9a' }}>
                            <CloseSquare size={20} />
                          </IconButton>
                        )}
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    width: { xs: '100%', sm: 250 },
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

                {/* Filters Container - Horizontal Scroll on Mobile */}
                {(userType === 'admin' || userType === 'super_admin') && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 2,
                      flex: 1,
                      overflowX: 'auto',
                      pb: 1,
                      '&::-webkit-scrollbar': {
                        height: '4px'
                      },
                      '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                        borderRadius: '4px'
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#d1b8e0',
                        borderRadius: '4px'
                      },
                      '& > *': {
                        minWidth: 180
                      }
                    }}
                  >
                    {/* Trainer Filter */}
                    <Autocomplete
                      id="trainer_id"
                      options={filteredTrainers || []}
                      getOptionLabel={(option) => option.full_name || ''}
                      value={selectedTrainer}
                      onChange={(event, newValue) => {
                        handleTrainerSelect(newValue);
                      }}
                      size="small"
                      sx={{
                        minWidth: 180,
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
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Filter by tutor..."
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <InputAdornment position="start">
                                  <User size={18} color="#9c27b0" />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                              </>
                            )
                          }}
                        />
                      )}
                      PaperComponent={(props) => (
                        <Paper {...props} sx={{ borderRadius: 2, boxShadow: '0 10px 30px rgba(106, 27, 154, 0.1)' }} />
                      )}
                      renderOption={(props, option) => (
                        <li {...props} key={option.trainer_id} style={{ padding: '8px 16px' }}>
                          <Box>
                            <Typography fontWeight={500}>{option.full_name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {option.employee_id}
                            </Typography>
                          </Box>
                        </li>
                      )}
                    />

                    {/* Students Filter */}
                    <Autocomplete
                      id="students_id"
                      options={filteredStudents || []}
                      getOptionLabel={(option) => option.full_name || ''}
                      value={selectedStudent}
                      onChange={(event, newValue) => {
                        handleStudentSelect(newValue);
                      }}
                      size="small"
                      sx={{
                        minWidth: 180,
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
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Filter by student..."
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <InputAdornment position="start">
                                  <People size={18} color="#9c27b0" />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                              </>
                            )
                          }}
                        />
                      )}
                      PaperComponent={(props) => (
                        <Paper {...props} sx={{ borderRadius: 2, boxShadow: '0 10px 30px rgba(106, 27, 154, 0.1)' }} />
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
                        minWidth: 180,
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
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Filter by category..."
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <InputAdornment position="start">
                                  <Category size={18} color="#9c27b0" />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                              </>
                            )
                          }}
                        />
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
                        minWidth: 180,
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
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Filter by course..."
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <InputAdornment position="start">
                                  <Book size={18} color="#9c27b0" />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                              </>
                            )
                          }}
                        />
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
                        minWidth: 180,
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
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Filter by batch..."
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <InputAdornment position="start">
                                  <Briefcase size={18} color="#9c27b0" />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                              </>
                            )
                          }}
                        />
                      )}
                    />

                    {/* Status Filter */}
                      <FormControl
                        size="small"
                        sx={{
                          minWidth: 180,
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
                      >
                        <Select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          displayEmpty
                          renderValue={(selected) => {
                            if (selected === 'all') return 'Select Status';
                            return selected === 'active' ? 'Active' : 'Inactive';
                          }}
                          startAdornment={
                            <InputAdornment position="start" sx={{ ml: 1 }}>
                              <Status size={18} color="#9c27b0" />
                            </InputAdornment>
                          }
                          endAdornment={
                            statusFilter !== 'all' && (
                              <InputAdornment position="end" sx={{ mr: 3 }}>
                                <IconButton onClick={handleStatusClear} edge="end" size="small">
                                  <CloseSquare size={16} color="#6a1b9a" />
                                </IconButton>
                              </InputAdornment>
                            )
                          }
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                borderRadius: 2,
                                boxShadow: '0 10px 30px rgba(106, 27, 154, 0.1)',
                                mt: 1
                              }
                            }
                          }}
                        >
                          <MenuItem value="all">All Status</MenuItem>
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="inActive">Inactive</MenuItem>
                        </Select>
                      </FormControl>
                  </Box>
                )}
              </Stack>
            </Box>

            {/* Add Button Row */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              {canCreate && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAdd}
                  sx={{
                    background: 'linear-gradient(135deg, #6a1b9a 0%, #9c27b0 100%)',
                    borderRadius: 3,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    boxShadow: '0 4px 15px rgba(106, 27, 154, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(106, 27, 154, 0.4)'
                    },
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Add New Batch
                </Button>
              )}
            </Box>
          </Stack>
        </Box>

        {/* PrimeReact DataTable */}
        <DataTable
          value={filteredBatches}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 20, 50]}
          dataKey="id"
          emptyMessage="No batches found"
          onRowClick={(e) => handleView(e.data)}
          rowHover
          showGridlines={false}
          stripedRows
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} batches"
          className="modern-datatable"
          paginatorClassName="modern-paginator"
          tableStyle={{ minWidth: '50rem' }}
        >
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
          />

          {/* Batch Name Column */}
          <Column
            header="Batch Name"
            body={(rowData) => (
              <Box>
                <Typography variant="body1" fontWeight="600" color="#4a148c">
                  {rowData?.title || rowData?.batch_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {rowData?.id}
                </Typography>
              </Box>
            )}
            filterPlaceholder="Search by name"
            style={{ minWidth: '200px' }}
          />

          {/* Status Column */}
          <Column
            header="Status"
            body={(rowData) =>
              canUpdate ? (
                <Tooltip title={rowData?.status ? 'Active' : 'Inactive'}>
                  <Switch
                    size="small"
                    checked={rowData?.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleStatusChange(rowData, !rowData?.status);
                    }}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#6a1b9a',
                        '&:hover': {
                          backgroundColor: 'rgba(106, 27, 154, 0.1)'
                        }
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#d1b8e0'
                      }
                    }}
                  />
                </Tooltip>
              ) : (
                <Chip
                  label={rowData?.status ? 'Active' : 'Inactive'}
                  size="small"
                  sx={{
                    backgroundColor: rowData?.status ? '#e8f5e9' : '#ffebee',
                    color: rowData?.status ? '#2e7d32' : '#c62828',
                    fontWeight: 600,
                    borderRadius: 2
                  }}
                />
              )
            }
            filterElement={(options) => (
              <Dropdown
                value={options.value}
                options={[
                  { label: 'Active', value: true },
                  { label: 'Inactive', value: false }
                ]}
                onChange={(e) => options.filterApplyCallback(e.value)}
                placeholder="Select Status"
                className="modern-dropdown"
              />
            )}
            style={{ width: '120px' }}
          />

          {/* Start Date Column */}
          <Column
            header="Start Date"
            body={(rowData) => <Typography variant="body2">{formatDateTime(rowData?.start_date, { includeTime: false })}</Typography>}
            filterType="date"
            dataType="date"
            style={{ minWidth: '150px' }}
          />

          {/* Students Count Column */}
          <Column
            header="Students"
            body={(rowData) => (
              <Typography variant="body2" fontWeight={500}>
                {rowData?.students?.length || 0}
              </Typography>
            )}
          />

          {/* Available Slots Column */}
          <Column
            header="Available Slots"
            body={(rowData) => (
              <Typography variant="body2" fontWeight={500}>
                {rowData?.available_slots || 0}
              </Typography>
            )}
          />

          {/* Schedules Count Column */}
          <Column
            header="Schedules"
            body={(rowData) => (
              <Typography variant="body2" fontWeight={500}>
                {rowData?.schedules?.length || 0}
              </Typography>
            )}
            style={{ width: '120px' }}
          />

          {/* Actions Column */}
          <Column
            header="Actions"
            body={(rowData) => (
              <Stack direction="row" spacing={1} >
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(rowData);
                    }}
                    sx={{
                      border: 1,
                      borderColor: '#d1b8e0',
                      borderRadius: 2,
                      color: '#6a1b9a',
                      '&:hover': {
                        backgroundColor: '#f3e5f5',
                        borderColor: '#6a1b9a'
                      }
                    }}
                  >
                    <Eye size={18} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="View Schedules">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewSchedules(rowData);
                    }}
                    sx={{
                      border: 1,
                      borderColor: '#d1b8e0',
                      borderRadius: 2,
                      color: '#9c27b0',
                      '&:hover': {
                        backgroundColor: '#f3e5f5',
                        borderColor: '#6a1b9a'
                      }
                    }}
                  >
                    <Calendar size={18} />
                  </IconButton>
                </Tooltip>

                {canUpdate && (
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(rowData);
                      }}
                      sx={{
                        border: 1,
                        borderColor: '#d1b8e0',
                        borderRadius: 2,
                        color: '#1976d2',
                        '&:hover': {
                          backgroundColor: '#e3f2fd',
                          borderColor: '#1976d2'
                        }
                      }}
                    >
                      <Edit size={18} />
                    </IconButton>
                  </Tooltip>
                )}

                {canDelete && (
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(rowData);
                      }}
                      sx={{
                        border: 1,
                        borderColor: '#d1b8e0',
                        borderRadius: 2,
                        color: '#d32f2f',
                        '&:hover': {
                          backgroundColor: '#ffebee',
                          borderColor: '#d32f2f'
                        }
                      }}
                    >
                      <Trash size={18} />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            )}
            bodyStyle={{ textAlign: 'right' }}
            style={{ width: '200px' }}
          />
        </DataTable>

        {/* View Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              background: '#ffffff'
            }
          }}
        >
          <DialogTitle
            sx={{
              p: 3.5,
              background: 'linear-gradient(115deg, #0A0F1C 0%, #1A1F2E 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" fontWeight="700" letterSpacing="-0.02em" color="#ffffff">
                  Batch Details
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  View complete batch information
                </Typography>
              </Box>
              <IconButton
                onClick={handleCloseDialog}
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  '&:hover': {
                    color: '#ffffff',
                    backgroundColor: 'rgba(255,255,255,0.05)'
                  }
                }}
              >
                <CloseSquare />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 4, backgroundColor: '#F8FAFE' }}>
            {currentBatch && (
              <Stack spacing={4}>
                <Grid container spacing={3.5}>
                  {/* Main Details */}
                  <Grid item xs={12} md={6}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        border: '1px solid #E9EDF4',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                        backgroundColor: '#ffffff',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                          borderColor: '#D0D7E5'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3.5 }}>
                        <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: 'linear-gradient(115deg, #3B82F6, #8B5CF6)',
                              boxShadow: '0 0 0 2px rgba(59,130,246,0.1)'
                            }}
                          />
                          <Typography variant="subtitle1" fontWeight="700" color="#0A0F1C" letterSpacing="-0.01em">
                            Batch Information
                          </Typography>
                        </Box>
                        <Stack spacing={3}>
                          {/* Course */}
                          <Box>
                            <Typography
                              variant="caption"
                              color="#6B7280"
                              display="block"
                              gutterBottom
                              fontWeight="500"
                              sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
                            >
                              Course
                            </Typography>
                            <Typography variant="body1" fontWeight="600" color="#0A0F1C">
                              {currentBatch.course_name || 'Not assigned'}
                            </Typography>
                          </Box>

                          {/* Trainer */}
                          <Box>
                            <Typography
                              variant="caption"
                              color="#6B7280"
                              display="block"
                              gutterBottom
                              fontWeight="500"
                              sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
                            >
                              Tutor
                            </Typography>
                            <Typography variant="body1" fontWeight="600" color="#0A0F1C">
                              {currentBatch.trainer_name || 'Not assigned'}
                            </Typography>
                          </Box>

                          {/* Date Range */}
                          <Box>
                            <Typography
                              variant="caption"
                              color="#6B7280"
                              display="block"
                              gutterBottom
                              fontWeight="500"
                              sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
                            >
                              Date Range
                            </Typography>
                            <Typography variant="body2" fontWeight="500" color="#1F2937">
                              {formatDateTime(currentBatch.start_date, { includeTime: false })} —{' '}
                              {formatDateTime(currentBatch.end_date, { includeTime: false })}
                            </Typography>
                          </Box>

                          {/* Time Slot */}
                          <Box>
                            <Typography
                              variant="caption"
                              color="#6B7280"
                              display="block"
                              gutterBottom
                              fontWeight="500"
                              sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
                            >
                              Time Slot
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box
                                sx={{
                                  px: 1.5,
                                  py: 0.5,
                                  backgroundColor: '#EFF6FF',
                                  borderRadius: 1.5,
                                  border: '1px solid #DBEAFE'
                                }}
                              >
                                <Typography variant="body2" fontWeight="600" color="#3B82F6">
                                  {formatDateTime(currentBatch.start_time, { timeOnly: true })}
                                </Typography>
                              </Box>
                              <Typography color="#6B7280">—</Typography>
                              <Box
                                sx={{
                                  px: 1.5,
                                  py: 0.5,
                                  backgroundColor: '#EFF6FF',
                                  borderRadius: 1.5,
                                  border: '1px solid #DBEAFE'
                                }}
                              >
                                <Typography variant="body2" fontWeight="600" color="#3B82F6">
                                  {formatDateTime(currentBatch.end_time, { timeOnly: true })}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          {/* Timestamps */}
                          <Box sx={{ pt: 2, borderTop: '1px solid #E9EDF4' }}>
                            <Typography
                              variant="caption"
                              color="#6B7280"
                              display="block"
                              gutterBottom
                              fontWeight="500"
                              sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
                            >
                              Created
                            </Typography>
                            <Typography variant="body2" color="#1F2937">
                              {currentBatch.created_at ? formatDateTime(currentBatch.created_at, { includeTime: true }) : '-'}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Weekly Schedule */}
                  <Grid item xs={12} md={6}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        border: '1px solid #E9EDF4',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                        backgroundColor: '#ffffff',
                        height: '100%',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                          borderColor: '#D0D7E5'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3.5 }}>
                        <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: 'linear-gradient(115deg, #3B82F6, #8B5CF6)',
                              boxShadow: '0 0 0 2px rgba(59,130,246,0.1)'
                            }}
                          />
                          <Typography variant="subtitle1" fontWeight="700" color="#0A0F1C" letterSpacing="-0.01em">
                            Weekly Schedule
                          </Typography>
                        </Box>
                        <Stack spacing={1.5}>
                          {currentBatch.weekly_schedule?.length > 0 ? (
                            currentBatch.weekly_schedule.map((schedule, idx) => {
                              const day = schedule.split(' ')[0];
                              const timePart = schedule.split(' ').slice(1).join(' ').split(',')[0].split('&')[0].trim();
                              return (
                                <Box
                                  key={idx}
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 2,
                                    backgroundColor: idx % 2 === 0 ? '#F8FAFE' : '#ffffff',
                                    borderRadius: 2,
                                    border: '1px solid #E9EDF4',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      borderColor: '#3B82F6',
                                      boxShadow: '0 4px 12px rgba(59,130,246,0.1)'
                                    }
                                  }}
                                >
                                  <Typography fontWeight="600" color="#1F2937">
                                    {day}
                                  </Typography>
                                  <Typography color="#3B82F6" fontWeight="500">
                                    {timePart}
                                  </Typography>
                                </Box>
                              );
                            })
                          ) : (
                            <Box sx={{ textAlign: 'center', py: 6, backgroundColor: '#F8FAFE', borderRadius: 3 }}>
                              <Box
                                sx={{
                                  width: 64,
                                  height: 64,
                                  borderRadius: '50%',
                                  backgroundColor: '#EFF6FF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  margin: '0 auto 16px'
                                }}
                              >
                                <Calendar size={28} color="#3B82F6" />
                              </Box>
                              <Typography variant="body1" fontWeight="600" color="#1F2937" mb={1}>
                                No schedule yet
                              </Typography>
                              <Typography variant="body2" color="#6B7280">
                                Weekly schedule hasn&apos;t been set up
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Students List */}
                <Paper
                  sx={{
                    p: 3.5,
                    borderRadius: 3,
                    border: '1px solid #E9EDF4',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: 'linear-gradient(115deg, #3B82F6, #8B5CF6)',
                          boxShadow: '0 0 0 2px rgba(59,130,246,0.1)'
                        }}
                      />
                      <Typography variant="subtitle1" fontWeight="700" color="#0A0F1C" letterSpacing="-0.01em">
                        Enrolled Students ({currentBatch.students?.length || 0})
                      </Typography>
                    </Box>
                    {currentBatch.students?.length > 0 && (
                      <Chip
                        label={`${currentBatch.students.length} students`}
                        size="small"
                        sx={{
                          backgroundColor: '#EFF6FF',
                          color: '#3B82F6',
                          fontWeight: 600,
                          borderRadius: 1.5,
                          fontSize: '0.75rem'
                        }}
                      />
                    )}
                  </Box>
                  <Grid container spacing={2}>
                    {currentBatch.students?.length > 0 ? (
                      currentBatch.students.map((student, idx) => (
                        <Grid item xs={12} sm={6} md={4} key={idx}>
                          <Box
                            sx={{
                              p: 2.5,
                              border: '1px solid #E9EDF4',
                              borderRadius: 2.5,
                              backgroundColor: '#F8FAFE',
                              transition: 'all 0.2s ease',
                              cursor: 'pointer',
                              '&:hover': {
                                borderColor: '#3B82F6',
                                boxShadow: '0 8px 20px rgba(59,130,246,0.15)',
                                transform: 'translateY(-2px)',
                                backgroundColor: '#ffffff'
                              }
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: '#EFF6FF',
                                  color: '#3B82F6',
                                  fontWeight: 600,
                                  fontSize: '1rem',
                                  border: '2px solid #ffffff',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                }}
                              >
                                {student.full_name?.charAt(0) || '?'}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="600" color="#0A0F1C">
                                  {Capitalise(student.full_name) || 'Unknown Student'}
                                </Typography>
                                <Typography variant="caption" color="#6B7280">
                                  ID: {student.registration_id}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                      ))
                    ) : (
                      <Grid item xs={12}>
                        <Box sx={{ textAlign: 'center', py: 8, backgroundColor: '#F8FAFE', borderRadius: 3 }}>
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: '50%',
                              backgroundColor: '#EFF6FF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 20px'
                            }}
                          >
                            <People size={36} color="#3B82F6" />
                          </Box>
                          <Typography variant="h6" fontWeight="700" color="#0A0F1C" mb={1}>
                            No students enrolled
                          </Typography>
                          <Typography variant="body2" color="#6B7280">
                            This batch doesnt have any students yet
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3.5, backgroundColor: '#ffffff', borderTop: '1px solid #E9EDF4' }}>
            <Button
              onClick={handleCloseDialog}
              variant="text"
              sx={{
                color: '#6B7280',
                borderRadius: 2,
                px: 4,
                py: 1.2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: '#F8FAFE',
                  color: '#0A0F1C'
                }
              }}
            >
              Close
            </Button>
            {canUpdate && (
              <Button
                variant="contained"
                onClick={() => {
                  handleCloseDialog();
                  handleEdit(currentBatch);
                }}
                sx={{
                  background: 'linear-gradient(115deg, #3B82F6, #8B5CF6)',
                  borderRadius: 2,
                  px: 5,
                  py: 1.2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  boxShadow: '0 8px 16px -4px rgba(59,130,246,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(115deg, #2563EB, #7C3AED)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 12px 24px -6px rgba(59,130,246,0.4)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Edit Batch
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Schedule View Dialog */}
        <Dialog
          open={viewSchedulesDialogOpen}
          onClose={handleCloseDialog}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              background: '#ffffff'
            }
          }}
        >
          <DialogTitle
            sx={{
              p: 3.5,
              background: 'linear-gradient(115deg, #0A0F1C 0%, #1A1F2E 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" fontWeight="700" letterSpacing="-0.02em" color="#ffffff">
                  Batch Schedule Details
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  View all session schedules
                </Typography>
              </Box>
              <IconButton
                onClick={handleCloseDialog}
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  '&:hover': {
                    color: '#ffffff',
                    backgroundColor: 'rgba(255,255,255,0.05)'
                  }
                }}
              >
                <CloseSquare />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 4, backgroundColor: '#F8FAFE' }}>
            {currentBatch && (
              <Stack spacing={4}>
                {/* Header Section */}
                <Paper
                  sx={{
                    p: 3.5,
                    borderRadius: 3,
                    border: '1px solid #E9EDF4',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                  }}
                >
                  <Typography variant="h5" gutterBottom fontWeight="700" color="#0A0F1C" letterSpacing="-0.02em">
                    {currentBatch.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={currentBatch.status ? 'Active' : 'Inactive'}
                      sx={{
                        backgroundColor: currentBatch.status ? '#EFF6FF' : '#FEE2E2',
                        color: currentBatch.status ? '#3B82F6' : '#EF4444',
                        fontWeight: 600,
                        borderRadius: 1.5,
                        fontSize: '0.75rem',
                        border: 'none'
                      }}
                      size="small"
                    />
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#D1D5DB' }} />
                      <Typography variant="body2" color="#6B7280" fontWeight="500">
                        ID: {currentBatch.batch_id}
                      </Typography>
                    </Box>
                    {currentBatch.is_archived && (
                      <>
                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#D1D5DB' }} />
                        <Chip
                          label="Archived"
                          sx={{
                            backgroundColor: '#FEE2E2',
                            color: '#EF4444',
                            fontWeight: 600,
                            borderRadius: 1.5,
                            fontSize: '0.75rem',
                            border: 'none'
                          }}
                          size="small"
                        />
                      </>
                    )}
                  </Box>
                </Paper>

                {/* Course & Trainer Information */}
                {currentBatch.course_trainer_assignments?.[0] && (
                  <Paper
                    sx={{
                      p: 3.5,
                      borderRadius: 3,
                      border: '1px solid #E9EDF4',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: 'linear-gradient(115deg, #3B82F6, #8B5CF6)',
                          boxShadow: '0 0 0 2px rgba(59,130,246,0.1)'
                        }}
                      />
                      <Typography variant="subtitle1" fontWeight="700" color="#0A0F1C" letterSpacing="-0.01em">
                        Course & Tutor Information
                      </Typography>
                    </Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Box
                          sx={{
                            p: 2.5,
                            backgroundColor: '#F8FAFE',
                            borderRadius: 2.5,
                            border: '1px solid #E9EDF4',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: '#3B82F6',
                              backgroundColor: '#ffffff'
                            }
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="#6B7280"
                            display="block"
                            gutterBottom
                            fontWeight="500"
                            sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
                          >
                            Course
                          </Typography>
                          <Typography variant="body1" fontWeight="600" color="#0A0F1C">
                            {courses.find((c) => c.course_id === currentBatch.course_trainer_assignments[0].course_id)?.course_name ||
                              'Not assigned'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box
                          sx={{
                            p: 2.5,
                            backgroundColor: '#F8FAFE',
                            borderRadius: 2.5,
                            border: '1px solid #E9EDF4',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: '#3B82F6',
                              backgroundColor: '#ffffff'
                            }
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="#6B7280"
                            display="block"
                            gutterBottom
                            fontWeight="500"
                            sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
                          >
                            Tutor
                          </Typography>
                          <Typography variant="body1" fontWeight="600" color="#0A0F1C">
                            {currentBatch.course_trainer_assignments[0].trainer_name || 'Not assigned'}
                          </Typography>
                          <Typography variant="caption" color="#6B7280">
                            ID: {currentBatch.course_trainer_assignments[0].employee_id}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                {/* Schedules Section */}
                <Box>
                  <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'linear-gradient(115deg, #3B82F6, #8B5CF6)',
                        boxShadow: '0 0 0 2px rgba(59,130,246,0.1)'
                      }}
                    />
                    <Typography variant="subtitle1" fontWeight="700" color="#0A0F1C" letterSpacing="-0.01em">
                      Session Schedules ({currentBatch.schedules?.length || 0})
                    </Typography>
                  </Box>

                  {currentBatch.schedules?.length > 0 ? (
                    <Grid container spacing={2.5}>
                      {currentBatch.schedules.map((schedule, index) => (
                        <Grid item xs={12} md={6} lg={4} key={index}>
                          <Paper
                            sx={{
                              p: 3,
                              borderRadius: 3,
                              border: '1px solid #E9EDF4',
                              backgroundColor: '#ffffff',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                              transition: 'all 0.2s ease',
                              height: '100%',
                              '&:hover': {
                                borderColor: '#3B82F6',
                                boxShadow: '0 12px 28px -8px rgba(59,130,246,0.2)',
                                transform: 'translateY(-2px)'
                              }
                            }}
                          >
                            {/* Schedule Header */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Box
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 1.5,
                                    backgroundColor: '#EFF6FF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <Typography variant="caption" fontWeight="700" color="#3B82F6">
                                    {index + 1}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" fontWeight="600" color="#0A0F1C">
                                  Session {index + 1}
                                </Typography>
                              </Box>
                              <Chip
                                label={schedule?.status || 'Scheduled'}
                                size="small"
                                sx={{
                                  backgroundColor: '#F3F4F6',
                                  color: '#4B5563',
                                  fontWeight: 500,
                                  borderRadius: 1.5,
                                  fontSize: '0.7rem',
                                  border: 'none'
                                }}
                              />
                            </Box>

                            {/* Schedule Details */}
                            <Stack spacing={2.5}>
                              {/* Date */}
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="#6B7280"
                                  display="block"
                                  gutterBottom
                                  fontWeight="500"
                                  sx={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.65rem' }}
                                >
                                  Date
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1.5}>
                                  <Box sx={{ color: '#6B7280' }}>
                                    <Calendar size={16} />
                                  </Box>
                                  <Typography variant="body2" fontWeight="500" color="#1F2937">
                                    {schedule?.scheduled_date
                                      ? formatDateTime(schedule.scheduled_date, { includeTime: false })
                                      : 'Not scheduled'}
                                  </Typography>
                                </Box>
                              </Box>

                              {/* Time */}
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="#6B7280"
                                  display="block"
                                  gutterBottom
                                  fontWeight="500"
                                  sx={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.65rem' }}
                                >
                                  Time
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1.5}>
                                  <Box sx={{ color: '#6B7280' }}>
                                    <Clock size={16} />
                                  </Box>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Box
                                      sx={{
                                        px: 1.5,
                                        py: 0.5,
                                        backgroundColor: '#EFF6FF',
                                        borderRadius: 1.5,
                                        border: '1px solid #DBEAFE'
                                      }}
                                    >
                                      <Typography variant="caption" fontWeight="600" color="#3B82F6">
                                        {formatDateTime(schedule?.start_time, { timeOnly: true }) || '--:--'}
                                      </Typography>
                                    </Box>
                                    <Typography variant="caption" color="#6B7280">
                                      —
                                    </Typography>
                                    <Box
                                      sx={{
                                        px: 1.5,
                                        py: 0.5,
                                        backgroundColor: '#EFF6FF',
                                        borderRadius: 1.5,
                                        border: '1px solid #DBEAFE'
                                      }}
                                    >
                                      <Typography variant="caption" fontWeight="600" color="#3B82F6">
                                        {formatDateTime(schedule?.end_time, { timeOnly: true }) || '--:--'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>

                              {/* Additional Information */}
                              {(schedule?.room_number || schedule?.topic) && (
                                <Box sx={{ pt: 2, borderTop: '1px dashed #E9EDF4' }}>
                                  <Stack spacing={1.5}>
                                    {schedule?.room_number && (
                                      <Box display="flex" alignItems="center" gap={1.5}>
                                        <Box sx={{ color: '#6B7280' }}>
                                          <Map size={14} />
                                        </Box>
                                        <Typography variant="body2" color="#1F2937">
                                          Room {schedule.room_number}
                                        </Typography>
                                      </Box>
                                    )}
                                    {schedule?.topic && (
                                      <Box display="flex" alignItems="center" gap={1.5}>
                                        <Box sx={{ color: '#6B7280' }}>
                                          <Book1 size={14} />
                                        </Box>
                                        <Typography variant="body2" color="#1F2937">
                                          {schedule.topic}
                                        </Typography>
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
                    <Paper
                      sx={{
                        p: 8,
                        textAlign: 'center',
                        borderRadius: 3,
                        border: '1px dashed #E9EDF4',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                      }}
                    >
                      <Box
                        sx={{
                          width: 96,
                          height: 96,
                          borderRadius: '50%',
                          backgroundColor: '#EFF6FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 24px'
                        }}
                      >
                        <Calendar size={44} color="#3B82F6" />
                      </Box>
                      <Typography variant="h6" fontWeight="700" color="#0A0F1C" gutterBottom>
                        No Schedules Found
                      </Typography>
                      <Typography variant="body2" color="#6B7280" sx={{ maxWidth: 400, margin: '0 auto' }}>
                        There are no schedules available for this batch. Schedules will appear here once theyre created.
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3.5, backgroundColor: '#ffffff', borderTop: '1px solid #E9EDF4' }}>
            <Button
              onClick={handleCloseDialog}
              variant="text"
              sx={{
                color: '#6B7280',
                borderRadius: 2,
                px: 5,
                py: 1.2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: '#F8FAFE',
                  color: '#0A0F1C'
                }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add/Edit Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              background: '#ffffff'
            }
          }}
        >
          <DialogTitle
            sx={{
              p: 3.5,
              background: 'linear-gradient(115deg, #0A0F1C 0%, #1A1F2E 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight="700" letterSpacing="-0.02em" color="#ffffff">
                {currentBatch ? 'Edit Batch' : 'Add New Batch'}
              </Typography>
              <IconButton
                aria-label="close"
                onClick={handleCloseDialog}
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  '&:hover': {
                    color: '#ffffff',
                    backgroundColor: 'rgba(255,255,255,0.05)'
                  }
                }}
              >
                <CloseSquare />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 4, backgroundColor: '#F8FAFE' }}>
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={3.5}>
                {/* Batch Title */}
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <FormLabel
                      sx={{
                        color: '#1F2937',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      Batch Title
                      <Typography component="span" color="#EF4444">
                        *
                      </Typography>
                    </FormLabel>
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
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          '&:hover fieldset': { borderColor: '#3B82F6' },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3B82F6',
                            borderWidth: '2px',
                            boxShadow: '0 0 0 3px rgba(59,130,246,0.1)'
                          }
                        }
                      }}
                    />
                  </Stack>
                </Grid>

                {/* Batch Slots */}
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <FormLabel
                      sx={{
                        color: '#1F2937',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      Total Slots
                      <Typography component="span" color="#EF4444">
                        *
                      </Typography>
                    </FormLabel>
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
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          '&:hover fieldset': { borderColor: '#3B82F6' },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3B82F6',
                            borderWidth: '2px',
                            boxShadow: '0 0 0 3px rgba(59,130,246,0.1)'
                          }
                        }
                      }}
                    />
                  </Stack>
                </Grid>

                {/* Start Date */}
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <FormLabel
                      sx={{
                        color: '#1F2937',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      Start Date
                      <Typography component="span" color="#EF4444">
                        *
                      </Typography>
                    </FormLabel>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        format={useDate.dateFormat}
                        minDate={new Date()}
                        value={formik.values.start_date ? new Date(formik.values.start_date) : null}
                        onChange={(newValue) => {
                          formik.setFieldValue('start_date', newValue);
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
                            placeholder: 'Select start date',
                            size: 'small',
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: '#ffffff',
                                borderRadius: 2,
                                transition: 'all 0.2s ease',
                                '&:hover fieldset': { borderColor: '#3B82F6' },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#3B82F6',
                                  borderWidth: '2px',
                                  boxShadow: '0 0 0 3px rgba(59,130,246,0.1)'
                                }
                              }
                            }
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Stack>
                </Grid>

                {/* End Date */}
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <FormLabel
                      sx={{
                        color: '#1F2937',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      End Date
                      <Typography component="span" color="#EF4444">
                        *
                      </Typography>
                    </FormLabel>
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
                            placeholder: 'Select end date',
                            size: 'small',
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: '#ffffff',
                                borderRadius: 2,
                                transition: 'all 0.2s ease',
                                '&:hover fieldset': { borderColor: '#3B82F6' },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#3B82F6',
                                  borderWidth: '2px',
                                  boxShadow: '0 0 0 3px rgba(59,130,246,0.1)'
                                }
                              }
                            }
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Stack>
                </Grid>

                {/* Start Time */}
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <FormLabel
                      sx={{
                        color: '#1F2937',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      Start Time
                      <Typography component="span" color="#EF4444">
                        *
                      </Typography>
                    </FormLabel>
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
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 300 }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          '&:hover fieldset': { borderColor: '#3B82F6' },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3B82F6',
                            borderWidth: '2px',
                            boxShadow: '0 0 0 3px rgba(59,130,246,0.1)'
                          }
                        }
                      }}
                    />
                  </Stack>
                </Grid>

                {/* End Time */}
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <FormLabel
                      sx={{
                        color: '#1F2937',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      End Time
                      <Typography component="span" color="#EF4444">
                        *
                      </Typography>
                    </FormLabel>
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
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 300 }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          '&:hover fieldset': { borderColor: '#3B82F6' },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3B82F6',
                            borderWidth: '2px',
                            boxShadow: '0 0 0 3px rgba(59,130,246,0.1)'
                          }
                        }
                      }}
                    />
                  </Stack>
                </Grid>

                {/* Course Selection */}
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <FormLabel
                      sx={{
                        color: '#1F2937',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      Course
                      <Typography component="span" color="#EF4444">
                        *
                      </Typography>
                    </FormLabel>
                    <Autocomplete
                      options={courses || []}
                      getOptionLabel={(option) => option.course_name}
                      value={courses?.find((course) => course.course_id === formik.values.course_id) || null}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('course_id', newValue ? newValue.course_id : '');
                      }}
                      onBlur={() => formik.setFieldTouched('course_id', true)}
                      size="small"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select course"
                          error={formik.touched.course_id && Boolean(formik.errors.course_id)}
                          helperText={formik.touched.course_id && formik.errors.course_id}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#ffffff',
                              borderRadius: 2,
                              transition: 'all 0.2s ease',
                              '&:hover fieldset': { borderColor: '#3B82F6' },
                              '&.Mui-focused fieldset': {
                                borderColor: '#3B82F6',
                                borderWidth: '2px',
                                boxShadow: '0 0 0 3px rgba(59,130,246,0.1)'
                              }
                            }
                          }}
                        />
                      )}
                      PaperComponent={(props) => <Paper {...props} sx={{ borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />}
                      renderOption={(props, option) => (
                        <li {...props} key={option.course_id} style={{ padding: '10px 16px' }}>
                          <Typography fontSize="0.875rem" fontWeight="500">
                            {option.course_name}
                          </Typography>
                        </li>
                      )}
                    />
                  </Stack>
                </Grid>

                {/* Trainer Selection */}
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <FormLabel
                      sx={{
                        color: '#1F2937',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      Tutor
                      <Typography component="span" color="#EF4444">
                        *
                      </Typography>
                    </FormLabel>
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
                      size="small"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select trainer"
                          error={formik.touched.trainer && Boolean(formik.errors.trainer)}
                          helperText={formik.touched.trainer && formik.errors.trainer}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#ffffff',
                              borderRadius: 2,
                              transition: 'all 0.2s ease',
                              '&:hover fieldset': { borderColor: '#3B82F6' },
                              '&.Mui-focused fieldset': {
                                borderColor: '#3B82F6',
                                borderWidth: '2px',
                                boxShadow: '0 0 0 3px rgba(59,130,246,0.1)'
                              }
                            }
                          }}
                        />
                      )}
                      PaperComponent={(props) => <Paper {...props} sx={{ borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />}
                      renderOption={(props, option) => (
                        <li {...props} key={option.trainer_id} style={{ padding: '10px 16px' }}>
                          <Box>
                            <Typography fontSize="0.875rem" fontWeight="600">
                              {option.full_name}
                            </Typography>
                            <Typography variant="caption" color="#6B7280">
                              ID: {option.employee_id}
                            </Typography>
                          </Box>
                        </li>
                      )}
                    />
                  </Stack>
                </Grid>

                {/* Students Multi-select */}
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <FormLabel
                      sx={{
                        color: '#1F2937',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}
                    >
                      Students
                    </FormLabel>
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
                      size="small"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select students"
                          error={formik.touched.students && Boolean(formik.errors.students)}
                          helperText={
                            (formik.touched.students && formik.errors.students) ||
                            `Selected: ${formik.values.students?.length || 0}/${formik.values.slots || 0} slots`
                          }
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#ffffff',
                              borderRadius: 2,
                              transition: 'all 0.2s ease',
                              '&:hover fieldset': { borderColor: '#3B82F6' },
                              '&.Mui-focused fieldset': {
                                borderColor: '#3B82F6',
                                borderWidth: '2px',
                                boxShadow: '0 0 0 3px rgba(59,130,246,0.1)'
                              }
                            }
                          }}
                        />
                      )}
                      PaperComponent={(props) => <Paper {...props} sx={{ borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />}
                      renderOption={(props, option) => (
                        <li {...props} key={option.student_id} style={{ padding: '10px 16px' }}>
                          <Box>
                            <Typography fontSize="0.875rem" fontWeight="600">
                              {option.full_name}
                            </Typography>
                            <Typography variant="caption" color="#6B7280">
                              ID: {option.registration_id}
                            </Typography>
                          </Box>
                        </li>
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            label={option.full_name}
                            {...getTagProps({ index })}
                            size="small"
                            key={option.student_id}
                            sx={{
                              backgroundColor: '#EFF6FF',
                              color: '#3B82F6',
                              borderRadius: 1.5,
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              border: '1px solid #DBEAFE',
                              '& .MuiChip-deleteIcon': {
                                color: '#3B82F6',
                                '&:hover': {
                                  color: '#2563EB'
                                }
                              }
                            }}
                          />
                        ))
                      }
                    />
                    <FormHelperText sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
                      {formik.values.students?.length > 0
                        ? `Selected ${formik.values.students.length} out of ${formik.values.slots || 0} slots`
                        : 'Select students for this batch (optional)'}
                    </FormHelperText>
                  </Stack>
                </Grid>
              </Grid>
            </form>
          </DialogContent>
          <DialogActions sx={{ p: 3.5, backgroundColor: '#ffffff', borderTop: '1px solid #E9EDF4' }}>
            <Button
              onClick={handleCloseDialog}
              variant="text"
              sx={{
                color: '#6B7280',
                borderRadius: 2,
                px: 5,
                py: 1.2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: '#F8FAFE',
                  color: '#0A0F1C'
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={formik.submitForm}
              variant="contained"
              disabled={formik.isSubmitting}
              startIcon={formik.isSubmitting ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null}
              sx={{
                background: 'linear-gradient(115deg, #3B82F6, #8B5CF6)',
                borderRadius: 2,
                px: 6,
                py: 1.2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                boxShadow: '0 8px 16px -4px rgba(59,130,246,0.3)',
                '&:hover': {
                  background: 'linear-gradient(115deg, #2563EB, #7C3AED)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 12px 24px -6px rgba(59,130,246,0.4)'
                },
                transition: 'all 0.2s ease',
                '&:disabled': {
                  background: '#E5E7EB',
                  boxShadow: 'none'
                }
              }}
            >
              {formik.isSubmitting ? 'Saving...' : currentBatch ? 'Update Batch' : 'Create Batch'}
            </Button>
          </DialogActions>
        </Dialog>
      </MainCard>
    </>
  );
};

export default BatchManagement;