import { useOutletContext } from 'react-router';

// material-ui
import {
  Autocomplete,
  Box,
  // Button,
  CardHeader,
  Divider,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project-imports
import MainCard from 'components/MainCard';
import countries from 'data/countries';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { useCallback, useEffect, useState } from 'react';
import { APP_PATH_BASE_URL } from 'config';
import axiosInstance from 'utils/axios';

// styles & constant
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
    }
  }
};

function useInputRef() {
  return useOutletContext();
}

// ==============================|| USER PROFILE - PERSONAL ||============================== //

const TabPersonal = () => {
  const auth = JSON.parse(localStorage.getItem('auth'));
  const userId = auth?.user?.employee_id || auth?.user?.user_id;
  const regId = auth?.user?.student_id || auth?.user?.employer_id;
  const userType = auth?.loginType;

  const [initialValues, setInitialValues] = useState({
    firstname: '',
    lastname: '',
    email: '',
    dob: new Date(),
    countryCode: '+91',
    contact: '',
    specialization: '',
    address: '',
    country: '',
    state: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      let response;
      if (userType === 'tutor') {
        response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/trainers/${userId}`);
      } else {
        // response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/student_list`);
        response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/student_profile/${regId}`);
      }

      const res = response.data;
      let result;
      if (userType === 'tutor') {
        result = res.data;
      } else {
        result = res.data;
      }

      // Map the API response to your form fields
      setInitialValues({
        firstname: result.first_name || '',
        lastname: result.last_name || '',
        name: result.full_name || '',
        email: result.email || '',
        dob: result.dob ? new Date(result.dob) : new Date(),
        countryCode: result.country_code || '+91',
        contact_no: result.contact_no || '',
        specialization: result.specialization || '',
        current_address: result.current_address || '',
        permanent_address: result.permanent_address || '',
        country: result.country || '',
        city: result.city || '',
        state: result.state || ''
      });
    } catch (err) {
      console.error('Error fetching user data:', err.message);
      dispatch(
        openSnackbar({
          open: true,
          message: 'Failed to load user data',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    } finally {
      setIsLoading(false);
    }
  }, [userType, userId, regId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChangeDay = (event, date, setFieldValue) => {
    setFieldValue('dob', new Date(date.setDate(parseInt(event.target.value, 10))));
  };

  const handleChangeMonth = (event, date, setFieldValue) => {
    setFieldValue('dob', new Date(date.setMonth(parseInt(event.target.value, 10))));
  };

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear());
  const inputRef = useInputRef();

  const handleSubmit = useCallback(
    async (values, { setErrors, setStatus, setSubmitting }) => {
      try {
        const formData = new FormData();

        // Common fields for both tutor and student
        formData.append('email', values.email);
        formData.append('country_code', values.countryCode);
        formData.append('contact_no', values.contact_no);

        // Tutor-specific fields
        if (userType === 'tutor') {
          formData.append('full_name', values.name);
          formData.append('specialization', values.specialization);
        } else {
          formData.append('first_name', values.firstname);
          formData.append('last_name', values.lastname);
          formData.append('dob', values.dob.toISOString().split('T')[0]);
          formData.append('address', values.address);
          formData.append('country', values.country);
          formData.append('city', values.city);
          formData.append('state', values.state);
        }

        let endpoint;
        if (userType === 'tutor') {
          endpoint = `${APP_PATH_BASE_URL}api/trainers/${userId}`;
        } else {
          endpoint = `${APP_PATH_BASE_URL}api/student_profile/${regId}`;
        }

        await axiosInstance.patch(endpoint, {
          body: formData
        });

        dispatch(
          openSnackbar({
            open: true,
            message: 'Personal profile updated successfully.',
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: false
          })
        );

        // Refresh data after successful update
        await fetchData();
        setStatus({ success: true });
      } catch (err) {
        setStatus({ success: false });
        setErrors({ submit: err.message });
        dispatch(
          openSnackbar({
            open: true,
            message: err.message || 'Update failed',
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: false
          })
        );
      } finally {
        setSubmitting(false);
      }
    },
    [userType, userId, regId, fetchData]
  );

  if (isLoading) {
    return (
      <MainCard title="Personal Information">
        <Box p={3}>Loading...</Box>
      </MainCard>
    );
  }

  return (
    <MainCard content={false} title="Personal Information" sx={{ '& .MuiInputLabel-root': { fontSize: '0.875rem' } }}>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={Yup.object().shape({
          firstname: Yup.string().max(255).required('First Name is required.'),
          lastname: Yup.string().max(255).required('Last Name is required.'),
          email: Yup.string().email('Invalid email address.').max(255).required('Email is required.'),
          dob: Yup.date().max(maxDate, 'Age should be 18+ years.').required('Date of birth is requird.'),
          contact_no: Yup.number()
            .test('len', 'Phone number should be exactly 10 digit', (val) => val?.toString().length === 10)
            .required('Phone number is required'),
          address: Yup.string().min(10, 'Address too short.').required('Address is required'),
          country: Yup.string().required('Country is required'),
          state: Yup.string().required('State is required'),
          city: Yup.string().required('City is required'),
          // Conditional validation for tutor fields
          ...(userType === 'tutor' && {
            name: Yup.string().max(255).required('Name is required.'),
            specialization: Yup.string().required('Specialization is required')
          })
        })}
        onSubmit={handleSubmit}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, setFieldValue, touched, values }) => {
          {
            /* console.log('Form values:', values);
          console.log('Form errors:', errors);
          console.log('Touched fields:', touched); */
          }
          return (
            <form noValidate onSubmit={handleSubmit}>
              <Box sx={{ p: 2.5 }}>
                <Grid container spacing={3}>
                  {userType === 'tutor' && (
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="personal-name">Name</InputLabel>
                        <TextField
                          fullWidth
                          id="personal-name"
                          value={values.name}
                          name="name"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="Name"
                          autoFocus
                          inputRef={inputRef}
                          disabled
                          sx={{
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)', // Dark color
                              fontWeight: 'normal' // Make text bold
                            }
                          }}
                        />
                        {touched.name && errors.name && (
                          <FormHelperText error id="personal-name-helper">
                            {errors.name}
                          </FormHelperText>
                        )}
                      </Stack>
                    </Grid>
                  )}
                  {userType === 'student' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="personal-first-name">First Name</InputLabel>
                          <TextField
                            fullWidth
                            id="personal-first-name"
                            value={values.firstname}
                            name="firstname"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="First Name"
                            autoFocus
                            inputRef={inputRef}
                            disabled
                            sx={{
                              '& .MuiInputBase-input.Mui-disabled': {
                                WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)', // Dark color
                                fontWeight: 'normal' // Make text bold
                              }
                            }}
                          />
                          {touched.firstname && errors.firstname && (
                            <FormHelperText error id="personal-first-name-helper">
                              {errors.firstname}
                            </FormHelperText>
                          )}
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="personal-last-name">Last Name</InputLabel>
                          <TextField
                            fullWidth
                            id="personal-last-name"
                            value={values.lastname}
                            name="lastname"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="Last Name"
                            disabled
                            sx={{
                              '& .MuiInputBase-input.Mui-disabled': {
                                WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)', // Dark color
                                fontWeight: 'normal' // Make text bold
                              }
                            }}
                          />
                          {touched.lastname && errors.lastname && (
                            <FormHelperText error id="personal-last-name-helper">
                              {errors.lastname}
                            </FormHelperText>
                          )}
                        </Stack>
                      </Grid>
                    </>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="personal-email">Email Address</InputLabel>
                      <TextField
                        type="email"
                        fullWidth
                        value={values.email}
                        name="email"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        id="personal-email"
                        placeholder="Email Address"
                        disabled
                        sx={{
                          '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)', // Dark color
                            fontWeight: 'normal' // Make text bold
                          }
                        }}
                      />
                      {touched.email && errors.email && (
                        <FormHelperText error id="personal-email-helper">
                          {errors.email}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  {userType === 'student' && (
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="personal-date">Date of Birth</InputLabel>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                          <Select
                            fullWidth
                            value={values.dob.getMonth().toString()}
                            name="dob-month"
                            onChange={(e) => handleChangeMonth(e, values.dob, setFieldValue)}
                            disabled
                            sx={{
                              '& .MuiInputBase-input.Mui-disabled': {
                                WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)', // Dark color
                                fontWeight: 'normal' // Make text bold
                              }
                            }}
                          >
                            <MenuItem value="0">January</MenuItem>
                            <MenuItem value="1">February</MenuItem>
                            <MenuItem value="2">March</MenuItem>
                            <MenuItem value="3">April</MenuItem>
                            <MenuItem value="4">May</MenuItem>
                            <MenuItem value="5">June</MenuItem>
                            <MenuItem value="6">July</MenuItem>
                            <MenuItem value="7">August</MenuItem>
                            <MenuItem value="8">September</MenuItem>
                            <MenuItem value="9">October</MenuItem>
                            <MenuItem value="10">November</MenuItem>
                            <MenuItem value="11">December</MenuItem>
                          </Select>
                          <Select
                            fullWidth
                            value={values.dob.getDate().toString()}
                            name="dob-date"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeDay(e, values.dob, setFieldValue)}
                            MenuProps={MenuProps}
                            disabled
                            sx={{
                              '& .MuiInputBase-input.Mui-disabled': {
                                WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)', // Dark color
                                fontWeight: 'normal' // Make text bold
                              }
                            }}
                          >
                            {[
                              1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
                              31
                            ].map((i) => (
                              <MenuItem
                                key={i}
                                value={i}
                                disabled={
                                  (values.dob.getMonth() === 1 && i > (values.dob.getFullYear() % 4 === 0 ? 29 : 28)) ||
                                  (values.dob.getMonth() % 2 !== 0 && values.dob.getMonth() < 7 && i > 30) ||
                                  (values.dob.getMonth() % 2 === 0 && values.dob.getMonth() > 7 && i > 30)
                                }
                              >
                                {i}
                              </MenuItem>
                            ))}
                          </Select>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              views={['year']}
                              value={values.dob}
                              maxDate={maxDate}
                              onChange={(newValue) => {
                                setFieldValue('dob', newValue);
                              }}
                              sx={{
                                '& .MuiInputBase-input.Mui-disabled': {
                                  WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)', // Dark color
                                  fontWeight: 'normal' // Make text bold
                                },
                                width: 1
                              }}
                              disabled
                            />
                          </LocalizationProvider>
                        </Stack>
                        {touched.dob && errors.dob && (
                          <FormHelperText error id="personal-dob-helper">
                            {errors.dob}
                          </FormHelperText>
                        )}
                      </Stack>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="personal-phone">Phone Number</InputLabel>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <Select
                          value={values.countryCode}
                          sx={{
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)', // Dark color
                              fontWeight: 'normal' // Make text bold
                            }
                          }}
                          disabled
                          name="countryCode"
                          onBlur={handleBlur}
                          onChange={handleChange}
                        >
                          <MenuItem value="+91">+91</MenuItem>
                          <MenuItem value="1-671">1-671</MenuItem>
                          <MenuItem value="+36">+36</MenuItem>
                          <MenuItem value="(225)">(255)</MenuItem>
                          <MenuItem value="+39">+39</MenuItem>
                          <MenuItem value="1-876">1-876</MenuItem>
                          <MenuItem value="+7">+7</MenuItem>
                          <MenuItem value="(254)">(254)</MenuItem>
                          <MenuItem value="(373)">(373)</MenuItem>
                          <MenuItem value="1-664">1-664</MenuItem>
                          <MenuItem value="+95">+95</MenuItem>
                          <MenuItem value="(264)">(264)</MenuItem>
                        </Select>
                        <TextField
                          fullWidth
                          id="personal-contact"
                          value={values.contact_no}
                          name="contact_no"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="Phone Number"
                          disabled
                          sx={{
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)', // Dark color
                              fontWeight: 'normal' // Make text bold
                            }
                          }}
                        />
                      </Stack>
                      {touched.contact_no && errors.contact_no && (
                        <FormHelperText error id="personal-contact">
                          {errors.contact_no}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  {userType === 'tutor' && (
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1.25}>
                        <InputLabel htmlFor="personal-specialization">Specialization</InputLabel>
                        <TextField
                          fullWidth
                          id="personal-designation"
                          value={values.specialization}
                          name="specialization"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="specialization"
                          disabled
                          sx={{
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)', // Dark color
                              fontWeight: 'normal' // Make text bold
                            }
                          }}
                        />
                        {touched.specialization && errors.specialization && (
                          <FormHelperText error id="personal-specialization-helper">
                            {errors.specialization}
                          </FormHelperText>
                        )}
                      </Stack>
                    </Grid>
                  )}
                </Grid>
              </Box>
              {userType === 'student' && (
                <>
                  <CardHeader title="Address" />
                  <Divider />
                  <Box sx={{ p: 2.5 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="personal-addrees1">Current Address</InputLabel>
                          <TextField
                            multiline
                            rows={3}
                            fullWidth
                            id="current_address"
                            value={values.current_address}
                            name="current_address"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="current_address"
                            disabled
                            sx={{
                              '& .MuiInputBase-input.Mui-disabled': {
                                WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)', // Dark color
                                fontWeight: 'normal' // Make text bold
                              }
                            }}
                          />
                          {touched.current_address && errors.current_address && (
                            <FormHelperText error id="current_address-helper">
                              {errors.current_address}
                            </FormHelperText>
                          )}
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="personal-addrees1">Permanent Address</InputLabel>
                          <TextField
                            multiline
                            rows={3}
                            fullWidth
                            id="permanent_address"
                            value={values.permanent_address}
                            name="permanent_address"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="permanent_address"
                            disabled
                            sx={{
                              '& .MuiInputBase-input.Mui-disabled': {
                                WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)', // Dark color
                                fontWeight: 'normal' // Make text bold
                              }
                            }}
                          />
                          {touched.permanent_address && errors.permanent_address && (
                            <FormHelperText error id="permanent_address-helper">
                              {errors.permanent_address}
                            </FormHelperText>
                          )}
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="personal-country">Country</InputLabel>
                          <Autocomplete
                            id="personal-country"
                            fullWidth
                            value={countries?.filter((item) => item.label === values?.country)[0] || null}
                            onBlur={handleBlur}
                            onChange={(event, newValue) => {
                              setFieldValue('country', newValue ? newValue.code : '');
                            }}
                            options={countries || []}
                            autoHighlight
                            isOptionEqualToValue={(option, value) => option.label === value?.label}
                            getOptionLabel={(option) => option.label}
                            renderOption={(props, option) => (
                              <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                                {option.code && (
                                  <img
                                    loading="lazy"
                                    width="20"
                                    src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                                    srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                                    alt=""
                                  />
                                )}
                                {option.label}
                                {option.code && `(${option.code}) ${option.phone}`}
                              </Box>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Choose a country"
                                name="country"
                                inputProps={{
                                  ...params.inputProps,
                                  autoComplete: 'new-password'
                                }}
                              />
                            )}
                            disabled
                            sx={{
                              '& .MuiInputBase-input.Mui-disabled': {
                                WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)', // Dark color
                                fontWeight: 'normal' // Make text bold
                              }
                            }}
                          />
                          {touched.country && errors.country && (
                            <FormHelperText error id="personal-country-helper">
                              {errors.country}
                            </FormHelperText>
                          )}
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="personal-state">City</InputLabel>
                          <TextField
                            fullWidth
                            id="personal-city"
                            value={values.city}
                            name="city"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="city"
                            disabled
                            sx={{
                              '& .MuiInputBase-input.Mui-disabled': {
                                WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)', // Dark color
                                fontWeight: 'normal' // Make text bold
                              }
                            }}
                          />
                          {touched.city && errors.city && (
                            <FormHelperText error id="personal-city-helper">
                              {errors.city}
                            </FormHelperText>
                          )}
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="personal-state">State</InputLabel>
                          <TextField
                            fullWidth
                            id="personal-state"
                            value={values.state}
                            name="state"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder="State"
                            disabled
                            sx={{
                              '& .MuiInputBase-input.Mui-disabled': {
                                WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)', // Dark color
                                fontWeight: 'normal' // Make text bold
                              }
                            }}
                          />
                          {touched.state && errors.state && (
                            <FormHelperText error id="personal-state-helper">
                              {errors.state}
                            </FormHelperText>
                          )}
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                </>
              )}
              <Box sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} sx={{ mt: 2.5 }}>
                  {/* <Button variant="outlined" color="secondary" onClick={() => fetchData()}>
                    Cancel
                  </Button> */}
                  {/* <Button type="submit" variant="contained">
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </Button> */}
                  {/* <Button disabled={isSubmitting || Object.keys(errors).length !== 0} type="submit" variant="contained">
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button> */}
                </Stack>
                {errors.submit && (
                  <FormHelperText error sx={{ mt: 2 }}>
                    {errors.submit}
                  </FormHelperText>
                )}
              </Box>
            </form>
          );
        }}
      </Formik>
    </MainCard>
  );
};

export default TabPersonal;
