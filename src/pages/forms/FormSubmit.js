// src/pages/forms/FormSubmit.jsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Checkbox,
  FormControlLabel,
  Rating,
  Fade,
  CircularProgress
} from '@mui/material';
import { useParams } from 'react-router';
import axios from 'axios';
import Swal from 'sweetalert2';
import Header from 'layout/CommonLayout/Header';
import Footer from 'layout/CommonLayout/FooterBlock';
import { APP_PATH_BASE_URL } from 'config';

const FormSubmit = () => {
  const { uuid } = useParams();

  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* ================= FETCH PUBLIC FORM ================= */
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await axios.get(
          `${APP_PATH_BASE_URL}/api/webinar/public/forms/${uuid}/`
        );
        setForm(res.data.data);
      } catch (err) {
        console.error('Public Form Fetch Error:', err);
        Swal.fire('Error', 'Unable to load form', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [uuid]);

  /* ================= VALIDATION ================= */
  const validate = () => {
    for (let q of form.questions) {
      if (q.is_required) {
        if (
          (q.type === 'TEXT' && !answers[q.id]) ||
          (q.type === 'RATING' && !answers[q.id]) ||
          (q.type === 'CHECKBOX' &&
            (!answers[q.id] || answers[q.id].length === 0))
        ) {
          Swal.fire('Required', `${q.label} is required`, 'warning');
          return false;
        }
      }
    }
    return true;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);

      const payload = new FormData();
      payload.append('form_uuid', uuid);

      payload.append(
        'answers',
        JSON.stringify(
          form.questions.map((q) => ({
            question_id: q.id,
            value_text: q.type === 'TEXT' ? answers[q.id] || null : null,
            value_number:
              q.type === 'RATING' ? answers[q.id] || null : null,
            value_json:
              q.type === 'CHECKBOX' ? answers[q.id] || null : null
          }))
        )
      );

      if (files.value_file) {
        payload.append('files[value_file]', files.value_file);
      }

      await axios.post(
        `${APP_PATH_BASE_URL}/api/webinar/submissions/`,
        payload
      );

      Swal.fire('Success', 'Feedback submitted successfully', 'success');

      setAnswers({});
      setFiles({});
    } catch (err) {
      console.error('Submission Error:', err);
      Swal.fire('Error', 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'grid',
          placeItems: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!form) return null;

  /* ================= UI ================= */
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f6f7fb',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* ===== HEADER ===== */}
      <Header />

      {/* ===== BACKGROUND BLOBS ===== */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, #ff5252 0%, transparent 70%)',
            top: -160,
            left: -160,
            filter: 'blur(120px)',
            opacity: 0.35,
            animation: 'blobFloat 26s ease-in-out infinite'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 460,
            height: 460,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, #7c4dff 0%, transparent 70%)',
            bottom: -200,
            right: -200,
            filter: 'blur(140px)',
            opacity: 0.35,
            animation:
              'blobFloat 32s ease-in-out infinite reverse'
          }}
        />
      </Box>

      {/* ===== MAIN ===== */}
      <Box
        sx={{
          flex: 1,
          zIndex: 1,
          display: 'flex',
          justifyContent: 'center',
          px: { xs: 2, sm: 4 },
          py: { xs: 4, sm: 8 }
        }}
      >
        <Fade in timeout={600}>
          <Box sx={{ width: '100%', maxWidth: 860 }}>
            <Paper
              sx={{
                borderRadius: 4,
                p: { xs: 3, sm: 5 },
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.98))',
                backdropFilter: 'blur(14px)',
                boxShadow:
                  '0 24px 64px rgba(0,0,0,0.08)'
              }}
            >
              {/* ===== TITLE ===== */}
              <Box textAlign="center" mb={5}>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{ letterSpacing: -0.5 }}
                >
                  {form.title}
                </Typography>
                <Typography color="text.secondary" mt={1}>
                  {form.description}
                </Typography>
              </Box>

              {/* ===== QUESTIONS ===== */}
              <Stack spacing={3}>
                {form.questions.map((q, index) => (
                  <Fade
                    in
                    timeout={400 + index * 80}
                    key={q.id}
                  >
                    <Paper
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        boxShadow:
                          '0 10px 30px rgba(0,0,0,0.06)'
                      }}
                    >
                      <Typography fontWeight={700} mb={1}>
                        {index + 1}. {q.label}
                      </Typography>

                      {q.type === 'TEXT' && (
                        <TextField
                          fullWidth
                          value={answers[q.id] || ''}
                          onChange={(e) =>
                            setAnswers({
                              ...answers,
                              [q.id]: e.target.value
                            })
                          }
                        />
                      )}

                      {q.type === 'RATING' && (
                        <Rating
                          size="large"
                          value={answers[q.id] || null}
                          onChange={(_, v) =>
                            setAnswers({
                              ...answers,
                              [q.id]: v
                            })
                          }
                        />
                      )}

                      {q.type === 'CHECKBOX' && (
                        <Stack>
                          {q.options.map((opt) => (
                            <FormControlLabel
                              key={opt.id}
                              control={
                                <Checkbox
                                  checked={
                                    answers[q.id]?.includes(
                                      opt.value
                                    ) || false
                                  }
                                  onChange={(e) => {
                                    const prev =
                                      answers[q.id] || [];
                                    setAnswers({
                                      ...answers,
                                      [q.id]:
                                        e.target.checked
                                          ? [
                                              ...prev,
                                              opt.value
                                            ]
                                          : prev.filter(
                                              (v) =>
                                                v !==
                                                opt.value
                                            )
                                    });
                                  }}
                                />
                              }
                              label={opt.value}
                            />
                          ))}
                        </Stack>
                      )}

                      {q.type === 'FILE' && (
                        <Box mt={2}>
                          <input
                            type="file"
                            onChange={(e) =>
                              setFiles({
                                value_file:
                                  e.target.files[0]
                              })
                            }
                          />
                        </Box>
                      )}
                    </Paper>
                  </Fade>
                ))}
              </Stack>

              {/* ===== SUBMIT ===== */}
              <Box mt={6} textAlign="center">
                <Button
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  onClick={handleSubmit}
                  sx={{
                    px: 8,
                    py: 1.6,
                    borderRadius: 99,
                    fontWeight: 700
                  }}
                >
                  {submitting
                    ? 'Submitting...'
                    : 'Submit Feedback'}
                </Button>
              </Box>
            </Paper>
          </Box>
        </Fade>
      </Box>

      {/* ===== FOOTER ===== */}
      <Footer />
    </Box>
  );
};

export default FormSubmit;