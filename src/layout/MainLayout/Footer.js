// import { Link as RouterLink } from 'react-router-dom';

// material-ui
import { Stack, Typography, Link } from '@mui/material';

// ==============================|| MAIN LAYOUT - FOOTER ||============================== //

const Footer = () => (
  <Stack
    direction="row"
    justifyContent="center"
    alignItems="center"
    sx={{ p: '24px 16px 0px', mt: 'auto' }}
  >
    <Typography variant="caption">
      &copy; {new Date().getFullYear()}{' '}
      <Link
        href="https://aryuacademy.com"   // change to your website
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
        color="inherit"
        sx={{ fontWeight: 500 }}
      >
        Aryu Academy Private Limited
      </Link>{' '}
      ♥
    </Typography>

    <Stack spacing={1.5} direction="row" justifyContent="space-between" alignItems="center">
      {/* additional links */}
    </Stack>
  </Stack>
);

export default Footer;
