import PropTypes from 'prop-types';

// material-ui
import { alpha, styled } from '@mui/material/styles';
import { Box } from '@mui/material';

// third-party
import SimpleBar from 'simplebar-react';
import { BrowserView, MobileView } from 'react-device-detect';

// root style
const RootStyle = styled(BrowserView)({
  flexGrow: 1,
  height: '100%',
  overflow: 'hidden'
});

// scroll bar wrapper
const SimpleBarStyle = styled(SimpleBar)(({ theme }) => ({
  maxHeight: '100%',
  '& .simplebar-scrollbar': {
    '&:before': {
      backgroundColor: alpha(theme.palette.secondary.main, 0.25)
    },
    '&.simplebar-visible:before': {
      opacity: 1
    }
  },
  '& .simplebar-track.simplebar-vertical': {
    width: 10
  },
  '& .simplebar-track.simplebar-horizontal .simplebar-scrollbar': {
    height: 6
  },
  '& .simplebar-mask': {
    zIndex: 'inherit'
  }
}));

// ==============================|| SIMPLE SCROLL BAR  ||============================== //

export default function SimpleBarScroll({ children, sx, ...other }) {
  return (
    <>
      <RootStyle>
        <SimpleBarStyle clickOnTrack={false} sx={sx} {...other}>
          {children}
        </SimpleBarStyle>
      </RootStyle>
      <MobileView>
        <Box sx={{ overflowX: 'auto', ...sx }} {...other}>
          {children}
        </Box>
      </MobileView>
    </>
  );
}

SimpleBarScroll.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object
};

// import { alpha, Box } from '@mui/material';
// import PropTypes from 'prop-types';
// import { useEffect, useState } from 'react';

// export default function SimpleBarScroll({ children, sx, ...other }) {
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };

//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   // Use native scrollbar with consistent styling
//   const scrollbarStyles = {
//     '&::-webkit-scrollbar': {
//       width: '10px'
//     },
//     '&::-webkit-scrollbar-track': {
//       background: 'transparent'
//     },
//     '&::-webkit-scrollbar-thumb': {
//       backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.25),
//       borderRadius: '5px'
//     },
//     scrollbarWidth: 'thin',
//     scrollbarColor: (theme) => `${alpha(theme.palette.secondary.main, 0.25)} transparent`
//   };

//   return (
//     <Box
//       sx={{
//         flexGrow: 1,
//         height: '100%',
//         overflow: 'auto',
//         ...scrollbarStyles,
//         // Reserve space for scrollbar to prevent layout shift
//         paddingRight: !isMobile ? '10px' : 0,
//         ...sx
//       }}
//       {...other}
//     >
//       {children}
//     </Box>
//   );
// }

// SimpleBarScroll.propTypes = {
//   children: PropTypes.node,
//   sx: PropTypes.object
// };
