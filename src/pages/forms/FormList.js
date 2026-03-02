import React, { useEffect, useState } from 'react';
import ShareIcon from '@mui/icons-material/Share';
import Tooltip from '@mui/material/Tooltip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  IconButton,
  Divider,
  Chip,
  Stack,
  MenuItem,
  Paper,
  useTheme, useMediaQuery, Accordion, AccordionSummary, AccordionDetails 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axiosInstance from 'utils/axios';
import MainCard from 'components/MainCard';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';

const QUESTION_TYPES = ['TEXT', 'RATING', 'CHECKBOX', 'FILE'];

const FormList = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_active: true,
    questions: []
  });

  /* ---------------- FETCH FORMS ---------------- */
  const fetchForms = async () => {
    const res = await axiosInstance.get('/api/webinar/forms/');
    setForms(res.data.data);
  };

  useEffect(() => {
    fetchForms();
  }, []);

  /* ---------------- QUESTION HANDLERS ---------------- */
  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          label: '',
          type: 'TEXT',
          is_required: false,
          order: prev.questions.length + 1,
          validation_rules: {},
          options: []
        }
      ]
    }));
  };
  const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const updateQuestion = (index, field, value) => {
    const updated = [...formData.questions];
    updated[index][field] = value;
    setFormData({ ...formData, questions: updated });
  };

  const removeQuestion = (index) => {
    const updated = [...formData.questions];
    updated.splice(index, 1);
    setFormData({
      ...formData,
      questions: updated.map((q, i) => ({ ...q, order: i + 1 }))
    });
  };

  const addOption = (qIndex) => {
    const updated = [...formData.questions];
    updated[qIndex].options.push({
      value: '',
      order: updated[qIndex].options.length + 1
    });
    setFormData({ ...formData, questions: updated });
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...formData.questions];
    updated[qIndex].options[oIndex].value = value;
    setFormData({ ...formData, questions: updated });
  };
  const handleCopyLink = async (uuid) => {
    const link = `${window.location.origin}/forms/${uuid}/submit`;

    try {
      await navigator.clipboard.writeText(link);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Submission link copied',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err) {
      Swal.fire('Error', 'Failed to copy link', 'error');
    }
  };
  const renderQuestionEditor = (q, index) => (
  <Stack spacing={2}>
    <Stack direction="row" justifyContent="space-between">
      <Typography fontWeight={600}>Question {index + 1}</Typography>
      <IconButton color="error" onClick={() => removeQuestion(index)}>
        <DeleteIcon />
      </IconButton>
    </Stack>

    <TextField
      fullWidth
      label="Question Label"
      value={q.label}
      onChange={(e) => updateQuestion(index, 'label', e.target.value)}
    />

    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <TextField
        select
        label="Type"
        value={q.type}
        onChange={(e) => updateQuestion(index, 'type', e.target.value)}
        fullWidth
      >
        {QUESTION_TYPES.map((t) => (
          <MenuItem key={t} value={t}>{t}</MenuItem>
        ))}
      </TextField>

      <FormControlLabel
        control={
          <Switch
            checked={q.is_required}
            onChange={(e) =>
              updateQuestion(index, 'is_required', e.target.checked)
            }
          />
        }
        label="Required"
      />
    </Stack>

    {q.type === 'CHECKBOX' && (
      <Box>
        <Typography fontWeight={500}>Options</Typography>
        {q.options.map((opt, oIdx) => (
          <TextField
            key={oIdx}
            fullWidth
            margin="dense"
            label={`Option ${oIdx + 1}`}
            value={opt.value}
            onChange={(e) => updateOption(index, oIdx, e.target.value)}
          />
        ))}
        <Button size="small" onClick={() => addOption(index)}>
          + Add Option
        </Button>
      </Box>
    )}
  </Stack>
);

  /* ---------------- CREATE FORM ---------------- */
  const handleCreate = async () => {
    try {
      await axiosInstance.post('/api/webinar/forms/', formData);

      Swal.fire({
        icon: 'success',
        title: 'Form Created',
        timer: 1500,
        showConfirmButton: false
      });

      setOpen(false);
      setFormData({
        title: '',
        description: '',
        is_active: true,
        questions: []
      });
      fetchForms();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed', 'error');
    }
  };

  /* ======================== UI ======================== */
  return (
    <MainCard>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Forms Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Create Form
        </Button>
      </Box>

      {/* Form Cards */}
      <Grid container spacing={3}>
        {forms.map((form) => (
          <Grid item xs={12} sm={6} md={6} lg={4} key={form.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
              <CardContent>
                <Typography fontWeight={600}>{form.title}</Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {form.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" justifyContent="space-between">
                  <Chip label={`Submissions: ${form.submissions_count}`} color="primary" />
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="View form details">
                      <IconButton onClick={() => navigate(`/forms/${form.uuid}`)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Copy submission link">
                      <IconButton onClick={() => handleCopyLink(form.uuid)}>
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ================= CREATE FORM DIALOG ================= */}
      <Dialog
  open={open}
  fullScreen={isMobile}
  maxWidth="lg"
  fullWidth
>
        <DialogTitle sx={{ fontWeight: 700 }}>Create New Form</DialogTitle>
        <DialogContent>
          {/* Form Info */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <TextField
              fullWidth
              label="Form Title"
              margin="normal"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              margin="normal"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <FormControlLabel
              control={<Switch checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />}
              label="Active"
            />
          </Paper>

          {/* Questions */}
          <Typography variant="h6" fontWeight={600} mb={2}>
            Questions
          </Typography>

          {formData.questions.map((q, index) => (
            <Paper key={index} sx={{ p: 3, mb: 2 }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontWeight={600}>Question {index + 1}</Typography>
                  <IconButton color="error" onClick={() => removeQuestion(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>

                <TextField
                  fullWidth
                  label="Question Label"
                  value={q.label}
                  onChange={(e) => updateQuestion(index, 'label', e.target.value)}
                />

                <Stack direction="row" spacing={2}>
                  <TextField
                    select
                    label="Type"
                    value={q.type}
                    onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                    sx={{ width: 200 }}
                  >
                    {QUESTION_TYPES.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </TextField>

                  <FormControlLabel
                    control={<Switch checked={q.is_required} onChange={(e) => updateQuestion(index, 'is_required', e.target.checked)} />}
                    label="Required"
                  />
                </Stack>

                {/* Rating Validation */}
                {q.type === 'RATING' && (
                  <Stack direction="row" spacing={2}>
                    <TextField
                      type="number"
                      label="Min"
                      onChange={(e) =>
                        updateQuestion(index, 'validation_rules', {
                          ...q.validation_rules,
                          min: Number(e.target.value)
                        })
                      }
                    />
                    <TextField
                      type="number"
                      label="Max"
                      onChange={(e) =>
                        updateQuestion(index, 'validation_rules', {
                          ...q.validation_rules,
                          max: Number(e.target.value)
                        })
                      }
                    />
                  </Stack>
                )}

                {/* Checkbox Options */}
                {q.type === 'CHECKBOX' && (
                  <Box>
                    <Typography fontWeight={500}>Options</Typography>
                    {q.options.map((opt, oIdx) => (
                      <TextField
                        key={oIdx}
                        fullWidth
                        margin="dense"
                        label={`Option ${oIdx + 1}`}
                        value={opt.value}
                        onChange={(e) => updateOption(index, oIdx, e.target.value)}
                      />
                    ))}
                    <Button size="small" onClick={() => addOption(index)}>
                      + Add Option
                    </Button>
                  </Box>
                )}
              </Stack>
            </Paper>
          ))}

          <Button startIcon={<AddIcon />} onClick={addQuestion}>
            Add Question
          </Button>
        </DialogContent>

        <DialogActions
  sx={{
    position: isMobile ? 'sticky' : 'static',
    bottom: 0,
    bgcolor: '#fff',
    zIndex: 10,
    px: 2
  }}
>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>
            Create Form
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default FormList;
