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
  useTheme
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
  const [openSubmission, setOpenSubmission] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    axiosInstance
      .get(`/api/webinar/forms/${uuid}`)
      .then((res) => setForm(res.data.data));
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

  const handleSelectSubmission = (submission) => {
    setSelectedSubmission(submission);
    if (isMobile) setOpenSubmission(true);
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
      <Fade in timeout={300}>
        <Box pb={3} mb={2}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {form.title}
              </Typography>
              <Typography color="text.secondary">
                {form.description}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Chip
                label={form.is_active ? 'Active' : 'Inactive'}
                color={form.is_active ? 'success' : 'default'}
              />

              <Chip
                label={`${form.questions.length} Questions`}
                clickable
                onClick={() => setOpenQuestions(true)}
              />

              <Chip
                label={`${form.submissions_count} Submissions`}
                color="primary"
              />

              <Tooltip title="Copy public link">
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
      {!isMobile ? (
        /* ===== DESKTOP VIEW ===== */
        <Grid container sx={{ flex: 1, minHeight: 0 }}>
          <Grid item md={4} lg={3} sx={{ borderRight: '1px solid #e0e0e0' }}>
            <SubmissionList
              questions={form.questions}
              onSelect={handleSelectSubmission}
            />
          </Grid>

          <Grid item md={8} lg={9}>
            <SubmissionDrawer submission={selectedSubmission} />
          </Grid>
        </Grid>
      ) : (
        /* ===== MOBILE VIEW ===== */
        <Box sx={{ flex: 1 }}>
          <SubmissionList
            questions={form.questions}
            onSelect={handleSelectSubmission}
          />
        </Box>
      )}

      {/* ================= MOBILE SUBMISSION DRAWER ================= */}
      <Dialog
        open={openSubmission}
        onClose={() => setOpenSubmission(false)}
        fullScreen
        TransitionComponent={Slide}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography fontWeight={700}>Submission</Typography>
          <IconButton onClick={() => setOpenSubmission(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <SubmissionDrawer submission={selectedSubmission} />
        </DialogContent>
      </Dialog>

      {/* ================= QUESTIONS POPUP ================= */}
      <Dialog
        open={openQuestions}
        onClose={() => setOpenQuestions(false)}
        fullScreen={isMobile}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between">
            <Typography fontWeight={700}>Form Questions</Typography>
            <IconButton onClick={() => setOpenQuestions(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ bgcolor: '#f7f9fc' }}>
          <Stack spacing={2}>
            {form.questions.map((q, i) => (
              <Box
                key={q.id}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: '#fff',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
                }}
              >
                <Typography fontWeight={600}>
                  {i + 1}. {q.label}
                </Typography>

                <Stack direction="row" spacing={1} mt={1}>
                  <Chip label={q.type} size="small" />
                  {q.is_required && (
                    <Chip label="Required" size="small" color="error" />
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>
    </MainCard>
  );
};

export default FormDetail;