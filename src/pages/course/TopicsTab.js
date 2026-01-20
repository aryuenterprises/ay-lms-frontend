import {
  Grid,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  FormLabel,
  Checkbox,
  Tooltip,
  Rating,
  Collapse
} from '@mui/material';
import { DocumentUpload, Edit, Add, Trash } from 'iconsax-react';
import { useState, useEffect, useCallback } from 'react';
import { EditorState, ContentState } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import htmlToDraft from 'html-to-draftjs';
import 'draft-js/dist/Draft.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { Modal, Stack, TextField } from '@mui/material';
import ReactDraft from './CourseReactDraft';
import axiosInstance from 'utils/axios';
import { APP_PATH_BASE_URL } from 'config';
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { usePermission } from 'hooks/usePermission';

// Validation schema
const topicValidationSchema = Yup.object({
  title: Yup.string()
    .required('Title is required')
    .max(100, 'Title must not exceed 100 characters')
    .test('no-spaces-only', 'Title cannot be only spaces', (value) => {
      return value && value.trim().length > 0;
    }),
  description: Yup.string()
    .required('Content is required')
    .test('valid-content', 'Please add meaningful content', (value) => {
      if (!value) return false;

      // Remove HTML tags and decode HTML entities
      const textContent = value
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Convert non-breaking spaces to regular spaces
        .replace(/&\w+;/g, ' ') // Remove other HTML entities
        .trim();

      return textContent.length > 0;
    })
});

const TopicsTab = ({ courseId }) => {
  const { checkPermission } = usePermission();

  const canCreate = checkPermission('Course', 'create');
  const canUpdate = checkPermission('Course', 'update');
  const canDelete = checkPermission('Course', 'delete');

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTopicId, setExpandedTopicId] = useState(null);
  const [completedTopics, setCompletedTopics] = useState(null);
  const auth = JSON.parse(localStorage.getItem('auth'));

  const userType = auth?.loginType;
  const userId = auth?.id;
  const regId = auth?.user?.student_id;

  // Formik initialization
  const formik = useFormik({
    initialValues: {
      id: null,
      title: '',
      description: ''
    },
    validationSchema: topicValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const topicData = {
          title: values.title,
          description: values.description,
          created_by: userId,
          status: false
        };

        if (isEditing && values.id) {
          await axiosInstance.put(`${APP_PATH_BASE_URL}/api/courses/${courseId}/topic/${values.id}`, topicData);
        } else {
          await axiosInstance.post(`${APP_PATH_BASE_URL}/api/courses/${courseId}/topic`, topicData);
        }

        await fetchTopics();
        setOpenModal(false);
        setIsEditing(false);
        resetForm();
        setEditorState(EditorState.createEmpty());
      } catch (error) {
        console.error('Error saving topic:', error);
        setError(error.message);
        Swal.fire({
          title: 'Error!',
          text: error.message || 'Error saving topic',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        setSubmitting(false);
      }
    }
  });

  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true);
      if (userType === 'student') {
        const res = await axiosInstance.get(`${APP_PATH_BASE_URL}/api/courses/${courseId}/topic/${regId}/status`);
        if (res.data.success) {
          if (Array.isArray(res.data.all_topics)) {
            setTopics(res.data.all_topics);
            setCompletedTopics(res.data.completed_topics);
          } else {
            throw new Error('Invalid response format - expected array of topics');
          }
        }
      } else {
        const response = await axiosInstance.get(`${APP_PATH_BASE_URL}/api/courses/${courseId}/topic`);
        if (response.data.success) {
          if (Array.isArray(response.data.data)) {
            setTopics(response.data.data);
          } else {
            throw new Error('Invalid response format - expected array of topics');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [courseId, regId, userType]);

  useEffect(() => {
    if (courseId) {
      fetchTopics();
    }
  }, [courseId, fetchTopics]);

  const handleDeleteTopic = async (topicId) => {
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
      try {
        const topicData = {
          is_archived: true
        };

        const response = await axiosInstance.patch(`${APP_PATH_BASE_URL}/api/courses/${courseId}/topic/${topicId}`, topicData);

        if (response.data.success === true) {
          Swal.fire({
            title: 'Success!',
            text: 'Topic deleted successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          await fetchTopics();
        } else {
          Swal.fire({
            title: 'Error!',
            text: response?.data?.message || 'Error deleting Topic.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      } catch (error) {
        setError(error.message);
        Swal.fire({
          title: 'Error!',
          text: error.message || 'Error Topic.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const handleCheckBoxChange = async (topicId) => {
    const firstConfirmation = await Swal.fire({
      title: 'Have you completed this topic?',
      text: "Please confirm by checking this box only if you've fully understood and completed all the material.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, I have completed it!',
      cancelButtonText: 'No, not yet',
      focusConfirm: true
    });

    if (firstConfirmation.isConfirmed) {
      const { value: rating } = await Swal.fire({
        title: 'Rate this topic',
        input: 'select',
        inputOptions: {
          1: '⭐',
          2: '⭐⭐',
          3: '⭐⭐⭐',
          4: '⭐⭐⭐⭐',
          5: '⭐⭐⭐⭐⭐'
        },
        inputLabel: 'How would you rate this topic? (1-5 stars)',
        inputPlaceholder: 'Select a rating',
        showCancelButton: true,
        confirmButtonText: 'Next',
        cancelButtonText: 'Cancel',
        inputValidator: (value) => {
          if (!value) {
            return 'You need to select a rating!';
          }
          return null;
        }
      });

      if (rating === undefined) return;

      const { value: notesText } = await Swal.fire({
        title: 'Please provide your feedback',
        input: 'textarea',
        inputLabel: 'Notes/Feedback (required)',
        inputPlaceholder: 'Enter your notes or feedback about this topic...',
        inputAttributes: {
          'aria-label': 'Type your notes here'
        },
        showCancelButton: true,
        confirmButtonText: 'Submit',
        cancelButtonText: 'Cancel',
        inputValidator: (value) => {
          if (!value || value.trim() === '') {
            return 'You must enter feedback to submit!';
          }
          return null;
        }
      });

      if (notesText !== undefined) {
        try {
          const topicData = {
            status: true,
            student: regId,
            notes: notesText || '',
            topic: topicId,
            ratings: parseInt(rating)
          };

          const response = await axiosInstance.post(`${APP_PATH_BASE_URL}/api/courses/${courseId}/topic/${regId}/status`, topicData);

          if (response.data.success === true) {
            await Swal.fire({
              title: 'Success!',
              text: 'Thank you for your feedback!',
              icon: 'success',
              confirmButtonText: 'OK'
            });
            await fetchTopics();
          } else {
            Swal.fire({
              title: 'Error!',
              text: response?.data?.message || 'Error checking Topic.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        } catch (error) {
          setError(error.message);
          Swal.fire({
            title: 'Error!',
            text: error.message || 'Error updating Topic.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      }
    }
  };

  const handleEdit = (topicToEdit) => {
    try {
      let newEditorState;
      let contentState;

      if (topicToEdit.description) {
        const cleanedHtml = topicToEdit.description
          .replace(/<figure[^>]*>/g, '<div>')
          .replace(/<\/figure>/g, '</div>')
          .replace(/<img[^>]*>/g, '');

        const contentBlock = htmlToDraft(cleanedHtml);

        if (contentBlock) {
          contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
          newEditorState = EditorState.createWithContent(contentState);
        } else {
          newEditorState = EditorState.createEmpty();
        }
      } else {
        newEditorState = EditorState.createEmpty();
      }

      setEditorState(newEditorState);
      formik.setValues({
        id: topicToEdit.topic_id,
        title: topicToEdit.title || '',
        description: topicToEdit.description || ''
      });
      setIsEditing(true);
      setOpenModal(true);
    } catch (error) {
      console.error('Error setting editor content:', error);
      setEditorState(EditorState.createEmpty());
      formik.setValues({
        id: topicToEdit.topic_id,
        title: topicToEdit.title || '',
        description: ''
      });
      setIsEditing(true);
      setOpenModal(true);
    }
  };

  const handleAddNew = () => {
    setEditorState(EditorState.createEmpty());
    formik.resetForm();
    setIsEditing(false);
    setOpenModal(true);
  };

  const handleEditorChange = (newEditorState) => {
    setEditorState(newEditorState);
    const contentState = newEditorState.getCurrentContent();
    const htmlContent = stateToHTML(contentState);
    formik.setFieldValue('description', htmlContent);
    formik.setFieldTouched('description', true);
  };

  const toggleTopicExpansion = (topicId) => {
    setExpandedTopicId(expandedTopicId === topicId ? null : topicId);
  };

  const renderTopicCard = (topic, index) => {
    const topicId = topic.topic_id || topic.course;
    if (!topicId) return null;
    const isExpanded = expandedTopicId === topic.topic_id;

    const Topic = completedTopics?.find((ct) => ct.topic === topicId);
    const ratingValue = Topic ? Topic.ratings : null;

    return (
      <Card
        key={topic.topic_id}
        sx={{
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
            borderColor: 'secondary.light'
          },
          ml: 2
        }}
      >
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h5" fontSize={14}>{`Title ${index + 1}: ${topic.title}`}</Typography>
              {userType === 'student' && (
                <Checkbox
                  size="small"
                  checked={topic.is_completed === true}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (topic.is_completed !== true) {
                      handleCheckBoxChange(topic.topic_id);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </Box>
          }
          onClick={() => toggleTopicExpansion(topic.topic_id)}
          sx={{ cursor: 'pointer' }}
          action={
            userType === 'admin' || userType === 'super_admin' ? (
              <>
                {canUpdate && (
                  <Tooltip title="Edit">
                    <IconButton
                      aria-label="edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(topic);
                      }}
                    >
                      <Edit size={20} />
                    </IconButton>
                  </Tooltip>
                )}
                {canDelete && (
                  <Tooltip title="Delete">
                    <IconButton
                      color="error"
                      aria-label="delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTopic(topic.topic_id);
                      }}
                    >
                      <Trash size={20} />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            ) : (
              userType === 'student' && (
                <>
                  <Box sx={{ mt: 1.5 }}>
                    <Rating name="read-only" value={ratingValue || 0} readOnly />
                  </Box>
                </>
              )
            )
          }
        />
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Box
              sx={{
                '& h1, & h2, & h3': { margin: '1em 0' },
                '& p': { margin: '0 0 1em 0' },
                '& ul, & ol': { margin: '0 0 1em 1em', paddingLeft: '2em' }
              }}
              dangerouslySetInnerHTML={{ __html: topic.description }}
            />
          </CardContent>
        </Collapse>
      </Card>
    );
  };

  if (loading) {
    return (
      <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '50vh' }}>
        <Grid item>
          <Typography>Loading topics...</Typography>
        </Grid>
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid container justifyContent="center" alignItems="center">
        <Grid item>
          <Typography color="error">Error: {error}</Typography>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container sx={{ minHeight: '50vh' }}>
      <Grid item xs={12} padding={3}>
        {topics.length > 0 ? (
          <Grid container spacing={3}>
            {(userType === 'admin' || userType === 'super_admin') && canCreate && (
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" onClick={handleAddNew} startIcon={<Add size={20} />} sx={{ mt: 2 }}>
                  Add New Topic
                </Button>
              </Grid>
            )}
            {topics.map((topicItem, index) => (
              <Grid item xs={6} key={topicItem.topic_id}>
                {renderTopicCard(topicItem, index)}
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '300px',
              border: '1px dashed #ddd',
              borderRadius: 2,
              p: 4,
              textAlign: 'center'
            }}
          >
            <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
              No topics available
            </Typography>
            {userType === 'admin' && (
              <Button variant="contained" onClick={handleAddNew} startIcon={<DocumentUpload size={20} />}>
                Add First Topic
              </Button>
            )}
          </Box>
        )}
      </Grid>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: '800px',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}
          component="form"
          onSubmit={formik.handleSubmit}
        >
          <Typography variant="h5" gutterBottom>
            {isEditing ? 'Edit Topic' : 'Add New Topic'}
          </Typography>

          <FormLabel>Title</FormLabel>
          <TextField
            name="title"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
            fullWidth
            sx={{ mb: 3, mt: 1 }}
            placeholder="Enter topic title"
          />

          <Box
            sx={{
              flexGrow: 1,
              mb: 3,
              minHeight: '300px',
              overflow: 'auto'
            }}
          >
            <ReactDraft
              editorState={editorState}
              onEditorStateChange={handleEditorChange}
              toolbar={{
                options: ['inline', 'blockType', 'list', 'textAlign', 'link', 'emoji', 'image', 'history'],
                inline: {
                  options: ['bold', 'italic', 'underline', 'strikethrough']
                },
                blockType: {
                  options: ['Normal', 'H1', 'H2', 'H3', 'Blockquote']
                }
              }}
              editorStyle={{
                padding: '10px',
                border: '1px solid #eee',
                borderRadius: '4px',
                borderColor: formik.touched.description && formik.errors.description ? 'error.main' : '#eee'
              }}
            />
            {formik.touched.description && formik.errors.description && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {formik.errors.description}
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              onClick={() => {
                setOpenModal(false);
                formik.resetForm();
              }}
              sx={{ minWidth: '100px' }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting || !formik.isValid} sx={{ minWidth: '100px' }}>
              {formik.isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Save'}
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Grid>
  );
};

TopicsTab.propTypes = {
  courseId: PropTypes.number.isRequired
};

export default TopicsTab;
