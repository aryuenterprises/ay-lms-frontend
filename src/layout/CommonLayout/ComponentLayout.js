import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import { useMediaQuery, Box } from '@mui/material';

// project-imports
import Drawer from './Drawer';
import { DRAWER_WIDTH } from 'config';

import { dispatch } from 'store';
import { openComponentDrawer } from 'store/reducers/menu';

// components content
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  minHeight: `calc(100vh - 180px)`,
  width: `calc(100% - ${DRAWER_WIDTH}px)`,
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  [theme.breakpoints.down('md')]: {
    paddingLeft: 0
  },
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}));

// ==============================|| COMPONENTS LAYOUT ||============================== //

const ComponentsLayout = ({ handleDrawerOpen, componentDrawerOpen }) => {
  const theme = useTheme();
  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    dispatch(openComponentDrawer({ componentDrawerOpen: !matchDownMd }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchDownMd]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>

      {/* LEFT LOGIN PANEL */}
      <Box
        sx={{
          width: 400,
          borderRight: `1px solid ${theme.palette.divider}`,
          overflowY: 'auto',
          display: { xs: 'none', md: 'block' }
        }}
      >
        {/* LIMIT LOGIN HEIGHT */}
        <Box sx={{ minHeight: '100%', display: 'flex', alignItems: 'flex-start' }}>
          <Login />
        </Box>
      </Box>

      {/* RIGHT CONTENT */}
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Drawer handleDrawerOpen={handleDrawerOpen} open={componentDrawerOpen} />
        <Main theme={theme} open={componentDrawerOpen}>
          <Outlet />
        </Main>
      </Box>

    </Box>
  );


  ComponentsLayout.propTypes = {
    handleDrawerOpen: PropTypes.func,
    componentDrawerOpen: PropTypes.bool
  };

  export default ComponentsLayout;
