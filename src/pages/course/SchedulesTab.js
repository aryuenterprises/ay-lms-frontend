import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  // List,
  // ListItem,
  // ListItemText,
  // Divider,
  IconButton,
  Grid,
  FormLabel,
  Chip,
  Autocomplete,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { useFormik } from 'formik';
import MainCard from 'components/MainCard';
import * as Yup from 'yup';
import axiosInstance from 'utils/axios';
import { Add, CloseSquare, Edit, Trash } from 'iconsax-react';
import { APP_PATH_BASE_URL } from 'config';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { enUS } from 'date-fns/locale';
import { formatDate } from 'utils/formatDate';
import { DatePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import formatTime from 'utils/formatTime';
import Swal from 'sweetalert2';
import 'assets/css/commonStyle.css';
import { Capitalise } from 'utils/capitalise';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import useDate from '../../config';
import { usePermission } from 'hooks/usePermission';
import { formatDateTime } from 'utils/dateUtils';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

const ScheduleSchema = Yup.object().shape({
  employee_id: Yup.string().required('Employee ID is required'),
  start_date: Yup.date().required('Start date is required'),
  end_date: Yup.date().required('End date is required').min(Yup.ref('start_date'), 'End date must be after start date'),
  start_time: Yup.date().required('Start time is required'),
  end_time: Yup.date().required('End time is required').min(Yup.ref('start_time'), 'End time must be after start time'),
  batch_id: Yup.string().required('Batch selection is required'),
  recurrence_type: Yup.string().required()
});

const SchedulesTab = () => {
  const { checkPermission } = usePermission();

  const canCreate = checkPermission('Schedule', 'create');
  // const canUpdate = checkPermission('Schedule', 'update');
  const canDelete = checkPermission('Schedule', 'delete');

  const [schedules, setSchedules] = useState([]);
  const [batches, setBatches] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openDayModal, setOpenDayModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateSchedules, setSelectedDateSchedules] = useState([]);
  const [openScheduleModal, setOpenScheduleModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [filterDate, setFilterDate] = useState(null);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [calendarView, setCalendarView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [courses, setCourses] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedTutor, setSelectedTutor] = useState(null);

  const auth = JSON.parse(localStorage.getItem('auth'));
  const userId = auth?.user?.employee_id || auth?.user?.user_id;
  const userType = auth?.loginType;
  const isTutor = auth?.user?.user_type === 'tutor';

  const currentMonth = date.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = date.getFullYear();

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      if (isTutor) {
        const res = await axiosInstance.get(`${APP_PATH_BASE_URL}api/class_schedule/${userId}/schedules`, {
          params: {
            month: currentMonth,
            year: currentYear
          }
        });
        setSchedules(res.data.Class_Schedule);
        setBatches(res.data.Batches);
        setTrainers(res.data.Trainers);
        setCourses(res.data.Courses);
      } else {
        const res = await axiosInstance.get(`${APP_PATH_BASE_URL}api/class_schedule`, {
          params: {
            month: currentMonth,
            year: currentYear
          }
        });
        setSchedules(res.data.Class_Schedule);
        setBatches(res.data.Batches);
        setTrainers(res.data.Trainers);
        setCourses(res.data.Courses);
      }
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching schedules');
      setLoading(false);
    }
  }, [isTutor, userId, currentMonth, currentYear]);

  const filteredschudules = useMemo(() => {
    return schedules?.filter((item) => {
      if (!item) return false; // Additional safety check

      // Check if course matches search term
      const matchesTriner = !selectedTutor || item.trainer_employee_id === selectedTutor.employee_id;

      // Check if course matches selected course filter
      const matchesCourse = !selectedCourse || item.course_id === selectedCourse.course_id;

      // Check if batch matches selected batch filter
      const matchesBatch = !selectedBatch || item.batch_id === selectedBatch.batch_id;

      // Return true only if both conditions are met
      return matchesTriner && matchesCourse && matchesBatch;
    });
  }, [schedules, selectedCourse, selectedTutor, selectedBatch]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  useEffect(() => {
    if (filterDate) {
      const filtered = schedules?.filter((schedule) => {
        const scheduleDate = new Date(schedule.scheduled_date);
        return (
          scheduleDate.getFullYear() === filterDate.getFullYear() &&
          scheduleDate.getMonth() === filterDate.getMonth() &&
          scheduleDate.getDate() === filterDate.getDate()
        );
      });
      setFilteredSchedules(filtered);
    } else {
      setFilteredSchedules(schedules);
    }
  }, [filterDate, schedules]);

  const formik = useFormik({
    initialValues: {
      recurrence_type: 'day', // 'day', 'weekly', or 'custom_days'
      days_of_week: [],
      employee_id: null,
      start_date: null,
      end_date: null,
      start_time: null,
      end_time: null,
      batch_id: null,
      course_id: null,
      class_link: ''
    },
    validationSchema: ScheduleSchema,
    onSubmit: async (values) => {
      try {
        const scheduleData = {
          batch: values.batch_id,
          course: values.course_id,
          start_date: formatDate(values.start_date),
          end_date: formatDate(values.end_date),
          start_time: formatTime(values.start_time),
          end_time: formatTime(values.end_time),
          recurrence_type: values.recurrence_type,
          employee_id: values.employee_id,
          is_online_class: !!values.class_link,
          class_link: values.class_link || undefined,
          ...(values.recurrence_type === 'custom_days' ? { days_of_week: values.days_of_week } : {})
        };

        if (currentSchedule) {
          const res = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/class_schedule/${currentSchedule.schedule_id}`, scheduleData);
          if (res.data.success === true) {
            await Swal.fire({
              title: 'Success!',
              text: 'Schedule updated successfully',
              icon: 'success',
              showConfirmButton: true,
              confirmButtonText: 'OK'
            });
          } else {
            await Swal.fire({
              title: 'Success!',
              text: res.data.message,
              icon: 'success',
              showConfirmButton: true,
              confirmButtonText: 'OK'
            });
          }
        } else {
          const res = await axiosInstance.post(`${APP_PATH_BASE_URL}api/recurring_schedules`, scheduleData);
          if (res.data.success === true) {
            await Swal.fire({
              title: 'Success!',
              text: 'Schedule created successfully',
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

        await fetchSchedules();
        handleCloseModal();
        handleCloseDayModal();
      } catch (err) {
        setError(err.response?.data?.message || 'Error saving schedule');
      }
    }
  });

  useEffect(() => {
    if (formik.values.employee_id && trainers.length > 0) {
      const trainer = trainers.find((t) => t.employee_id === formik.values.employee_id) || null;
      setSelectedTrainer(trainer);
    } else {
      setSelectedTrainer(null);
    }
  }, [formik.values.employee_id, trainers]);

  // Add this function after your other handler functions
  const handleBatchChange = (event, newValue) => {
    formik.setFieldValue('batch_id', newValue ? newValue.batch_id : '');

    if (newValue) {
      // Auto-populate form fields with batch data
      formik.setFieldValue('course_id', newValue.course_id || '');
      formik.setFieldValue('employee_id', newValue.employee_id || '');

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

      // Set dates from batch with validation
      if (newValue.start_date) {
        const batchStartDate = new Date(newValue.start_date);
        batchStartDate.setHours(0, 0, 0, 0);

        // Use batch start date only if it's today or in the future
        if (batchStartDate >= today) {
          formik.setFieldValue('start_date', new Date(newValue.start_date));
        } else {
          // If batch start date is in past, use today's date
          formik.setFieldValue('start_date', today);
        }
      } else {
        formik.setFieldValue('start_date', today);
      }

      if (newValue.end_date) {
        const batchEndDate = new Date(newValue.end_date);
        batchEndDate.setHours(0, 0, 0, 0);
        const selectedStartDate = formik.values.start_date || today;

        // Use batch end date only if it's after start date
        if (batchEndDate >= selectedStartDate) {
          formik.setFieldValue('end_date', new Date(newValue.end_date));
        } else {
          // If batch end date is before start date, adjust it
          const adjustedEndDate = new Date(selectedStartDate);
          adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
          formik.setFieldValue('end_date', adjustedEndDate);
        }
      } else {
        // Default end date (1 day after start date)
        const startDate = formik.values.start_date || today;
        const defaultEndDate = new Date(startDate);
        defaultEndDate.setDate(defaultEndDate.getDate() + 1);
        formik.setFieldValue('end_date', defaultEndDate);
      }

      // Set times from batch with proper date context
      if (newValue.start_time) {
        const startDate = formik.values.start_date || today;
        const startTime = new Date(startDate);
        const [hours, minutes] = newValue.start_time.split(':');
        startTime.setHours(parseInt(hours), parseInt(minutes), 0);

        // If the time is in the past for today, use current time
        const now = new Date();
        if (startDate.getTime() === today.getTime() && startTime < now) {
          formik.setFieldValue('start_time', now);
        } else {
          formik.setFieldValue('start_time', startTime);
        }
      } else {
        formik.setFieldValue('start_time', new Date());
      }

      if (newValue.end_time) {
        const endDate = formik.values.end_date || today;
        const endTime = new Date(endDate);
        const [hours, minutes] = newValue.end_time.split(':');
        endTime.setHours(parseInt(hours), parseInt(minutes), 0);

        // Ensure end time is after start time
        const startTime = formik.values.start_time || new Date();
        if (endTime <= startTime) {
          // Add 1 hour to start time
          const adjustedEndTime = new Date(startTime);
          adjustedEndTime.setHours(adjustedEndTime.getHours() + 1);
          formik.setFieldValue('end_time', adjustedEndTime);
        } else {
          formik.setFieldValue('end_time', endTime);
        }
      } else {
        // Default end time (1 hour after start time)
        const startTime = formik.values.start_time || new Date();
        const defaultEndTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        formik.setFieldValue('end_time', defaultEndTime);
      }

      // Also update the selected trainer for display
      if (newValue.employee_id) {
        const trainer = trainers.find((t) => t.employee_id === newValue.employee_id) || null;
        setSelectedTrainer(trainer);
      }
    } else {
      // Clear fields if no batch selected
      formik.setFieldValue('course_id', '');
      formik.setFieldValue('employee_id', '');

      // Reset to current date and time
      const today = new Date();
      const now = new Date();

      formik.setFieldValue('start_date', today);
      formik.setFieldValue('end_date', today);
      formik.setFieldValue('start_time', now);
      formik.setFieldValue('end_time', new Date(now.getTime() + 60 * 60 * 1000));

      setSelectedTrainer(isTutor ? trainers?.find((t) => t.employee_id === userId) || null : null);
    }
  };

  // Handle recurrence type change
  const handleRecurrenceTypeChange = (event) => {
    const newRecurrenceType = event.target.value;
    formik.setFieldValue('recurrence_type', newRecurrenceType);
    formik.setFieldValue('batch_id', null);

    const today = new Date();
    // const now = new Date();

    if (newRecurrenceType === 'day') {
      // For 'day' type, set start_date to today and make it read-only
      formik.setFieldValue('start_date', today);
      formik.setFieldValue('end_date', today);
    } else if (newRecurrenceType === 'weekly') {
      // For 'weekly' type, allow any start date but default to today
      if (!formik.values.start_date || formik.values.start_date < today) {
        formik.setFieldValue('start_date', today);
      }
      // Set end date to 7 days from start date
      const endDate = new Date(formik.values.start_date || today);
      endDate.setDate(endDate.getDate() + 7);
      formik.setFieldValue('end_date', endDate);
    } else if (newRecurrenceType === 'custom_days') {
      // For 'custom_days' type, allow any start date but default to today
      if (!formik.values.start_date || formik.values.start_date < today) {
        formik.setFieldValue('start_date', today);
      }
      // Set end date to 30 days from start date
      const endDate = new Date(formik.values.start_date || today);
      endDate.setDate(endDate.getDate() + 30);
      formik.setFieldValue('end_date', endDate);
    }
  };

  // Handle start date change
  const handleStartDateChange = (date) => {
    formik.setFieldValue('start_date', date);

    if (formik.values.recurrence_type === 'weekly') {
      // For weekly, set end date to 7 days from start date
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 7);
      formik.setFieldValue('end_date', endDate);
    } else if (formik.values.recurrence_type === 'custom_days') {
      // For custom days, set end date to 30 days from start date
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 30);
      formik.setFieldValue('end_date', endDate);
    } else if (formik.values.recurrence_type === 'day') {
      // For day, set end date to start date
      formik.setFieldValue('end_date', date);
    }
  };

  const handleScheduleDelete = async (ScheduleId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this schedule?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return; // User canceled

    try {
      const res = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/class_schedule/${ScheduleId}/archive`);
      if (res.data.success === false) return;
      Swal.fire('Success!', res.data.message, 'success');
      fetchSchedules();
      setSelectedDateSchedules((prev) => prev.filter((schedule) => schedule.schedule_id !== ScheduleId));
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting schedule');
    }
  };

  const handleOpenModal = (selectedDate, schedule = null) => {
    setCurrentSchedule(schedule);
    const today = new Date();
    const now = new Date();
    console.log('schedule :', schedule);
    if (schedule) {
      // For existing schedule, find the matching trainer object
      const filter = trainers?.find((t) => t.employee_id === userId) || null;

      formik.setValues({
        employee_id: schedule.trainer_employee_id || schedule.trainer_id,
        start_date: new Date(schedule.start_date || schedule.scheduled_date),
        end_date: new Date(schedule.end_date || schedule.scheduled_date),
        start_time: new Date(`${schedule.start_date || schedule.scheduled_date}T${schedule.start_time}`),
        end_time: new Date(`${schedule.start_date || schedule.scheduled_date}T${schedule.end_time}`),
        course_id: schedule.course_id,
        batch_id: schedule.batch_id,
        class_link: schedule.class_link || '',
        recurrence_type: schedule.recurrence_type || 'day',
        days_of_week: schedule.days_of_week || []
      });

      // Set the selected trainer for Autocomplete display
      setSelectedTrainer(filter);
    } else {
      formik.resetForm();
      // For new schedule, find the trainer object if user is tutor
      const userTrainer = isTutor ? trainers?.find((t) => t.employee_id === userId) || null : null;
      formik.setValues({
        employee_id: isTutor ? userId : null,
        start_date: selectedDate || today,
        end_date: selectedDate || today,
        start_time: now,
        end_time: new Date(now.getTime() + 60 * 60 * 1000),
        batch_id: null,
        class_link: '',
        recurrence_type: 'day',
        days_of_week: []
      });

      // Set the selected trainer for Autocomplete display
      setSelectedTrainer(userTrainer);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentSchedule(null);
    formik.resetForm();
  };

  const handleDateClick = (date) => {
    const clickedDate = new Date(date);
    clickedDate.setHours(0, 0, 0, 0);

    const endOfDay = new Date(clickedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const schedulesForDay = (Array.isArray(filteredschudules) ? filteredschudules : []).filter((schedule) => {
      const scheduleDate = new Date(schedule.scheduled_date);
      return scheduleDate >= clickedDate && scheduleDate <= endOfDay;
    });

    setSelectedDate(clickedDate);
    setSelectedDateSchedules(schedulesForDay);
    setOpenDayModal(true);
  };

  const handleCloseDayModal = () => {
    setOpenDayModal(false);
    setSelectedDate(null);
    setSelectedDateSchedules([]);
  };

  const handleFilterDateChange = (newDate) => {
    if (newDate) {
      setFilterDate(newDate);
      setCalendarView('day');
      setDate(newDate);
    } else {
      setFilterDate(null);
      setCalendarView('month');
      setDate(new Date());
    }
  };

  const clearFilter = () => {
    setFilterDate(null);
    setCalendarView('month');
    setDate(new Date());
  };

  const onView = (view) => {
    setCalendarView(view);
    if (view !== 'day') {
      setFilterDate(null);
    }
  };

  const onNavigate = (newDate) => {
    setDate(newDate);
  };

  const handleScheduleClick = (schedule) => {
    setOpenScheduleModal(true);
    setSelectedSchedule(schedule);
  };

  const handleCloseScheduleModal = () => {
    setOpenScheduleModal(false);
    setSelectedSchedule(null);
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography>Loading schedules...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <MainCard content={false}>
      <Box sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Class Schedules</Typography>
          {(canCreate || userType === 'tutor') && (
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()}>
              Add Schedule
            </Button>
          )}
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} width="100%" mb={2}>
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
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Filter by date"
                value={filterDate}
                onChange={handleFilterDateChange}
                slotProps={{
                  textField: {
                    variant: 'outlined',
                    size: 'small'
                  }
                }}
              />
            </LocalizationProvider>
            {filterDate && (
              <Button variant="outlined" onClick={clearFilter}>
                Clear Filter
              </Button>
            )}
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
            <Autocomplete
              id="batch_id"
              options={batches || []}
              getOptionLabel={(option) => option.title || ''}
              value={selectedBatch}
              onChange={(event, newValue) => {
                setSelectedBatch(newValue);
              }}
              size="small"
              sx={{
                minWidth: { xs: '100%', sm: 180, md: 200 },
                flex: '1 1 auto'
              }}
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
            {(userType === 'admin' || userType === 'super_admin') && (
              <Autocomplete
                id="employee_id"
                options={trainers || []}
                getOptionLabel={(option) => option.full_name || ''}
                value={selectedTutor}
                onChange={(event, newValue) => {
                  setSelectedTutor(newValue);
                }}
                size="small"
                sx={{
                  minWidth: { xs: '100%', sm: 180, md: 200 },
                  flex: '1 1 auto'
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Filter by tutor..."
                    InputProps={{
                      ...params.InputProps
                    }}
                  />
                )}
                filterOptions={(options = [], state) => {
                  return options.filter((option) => option.full_name?.toLowerCase().includes(state.inputValue.toLowerCase()));
                }}
                isOptionEqualToValue={(option, value) => option.employee_id === value.employee_id}
                renderOption={(props, option) => (
                  <li {...props} key={option.employee_id}>
                    {option.full_name}
                  </li>
                )}
              />
            )}
          </Box>
        </Stack>

        <Box sx={{ height: 600 }}>
          <Calendar
            className="my-calendar"
            localizer={localizer}
            events={((filterDate ? filteredSchedules : filteredschudules) || []).map((schedule) => ({
              start: new Date(`${schedule.scheduled_date}T${schedule.start_time}`),
              end: new Date(`${schedule.scheduled_date}T${schedule.end_time}`),
              title: schedule.trainer_name,
              ...schedule
            }))}
            startAccessor="start"
            endAccessor="end"
            style={{
              height: '100%',
              fontFamily: 'Arial, sans-serif',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
            defaultView="month"
            view={calendarView}
            onView={onView}
            date={date}
            onNavigate={onNavigate}
            onSelectSlot={(slotInfo) => handleDateClick(slotInfo.start)}
            selectable
            components={{
              event: () => null,
              month: {
                dateHeader: ({ date, label }) => {
                  const daySchedules = filteredschudules?.filter((schedule) => {
                    const scheduleDate = new Date(schedule.scheduled_date);
                    return localizer.isSameDate(date, scheduleDate);
                  });

                  const today = new Date();
                  const isToday = localizer.isSameDate(date, today);

                  return (
                    <button
                      style={{
                        position: 'relative',
                        padding: '4px',
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: isToday ? '#e6f7ff' : 'transparent',
                        borderRadius: '4px',
                        border: isToday ? '1px solid #1890ff' : 'none'
                      }}
                      onClick={() => handleDateClick(date)}
                    >
                      <span
                        style={{
                          fontWeight: isToday ? 'bold' : 'normal',
                          color: isToday ? '#1890ff' : '#333',
                          fontSize: '14px'
                        }}
                      >
                        {label}
                      </span>

                      {daySchedules?.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            gap: '2px',
                            marginTop: '4px'
                          }}
                        >
                          {daySchedules?.slice(0, 3).map((schedule, index) => (
                            <div
                              key={index}
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#52c41a',
                                boxShadow: '0 0 2px rgba(0,0,0,0.2)'
                              }}
                            />
                          ))}
                          {daySchedules?.length > 3 && (
                            <span
                              style={{
                                fontSize: '10px',
                                color: '#666',
                                marginLeft: '2px'
                              }}
                            >
                              +{daySchedules?.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                }
              }
            }}
            dayPropGetter={(date) => {
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              return {
                style: {
                  backgroundColor: isWeekend ? '#f9f9f9' : '#fff',
                  borderRight: '1px solid #f0f0f0',
                  borderBottom: '1px solid #f0f0f0',
                  color: '#000'
                }
              };
            }}
          />
        </Box>

        {/* Add/Edit Modal */}
        <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
          <DialogTitle className="dialogTitle">
            {currentSchedule ? 'Edit Schedule' : 'Add New Schedule'}
            <IconButton color="dark" onClick={handleCloseModal} edge="end" size="big" aria-label="close" title="close">
              <CloseSquare height={30} />
            </IconButton>
          </DialogTitle>
          <form onSubmit={formik.handleSubmit}>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <Stack spacing={1.5}>
                      <FormLabel>Recurrence Type</FormLabel>
                      <Select
                        name="recurrence_type"
                        value={formik.values.recurrence_type}
                        onChange={handleRecurrenceTypeChange}
                        onBlur={formik.handleBlur}
                        disabled={currentSchedule}
                      >
                        <MenuItem value="day">Single Day</MenuItem>
                        <MenuItem value="daily">Daily</MenuItem>
                        {/* <MenuItem value="weekly">Weekly Once</MenuItem> */}
                        <MenuItem value="custom_days">Custom Days</MenuItem>
                      </Select>
                    </Stack>
                  </FormControl>
                </Grid>

                {/*Batch*/}
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.5}>
                    <FormLabel>Batch</FormLabel>
                    <Autocomplete
                      options={batches || []}
                      getOptionLabel={(option) => option.title || ''}
                      value={batches?.find((batch) => batch.batch_id === formik.values.batch_id) || null}
                      onChange={handleBatchChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select Batch"
                          error={formik.touched.batch_id && Boolean(formik.errors.batch_id)}
                          helperText={formik.touched.batch_id && formik.errors.batch_id}
                          fullWidth
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option.batch_id === value.batch_id}
                    />
                  </Stack>
                </Grid>

                {formik.values.recurrence_type === 'custom_days' && (
                  <Grid item xs={12}>
                    <Stack spacing={1.5}>
                      <FormLabel>Select Days of Week</FormLabel>
                      <FormGroup row sx={{ justifyContent: 'space-between', gap: 1 }}>
                        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
                          <FormControlLabel
                            key={day}
                            control={
                              <Checkbox
                                name="days_of_week"
                                value={day}
                                checked={formik.values.days_of_week.includes(day)}
                                onChange={(event) => {
                                  const checked = event.target.checked;
                                  const dayValue = event.target.value;
                                  const current = [...formik.values.days_of_week];
                                  if (checked) {
                                    formik.setFieldValue('days_of_week', [...current, dayValue]);
                                  } else {
                                    formik.setFieldValue(
                                      'days_of_week',
                                      current.filter((d) => d !== dayValue)
                                    );
                                  }
                                }}
                                sx={{ marginRight: 0.5 }}
                              />
                            }
                            label={day}
                            sx={{ margin: 0 }}
                            labelPlacement="end"
                          />
                        ))}
                      </FormGroup>
                    </Stack>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.5}>
                    <FormLabel>Start Date</FormLabel>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        format={useDate.dateFormat}
                        placeholder="Start Date"
                        value={formik.values.start_date}
                        onChange={handleStartDateChange}
                        minDate={formik.values.recurrence_type === 'day' ? null : new Date()}
                        slotProps={{
                          textField: {
                            error: formik.touched.start_date && Boolean(formik.errors.start_date),
                            helperText: formik.touched.start_date && formik.errors.start_date,
                            fullWidth: true,
                            name: 'start_date',
                            onBlur: formik.handleBlur
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.5}>
                    <FormLabel>End Date</FormLabel>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        format={useDate.dateFormat}
                        placeholder="End Date"
                        value={formik.values.end_date}
                        onChange={(value) => formik.setFieldValue('end_date', value)}
                        minDate={formik.values.recurrence_type === 'day' ? null : formik.values.start_date || new Date()}
                        readOnly={formik.values.recurrence_type === 'day'}
                        disabled={formik.values.recurrence_type === 'day'}
                        slotProps={{
                          textField: {
                            error: formik.touched.end_date && Boolean(formik.errors.end_date),
                            helperText: formik.touched.end_date && formik.errors.end_date,
                            fullWidth: true,
                            name: 'end_date',
                            onBlur: formik.handleBlur
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.5}>
                    <FormLabel>Start Time</FormLabel>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <TimePicker
                        placeholder="Start Time"
                        value={formik.values.start_time}
                        minTime={isToday(formik.values.start_date) ? new Date() : undefined}
                        onChange={(value) => formik.setFieldValue('start_time', value)}
                        slotProps={{
                          textField: {
                            error: formik.touched.start_time && Boolean(formik.errors.start_time),
                            helperText: formik.touched.start_time && formik.errors.start_time,
                            fullWidth: true
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.5}>
                    <FormLabel>End Time</FormLabel>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <TimePicker
                        placeholder="End Time"
                        value={formik.values.end_time}
                        minTime={isToday(formik.values.start_date) && formik.values.start_time ? formik.values.start_time : undefined}
                        onChange={(value) => formik.setFieldValue('end_time', value)}
                        slotProps={{
                          textField: {
                            error: formik.touched.end_time && Boolean(formik.errors.end_time),
                            helperText: formik.touched.end_time && formik.errors.end_time,
                            fullWidth: true
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Stack>
                </Grid>
                {/*Course*/}
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.5}>
                    <FormLabel>Course</FormLabel>
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
                          placeholder="Select course..."
                          error={formik.touched.course_id && Boolean(formik.errors.course_id)}
                          helperText={formik.touched.course_id && formik.errors.course_id}
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option.course_id === value.course_id}
                      renderOption={(props, option) => (
                        <li {...props} key={option.course_id}>
                          {option.course_name}
                        </li>
                      )}
                      readOnly
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Stack spacing={1.5}>
                    <FormLabel>Employee ID</FormLabel>
                    <Autocomplete
                      id="employee_id"
                      options={trainers ?? []}
                      disabled={isTutor}
                      getOptionLabel={(option) => option.full_name || ''}
                      value={selectedTrainer}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('employee_id', newValue ? newValue.employee_id : '');
                      }}
                      onBlur={formik.handleBlur}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Employee ID"
                          error={formik.touched.employee_id && Boolean(formik.errors.employee_id)}
                          helperText={formik.touched.employee_id && formik.errors.employee_id}
                        />
                      )}
                      filterOptions={(options = [], state) =>
                        options.filter((option) => option.full_name?.toLowerCase().includes(state.inputValue.toLowerCase()))
                      }
                      isOptionEqualToValue={(option, value) => value?.employee_id === option.employee_id}
                      renderOption={(props, option) => (
                        <li {...props} key={option.employee_id}>
                          <Box>
                            <div>{option.full_name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>ID: {option.employee_id}</div>
                          </Box>
                        </li>
                      )}
                      readOnly
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.5}>
                    <FormLabel>Meet Link</FormLabel>
                    <TextField
                      fullWidth
                      id="class_link"
                      name="class_link"
                      placeholder="Meet Link"
                      value={formik.values.class_link}
                      onChange={formik.handleChange}
                      error={formik.touched.class_link && Boolean(formik.errors.class_link)}
                      helperText={formik.touched.class_link && formik.errors.class_link}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ m: 2 }}>
              <Button onClick={handleCloseModal}>Cancel</Button>
              <Button type="submit" variant="contained">
                {currentSchedule ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Day Schedules Modal */}
        <Dialog open={openDayModal} onClose={handleCloseDayModal} fullWidth maxWidth="sm">
          <DialogTitle className="dialogTitle">
            Schedules for{' '}
            {selectedDate?.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
            <IconButton color="dark" onClick={handleCloseDayModal} edge="end" size="big" aria-label="close" title="close">
              <CloseSquare height={30} />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {selectedDateSchedules.length === 0 ? (
              <Typography sx={{ py: 2 }}>No schedules for this day</Typography>
            ) : (
              <Box>
                {selectedDateSchedules.map((schedule, index) => (
                  <Box
                    key={index}
                    onClick={() => handleScheduleClick(schedule)}
                    sx={{
                      p: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      },
                      borderBottom: '1px solid #ccc'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        Tutor Name: {schedule.trainer_name}
                      </Typography>
                      <Typography variant="body3" color="text.secondary">
                        {schedule.title}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mt: 0.5
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography component="span" variant="body2" color="text.primary">
                          {new Date(`${schedule.scheduled_date}T${schedule.start_time}`).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}{' '}
                          -{' '}
                          {new Date(`${schedule.scheduled_date}T${schedule.end_time}`).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          sx={{ height: 25 }}
                          label={Capitalise(schedule.status_info)}
                          variant="contained"
                          className={schedule.status_info === 'upcoming' || schedule.status_info === 'Upcoming' ? 'warning-chip' : ''}
                          color={
                            schedule.status_info === 'done' || schedule.status_info === 'Done' || schedule.status_info === 'completed'
                              ? 'success'
                              : schedule.status_info === 'upcoming' || schedule.status_info === 'Upcoming'
                              ? 'warning'
                              : schedule.status_info === 'ongoing' || schedule.status_info === 'Ongoing'
                              ? 'info'
                              : 'error'
                          }
                        />
                        {/* {schedule.status_info === 'upcoming' && ( */}
                        {canDelete && (
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleScheduleDelete(schedule.schedule_id);
                            }}
                            color="error"
                          >
                            <Trash />
                          </IconButton>
                        )}
                        {schedule.status_info === 'upcoming' && (
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(selectedDate, schedule);
                            }}
                            color="error"
                          >
                            <Edit />
                          </IconButton>
                        )}
                        {/* )} */}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ m: 2 }}>
            <Button onClick={handleCloseDayModal}>Cancel</Button>
            {selectedDate &&
              new Date().setHours(0, 0, 0, 0) <= new Date(selectedDate).setHours(0, 0, 0, 0) &&
              (canCreate || userType === 'tutor') && (
                <Button
                  variant="contained"
                  onClick={() => {
                    handleCloseDayModal();
                    handleOpenModal(selectedDate);
                  }}
                >
                  Add New Schedule
                </Button>
              )}
          </DialogActions>
        </Dialog>

        {/* Selected Schedule Modal */}
        <Dialog open={openScheduleModal} onClose={handleCloseScheduleModal} fullWidth maxWidth="sm">
          <DialogTitle className="dialogTitle">
            {selectedSchedule?.title}
            <IconButton color="dark" onClick={handleCloseScheduleModal} edge="end" size="big" aria-label="close" title="close">
              <CloseSquare height={30} />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography>
              {selectedSchedule && (
                <Grid container spacing={1.5}>
                  <Grid item xs={12}>
                    <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" fontWeight={500}>
                        Tutor Name :
                      </Typography>
                      <Typography component="span" variant="body2" color="text.primary">
                        {selectedSchedule.trainer_name}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" fontWeight={500}>
                        Students Name :
                      </Typography>
                      {selectedSchedule?.course_trainer_assignments?.map((assignment, index) => (
                        <Typography key={index} component="span" variant="body2" color="text.primary">
                          {Capitalise(assignment.student_name) || Capitalise(assignment.student_names)}
                          {index < selectedSchedule.course_trainer_assignments.length - 1 ? ', ' : ''}
                        </Typography>
                      ))}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" fontWeight={500}>
                        Course Name :
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        {selectedSchedule.course_name}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" fontWeight={500}>
                        Date & Time :
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        {formatDateTime(selectedSchedule.scheduled_date, { includeTime: false })}
                      </Typography>
                      (
                      <Typography component="span" variant="body2" color="text.primary">
                        {new Date(`${selectedSchedule.scheduled_date}T${selectedSchedule.start_time}`).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}{' '}
                        -{' '}
                        {new Date(`${selectedSchedule.scheduled_date}T${selectedSchedule.end_time}`).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                      )
                    </Stack>
                  </Grid>
                </Grid>
              )}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ m: 2 }}>
            <Button onClick={handleCloseScheduleModal}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainCard>
  );
};

export default SchedulesTab;
