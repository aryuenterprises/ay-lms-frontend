import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Chip,
  List,
  Stack,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Grid
} from '@mui/material';
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import PropTypes from 'prop-types';
import { DateCalendar } from '@mui/x-date-pickers';
import { format, parseISO, isSameDay } from 'date-fns';
import axiosInstance from 'utils/axios';
import { APP_PATH_BASE_URL } from 'config';
import Swal from 'sweetalert2';

export default function CalendarTab({ schedule = [], fetchData }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [processingId, setProcessingId] = useState(null); // Track which item is being processed
  const [settings, setSettings] = useState(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);

  const currentDateTime = new Date();

  const auth = JSON.parse(localStorage.getItem('auth'));
  const userId = auth?.user?.employee_id || auth?.user?.user_id;
  const regId = auth?.user?.student_id;
  const userType = auth?.loginType;

  const attendance_type=auth?.user?.attendance_type;

  // console.log(attendance_type,"attendance type",attendance_type?.attendance_type,"here");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Improved function to check if a date has schedules
  const hasSchedules = (date) => {
    if (!date) return false;
    return schedule.some((item) => {
      try {
        const itemDate = parseISO(item.scheduled_date);
        return isSameDay(itemDate, date);
      } catch (e) {
        console.error('Invalid date format:', item.scheduled_date);
        return false;
      }
    });
  };

  // Get schedules for a specific date
  const getSchedulesForDate = (date) => {
    if (!date) return [];
    return schedule.filter((item) => {
      try {
        const itemDate = parseISO(item.scheduled_date);
        return isSameDay(itemDate, date);
      } catch (e) {
        console.error('Invalid date format:', item.scheduled_date);
        return false;
      }
    });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const dateSchedules = getSchedulesForDate(date);
    if (dateSchedules.length > 0) {
      handleOpen();
    }
  };

  const handleFetchSettings = useCallback(async () => {
    try {
      // const res = await axiosInstance.get(`${APP_PATH_BASE_URL}api/settings`);

      // const res=auth.get("data")
      //  console.log("fetch fail success data we get ",res)


      // console.log("editing",response,"wprlog")

      if (attendance_type) {

        // console.log(attendance_type,"attendance_type")

        // console.log("data here",res.data.data)
        setSettings(attendance_type);
      }
    } catch (error) {

      // console.log("fetch fail success full")
      console.error('Error fetching settings:', error);
    }
  }, []);

  useEffect(() => {
    handleFetchSettings();
  }, [handleFetchSettings]);

  const handleClassLink = async (data) => {
    // Prevent multiple clicks while processing
    if (processingId === data.id) return;
    // console.log('data', data);
    setProcessingId(data.id);

    try {
      if (
        (data.attendance_status === null || data.attendance_status === false) &&
        settings?.attendance_options === 'automatic_attendance' &&
        attendanceMarked === false
      ) {
        if (data.schedule_id) {
          await markAttendance(data);
        }
      }
      window.open(`${data.class_link}`, '_blank');
    } catch (error) {
      console.error('Failed to process class link:', error);
    } finally {
      // Reset processing state after a short delay
      setTimeout(() => setProcessingId(null), 1000);
    }
  };

  const markAttendance = async (data) => {
    try {
      let res;
      if (userType === 'student') {
        const newRecord = {
          date: currentDateTime,
          student: regId,
          status: 'Present',
          course: data.course_id,
          new_batch: data.batch_id,
          schedule_id: data.schedule_id
        };

        // Input validation
        if (!data.course_id || !data.batch_id) {
          throw new Error('Course and Batch information is required');
        }

        res = await axiosInstance.post(`${APP_PATH_BASE_URL}api/attendance/${regId}`, newRecord);
      } else {
        const newRecord = {
          date: currentDateTime,
          trainer: userId,
          status: 'Login',
          course: data.course_id,
          new_batch: data.batch_id,
          schedule_id: data.schedule_id
        };

        res = await axiosInstance.post(`${APP_PATH_BASE_URL}api/trainer_attendance/${userId}`, newRecord);
      }

      if (res.data.success) {
        handleClose();
        fetchData();
        setAttendanceMarked(true);
      } else {
        throw new Error(res?.data?.message || 'Error submitting attendance data');
      }
    } catch (error) {
      console.error('Attendance marking failed:', error);

      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || error.message || 'Error submitting attendance data. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      throw error; // Re-throw to handle in calling function
    }
  };

  const markLogoutAttendance = async (data) => {
    try {
      const newRecord = {
        date: currentDateTime,
        trainer: userId,
        status: 'Logout',
        course: data.course_id,
        new_batch: data.batch_id,
        schedule_id: data.schedule_id
      };

      const res = await axiosInstance.post(`${APP_PATH_BASE_URL}api/trainer_attendance/${userId}`, newRecord);
      if (res.data.success) {
        handleClose();
        fetchData();
      } else {
        throw new Error(res?.data?.message || 'Error submitting attendance data');
      }
    } catch (error) {
      console.error('Attendance marking failed:', error);
      throw error; // Re-throw to handle in calling function
    }
  };

  // Helper function for 12-hour time format
  function combineDateTime(date, timeString) {
    const [time, modifier] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);

    let hourValue = hours;
    if (modifier === 'PM' && hours !== 12) {
      hourValue = hours + 12;
    } else if (modifier === 'AM' && hours === 12) {
      hourValue = 0;
    }

    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hourValue, minutes);
  }

  // Custom Day component with proper click handling
  const CustomDay = (props) => {
    const { day, outsideCurrentMonth, selected, onDaySelect, ...other } = props;
    const today = new Date();
    const isScheduled = hasSchedules(day);

    // Determine date status
    const isPastDate = day < today && !isSameDay(day, today);
    const isToday = isSameDay(day, today);
    const isFutureDate = day > today && !isSameDay(day, today);

    const handleClick = () => {
      onDaySelect(day);
    };

    return (
      <Box
        {...other}
        onClick={handleClick}
        sx={{
          width: 36,
          height: 36,
          m: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          cursor: 'pointer',
          // Past dates styling
          ...(isPastDate &&
            isScheduled && {
              color: theme.palette.text.disabled,
              backgroundColor: theme.palette.secondary.lighter
            }),
          // Today's date styling
          ...(isToday && {
            border: `2px solid ${theme.palette.primary.main}`,
            fontWeight: 'bold'
          }),
          // Future dates with schedule styling
          ...(isFutureDate &&
            isScheduled && {
              backgroundColor: theme.palette.success.light,
              '&:hover': {
                backgroundColor: theme.palette.success.light
              }
            }),
          // Selected date styling (overrides others)
          ...(selected && {
            backgroundColor: `${theme.palette.primary.main} !important`,
            color: `${theme.palette.primary.contrastText} !important`
          }),
          // Dates outside current month
          ...(outsideCurrentMonth && {
            color: theme.palette.text.disabled
          })
        }}
      >
        {day.getDate()}
      </Box>
    );
  };

  // Add PropTypes validation for CustomDay
  CustomDay.propTypes = {
    day: PropTypes.instanceOf(Date).isRequired,
    outsideCurrentMonth: PropTypes.bool.isRequired,
    selected: PropTypes.bool.isRequired,
    onDaySelect: PropTypes.func.isRequired
  };

  // Enhanced schedule item rendering
  const renderScheduleItem = (item, index, arr) => {
    const statusColor =
      {
        done: 'success',
        upcoming: 'warning',
        ongoing: 'info',
        cancelled: 'error',
        missed: 'error',
        completed: 'success'
      }[item.status] || 'default';

    const now = new Date();
    const scheduledDate = parseISO(item.scheduled_date);
    const startDateTime = combineDateTime(scheduledDate, item.start_time);
    const endDateTime = combineDateTime(scheduledDate, item.end_time);

    // Calculate 20 minutes before start time
    const twentyMinutesBeforeStart = new Date(startDateTime.getTime() - 20 * 60 * 1000);

    // Time-based status checks
    const isPast = endDateTime < now;
    const isWithinClassTime = now >= startDateTime && now <= endDateTime;
    const isLinkEnabled = now >= twentyMinutesBeforeStart && now <= endDateTime;

    const isProcessing = processingId === item.id;

    return (
      <Box
        key={`${item.course_name}-${index}`}
        sx={{
          p: 1,
          borderBottom: index !== arr.length - 1 ? 1 : 0,
          borderColor: 'divider',
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Avatar Section */}
          <Grid item xs={1}>
            <Avatar
              variant="rounded"
              color="secondary"
              sx={{
                color: 'secondary.contrastText',
                bgcolor: 'secondary.main',
                fontWeight: 600,
                width: 40,
                height: 40
              }}
            >
              {item.course_name?.charAt(0).toUpperCase()}
            </Avatar>
          </Grid>

          {/* Course Info Section */}
          <Grid item xs={7} sm={8}>
            <Stack spacing={0.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" component="span">
                  {item.course_name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  {item.title}
                </Typography>
              </Box>

              {item.class_link &&
                ((userType === 'tutor' && item.attendance_status !== 'Login') ||
                  (userType === 'student' && item.attendance_status !== 'present')) && (
                  <Typography
                    variant="caption"
                    component={!isLinkEnabled ? 'span' : 'a'}
                    onClick={!isLinkEnabled || isProcessing ? undefined : () => handleClassLink(item)}
                    sx={{
                      color: !isLinkEnabled ? 'text.disabled' : 'primary.main',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: !isLinkEnabled || isProcessing ? 'none' : 'underline'
                      },
                      display: 'inline-block',
                      cursor: !isLinkEnabled || isProcessing ? 'default' : 'pointer',
                      background: 'none',
                      border: 'none',
                      font: 'inherit',
                      outline: 'inherit',
                      opacity: isProcessing ? 0.6 : 1
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : !isLinkEnabled ? 'Class Not Available' : 'Join Meeting'}
                  </Typography>
                )}
              {item.attendance_status === 'Login' && (
                <Typography
                  variant="caption"
                  component={isPast || !isWithinClassTime ? 'span' : 'a'}
                  onClick={isPast || !isWithinClassTime || isProcessing ? undefined : () => markLogoutAttendance(item)}
                  sx={{
                    color: isPast ? 'text.disabled' : isWithinClassTime ? 'primary.main' : 'text.secondary',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: isPast || !isWithinClassTime || isProcessing ? 'none' : 'underline'
                    },
                    display: 'inline-block',
                    cursor: isPast || !isWithinClassTime || isProcessing ? 'default' : 'pointer',
                    background: 'none',
                    border: 'none',
                    font: 'inherit',
                    outline: 'inherit',
                    opacity: isProcessing ? 0.6 : 1
                  }}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Logout'}
                </Typography>
              )}
            </Stack>
          </Grid>

          {/* Time and Status Section */}
          <Grid item xs={4} sm={3}>
            <Stack spacing={0.5} alignItems="flex-end">
              <Typography variant="caption" color="text.secondary">
                {`${item.start_time} - ${item.end_time}`}
              </Typography>
              <Chip color={statusColor} size="small" label={item.status} sx={{ textTransform: 'capitalize' }} />
            </Stack>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <MainCard content={false} sx={{ height: '100%' }}>
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography variant="h5">Class Schedule</Typography>
      </Box>

      <Box>
        <DateCalendar
          onChange={handleDateSelect}
          slots={{
            day: CustomDay
          }}
          sx={{
            '& .MuiPickersCalendarHeader-root': {
              marginBottom: 1,
              paddingLeft: 2
            },
            '& .MuiDayCalendar-weekContainer': {
              marginTop: 1
            },
            '& .MuiDayCalendar-header': {
              '& > span': {
                margin: 0.5,
                paddingRight: 2,
                width: 36,
                textAlign: 'center'
              }
            }
          }}
        />
      </Box>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
          Classes on {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <List disablePadding>
            {selectedDate && getSchedulesForDate(selectedDate).length > 0 ? (
              getSchedulesForDate(selectedDate).map((item, idx, arr) => renderScheduleItem(item, idx, arr))
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No classes scheduled for this day
                </Typography>
              </Box>
            )}
          </List>
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleClose} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}

CalendarTab.propTypes = {
  schedule: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // Added id prop for tracking
      scheduled_date: PropTypes.string.isRequired,
      course_name: PropTypes.string.isRequired,
      batch_name: PropTypes.string.isRequired,
      class_link: PropTypes.string,
      status: PropTypes.oneOf(['done', 'upcoming', 'ongoing', 'cancelled', 'missed', 'completed']).isRequired,
      course_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      batch_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
    })
  ),
  fetchData: PropTypes.func
};

CalendarTab.defaultProps = {
  schedule: []
};
