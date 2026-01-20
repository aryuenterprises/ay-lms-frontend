import { useCallback, useEffect, useRef, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Badge,
  Box,
  ClickAwayListener,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Paper,
  Popper,
  Stack,
  Typography,
  useMediaQuery
} from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';
import { ThemeMode } from 'config';

// assets
import { Notification } from 'iconsax-react';
import Avatar from 'components/@extended/Avatar';
import { APP_PATH_BASE_URL } from 'config';

import Cookies from 'js-cookie';
import { useNavigate } from 'react-router';
import { Capitalise } from 'utils/capitalise';
import axiosInstance from 'utils/axios';

import { openSnackbar } from 'store/reducers/snackbar';
import { dispatch } from 'store';

const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //

const NotificationPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const auth = JSON.parse(localStorage.getItem('auth'));
  const regId = auth?.user?.student_id;
  const userType = auth?.loginType;
  const token = Cookies.get('token');

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  // console.log('notification :', notifications);
  // const fetchData = useCallback(async () => {
  //   try {
  //     const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/notifications`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         'Content-Type': 'application/json'
  //       }
  //     });

  //     const result = response.data;
  //     setNotifications(result.notifications);

  //     // Calculate unread count
  //     const unread = result.notifications?.filter((notification) => !notification.is_read).length;
  //     setUnreadCount(unread);

  //     return result;
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }, [token]);

  // useEffect(() => {
  //   if (userType !== 'admin') {
  //     fetchData();

  //     const intervalId = setInterval(fetchData, 30 * 1000);

  //     return () => clearInterval(intervalId);
  //   }
  // }, [fetchData, userType]);

  const ws = useRef(null);
  // WebSocket connection for real-time notifications
  useEffect(() => {
    if (userType === 'admin' || userType === 'super_admin') return;
    const socketUrl = `wss://aylms.aryuprojects.com/ws/notifications/?token=${token}`;
    ws.current = new WebSocket(socketUrl);
    ws.current.onopen = () => {
      // setWsConnected(true);
      // setLoading(true);
    };
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'notification') {
        setNotifications((prev) => [data.data, ...prev]);
        const unread = data.data?.filter((notification) => !notification.is_read).length;
        setUnreadCount(unread);
      }
      if (data.type === 'init_notifications') {
        setNotifications(data.data);
        const unread = data.data?.filter((notification) => !notification.is_read).length;
        setUnreadCount(unread);
        // setLoading(false);
      }
    };
    ws.current.onerror = () => {
      // setWsConnected(false);
      dispatch(
        openSnackbar({
          open: true,
          message: 'WebSocket connection error',
          variant: 'error',
          alert: {
            color: 'error'
          },
          close: false
        })
      );
    };
    ws.current.onclose = () => {
      // setWsConnected(false);
    };
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [token, userType]);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const fetchCourseData = useCallback(
    async (courseId, notification, thisIsTopic, thisIsTest) => {
      try {
        let response;
        if (userType === 'tutor') {
          response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/student_profile/${notification.student}`);
        } else if (userType === 'employer') {
          response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/student_profile/${notification.student}`);
        } else {
          response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/student_profile/${regId}/courses/${courseId}`);
        }

        const result = response.data;
        const course = result.data;

        let notify;

        if (thisIsTest) {
          notify = 'assessments';
        } else {
          notify = thisIsTopic ? 'TOPICS' : 'EXERCISE';
        }

        if (result.success && course && courseId) {
          if (userType === 'employer' || userType === 'tutor') {
            navigate(`/students/${notification.student}`, {
              state: {
                name: course.first_name,
                student_id: notification.student,
                notification: notify
              }
            });
          } else {
            navigate(`/course/${courseId}`, {
              state: {
                title: course.course_name,
                courseData: course,
                notification: notify
              }
            });
          }
        }

        return result;
      } catch (err) {
        console.error(err);
        // Even if course data fetch fails, still navigate to the course page
        // navigate(`/course/${courseId}`);
      }
    },
    [userType, regId, navigate]
  );

  const notificationClick = async (notificationId, courseId, topicId, is_read, notification) => {
    try {
      // Only mark as read if it's not already read
      if (userType === 'tutor') {
        !is_read && (await markAsRead(notificationId));
        if (notification.test_id != null) {
          navigate(`/students/${notification.student}`, {
            state: {
              name: notification.student_name,
              student_id: notification.student,
              notification: 'assessments'
            }
          });
          return;
        }
      }
      const thisIsTopic = topicId !== null ? true : false;
      const thisIsTest = notification.test_id !== null ? true : false;
      // Then fetch course data and navigate
      courseId !== null && (await fetchCourseData(courseId, notification, thisIsTopic, thisIsTest));
    } catch (err) {
      console.error('Error handling notification click:', err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${APP_PATH_BASE_URL}api/notifications/mark_read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: notificationId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      await response.json();

      // Update the local state to reflect the read status
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => (notification.id === notificationId ? { ...notification, is_read: true } : notification))
      );

      // Update unread count
      setUnreadCount((prevCount) => prevCount - 1);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const formatNotificationDate = (dateString) => {
    const now = new Date();
    const notificationDate = new Date(dateString);

    // Check if it's today
    const isToday = now.toDateString() === notificationDate.toDateString();

    if (isToday) {
      // Show only time for today
      return notificationDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      // Show date and time for other days
      return notificationDate.toLocaleString([], {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const iconBackColorOpen = theme.palette.mode === ThemeMode.DARK ? 'secondary.200' : 'secondary.200';
  const iconBackColor = theme.palette.mode === ThemeMode.DARK ? 'background.default' : 'secondary.100';

  return (
    <Box sx={{ flexShrink: 0, ml: 0.5 }}>
      {userType !== 'admin' && (
        <IconButton
          color="secondary"
          variant="light"
          aria-label="open profile"
          ref={anchorRef}
          aria-controls={open ? 'profile-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          size="large"
          sx={{ color: 'secondary.main', bgcolor: open ? iconBackColorOpen : iconBackColor, p: 1 }}
        >
          <Badge badgeContent={unreadCount} color="success" sx={{ '& .MuiBadge-badge': { top: 2, right: 4 } }}>
            <Notification variant="Bold" />
          </Badge>
        </IconButton>
      )}
      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [matchesXs ? -5 : 0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position={matchesXs ? 'top' : 'top-right'} sx={{ overflow: 'hidden' }} in={open} {...TransitionProps}>
            <Paper
              sx={{
                boxShadow: theme.customShadows.z1,
                borderRadius: 1.5,
                width: '100%',
                minWidth: 285,
                maxWidth: 420,
                [theme.breakpoints.down('md')]: {
                  maxWidth: 285
                }
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard elevation={0} border={false}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h5">Notifications</Typography>
                  </Stack>
                  <List
                    component="nav"
                    sx={{
                      maxHeight: 400, // Fixed height for the list
                      overflow: 'auto', // Enable scrolling
                      '& .MuiListItemButton-root': {
                        p: 1.5,
                        my: 1.5,
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': {
                          bgcolor: 'primary.lighter',
                          borderColor: theme.palette.primary.light
                        },
                        '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
                      }
                    }}
                  >
                    {notifications?.length === 0 ? (
                      <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>
                        No notifications
                      </Typography>
                    ) : (
                      notifications?.map((notification) => (
                        <ListItemButton
                          key={notification.id}
                          onClick={() =>
                            notificationClick(
                              notification.id,
                              notification.course_id,
                              notification.topic_id,
                              notification.is_read,
                              notification
                            )
                          }
                          sx={{
                            bgcolor: notification.is_read ? 'transparent' : 'action.hover'
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar type="combined">
                              {notification.student_name ? Capitalise(notification.student_name).charAt(0) : 'N'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box variant="h6" mb={1} justifyContent="space-between" sx={{ display: 'flex' }}>
                                <Typography component="span" variant="subtitle1">
                                  {Capitalise(notification.student_name)}
                                </Typography>
                                <Typography variant="caption" noWrap>
                                  {formatNotificationDate(notification.created_at)}
                                </Typography>
                              </Box>
                            }
                            secondary={notification.message}
                          />
                        </ListItemButton>
                      ))
                    )}
                  </List>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default NotificationPage;
