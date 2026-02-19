import PropTypes from 'prop-types';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import { Box, Container, Grid, Link, Stack, Typography } from '@mui/material';

// third-party
import { motion } from 'framer-motion';

// project-imports
// import Logo from 'components/logo';
import TechLogo from 'assets/images/AryuTechnologiesLogo-BLE5EufJ.png';
//router
import { Link as RouterLink } from 'react-router-dom';




// assets
// import { Facebook } from 'iconsax-react';

// link - custom style
const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.primary,
  '&:hover, &:active': {
    color: theme.palette.primary.main
  }
}));

// ==============================|| LANDING - FOOTER PAGE ||============================== //

const FooterBlock = () => {
  const theme = useTheme();

  // const linkSX = {
  //   color: theme.palette.text.secondary,
  //   fontWeight: 400,
  //   opacity: '0.6',
  //   cursor: 'pointer',
  //   '&:hover': {
  //     opacity: '1'
  //   }
  // };

  return (
  <Box
    sx={{
      position: 'relative',
      overflow: 'hidden',
      mt: 'auto',
      pt: { xs: 1, md: 2 },
      pb: { xs: 3, md: 4 },
      background: 'linear-gradient(180deg, #fff5f7 0%, #ffffff 70%)',
      borderTop: `1px solid ${theme.palette.divider}`
    }}
  >
    {/* ===== Pink glow blobs ===== */}
    <Box
      component={motion.div}
      animate={{ y: [0, -20, 0] }}
      transition={{ duration: 20, repeat: Infinity }}
      sx={{
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: '50%',
        background: 'rgba(196, 120, 143, 0.25)',
        top: -120,
        left: -120,
        filter: 'blur(70px)',
        zIndex: 0
      }}
    />

    <Box
      component={motion.div}
      animate={{ y: [0, 25, 0] }}
      transition={{ duration: 24, repeat: Infinity }}
      sx={{
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: '50%',
        background: 'rgba(255, 170, 200, 0.25)',
        bottom: -120,
        right: -120,
        filter: 'blur(70px)',
        zIndex: 0
      }}
    />

    {/* ===== Footer Content ===== */}
    <Container sx={{ position: 'relative', zIndex: 1 }}>
      <Grid container spacing={3} alignItems="center">
        {/* LEFT (empty / reserved for future logo if needed) */}
        <Grid item xs={12} md={3} />

        {/* CENTER LINKS */}
        <Grid item xs={12} md={6}>
          <Stack spacing={2} alignItems="center">
            <Stack
              direction="row"
              spacing={3}
              sx={{
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}
            >
              <FooterLink component={RouterLink} to="/terms-and-conditions" underline="none">
                Terms & Conditions
              </FooterLink>

              <FooterLink component={RouterLink} to="/privacy-policy" underline="none">
                Privacy Policy
              </FooterLink>

              <FooterLink href="/refund-policy" target="_blank" underline="none">
                Refund Policy
              </FooterLink>
            </Stack>

            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                textAlign: 'center'
              }}
            >
              © all rights reserved by <strong>Aryu Academy</strong>
            </Typography>
          </Stack>
        </Grid>

        {/* RIGHT – TECH LOGO */}
        <Grid item xs={12} md={3} textAlign="center">
          <Box
            component={motion.div}
            whileHover={{ scale: 1.05 }}
            sx={{ cursor: 'pointer' }}
            onClick={() => window.open('https://aryutechnologies.com/', '_blank')}
          >
            <img
              src={TechLogo}
              alt="Aryu Technologies"
              style={{
                width: '140px',
                opacity: 0.9
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  </Box>
);
}

FooterBlock.propTypes = {
  isFull: PropTypes.bool
};

export default FooterBlock;
