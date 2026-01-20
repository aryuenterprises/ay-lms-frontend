// material-ui
import { Box, Grid, Stack, Typography } from '@mui/material';

// project-imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthResetPassword from 'sections/auth/auth-forms/AuthResetPassword';

// ================================|| RESET PASSWORD ||================================ //

const ResetPassword = () => {
  const handleBack = () => {
    window.history.go(-2);
  };

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack sx={{ mb: { xs: -0.5, sm: 0.5 } }} spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h3">Reset Password</Typography>
              <Typography color="primary" sx={{ cursor: 'pointer', mt: 1 }} onClick={() => handleBack()}>
                Back to Login
              </Typography>
            </Box>
            <Typography color="secondary">Please choose your new password</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <AuthResetPassword />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
};

export default ResetPassword;
