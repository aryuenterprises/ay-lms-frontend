import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Tabs,
  Tab,
  Chip,
  CardContent,
  Card,
  TextField,
  Autocomplete,
  IconButton,
  InputAdornment,
  Stack
} from '@mui/material';
import { ArrowBack, ExpandMore, Check, Close, Score, EmojiEvents, CheckCircle, Analytics } from '@mui/icons-material';
import axiosInstance from 'utils/axios';
import { APP_PATH_BASE_URL } from 'config';
import PropTypes from 'prop-types';
import { ArrowForward, CloseSquare, SearchNormal1 } from 'iconsax-react';
import 'assets/css/commonStyle.css';

const AdminAssessmentTab = ({ course, student_id }) => {
  const [testCards, setTestCards] = useState([]);
  const [resultData, setResultData] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('testList');
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const courseIds = React.useMemo(() => course?.map((c) => c.course_id), [course]);

  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      const testPromises = courseIds?.map((courseId) => axiosInstance.get(`${APP_PATH_BASE_URL}api/test/course/${courseId}/${student_id}`));
      const responses = await Promise.all(testPromises);
      const allTests = responses.flatMap((response) => response.data.tests || []);
      setTestCards(allTests);
      // setCourses(course || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tests:', err);
      setError('Failed to load tests. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [courseIds, student_id]);

  const fetchResults = useCallback(
    async (testId) => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/test/${testId}/student/${student_id}/result`);
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
    [student_id]
  );

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

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleTestSelect = (test) => {
    setSelectedTest(test);
    setError(null);
    fetchResults(test.test_id);
  };

  const handleReturnToTests = () => {
    setSelectedTest(null);
    setResultData([]);
    setViewMode('testList');
    setTabValue(0);
    setError(null);
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

  // Loading and error display
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  // Results view
  if (viewMode === 'results' && resultData.length > 0 && selectedTest) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={handleReturnToTests} sx={{ mb: 3 }}>
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
                  <Accordion sx={{ mb: 2 }}>
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

                          <Typography variant="body2" sx={{ mt: 2 }}>
                            <strong>Your answer:</strong> {question.student_answer || 'Not answered'}
                          </Typography>
                          {!question.is_correct && question.correct_answer && (
                            <Typography variant="body2">
                              <strong>Correct answer:</strong> {question.correct_answer}
                            </Typography>
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

                          {question.correct_answer && (
                            <>
                              <Typography variant="body2" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
                                Model answer:
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
      </Box>
    );
  }

  // Test list view
  return (
    <Box sx={{ p: 3 }}>
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
                    <SearchNormal1 size={20} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {searchTerm && (
                      <IconButton onClick={handleClearSearch} edge="end" size="small">
                        <CloseSquare size={20} />
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
              size="medium"
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
      {filteredcards && filteredcards.length > 0 ? (
        <Grid container spacing={2}>
          {filteredcards.map((test) => (
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
                      variant="outlined"
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
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      gap: 1,
                      mt: 3
                    }}
                  >
                    {test.correction_done ? (
                      <Box
                        sx={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap'
                        }}
                      >
                        <Button size="small" color="primary" endIcon={<ArrowForward />} onClick={() => handleTestSelect(test)}>
                          View Results
                        </Button>

                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            textAlign: 'right'
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Corrected by
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {test.evaluated_by.full_name} ({test.evaluated_by.employee_id})
                          </Typography>
                        </Box>
                      </Box>
                    ) : test.test_completion ? (
                      <Chip
                        label="Submitted"
                        color="success"
                        size="small"
                        sx={{
                          fontWeight: 600,
                          alignSelf: 'flex-start',
                          px: 1
                        }}
                      />
                    ) : (
                      <Chip
                        className="warning-chip"
                        label="Pending"
                        color="warning"
                        size="small"
                        sx={{
                          fontWeight: 600,
                          alignSelf: 'flex-start',
                          px: 1
                        }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid item xs={12}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No tests available for this course.
            </Typography>
          </Card>
        </Grid>
      )}
    </Box>
  );
};

AdminAssessmentTab.propTypes = {
  course: PropTypes.object.isRequired,
  student_id: PropTypes.string
};

export default AdminAssessmentTab;
