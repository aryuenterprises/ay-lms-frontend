import React from 'react';
import { Box, TextField, Grid, Typography, Paper, Button, Divider, InputLabel, Stack, Zoom } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';


// Validation Schema
const validationSchema = Yup.object({
  // Personal Information
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),

  // Address Information
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  country: Yup.string().required('Country is required')
});

const EventForm = () => {
  const formik = useFormik({
    initialValues: {
      // Personal Information
      name: '',
      email: '',
      phone: '',

      // Address Information
      address: '',
      city: '',
      country: ''
    },
    validationSchema,
    onSubmit: (values) => {
      console.log('Form submitted:', values);
      alert('Form submitted successfully!');
      // Handle form submission here
    }
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#000000',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        padding: 2
      }}
    >
      <Zoom in timeout={1000}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 800, width: '100%', bgcolor: 'rgba(255, 255, 255, 1)' }}>
          <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
            Event Registration Form
          </Typography>

          <form onSubmit={formik.handleSubmit}>
            {/* Section 1: Personal Information */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main' }}>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.5}>
                    <InputLabel htmlFor="name">Name</InputLabel>
                    <TextField
                      fullWidth
                      labelId="name"
                      id="name"
                      name="name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                      variant="outlined"
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.5}>
                    <InputLabel htmlFor="email">Email</InputLabel>
                    <TextField
                      fullWidth
                      labelId="email"
                      id="email"
                      name="email"
                      type="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      variant="outlined"
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.5}>
                    <InputLabel htmlFor="phone">Phone Number</InputLabel>
                    <TextField
                      fullWidth
                      labelId="phone"
                      id="phone"
                      name="phone"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.phone && Boolean(formik.errors.phone)}
                      helperText={formik.touched.phone && formik.errors.phone}
                      variant="outlined"
                      placeholder="e.g., (123) 456-7890"
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            {/* Section 3: Address Information */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main' }}>
                Address Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                {/* Address Line 1 */}
                <Grid item xs={12}>
                  <Stack spacing={1.5}>
                    <InputLabel htmlFor="addressLine1">Address</InputLabel>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      labelId="address"
                      id="address"
                      name="address"
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.address && Boolean(formik.errors.address)}
                      helperText={formik.touched.address && formik.errors.address}
                      variant="outlined"
                    />
                  </Stack>
                </Grid>

                {/* City and State */}
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.5}>
                    <InputLabel id="city-label">City</InputLabel>
                    <TextField
                      fullWidth
                      labelId="city-label"
                      id="city"
                      name="city"
                      value={formik.values.city}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.city && Boolean(formik.errors.city)}
                      helperText={formik.touched.city && formik.errors.city}
                      variant="outlined"
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.5}>
                    <InputLabel id="country-label">Country</InputLabel>
                    <TextField
                      fullWidth
                      labelId="country-label"
                      id="country"
                      name="country"
                      value={formik.values.country}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.country && Boolean(formik.errors.country)}
                      helperText={formik.touched.country && formik.errors.country}
                      variant="outlined"
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            {/* Submit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button type="submit" variant="contained" size="large" sx={{ px: 6 }} disabled={!formik.isValid || formik.isSubmitting}>
                Submit Registration
              </Button>
            </Box>

            {/* Debug info (remove in production) */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1, display: 'none' }}>
              <Typography variant="caption">
                Form is {formik.isValid ? 'valid' : 'invalid'} | Touched: {Object.keys(formik.touched).length} fields | Errors:{' '}
                {Object.keys(formik.errors).length}
              </Typography>
            </Box>
          </form>
        </Paper>
      </Zoom>
    </Box>
  );
};

export default EventForm;
