import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Rating,
  Button,
  FormControlLabel,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup
} from '@mui/material';
import { useParams } from 'react-router-dom';
import axiosInstance from 'utils/axios';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
// HEADER & FOOTER
import Header from 'layout/CommonLayout/Header';
import FooterBlock from 'layout/CommonLayout/FooterBlock';

const WebinarFeedbackForm = () => {
  const { id } = useParams();
  const webinarUuid = id;

  const [form, setForm] = useState({
    name: '',
    phone: '',
    overall_rating: 0,
    content_quality: 0,
    speaker_quality: 0,
    pace_of_session: 0,
    interaction_rating: 0,
    learned_something_new: null,
    would_recommend: null,
    liked_most: '',
    improvement_suggestions: '',
    additional_comments: '',
    interested_in_future_webinars: null,
    interested_in_paid_courses: null
  });
  const [ratingScreenshot, setRatingScreenshot] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [successOpen, setSuccessOpen] = useState(false);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    let errors = {};

    if (!form.name) errors.name = 'Name is required';
    if (!form.phone) errors.phone = 'Phone is required';

    if (form.overall_rating === 0) errors.overall_rating = true;
    if (form.content_quality === 0) errors.content_quality = true;
    if (form.speaker_quality === 0) errors.speaker_quality = true;
    if (form.pace_of_session === 0) errors.pace_of_session = true;
    if (form.interaction_rating === 0) errors.interaction_rating = true;

    if (form.learned_something_new === null) errors.learned_something_new = 'Please select Yes or No';
    if (form.would_recommend === null) errors.would_recommend = 'Please select Yes or No';
    if (form.interested_in_future_webinars === null) errors.interested_in_future_webinars = 'Please select Yes or No';
    if (form.interested_in_paid_courses === null) errors.interested_in_paid_courses = 'Please select Yes or No';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const payload = new FormData();

    payload.append('webinar', webinarUuid);
    payload.append('name', form.name);
    payload.append('phone', form.phone);
    payload.append('overall_rating', form.overall_rating);
    payload.append('content_quality', form.content_quality);
    payload.append('speaker_quality', form.speaker_quality);
    payload.append('pace_of_session', form.pace_of_session);
    payload.append('interaction_rating', form.interaction_rating);
    payload.append('learned_something_new', String(form.learned_something_new));
    payload.append('would_recommend', String(form.would_recommend));
    payload.append('interested_in_future_webinars', String(form.interested_in_future_webinars));
    payload.append('interested_in_paid_courses', String(form.interested_in_paid_courses));
    payload.append('liked_most', form.liked_most || '');
    payload.append('improvement_suggestions', form.improvement_suggestions || '');
    payload.append('additional_comments', form.additional_comments || '');

    //  Now append screenshot AFTER payload is declared
    if (ratingScreenshot) {
      payload.append('rating_screenshot', ratingScreenshot);
    }

    try {
      await axiosInstance.post(`/api/webinar/feedback/`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessOpen(true);
    } catch (err) {
      console.error('Submission Error:', err.response?.data || err.message);
    }
  };

  return (
    <>
      <Header />

      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          pt: { xs: 12, md: 14 },
          pb: { xs: 6, md: 10 },
          px: { xs: 2, sm: 3 },
          overflow: 'hidden',
          background: '#fdf6f8'
        }}
      >
        {/* TOP LEFT BLOB */}
        {/* TOP LEFT BLOB */}
        <Box
          component={motion.div}
          animate={{ y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          sx={{
            position: 'absolute',
            width: { xs: 220, md: 400 },
            height: { xs: 220, md: 400 },
            borderRadius: '50%',
            background: 'rgba(183,28,28,0.18)',
            top: { xs: -60, md: -120 },
            left: { xs: -60, md: -120 },
            filter: 'blur(120px)',
            zIndex: 0
          }}
        />

        {/* CENTER BLOB */}
        <Box
          component={motion.div}
          animate={{ y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          sx={{
            position: 'absolute',
            width: { xs: 250, md: 350 },
            height: { xs: 250, md: 350 },
            borderRadius: '50%',
            background: 'rgba(244,143,177,0.20)',
            top: { xs: '50%', md: '40%' },
            left: { xs: '10%', md: '5%' },
            filter: 'blur(140px)',
            zIndex: 0
          }}
        />

        {/* BOTTOM RIGHT BLOB */}
        <Box
          component={motion.div}
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity }}
          sx={{
            position: 'absolute',
            width: { xs: 280, md: 450 },
            height: { xs: 280, md: 450 },
            borderRadius: '50%',
            background: 'rgba(233,30,99,0.15)',
            bottom: { xs: -100, md: -150 },
            right: { xs: -100, md: -150 },
            filter: 'blur(160px)',
            zIndex: 0
          }}
        />
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            position: 'relative',
            zIndex: 2,
            maxWidth: 950,
            mx: 'auto',
            px: { xs: 3, sm: 5, md: 6 },
            py: { xs: 4, md: 6 },
            borderRadius: 4,
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 30px 70px rgba(128, 0, 32, 0.15)'
          }}
        >
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#7f1d1d', mb: 5 }}>
              Webinar Feedback
            </Typography>

            {/* NAME */}
            <TextField
              label="Full Name (for certificate)"
              fullWidth
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={!!fieldErrors.name}
              helperText={fieldErrors.name}
              sx={{ mb: 3 }}
            />

            {/* PHONE */}
            <TextField
              label="Registered Phone Number"
              fullWidth
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={!!fieldErrors.phone}
              helperText={fieldErrors.phone}
              sx={{ mb: 5 }}
            />

            {/* RATINGS */}
            <Grid container spacing={4}>
              {[
                ['overall_rating', 'Overall Experience'],
                ['content_quality', 'Content Quality'],
                ['speaker_quality', 'Speaker Quality'],
                ['pace_of_session', 'Pace of Session'],
                ['interaction_rating', 'Interaction']
              ].map(([key, label]) => (
                <Grid item xs={12} md={6} key={key}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: '#fafafa',
                      border: fieldErrors[key] ? '1px solid #b91c1c' : '1px solid #eee'
                    }}
                  >
                    <Typography sx={{ mb: 1 }}>{label}</Typography>
                    <Rating value={form[key]} onChange={(e, value) => handleChange(key, value || 0)} />
                    {fieldErrors[key] && (
                      <Typography variant="caption" color="error">
                        Rating required
                      </Typography>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* YES / NO */}
            <Box mt={5}>
              {[
                ['learned_something_new', 'Did you learn something new?'],
                ['would_recommend', 'Would you recommend this to others?'],
                ['interested_in_future_webinars', 'Interested in future webinars?'],
                ['interested_in_paid_courses', 'Interested in paid courses?']
              ].map(([key, label]) => (
                <FormControl
                  key={key}
                  sx={{
                    mt: 3,
                    p: 3,
                    borderRadius: 3,
                    background: '#fafafa',
                    border: fieldErrors[key] ? '1px solid #b91c1c' : '1px solid #eee'
                  }}
                >
                  <FormLabel
                    sx={{
                      color: '#7f1d1d',
                      fontWeight: 600,
                      mb: 1
                    }}
                  >
                    {label}
                  </FormLabel>

                  <RadioGroup
                    row
                    value={form[key] === null ? '' : String(form[key])}
                    onChange={(e) => handleChange(key, e.target.value === 'true')}
                  >
                    <FormControlLabel value="true" control={<Radio sx={{ color: '#9f1239' }} />} label="Yes" />
                    <FormControlLabel value="false" control={<Radio sx={{ color: '#9f1239' }} />} label="No" />
                  </RadioGroup>

                  {fieldErrors[key] && (
                    <Typography variant="caption" color="error">
                      {fieldErrors[key]}
                    </Typography>
                  )}
                </FormControl>
              ))}
            </Box>

            {/* COMMENTS */}
            <TextField
              label="What did you like most?"
              fullWidth
              multiline
              rows={2}
              sx={{ mt: 5 }}
              value={form.liked_most}
              onChange={(e) => handleChange('liked_most', e.target.value)}
            />

            <TextField
              label="Suggestions for improvement"
              fullWidth
              multiline
              rows={3}
              sx={{ mt: 3 }}
              value={form.improvement_suggestions}
              onChange={(e) => handleChange('improvement_suggestions', e.target.value)}
            />

            <TextField
              label="Additional comments"
              fullWidth
              multiline
              rows={2}
              sx={{ mt: 3 }}
              value={form.additional_comments}
              onChange={(e) => handleChange('additional_comments', e.target.value)}
            />
            <Box
              sx={{
                mt: 6,
                p: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #fff5f7, #ffffff)',
                border: '1px solid #f3d1d8'
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  color: '#7f1d1d',
                  mb: 1
                }}
              >
                ⭐ Support Us With a Google Review (Optional)
              </Typography>

              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                If you enjoyed the webinar, please leave a Google review about Aryu Academy. After submitting your review, upload a
                screenshot below.
              </Typography>

              <Button
                variant="outlined"
                href="https://g.page/r/your-google-review-link"
                target="_blank"
                sx={{
                  mb: 3,
                  borderColor: '#9f1239',
                  color: '#9f1239',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#7f1d1d',
                    background: '#fff1f2'
                  }
                }}
              >
                Leave a Google Review
              </Button>

              <Box>
                <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                  Upload Screenshot (Optional)
                </Typography>

                <Button
                  variant="outlined"
                  component="label"
                  sx={{
                    borderRadius: 2,
                    borderColor: '#e5e7eb'
                  }}
                >
                  Choose Screenshot
                  <input type="file" hidden accept="image/*" onChange={(e) => setRatingScreenshot(e.target.files[0])} />
                </Button>

                {ratingScreenshot && (
                  <Typography variant="caption" sx={{ ml: 2 }}>
                    {ratingScreenshot.name}
                  </Typography>
                )}
              </Box>
            </Box>

            <Button
              type="submit"
              fullWidth
              sx={{
                mt: 5,
                py: 1.6,
                fontWeight: 600,
                borderRadius: 3,
                background: 'linear-gradient(90deg,#9f1239,#7f1d1d)',
                '&:hover': {
                  background: 'linear-gradient(90deg,#7f1d1d,#4c0519)'
                }
              }}
              variant="contained"
            >
              Submit Feedback
            </Button>
          </motion.div>
        </Box>
        {/* SUCCESS POPUP */}
        <Dialog
          open={successOpen}
          fullWidth
          maxWidth="sm"
          onClose={() => setSuccessOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 4,
              px: { xs: 2, sm: 4 },
              py: { xs: 3, sm: 4 },
              textAlign: 'center',
              background: 'linear-gradient(135deg,#fff5f7,#ffffff)',
              boxShadow: '0 30px 70px rgba(128, 0, 32, 0.15)'
            }
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 700,
              fontSize: { xs: 20, sm: 24 },
              color: '#7f1d1d'
            }}
          >
            🎉 Thank You for Submitting Your Feedback!
          </DialogTitle>

          <DialogContent>
            <Typography
              sx={{
                mt: 1,
                fontSize: { xs: 14, sm: 16 },
                color: 'text.secondary'
              }}
            >
              Thank you for taking the time to share your valuable feedback. We truly appreciate your support.
            </Typography>

            <Typography
              sx={{
                mt: 2,
                fontSize: { xs: 14, sm: 16 }
              }}
            >
              Your participation certificate has been successfully issued and sent to your registered email address.
              <br />
              Please check your <strong>Email</strong> and <strong>WhatsApp</strong> for the certificate.
              <br />
              <br />
              If you do not receive it within a few minutes, kindly check your spam or promotions folder.
            </Typography>

            <Box mt={4}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setSuccessOpen(false)}
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 600,
                  background: 'linear-gradient(90deg,#9f1239,#7f1d1d)',
                  '&:hover': {
                    background: 'linear-gradient(90deg,#7f1d1d,#4c0519)'
                  }
                }}
              >
                Close
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>

      <FooterBlock />
    </>
  );
};

export default WebinarFeedbackForm;
