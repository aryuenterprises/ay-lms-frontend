// QuestionForm.js (corrected version)
import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Stack,
  Grid,
  FormLabel,
  Select,
  MenuItem,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Typography,
  Divider,
  IconButton,
  InputLabel,
  Alert
} from '@mui/material';
import { Close } from '@mui/icons-material';
import PropTypes from 'prop-types';

const QuestionForm = ({ formik, onCancel, loading, isEditing }) => {
  const [questionType, setQuestionType] = useState(formik.values.questionType || 'input');

  useEffect(() => {
    setQuestionType(formik.values.questionType);

    // Initialize options based on question type
    if (formik.values.questionType === 'radio' && (!formik.values.options || formik.values.options.length === 0)) {
      formik.setFieldValue('options', ['Yes', 'No']);
    } else if (formik.values.questionType === 'checkbox' && (!formik.values.options || formik.values.options.length === 0)) {
      formik.setFieldValue('options', ['', '']);
    }
  }, [formik.values.questionType]);

  const handleQuestionTypeChange = (e) => {
    const newType = e.target.value;
    setQuestionType(newType);
    formik.setFieldValue('questionType', newType);
    formik.setFieldValue('correctAnswer', '');
    formik.setFieldValue('correctAnswers', []);

    // Reset options based on type
    if (newType === 'radio') {
      formik.setFieldValue('options', ['Yes', 'No']);
    } else if (newType === 'checkbox') {
      formik.setFieldValue('options', ['', '']);
    } else if (newType === 'input') {
      formik.setFieldValue('options', []);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formik.values.options];
    newOptions[index] = value;
    formik.setFieldValue('options', newOptions);
  };

  const handleRadioAnswerChange = (value) => {
    formik.setFieldValue('correctAnswer', value);
  };

  const handleCheckboxAnswerChange = (option) => {
    // For checkbox type, we're treating it as single choice (like radio)
    // If you want multi-select, you'll need to handle an array of correct answers
    formik.setFieldValue('correctAnswer', option);
  };

  const handleAddOption = () => {
    if (formik.values.options.length < 6) {
      const newOptions = [...formik.values.options, `Option ${formik.values.options.length + 1}`];
      formik.setFieldValue('options', newOptions);
    }
  };

  const handleRemoveOption = (index) => {
    if (formik.values.options.length > 2) {
      const newOptions = formik.values.options.filter((_, i) => i !== index);
      formik.setFieldValue('options', newOptions);

      // If removed option was the correct answer, clear the correct answer
      if (formik.values.correctAnswer === formik.values.options[index]) {
        formik.setFieldValue('correctAnswer', '');
      }
    } else {
      // Show error if trying to remove when only 2 options remain
      formik.setFieldError('options', 'At least 2 options are required');
    }
  };

  return (
    <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: 'white' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">{isEditing ? 'Edit Question' : 'Add New Question'}</Typography>
        <IconButton onClick={onCancel} size="small">
          <Close />
        </IconButton>
      </Stack>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Question Title */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Question Title *"
              name="questionTitle"
              value={formik.values.questionTitle}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.questionTitle && Boolean(formik.errors.questionTitle)}
              helperText={formik.touched.questionTitle && formik.errors.questionTitle}
              multiline
              rows={2}
              placeholder="Enter your question here..."
            />
          </Grid>

          {/* Question Type */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth error={formik.touched.questionType && Boolean(formik.errors.questionType)}>
              <InputLabel>Question Type *</InputLabel>
              <Select
                name="questionType"
                value={formik.values.questionType}
                onChange={handleQuestionTypeChange}
                onBlur={formik.handleBlur}
                label="Question Type *"
              >
                <MenuItem value="input">Text Input</MenuItem>
                <MenuItem value="radio">Single Choice (Radio)</MenuItem>
                <MenuItem value="checkbox">Multiple Choice</MenuItem>
              </Select>
              {formik.touched.questionType && formik.errors.questionType && (
                <Typography color="error" variant="caption">
                  {formik.errors.questionType}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Marks */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Marks *"
              type="number"
              name="mark"
              value={formik.values.mark}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.mark && Boolean(formik.errors.mark)}
              helperText={formik.touched.mark && formik.errors.mark}
              InputProps={{ inputProps: { min: 0.5, max: 10, step: 0.5 } }}
            />
          </Grid>

          {/* Time Limit */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth error={formik.touched.questionTime && Boolean(formik.errors.questionTime)}>
              <InputLabel>Time Limit *</InputLabel>
              <Select
                name="questionTime"
                value={formik.values.questionTime}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Time Limit *"
              >
                <MenuItem value={10}>10 seconds</MenuItem>
                <MenuItem value={20}>20 seconds</MenuItem>
                <MenuItem value={30}>30 seconds</MenuItem>
                <MenuItem value={60}>60 seconds</MenuItem>
                <MenuItem value={90}>90 seconds</MenuItem>
              </Select>
              {formik.touched.questionTime && formik.errors.questionTime && (
                <Typography color="error" variant="caption">
                  {formik.errors.questionTime}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Answer Section */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Answer Section
            </Typography>

            {/* Input Type */}
            {questionType === 'input' && (
              <TextField
                fullWidth
                label="Expected Answer (Optional)"
                name="correctAnswer"
                value={formik.values.correctAnswer || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter the expected answer (for reference only)"
                helperText="This answer is for reference and won't be shown to participants"
              />
            )}

            {/* Radio Type (Single Choice) */}
            {questionType === 'radio' && (
              <Box sx={{ mt: 2 }}>
                <FormControl component="fieldset" fullWidth error={formik.touched.correctAnswer && Boolean(formik.errors.correctAnswer)}>
                  <FormLabel component="legend">Select Correct Answer *</FormLabel>
                  <RadioGroup
                    value={formik.values.correctAnswer || ''}
                    onChange={(e) => handleRadioAnswerChange(e.target.value)}
                    name="correctAnswer"
                  >
                    <Grid container spacing={2}>
                      {formik.values.options &&
                        formik.values.options.map((option, index) => (
                          <Grid item xs={12} md={6} key={index}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <FormControlLabel
                                value={option}
                                control={<Radio />}
                                label={
                                  <TextField
                                    fullWidth
                                    size="small"
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.options && formik.errors?.options?.[index]}
                                  />
                                }
                              />
                              {formik.values.options.length > 2 && (
                                <IconButton size="small" onClick={() => handleRemoveOption(index)} sx={{ color: 'error.main' }}>
                                  <Close fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </Grid>
                        ))}
                    </Grid>
                  </RadioGroup>
                  {formik.touched.correctAnswer && formik.errors.correctAnswer && (
                    <Typography color="error" variant="caption">
                      {formik.errors.correctAnswer}
                    </Typography>
                  )}
                </FormControl>

                {formik.values.options && formik.values.options.length < 6 && (
                  <Button onClick={handleAddOption} variant="outlined" size="small" sx={{ mt: 2 }} type="button">
                    Add Option
                  </Button>
                )}

                {formik.touched.options && formik.errors.options && typeof formik.errors.options === 'string' && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {formik.errors.options}
                  </Alert>
                )}
              </Box>
            )}

            {/* Checkbox Type (Multiple Choice - Single Selection) */}
            {questionType === 'checkbox' && (
              <Box sx={{ mt: 2 }}>
                <FormControl component="fieldset" fullWidth error={formik.touched.correctAnswer && Boolean(formik.errors.correctAnswer)}>
                  <FormLabel component="legend">Select Correct Answer *</FormLabel>
                  <Grid container spacing={2}>
                    {formik.values.options &&
                      formik.values.options.map((option, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={formik.values.correctAnswer === option}
                                  onChange={() => handleCheckboxAnswerChange(option)}
                                  name="correctAnswer"
                                />
                              }
                              label={
                                <TextField
                                  fullWidth
                                  size="small"
                                  value={option}
                                  onChange={(e) => handleOptionChange(index, e.target.value)}
                                  onBlur={formik.handleBlur}
                                  error={formik.touched.options && formik.errors?.options?.[index]}
                                />
                              }
                            />
                            {formik.values.options.length > 2 && (
                              <IconButton size="small" onClick={() => handleRemoveOption(index)} sx={{ color: 'error.main' }}>
                                <Close fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </Grid>
                      ))}
                  </Grid>
                  {formik.touched.correctAnswer && formik.errors.correctAnswer && (
                    <Typography color="error" variant="caption">
                      {formik.errors.correctAnswer}
                    </Typography>
                  )}
                </FormControl>

                {formik.values.options && formik.values.options.length < 6 && (
                  <Button onClick={handleAddOption} variant="outlined" size="small" sx={{ mt: 2 }} type="button">
                    Add Option
                  </Button>
                )}

                {formik.touched.options && formik.errors.options && typeof formik.errors.options === 'string' && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {formik.errors.options}
                  </Alert>
                )}
              </Box>
            )}
          </Grid>

          {/* Form Actions */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={onCancel} variant="outlined" type="button" disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary" disabled={loading}>
                {loading ? 'Saving...' : isEditing ? 'Update Question' : 'Add Question'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

QuestionForm.propTypes = {
  formik: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  isEditing: PropTypes.bool
};

QuestionForm.defaultProps = {
  loading: false,
  isEditing: false
};

export default QuestionForm;
