import React, { useEffect, useRef, useState } from 'react';
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
  MenuItem,
  Avatar
} from '@mui/material';
import { useNavigate } from 'react-router';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CancelIcon from '@mui/icons-material/Cancel';
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
  const imageInputRef = useRef(null);

  const [forms, setForms] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);

  /* ---- image state ---- */
  const [imageFile, setImageFile] = useState(null);        // new File selected by user
  const [imagePreview, setImagePreview] = useState(null);  // local blob URL for preview
  const [existingImageUrl, setExistingImageUrl] = useState(null); // URL from server (edit mode)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    is_active: true,
    questions: []
  });

  /* =========================================================
     QUESTION HELPERS
  ========================================================= */
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
          validation_rules: { min_length: '', max_length: '' },
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
    updated[qIndex].options.push({ value: '', order: updated[qIndex].options.length + 1 });
    setFormData({ ...formData, questions: updated });
  };

  /* =========================================================
     IMAGE HELPERS
  ========================================================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type & size (max 5 MB)
    if (!file.type.startsWith('image/')) {
      Swal.fire('Invalid File', 'Please select a valid image file.', 'warning');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Too Large', 'Image must be smaller than 5 MB.', 'warning');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  /* =========================================================
     FETCH
  ========================================================= */
  const fetchForms = async () => {
    const res = await axiosInstance.get(`${APP_PATH_BASE_URL}/api/webinar/forms/`);
    setForms(res.data.data || []);
  };

  useEffect(() => {
    fetchForms();
  }, []);

  /* =========================================================
     OPEN CREATE
  ========================================================= */
  const handleOpenCreate = () => {
    setEditingSlug(null);
    setFormData({ title: '', slug: '', description: '', is_active: true, questions: [] });
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    setOpen(true);
  };

  /* =========================================================
     OPEN EDIT
  ========================================================= */
  const handleOpenEdit = async (slug) => {
    if (!slug || typeof slug !== 'string') return;

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

    // Pre-fill existing image
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(form.form_image_url || null);

    setOpen(true);
  };

  /* =========================================================
     BUILD MULTIPART PAYLOAD
     ─ questions must be sent as a JSON string in form-data
  ========================================================= */
  const buildFormPayload = () => {
    const payload = new FormData();

    payload.append('title', formData.title);
    payload.append('slug', formData.slug);
    payload.append('description', formData.description || '');
    payload.append('is_active', formData.is_active);

    // Serialise questions as JSON string (backend parses it back)
    payload.append('questions', JSON.stringify(formData.questions));

    // Only attach image if user selected a NEW file
    if (imageFile) {
      payload.append('form_image', imageFile);
    }

    return payload;
  };

  /* =========================================================
     SUBMIT (CREATE / UPDATE)
  ========================================================= */
  const handleSubmit = async () => {
    if (!formData.title) {
      Swal.fire('Title Required', 'Please enter form title', 'warning');
      return;
    }

    const payload = buildFormPayload();

    try {
      if (editingSlug) {
        await axiosInstance.put(`/api/webinar/forms/${editingSlug}/`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire('Updated', 'Form updated successfully', 'success');
      } else {
        await axiosInstance.post('/api/webinar/forms/', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire('Created', 'Form created successfully', 'success');
      }

      setOpen(false);
      fetchForms();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */
  const handleDelete = async (slug) => {
    if (!slug || typeof slug !== 'string') return;

    const confirm = await Swal.fire({ title: 'Delete Form?', icon: 'warning', showCancelButton: true });
    if (confirm.isConfirmed) {
      await axiosInstance.delete(`${APP_PATH_BASE_URL}/api/webinar/forms/${slug}/delete/`);
      Swal.fire('Deleted', 'Form deleted successfully', 'success');
      fetchForms();
    }
  };

  /* =========================================================
     COPY LINK
  ========================================================= */
  const handleCopyLink = async (slug) => {
    const link = `${window.location.origin}/forms/${slug}`;
    await navigator.clipboard.writeText(link);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Submission link copied', timer: 1500, showConfirmButton: false });
  };

  /* =========================================================
     IMAGE UPLOAD SECTION (reused in dialog)
  ========================================================= */
  const ImageUploadSection = () => {
    const displayUrl = imagePreview || existingImageUrl;

    return (
      <Box mt={2}>
        <Typography variant="subtitle2" fontWeight={600} mb={1}>
          Form Image
        </Typography>

        {displayUrl ? (
          /* ---- PREVIEW ---- */
          <Box
            sx={{
              position: 'relative',
              display: 'inline-block',
              borderRadius: 3,
              overflow: 'hidden',
              border: '2px solid #e5e7eb'
            }}
          >
            <Box
              component="img"
              src={displayUrl}
              alt="Form preview"
              sx={{ display: 'block', maxWidth: '100%', maxHeight: 200, objectFit: 'cover' }}
            />

            {/* Overlay buttons */}
            <Stack
              direction="row"
              spacing={1}
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8
              }}
            >
              {/* Change image */}
              <Button
                size="small"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={() => imageInputRef.current?.click()}
                sx={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.55)', fontSize: 11 }}
              >
                Change
              </Button>

              {/* Remove image */}
              <IconButton
                size="small"
                onClick={handleRemoveImage}
                sx={{ backgroundColor: 'rgba(220,38,38,0.8)', color: '#fff', '&:hover': { backgroundColor: 'rgba(220,38,38,1)' } }}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        ) : (
          /* ---- DROPZONE ---- */
          <Box
            onClick={() => imageInputRef.current?.click()}
            sx={{
              border: '2px dashed #d1d5db',
              borderRadius: 3,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s, background 0.2s',
              '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' }
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Click to upload form image
            </Typography>
            <Typography variant="caption" color="text.disabled">
              PNG, JPG, WEBP — max 5 MB
            </Typography>
          </Box>
        )}

        {/* Hidden file input */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />
      </Box>
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */
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
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e5e7eb' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                <TableCell sx={{ fontWeight: 600 }}>Image</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Slug</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Entries</TableCell>
                <TableCell align="left" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {forms.map((form) => (
                <TableRow key={form.slug} hover>
                  {/* Thumbnail */}
                  <TableCell>
                    <Avatar
                      src={form.form_image_url || ''}
                      variant="rounded"
                      sx={{ width: 48, height: 48, bgcolor: '#f3f4f6' }}
                    >
                      {!form.form_image_url && form.title?.[0]?.toUpperCase()}
                    </Avatar>
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight={600}>{form.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{form.description}</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ fontFamily: 'monospace' }}>{form.slug}</Typography>
                  </TableCell>

                  <TableCell>
                    <Chip label={form.is_active ? 'Active' : 'Inactive'} color={form.is_active ? 'success' : 'default'} size="small" />
                  </TableCell>

                  <TableCell>
                    <Button size="small" onClick={() => navigate(`/forms/${form.slug}/entries`)}>
                      {form.submissions_count || 0}
                    </Button>
                  </TableCell>

                  <TableCell align="right">
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View">
                        <IconButton onClick={() => { setSelectedForm(form); setOpenViewDialog(true); }}>
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
                  <TableCell colSpan={6} align="center">No forms available</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ===================== ADD / EDIT DIALOG ===================== */}
      <Dialog open={open} fullScreen={isMobile} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingSlug ? 'Edit Form' : 'Create Form'}</DialogTitle>

        <DialogContent>
          {/* Image Upload */}
          <ImageUploadSection />

          <Divider sx={{ my: 2 }} />

          {/* Title */}
          <TextField
            fullWidth
            label="Form Title"
            margin="normal"
            value={formData.title}
            onChange={(e) => {
              const title = e.target.value;
              setFormData({ ...formData, title, slug: editingSlug ? formData.slug : generateSlug(title) });
            }}
          />

          {/* Slug (read-only) */}
          <TextField fullWidth label="Slug" margin="normal" value={formData.slug} InputProps={{ readOnly: true }} />

          {/* Description */}
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            margin="normal"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <Divider sx={{ my: 3 }} />

          {/* Questions */}
          <Typography variant="h6" fontWeight={600}>Questions</Typography>

          {formData.questions.map((q, index) => (
            <Paper key={index} sx={{ p: 3, mt: 3, borderRadius: 3, border: '1px solid #e5e7eb' }}>
              <Stack spacing={2}>
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

                <TextField fullWidth label="Question Label" value={q.label} onChange={(e) => updateQuestion(index, 'label', e.target.value)} />

                <TextField select fullWidth label="Type" value={q.type} onChange={(e) => updateQuestion(index, 'type', e.target.value)}>
                  {[
                    { value: 'TEXT', label: 'Short Text' },
                    { value: 'TEXTAREA', label: 'Long Text' },
                    { value: 'RATING', label: 'Rating' },
                    { value: 'CHECKBOX', label: 'Checkbox' },
                    { value: 'FILE', label: 'File Upload' }
                  ].map((type) => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </TextField>

                {/* Checkbox Options */}
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
                    <Button size="small" onClick={() => addOption(index)}>Add Option</Button>
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

          <Box mt={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingSlug ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===================== VIEW DIALOG ===================== */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Form Details</DialogTitle>

        <DialogContent>
          {selectedForm && (
            <>
              {/* Form Image */}
              {selectedForm.form_image_url && (
                <Box
                  component="img"
                  src={selectedForm.form_image_url}
                  alt={selectedForm.title}
                  sx={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 2, mb: 2 }}
                />
              )}

              <Typography variant="h5" fontWeight={600}>{selectedForm.title}</Typography>
              <Typography color="text.secondary" mb={2}>{selectedForm.description}</Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" fontWeight={600}>Questions</Typography>

              <Stack spacing={2} mt={2}>
                {selectedForm.questions?.map((q, index) => (
                  <Paper key={q.id} sx={{ p: 2 }}>
                    <Typography fontWeight={600}>{index + 1}. {q.label}</Typography>
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