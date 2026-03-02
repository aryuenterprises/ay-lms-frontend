import PropTypes from 'prop-types';
import { cloneElement, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// MUI
import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  IconButton,
  Drawer,
  Divider,
  useScrollTrigger
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { alpha, useTheme } from '@mui/material/styles';

// Project
import Logo from 'components/logo';
import { Link as RouterLink } from 'react-router-dom';

/* ---------------- Elevation on Scroll ---------------- */
function ElevationScroll({ children, window }) {
  const theme = useTheme();
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 10,
    target: window ?? undefined
  });

  return cloneElement(children, {
    style: {
      backdropFilter: 'blur(12px)',
      backgroundColor: alpha(theme.palette.background.default, trigger ? 0.85 : 0.5),
      boxShadow: trigger ? '0 12px 30px rgba(0,0,0,0.12)' : 'none',
      transition: 'all 0.3s ease'
    }
  });
}

/* ---------------- Motion Button ---------------- */
const MotionButton = motion(Button);

/* ============================== HEADER ============================== */
const Header = ({ layout = 'landing', ...others }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const menuItems = [
    {
      label: 'Webinars',
      external: true,
      href: 'https://workshop.aryuacademy.com/'
    },
    {
      label: 'Support',
      to: '/webinar-ticket'
    },
    {
      label: 'Become a Trainer',
      to: '/tutor-signup'
    }
  ];

  return (
    <ElevationScroll layout={layout} {...others}>
      <AppBar position="fixed">
        <Container maxWidth="xl">
          <Toolbar
            sx={{
              py: 1.5,
              px: { xs: 2, sm: 4 },
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            {/* Logo */}
            <Logo reverse to="/" />

            {/* Desktop Menu */}
            <Stack
              direction="row"
              spacing={3}
              alignItems="center"
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              {menuItems.map((item) => (
                <MotionButton
                  key={item.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  variant="contained"
                  component={item.external ? 'a' : RouterLink}
                  href={item.external ? item.href : undefined}
                  to={!item.external ? item.to : undefined}
                  target={item.external ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  sx={{
                    px: 3,
                    borderRadius: 6,
                    textTransform: 'none',
                    fontWeight: 600,
                    background:
                      'linear-gradient(135deg, #c62828, #ad1f1f)',
                    boxShadow: '0 8px 24px rgba(183,28,28,0.3)'
                  }}
                >
                  {item.label}
                </MotionButton>
              ))}
            </Stack>

            {/* Mobile Menu Button */}
            <IconButton
              sx={{ display: { xs: 'flex', md: 'none' } }}
              onClick={() => setOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>

        {/* ---------------- Mobile Drawer ---------------- */}
        <AnimatePresence>
          {open && (
            <Drawer
              anchor="right"
              open={open}
              onClose={() => setOpen(false)}
              PaperProps={{
                sx: {
                  width: '100%',
                  maxWidth: 360,
                  background: alpha(theme.palette.background.default, 0.95)
                }
              }}
            >
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <Box p={3}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Logo reverse to="/" />
                    <IconButton onClick={() => setOpen(false)}>
                      <CloseIcon />
                    </IconButton>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Stack spacing={2}>
                    {menuItems.map((item) => (
                      <MotionButton
                        key={item.label}
                        fullWidth
                        whileTap={{ scale: 0.95 }}
                        variant="contained"
                        component={item.external ? 'a' : RouterLink}
                        href={item.external ? item.href : undefined}
                        to={!item.external ? item.to : undefined}
                        target={item.external ? '_blank' : undefined}
                        onClick={() => setOpen(false)}
                        sx={{
                          py: 1.5,
                          borderRadius: 6,
                          textTransform: 'none',
                          fontWeight: 600,
                          background:
                            'linear-gradient(135deg, #c62828, #ad1f1f)'
                        }}
                      >
                        {item.label}
                      </MotionButton>
                    ))}
                  </Stack>
                </Box>
              </motion.div>
            </Drawer>
          )}
        </AnimatePresence>
      </AppBar>
    </ElevationScroll>
  );
};

Header.propTypes = {
  layout: PropTypes.string
};

export default Header;