import { useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  TextField,
  Grid,
  Rating,
  Button,
  FormControlLabel,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Snackbar
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from 'utils/axios';

const WebinarFeedbackForm = () => {
  const { id } = useParams();
  const webinarUuid = id;

  const navigate = useNavigate();

  const [form, setForm] = useState({
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
  // set(webinarUuid);

  const [ratingScreenshot, setRatingScreenshot] = useState(null);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  // const[viewOpen,setviewOpen]=useState("");
  // const[viewClose,setviewClose]=useState("");
  // const[viewFeedback,setViewFeedback] = useState("");
  // console.log("viewFeedback",viewFeedback);
  // const handleviewOpen =(values)=>{
  //   setViewFeedback(values)
  //   setviewOpen(false)
  // }
  // const handleviewclose =(values)=>{
  //   setviewClose(true)
  // }

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!webinarUuid) {
      setError('Webinar ID missing. Please open feedback link again.');
      return;
    }

    if (
      !form.phone ||
      form.overall_rating === 0 ||
      form.content_quality === 0 ||
      form.speaker_quality === 0 ||
      form.pace_of_session === 0 ||
      form.interaction_rating === 0
    ) {
      setError('Please provide all required ratings');
      return;
    }

    if (
      form.learned_something_new === null ||
      form.would_recommend === null ||
      form.interested_in_future_webinars === null ||
      form.interested_in_paid_courses === null
    ) {
      setError('Please answer all Yes / No questions');
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

    if (ratingScreenshot) {
      payload.append('rating_screenshot', ratingScreenshot);
    }

    try {
      await axiosInstance.post(`/api/webinar/feedback/`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setOpenSnackbar(true);

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      const apiError = err?.response?.data && Object.values(err.response.data)[0];

      setError(Array.isArray(apiError) ? apiError[0] : apiError || 'Failed to submit feedback');
    }
  };

  return (
    <Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Typography variant="h3" gutterBottom marginBottom={2}>
          Webinar Feedback
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        <Typography variant="h5" gutterBottom marginBottom={0}>
          Name: *  (This name will be used to print certificate, so please provide the correct name)
        </Typography>
        <TextField
          label="Name "
          fullWidth
          required
          margin="normal"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />
        <Typography variant="h5" gutterBottom marginBottom={0} marginTop={2}>
          Registered Phone Number: *
        </Typography>
        <TextField
          label="Registered Phone Number"
          fullWidth
          required
          margin="normal"
          value={form.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
        />

        <Grid container spacing={4} marginTop={1}>
          {[
            ['overall_rating', 'Overall Experience'],
            ['content_quality', 'Content Quality'],
            ['speaker_quality', 'Speaker Quality'],
            ['pace_of_session', 'Pace of Session'],
            ['interaction_rating', 'Interaction']
          ].map(([key, label]) => (
            <Grid item xs={12} md={6} sm={6} key={key}>
              <Typography>{label} *</Typography>
              <Rating value={form[key]} onChange={(e, value) => handleChange(key, value || 0)} />
            </Grid>
          ))}
        </Grid>

        {/* YES / NO QUESTIONS */}
        {[
          ['learned_something_new', 'Did you learn something new?*'],
          ['would_recommend', 'Would you recommend this to others?*'],
          ['interested_in_future_webinars', 'Interested in future webinars?*'],
          ['interested_in_paid_courses', 'Interested in paid courses?*']
        ].map(([key, label]) => (
          <FormControl key={key} sx={{ mt: 2, md: 2, p: 2 }}>
            <FormLabel>{label}</FormLabel>
            <RadioGroup
              row
              value={form[key] === null ? '' : String(form[key])}
              onChange={(e) => handleChange(key, e.target.value === 'true')}
            >
              <FormControlLabel value="true" control={<Radio />} label="Yes" />
              <FormControlLabel value="false" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        ))}

        <TextField
          label="What did you like most?"
          fullWidth
          multiline
          rows={2}
          margin="normal"
          value={form.liked_most}
          onChange={(e) => handleChange('liked_most', e.target.value)}
        />

        <TextField
          label="Suggestions for improvement"
          fullWidth
          multiline
          rows={3}
          margin="normal"
          value={form.improvement_suggestions}
          onChange={(e) => handleChange('improvement_suggestions', e.target.value)}
        />

        <TextField
          label="Additional comments"
          fullWidth
          multiline
          rows={2}
          margin="normal"
          value={form.additional_comments}
          onChange={(e) => handleChange('additional_comments', e.target.value)}
        />

        <Box mt={2}>
          <Typography>Upload Rating Screenshot (optional)</Typography>
          <input type="file" accept="image/*" onChange={(e) => setRatingScreenshot(e.target.files[0])} />
        </Box>

        <Snackbar open={openSnackbar} autoHideDuration={2000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="success" variant="filled">
            🎉 Feedback submitted successfully!
          </Alert>
        </Snackbar>

        <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
          Submit Feedback
        </Button>
      </Box>
    </Box>
  );
};

export default WebinarFeedbackForm;