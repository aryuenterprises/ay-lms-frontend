import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Button,
  Box,
  Stack,
  Grid,
  FormControl,
  FormLabel,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Skeleton
} from '@mui/material';
import MainCard from 'components/MainCard';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { APP_PATH_BASE_URL } from 'config';
import axiosInstance from 'utils/axios';
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';
import defaultLogo from 'assets/images/defaultlogo.png';
// import payment from 'menu-items/payment';


const Settings = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    general_logo: null,
    secondary_logo: null,
    signature: null,
    company_name: '',
    company_address: '',
    company_email: '',
    company_contact: '',
    bank_ifsc: '',
    bank_branch: '',
    bank_name: '',
    bank_account_no: '',
    declaration: '',
    gst_detail: '',
    deactivation_options: null,
    payment_method: '',
    payment_key: ''
  });
  const [previewImages, setPreviewImages] = useState({
    general_logo: null,
    secondary_logo: null,
    signature: null
  });

  const [tempFiles, setTempFiles] = useState({
    general_logo: null,
    secondary_logo: null,
    signature: null
  });


  // Refs for fixed dimensions
  const imagePreviewRefs = useRef({});

  // Form sections configuration
  const formSections = [
    {
      title: 'General Details',
      fields: [
        {
          name: 'company_name',
          label: 'Company Name *',
          placeholder: 'Enter company name',
          gridSize: { xs: 12, sm: 6 },
          required: true
        },
        {
          name: 'company_email',
          label: 'Email *',
          placeholder: 'Enter company email',
          type: 'email',
          gridSize: { xs: 12, sm: 6 },
          required: true
        },
        {
          name: 'company_contact',
          label: 'Phone Number *',
          placeholder: 'Enter phone number',
          gridSize: { xs: 12, sm: 6 },
          required: true
        },
        {
          name: 'company_address',
          label: 'Address *',
          placeholder: 'Enter company address',
          gridSize: { xs: 12 },
          multiline: true,
          rows: 3,
          required: true
        }
      ]
    },
    {
      title: 'Bank Details',
      fields: [
        {
          name: 'bank_name',
          label: 'Bank Name *',
          placeholder: 'Enter bank name',
          gridSize: { xs: 12, sm: 6 },
          required: true
        },
        {
          name: 'bank_branch',
          label: 'Branch Name *',
          placeholder: 'Enter branch name',
          gridSize: { xs: 12, sm: 6 },
          required: true
        },
        {
          name: 'bank_ifsc',
          label: 'IFSC Code *',
          placeholder: 'Enter IFSC code',
          gridSize: { xs: 12, sm: 6 },
          required: true
        },
        {
          name: 'bank_account_no',
          label: 'Account Number *',
          placeholder: 'Enter account number',
          gridSize: { xs: 12, sm: 6 },
          required: true
        },
        {
          name: 'declaration',
          label: 'Declaration *',
          placeholder: 'Enter declaration',
          gridSize: { xs: 12, sm: 6 },
          required: true
        },
        {
          name: 'gst_detail',
          label: 'GST Number *',
          placeholder: 'Enter GST number',
          gridSize: { xs: 12, sm: 6 },
          required: true
        }
      ]
    }
  ];

  // Options configuration
  const optionsConfig = {
    deactivationOptions: {
      title: 'Portal Access Permissions',
      name: 'deactivation_options',
      options: [
        {
          value: 'after_course_completion',
          label: 'Course Completion Based - Portal access granted only after completing all course requirements'
        },
        {
          value: 'after_batch_completion',
          label: 'Batch Completion Based - Portal access granted only after completing all course requirements in a batch'
        },
        {
          value: '1_year_deactivation',
          label: '1 Year - Portal access available for 1 year'
        },
        {
          value: 'no_deactivation',
          label: 'No Deactivation - Portal access available indefinitely'
        }
      ],
      helperText: 'Select only one access type for student portal permissions'
    },
    attendanceOptions: {
      title: 'Attendance Type',
      name: 'attendance_options',
      options: [
        {
          value: 'automatic_attendance',
          label: 'Automatic - link clicked by student automatically attendance marked'
        },
        {
          value: 'manual_attendance',
          label: 'Manual - student marks attendance manually'
        }
      ],
      helperText: 'Select based on student attendance type'
    },
    paymentMethodOptions: {
      title: 'Payment Method',
      name: 'payment_method',
      options: [
        {
          value: 'stripe_enabled',
          label: 'Stripe based payment'
        },
        {
          value: 'paypal_enabled',
          label: 'PayPal based payment'
        }
      ],
      helperText: 'Select based on payment method type'
    }
  };

  // Form validation schema
  const validationSchema = Yup.object().shape({
    company_address: Yup.string().required('Address is required'),
    company_email: Yup.string().email('Invalid email').required('Email is required'),
    company_contact: Yup.string()
      .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
      .required('Phone number is required'),
    bank_ifsc: Yup.string().required('IFSC code is required'),
    bank_branch: Yup.string().required('Branch name is required'),
    bank_name: Yup.string().required('Bank name is required'),
    bank_account_no: Yup.string().required('Account number is required'),
    declaration: Yup.string().required('Declaration is required'),
    gst_detail: Yup.string().required('GST detail is required'),
    deactivation_options: Yup.string().required('Deactivation options is required'),
    attendance_options: Yup.string().required('Attendance options is required'),
    payment_method: Yup.string().required('Payment options is required')
  });

  // Fetch settings data on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/settings`);
        // console.log(response,"it only wrkin gon the respnse")
        setSettings(response.data.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        // Small delay to ensure layout is stable before showing content
        setTimeout(() => setIsLoading(false), 100);
      }
    };

    fetchSettings();
  }, []);

  const formik = useFormik({
    initialValues: settings,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (isSubmitting) {
          return;
        }

        setIsSubmitting(true);
        const formData = new FormData();

        // ✅ Append temp uploaded images ONLY on save
        if (tempFiles.general_logo) {
          formData.append('general_logo', tempFiles.general_logo);
        }
        if (tempFiles.secondary_logo) {
          formData.append('secondary_logo', tempFiles.secondary_logo);
        }
        if (tempFiles.signature) {
          formData.append('signature', tempFiles.signature);
        }


        // Append all other fields
        const fieldsToAppend = [
          'company_name',
          'company_address',
          'company_email',
          'company_contact',
          'bank_ifsc',
          'bank_branch',
          'bank_name',
          'bank_account_no',
          'declaration',
          'gst_detail',
          'deactivation_options',
          'attendance_options',
          'payment_method',
          'payment_key'
        ];

        fieldsToAppend.forEach((field) => {
          formData.append(field, values[field]);
        });

        const url = values.id ? `${APP_PATH_BASE_URL}api/settings/${values.id}` : `${APP_PATH_BASE_URL}api/settings`;

        const method = values.id ? 'patch' : 'post';

        const res = await axiosInstance[method](url, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data.success === false) {
          Swal.fire({
            title: 'Error!',
            text: res.data.message,
            icon: 'error',
            confirmButtonText: 'OK'
          });
          return;
        }

        Swal.fire({
          title: 'Success!',
          text: res.data.message,
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } catch (error) {
        console.error('Error saving settings:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to save settings',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const handleFileChange = (event, fieldName) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // store file for upload
    setTempFiles((prev) => ({
      ...prev,
      [fieldName]: file
    }));

    // create preview
    const previewUrl = URL.createObjectURL(file);
    setPreviewImages((prev) => ({
      ...prev,
      [fieldName]: previewUrl
    }));
  };


  // Handle checkbox change - only allow one selection
  const handleCheckboxChange = (optionName, optionValue) => {
    const newValue = formik.values[optionName] === optionValue ? '' : optionValue;
    formik.setFieldValue(optionName, newValue);
  };

  // Helper function to get image source
  const getImageSource = (fieldName) => {
    // 1️⃣ Show selected image preview immediately
    if (previewImages[fieldName]) {
      return previewImages[fieldName];
    }

    // 2️⃣ Saved image from backend
    if (typeof formik.values[fieldName] === 'string' && formik.values[fieldName]) {
      return formik.values[fieldName];
    }

    // 3️⃣ Default image
    return defaultLogo;
  };



  // Image preview component with fixed dimensions and aspect ratio
  const ImagePreview = ({ src, alt, hasImage, fieldName }) => {
    const containerStyle = {
      width: 100,
      height: 100,
      border: '1px dashed #ccc',
      borderRadius: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'grey.50',
      overflow: 'hidden',
      position: 'relative',
      flexShrink: 0 // Prevent shrinking
    };

    if (src) {
      return (
        <Box
          sx={containerStyle}
          ref={(el) => {
            if (el && !imagePreviewRefs.current[fieldName]) {
              imagePreviewRefs.current[fieldName] = el.getBoundingClientRect();
            }
          }}
        >
          <img
            src={src}
            alt={alt}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block' // Remove inline spacing
            }}
            loading="lazy"
            decoding="async" // Better image loading
            onLoad={(e) => {
              e.target.style.opacity = '1';
              // Ensure dimensions remain stable
              const img = e.target;
              const container = img.parentElement;
              if (container) {
                container.style.width = '100px';
                container.style.height = '100px';
              }
            }}
            onError={(e) => {
              e.target.onerror = null; // prevent infinite loop
              e.target.src = defaultLogo;
            }}

          />
        </Box>
      );
    }

    return (
      <Box
        sx={containerStyle}
        ref={(el) => {
          if (el && !imagePreviewRefs.current[fieldName]) {
            imagePreviewRefs.current[fieldName] = el.getBoundingClientRect();
          }
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {hasImage ? 'Loading...' : 'No Image'}
        </Typography>
      </Box>
    );
  };

  ImagePreview.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string.isRequired,
    hasImage: PropTypes.bool.isRequired,
    fieldName: PropTypes.string.isRequired
  };

  // Image fields configuration
  const imageFields = [
    {
      name: 'general_logo',
      label: 'General Logo',
      uploadId: 'general-logo-upload',
      alt: 'General Logo Preview'
    },
    {
      name: 'secondary_logo',
      label: 'Favicon Logo',
      uploadId: 'secondary-logo-upload',
      alt: 'Secondary Logo Preview'
    },
    {
      name: 'signature',
      label: 'Signature',
      uploadId: 'signature-upload',
      alt: 'Signature Preview'
    }
  ];

  // Skeleton loader for form fields
  const renderSkeletonField = (field) => (
    <Grid item {...field.gridSize} key={`skeleton-${field.name}`}>
      <FormControl fullWidth>
        <Stack spacing={1}>
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="rounded" height={field.multiline ? 80 : 56} />
        </Stack>
      </FormControl>
    </Grid>
  );

  // Skeleton for image preview
  const renderSkeletonImage = () => (
    <Box
      sx={{
        width: 100,
        height: 100,
        border: '1px dashed #ccc',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'grey.50'
      }}
    >
      <Skeleton variant="rounded" width={80} height={80} />
    </Box>
  );

  return (
    <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
      <Stack spacing={2}>
        {/* Logo & Signature Section */}
        <MainCard title="Logo & Signature">
          <Grid container spacing={3}>
            <Grid container item xs={12} spacing={3} alignItems="center">
              {imageFields.map((imageField) => (
                <Grid item xs={12} sm={6} md={4} key={imageField.name}>
                  <FormControl fullWidth>
                    <Stack spacing={2}>
                      <FormLabel>{imageField.label}</FormLabel>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          flexDirection: 'column',
                          minHeight: 140 // Reserve space to prevent shifts
                        }}
                      >
                        {isLoading ? (
                          renderSkeletonImage()
                        ) : (
                          <>
                            <ImagePreview
                              src={getImageSource(imageField.name)}
                              alt={imageField.alt}
                              hasImage={!!formik.values[imageField.name]}
                              fieldName={imageField.name}
                            />


                            <input
                              accept="image/*"
                              style={{ display: 'none' }}
                              id={imageField.uploadId}
                              type="file"
                              onChange={(e) => handleFileChange(e, imageField.name)}
                            />

                            <label htmlFor={imageField.uploadId}>
                              <Button variant="outlined" component="span" size="small">
                                Choose {imageField.label.includes('Logo') ? 'Logo' : 'Signature'}
                              </Button>
                            </label>
                          </>
                        )}
                      </Box>
                    </Stack>
                  </FormControl>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </MainCard>

        {/* Dynamic Form Sections */}
        {formSections.map((section) => (
          <MainCard title={section.title} key={section.title}>
            <Grid container spacing={3}>
              {isLoading
                ? section.fields.map(renderSkeletonField)
                : section.fields.map((field) => (
                  <Grid item {...field.gridSize} key={field.name}>
                    <FormControl fullWidth>
                      <Stack spacing={1}>
                        <FormLabel>{field.label}</FormLabel>
                        <TextField
                          name={field.name}
                          type={field.type || 'text'}
                          value={formik.values[field.name]}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
                          helperText={formik.touched[field.name] && formik.errors[field.name]}
                          placeholder={field.placeholder}
                          multiline={field.multiline}
                          rows={field.rows}
                          fullWidth
                          InputProps={{
                            style: { minHeight: field.multiline ? '80px' : 'auto' }
                          }}
                        />
                      </Stack>
                    </FormControl>
                  </Grid>
                ))}
            </Grid>
          </MainCard>
        ))}

        {/* Options Sections */}
        {Object.entries(optionsConfig).map(([key, config]) => (
          <MainCard title={config.title} key={key}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth error={formik.touched[config.name] && Boolean(formik.errors[config.name])}>
                  <Stack spacing={2}>
                    <FormGroup>
                      {isLoading
                        ? Array.from({ length: config.options.length }).map((_, index) => (
                          <FormControlLabel
                            key={`skeleton-${index}`}
                            control={<Skeleton variant="rounded" width={20} height={20} />}
                            label={<Skeleton variant="text" width="80%" />}
                          />
                        ))
                        : config.options.map((option) => (
                          <FormControlLabel
                            key={option.value}
                            control={
                              <Checkbox
                                checked={formik.values[config.name] === option.value}
                                onChange={() => handleCheckboxChange(config.name, option.value)}
                                name={config.name}
                              />
                            }
                            label={option.label}
                          />
                        ))}
                    </FormGroup>
                    {/* 🔐 Payment Key Field (masked) */}
                    {config.name === 'payment_method' && formik.values.payment_method && (
                      <Box sx={{ mt: 2 }}>
                        <FormLabel>
                          {formik.values.payment_method === 'stripe_enabled'
                            ? 'Stripe Key'
                            : 'PayPal Key'}
                        </FormLabel>

                        <TextField
                          fullWidth
                          type="password"          // ✅ MASK INPUT
                          name="payment_key"
                          placeholder="Enter payment key"
                          value={formik.values.payment_key}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.payment_key && Boolean(formik.errors.payment_key)}
                          helperText={formik.touched.payment_key && formik.errors.payment_key}
                          sx={{ mt: 1 }}
                          autoComplete="new-password"
                        />
                      </Box>
                    )}

                    {formik.touched[config.name] && formik.errors[config.name] && (
                      <FormHelperText error>{formik.errors[config.name]}</FormHelperText>
                    )}
                    <FormHelperText>{config.helperText}</FormHelperText>
                  </Stack>
                </FormControl>
              </Grid>
            </Grid>
          </MainCard>
        ))}
      </Stack>


      {/* Submit Button */}
      <Grid item xs={12}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 2,
            minHeight: 15 // Reserve space for button
          }}
        >
          {isLoading ? (
            <Skeleton variant="rounded" width={120} height={40} />
          ) : (
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{
                minWidth: 120,
                minHeight: 40,
                flexShrink: 0 // Prevent button from shrinking
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          )}
        </Box>
      </Grid>
    </form>
  );
};

export default Settings;
