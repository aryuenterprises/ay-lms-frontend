// import { Link } from 'react-router-dom';

// material-ui
import { Grid, Typography, Container, Box } from '@mui/material';

// project-imports
// import Logo from 'components/logo';
// import useAuth from 'hooks/useAuth';
// import AuthDivider from 'sections/auth/AuthDivider';
// import AuthSocButton from 'sections/auth/AuthSocButton';

// import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthLogin from 'sections/auth/auth-forms/AuthLogin';

// assets
// import imgGoogle from 'assets/images/auth/google.svg';
// import imgGithub from 'assets/images/auth/github.svg';
// import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

import { useTheme } from '@mui/material/styles';
// import { Theme } from 'emoji-picker-react';
// import { Navigate } from 'react-router-dom';

// ================================|| LOGIN ||================================ //
const Login = () => {
  // const { isLoggedIn } = useAuth();
  const theme = useTheme();
  // const auth = JSON.parse(localStorage.getItem('auth'));

  // if (auth?.token) {
  //   return <Navigate to="/dashboard" replace />;
  // }

  return (
    // <GoogleReCaptchaProvider
    //   reCaptchaKey="6Ld5EyEsAAAAAMsQJ-ioz2ZRzgAsgbfjFIHcT3Hl"
    //   scriptProps={{
    //     async: true,
    //     defer: true,
    //     appendTo: 'head'
    //   }}
    //   container={{
    //     parameters: {
    //       badge: 'inline',
    //       theme: 'light'
    //     }
    //   }}
    // >
    <Box
      sx={{
        width: '100%',
        maxWidth: { xs: '100%', sm: 480, md: 650 }, // wider
        m: 2,
        mt: 10,
        p: 2.5,
        borderRadius: 5,
        backgroundColor: theme.palette.background.paper,
        boxShadow: 3
      }}
    >
      {/* LOGIN BOX */}

      <Container
        disableGutters
        sx={{
          maxWidth: "md", // your desired width
          mx: 'auto' // center it
        }}
      >
        <Grid container spacing={3} >
          <Grid item xs={12} textAlign="center">
            <Typography variant="h3">Login</Typography>
          </Grid>

          {/* <Grid item xs={12}>
              <AuthSocButton>
                <img src={imgGithub} alt="Github" style={{ margin: '0 10px' }} />
                Sign In with Github
              </AuthSocButton>
            </Grid> */}

          {/* <Grid item xs={12}>
              <AuthSocButton>
                <img src={imgGoogle} alt="Google" style={{ margin: '0 10px', width: 20 }} />
                Sign In with Google
              </AuthSocButton>
            </Grid> */}

          {/* <Grid item xs={12}>
              <AuthDivider>
                <Typography variant="body1">OR</Typography>
              </AuthDivider>
            </Grid> */}

          <Grid item xs={12}>
            <AuthLogin />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;
