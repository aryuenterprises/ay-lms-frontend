// import { Link as RouterLink } from 'react-router-dom';

// material-ui
import { Stack, Typography } from '@mui/material';

// ==============================|| MAIN LAYOUT - FOOTER ||============================== //

const Footer = () => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: '24px 16px 0px', mt: 'auto' }}>
    <Typography variant="caption">&copy; Aryu ♥</Typography>
    <Stack spacing={1.5} direction="row" justifyContent="space-between" alignItems="center">
      {/* <Link component={RouterLink} to="support" target="_blank" variant="caption" color="textPrimary">
        Support
      </Link> */}
    </Stack>
  </Stack>
);

export default Footer;
