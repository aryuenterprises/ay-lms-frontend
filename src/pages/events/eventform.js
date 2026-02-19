import React from 'react';
import { Box, TextField, Grid, Typography, Paper, Button, InputLabel, Stack, Zoom } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_PATH_BASE_URL } from 'config';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string().required('Phone number is required')
});

const EventForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // must match route param

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: ''
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await fetch(`${APP_PATH_BASE_URL}api/live-quiz/join/${id}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            phone: values.phone
          })
        });

        const data = await response.json();

        if (!response.ok || !data.token) {
          throw new Error(data.error || 'Unable to join room');
        }

        // Store token (used by WebSocket)
        localStorage.setItem('quiz_token', data.token);

        // Navigate to quiz
        navigate(`/events/user/${id}/quiz/in`);
      } catch (error) {
        alert(error.message || 'Registration failed');
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
      }}
    >
      <Zoom in timeout={1000}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 800, width: '100%' }}>
          <Typography variant="h4" align="center" mb={3}>
            Event Registration Form
          </Typography>

          <form onSubmit={formik.handleSubmit}>
            <Box mb={4}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.5}>
                    <InputLabel>Name</InputLabel>
                    <TextField
                      fullWidth
                      name="name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.5}>
                    <InputLabel>Email</InputLabel>
                    <TextField
                      fullWidth
                      type="email"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.5}>
                    <InputLabel>Phone</InputLabel>
                    <TextField
                      fullWidth
                      name="phone"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.phone && Boolean(formik.errors.phone)}
                      helperText={formik.touched.phone && formik.errors.phone}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            <Box display="flex" justifyContent="center" mt={4}>
              <Button type="submit" variant="contained" size="large" disabled={!formik.isValid || formik.isSubmitting}>
                Submit Registration
              </Button>
            </Box>
          </form>
        </Paper>
      </Zoom>
    </Box>
  );
};

export default EventForm;
