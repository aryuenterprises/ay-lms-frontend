import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Divider,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  CardActions,
  StepIcon,
  TextField,
  Autocomplete,
  IconButton,
  InputAdornment,
  Stack
} from '@mui/material';
import { ErrorOutline, ArrowBack, Save, Check, Clear, CheckCircleOutline, Search, Close } from '@mui/icons-material';
import axiosInstance from 'utils/axios';
import { APP_PATH_BASE_URL } from 'config';
import PropTypes from 'prop-types';
// import { ArrowForward, CloseSquare, SearchNormal1 } from 'iconsax-react';

const TutorAssessmentTab = ({ course, student_id }) => {
  const [testCards, setTestCards] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [evaluations, setEvaluations] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  //   const auth = JSON.parse(localStorage.getItem('auth'));
  //   const tutorId = auth?.user?.registration_id;

  const courseIds = React.useMemo(() => course?.map((c) => c.course_id), [course]);
  //   const courseIdsString = courseIds.join(',');

  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const testPromises = courseIds.map((courseId) => axiosInstance.get(`${APP_PATH_BASE_URL}api/test/course/${courseId}`));

      const responses = await Promise.all(testPromises);
      const allTests = responses.flatMap((response) => response.data.tests || []);

      setTestCards(allTests);
      setHasFetched(true);
    } catch (err) {
      console.error('Error fetching assessment data:', err);
      setError('Failed to load tests. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [courseIds]);

  const filteredcards = useMemo(() => {
    return testCards.filter((course) => {
      if (!course) return false; // Additional safety check

      // Check if course matches search term
      const matchesSearch =
        !searchTerm ||
        course.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.test_name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Check if course matches selected course filter
      const matchesCourse = !selectedCourse || course.course_id === selectedCourse.course_id;

      // Return true only if both conditions are met
      return matchesSearch && matchesCourse;
    });
  }, [testCards, selectedCourse, searchTerm]);

  const fetchTestDetails = useCallback(
    async (test) => {
      try {
        setLoading(true);
        setError(null);

        const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/test/${test.test_id}/student/${student_id}/answers`);
        const testData = response.data.data;
        if (!testData || !testData.length) {
          setError('No assessment data found for this student.');
          setAssessment(null);
          return;
        }

        // Initialize evaluations object
        const initialEvaluations = {};
        // Make sure we're processing the data correctly
        const processedQuestions = testData.map(({ question, submitted_answer }) => {
          // Ensure each question has the proper structure
          const processedQuestion = {
            question_id: question?.question_id,
            question: question?.question || '',
            type: question?.type || 'written',
            options: question?.options || [],
            marks: question?.marks || 1,
            mcq_correct_answer: question?.mcq_correct_answer || '',
            submitted_answer: {
              answer_id: submitted_answer?.answer_id || null,
              selected_option: submitted_answer?.selected_option || '',
              written_answer: submitted_answer?.written_answer || '',
              is_correct: submitted_answer?.is_correct || null
            }
          };

          return processedQuestion;
        });

        setEvaluations(initialEvaluations);

        const transformedAssessment = {
          id: test.test_id,
          title: test.test_name,
          questions: processedQuestions // Use the processed questions
        };

        setAssessment(transformedAssessment);
      } catch (err) {
        console.error('Error fetching test details:', err);
        setError('Failed to load test details. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [student_id]
  );

  useEffect(() => {
    if (courseIds?.length > 0 && !hasFetched) {
      fetchTests();
    }
  }, [courseIds, hasFetched, fetchTests]);

  const handleTestSelect = (test) => {
    setSelectedTest(test);
    setError(null);
    fetchTestDetails(test);
  };

  const handleEvaluationChange = (questionId, value) => {
    setEvaluations((prev) => ({
      ...prev,
      [questionId]: value === 'true'
    }));
  };

  const handleNext = () => {
    if (currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSaveAll = async () => {
    if (!assessment) return;

    try {
      setSubmitting(true);
      setError(null);

      const response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/results/finalize/${selectedTest.test_id}/mark_and_finalize`, {
        student_id: student_id,
        test_id: selectedTest.test_id,
        score: calculateScore().score,
        answers: assessment.questions.map((question) => ({
          answer_id: question.submitted_answer.answer_id,
          is_correct: evaluations[question.question_id]
        }))
      });

      if (response.data.success) {
        setSaved(true);
      } else {
        setError('Failed to save evaluations. Please try again.');
      }
    } catch (err) {
      console.error('Error saving evaluations:', err);
      setError('An error occurred while saving. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnToTests = () => {
    setSelectedTest(null);
    setAssessment(null);
    setCurrentQuestion(0);
    setEvaluations({});
    setError(null);
    fetchTests();
    setSaved(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Calculate total score
  const calculateScore = () => {
    if (!assessment) return { score: 0, total: 0 };

    let score = 0;
    let total = 0;

    assessment.questions.forEach((question) => {
      if (evaluations[question.question_id] === true) {
        score += question.marks || 1;
      }
      total += question.marks || 1;
    });

    return { score, total };
  };

  if (!selectedTest) {
    return (
      <Box sx={{ p: 3 }}>
        {!error && (
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 2,
              textAlign: 'center'
            }}
          >
            Student Tests for Evaluation
          </Typography>
        )}
        {!error && (
          <Grid container justifyContent="space-between" alignItems="center" mb={2} spacing={2}>
            <Grid item xs={12}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={20} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {searchTerm && (
                          <IconButton onClick={handleClearSearch} edge="end" size="small">
                            <Close size={20} />
                          </IconButton>
                        )}
                      </InputAdornment>
                    )
                  }}
                  sx={{ width: 220 }}
                />
                <Autocomplete
                  id="course_id"
                  options={course || []}
                  getOptionLabel={(option) => option.course_name || ''}
                  value={selectedCourse}
                  onChange={(event, newValue) => {
                    setSelectedCourse(newValue);
                  }}
                  size="small"
                  sx={{ maxWidth: 250, flexGrow: 1 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Filter by course..."
                      InputProps={{
                        ...params.InputProps
                      }}
                    />
                  )}
                  filterOptions={(options = [], state) => {
                    return options.filter((option) => option.course_name?.toLowerCase().includes(state.inputValue.toLowerCase()));
                  }}
                  isOptionEqualToValue={(option, value) => option.course_id === value.course_id}
                  renderOption={(props, option) => (
                    <li {...props} key={option.course_id}>
                      {option.course_name}
                    </li>
                  )}
                />
              </Stack>
            </Grid>
          </Grid>
        )}
        {error ? (
          <Paper
            elevation={0}
            sx={{
              textAlign: 'center',
              my: 8,
              p: 6,
              backgroundColor: 'grey.50',
              borderRadius: 3,
              border: '1px dashed',
              borderColor: 'divider'
            }}
          >
            <ErrorOutline sx={{ fontSize: 80, color: 'error.main', mb: 3, opacity: 0.7 }} />
            <Typography variant="h5" gutterBottom color="text.secondary">
              Error Loading Tests
            </Typography>
            <Typography variant="body2">{error}</Typography>
            <Button variant="outlined" onClick={fetchTests} sx={{ mt: 1 }} size="small">
              Try Again
            </Button>
          </Paper>
        ) : loading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              my: 8,
              py: 4
            }}
          >
            <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
            <Typography variant="h6" color="text.secondary">
              Loading Assessment Tests...
            </Typography>
          </Box>
        ) : filteredcards.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              textAlign: 'center',
              my: 8,
              p: 6,
              backgroundColor: 'grey.50',
              borderRadius: 3,
              border: '1px dashed',
              borderColor: 'divider'
            }}
          >
            <ErrorOutline sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.7 }} />
            <Typography variant="h5" gutterBottom color="text.secondary">
              No Tests Available for Evaluation
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              There are currently no tests requiring evaluation. Please check back later or contact the administrator.
            </Typography>
          </Paper>
        ) : (
          <Box>
            <Grid container spacing={4}>
              {filteredcards.map((test) => (
                <Grid item xs={12} md={6} lg={4} key={test.test_id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                        transform: 'translateY(-6px)',
                        borderColor: 'secondary.light'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          mb: 1
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            flex: 1,
                            fontWeight: 600,
                            lineHeight: 1.3,
                            wordBreak: 'break-word', // Ensures text wraps
                            whiteSpace: 'pre-line' // Preserves newlines
                          }}
                        >
                          {test.test_name}
                        </Typography>
                        <Chip
                          label={test.course_name}
                          color="secondary"
                          // variant="outlined"
                          size="small"
                          sx={{
                            ml: 2,
                            backgroundColor: 'secondary.light',
                            color: 'secondary.dark',
                            fontWeight: 600,
                            alignSelf: 'flex-end', // Fixes chip at flex-end
                            flexShrink: 0, // Prevents Chip from shrinking/wrapping
                            whiteSpace: 'nowrap'
                          }}
                        />
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: 40
                        }}
                      >
                        {test.description || 'Attend all the questions.'}
                      </Typography>

                      <Box
                        sx={{
                          backgroundColor: 'grey.50',
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {/* <AssignmentIcon fontSize="small" color="primary" /> */}
                            <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                              Questions:
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {test.question_count}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {/* <GradeIcon fontSize="small" color="primary" /> */}
                            <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                              Total Marks:
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {test.total_marks}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0 }}>
                      {test.students.map((student) => {
                        if (student.student_id === student_id) {
                          return student.correction_done ? (
                            <React.Fragment key={student.student_id}>
                              <Chip
                                label="Evaluated"
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{
                                  fontWeight: 600
                                }}
                              />
                            </React.Fragment>
                          ) : (
                            <Button
                              key={student.student_id}
                              size="small"
                              // endIcon={<ArrowForward />}
                              onClick={() => handleTestSelect(test)}
                              sx={{
                                fontWeight: 600,
                                color: 'primary.main'
                              }}
                            >
                              Evaluate Tests
                            </Button>
                          );
                        }
                        return null;
                      })}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    );
  }

  if (error && !assessment) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <ErrorOutline sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" onClick={handleReturnToTests} sx={{ mt: 2 }}>
          Return to Tests
        </Button>
      </Box>
    );
  }

  if (loading || !assessment) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6">Loading assessment...</Typography>
      </Box>
    );
  }

  const question = assessment.questions[currentQuestion];
  const maxMarks = question.marks || 1;
  const { score, total } = calculateScore();
  return (
    <Box sx={{ p: 3, maxWidth: 1000, margin: '0 auto' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {saved && (
        <Box
          sx={{
            p: 4,
            maxWidth: 600,
            margin: '0 auto',
            textAlign: 'center',
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#e6f4ea', // subtle light green background for success
            boxShadow: '0 4px 12px rgba(0, 128, 0, 0.15)' // gentle shadow
          }}
        >
          <CheckCircleOutline color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 3, fontWeight: '600', color: '#2e7d32' }}>
            Evaluation saved successfully!
          </Typography>
          <Button
            variant="contained"
            color="success"
            onClick={handleReturnToTests}
            startIcon={<ArrowBack />}
            sx={{
              fontWeight: 600,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              textTransform: 'none',
              borderRadius: 2,
              boxShadow: '0 3px 8px rgba(39, 99, 42, 0.5)',
              '&:hover': {
                backgroundColor: '#27632a',
                boxShadow: '0 6px 20px rgba(39, 99, 42, 0.6)'
              }
            }}
          >
            Return to Tests
          </Button>
        </Box>
      )}

      {!saved && (
        <>
          <Button startIcon={<ArrowBack />} onClick={handleReturnToTests} sx={{ mb: 2, color: 'secondary.main' }}>
            Back to Tests
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                {assessment.title} - Student Evaluation
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Evaluating answers for student ID: {student_id}
              </Typography>
            </Box>
            <Chip label={`Score: ${score}/${total}`} color="success" variant="outlined" sx={{ fontSize: '1rem', padding: '12px' }} />
          </Box>
          <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 3 }}>
            <Stepper activeStep={currentQuestion} alternativeLabel>
              {assessment.questions.map((q, index) => (
                <Step key={q.question_id}>
                  <StepLabel
                    error={evaluations[q.question_id] === false}
                    completed={evaluations[q.question_id] === true}
                    StepIconComponent={(props) => (
                      <StepIcon
                        {...props}
                        sx={{
                          '&.Mui-completed': { color: 'success.main' },
                          '&.Mui-active': { color: 'primary.main' }
                        }}
                      />
                    )}
                  >
                    {`Q${index + 1}`}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" sx={{ color: 'primary.main' }}>
                Question {currentQuestion + 1} of {assessment.questions.length}
                {maxMarks && <span style={{ fontSize: '0.8rem', marginLeft: '10px', color: 'text.secondary' }}>({maxMarks} marks)</span>}
              </Typography>

              {evaluations[question.question_id] !== undefined && evaluations[question.question_id] !== null && (
                <Chip
                  icon={evaluations[question.question_id] ? <Check /> : <Clear />}
                  label={evaluations[question.question_id] ? 'Correct' : 'Incorrect'}
                  color={evaluations[question.question_id] ? 'success' : 'error'}
                  variant="outlined"
                />
              )}
            </Box>

            <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem' }}>
              {question.question}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Students Answer:
            </Typography>

            {question.type === 'mcq' ? (
              <FormControl component="fieldset" sx={{ mt: 1 }}>
                <FormLabel component="legend">Selected Option</FormLabel>
                <RadioGroup value={question?.submitted_answer?.selected_option || ''}>
                  {question.options?.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={option}
                      control={<Radio checked={question?.submitted_answer?.selected_option === option} />}
                      label={option}
                      sx={{
                        padding: '8px',
                        borderRadius: '4px'
                      }}
                    />
                  ))}
                </RadioGroup>
                {question.mcq_correct_answer && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Correct answer: {question.mcq_correct_answer}
                  </Typography>
                )}
              </FormControl>
            ) : (
              <Box>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 2,
                    backgroundColor: 'grey.50',
                    minHeight: '100px'
                  }}
                >
                  <Typography variant="body1">{question.submitted_answer.written_answer || 'No answer provided'}</Typography>
                </Paper>
                {question.submitted_answer.written_answer && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Correct answer: {question.submitted_answer.written_answer}
                  </Typography>
                )}
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Evaluation:
            </Typography>

            <RadioGroup
              row
              value={evaluations[question.question_id]}
              onChange={(e) => handleEvaluationChange(question.question_id, e.target.value)}
              sx={{ gap: 2 }}
            >
              <FormControlLabel
                value={true}
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Check sx={{ color: 'success.main', mr: 1 }} />
                    <Typography>Correct</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value={false}
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Clear sx={{ color: 'error.main', mr: 1 }} />
                    <Typography>Incorrect</Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </Paper>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button variant="outlined" onClick={handlePrevious} disabled={currentQuestion === 0}>
              Previous
            </Button>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {currentQuestion < assessment.questions.length - 1 ? (
                <Button variant="contained" onClick={handleNext}>
                  Next Question
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleSaveAll}
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
                >
                  Save All Evaluations
                </Button>
              )}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

TutorAssessmentTab.propTypes = {
  course: PropTypes.array,
  student_id: PropTypes.string
};

export default TutorAssessmentTab;
