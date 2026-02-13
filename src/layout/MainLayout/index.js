// src/layout/MainLayout/index.js (updated)
import { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
// import Button from '@mui/material/Button';

// material-ui
import { useTheme } from '@mui/material/styles';
import { useMediaQuery, Box, Container, Toolbar, Badge } from '@mui/material';
import { IconButton } from '@mui/material';

// project-imports
import Drawer from './Drawer';
import Header from './Header';
import Footer from './Footer';
import HorizontalBar from './Drawer/HorizontalBar';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import ChatPopup from 'components/ChatPopup';

import { DRAWER_WIDTH } from 'config';
import MainRoutes from 'routes/MainRoutes';
import useConfig from 'hooks/useConfig';
import { dispatch } from 'store';
import { openDrawer } from 'store/reducers/menu';
import { MenuOrientation } from 'config';

// contexts
import { ChatProvider } from 'contexts/ChatContext'; // Add this import
import { useChat } from 'contexts/ChatContext'; // Add this import
import Chat from 'assets/images/icons/chat-1.svg';
import axiosInstance from 'utils/axios';
import { APP_PATH_BASE_URL } from 'config';

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayoutContent = () => {
  const theme = useTheme();
  const downXL = useMediaQuery(theme.breakpoints.down('xl'));
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));
  const { toggleChat, isChatOpen, closeChat } = useChat();

  const { container, miniDrawer, menuOrientation } = useConfig();

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  const auth = localStorage.getItem('auth');
  const userType = auth ? JSON.parse(auth).loginType : null;

  const [unreadCount, setUnreadCount] = useState(0);

  // set media wise responsive drawer
  useEffect(() => {
    if (!miniDrawer) {
      dispatch(openDrawer(!downXL));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downXL]);

  const fetchData = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/notifications`);
      const result = response.data;
      // Calculate unread count
      const unread = result.unread_messages;
      setUnreadCount(unread);

      return result;
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (userType !== 'admin') {
      fetchData();

      const intervalId = setInterval(fetchData, 30 * 1000);

      return () => clearInterval(intervalId);
    }
  }, [fetchData, userType]);

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Header />
      {!isHorizontal ? <Drawer /> : <HorizontalBar />}

      <Box
        component="main"
        sx={{
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          flexGrow: 1,
          pt: 0,
          px: { xs: 2, md: 3 },
          pb: { xs: 2, md: 3 }
        }}
      >
        <Toolbar sx={{ mt: isHorizontal ? 8 : 'inherit', mb: isHorizontal ? 2 : 'inherit' }} />
        <Container
          maxWidth={container ? 'xl' : false}
          sx={{
            xs: 0,
            ...(container && { px: { xs: 0, md: 2 } }),
            position: 'relative',
            minHeight: 'calc(100vh - 110px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Breadcrumbs navigation={MainRoutes} title titleBottom card={false} divider={false} />

          <Outlet />
          <Footer />
        </Container>
        {(userType === 'tutor' || userType === 'student' || userType == 'admin') && !isChatOpen && (
          <Box sx={{ position: 'fixed', right: '2%', bottom: '6%', zIndex: 999 }}>
            <IconButton size="extraLarge" color="success" onClick={toggleChat}>
              <Badge badgeContent={unreadCount} color="success" sx={{ '& .MuiBadge-badge': { top: 2, right: 4 } }}>
                <img src={Chat} alt="Chat" style={{ width: '40px', height: '40px' }} />
              </Badge>
            </IconButton>
          </Box>
        )}
      </Box>
      <ChatPopup isChatOpen={isChatOpen} closeChat={closeChat} />
    </Box>
  );
};

const MainLayout = () => {
  return (
    <ChatProvider>
      <MainLayoutContent />
    </ChatProvider>
  );
};

export default MainLayout;
