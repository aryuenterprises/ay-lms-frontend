import {
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogContent,
  DialogTitle,
  FormLabel,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Add, CloseSquare, Edit, Trash } from 'iconsax-react';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { PopupTransition } from 'components/@extended/Transitions';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { APP_PATH_BASE_URL } from 'config';
import axiosInstance from 'utils/axios';
import { formatDateTime } from 'utils/dateUtils';

const RecordingData = ({ StuId }) => {
  const [recordings, setRecordings] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state

  const auth = JSON.parse(localStorage.getItem('auth'));
  const userType = auth?.loginType;

  const validationSchema = Yup.object({
    topic: Yup.string().required('Topic is required'),
    recording: Yup.string().required('Recording URL is required')
  });

  // Unified function for Add and Edit
  const handleSubmit = async (values, { resetForm }) => {
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true); // Set submitting state to true
    try {
      const url =
        editIndex !== null
          ? `${APP_PATH_BASE_URL}api/recordings/${StuId}/${recordings[editIndex].id}`
          : `${APP_PATH_BASE_URL}api/recordings/${StuId}`;

      const method = editIndex !== null ? 'patch' : 'post';
      const payload = { topic: values.topic, recording: values.recording, student: StuId };

      const response = await axiosInstance[method](url, payload);
      const { success, message } = response.data;

      if (success) {
        Swal.fire({ title: 'Success!', text: message, icon: 'success' });
        fetchData();
        handleDialogClose();
        resetForm();
      } else {
        Swal.fire({ title: 'Error!', text: message, icon: 'error' });
      }
    } catch (error) {
      Swal.fire({ title: 'Error!', text: error.message, icon: 'error' });
      console.error('Error submitting data:', error);
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  const formik = useFormik({
    initialValues: { topic: '', recording: '' },
    validationSchema,
    enableReinitialize: true,
    onSubmit: handleSubmit
  });

  const fetchData = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/recordings/${StuId}`);
      const data = response.data;
      setRecordings(data?.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [StuId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDialogOpen = (index = null) => {
    setEditIndex(index);
    if (index !== null) {
      // Edit: fill with selected recording
      formik.setValues({
        topic: recordings[index].topic,
        recording: recordings[index].recording
      });
    } else {
      // Add: clear form
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditIndex(null);
    setIsSubmitting(false);
    formik.resetForm();
  };

  const handleDelete = useCallback(
    async (id) => {
      const confirm = await Swal.fire({
        title: 'Are you sure?',
        text: 'Delete this recording?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!'
      });
      if (confirm.isConfirmed) {
        try {
          const response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/recordings/${StuId}/${id}/archive`, { method: 'PATCH' });
          const result = response.data;
          if (result.success === true) {
            fetchData();
            Swal.fire('Deleted!', result.message, 'success');
          } else {
            Swal.fire('Error!', result.message, 'error');
          }
        } catch (error) {
          Swal.fire('Error!', 'Failed to delete.', 'error');
        }
      }
    },
    [StuId, fetchData]
  );

  return (
    <>
      <Grid container spacing={2} pl={3} alignItems="flex-start">
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h5">Recordings</Typography>
          {(userType === 'admin' || userType === 'super_admin') && (
            <Button variant="contained" startIcon={<Add />} onClick={() => handleDialogOpen()}>
              Add
            </Button>
          )}
        </Grid>
        {/* Card Display */}
        {recordings && recordings.length > 0 ? (
          recordings.map((recording, idx) => (
            <Grid item xs={12} sm={6} md={4} key={recording._id || idx}>
              <Card
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                    borderColor: 'secondary.light'
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={500}>
                    Title : {recording.topic}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={400}>
                    {formatDateTime(recording.created_date)}
                  </Typography>
                  <Typography
                    variant="body2"
                    component="a"
                    href={recording.recording}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'primary.main',
                      my: 1,
                      fontSize: 14,
                      fontWeight: 400
                    }}
                  >
                    {recording.recording}
                  </Typography>
                </CardContent>
                {(userType === 'admin' || userType === 'super_admin') && (
                  <CardActions sx={{ justifyContent: 'space-between' }}>
                    <IconButton onClick={() => handleDialogOpen(idx)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(recording.id)}>
                      <Trash color="red" />
                    </IconButton>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No recordings there to show
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        open={openDialog}
        onClose={handleDialogClose}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {editIndex !== null ? 'Edit Recording' : 'Add New Recording'}
          <IconButton onClick={handleDialogClose} edge="end">
            <CloseSquare height={30} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={formik.handleSubmit} style={{ padding: '20px' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <FormLabel>Topic *</FormLabel>
                  <TextField
                    fullWidth
                    id="topic"
                    name="topic"
                    placeholder="Topic"
                    value={formik.values.topic}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.topic && Boolean(formik.errors.topic)}
                    helperText={formik.touched.topic && formik.errors.topic}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <FormLabel>Recording URL *</FormLabel>
                  <TextField
                    fullWidth
                    id="recording"
                    name="recording"
                    placeholder="Recording URL"
                    value={formik.values.recording}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.recording && Boolean(formik.errors.recording)}
                    helperText={formik.touched.recording && formik.errors.recording}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button color="error" onClick={handleDialogClose} sx={{ mr: 2 }} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting} // Disable button when submitting
                >
                  {isSubmitting ? 'Submitting...' : editIndex !== null ? 'Update' : 'Submit'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default RecordingData;

RecordingData.propTypes = {
  StuId: PropTypes.string
};
