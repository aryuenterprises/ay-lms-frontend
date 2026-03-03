import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Checkbox,
  FormControlLabel,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer
} from '@mui/material';
import { APP_PATH_BASE_URL } from 'config';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import { useParams } from 'react-router';
import axiosInstance from 'utils/axios';
import MainCard from 'components/MainCard';
import Swal from 'sweetalert2';

const FormDetail = () => {
  const { slug } = useParams();
  const [form, setForm] = useState(null);
  const [openColumns, setOpenColumns] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([]);
  console.log('FormDetail Mounted');
  console.log('Slug param:', slug);

  /* ---------------- FETCH FORM ---------------- */
  useEffect(() => {
    const fetchForm = async () => {
      try {
        if (!slug) return;

        const res = await axiosInstance.get(`${APP_PATH_BASE_URL}/api/webinar/forms/${slug}/`);

        const data = res?.data?.data;

        console.log('Fetched form data:', data);

        if (!data) {
          throw new Error('Invalid form response');
        }

        setForm(data);
        setVisibleColumns(data.questions?.map((q) => q.id) || []);
      } catch (error) {
        console.error('Form fetch error:', error);

        Swal.fire('Error', error.response?.data?.message || error.message || 'Failed to load form', 'error');
      }
    };

    fetchForm();
  }, [slug]);

  if (!form) {
    return (
      <MainCard>
        <Typography>Loading form...</Typography>
      </MainCard>
    );
  }

  /* ---------------- COPY LINK ---------------- */
  const handleCopyLink = () => {
    const link = `${window.location.origin}/forms/${form.slug}/submit`;
    navigator.clipboard.writeText(link);

    Swal.fire({
      icon: 'success',
      title: 'Link copied',
      timer: 1200,
      showConfirmButton: false
    });
  };

  /* ---------------- DYNAMIC COLUMN HANDLER ---------------- */
  const toggleColumn = (id) => {
    setVisibleColumns((prev) => (prev.includes(id) ? prev.filter((col) => col !== id) : [...prev, id]));
  };

  /* ---------------- PREPARE TABLE DATA ---------------- */
  const submissions = form.submissions || [];

  const getAnswer = (submission, questionId) => {
    const answer = submission.answers.find((a) => a.question === questionId);

    if (!answer) return '-';

    return (
      answer.value_text ||
      answer.value_number ||
      (Array.isArray(answer.value_json) ? answer.value_json.join(', ') : answer.value_json) ||
      '-'
    );
  };

  return (
    <MainCard>
      {/* HEADER */}
      <Box pb={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              {form.title}
            </Typography>
            <Typography color="text.secondary">{form.description}</Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={form.is_active ? 'Active' : 'Inactive'} color={form.is_active ? 'success' : 'default'} />

            <Chip label={`${form.submissions_count} Submissions`} color="primary" />

            <Chip label="Columns" clickable onClick={() => setOpenColumns(true)} />

            <Tooltip title="Copy Public Link">
              <IconButton onClick={handleCopyLink}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Divider sx={{ mt: 3 }} />
      </Box>

      {/* SUBMISSIONS TABLE */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid #e5e7eb',
          overflowX: 'auto'
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                <TableCell sx={{ fontWeight: 600 }}>Submitted At</TableCell>

                {form.questions
                  .filter((q) => visibleColumns.includes(q.id))
                  .map((q) => (
                    <TableCell key={q.id} sx={{ fontWeight: 600 }}>
                      {q.label}
                    </TableCell>
                  ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {submissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={form.questions.length + 1}>No submissions yet</TableCell>
                </TableRow>
              )}

              {submissions.map((submission) => (
                <TableRow key={submission.id} hover>
                  <TableCell>{new Date(submission.submitted_at).toLocaleString()}</TableCell>

                  {form.questions
                    .filter((q) => visibleColumns.includes(q.id))
                    .map((q) => (
                      <TableCell key={q.id}>{getAnswer(submission, q.id)}</TableCell>
                    ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* COLUMN SELECTION DIALOG */}
      <Dialog open={openColumns} onClose={() => setOpenColumns(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between">
            <Typography fontWeight={700}>Select Columns</Typography>
            <IconButton onClick={() => setOpenColumns(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={1}>
            {form.questions.map((q) => (
              <FormControlLabel
                key={q.id}
                control={<Checkbox checked={visibleColumns.includes(q.id)} onChange={() => toggleColumn(q.id)} />}
                label={q.label}
              />
            ))}
          </Stack>
        </DialogContent>
      </Dialog>
    </MainCard>
  );
};

export default FormDetail;
