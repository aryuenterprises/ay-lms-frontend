// QuestionFormPage.js
import React, { useEffect, useState } from 'react';
import { Container, Card, CardContent, Typography, Button, Box, Alert, CircularProgress, Paper } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import QuestionForm from './questionForm';
import { APP_PATH_BASE_URL } from 'config';
import axiosInstance from 'utils/axios';

const QuestionFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventId, eventData, questionToEdit } = location.state || {};

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (eventData) {
      setEvent(eventData);
    }
  }, [eventData]);

  // Initial values based on edit mode or add mode
  const initialValues = questionToEdit
    ? {
        questionTitle: questionToEdit.questionTitle || questionToEdit.title || '',
        questionType: questionToEdit.questionType || questionToEdit.type || 'radio',
        options: questionToEdit.options || ['Yes', 'No'],
        correctAnswer: questionToEdit.correctAnswer || '',
        mark: questionToEdit.mark || questionToEdit.points || 1,
        questionTime: questionToEdit.questionTime || questionToEdit.timeLimit || 30
      }
    : {
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
    onSubmit: async (values) => {
      await handleSubmitQuestion(values);
    }
  });

  const handleSubmitQuestion = async (questionData) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Determine the next order number
      const nextOrder = questionToEdit ? questionToEdit.order || 1 : 1;

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

      if (questionToEdit) {
        // Update existing question
        formattedData.order = questionToEdit.order || nextOrder;
        await axiosInstance.put(`${APP_PATH_BASE_URL}api/questions/${questionToEdit.id}`, formattedData);
        setSuccess('Question updated successfully!');
      } else {
        // Add new question
        await axiosInstance.post(`${APP_PATH_BASE_URL}api/live-quiz/questions/`, formattedData);
        setSuccess('Question added successfully!');
      }

      // Navigate back after 2 seconds on success
      setTimeout(() => {
        navigate('/events', { state: { eventId, eventData } });
      }, 2000);
    } catch (err) {
      console.error('Error saving question:', err);
      setError(err.response?.data?.message || err.response?.data?.error || `Failed to ${questionToEdit ? 'update' : 'add'} question`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/events', { state: { eventId, eventData } });
  };

  if (!eventId || !event) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Event not found
        </Typography>
        <Button onClick={() => navigate('/events')} sx={{ mt: 2 }}>
          Back to Events
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Back Button */}
      <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mb: 3 }}>
        Back to Event
      </Button>

      {/* Page Title */}
      <Typography variant="h4" component="h1" gutterBottom>
        {questionToEdit ? 'Edit Question' : 'Add New Question'}
      </Typography>

      {/* Event Info */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Event: {event.eventName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {event.eventDescription}
        </Typography>
      </Paper>

      {/* Success Alert */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Question Form Card */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <QuestionForm formik={formik} onCancel={handleBack} loading={loading} isEditing={!!questionToEdit} />
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default QuestionFormPage;
