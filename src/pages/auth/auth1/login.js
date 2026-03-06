import { Grid, Typography, Container, Box, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import AuthLogin from 'sections/auth/auth-forms/AuthLogin';

// ================================|| LOGIN ||================================ //
const Login = () => {
  const theme = useTheme();

  return (
    <Container
      disableGutters
      // sx={{
      //   width: '100%',
      //   maxWidth: 600,
      //   mx: 'auto',
      // }}
      sx={{
        minWidth: 500,
        
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <Box
          sx={{
            px: { xs: 2.5, sm: 3 },
            py: { xs: 3, sm: 3.5 },
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
            boxShadow: '0 20px 45px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.06)'
          }}
        >
          <Grid container spacing={2.5} sx={{minWidth: 400}}>
            {/* ---------- Header ---------- */}
            <Grid item xs={12} textAlign="center">
              <Typography
                sx={{
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  color: '#1c1c1c'
                }}
              >
                Welcome Back
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 14,
                  color: '#666'
                }}
              >
                Sign in to continue to Aryu Academy
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ opacity: 0.6 }} />
            </Grid>

            {/* ---------- Form ---------- */}
            <Grid item xs={12} sx={{width: '100%', maxWidth: 600, mx: 'auto'}}>
              <AuthLogin />
            </Grid>

            {/* ---------- Footer ---------- */}
            <Grid item xs={12} textAlign="center">
              <Typography
                sx={{
                  fontSize: 13,
                  color: '#777'
                }}
              >
                Secure access for students & staff
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </motion.div>
    </Container>
  );
};

export default Login;