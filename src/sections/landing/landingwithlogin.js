import { Box, Grid } from '@mui/material';
import { Navigate } from 'react-router-dom';

// your existing login component
import Login from 'pages/auth/auth1/login';
// optional landing header/content
import Header from 'sections/landing/Header';

const LandingWithLogin = () => {
  const auth = JSON.parse(localStorage.getItem('auth'));
  const isLoggedIn = !!auth?.token;

  // Redirect logged-in users
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Grid container minHeight="100vh">

        {/* LEFT — LOGIN */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper'
          }}
        >
          <Box width="100%">
           <Header/>
          </Box>
        </Grid>

        {/* RIGHT — LANDING CONTENT */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            bgcolor: 'background.default'
          }}
        >
          <Login/>
          {/* 👉 Add landing text / image / hero section here */}
        </Grid>

      </Grid>
    </Box>
  );
};

export default LandingWithLogin;
