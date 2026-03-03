// src/pages/forms/FormSubmit.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Checkbox,
  FormControlLabel,
  Rating,
  Fade,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useParams } from "react-router";
import axios from "axios";
import Swal from "sweetalert2";
import Header from "layout/CommonLayout/Header";
import Footer from "layout/CommonLayout/FooterBlock";
import { APP_PATH_BASE_URL } from "config";

const FormSubmit = () => {
  const { slug } = useParams();
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await axios.get(
          `${APP_PATH_BASE_URL}/api/webinar/public/forms/${slug}/`,
        );
        setForm(res.data.data);
      } catch {
        Swal.fire("Error", "Unable to load form", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [slug]);
  const validateForm = () => {
    const newErrors = {};

    form.questions.forEach((q) => {
      const value = answers[q.id];

      // Required validation
      if (
        q.is_required &&
        (!value || value === "" || (Array.isArray(value) && value.length === 0))
      ) {
        newErrors[q.id] = `${q.label} is required`;
        return;
      }

      // Mobile validation (assuming label contains "Mobile")
      if (q.label.toLowerCase().includes("mobile")) {
        if (value && !/^\d{10}$/.test(value)) {
          newErrors[q.id] = `${q.label} must be 10 digits`;
        }
      }

      // TEXT min/max length validation (if configured)
      if ((q.type === "TEXT" || q.type === "TEXTAREA") && value) {
        const min = q.validation_rules?.min_length;
        const max = q.validation_rules?.max_length;

        if (min && value.length < min) {
          newErrors[q.id] = `Minimum ${min} characters required`;
        }

        if (max && value.length > max) {
          newErrors[q.id] = `Maximum ${max} characters allowed`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async () => {
    if (!validateForm()) {
    Swal.fire("Error", "Please fix the errors before submitting", "error");
    return;
  }
    try {
      setSubmitting(true);

      const payload = new FormData();
      payload.append("form_slug", slug);

      const answersArray = [];

      form.questions.forEach((q) => {
        const answerValue = answers[q.id];

        if (q.type === "TEXT" || q.type === "TEXTAREA") {
          if (answerValue) {
            answersArray.push({
              question_id: q.id,
              value_text: answerValue,
            });
          }
        } else if (q.type === "RATING") {
          if (answerValue !== undefined && answerValue !== null) {
            answersArray.push({
              question_id: q.id,
              value_number: answerValue,
            });
          }
        } else if (q.type === "CHECKBOX") {
          if (answerValue && answerValue.length > 0) {
            answersArray.push({
              question_id: q.id,
              value_json: answerValue,
            });
          }
        } else if (q.type === "FILE") {
          if (answerValue) {
            const fileKey = `file_${q.id}`;

            // attach actual file
            payload.append(fileKey, answerValue);

            answersArray.push({
              question_id: q.id,
              file_key: fileKey,
            });
          }
        }
      });

      payload.append("answers", JSON.stringify(answersArray));

      await axios.post(
        `${APP_PATH_BASE_URL}/api/webinar/submissions/`,
        payload,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      Swal.fire("Success", "Feedback submitted successfully", "success");
      setAnswers({});
    } catch (err) {
      console.log(err.response?.data);
      Swal.fire("Error", "Submission failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ height: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!form) return null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: `
    radial-gradient(circle at 75% 20%, rgba(255,0,0,0.08), transparent 40%),
    radial-gradient(circle at 15% 70%, rgba(255,0,0,0.05), transparent 40%),
    linear-gradient(135deg, #fff7f7 0%, #fffafa 40%, #ffffff 100%)
  `,
      }}>
      {/* ===== Floating Blobs Background ===== */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          zIndex: 0,
        }}>
        {/* Blob 1 */}
        <Box
          sx={{
            position: "absolute",
            width: 350,
            height: 350,
            background:
              "radial-gradient(circle, rgba(255,0,0,0.15), transparent 70%)",
            borderRadius: "50%",
            top: "-80px",
            right: "-100px",
            blur: "10px",
            animation: "float1 12s ease-in-out infinite",
          }}
        />

        {/* Blob 2 */}
        <Box
          sx={{
            position: "absolute",
            width: 250,
            height: 250,
            background:
              "radial-gradient(circle, rgba(255,0,0,0.08), transparent 70%)",
            borderRadius: "50%",
            bottom: "-60px",
            left: "-80px",
            blur: "10px",
            animation: "float2 15s ease-in-out infinite",
          }}
        />
      </Box>
      <Header />
      {/* Balloon Accent */}
      <Box
        sx={{
          position: "absolute",
          width: 500,
          height: 500,
          background: "rgba(255,0,0,0.07)",
          borderRadius: "50%",
          top: "40%",
          right: "5%",
          animation: "float2 10s ease-in-out infinite",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          width: 200,
          height: 200,
          background: "rgba(255,0,0,0.05)",
          borderRadius: "50%",
          bottom: "30%",
          left: "20%",
          animation: "float1 14s ease-in-out infinite",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 200,
          height: 200,
          background: "rgba(255,0,0,0.05)",
          borderRadius: "50%",
          bottom: "60%",
          left: "10%",
          animation: "float1 14s ease-in-out infinite",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 200,
          height: 200,
          background: "rgba(255,0,0,0.05)",
          borderRadius: "50%",
          bottom: "10%",
          right: "5%",
          animation: "float1 14s ease-in-out infinite",
        }}
      />
      {/* ===== MAIN WRAPPER ===== */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          px: { xs: 2, sm: 4 },
          pt: { xs: "100px", sm: 10 },
          pb: { xs: 6, sm: 10 },
        }}>
        <Fade in timeout={600}>
          <Box
            sx={{
              width: "100%",
              maxWidth: 900,
              borderRadius: 4,
              background: "#ffffff",
              p: { xs: 3, sm: 6 },
              boxShadow: "0 20px 60px rgba(0,0,0,0.06)",
              border: "1px solid rgba(255,0,0,0.05)",
              backdropFilter: "blur(10px)",
            }}>
            {/* ===== TITLE SECTION ===== */}
            <Box mb={6} textAlign="center">
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  background: "linear-gradient(90deg,#000,#b30000)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                {form.title}
              </Typography>

              <Typography
                sx={{
                  mt: 2,
                  color: "text.secondary",
                  maxWidth: 650,
                  mx: "auto",
                  lineHeight: 1.6,
                }}>
                {form.description}
              </Typography>
            </Box>

            <Divider sx={{ mb: 5 }} />

            {/* ===== FORM FIELDS ===== */}
            <Stack spacing={4}>
              {form.questions.map((q) => (
                <Box key={q.id}>
                  <Typography fontWeight={600} sx={{ mb: 1, fontSize: 15 }}>
                    {q.label}
                  </Typography>

                  {q.type === "TEXT" && (
                    <TextField
                      fullWidth
                      type={
                        q.label.toLowerCase().includes("mobile")
                          ? "tel"
                          : "text"
                      }
                      inputProps={
                        q.label.toLowerCase().includes("mobile")
                          ? {
                              maxLength: 10,
                              inputMode: "numeric",
                              pattern: "[0-9]*",
                            }
                          : {}
                      }
                      value={answers[q.id] || ""}
                      onChange={(e) => {
                        let value = e.target.value;

                        // If mobile → allow digits only
                        if (q.label.toLowerCase().includes("mobile")) {
                          value = value.replace(/\D/g, "");
                        }

                        setAnswers({
                          ...answers,
                          [q.id]: value,
                        });
                      }}
                      error={!!errors[q.id]}
                      helperText={errors[q.id] || ""}
                    />
                  )}
                  {q.type === "TEXTAREA" && (
                    <>
                      <Box
                        component="textarea"
                        rows={q.validation_rules?.rows || 4}
                        value={answers[q.id] || ""}
                        onChange={(e) =>
                          setAnswers({
                            ...answers,
                            [q.id]: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "12px",
                          border: errors[q.id]
                            ? "1px solid red"
                            : "1px solid #e0e0e0",
                          background: "#fafafa",
                          resize: "vertical",
                          fontFamily: "inherit",
                          fontSize: "14px",
                        }}
                      />
                      {errors[q.id] && (
                        <Typography color="error" fontSize={12} mt={0.5}>
                          {errors[q.id]}
                        </Typography>
                      )}
                    </>
                  )}

                  {q.type === "RATING" && (
                    <Rating
                      size="large"
                      value={answers[q.id] || null}
                      onChange={(_, v) =>
                        setAnswers({
                          ...answers,
                          [q.id]: v,
                        })
                      }
                    />
                  )}

                  {q.type === "CHECKBOX" && (
                    <Stack>
                      {q.options.map((opt) => (
                        <FormControlLabel
                          key={opt.id}
                          control={
                            <Checkbox
                              checked={
                                answers[q.id]?.includes(opt.value) || false
                              }
                              onChange={(e) => {
                                const prev = answers[q.id] || [];
                                setAnswers({
                                  ...answers,
                                  [q.id]: e.target.checked
                                    ? [...prev, opt.value]
                                    : prev.filter((v) => v !== opt.value),
                                });
                              }}
                            />
                          }
                          label={opt.value}
                        />
                      ))}
                    </Stack>
                  )}
                  {q.type === "FILE" && (
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{ borderRadius: 2 }}>
                      {answers[q.id] ? "File Selected" : "Upload File"}
                      <input
                        type="file"
                        hidden
                        onChange={(e) =>
                          setAnswers({
                            ...answers,
                            [q.id]: e.target.files[0],
                          })
                        }
                      />
                    </Button>
                  )}
                </Box>
              ))}
            </Stack>

            {/* ===== SUBMIT BUTTON ===== */}
            <Box textAlign="center" mt={7}>
              <Button
                variant="contained"
                size="large"
                disabled={submitting}
                onClick={handleSubmit}
                sx={{
                  px: 10,
                  py: 1.8,
                  borderRadius: 50,
                  fontWeight: 700,
                  fontSize: 15,
                  background: "linear-gradient(90deg,#ff2e2e,#d40000)",
                  boxShadow: "0 15px 40px rgba(255,0,0,0.35)",
                  transition: "all .3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 20px 50px rgba(255,0,0,0.45)",
                  },
                }}>
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Box>

      <Footer />
    </Box>
  );
};

export default FormSubmit;
