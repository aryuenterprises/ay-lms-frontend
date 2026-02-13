import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Radio,
  FormControl,
  FormLabel,
  IconButton,
  Grid,
  MenuItem,
  Select,
  Stack,
  Chip,
  FormHelperText,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MainCard from 'components/MainCard';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from 'utils/axios';
import { APP_PATH_BASE_URL } from 'config';
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';
import { AddCircleOutline, Save } from '@mui/icons-material';
import { Add, Edit } from 'iconsax-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { usePermission } from 'hooks/usePermission';

const AdminAssmentsTab = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const module = location.state?.module;
  const id = module?.test_id;

  const { checkPermission } = usePermission();

  const canCreate = checkPermission('Assessment', 'create');
  const canUpdate = checkPermission('Assessment', 'update');
  const canDelete = checkPermission('Assessment', 'delete');

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('view');
  const [editQuestion, setEditQuestion] = useState(null);
  // console.log('questions :', questions);
  // Validation schemas
  const questionSchema = Yup.object().shape({
    question: Yup.string().required('Question text is required'),
    type: Yup.string().oneOf(['written', 'mcq'], 'Invalid question type').required('Question type is required'),
    marks: Yup.number().min(1, 'Marks must be at least 1').required('Marks are required'),
    options: Yup.array().when('type', {
      is: (val) => val === 'mcq',
      then: () =>
        Yup.array()
          .of(Yup.string().required('Option text is required'))
          .min(2, 'At least 2 options are required')
          .test('unique-options', 'Options must be unique', function (options) {
            if (!options || options.length < 2) return true; // min validation will handle this
            const nonEmptyOptions = options.filter((opt) => opt && opt.trim() !== '');
            const uniqueOptions = new Set(nonEmptyOptions.map((opt) => opt.trim().toLowerCase()));
            return uniqueOptions.size === nonEmptyOptions.length;
          }),
      otherwise: () => Yup.array().notRequired()
    }),
    expected_answer: Yup.string().when('type', {
      is: (val) => val === 'written',
      then: () => Yup.string().required('Expected answer is required for written questions'),
      otherwise: () => Yup.string()
    })
  });

  // Formik hook for question form
  const formik = useFormik({
    initialValues: {
      question: '',
      type: 'written',
      marks: 1,
      options: [],
      expected_answer: ''
    },
    validationSchema: questionSchema,
    onSubmit: async (values) => {
      if (mode === 'add') {
        await handleSaveNewQuestion(values);
      } else if (mode === 'edit') {
        await handleSaveEditedQuestion(values);
      }
    }
  });

  const fetchQuestions = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/test/${id}/questions`);
      if (response.data.success) {
        setQuestions(response.data.questions || []);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching questions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchQuestions();
    } else {
      setQuestions([]);
      setIsLoading(false);
    }
  }, [id, fetchQuestions]);

  const getEmptyQuestion = () => ({
    id: Date.now(),
    question: '',
    type: 'written',
    options: [],
    marks: 1,
    expected_answer: ''
  });

  const handleAddClick = () => {
    const emptyQuestion = getEmptyQuestion();
    setEditQuestion(emptyQuestion);
    formik.setValues(emptyQuestion);
    setMode('add');
  };

  const handleSelectQuestionToEdit = (question) => {
    const questionData = {
      ...question,
      options: question.options || [],
      expected_answer: question.mcq_correct_option || question.written_answer || ''
    };
    setEditQuestion(questionData);
    formik.setValues(questionData);
    setMode('edit');
  };

  const handleTypeChange = (newType) => {
    formik.setFieldValue('type', newType);
    if (newType === 'written') {
      formik.setFieldValue('options', []);
    } else if (newType === 'mcq' && formik.values.options.length === 0) {
      formik.setFieldValue('options', ['', '']);
    }
  };

  const addOption = () => {
    const newOptions = [...formik.values.options, ''];
    formik.setFieldValue('options', newOptions);
  };

  const removeOption = (optionIndex) => {
    if (formik.values.options.length <= 2) return;
    const newOptions = [...formik.values.options];
    newOptions.splice(optionIndex, 1);
    formik.setFieldValue('options', newOptions);
  };

  const handleOptionChange = (optionIndex, value) => {
    const newOptions = [...formik.values.options];
    newOptions[optionIndex] = value;
    formik.setFieldValue('options', newOptions);
  };

  const handleCancel = () => {
    formik.resetForm();
    setEditQuestion(null);
    setMode('view');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSaveNewQuestion = async (values) => {
    try {
      if (values.type === 'mcq') {
        // Check for empty options
        const emptyOptions = values.options.some((opt) => !opt || opt.trim() === '');
        if (emptyOptions) {
          Swal.fire('Error', 'All options must have text', 'error');
          return;
        }

        // Check for duplicate options (case insensitive)
        const nonEmptyOptions = values.options.filter((opt) => opt && opt.trim() !== '');
        const uniqueOptions = new Set(nonEmptyOptions.map((opt) => opt.trim().toLowerCase()));

        if (uniqueOptions.size !== nonEmptyOptions.length) {
          Swal.fire('Error', 'Options must be unique. Please remove duplicate options.', 'error');
          return;
        }
      }

      const response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/test/questions`, [
        {
          test_id: id,
          question: values.question,
          type: values.type,
          options: values.type === 'mcq' ? values.options : [],
          marks: parseInt(values.marks) || 1,
          ...(values.type === 'written' && { written_answer: values.expected_answer }),
          ...(values.type === 'mcq' && { mcq_correct_option: values.expected_answer })
        }
      ]);
      if (response.data.success) {
        Swal.fire('Success', 'Question added successfully', 'success');
        setQuestions((prev) => [...prev, response.data.data[0]]);
        formik.resetForm();
        setMode('view');
      } else {
        Swal.fire('Error', response.data.message, 'error');
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to add question', 'error');
    }
  };

  const handleSaveEditedQuestion = async (values) => {
    try {
      const response = await axiosInstance.put(`${APP_PATH_BASE_URL}api/test/questions/${editQuestion.question_id || editQuestion.id}`, {
        test_id: id,
        question: values.question,
        type: values.type,
        options: values.type === 'mcq' ? values.options : [],
        marks: parseInt(values.marks) || 1,
        ...(values.type === 'written' && { written_answer: values.expected_answer }),
        ...(values.type === 'mcq' && { mcq_correct_option: values.expected_answer })
      });
      if (response.data.success) {
        Swal.fire('Success', 'Question updated successfully', 'success');
        await fetchQuestions();
        formik.resetForm();
        setMode('view');
        setEditQuestion(null);
      } else {
        Swal.fire('Error', response.data.message, 'error');
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to update question', 'error');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the question permanently.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/test/questions/${questionId}/archive`);
        if (response.data.success) {
          Swal.fire('Deleted!', 'Question has been deleted.', 'success');
          setQuestions((prev) => prev.filter((q) => q.question_id !== questionId));
        } else {
          Swal.fire('Error', response.data.message, 'error');
        }
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Failed to delete question', 'error');
      }
    }
  };

  if (isLoading) return <div>Loading questions...</div>;
  if (error)
    return (
      <MainCard sx={{ borderRadius: 2 }}>
        <Box p={3} color="error.main">
          Error: {error}
        </Box>
      </MainCard>
    );

  return (
    <>
      <Grid container spacing={3} sx={{ position: 'absolute', top: 18, left: '50%', zIndex: 1, width: '50%' }}>
        <Grid item xs={12} sx={{ justifyItems: 'flex-end' }}>
          <Stack sx={{ mb: { xs: -0.5, sm: 0.5 } }} spacing={1}>
            <IconButton variant="contained" color="secondary" size="medium" onClick={handleBack} sx={{ width: 100, gap: 1 }}>
              <ArrowBackIcon />
              Back
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
      <MainCard sx={{ p: 3, display: 'flex', flexDirection: 'column', minHeight: '80vh' }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid', borderColor: 'divider' }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700
            }}
          >
            {id ? 'Manage Assessment Questions' : 'Create New Assessment'}
          </Typography>
          {/* Action buttons when in view mode */}
          {mode === 'view' && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
                pb: 2
              }}
            >
              {canCreate && (
                <Button variant="contained" startIcon={<Add />} onClick={handleAddClick} sx={{ borderRadius: 2, px: 3 }}>
                  Add New Question
                </Button>
              )}
            </Box>
          )}
        </Box>
        {/* Question list section */}
        {mode === 'view' && (
          <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 4 }}>
            {questions.length === 0 ? (
              <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Questions Added Yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start by adding your first question using the form below.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3} p={2}>
                {questions.map((question, index) => (
                  <Grid item xs={12} md={6} key={question.question_id}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        position: 'relative',
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.2s ease',
                        background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          borderColor: 'secondary.light',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      {/* Header with question number and actions */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 2,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          pb: 1.5
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip
                            label={`Q${index + 1}`}
                            color="primary"
                            size="small"
                            sx={{
                              fontWeight: 600,
                              borderRadius: 1,
                              mr: 1.5
                            }}
                          />
                          <Chip
                            label={`${question.marks || 5} marks`}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontWeight: 500,
                              color: 'success.dark',
                              borderColor: 'success.light',
                              backgroundColor: 'success.10',
                              borderRadius: 1
                            }}
                          />
                        </Box>

                        <Box>
                          {/* Edit and delete buttons */}
                          {canUpdate && (
                            <Tooltip title="Edit Question">
                              <IconButton
                                aria-label="edit"
                                onClick={() => handleSelectQuestionToEdit(question)}
                                sx={{
                                  color: 'text.secondary',
                                  mr: 0.5,
                                  '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                                }}
                                size="small"
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {canDelete && (
                            <Tooltip title="Delete Question">
                              <IconButton
                                aria-label="delete"
                                onClick={() => handleDeleteQuestion(question.question_id || question.id)}
                                sx={{
                                  color: 'text.secondary',
                                  '&:hover': { backgroundColor: 'error.light', color: 'white' }
                                }}
                                size="small"
                              >
                                <DeleteIcon fontSize="small" color="error" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>

                      {/* Question text */}
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 500,
                          mb: 2,
                          lineHeight: 1.5,
                          color: 'text.primary'
                        }}
                      >
                        {question.question}
                      </Typography>

                      {/* Options for MCQ */}
                      {question.type === 'mcq' && question.options && question.options.length > 0 && (
                        <Box sx={{ mt: 2.5, mb: 1.5 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: 'text.secondary',
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              fontSize: '0.75rem'
                            }}
                          >
                            Options:
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            {question.options.map((option, i) => (
                              <Box
                                key={i}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  py: 0.75,
                                  borderBottom: i < question.options.length - 1 ? '1px dashed' : 'none',
                                  borderColor: 'divider'
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    backgroundColor: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 1.5,
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    fontWeight: 600
                                  }}
                                >
                                  {String.fromCharCode(65 + i)}
                                </Box>
                                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                  {option}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}

                      {/* Expected answer for written questions */}
                      {question.type === 'written' && question.written_answer && (
                        <Box sx={{ mt: 2.5, mb: 1.5 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: 'text.secondary',
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              fontSize: '0.75rem'
                            }}
                          >
                            Correct Answer:
                          </Typography>
                          <Box
                            sx={{
                              mt: 1,
                              p: 1.5,
                              backgroundColor: 'grey.50',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider',
                              position: 'relative'
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontStyle: 'italic',
                                color: 'text.secondary',
                                lineHeight: 1.6
                              }}
                            >
                              {question.written_answer}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {/* Expected answer for written questions */}
                      {question.type === 'mcq' && question.mcq_correct_option && (
                        <Box sx={{ mt: 2.5, mb: 1.5 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: 'text.secondary',
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              fontSize: '0.75rem'
                            }}
                          >
                            Correct Answer:
                          </Typography>
                          <Box
                            sx={{
                              mt: 1,
                              p: 1.5,
                              backgroundColor: 'grey.50',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider',
                              position: 'relative'
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontStyle: 'italic',
                                color: 'text.secondary',
                                lineHeight: 1.6
                              }}
                            >
                              {question.mcq_correct_option}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {/* Footer with question type and difficulty (if available) */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          mt: 2.5,
                          pt: 1.5,
                          borderTop: '1px solid',
                          borderColor: 'secondary.light'
                        }}
                      >
                        <Chip
                          label={question.type === 'mcq' ? 'Multiple Choice' : 'Written Answer'}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            backgroundColor: 'secondary.light',
                            color: 'secondary.dark',
                            borderColor: 'secondary.light'
                          }}
                        />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Add/Edit form */}
        {(mode === 'add' || (mode === 'edit' && editQuestion)) && (
          <Paper elevation={4} sx={{ p: 3.5, mb: 4, mt: 2, borderRadius: 2 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              {mode === 'add' ? (
                <>
                  <AddCircleOutline /> Add New Question
                </>
              ) : (
                <>
                  <Edit /> Edit Question
                </>
              )}
            </Typography>

            <form onSubmit={formik.handleSubmit}>
              <QuestionForm
                formik={formik}
                onTypeChange={handleTypeChange}
                addOption={addOption}
                removeOption={removeOption}
                onOptionChange={handleOptionChange}
              />

              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCancel}
                  sx={{ borderRadius: 2, px: 3 }}
                  disabled={formik.isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  sx={{ borderRadius: 2, px: 3 }}
                  disabled={formik.isSubmitting}
                >
                  {mode === 'add' ? 'Save Question' : 'Update Question'}
                </Button>
              </Box>
            </form>
          </Paper>
        )}
      </MainCard>
    </>
  );
};

// Updated QuestionForm component with Formik integration
const QuestionForm = ({ formik, onTypeChange, addOption, removeOption, onOptionChange }) => {
  return (
    <>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Stack spacing={1.5}>
            <FormLabel>Question Type</FormLabel>
            <FormControl fullWidth error={formik.touched.type && Boolean(formik.errors.type)}>
              <Select
                name="type"
                value={formik.values.type}
                onChange={(e) => {
                  formik.handleChange(e);
                  onTypeChange(e.target.value);
                }}
                onBlur={formik.handleBlur}
              >
                <MenuItem value="written">Written Answer</MenuItem>
                <MenuItem value="mcq">Multiple Choice</MenuItem>
              </Select>
              {formik.touched.type && formik.errors.type && <FormHelperText error>{formik.errors.type}</FormHelperText>}
            </FormControl>
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={1.5}>
            <FormLabel>Marks</FormLabel>
            <TextField
              fullWidth
              name="marks"
              type="number"
              value={formik.values.marks}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.marks && Boolean(formik.errors.marks)}
              helperText={formik.touched.marks && formik.errors.marks}
              inputProps={{ min: 1 }}
            />
          </Stack>
        </Grid>
      </Grid>

      <TextField
        fullWidth
        name="question"
        label="Question Text"
        value={formik.values.question}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.question && Boolean(formik.errors.question)}
        helperText={formik.touched.question && formik.errors.question}
        multiline
        rows={2}
        sx={{ mt: 2, mb: 2 }}
      />

      {formik.values.type === 'mcq' && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Options (Provide at least 2 options)
          </Typography>
          {formik.values.options.map((option, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Radio disabled />
              <TextField
                sx={{ width: 300 }}
                value={option}
                onChange={(e) => onOptionChange(index, e.target.value)}
                onBlur={formik.handleBlur}
                error={formik.touched.options && formik.errors.options && formik.errors.options[index]}
                // helperText={formik.touched.options && formik.errors.options && formik.errors.options[index]}
                label={`Option ${index + 1}`}
                size="small"
              />
              <IconButton
                onClick={() => removeOption(index)}
                disabled={formik.values.options.length <= 2}
                sx={{ ml: 1, color: 'error.main' }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          {formik.touched.options && formik.errors.options && typeof formik.errors.options === 'string' && (
            <FormHelperText error sx={{ mt: 1 }}>
              {formik.errors.options}
            </FormHelperText>
          )}
          <Button onClick={addOption} startIcon={<AddIcon />} sx={{ mt: 1 }}>
            Add Option
          </Button>
        </Box>
      )}

      {(formik.values.type === 'written' || formik.values.type === 'mcq') && (
        <TextField
          fullWidth
          name="expected_answer"
          label="Correct Answer (For reference)"
          value={formik.values.expected_answer}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          multiline
          rows={3}
          sx={{ mt: 2 }}
        />
      )}
    </>
  );
};

QuestionForm.propTypes = {
  formik: PropTypes.object.isRequired,
  onTypeChange: PropTypes.func.isRequired,
  addOption: PropTypes.func.isRequired,
  removeOption: PropTypes.func.isRequired,
  onOptionChange: PropTypes.func.isRequired
};

export default AdminAssmentsTab;
