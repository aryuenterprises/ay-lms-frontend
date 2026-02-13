

import PropTypes from 'prop-types';
import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

// material-ui
import { styled } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import { Box } from '@mui/material';

const Header = lazy(() => import('./Header'));
const FooterBlock = lazy(() => import('./FooterBlock'));

// ==============================|| LOADER ||============================== //

const LoaderWrapper = styled('div')(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 2001,
  width: '100%',
  '& > * + *': {
    marginTop: theme.spacing(2)
  }
}));

const Loader = () => (
  <LoaderWrapper>
    <LinearProgress color="primary" />
  </LoaderWrapper>
);

// ==============================|| COMMON LAYOUT ||============================== //

const CommonLayout = ({ layout = 'blank' }) => {
  return (
    <>
      {(layout === 'landing' || layout === 'simple') && (
        <Suspense fallback={<Loader />}>
          {/* 🔥 FLEX WRAPPER */}
          <Box
            sx={{
              minHeight: '100vh',        // REQUIRED
              display: 'flex',           // REQUIRED
              flexDirection: 'column'    // REQUIRED
            }}
          >
            {/* HEADER */}
            <Header layout={layout} />

            {/* PAGE CONTENT */}
            <Box sx={{ flexGrow: 1 }}>
              <Outlet />
            </Box>

            {/* FOOTER */}
            <FooterBlock isFull={layout === 'landing'} />
          </Box>
        </Suspense>
      )}

      {layout === 'blank' && <Outlet />}
    </>
  );
};

CommonLayout.propTypes = {
  layout: PropTypes.string
};

export default CommonLayout;
