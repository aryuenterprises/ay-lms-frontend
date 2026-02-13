// material-ui
import { Box, Grid, Stack, Typography } from '@mui/material';
import { useLocation } from 'react-router';

// project-imports
// import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthCodeVerification from 'sections/auth/auth-forms/AuthCodeVerification';

// ================================|| CODE VERIFICATION ||================================ //

const CodeVerification = () => {
  const location = useLocation();
  const { email } = location.state || {};

  const handleBack = () => {
    window.history.back();
  };

  return (
    // <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h3">Enter Verification Code</Typography>
              <Typography color="primary" sx={{ cursor: 'pointer', mt: 1 }} onClick={() => handleBack()}>
                Back to Login
              </Typography>
            </Box>
            <Typography color="secondary">We send you on mail.</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Typography>We`ve send you code on {email}.</Typography>
        </Grid>
        <Grid item xs={12}>
          <AuthCodeVerification />
        </Grid>
      </Grid>
    // </AuthWrapper>
  );
};

export default CodeVerification;
