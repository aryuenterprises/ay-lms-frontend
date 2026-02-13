// import { Link } from 'react-router-dom';

// material-ui
import { Grid, Stack, Typography } from '@mui/material';

// project-imports
import useAuth from 'hooks/useAuth';
// import Button from 'themes/overrides/Button';
import Button from '@mui/material/Button';
import CloseTwoToneIcon from '@mui/icons-material/CloseTwoTone';
// import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthForgotPassword from 'sections/auth/auth-forms/AuthForgotPassword';

// ================================|| FORGOT PASSWORD ||================================ //

const ForgotPassword = ({setOpen,setverify,setEmail}) => {
  const { isLoggedIn } = useAuth();
  
  return (
   
      <Grid container spacing={3} padding={4}>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Forgot Password</Typography>
            <Button
              
              to={isLoggedIn ? '/auth/login' : '/login'}
              variant="body1"
              sx={{ textDecoration: 'none' }}
              color="primary"
              onClick={()=>{setOpen(false)}}
            >
            <CloseTwoToneIcon/>
            </Button>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <AuthForgotPassword setverify={setverify} setOpen={setOpen} setEmail={setEmail} />
        </Grid>
      </Grid>
  
  );
};

export default ForgotPassword;
