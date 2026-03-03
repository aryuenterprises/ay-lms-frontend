import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  useTheme,
  useMediaQuery,
  MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';
import { APP_PATH_BASE_URL } from 'config';
import Swal from 'sweetalert2';
import axiosInstance from 'utils/axios';

/* ---------- SLUG GENERATOR ---------- */
const generateSlug = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

const FormList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    is_active: true,
    questions: []
  });

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
          validation_rules: {
            min_length: '',
            max_length: ''
          },
          options: []
        }
      ]
    }));
  };
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

  /* ---------------- FETCH ---------------- */
  const fetchForms = async () => {
    const res = await axiosInstance.get(`${APP_PATH_BASE_URL}/api/webinar/forms/`);
    setForms(res.data.data || []);
  };

  useEffect(() => {
    fetchForms();
  }, []);

  /* ---------------- OPEN CREATE ---------------- */
  const handleOpenCreate = () => {
    setEditingSlug(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      is_active: true,
      questions: []
    });
    setOpen(true);
  };

  /* ---------------- OPEN EDIT ---------------- */
  const handleOpenEdit = async (slug) => {
    if (!slug || typeof slug !== 'string') {
      console.error('Invalid slug:', slug);
      return;
    }

    const res = await axiosInstance.get(`${APP_PATH_BASE_URL}/api/webinar/forms/${slug}/`);

    const form = res.data.data;

    setEditingSlug(slug);
    setFormData({
      title: form.title,
      slug: form.slug,
      description: form.description,
      is_active: form.is_active,
      questions: form.questions || []
    });

    setOpen(true);
  };

  /* ---------------- SUBMIT (CREATE / UPDATE) ---------------- */
  const handleSubmit = async () => {
    if (!formData.title) {
      Swal.fire('Title Required', 'Please enter form title', 'warning');
      return;
    }

    try {
      if (editingSlug) {
        // UPDATE
        await axiosInstance.put(`/api/webinar/forms/${editingSlug}/`, formData);
        Swal.fire('Updated', 'Form updated successfully', 'success');
      } else {
        // CREATE
        await axiosInstance.post('/api/webinar/forms/', formData);
        Swal.fire('Created', 'Form created successfully', 'success');
      }

      setOpen(false);
      fetchForms();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (slug) => {
    if (!slug || typeof slug !== 'string') {
      return;
    }

    const confirm = await Swal.fire({
      title: 'Delete Form?',
      icon: 'warning',
      showCancelButton: true
    });

    if (confirm.isConfirmed) {
      await axiosInstance.delete(`${APP_PATH_BASE_URL}/api/webinar/forms/${slug}/delete/`);
      Swal.fire('Deleted', 'Form deleted successfully', 'success');
      fetchForms();
    }
  };

  /* ---------------- COPY LINK ---------------- */
  const handleCopyLink = async (slug) => {
    const link = `${window.location.origin}/forms/${slug}/submit`;
    await navigator.clipboard.writeText(link);

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Submission link copied',
      timer: 1500,
      showConfirmButton: false
    });
  };

  /* ================= UI ================= */
  return (
    <Box p={isMobile ? 2 : 4}>
      {/* HEADER */}
      <Stack direction={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Forms Management
        </Typography>

        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Create Form
        </Button>
      </Stack>

      {/* TABLE */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid #e5e7eb'
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Slug</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>ENTRIES</TableCell>
                <TableCell align="left" sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {forms.map((form) => (
                <TableRow key={form.slug} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{form.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {form.description}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ fontFamily: 'monospace' }}>{form.slug}</Typography>
                  </TableCell>

                  <TableCell>
                    <Chip label={form.is_active ? 'Active' : 'Inactive'} color={form.is_active ? 'success' : 'default'} size="small" />
                  </TableCell>

                  <TableCell>
                    <Button size="small" onClick={() => navigate(`/forms/${form.slug}`)}>
                      {form.submissions_count || 0}
                    </Button>
                  </TableCell>

                  <TableCell align="right">
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View">
                        <IconButton
                          onClick={() => {
                            setSelectedForm(form);
                            setOpenViewDialog(true);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleOpenEdit(form.slug)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => handleDelete(form.slug)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Copy Link">
                        <IconButton onClick={() => handleCopyLink(form.slug)}>
                          <ShareIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}

              {forms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No forms available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ADD / EDIT DIALOG */}
      <Dialog open={open} fullScreen={isMobile} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingSlug ? 'Edit Form' : 'Create Form'}</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Form Title"
            margin="normal"
            value={formData.title}
            onChange={(e) => {
              const title = e.target.value;

              setFormData({
                ...formData,
                title,
                slug: editingSlug ? formData.slug : generateSlug(title)
              });
            }}
          />

          <TextField fullWidth label="Slug" margin="normal" value={formData.slug} InputProps={{ readOnly: true }} />

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            margin="normal"
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value
              })
            }
          />
          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight={600}>
            Questions
          </Typography>

          {formData.questions.map((q, index) => (
            <Paper
              key={index}
              sx={{
                p: 3,
                mt: 3,
                borderRadius: 3,
                border: '1px solid #e5e7eb'
              }}
            >
              <Stack spacing={2}>
                {/* Header */}
                <Stack
                  direction={isMobile ? 'column' : 'row'}
                  justifyContent="space-between"
                  alignItems={isMobile ? 'flex-start' : 'center'}
                  spacing={2}
                >
                  <Typography fontWeight={600}>Question {index + 1}</Typography>

                  <FormControlLabel
                    control={<Switch checked={q.is_required} onChange={(e) => updateQuestion(index, 'is_required', e.target.checked)} />}
                    label="Required"
                  />
                </Stack>

                {/* Label */}
                <TextField
                  fullWidth
                  label="Question Label"
                  value={q.label}
                  onChange={(e) => updateQuestion(index, 'label', e.target.value)}
                />

                {/* Type */}
                <TextField select fullWidth label="Type" value={q.type} onChange={(e) => updateQuestion(index, 'type', e.target.value)}>
                  {[
                    { value: 'TEXT', label: 'Short Text' },
                    { value: 'TEXTAREA', label: 'Long Text' },
                    { value: 'RATING', label: 'Rating' },
                    { value: 'CHECKBOX', label: 'Checkbox' },
                    { value: 'FILE', label: 'File Upload' }
                  ].map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </TextField>


                {/* CHECKBOX OPTIONS */}
                {q.type === 'CHECKBOX' && (
                  <Box>
                    {q.options.map((opt, oIndex) => (
                      <TextField
                        key={oIndex}
                        fullWidth
                        sx={{ mb: 2 }}
                        label={`Option ${oIndex + 1}`}
                        value={opt.value}
                        onChange={(e) => {
                          const updated = [...formData.questions];
                          updated[index].options[oIndex].value = e.target.value;
                          setFormData({ ...formData, questions: updated });
                        }}
                      />
                    ))}

                    <Button size="small" onClick={() => addOption(index)}>
                      Add Option
                    </Button>
                  </Box>
                )}

                <Button color="error" variant="outlined" onClick={() => removeQuestion(index)}>
                  Remove Question
                </Button>
              </Stack>
            </Paper>
          ))}

          <Button startIcon={<AddIcon />} sx={{ mt: 2 }} onClick={addQuestion}>
            Add Question
          </Button>

          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_active: e.target.checked
                  })
                }
              />
            }
            label="Active"
          />
        </DialogContent>

        <Divider />

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingSlug ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Form Details</DialogTitle>

        <DialogContent>
          {selectedForm && (
            <>
              <Typography variant="h5" fontWeight={600}>
                {selectedForm.title}
              </Typography>

              <Typography color="text.secondary" mb={2}>
                {selectedForm.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" fontWeight={600}>
                Questions
              </Typography>

              <Stack spacing={2} mt={2}>
                {selectedForm.questions?.map((q, index) => (
                  <Paper key={q.id} sx={{ p: 2 }}>
                    <Typography fontWeight={600}>
                      {index + 1}. {q.label}
                    </Typography>

                    <Stack direction="row" spacing={1} mt={1}>
                      <Chip label={q.type} size="small" />
                      {q.is_required && <Chip label="Required" size="small" color="error" />}
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormList;
