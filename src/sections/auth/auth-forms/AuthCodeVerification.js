import { useState, useRef, useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Button, Grid, Stack, Typography, TextField } from '@mui/material';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';
// import {CloseTwoToneIcon} from @mui/

import CloseTwoTone from '@mui/icons-material/CloseTwoTone';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// project-imports
import AnimateButton from 'components/@extended/AnimateButton';
import { ThemeMode } from 'config';
// import { useLocation, useNavigate } from 'react-router';
import axiosInstance from 'utils/axios';
import { APP_PATH_BASE_URL } from 'config';
import Swal from 'sweetalert2';

// ============================|| STATIC - CODE VERIFICATION ||============================ //

const AuthCodeVerification = ({ setOpen, setverify,setPassword,curemail}) => {
  const theme = useTheme();
  // const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
// console.log(curemail,"enter success")
  // const location = useLocation();
  const email = curemail|| {};

  // console.log(email,"EMAIL")

  const borderColor = theme.palette.mode === ThemeMode.DARK ? theme.palette.secondary[200] : theme.palette.secondary.light;

  // Timer effect
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(false);
    }

    return () => clearInterval(interval);
  }, [timer]);

  // Start timer function
  const startTimer = () => {
    setTimer(30);
  };

  // Validation Schema
  const validationSchema = Yup.object({
    code: Yup.string().length(6, 'Code must be exactly 6 characters').required('Verification code is required')
  });

  // Initial Values
  const initialValues = {
    code: ''
  };

  const handleChange = (index, value, setFieldValue) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Update Formik field value
      const code = newOtp.join('');
      setFieldValue('code', code);

      // Auto-focus to next input
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e, setFieldValue) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const pastedArray = pastedData.split('');

    const newOtp = [...otp];
    pastedArray.forEach((char, index) => {
      if (index < 6) {
        newOtp[index] = char;
      }
    });

    setOtp(newOtp);

    // Update Formik field value
    const code = newOtp.join('');
    setFieldValue('code', code);

    // Focus on the last filled input or the last one
    const lastFilledIndex = Math.min(pastedArray.length - 1, 5);
    if (inputRefs.current[lastFilledIndex]) {
      inputRefs.current[lastFilledIndex].focus();
    }
  };

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const res = await axiosInstance.post(`${APP_PATH_BASE_URL}api/verify-otp/`, {
        email,
        otp: values.code
      });
   
      
      if (res.data.success === false) {
        await Swal.fire('Error', res.data.message, 'error');
        return;
      } else {
        await Swal.fire('Success', res.data.message, 'success');
        // navigate('/reset-password', { state: { email } });
        setverify(false)
        setPassword(true)
        
      }
    } catch (err) {
      console.error(err);
      setErrors({ submit: err.response?.data?.message || 'Verification failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (canResend) return;
    setCanResend(true);
    try {
      const res = await axiosInstance.post(`${APP_PATH_BASE_URL}api/resend-otp/`, {
        email
      });
      if (res.data.success === false) {
        await Swal.fire('Error', res.data.message, 'error');
        return;
      } else {
        // await Swal.fire('Success', res.data.message, 'success');
        startTimer(); // Start the timer after successful resend
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Format timer display
  const formatTime = (seconds) => {
    return `00:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ errors, touched, handleSubmit, isSubmitting, setFieldValue }) => (
        <form onSubmit={handleSubmit}>
          <Grid justifyContent={'space-between'} display={'flex'}>
            <Button
              variant="body1"
              sx={{ textDecoration: 'none' }}
              color="primary"
              onClick={() => {
                setOpen(true); setverify(false);
              }}
            >
              <ArrowBackIcon />
            </Button>
            <Button variant="body1" sx={{ textDecoration: 'none' }} color="primary" onClick={() => setverify(false)}>
              <CloseTwoTone />
            </Button>
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} justifyContent="center">
                {otp.map((digit, index) => (
                  <TextField
                    key={index}
                    inputRef={(ref) => (inputRefs.current[index] = ref)}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value, setFieldValue)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={(e) => handlePaste(e, setFieldValue)}
                    error={touched.code && Boolean(errors.code)}
                    inputProps={{
                      maxLength: 1,
                      style: { textAlign: 'center' }
                    }}
                    sx={{
                      width: 50,
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: borderColor
                        }
                      }
                    }}
                  />
                ))}
              </Stack>
              {touched.code && errors.code && (
                <Typography color="error" variant="caption" display="block" textAlign="center" mt={1}>
                  {errors.code}
                </Typography>
              )}
              {errors.submit && (
                <Typography color="error" variant="caption" display="block" textAlign="center" mt={1}>
                  {errors.submit}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <AnimateButton>
                <Button disableElevation fullWidth size="large" type="submit" variant="contained" disabled={isSubmitting}>
                  {isSubmitting ? 'Verifying...' : 'Continue'}
                </Button>
              </AnimateButton>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                <Typography>Not received Code?</Typography>
                <Button
                  variant="body1"
                  sx={{
                    minWidth: 85,
                    ml: 2,
                    textDecoration: 'none',
                    cursor: !canResend ? 'pointer' : 'default',
                    color: !canResend ? 'primary.main' : 'text.secondary'
                  }}
                  onClick={handleResendCode}
                  disabled={canResend}
                >
                  {!canResend ? 'Resend code' : formatTime(timer)}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      )}
    </Formik>
  );
};

export default AuthCodeVerification;
