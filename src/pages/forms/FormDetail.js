// src/pages/forms/FormDetail.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Chip,
  Stack,
  Divider,
  Fade,
  Slide,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  useTheme,
  Paper
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import { useParams } from 'react-router';
import axiosInstance from 'utils/axios';
import MainCard from 'components/MainCard';
import SubmissionList from './SubmissionList';
import SubmissionDrawer from './SubmissionDrawer';
import Swal from 'sweetalert2';

const FormDetail = () => {
  const { uuid } = useParams();
  const [form, setForm] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [openQuestions, setOpenQuestions] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    axiosInstance.get(`/api/webinar/forms/${uuid}`).then((res) => setForm(res.data.data));
  }, [uuid]);

  if (!form) return null;

  /* ---------------- SHARE LINK ---------------- */
  const handleCopyLink = () => {
    const link = `${window.location.origin}/forms/${form.uuid}/submit`;
    navigator.clipboard.writeText(link);
    Swal.fire({
      icon: 'success',
      title: 'Link copied',
      timer: 1200,
      showConfirmButton: false
    });
  };

  return (
    <MainCard
      sx={{
        height: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* ================= HEADER ================= */}
      <Fade in timeout={400}>
        <Box pb={3} mb={2}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
          >
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {form.title}
              </Typography>

              <Typography color="text.secondary" mt={0.5}>
                {form.description}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Chip label={form.is_active ? 'Active' : 'Inactive'} color={form.is_active ? 'success' : 'default'} />
              <Tooltip title="View questions">
                <Chip
                  label={`${form.questions.length} Questions`}
                  clickable
                  onClick={() => setOpenQuestions(true)}
                  sx={{
                    cursor: 'pointer',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText'
                    }
                  }}
                />
              </Tooltip>
              <Chip label={`${form.submissions_count} Submissions`} color="primary" />

              <Tooltip title="Copy public submission link">
                <IconButton onClick={handleCopyLink}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          <Divider sx={{ mt: 3 }} />
        </Box>
      </Fade>

      {/* ================= CONTENT ================= */}
      <Slide in direction="up" timeout={500}>
        <Grid container sx={{ flex: 1, minHeight: 0 }}>
          <Grid
            item
            xs={12}
            md={4}
            lg={3}
            sx={{
              height: '100%',
              borderRight: { md: '1px solid #e0e0e0' }
            }}
          >
            <SubmissionList questions={form.questions} onSelect={setSelectedSubmission} />
          </Grid>

          <Grid item xs={12} md={8} lg={9} sx={{ height: '100%' }}>
            <SubmissionDrawer submission={selectedSubmission} />
          </Grid>
        </Grid>
      </Slide>

      {/* ================= QUESTIONS POPUP ================= */}
      <Dialog
        open={openQuestions}
        onClose={() => setOpenQuestions(false)}
        fullScreen={isMobile}
        maxWidth="md"
        fullWidth
        TransitionComponent={Slide}
        transitionDuration={400}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography fontWeight={700}>Form Questions</Typography>
          <IconButton onClick={() => setOpenQuestions(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            bgcolor: '#f7f9fc',
            pb: 4
          }}
        >
          <Stack spacing={2}>
            {form.questions.map((q, index) => (
              <Fade in timeout={200 + index * 80} key={q.id}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    boxShadow: '0px 4px 14px rgba(0,0,0,0.06)',
                    transition: '0.2s',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}
                >
                  <Typography fontWeight={600}>
                    {index + 1}. {q.label}
                  </Typography>

                  <Stack direction="row" spacing={1} mt={1}>
                    <Chip label={q.type} size="small" />
                    {q.is_required && <Chip label="Required" color="error" size="small" />}
                  </Stack>

                  {q.validation_rules && Object.keys(q.validation_rules).length > 0 && (
                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                      Validation: {JSON.stringify(q.validation_rules)}
                    </Typography>
                  )}

                  {q.options?.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                      {q.options.map((opt) => (
                        <Chip key={opt.id} label={opt.value} size="small" />
                      ))}
                    </Stack>
                  )}
                </Paper>
              </Fade>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>
    </MainCard>
  );
};

export default FormDetail;
