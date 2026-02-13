import { useState } from 'react';
// import { Link as RouterLink } from 'react-router-dom';

// material-ui

import AuthCodeVerification from './AuthCodeVerification';
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Grid,
  Dialog,
  DialogContent,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
  CircularProgress
  // Box
} from '@mui/material';

import ForgotPassword from 'pages/auth/auth1/forgot-password';
import AuthResetPassword from 'pages/auth/auth1/reset-password';

// third-party
import * as Yup from 'yup';

import { Formik } from 'formik';

// import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

// project-imports
import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';
// import { useNavigate } from 'react-router-dom';

// assets
import { Eye, EyeSlash } from 'iconsax-react';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
// import { Password } from '@mui/icons-material';

// ============================|| JWT - LOGIN ||============================ //

const AuthLogin = () => {
  const [checked, setChecked] = useState(false);
  const { login } = useAuth();
  const scriptedRef = useScriptRef();
  const [open, setopen] = useState(false);

  const [verify, setverify] = useState(false);
  const [password, setPassword] = useState(false);
  const [email,setEmail]=useState('')
  // const { executeRecaptcha } = useGoogleReCaptcha();

  const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement<any, any>
    },
    ref: React.Ref<unknown>
  ) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

  const [showPassword, setShowPassword] = useState(false);
  // const [recaptchaLoading, setRecaptchaLoading] = useState(false);
  // const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // useEffect(() => {
  //   const verifyRecaptcha = async () => {
  //     if (!executeRecaptcha) return;

  //     const token = await executeRecaptcha('login');

  //     if (token) {
  //       setIsRecaptchaVerified(true);
  //     }
  //   };

  //   verifyRecaptcha();
  // }, [executeRecaptcha]);

  console.log(email,"first page email")

  return (
    <>
      <Formik
        initialValues={{
          email: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().required('Email (or) Username is required'),
          password: Yup.string().min(6, 'Password must be at least 6 characters').max(255).required('Password is required')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting, resetForm }) => {
          try {
            // setRecaptchaLoading(true);

            // Check if reCAPTCHA is available
            // if (!executeRecaptcha) {
            //   throw new Error('Security system not loaded. Please refresh the page.');
            // }

            // Execute reCAPTCHA
            // const recaptchaToken = await executeRecaptcha('login');

            // if (!recaptchaToken) {
            //   throw new Error('Security verification failed. Please try again.');
            // }

            // Call login with email, password, and reCAPTCHA token
            await login(values.email, values.password);

            if (scriptedRef.current) {
              setStatus({ success: true });
              setSubmitting(false);
              window.location.href = '/dashboard';
            }

            // Reset form on success
            resetForm();
          } catch (err) {
            console.error('Login error:', err);

            // Handle specific error cases
            let errorMessage = err.message;

            if (errorMessage.includes('Security verification')) {
              errorMessage = 'Security check failed. Please try again.';
            } else if (errorMessage.includes('invalid credentials') || errorMessage.includes('Invalid credentials')) {
              errorMessage = 'Invalid email or password. Please try again.';
            } else if (errorMessage.includes('timeout')) {
              errorMessage = 'Request timeout. Please check your connection and try again.';
            } else if (err.response?.status === 429) {
              errorMessage = 'Too many login attempts. Please try again later.';
            }

            if (scriptedRef.current) {
              setStatus({ success: false });
              setErrors({ submit: errorMessage });
              setSubmitting(false);
            }
          }
          // finally {
          //   setRecaptchaLoading(false);
          // }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="email-login">Email Address</InputLabel>
                  <OutlinedInput
                    id="email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                    // disabled={isSubmitting || recaptchaLoading}
                    disabled={isSubmitting}
                  />
                  {touched.email && errors.email && (
                    <FormHelperText error id="standard-weight-helper-text-email-login">
                      {errors.email}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="password-login">Password</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="password-login"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                          // disabled={isSubmitting || recaptchaLoading}
                          disabled={isSubmitting}
                        >
                          {showPassword ? <Eye /> : <EyeSlash />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="Enter password"
                    // disabled={isSubmitting || recaptchaLoading}
                    disabled={isSubmitting}
                  />
                  {touched.password && errors.password && (
                    <FormHelperText error id="standard-weight-helper-text-password-login">
                      {errors.password}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ mt: -1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(event) => setChecked(event.target.checked)}
                        name="checked"
                        color="primary"
                        size="small"
                        // disabled={isSubmitting || recaptchaLoading}
                        disabled={isSubmitting}
                      />
                    }
                    label={<Typography variant="h6">Remember me</Typography>}
                  />

                  {open && (
                    <Dialog open={open} onClose={() => setopen(false)} maxWidth="sm" fullWidth TransitionComponent={Transition}>
                      <DialogContent>
                        <ForgotPassword setOpen={setopen} setverify={setverify} setEmail={setEmail}/>
                      </DialogContent>
                    </Dialog>
                  )}
                  {verify && (
                    <Dialog open={verify} onClose={() => setverify(false)} maxWidth="sm" fullWidth>
                      <DialogContent>
                        <AuthCodeVerification setOpen={setopen} setverify={setverify} setPassword={setPassword} curemail={email} />
                      </DialogContent>
                    </Dialog>
                  )}

                  {password && (
                    <Dialog open={password} onClose={() => setPassword(false)} maxWidth="sm" fullWidth>
                      <DialogContent>
                        <AuthResetPassword setverify={setverify} setPasswordFun={(val)=>setPassword(val)} />
                      </DialogContent>
                    </Dialog>
                  )}

                  <Button
                    variant="h6"
                    to="/forgot-password"
                    color="text.primary"
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    onClick={() => setopen(true)}
                  >
                    Forgot Password?
                  </Button>
                </Stack>
              </Grid>

              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error sx={{ textAlign: 'center', fontSize: '0.875rem' }}>
                    {errors.submit}
                  </FormHelperText>
                </Grid>
              )}

              <Grid item xs={12}>
                <AnimateButton>
                  <Button
                    disableElevation
                    disabled={isSubmitting}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={isSubmitting && <CircularProgress size={20} color="inherit" />}
                    sx={{
                      position: 'relative'
                    }}
                  >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </Button>
                </AnimateButton>
                {/* <AnimateButton>
                  <Button
                    disableElevation
                    disabled={!isRecaptchaVerified || isSubmitting || recaptchaLoading || !executeRecaptcha}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={(isSubmitting || recaptchaLoading) && <CircularProgress size={20} color="inherit" />}
                    sx={{
                      position: 'relative'
                    }}
                  >
                    {recaptchaLoading ? 'Verifying...' : isSubmitting ? 'Logging in...' : 'Login'}
                  </Button>
                </AnimateButton> */}

                {/* reCAPTCHA badge notice */}
                {/* <Box sx={{ mt: 1, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', opacity: 0.7 }}>
                    This site is protected by reCAPTCHA and the Google
                    <Link href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" sx={{ mx: 0.5 }}>
                      Privacy Policy
                    </Link>
                    and
                    <Link href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" sx={{ mx: 0.5 }}>
                      Terms of Service
                    </Link>
                    apply.
                  </Typography>
                </Box> */}
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
};

export default AuthLogin;
