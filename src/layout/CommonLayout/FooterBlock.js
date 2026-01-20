import PropTypes from 'prop-types';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import { Box, Container, Grid, Link, Stack, Typography } from '@mui/material';

// third-party
import { motion } from 'framer-motion';

// project-imports
import Logo from 'components/logo';
import TechLogo from 'assets/images/AryuTechnologiesLogo-BLE5EufJ.png';

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

const FooterBlock = ({ isFull }) => {
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
    <>
      <Box sx={{ pt: isFull ? 5 : 10, pb: 10, bgcolor: 'secondary.200', borderTop: `1px solid ${theme.palette.divider}` }}>
        <Container>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <motion.div
                initial={{ opacity: 0, translateY: 550 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 150,
                  damping: 30
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Logo reverse to="/" />
                  </Grid>
                </Grid>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={{ xs: 5, md: 2 }} xs={12} alignItems="center">
                <Grid item xs={12}>
                  <Stack spacing={3}>
                    <Stack
                      direction="row"
                      spacing={3}
                      sx={{
                        mb: { xs: 2, sm: 0 },
                        justifyContent: { xs: 'center', sm: 'center' },
                        alignItems: { xs: 'center', sm: 'center' },
                        display: { xs: 'none', sm: 'flex' },
                        gap: 1
                      }}
                    >
                      <FooterLink href="/terms-and-conditions" target="_blank" underline="none">
                        Terms and condition
                      </FooterLink>
                      <FooterLink href="/privacy-policy" target="_blank" underline="none">
                        Privacy policy
                      </FooterLink>
                      <FooterLink href="/refund-policy" target="_blank" underline="none">
                        Refund policy
                      </FooterLink>
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={3}
                      sx={{
                        mb: { xs: 2, sm: 0 },
                        display: { xs: 'none', sm: 'flex' },
                        gap: 1,
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                        © all rights reserved by Aryu Academy
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={3}>
              <motion.div
                initial={{ opacity: 0, translateY: 550 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 150,
                  damping: 30
                }}
              >
                <Grid container spacing={2}>
                  <Grid
                    item
                    xs={12}
                    sx={{ textAlign: 'center', ml: 4, cursor: 'pointer' }}
                    onClick={() => window.open('https://aryutechnologies.com/', '_blank')}
                  >
                    <img src={TechLogo} alt="Aryu Technologies" style={{ width: '60%' }} />
                  </Grid>
                </Grid>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

FooterBlock.propTypes = {
  isFull: PropTypes.bool
};

export default FooterBlock;
