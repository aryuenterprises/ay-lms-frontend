import PropTypes from 'prop-types';
import { cloneElement } from 'react';

// material-ui
import AppBar from '@mui/material/AppBar';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Button, Container, Stack, Toolbar, useScrollTrigger } from '@mui/material';

// project-imports
import Logo from 'components/logo';
import { Link as RouterLink } from 'react-router-dom';

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
      backgroundColor: trigger ? alpha(theme.palette.background.default, 0.8) : alpha(theme.palette.background.default, 0.1)
    }
  });
}

// ==============================|| HEADER ||============================== //

const Header = ({ layout = 'landing', ...others }) => {
  const theme = useTheme();

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
        <Container maxWidth="xl">
          <Toolbar
            sx={{
              py: 1.5,
              px: { xs: 2, sm: 4, md: 6 },
              backdropFilter: 'blur(6px)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            {/* LEFT: Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Logo reverse to="/" />
            </Box>

            {/* RIGHT: Desktop Menu */}
            <Stack direction="row" spacing={4} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
              {/* <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: 'pointer',
                  '&:hover': { color: '#b71c1c' }
                }}
              >
                Programs
              </Typography>

              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: 'pointer',
                  '&:hover': { color: '#b71c1c' }
                }}
              >
                Contact
              </Typography> */}

              {/* CTA */}
              <Button
                variant="contained"
                component="a"
                href="https://workshop.aryuacademy.com/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  ml: 2,
                  px: 3,
                  borderRadius: 6,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 6px 18px rgba(183,28,28,0.25)',
                  background: 'linear-gradient(135deg, #c62828, #ad1f1f)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ad1f1f, #8e1a1a)'
                  }
                }}
              >
                Webinars
              </Button>

              <Button
                variant="contained"
                component={RouterLink}
                to="/tutor-signup"
                sx={{
                  ml: 2,
                  px: 3,
                  borderRadius: 6,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 6px 18px rgba(183,28,28,0.25)',
                  background: 'linear-gradient(135deg, #c62828, #ad1f1f)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ad1f1f, #8e1a1a)'
                  }
                }}
              >
                Become a Trainer
              </Button>
            </Stack>

            {/* Mobile */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <Button
                size="small"
                variant="contained"
                component={RouterLink}
                to="/tutor-signup"
                sx={{
                  borderRadius: 5,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Join
              </Button>
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
