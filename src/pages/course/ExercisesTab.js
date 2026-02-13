import {
  Grid,
  Button,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
  Chip,
  FormLabel,
  CircularProgress
} from '@mui/material';
import { Send, Edit, Add, CloseCircle, AttachCircle, Trash, CloseSquare } from 'iconsax-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axiosInstance from 'utils/axios';
import { APP_PATH_BASE_URL } from 'config';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import { Capitalise } from 'utils/capitalise';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'assets/css/commonStyle.css';
import { formatDateTime } from 'utils/dateUtils';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { usePermission } from 'hooks/usePermission';

const ExercisesTab = ({ courseId }) => {
  const { checkPermission } = usePermission();

  const canCreate = checkPermission('Exercise', 'create');
  const canUpdate = checkPermission('Exercise', 'update');
  const canDelete = checkPermission('Exercise', 'delete');

  const [exercises, setExercises] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentComment, setCurrentComment] = useState('');
  const [currentFile, setCurrentFile] = useState(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTexts, setReplyTexts] = useState({});
  const [error, setError] = useState({ comment: '', general: '' });
  const quillRef = useRef(null);

  const auth = JSON.parse(localStorage.getItem('auth'));
  const userRole = auth?.loginType;
  const userId = auth?.user?.employee_id || auth?.user?.user_id;
  const regId = auth?.user?.registration_id;

  // Validation Schema
  const exerciseValidationSchema = Yup.object({
    title: Yup.string()
      .required('Title is required')
      .test('is-not-empty', 'Title is required', (value) => value && value.replace(/<(.|\n)*?>/g, '').trim().length > 0),
    description: Yup.string()
      .required('Description is required')
      .test('is-not-empty', 'Description is required', (value) => value && value.replace(/<(.|\n)*?>/g, '').trim().length > 0)
  });

  // Formik initialization
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      status: 'pending',
      duedate: null,
      priority: 'medium'
    },
    validationSchema: exerciseValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const description = quillRef.current?.getEditor().root.innerHTML || '';

        if (!values.title || !description) {
          Swal.fire('Error', 'Title and description are required', 'error');
          return;
        }

        const exerciseData = {
          title: values.title,
          description: description,
          course: courseId,
          assigned_by: userId
        };
        let res;
        if (editMode) {
          res = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/assignments/${values.id}`, exerciseData);
        } else {
          res = await axiosInstance.post(`${APP_PATH_BASE_URL}api/assignments`, exerciseData);
        }
        if (res.data.success === false) {
          await Swal.fire('Error', res.data.message, 'error');
          return;
        }
        await fetchExercises();
        setOpenModal(false);
        resetForm();
        Swal.fire('Success', `Exercise ${editMode ? 'updated' : 'created'} successfully!`, 'success');
      } catch (error) {
        console.error('Error saving exercise:', error);
        Swal.fire('Error', 'Failed to save exercise', 'error');
      } finally {
        setSubmitting(false);
      }
    }
  });

  // ReactQuill modules configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ color: [] }, { background: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ align: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['link', 'image', 'video'],
      ['code-block'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  };

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'color',
    'background',
    'script',
    'align',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'video',
    'code-block'
  ];

  const fetchExercises = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/courses/${courseId}/assignments`);
      const exercisesData = Array.isArray(response.data.data) ? response.data.data : [];
      setExercises(exercisesData);
    } catch (err) {
      console.error('Error fetching exercises:', err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const selectedExercise = Array.isArray(exercises) ? exercises.find((ex) => ex.id === selectedExerciseId) : null;

  const handleAddExercise = () => {
    setOpenModal(true);
    setEditMode(false);
    formik.resetForm();
    formik.setValues({
      title: '',
      description: '',
      status: 'pending',
      duedate: null,
      priority: 'medium'
    });
  };

  const handleEditExercise = (exercise) => {
    setOpenModal(true);
    setEditMode(true);
    formik.setValues({
      id: exercise.id,
      title: exercise.title,
      description: exercise.description,
      status: exercise.status,
      duedate: exercise.duedate ? new Date(exercise.duedate) : null,
      priority: exercise.priority
    });
  };

  const handleDeleteExercise = useCallback(
    async (exerciseId) => {
      try {
        const result = await Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
          const res = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/assignments/${exerciseId}/archive`);
          if (res.data.success === true) {
            await fetchExercises();
            Swal.fire('Success!', 'Exercise deleted successfully!', 'success');
          } else {
            Swal.fire('Error!', res.data.message, 'error');
          }

          if (selectedExerciseId === exerciseId) {
            setSelectedExerciseId(exercises.length > 1 ? exercises[0].id : null);
          }
        }
      } catch (error) {
        console.error('Error deleting exercise:', error);
        Swal.fire('Error!', 'Failed to delete exercise', 'error');
      }
    },
    [exercises, selectedExerciseId, fetchExercises]
  );

  const handleCommentChange = (event) => {
    setError({ comment: '', general: '' });
    setCurrentComment(event.target.value);
  };

  const handleAddSubmission = useCallback(async () => {
    setError({ comment: '', general: '' });
    if (isSubmitting || !selectedExerciseId || !currentComment?.trim()) {
      // Return early if no exercise selected or comment is empty or only spaces
      if (!selectedExerciseId) {
        setError({ general: 'Please select an exercise first' });
        return;
      }

      if (!currentComment?.trim()) {
        setError({ comment: 'Comment is required' });
        return;
      }
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('assignment', selectedExerciseId);
      formData.append('registration_id', regId);
      formData.append('text', currentComment.trim()); // optionally send trimmed comment

      if (currentFile) {
        formData.append('file', currentFile);
      }

      await axiosInstance.post(`${APP_PATH_BASE_URL}api/submissions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('serviceToken')}`
        }
      });
      await fetchExercises();
      setCurrentComment('');
      setCurrentFile(null);
    } catch (error) {
      console.error('Error adding submission:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedExerciseId, regId, currentComment, currentFile, isSubmitting, fetchExercises]);

  const handleAddReply = useCallback(
    async (submissionId, replyText) => {
      if (!selectedExerciseId || !replyText) return;

      try {
        const replyData = {
          text: replyText,
          employee_id: userId
        };

        await axiosInstance.post(`${APP_PATH_BASE_URL}api/replies/${submissionId}`, replyData);
        await fetchExercises();
        setReplyTexts((prev) => ({ ...prev, [submissionId]: '' }));
      } catch (error) {
        console.error('Error adding reply:', error);
      }
    },
    [selectedExerciseId, userId, fetchExercises]
  );

  const handleReplyTextChange = (submissionId, text) => {
    setReplyTexts((prev) => ({ ...prev, [submissionId]: text }));
  };

  const handleFileChange = (e) => {
    setCurrentFile(e.target.files[0]);
  };

  const handleDescriptionChange = (value) => {
    formik.setFieldValue('description', value);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          zIndex: 1,
          gap: 2
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6">Loading exercises...</Typography>
      </Box>
    );
  }

  const sortedSubmissions =
    selectedExercise?.submissions?.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    }) || [];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={3} sx={{ p: 3 }}>
        {/* Exercises List */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Exercises</Typography>
              {(userRole === 'admin' || userRole === 'super_admin') && canCreate && (
                <Button variant="contained" onClick={handleAddExercise} startIcon={<Add />} size="small">
                  New
                </Button>
              )}
            </Box>

            <List
              dense
              sx={{
                maxHeight: '500px',
                overflowY: 'hidden',
                '&:hover': {
                  overflowY: 'auto'
                },
                '&::-webkit-scrollbar': {
                  width: '5px'
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent'
                },
                '&:hover::-webkit-scrollbar-track': {
                  background: '#f1f1f1'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'transparent',
                  borderRadius: '4px'
                },
                '&:hover::-webkit-scrollbar-thumb': {
                  background: '#888'
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#555'
                },
                pr: 1,
                transition: 'overflow 0.2s ease'
              }}
            >
              {exercises.map((exercise) => (
                <Paper
                  key={exercise.id}
                  elevation={exercise.id === selectedExerciseId ? 3 : 1}
                  sx={{
                    mb: 2,
                    cursor: 'pointer',
                    backgroundColor: exercise.id === selectedExerciseId ? '#e3f2fd' : 'inherit',
                    '&:hover': { backgroundColor: '#f5f5f5' },
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    minHeight: 120
                  }}
                  onClick={() => setSelectedExerciseId(exercise.id)}
                >
                  {(userRole === 'admin' || userRole === 'super_admin') && canUpdate && (
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditExercise(exercise);
                      }}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        '&:hover': { color: 'primary.main' },
                        zIndex: 1
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  )}

                  {(userRole === 'admin' || userRole === 'super_admin') && canDelete && (
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteExercise(exercise.id);
                      }}
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        '&:hover': { color: 'error.main' },
                        zIndex: 1
                      }}
                    >
                      <Trash fontSize="small" color="red" />
                    </IconButton>
                  )}

                  <ListItem sx={{ py: 1.5, pr: 6 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {exercise.title}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          {exercise.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mb: 1.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              <div dangerouslySetInnerHTML={{ __html: exercise.description }} />
                            </Typography>
                          )}

                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mr: 1.5 }}>
                              <Box component="span" sx={{ fontWeight: 500 }}>
                                <Chip
                                  label={`${exercise.submissions?.length} submission`}
                                  size="small"
                                  color="success"
                                  variant="contained"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              </Box>{' '}
                            </Typography>
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Exercise Details */}
        <Grid item xs={12} md={8}>
          {selectedExercise ? (
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 3,
                  maxWidth: '1200px',
                  margin: '0 auto',
                  alignItems: 'flex-start'
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    maxWidth: '100%'
                  }}
                >
                  <Typography variant="h5" gutterBottom>
                    {selectedExercise.title}
                  </Typography>
                  <Box
                    dangerouslySetInnerHTML={{ __html: selectedExercise.description }}
                    sx={{
                      '& p': { marginBottom: '1em' },
                      '& h1, & h2, & h3': { marginTop: '1em', marginBottom: '0.5em' },
                      maxHeight: '400px',
                      overflowY: 'auto',
                      pr: 2
                    }}
                  />
                </Box>
              </Box>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                Submissions
              </Typography>

              {selectedExercise.submissions?.length > 0 ? (
                <List
                  dense
                  sx={{
                    maxHeight: '400px',
                    overflowY: 'hidden',
                    '&:hover': {
                      overflowY: 'auto'
                    },
                    '&::-webkit-scrollbar': {
                      width: '5px'
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent'
                    },
                    '&:hover::-webkit-scrollbar-track': {
                      background: '#f1f1f1'
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'transparent',
                      borderRadius: '4px'
                    },
                    '&:hover::-webkit-scrollbar-thumb': {
                      background: '#888'
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      background: '#555'
                    },
                    pr: 1,
                    transition: 'overflow 0.2s ease'
                  }}
                >
                  {sortedSubmissions.map((submission) => (
                    <Box key={submission.id} sx={{ mb: 3 }}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>
                            {submission.student ? (
                              submission.student.profile_pic ? (
                                <img src={`${submission.student.profile_pic}`} alt="Profile" className="profile-pic" />
                              ) : (
                                <span style={{ fontSize: '1rem' }}>{submission.student.first_name?.charAt(0) || '?'}</span>
                              )
                            ) : (
                              <span>?</span>
                            )}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={Capitalise(submission.student?.first_name || 'Unknown')}
                          secondary={
                            <>
                              <Typography variant="body2" color="text.primary">
                                {submission.text}
                              </Typography>
                              {submission.file_url && (
                                <Box sx={{ mt: 1 }}>
                                  <Chip
                                    icon={<AttachCircle fontSize="small" />}
                                    label={submission.file_url.split('/').pop()}
                                    variant="outlined"
                                    sx={{ mr: 1, cursor: 'pointer' }}
                                    onClick={() => {
                                      window.open(submission.file_url, '_blank');
                                      const filename = submission.file_url.split('/').pop();
                                      const downloadLink = document.createElement('a');
                                      downloadLink.href = submission.file_url;
                                      downloadLink.download = filename;
                                      document.body.appendChild(downloadLink);
                                      downloadLink.click();
                                      document.body.removeChild(downloadLink);
                                    }}
                                  />
                                </Box>
                              )}
                              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                {formatDateTime(submission.date)}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>

                      {/* Replies */}
                      {submission.replies?.length > 0 && (
                        <List sx={{ pl: 6 }}>
                          {submission.replies.map((reply) => (
                            <ListItem key={reply.id} alignItems="flex-start">
                              <ListItemAvatar>
                                <Avatar>
                                  {reply.trainer ? (
                                    reply.trainer.profile_pic ? (
                                      <img src={`${reply.trainer.profile_pic}`} alt="Profile" className="profile-pic" />
                                    ) : (
                                      <span style={{ fontSize: '1rem' }}>{reply.trainer.full_name?.charAt(0) || '?'}</span>
                                    )
                                  ) : (
                                    <span>?</span>
                                  )}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={reply.trainer?.full_name || 'Unknown'}
                                secondary={
                                  <>
                                    <Typography variant="body2" color="text.primary">
                                      {reply.text}
                                    </Typography>
                                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                      {formatDateTime(reply.date)}
                                    </Typography>
                                  </>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}

                      {/* Reply input field for tutors below each submission */}
                      {userRole === 'tutor' && (
                        <Box sx={{ pl: 6, mt: 2 }}>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            variant="outlined"
                            placeholder="Write your feedback..."
                            value={replyTexts[submission.id] || ''}
                            onChange={(e) => handleReplyTextChange(submission.id, e.target.value)}
                            sx={{ mb: 1 }}
                          />
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Send />}
                            onClick={() => handleAddReply(submission.id, replyTexts[submission.id] || '')}
                            disabled={!replyTexts[submission.id]}
                          >
                            Send Feedback
                          </Button>
                        </Box>
                      )}
                    </Box>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No submissions yet.
                </Typography>
              )}

              {/* Submission input field for students */}
              {userRole === 'student' && (
                <Box sx={{ mt: 4 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    placeholder="Write your submission comments..."
                    value={currentComment}
                    error={Boolean(error.comment)}
                    helperText={error.comment}
                    onChange={(e) => handleCommentChange(e)}
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <input id="file-upload" type="file" onChange={handleFileChange} style={{ display: 'none' }} />
                    <label htmlFor="file-upload">
                      <Button variant="outlined" component="span" startIcon={<AttachCircle />} size="small">
                        Attach File
                      </Button>
                    </label>
                    {currentFile && (
                      <Typography variant="body2" sx={{ ml: 2 }}>
                        {currentFile.name}
                        <IconButton onClick={() => setCurrentFile(null)} size="small" sx={{ ml: 1 }}>
                          <CloseCircle fontSize="small" />
                        </IconButton>
                      </Typography>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    onClick={handleAddSubmission}
                    disabled={isSubmitting || (!currentComment?.trim() && !currentFile)}
                  >
                    Submit
                  </Button>
                </Box>
              )}
            </Paper>
          ) : (
            <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                {exercises.length === 0 ? 'No exercises available' : 'Select an exercise to view details'}
              </Typography>
            </Paper>
          )}
        </Grid>

        {/* Exercise Modal - only for admin */}
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
          <form onSubmit={formik.handleSubmit}>
            <DialogTitle>
              {editMode ? 'Edit Exercise' : 'Create New Exercise'}
              <IconButton onClick={() => setOpenModal(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                <CloseSquare />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers>
              <FormLabel>Title *</FormLabel>
              <TextField
                fullWidth
                placeholder="Title"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
                sx={{ mb: 3 }}
              />
              <FormLabel>Description *</FormLabel>
              <Box sx={{ height: 300, mb: 2 }}>
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={formik.values.description}
                  onChange={handleDescriptionChange}
                  modules={modules}
                  formats={formats}
                  style={{ height: '250px' }}
                />
                {formik.touched.description && formik.errors.description && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {formik.errors.description}
                  </Typography>
                )}
              </Box>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setOpenModal(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={formik.isSubmitting || !formik.isValid}>
                {formik.isSubmitting ? <CircularProgress size={24} /> : editMode ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Grid>
    </LocalizationProvider>
  );
};

ExercisesTab.propTypes = {
  courseId: PropTypes.number.isRequired
};

export default ExercisesTab;
