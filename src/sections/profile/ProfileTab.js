import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

// assets
import { Profile, RecordCircle } from 'iconsax-react';

function getPathIndex(pathname) {
  let selectedTab = 0;
  switch (pathname) {
    case '/user/tutor':
      selectedTab = 1;
      break;
    case '/user/password':
      selectedTab = 2;
      break;
    case '/user/student':
      selectedTab = 3;
      break;
    case '/user/recording':
      selectedTab = 4;
      break;
    case '/user/certificate':
      selectedTab = 5;
      break;
    case '/user/personal':
    default:
      selectedTab = 0;
  }
  return selectedTab;
}

// ==============================|| USER PROFILE - BASIC ||============================== //

const ProfileTab = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [selectedIndex, setSelectedIndex] = useState(getPathIndex(pathname));
  const [loginType, setLoginType] = useState('');

  useEffect(() => {
    // Get loginType from localStorage when component mounts
    const auth = JSON.parse(localStorage.getItem('auth'));
    const type = auth?.loginType;
    if (type) {
      setLoginType(type);
    }
  }, []);

  const handleListItemClick = (index, route) => {
    setSelectedIndex(index);
    navigate(route);
  };

  useEffect(() => {
    setSelectedIndex(getPathIndex(pathname));
  }, [pathname]);

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32, color: theme.palette.secondary.main } }}>
      <ListItemButton selected={selectedIndex === 0} onClick={() => handleListItemClick(0, '/user/personal')}>
        <ListItemIcon>
          <Profile size={18} />
        </ListItemIcon>
        <ListItemText primary="Personal Information" />
      </ListItemButton>

      {/* Show Tutor Information only if loginType is student */}
      {loginType === 'student' && (
        <ListItemButton selected={selectedIndex === 1} onClick={() => handleListItemClick(1, '/user/tutor')}>
          <ListItemIcon>
            <Profile size={18} />
          </ListItemIcon>
          <ListItemText primary="Tutor Information" />
        </ListItemButton>
      )}

      {/* Show Student Information only if loginType is tutor */}
      {loginType === 'tutor' && (
        <ListItemButton selected={selectedIndex === 3} onClick={() => handleListItemClick(3, '/user/student')}>
          <ListItemIcon>
            <Profile size={18} />
          </ListItemIcon>
          <ListItemText primary="Student Information" />
        </ListItemButton>
      )}

      {loginType === 'student' && (
        <ListItemButton selected={selectedIndex === 4} onClick={() => handleListItemClick(3, '/user/recording')}>
          <ListItemIcon>
            <RecordCircle size={18} />
          </ListItemIcon>
          <ListItemText primary="Recordings" />
        </ListItemButton>
      )}

      {/* {loginType === 'student' && (
        <ListItemButton selected={selectedIndex === 5} onClick={() => handleListItemClick(4, '/user/certificate')}>
          <ListItemIcon>
            <RecordCircle size={18} />
          </ListItemIcon>
          <ListItemText primary="Certificate" />
        </ListItemButton>
      )} */}

      {/* <ListItemButton selected={selectedIndex === 2} onClick={() => handleListItemClick(2, '/user/password')}>
        <ListItemIcon>
          <Lock size={18} />
        </ListItemIcon>
        <ListItemText primary="Change Password" />
      </ListItemButton> */}
    </List>
  );
};

export default ProfileTab;
