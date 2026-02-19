import PropTypes from 'prop-types';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, ButtonBase, CardContent, ClickAwayListener, Grid, Paper, Popper, Stack, Tooltip, Typography } from '@mui/material';

// project-imports

// import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';
import IconButton from 'components/@extended/IconButton';
import useAuth from 'hooks/useAuth';
import { ThemeMode } from 'config';

import AdminImage from 'assets/images/favicon.svg';

import { openSnackbar } from 'store/reducers/snackbar';
import { dispatch } from 'store';

// assets
import { Logout } from 'iconsax-react';
import { Capitalise } from 'utils/capitalise';

import { APP_PATH_BASE_URL } from 'config';
import axiosInstance from 'utils/axios';
const avatarImage = require.context('assets/images/users/', true);
// tab panel wrapper
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
      sx={{ p: 1 }}
    >
      {value === index && children}
    </Box>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

// ==============================|| HEADER CONTENT - PROFILE ||============================== //

const ProfilePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const { logout, user } = useAuth();
  const handleLogout = async () => {
    try {
      await logout();
      navigate(`/`, {
        state: {
          from: ''
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const [data, setData] = useState([]);
  const [avatar, setAvatar] = useState(avatarImage(`./avatar-thumb-1.png`));
  // console.log('avatar :', avatar);
  const userId = user?.employee_id || user?.user_id;
  const regId = user?.student_id;
  const userType = user?.user_type;

  const fetchData = useCallback(async () => {
    try {
      let response;
      if (userType === 'tutor') {
        response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/trainers/${userId}`);
      } else if (userType === 'student') {
        response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/student_profile/${regId}`);
      } else if (userType === 'super_admin') {
        response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/settings`);

        // console.log(response,"working in here ")
      } else {
        // If user is neither tutor nor student (e.g., admin), set AdminImage immediately
        setAvatar(AdminImage);
        return;
      }

      const result = response.data;
      if (userType === 'tutor') {
        setData(result.data);
        setAvatar(result.profile_pic_url ? `${result.profile_pic_url}` : AdminImage);
      } else if (userType === 'student') {
        setData(result.data);
        setAvatar(result.data.profile_pic ? `${result.data.profile_pic}` : AdminImage);
      } else {
        setData(result.data);
        setAvatar(result.data.secondary_logo_url ? `${result.data.secondary_logo_url}` : AdminImage);
      }
    } catch (err) {
      console.error('Error fetching user data:', err.message);
      setAvatar(AdminImage); // Fallback to AdminImage on error
      dispatch(
        openSnackbar({
          open: true,
          message: 'Failed to load user data',
          variant: 'alert',
          alert: { color: 'error' },
          close: false
        })
      );
    }
  }, [userId, regId, userType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <ButtonBase
        sx={{
          p: 0.25,
          borderRadius: 1,
          '&:hover': { bgcolor: theme.palette.mode === ThemeMode.DARK ? 'secondary.light' : 'secondary.lighter' },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.secondary.dark}`,
            outlineOffset: 2
          }
        }}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        {/* <Avatar alt="profile user" src={avatar} /> */}
        <img
          src={avatar}
          alt="profile user"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            objectPosition: 'center',
            objectFit: 'contain'
          }}
        />
      </ButtonBase>
      <Popper
        placement="bottom-end"
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
                offset: [0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position="top-right" in={open} {...TransitionProps}>
            <Paper
              sx={{
                boxShadow: theme.customShadows.z1,
                width: 290,
                minWidth: 240,
                maxWidth: 290,
                [theme.breakpoints.down('md')]: {
                  maxWidth: 250
                },
                borderRadius: 1.5
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} content={false}>
                  <CardContent sx={{ px: 2.5, pt: 3 }}>
                    <Grid container justifyContent="space-between" alignItems="center">
                      <Grid item>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          <img
                            src={avatar}
                            alt="profile user"
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              objectPosition: 'center',
                              objectFit: 'contain'
                            }}
                          />
                          <Stack>
                            <Typography variant="subtitle1">{user?.name}</Typography>
                            {userType === 'tutor' && (
                              <Typography variant="body2" sx={{ color: 'primary.secondary', fontWeight: 600 }}>
                                {Capitalise(data.full_name?.split(' ')[0])}
                              </Typography>
                            )}
                            {userType === 'student' && (
                              <Typography variant="body2" sx={{ color: 'primary.secondary', fontWeight: 600 }}>
                                {Capitalise(data.first_name?.split(' ')[0])}
                              </Typography>
                            )}
                            {userType === 'admin' && (
                              <Typography variant="body2" sx={{ color: 'primary.secondary', fontWeight: 600 }}>
                                Admin
                              </Typography>
                            )}
                            {userType === 'super_admin' && (
                              <Typography variant="body2" sx={{ color: 'primary.secondary', fontWeight: 600 }}>
                                {data.company_name || 'Super Admin'}
                              </Typography>
                            )}
                          </Stack>
                        </Stack>
                      </Grid>
                      <Grid item>
                        <Tooltip title="Logout">
                          <IconButton size="large" color="error" sx={{ p: 1 }} onClick={handleLogout}>
                            <Logout variant="Bulk" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default ProfilePage;
