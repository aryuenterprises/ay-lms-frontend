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
  Divider
} from "@mui/material";
import { useParams } from "react-router";
import axios from "axios";
import Swal from "sweetalert2";
import Header from "layout/CommonLayout/Header";
import Footer from "layout/CommonLayout/FooterBlock";
import { APP_PATH_BASE_URL } from "config";

const FormSubmit = () => {
  const { uuid } = useParams();

  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await axios.get(
          `${APP_PATH_BASE_URL}/api/webinar/public/forms/${uuid}/`
        );
        setForm(res.data.data);
      } catch {
        Swal.fire("Error", "Unable to load form", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [uuid]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const payload = new FormData();
      payload.append("form_uuid", uuid);

      payload.append(
        "answers",
        JSON.stringify(
          form.questions.map((q) => ({
            question_id: q.id,
            value_text: q.type === "TEXT" ? answers[q.id] || null : null,
            value_number: q.type === "RATING" ? answers[q.id] || null : null,
            value_json: q.type === "CHECKBOX" ? answers[q.id] || null : null,
          }))
        )
      );

      await axios.post(
        `${APP_PATH_BASE_URL}/api/webinar/submissions/`,
        payload
      );

      Swal.fire("Success", "Feedback submitted successfully", "success");
    } catch {
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
        background: "linear-gradient(135deg, #f7f8fc 0%, #eef1f6 100%)",
      }}
    >
      <Header />

      {/* ===== MAIN WRAPPER ===== */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          px: { xs: 2, sm: 4 },
          pt: { xs: "100px", sm: 10 },
          pb: { xs: 6, sm: 10 },
        }}
      >
        <Fade in timeout={600}>
          <Box
            sx={{
              width: "100%",
              maxWidth: 900,
              borderRadius: 5,
              background: "#ffffff",
              p: { xs: 3, sm: 6 },
              boxShadow: "0 30px 80px rgba(0,0,0,0.08)",
              transition: "all .3s ease",
            }}
          >
            {/* ===== TITLE SECTION ===== */}
            <Box mb={6} textAlign="center">
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{ color: "#1c1c1c" }}
              >
                {form.title}
              </Typography>

              <Typography
                sx={{
                  mt: 2,
                  color: "text.secondary",
                  maxWidth: 650,
                  mx: "auto",
                  lineHeight: 1.6,
                }}
              >
                {form.description}
              </Typography>
            </Box>

            <Divider sx={{ mb: 5 }} />

            {/* ===== FORM FIELDS ===== */}
            <Stack spacing={4}>
              {form.questions.map((q) => (
                <Box key={q.id}>
                  <Typography
                    fontWeight={600}
                    sx={{ mb: 1, fontSize: 15 }}
                  >
                    {q.label}
                  </Typography>

                  {q.type === "TEXT" && (
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="medium"
                      value={answers[q.id] || ""}
                      onChange={(e) =>
                        setAnswers({
                          ...answers,
                          [q.id]: e.target.value,
                        })
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          background: "#fafafa",
                        },
                      }}
                    />
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
                }}
              >
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