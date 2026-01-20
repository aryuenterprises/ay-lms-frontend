// EventView.js (with integrated form - show/hide version)
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Container,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  AddCircle,
  Timer,
  CalendarToday,
  People,
  Description,
  Grade,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Close
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import QuestionForm from './questionForm';
import { APP_PATH_BASE_URL } from 'config';
import axiosInstance from 'utils/axios';
import Swal from 'sweetalert2';
import { openSnackbar } from 'store/reducers/snackbar';

const EventView = () => {
  const location = useLocation();
  const EventData = location.state?.eventData || null;
  const { eventId } = location.state || {};

  const [event, setEvent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [viewingQuestion, setViewingQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Formik initial values
  const initialValues = {
    questionTitle: '',
    questionType: 'radio',
    options: ['Yes', 'No'],
    correctAnswer: '',
    mark: 1,
    questionTime: 30
  };

  // Validation schema
  const validationSchema = Yup.object({
    questionTitle: Yup.string().required('Question title is required'),
    questionType: Yup.string().oneOf(['radio', 'checkbox', 'input'], 'Invalid question type'),
    options: Yup.array().when('questionType', {
      is: (questionType) => questionType === 'radio' || questionType === 'checkbox',
      then: (schema) =>
        schema
          .of(Yup.string().required('Option cannot be empty'))
          .min(2, 'At least 2 options are required')
          .test('unique-options', 'Options must be unique', function (options) {
            const validOptions = options.filter((opt) => opt && opt.trim() !== '');
            const uniqueOptions = new Set(validOptions);
            return uniqueOptions.size === validOptions.length;
          }),
      otherwise: (schema) => schema
    }),
    correctAnswer: Yup.string().when('questionType', {
      is: (questionType) => questionType === 'radio' || questionType === 'checkbox',
      then: (schema) => schema.required('Correct answer is required'),
      otherwise: (schema) => schema
    }),
    mark: Yup.number().min(0.5, 'Minimum mark is 0.5').max(10, 'Maximum mark is 10').required('Mark is required'),
    questionTime: Yup.number().min(10, 'Minimum time is 10 seconds').max(90, 'Maximum time is 90 seconds').required('Time is required')
  });

  // Formik form
  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      await handleSubmitQuestion(values, resetForm);
    }
  });

  useEffect(() => {
    // Reset form when editing question changes
    if (editingQuestion) {
      formik.setValues({
        questionTitle: editingQuestion.questionTitle || editingQuestion.text || '',
        questionType: editingQuestion.question_type === 'poll' ? 'checkbox' : 'radio',
        options: editingQuestion.options || editingQuestion.config?.choices || ['Yes', 'No'],
        correctAnswer: editingQuestion.correctAnswer || editingQuestion.config?.correct || '',
        mark: editingQuestion.mark || editingQuestion.points || 1,
        questionTime: editingQuestion.questionTime || editingQuestion.timeLimit || 30
      });
      setShowAddForm(true);
    }
  }, [editingQuestion]);

  useEffect(() => {
    const fetchEventAndQuestions = async () => {
      try {
        setLoading(true);
        setLoadingQuestions(true);

        // Fetch event details
        setEvent(EventData);

        // Fetch questions for this event
        const questionsResponse = await axiosInstance.get(`${APP_PATH_BASE_URL}api/live-quiz/questions/`, {
          params: {
            room: eventId
          }
        });
        setQuestions(questionsResponse.data.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load event data');
      } finally {
        setLoading(false);
        setLoadingQuestions(false);
      }
    };

    if (eventId) {
      fetchEventAndQuestions();
    }
  }, [eventId, EventData]);

  const handleSubmitQuestion = async (questionData, resetForm) => {
    try {
      setFormLoading(true);
      setError('');

      // Determine the next order number
      const nextOrder = questions.length > 0 ? Math.max(...questions.map((q) => q.order || 0)) + 1 : 1;

      // Map question type from form to API format
      const mapQuestionType = (formType) => {
        switch (formType) {
          case 'radio':
            return 'mcq';
          case 'checkbox':
            return 'poll';
          case 'input':
            return 'text';
          default:
            return formType;
        }
      };

      // Prepare base data
      const baseData = {
        room: eventId,
        order: nextOrder,
        question_type: mapQuestionType(questionData.questionType),
        text: questionData.questionTitle,
        timer_seconds: questionData.questionTime,
        mark: questionData.mark
      };

      // Prepare config based on question type
      let config = {};

      if (questionData.questionType === 'radio' || questionData.questionType === 'checkbox') {
        config = {
          choices: questionData.options.filter((opt) => opt && opt.trim() !== ''),
          correct: questionData.correctAnswer
        };
      } else if (questionData.questionType === 'input') {
        config = {
          correct: questionData.correctAnswer || ''
        };
      }

      // Create the final formatted data
      const formattedData = {
        ...baseData,
        config
      };

      let response;
      if (editingQuestion) {
        // Update existing question
        formattedData.order = editingQuestion.order || nextOrder - 1;
        response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/live-quiz/questions/${editingQuestion.id}/`, formattedData);

        const updatedQuestion = response.data.data;
        const updatedQuestions = questions.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q));
        setQuestions(updatedQuestions);
        setEditingQuestion(null);
        setShowAddForm(false);
      } else {
        // Add new question
        response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/live-quiz/questions/`, formattedData);

        const newQuestion = response.data.data;
        setQuestions([...questions, newQuestion]);
        setShowAddForm(false);
      }

      resetForm();
    } catch (err) {
      console.error('Error saving question:', err);
      setError(err.response?.data?.message || err.response?.data?.error || `Failed to ${editingQuestion ? 'update' : 'add'} question`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      setLoadingQuestions(true);
      Swal.fire({
        title: 'Delete Question',
        text: 'Are you sure you want to delete this question?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          const res = await axiosInstance.delete(`${APP_PATH_BASE_URL}api/live-quiz/questions/${questionId}/`);
          if (res.data.success) {
            Swal.fire('Deleted!', 'The question has been deleted.', 'success');

            const updatedQuestions = questions.filter((q) => q.id !== questionId);
            setQuestions(updatedQuestions);
            setError('');
          } else {
            Swal.fire('Error!', res.data.message, 'error');
          }
        }
      });
    } catch (err) {
      console.error('Error deleting question:', err);
      setError(err.response?.data?.message || 'Failed to delete question');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
  };

  const handleViewQuestion = (question) => {
    setViewingQuestion(question);
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingQuestion(null);
    formik.resetForm();
  };

  const handleAddQuestion = () => {
    formik.resetForm();
    setEditingQuestion(null);
    setShowAddForm(true);
  };

  const handleStartQuestion = (question) => {
    // Logic to start the question (e.g., navigate to a live view or trigger start action)
    console.log('Starting question:', question);
    const socketUrl = `wss://aylms.aryuprojects.com/ws/live-quiz/room/${question.room}/`;
    ws.current = new WebSocket(socketUrl);
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'question_started' && data.question_id === question.id) {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Question started',
            variant: 'success',
            alert: {
              color: 'success'
            },
            close: false
          })
        );
      }
    };
    ws.current.onerror = () => {
      // setWsConnected(false);
      dispatch(
        openSnackbar({
          open: true,
          message: 'WebSocket connection error',
          variant: 'error',
          alert: {
            color: 'error'
          },
          close: false
        })
      );
    };
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!event) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Event not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Event Details Section */}
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  {event.eventName}
                </Typography>
              </Stack>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday color="primary" />
                  <Typography variant="h6">Event Date: {formatDate(event.eventDate)}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <People color="primary" />
                  <Typography variant="h6">Participants: {event.eventParticipantsCount}</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Description color="primary" />
                <Typography variant="h6">Description:</Typography>
              </Box>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: 'grey.50',
                  maxHeight: 150,
                  overflow: 'auto'
                }}
              >
                <Typography variant="body1">{event.eventDescription}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Questions Section */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="bold">
              Event Questions ({questions.length})
            </Typography>

            {!showAddForm && !editingQuestion && (
              <Button variant="contained" startIcon={<AddCircle />} onClick={handleAddQuestion} disabled={loadingQuestions}>
                Add Question
              </Button>
            )}
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* Add/Edit Question Form */}
          {(showAddForm || editingQuestion) && (
            <Box sx={{ mb: 4 }}>
              <QuestionForm formik={formik} onCancel={handleCancelForm} loading={formLoading} isEditing={!!editingQuestion} />
            </Box>
          )}

          {!showAddForm && !editingQuestion && !viewingQuestion && (
            <>
              {/* Loading State for Questions */}
              {loadingQuestions ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '200px',
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 1,
                    bgcolor: 'white'
                  }}
                >
                  <CircularProgress size={40} sx={{ color: 'grey.700' }} />
                </Box>
              ) : (
                <>
                  {/* Empty State */}
                  {questions.length === 0 ? (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 6,
                        textAlign: 'center',
                        border: '2px dashed',
                        borderColor: 'grey.300',
                        bgcolor: 'white',
                        borderRadius: 2
                      }}
                    >
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                          fontWeight: 500,
                          color: 'grey.800',
                          mb: 2
                        }}
                      >
                        No questions yet
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'grey.600',
                          maxWidth: '400px',
                          mx: 'auto',
                          lineHeight: 1.6
                        }}
                      >
                        Start building your assessment by adding the first question
                      </Typography>
                    </Paper>
                  ) : (
                    <Box sx={{ width: '100%' }}>
                      {/* Questions Counter */}
                      <Box
                        sx={{
                          mb: 3,
                          pb: 2,
                          borderBottom: '1px solid',
                          borderColor: 'grey.300'
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            color: 'grey.800'
                          }}
                        >
                          {questions.length} Question{questions.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>

                      {/* Question Grid */}
                      <Grid container spacing={3}>
                        {questions.map((question, index) => (
                          <Grid
                            item
                            xs={12} // 1 column on extra small screens
                            sm={6} // 2 columns on small and above screens
                            key={question.id}
                          >
                            <Paper
                              elevation={0}
                              sx={{
                                p: 0,
                                height: '100%',
                                border: '1px solid',
                                borderColor: 'grey.300',
                                borderRadius: 2,
                                bgcolor: 'white',
                                overflow: 'hidden',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  borderColor: 'grey.400',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                }
                              }}
                            >
                              <Box sx={{ p: 3, height: '100%' }}>
                                <Stack direction="column" justifyContent="space-between" sx={{ height: '100%' }}>
                                  {/* Question Content */}
                                  <Box>
                                    {/* Question Header */}
                                    <Stack
                                      direction="row"
                                      alignItems="flex-start"
                                      justifyContent="space-between"
                                      spacing={1.5}
                                      sx={{ mb: 2 }}
                                    >
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            fontWeight: 600,
                                            color: 'grey.800',
                                            minWidth: '22px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '4px',
                                            bgcolor: 'grey.100',
                                            border: '1px solid',
                                            borderColor: 'grey.300',
                                            flexShrink: 0
                                          }}
                                        >
                                          {index + 1}
                                        </Typography>
                                        <Typography
                                          variant="subtitle1"
                                          sx={{
                                            fontWeight: 500,
                                            color: 'grey.900',
                                            lineHeight: 1.4,
                                            fontSize: { xs: '0.95rem', sm: '1rem' }
                                          }}
                                        >
                                          {question.questionTitle || question.text}
                                        </Typography>
                                      </Box>

                                      <Box sx={{ alignSelf: 'flex-end' }}>
                                        <Button size="small" variant="outlined" color="info" onClick={() => handleStartQuestion(question)}>
                                          Start
                                        </Button>
                                      </Box>
                                    </Stack>

                                    {/* Metadata Chips */}
                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 2 }}>
                                      <Chip
                                        icon={<Timer sx={{ fontSize: 14 }} />}
                                        label={`${question.questionTime || question.timer_seconds || 30}s`}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          borderColor: 'grey.400',
                                          color: 'grey.800',
                                          bgcolor: 'grey.50',
                                          fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                                          height: '28px',
                                          '& .MuiChip-icon': { color: 'grey.600', fontSize: '14px' }
                                        }}
                                      />
                                      <Chip
                                        icon={<Grade sx={{ fontSize: 14 }} />}
                                        label={`${question.mark || question.points || 1}pt`}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          borderColor: 'grey.400',
                                          color: 'grey.800',
                                          bgcolor: 'grey.50',
                                          fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                                          height: '28px',
                                          '& .MuiChip-icon': { color: 'grey.600', fontSize: '14px' }
                                        }}
                                      />
                                      <Chip
                                        label={question.questionType || question.question_type || 'radio'}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          borderColor: 'grey.400',
                                          color: 'grey.800',
                                          bgcolor: 'grey.50',
                                          fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                                          height: '28px',
                                          textTransform: 'capitalize'
                                        }}
                                      />
                                    </Stack>

                                    {/* Question Details */}
                                    <Box
                                      sx={{
                                        bgcolor: 'grey.50',
                                        p: 1.5,
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'grey.200',
                                        mb: 2
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: 'grey.800',
                                          fontWeight: 500,
                                          mb: 0.5,
                                          fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                                        }}
                                      >
                                        Options:
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: 'grey.700',
                                          mb: 1.5,
                                          fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                          display: '-webkit-box',
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: 'vertical',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}
                                      >
                                        {question.config?.choices && Array.isArray(question.config.choices)
                                          ? question.config.choices.join(', ')
                                          : 'No options specified'}
                                      </Typography>

                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: 'grey.800',
                                          fontWeight: 500,
                                          mb: 0.5,
                                          fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                                        }}
                                      >
                                        Correct Answer:
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: 'grey.700',
                                          fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                          display: '-webkit-box',
                                          WebkitLineClamp: 1,
                                          WebkitBoxOrient: 'vertical',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}
                                      >
                                        {question.config?.correct || 'Not specified'}
                                      </Typography>
                                    </Box>
                                  </Box>

                                  {/* Action Buttons */}
                                  <Stack
                                    direction="row"
                                    justifyContent="flex-end"
                                    spacing={1}
                                    sx={{
                                      pt: 2,
                                      borderTop: '1px solid',
                                      borderColor: 'grey.200'
                                    }}
                                  >
                                    <Tooltip title="View Question">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleViewQuestion(question)}
                                        sx={{
                                          color: 'grey.700',
                                          border: '1px solid',
                                          borderColor: 'grey.300',
                                          '&:hover': {
                                            bgcolor: 'grey.100',
                                            borderColor: 'grey.400'
                                          },
                                          width: '36px',
                                          height: '36px'
                                        }}
                                      >
                                        <Visibility fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit Question">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleEditQuestion(question)}
                                        sx={{
                                          color: 'grey.700',
                                          border: '1px solid',
                                          borderColor: 'grey.300',
                                          '&:hover': {
                                            bgcolor: 'grey.100',
                                            borderColor: 'grey.400'
                                          },
                                          width: '36px',
                                          height: '36px'
                                        }}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Question">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleDeleteQuestion(question.id)}
                                        sx={{
                                          color: 'grey.700',
                                          border: '1px solid',
                                          borderColor: 'grey.300',
                                          '&:hover': {
                                            bgcolor: 'grey.100',
                                            borderColor: 'grey.400'
                                          },
                                          width: '36px',
                                          height: '36px'
                                        }}
                                      >
                                        <Delete fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                </Stack>
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </>
              )}
            </>
          )}

          {/* View Question Modal */}
          {viewingQuestion && (
            <Paper
              elevation={2}
              sx={{
                mt: 3,
                border: '2px solid',
                borderColor: 'grey.800',
                bgcolor: 'white',
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  borderBottom: '1px solid',
                  borderColor: 'grey.300',
                  bgcolor: 'grey.50'
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: 'grey.900'
                    }}
                  >
                    Question Preview
                  </Typography>
                  <IconButton
                    onClick={() => setViewingQuestion(null)}
                    size="small"
                    sx={{
                      color: 'grey.700',
                      border: '1px solid',
                      borderColor: 'grey.300',
                      '&:hover': {
                        bgcolor: 'grey.100',
                        borderColor: 'grey.400'
                      }
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>

              {/* Content */}
              <Box sx={{ p: 3 }}>
                {/* Question Title */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: 'grey.600',
                      mb: 1,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Question
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 500,
                      color: 'grey.900',
                      lineHeight: 1.5
                    }}
                  >
                    {viewingQuestion.questionTitle || viewingQuestion.text}
                  </Typography>
                </Box>

                {/* Metadata */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: 'grey.600',
                      mb: 1.5,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Details
                  </Typography>
                  <Stack direction="row" spacing={1.5} flexWrap="wrap">
                    <Chip
                      icon={<Timer sx={{ fontSize: 16 }} />}
                      label={`${viewingQuestion.questionTime || viewingQuestion.timeLimit || 30} seconds`}
                      variant="outlined"
                      sx={{
                        borderColor: 'grey.400',
                        color: 'grey.800',
                        bgcolor: 'white',
                        fontWeight: 500,
                        '& .MuiChip-icon': { color: 'grey.600' }
                      }}
                    />
                    <Chip
                      icon={<Grade sx={{ fontSize: 16 }} />}
                      label={`${viewingQuestion.mark || viewingQuestion.points || 1} point${
                        (viewingQuestion.mark || viewingQuestion.points || 1) !== 1 ? 's' : ''
                      }`}
                      variant="outlined"
                      sx={{
                        borderColor: 'grey.400',
                        color: 'grey.800',
                        bgcolor: 'white',
                        fontWeight: 500,
                        '& .MuiChip-icon': { color: 'grey.600' }
                      }}
                    />
                    <Chip
                      label={viewingQuestion.questionType || viewingQuestion.question_type || 'radio'}
                      variant="outlined"
                      sx={{
                        borderColor: 'grey.400',
                        color: 'grey.800',
                        bgcolor: 'white',
                        fontWeight: 500,
                        textTransform: 'capitalize'
                      }}
                    />
                  </Stack>
                </Box>

                {/* Options Section */}
                {viewingQuestion.config?.choices && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: 'grey.600',
                        mb: 2,
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Options
                    </Typography>

                    {Array.isArray(viewingQuestion.config?.choices) && viewingQuestion.config.choices.length > 0 ? (
                      <Grid container spacing={2}>
                        {viewingQuestion.config.choices.map((option, idx) => (
                          <Grid item xs={12} sm={6} key={idx}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2.5,
                                border: '2px solid',
                                borderColor: option === viewingQuestion.config.correct ? 'grey.900' : 'grey.200',
                                bgcolor: option === viewingQuestion.config.correct ? 'grey.50' : 'white',
                                borderRadius: 1.5,
                                position: 'relative'
                              }}
                            >
                              <Stack direction="row" alignItems="center" spacing={2}>
                                {/* Option Indicator */}
                                <Box
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '4px',
                                    bgcolor: option === viewingQuestion.config.correct ? 'grey.900' : 'grey.100',
                                    border: '1px solid',
                                    borderColor: option === viewingQuestion.config.correct ? 'grey.900' : 'grey.300',
                                    flexShrink: 0
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      color: option === viewingQuestion.config.correct ? 'white' : 'grey.800'
                                    }}
                                  >
                                    {String.fromCharCode(65 + idx)} {/* A, B, C, D */}
                                  </Typography>
                                </Box>

                                {/* Option Text */}
                                <Typography
                                  variant="body1"
                                  sx={{
                                    color: option === viewingQuestion.config.correct ? 'grey.900' : 'grey.700',
                                    fontWeight: option === viewingQuestion.config.correct ? 500 : 400
                                  }}
                                >
                                  {option}
                                </Typography>
                              </Stack>

                              {/* Correct Answer Badge */}
                              {option === viewingQuestion.config.correct && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: -10,
                                    right: 10,
                                    bgcolor: 'grey.900',
                                    color: 'white',
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.5px'
                                  }}
                                >
                                  Correct
                                </Box>
                              )}
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          border: '1px dashed',
                          borderColor: 'grey.300',
                          bgcolor: 'grey.50',
                          textAlign: 'center'
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'grey.600',
                            fontStyle: 'italic'
                          }}
                        >
                          No options specified
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                )}

                {/* Correct Answer Summary */}
                {viewingQuestion.config?.correct && (
                  <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'grey.200' }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <CheckCircle sx={{ color: 'grey.800', fontSize: 20 }} />
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: 'grey.600',
                            mb: 0.5,
                            fontWeight: 500
                          }}
                        >
                          Correct Answer
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'grey.900',
                            fontWeight: 500
                          }}
                        >
                          {viewingQuestion.config.correct}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}
              </Box>
            </Paper>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default EventView;
