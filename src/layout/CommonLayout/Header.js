import PropTypes from 'prop-types';
import { cloneElement } from 'react';

// material-ui
import AppBar from '@mui/material/AppBar';
import { alpha, useTheme } from '@mui/material/styles';
import {
  useMediaQuery,
  Box,
  Container,
  Stack,
  Toolbar,
  Typography,
  useScrollTrigger
} from '@mui/material';

// project-imports
import Logo from 'components/logo';

// elevation scroll
function ElevationScroll({ children, window }) {
  const theme = useTheme();
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 10,
    target: window ? window : undefined
  });

  return cloneElement(children, {
    style: {
      boxShadow: trigger ? '0 8px 6px -10px rgba(0,0,0,0.5)' : 'none',
      backgroundColor: trigger
        ? alpha(theme.palette.background.default, 0.8)
        : alpha(theme.palette.background.default, 0.1)
    }
  });
}

// ==============================|| HEADER ||============================== //

const Header = ({ layout = 'landing', ...others }) => {
  const theme = useTheme();
  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <ElevationScroll layout={layout} {...others}>
      <AppBar
        sx={{
          bgcolor: alpha(theme.palette.background.default, 0.1),
          backdropFilter: 'blur(8px)',
          color: theme.palette.text.primary,
          boxShadow: 'none'
        }}
      >
        <Container maxWidth="xl" disableGutters={matchDownMd}>
          <Toolbar sx={{ px: { xs: 1.5, sm: 4, md: 0 }, py: 1 }}>

            {/* Desktop */}
            <Stack
              direction="row"
              sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }}
              alignItems="center"
            >
              <Typography component="div">
                <Logo reverse to="/" />
              </Typography>
            </Stack>

            {/* Mobile */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <Logo reverse to="/" />
            </Box>

          </Toolbar>
        </Container>
      </AppBar>
    </ElevationScroll>
  );
};

Header.propTypes = {
  layout: PropTypes.string
};

export default Header;
