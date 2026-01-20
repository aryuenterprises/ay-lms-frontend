import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Divider,
  Card,
  CardContent,
  Grid,
  CardActions,
  CircularProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  CheckCircleOutlineTwoTone,
  ErrorOutline,
  ArrowBack,
  CheckCircle,
  Warning,
  ArrowBackIos,
  ArrowForwardIos,
  AccessTime,
  ExpandMore,
  Check,
  Close,
  EmojiEvents,
  Score,
  Analytics
} from '@mui/icons-material';
import axiosInstance from 'utils/axios';
import { APP_PATH_BASE_URL } from 'config';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import { ArrowForward, Send } from 'iconsax-react';

const StudentAssessmentTab = ({ courseId }) => {
  const [testCards, setTestCards] = useState([]);
  const [resultData, setResultData] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [viewMode, setViewMode] = useState('testList');
  const [tabValue, setTabValue] = useState(0);
  console.log('resultData is', resultData);
  const auth = JSON.parse(localStorage.getItem('auth'));
  const RegId = auth?.user?.student_id;

  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/test/course/${courseId}`);
      setTestCards(response.data.tests || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching assessment data:', err);
      setError('Failed to load tests. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const fetchResults = useCallback(
    async (testId) => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/test/${testId}/student/${RegId}/result`);
        setResultData(response.data.questions || []);
        setError(null);
        setViewMode('results');
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load results. Please try again later.');
      } finally {
        setLoading(false);
      }
    },
    [RegId]
  );

  const fetchTestDetails = useCallback(async (test) => {
    try {
      setLoading(true);
      const testData = test;

      if (!testData.questions || testData.questions.length === 0) {
        setError('This test has no questions available.');
        setAssessment(null);
        return;
      }

      const transformedAssessment = {
        id: testData.test_id,
        title: testData.test_name,
        instructions: testData.description,
        questions: testData.questions.map((q) => ({
          id: q.question_id,
          text: q.question,
          type: q.type,
          options: q.options || [],
          marks: q.marks
        }))
      };

      setAssessment(transformedAssessment);
      setStartTime(new Date());
      setError(null);
      setViewMode('testTaking');
    } catch (err) {
      console.error('Error fetching test details:', err);
      setError('Failed to load test details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleTestSelect = (test) => {
    setSelectedTest(test);
    setError(null);
    fetchTestDetails(test);
  };

  const handleAnswerChange = (questionId, value) => {
    // console.log('Answer changed for question', questionId, 'to', value);
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
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

  const isQuestionAnswered = (questionId) => {
    const answer = answers[questionId];

    // Check if answer is undefined, null, or empty string
    if (answer === undefined || answer === null || answer === '') {
      return false;
    }

    // Check if answer is a string with only whitespace
    if (typeof answer === 'string' && answer.trim().length === 0) {
      return false;
    }

    // For array answers (checkboxes, multi-select)
    if (Array.isArray(answer) && answer.length === 0) {
      return false;
    }

    return true;
  };

  const allQuestionsAnswered = () => {
    if (!assessment) return false;
    return assessment.questions.every((question) => isQuestionAnswered(question.id));
  };

  const handleSubmit = useCallback(async () => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to submit the assessment.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, submit',
        cancelButtonText: 'Cancel'
      });

      if (!result.isConfirmed) {
        return;
      }

      const totalTimeTaken = Math.floor((new Date() - startTime) / 1000);
      const answersData = assessment.questions.map((question) => {
        const answer = answers[question.id];
        const result = {
          student_id: RegId,
          question_id: question.id,
          test_id: assessment.id,
          marks: question.marks,
          time_taken: totalTimeTaken
        };

        // Only add written_answer if it's not null and question type is 'written'
        if (question.type === 'written' && answer !== null) {
          result.written_answer = answer;
        }

        // Only add selected_option if it's not null and question type is 'mcq'
        if (question.type === 'mcq' && answer !== null) {
          result.selected_option = answer;
        }

        return result;
      });

      const response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/answers`, answersData);

      if (response.data.success) {
        setCompleted(true);
        setViewMode('testList');
      } else {
        setError('Failed to submit answers. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setError('An error occurred while submitting your answers. Please try again.');
    }
  }, [answers, assessment, RegId, startTime]);

  const handleReturnToTests = () => {
    setSelectedTest(null);
    setAssessment(null);
    setCompleted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setError(null);
    setViewMode('testList');
    fetchTests();
  };

  const handleViewResult = (test) => {
    setSelectedTest(test);
    fetchResults(test.test_id);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Calculate results statistics
  const calculateResults = () => {
    if (!resultData || resultData.length === 0) return null;

    const totalQuestions = resultData.length;
    const correctAnswers = resultData.filter((q) => q.is_correct).length;
    const totalMarks = resultData.reduce((sum, q) => sum + (q.marks || 0), 0);
    const earnedMarks = resultData.reduce((sum, q) => sum + (q.is_correct ? q.marks || 0 : 0), 0);
    const percentage = (earnedMarks / totalMarks) * 100;

    return {
      totalQuestions,
      correctAnswers,
      totalMarks,
      earnedMarks,
      percentage: percentage.toFixed(1)
    };
  };

  const results = calculateResults();

  if (viewMode === 'results' && resultData.length > 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => setViewMode('testList')} sx={{ mb: 3 }}>
          Back to Tests
        </Button>

        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" gutterBottom>
            {selectedTest.test_name} - Results
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Your performance summary
          </Typography>
        </Box>

        {/* Results Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Score color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" gutterBottom>
                {results.earnedMarks}/{results.totalMarks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Score
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <EmojiEvents color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" gutterBottom>
                {results.percentage}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Percentage
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <CheckCircle color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" gutterBottom>
                {results.correctAnswers}/{results.totalQuestions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Correct Answers
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Analytics color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" gutterBottom>
                {results.totalQuestions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Questions
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Performance Progress */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Performance Breakdown
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Overall Score</Typography>
              <Typography variant="body2">{results.percentage}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Number(results.percentage)}
              sx={{ height: 10, borderRadius: 5 }}
              color={results.percentage >= 80 ? 'success' : results.percentage >= 60 ? 'primary' : 'error'}
            />
          </Box>
        </Paper>

        {/* Tabs for different views */}
        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Question Review" />
            {/* <Tab label="Score Summary" /> */}
          </Tabs>
        </Paper>

        {tabValue === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Question-by-Question Review
            </Typography>
            <Grid container spacing={2}>
              {resultData.map((question, index) => (
                <Grid item xs={12} sm={6} md={4} key={question.question_id}>
                  <Accordion key={question.question_id} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Typography sx={{ width: '33%', flexShrink: 0 }}>Question {index + 1}</Typography>
                        <Chip
                          icon={question.is_correct ? <Check /> : <Close />}
                          label={question.is_correct ? 'Correct' : 'Incorrect'}
                          color={question.is_correct ? 'success' : 'error'}
                          size="small"
                          sx={{ mr: 2 }}
                        />
                        <Typography sx={{ color: 'text.secondary' }}>
                          {question.marks} mark{question.marks > 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="h6" gutterBottom>
                        {question.question}
                      </Typography>

                      {question.type === 'mcq' ? (
                        <Box>
                          <Typography variant="body2" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
                            Options:
                          </Typography>
                          <List>
                            {question.options.map((option, optIndex) => (
                              <ListItem key={optIndex}>
                                <ListItemIcon>
                                  {option === question.student_answer ? (
                                    question.is_correct ? (
                                      <Check color="success" />
                                    ) : (
                                      <Close color="error" />
                                    )
                                  ) : option === question.correct_answer ? (
                                    <Check color="success" />
                                  ) : null}
                                </ListItemIcon>
                                <ListItemText
                                  primary={option}
                                  sx={{
                                    backgroundColor:
                                      option === question.correct_answer
                                        ? 'success.light'
                                        : option === question.student_answer && !question.is_correct
                                        ? 'error.light'
                                        : 'transparent',
                                    p: 1,
                                    borderRadius: 1
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>

                          {question.is_correct === false && question.correct_answer && (
                            <>
                              <Typography variant="body2" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
                                Correct answer:
                              </Typography>
                              <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'success.light' }}>
                                <Typography>{question.correct_answer}</Typography>
                              </Paper>
                            </>
                          )}
                        </Box>
                      ) : (
                        <Box>
                          <Typography variant="body2" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
                            Your answer:
                          </Typography>
                          <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'grey.50' }}>
                            <Typography>{question.student_answer || 'No answer provided'}</Typography>
                          </Paper>

                          {question.is_correct === false && question.correct_answer && (
                            <>
                              <Typography variant="body2" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
                                Correct answer:
                              </Typography>
                              <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'success.light' }}>
                                <Typography>{question.correct_answer}</Typography>
                              </Paper>
                            </>
                          )}
                        </Box>
                      )}

                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Chip
                          label={`Score: ${question.is_correct ? question.marks : 0}/${question.marks}`}
                          color={question.is_correct ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* {tabValue === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Score Summary
            </Typography>

            <Grid container spacing={2}>
              {resultData.map((question, index) => (
                <Grid item xs={12} sm={6} md={4} key={question.question_id}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      borderColor: question.is_correct ? 'success.main' : 'error.main',
                      backgroundColor: question.is_correct ? 'success.lighter' : 'error.lighter'
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6">Q{index + 1}</Typography>
                        <Chip
                          icon={question.is_correct ? <Check /> : <Close />}
                          label={question.is_correct ? 'Correct' : 'Incorrect'}
                          color={question.is_correct ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {question.type.toUpperCase()}
                      </Typography>

                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          <strong>Your Answer:</strong>{' '}
                          {question.type === 'mcq'
                            ? question.student_answer || 'Not answered'
                            : question.student_answer
                            ? question.student_answer.length > 20
                              ? `${question.student_answer.substring(0, 20)}...`
                              : question.student_answer
                            : 'Not answered'}
                        </Typography>
                      </Box>

                      {!question.is_correct && question.correct_answer && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            <strong>Correct Answer:</strong> {question.correct_answer}
                          </Typography>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">
                          <strong>Marks:</strong>
                        </Typography>
                        <Chip
                          label={`${question.is_correct ? question.marks : 0}/${question.marks}`}
                          color={question.is_correct ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )} */}
      </Box>
    );
  }

  if (completed) {
    return (
      <Box
        sx={{
          p: 4,
          maxWidth: 900,
          margin: '0 auto',
          textAlign: 'center',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Box
          sx={{
            position: 'relative',
            mb: 3,
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.05)' },
              '100%': { transform: 'scale(1)' }
            }
          }}
        >
          <CheckCircleOutlineTwoTone
            sx={{
              fontSize: 100,
              color: 'success.main',
              filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.1))'
            }}
          />
        </Box>

        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 2,
            background: 'linear-gradient(45deg, #2e7d32 30%, #66bb6a 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}
        >
          Assessment Submitted Successfully!
        </Typography>

        <Typography
          variant="h6"
          sx={{
            mb: 4,
            color: 'text.secondary',
            maxWidth: '80%',
            mx: 'auto',
            lineHeight: 1.6
          }}
        >
          Thank you for completing the assessment. Your answers have been recorded and will be reviewed shortly.
        </Typography>

        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            backgroundColor: 'grey.50',
            width: '100%',
            maxWidth: 500
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <AccessTime sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Results will be available within 24-48 hours
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            You will receive a notification when your results are ready for review.
          </Typography>
        </Paper>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}
        >
          <Button
            variant="contained"
            onClick={handleReturnToTests}
            size="large"
            sx={{
              px: 4,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)'
            }}
          >
            Return to Tests
          </Button>
        </Box>
      </Box>
    );
  }

  // Show test selection if no test is selected
  if (!selectedTest || viewMode === 'testList') {
    return (
      <Box sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ textAlign: 'center', my: 8 }}>
            <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
            <Typography variant="h5" color="primary" gutterBottom>
              Loading Assessments
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preparing your tests...
            </Typography>
          </Box>
        ) : testCards.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              my: 8,
              p: 4,
              backgroundColor: 'grey.50',
              borderRadius: 2
            }}
          >
            <ErrorOutline sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.7 }} />
            <Typography variant="h5" gutterBottom color="text.secondary">
              No Assessments Available
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 2 }}>
              There are currently no tests available for this course. Please check back later or contact your instructor.
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 600,
                mb: 2,
                textAlign: 'center'
              }}
            >
              Course Assessments
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                textAlign: 'center',
                mb: 5,
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Select an assessment below to begin testing your knowledge.
            </Typography>

            <Grid container spacing={4}>
              {testCards.map((test) => (
                <Grid item xs={12} md={6} lg={4} key={test.test_id}>
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
                        sx={{
                          mb: 3,
                          lineHeight: 1.6,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Questions:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {test.question_count}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Total Marks:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {test.total_marks}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ p: 3, pt: 0 }}>
                      {test.correction_done ? (
                        <>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              width: '100%'
                            }}
                          >
                            <Chip variant="outlined" label="Submitted" color="success" size="small" sx={{ fontWeight: 600 }} />
                            <Button
                              size="small"
                              color="primary"
                              endIcon={<ArrowForward />}
                              onClick={() => handleViewResult(test)}
                              sx={{ fontWeight: 600 }}
                            >
                              View Results
                            </Button>
                          </Box>
                        </>
                      ) : test.test_completion ? (
                        <Chip variant="outlined" label="Submitted" color="success" size="small" sx={{ fontWeight: 600 }} />
                      ) : (
                        <Button
                          size="small"
                          color="primary"
                          endIcon={<ArrowForward />}
                          onClick={() => handleTestSelect(test)}
                          sx={{ fontWeight: 600 }}
                        >
                          Start Assessment
                        </Button>
                      )}
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

  // Show error if no questions available
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

  // Show loading if assessment data is being fetched
  if (loading || !assessment) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Loading assessment...</Typography>
      </Box>
    );
  }

  const question = assessment.questions[currentQuestion];
  const isAllAnswered = allQuestionsAnswered();

  // console.log('question', question);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, margin: '0 auto' }}>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={handleReturnToTests}
        sx={{
          mb: 3,
          color: 'text.secondary',
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
      >
        Return to Test List
      </Button>

      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
          {assessment.title}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontSize: '1rem' }}>
          {assessment.instructions}
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        {question.type === 'mcq'
          ? 'Choose the single correct option from the choices below.'
          : 'Provide your written response in the text area below.'}
      </Alert>

      {/* Progress Stepper */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <Stepper activeStep={currentQuestion} alternativeLabel>
          {assessment.questions.map((q, index) => {
            const isAnswered = isQuestionAnswered(q.id);
            return (
              <Step key={q.id} completed={isAnswered}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      '&.Mui-completed': { color: isAnswered ? 'success.main' : 'grey.400' },
                      '&.Mui-active': { color: 'primary.main' }
                    }
                  }}
                >
                  {`Q${index + 1}`}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Paper>

      {/* Question */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 500 }}>
            Question {currentQuestion + 1} of {assessment.questions.length}
          </Typography>
          {question.marks && <Chip label={`${question.marks} mark${question.marks > 1 ? 's' : ''}`} color="success" variant="outlined" />}
        </Box>

        <Typography variant="body1" sx={{ mb: 2, fontSize: '1.2rem', lineHeight: 1.6 }}>
          {question.text}
        </Typography>

        {/* Answer Area */}
        {question.type === 'mcq' ? (
          <RadioGroup value={answers[question.id] || ''} onChange={(e) => handleAnswerChange(question.id, e.target.value)}>
            {question.options.map((option, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  mb: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: answers[question.id] === option ? 'success.main' : 'divider',
                  backgroundColor: answers[question.id] === option ? 'success.lighter' : 'background.paper',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.light',
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <FormControlLabel
                  value={option} // Directly using the option as value
                  control={<Radio />}
                  label={<Typography variant="body1">{option}</Typography>}
                  sx={{ width: '100%', m: 0 }}
                />
              </Paper>
            ))}
          </RadioGroup>
        ) : (
          <TextField
            fullWidth
            multiline
            rows={8}
            placeholder="Compose your answer here..."
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '1rem'
              }
            }}
          />
        )}
      </Paper>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button
          variant="outlined"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          startIcon={<ArrowBackIos />}
          color="secondary"
          sx={{ borderRadius: 2, px: 3 }}
        >
          Previous
        </Button>

        <Box>
          {currentQuestion < assessment.questions.length - 1 ? (
            <Button variant="contained" onClick={handleNext} endIcon={<ArrowForwardIos />} sx={{ borderRadius: 2, px: 4, py: 1 }}>
              Next Question
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              onClick={handleSubmit}
              disabled={!isAllAnswered}
              endIcon={<Send />}
              sx={{ borderRadius: 2, px: 4, py: 1 }}
            >
              Submit Assessment
            </Button>
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Alert
        severity={isAllAnswered ? 'success' : 'warning'}
        sx={{ mb: 3, borderRadius: 2 }}
        icon={isAllAnswered ? <CheckCircle /> : <Warning />}
      >
        {isAllAnswered
          ? 'All questions have been completed! You may now submit your assessment.'
          : `Complete all questions before submitting. Currently answered: ${Object.keys(answers).length}/${assessment.questions.length}`}
      </Alert>

      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
        Note: All responses will be submitted together when you click Submit Assessment. You can review and modify answers anytime before
        final submission.
      </Typography>
    </Box>
  );
};

export default StudentAssessmentTab;

StudentAssessmentTab.propTypes = {
  courseId: PropTypes.number
};
