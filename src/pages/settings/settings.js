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
  Radio,
  RadioGroup,
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

// ─── Helper: safely parse a field that may be a JSON string or already an array ───
const parseArrayField = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value ? [value] : [];
    }
  }
  return [];
};

// ─── Helper: parse a radio field — backend may return JSON string like '["no_deactivation"]'
//     We only want a single string value for radio buttons
const parseRadioField = (value) => {
  if (!value) return '';
  // Already a plain string (not JSON)
  if (typeof value === 'string' && !value.startsWith('[')) return value;
  // JSON string or array — take first element
  const arr = parseArrayField(value);
  return arr.length > 0 ? arr[0] : '';
};

const Settings = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading]       = useState(true);

  const [settings, setSettings] = useState({
    general_logo:         null,
    secondary_logo:       null,
    signature:            null,
    company_name:         '',
    company_address:      '',
    company_email:        '',
    company_contact:      '',
    bank_ifsc:            '',
    bank_branch:          '',
    bank_name:            '',
    bank_account_no:      '',
    declaration:          '',
    gst_detail:           '',
    deactivation_options: '',   // single string — Radio
    attendance_options:   '',   // single string — Radio
    payment_method:       [],   // array          — Checkboxes
  });

  const [previewImages, setPreviewImages] = useState({
    general_logo: null, secondary_logo: null, signature: null,
  });

  const [tempFiles, setTempFiles] = useState({
    general_logo: null, secondary_logo: null, signature: null,
  });

  const imagePreviewRefs = useRef({});

  // ─── Text field sections ──────────────────────────────────────────────────────
  const formSections = [
    {
      title: 'General Details',
      fields: [
        { name: 'company_name',    label: 'Company Name *',  placeholder: 'Enter company name',    gridSize: { xs: 12, sm: 6 } },
        { name: 'company_email',   label: 'Email *',         placeholder: 'Enter company email',   gridSize: { xs: 12, sm: 6 }, type: 'email' },
        { name: 'company_contact', label: 'Phone Number *',  placeholder: 'Enter phone number',    gridSize: { xs: 12, sm: 6 } },
        { name: 'company_address', label: 'Address *',       placeholder: 'Enter company address', gridSize: { xs: 12 }, multiline: true, rows: 3 },
      ],
    },
    {
      title: 'Bank Details',
      fields: [
        { name: 'bank_name',       label: 'Bank Name *',      placeholder: 'Enter bank name',      gridSize: { xs: 12, sm: 6 } },
        { name: 'bank_branch',     label: 'Branch Name *',    placeholder: 'Enter branch name',    gridSize: { xs: 12, sm: 6 } },
        { name: 'bank_ifsc',       label: 'IFSC Code *',      placeholder: 'Enter IFSC code',      gridSize: { xs: 12, sm: 6 } },
        { name: 'bank_account_no', label: 'Account Number *', placeholder: 'Enter account number', gridSize: { xs: 12, sm: 6 } },
        { name: 'declaration',     label: 'Declaration *',    placeholder: 'Enter declaration',    gridSize: { xs: 12, sm: 6 } },
        { name: 'gst_detail',      label: 'GST Number *',     placeholder: 'Enter GST number',     gridSize: { xs: 12, sm: 6 } },
      ],
    },
  ];

  // ─── Radio configs (single-select) ───────────────────────────────────────────
  const radioConfigs = [
    {
      title: 'Portal Access Permissions',
      name:  'deactivation_options',
      options: [
        { value: 'after_course_completion', label: 'Course Completion Based - access after all course requirements' },
        { value: 'after_batch_completion',  label: 'Batch Completion Based - access after all batch requirements' },
        { value: '1_year_deactivation',     label: '1 Year - access for 1 year' },
        { value: 'no_deactivation',         label: 'No Deactivation - indefinite access' },
      ],
    },
    {
      title: 'Attendance Type',
      name:  'attendance_options',
      options: [
        { value: 'automatic_attendance', label: 'Automatic - attendance marked when student clicks link' },
        { value: 'manual_attendance',    label: 'Manual - student marks their own attendance' },
      ],
    },
  ];

  // ─── Checkbox config (multi-select) — Payment Method ONLY ────────────────────
  const paymentConfig = {
    title: 'Payment Method',
    name:  'payment_method',
    options: [
      { value: 'stripe_enabled',   label: 'Stripe' },
      { value: 'paypal_enabled',   label: 'PayPal' },
      { value: 'razorpay_enabled', label: 'Razorpay' },
    ],
  };

  // ─── Validation ───────────────────────────────────────────────────────────────
  const validationSchema = Yup.object().shape({
    company_name:         Yup.string().required('Company name is required'),
    company_address:      Yup.string().required('Address is required'),
    company_email:        Yup.string().email('Invalid email').required('Email is required'),
    company_contact:      Yup.string().matches(/^[0-9]{10}$/, 'Must be 10 digits').required('Phone number is required'),
    bank_ifsc:            Yup.string().required('IFSC code is required'),
    bank_branch:          Yup.string().required('Branch name is required'),
    bank_name:            Yup.string().required('Bank name is required'),
    bank_account_no:      Yup.string().required('Account number is required'),
    declaration:          Yup.string().required('Declaration is required'),
    gst_detail:           Yup.string().required('GST detail is required'),
    deactivation_options: Yup.string().required('Please select a portal access option'),
    attendance_options:   Yup.string().required('Please select an attendance type'),
    payment_method:       Yup.array().min(1, 'Please select at least one payment method'),
  });

  // ─── Fetch settings ───────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/settings`);
        const data = response.data.data;

        setSettings({
          ...data,
          // Backend returns these as JSON strings like '["no_deactivation"]'
          // Parse to array first, then take first element for single-select radio
          deactivation_options: parseRadioField(data.deactivation_options),
          attendance_options:   parseRadioField(data.attendance_options),
          // Backend returns payment_method already as a proper array
          payment_method: parseArrayField(data.payment_method),
        });
      } catch (error) {
        console.error('Error fetching settings:', error);
        Swal.fire({ title: 'Error!', text: 'Failed to load settings', icon: 'error', confirmButtonText: 'OK' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // ─── Formik ───────────────────────────────────────────────────────────────────
  const formik = useFormik({
    initialValues:      settings,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (isSubmitting) return;
      try {
        setIsSubmitting(true);
        const formData = new FormData();

        if (tempFiles.general_logo)   formData.append('general_logo',   tempFiles.general_logo);
        if (tempFiles.secondary_logo) formData.append('secondary_logo', tempFiles.secondary_logo);
        if (tempFiles.signature)      formData.append('signature',      tempFiles.signature);

        // Plain string fields (including radio values sent as strings)
        const stringFields = [
          'company_name', 'company_address', 'company_email', 'company_contact',
          'bank_ifsc', 'bank_branch', 'bank_name', 'bank_account_no',
          'declaration', 'gst_detail',
          'deactivation_options',  // single string
          'attendance_options',    // single string
        ];
        stringFields.forEach((field) => formData.append(field, values[field] ?? ''));

        // Array field — payment_method only
        formData.append('payment_method', JSON.stringify(values.payment_method));

        const url    = values.id ? `${APP_PATH_BASE_URL}api/settings/${values.id}` : `${APP_PATH_BASE_URL}api/settings`;
        const method = values.id ? 'patch' : 'post';

        const res = await axiosInstance[method](url, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.data.success === false) {
          Swal.fire({ title: 'Error!', text: res.data.message, icon: 'error', confirmButtonText: 'OK' });
          return;
        }
        Swal.fire({ title: 'Success!', text: res.data.message, icon: 'success', confirmButtonText: 'OK' });
      } catch (error) {
        console.error('Error saving settings:', error);
        Swal.fire({ title: 'Error!', text: 'Failed to save settings', icon: 'error', confirmButtonText: 'OK' });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // ─── Handlers ─────────────────────────────────────────────────────────────────
  const handleFileChange = (event, fieldName) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setTempFiles((prev) => ({ ...prev, [fieldName]: file }));
    setPreviewImages((prev) => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
  };

  // Radio — single string value
  const handleRadioChange = (fieldName, value) => {
    formik.setFieldValue(fieldName, value);
    formik.setFieldTouched(fieldName, true, false);
  };

  // Checkbox — toggle value in array (payment_method only)
  const handleCheckboxChange = (fieldName, value) => {
    const current = Array.isArray(formik.values[fieldName]) ? formik.values[fieldName] : [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    formik.setFieldValue(fieldName, updated);
    formik.setFieldTouched(fieldName, true, false);
  };

  const getImageSource = (fieldName) => {
    if (previewImages[fieldName]) return previewImages[fieldName];
    if (typeof formik.values[fieldName] === 'string' && formik.values[fieldName]) return formik.values[fieldName];
    return defaultLogo;
  };

  // ─── ImagePreview component ───────────────────────────────────────────────────
  const ImagePreview = ({ src, alt, hasImage, fieldName }) => (
    <Box
      sx={{
        width: 100, height: 100,
        border: '1px dashed #ccc', borderRadius: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'grey.50', overflow: 'hidden', flexShrink: 0,
      }}
      ref={(el) => { if (el && !imagePreviewRefs.current[fieldName]) imagePreviewRefs.current[fieldName] = el.getBoundingClientRect(); }}
    >
      {src ? (
        <img
          src={src} alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          loading="lazy" decoding="async"
          onError={(e) => { e.target.onerror = null; e.target.src = defaultLogo; }}
        />
      ) : (
        <Typography variant="body2" color="text.secondary">
          {hasImage ? 'Loading...' : 'No Image'}
        </Typography>
      )}
    </Box>
  );

  ImagePreview.propTypes = {
    src: PropTypes.string, alt: PropTypes.string.isRequired,
    hasImage: PropTypes.bool.isRequired, fieldName: PropTypes.string.isRequired,
  };

  const imageFields = [
    { name: 'general_logo',   label: 'General Logo', uploadId: 'general-logo-upload',   alt: 'General Logo Preview' },
    { name: 'secondary_logo', label: 'Favicon Logo', uploadId: 'secondary-logo-upload', alt: 'Secondary Logo Preview' },
    { name: 'signature',      label: 'Signature',    uploadId: 'signature-upload',       alt: 'Signature Preview' },
  ];

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

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
      <Stack spacing={2}>

        {/* Logo & Signature */}
        <MainCard title="Logo & Signature">
          <Grid container spacing={3}>
            <Grid container item xs={12} spacing={3} alignItems="center">
              {imageFields.map((imageField) => (
                <Grid item xs={12} sm={6} md={4} key={imageField.name}>
                  <FormControl fullWidth>
                    <Stack spacing={2}>
                      <FormLabel>{imageField.label}</FormLabel>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexDirection: 'column', minHeight: 140 }}>
                        {isLoading ? (
                          <Box sx={{ width: 100, height: 100, border: '1px dashed #ccc', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'grey.50' }}>
                            <Skeleton variant="rounded" width={80} height={80} />
                          </Box>
                        ) : (
                          <>
                            <ImagePreview
                              src={getImageSource(imageField.name)}
                              alt={imageField.alt}
                              hasImage={!!formik.values[imageField.name]}
                              fieldName={imageField.name}
                            />
                            <input accept="image/*" style={{ display: 'none' }} id={imageField.uploadId} type="file" onChange={(e) => handleFileChange(e, imageField.name)} />
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

        {/* Text field sections */}
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
                            value={formik.values[field.name] ?? ''}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
                            helperText={formik.touched[field.name] && formik.errors[field.name]}
                            placeholder={field.placeholder}
                            multiline={field.multiline}
                            rows={field.rows}
                            fullWidth
                            InputProps={{ style: { minHeight: field.multiline ? '80px' : 'auto' } }}
                          />
                        </Stack>
                      </FormControl>
                    </Grid>
                  ))}
            </Grid>
          </MainCard>
        ))}

        {/* Radio groups — Portal Access & Attendance (single select) */}
        {radioConfigs.map((config) => (
          <MainCard title={config.title} key={config.name}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth error={formik.touched[config.name] && Boolean(formik.errors[config.name])}>
                  <FormLabel component="legend" sx={{ mb: 1, fontWeight: 500 }}>
                    Select one option
                  </FormLabel>
                  {isLoading ? (
                    <Stack spacing={1}>
                      {Array.from({ length: config.options.length }).map((_, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Skeleton variant="circular" width={20} height={20} />
                          <Skeleton variant="text" width="60%" />
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <RadioGroup
                      value={formik.values[config.name] ?? ''}
                      onChange={(e) => handleRadioChange(config.name, e.target.value)}
                    >
                      {config.options.map((option) => (
                        <FormControlLabel
                          key={option.value}
                          value={option.value}
                          control={<Radio />}
                          label={option.label}
                        />
                      ))}
                    </RadioGroup>
                  )}
                  {formik.touched[config.name] && formik.errors[config.name] && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {formik.errors[config.name]}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </MainCard>
        ))}

        {/* Checkbox group — Payment Method (multi-select) */}
        <MainCard title={paymentConfig.title}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth error={formik.touched.payment_method && Boolean(formik.errors.payment_method)}>
                <FormLabel component="legend" sx={{ mb: 1, fontWeight: 500 }}>
                  Select all that apply
                </FormLabel>
                {isLoading ? (
                  <Stack spacing={1}>
                    {Array.from({ length: paymentConfig.options.length }).map((_, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Skeleton variant="rounded" width={20} height={20} />
                        <Skeleton variant="text" width="30%" />
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <FormGroup>
                    {paymentConfig.options.map((option) => (
                      <FormControlLabel
                        key={option.value}
                        control={
                          <Checkbox
                            checked={
                              Array.isArray(formik.values.payment_method)
                                ? formik.values.payment_method.includes(option.value)
                                : false
                            }
                            onChange={() => handleCheckboxChange('payment_method', option.value)}
                          />
                        }
                        label={option.label}
                      />
                    ))}
                  </FormGroup>
                )}
                {formik.touched.payment_method && formik.errors.payment_method && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {formik.errors.payment_method}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </MainCard>

      </Stack>

      {/* Submit */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          {isLoading ? (
            <Skeleton variant="rounded" width={120} height={40} />
          ) : (
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting} sx={{ minWidth: 120, minHeight: 40 }}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          )}
        </Box>
      </Grid>
    </form>
  );
};

export default Settings;