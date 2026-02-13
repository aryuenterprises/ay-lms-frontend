import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Checkbox,
  TextField,
  FormGroup,
  LinearProgress,
  Chip,
  Zoom,
  Fade
} from '@mui/material';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { ALL_DUMMY_QUESTIONS } from './dummyQuestions';

const QuizPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [quizSummary, setQuizSummary] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});

  const resultsRef = useRef(null);

  const currentQuestion = ALL_DUMMY_QUESTIONS[currentQuestionIndex];
  const totalQuestions = ALL_DUMMY_QUESTIONS.length;
  const totalMarks = ALL_DUMMY_QUESTIONS.reduce((sum, q) => sum + q.mark, 0);

  // Initialize time for current question
  useEffect(() => {
    if (quizStarted && !quizCompleted) {
      setTimerKey((prev) => prev + 1);
    }
  }, [currentQuestionIndex, quizStarted, quizCompleted]);

  // Handle timer completion
  const handleTimerComplete = () => {
    handleNextQuestion();
  };

  const handleAnswerSelect = (value, questionType) => {
    if (questionType === 'radio') {
      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: value
      }));
    } else if (questionType === 'checkbox') {
      const currentSelections = userAnswers[currentQuestion.id] || [];
      const newSelections = currentSelections.includes(value)
        ? currentSelections.filter((item) => item !== value)
        : [...currentSelections, value];

      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: newSelections
      }));
    } else if (questionType === 'input') {
      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: value
      }));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < ALL_DUMMY_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Quiz completed
      setQuizCompleted(true);
      calculateResults();
    }
  };

  const calculateResults = () => {
    let totalScore = 0;
    const summary = ALL_DUMMY_QUESTIONS.map((question) => {
      const userAnswer = userAnswers[question.id];
      let isCorrect = false;
      let earnedMarks = 0;

      if (question.questionType === 'radio') {
        isCorrect = userAnswer === question.correctAnswer;
        earnedMarks = isCorrect ? question.mark : 0;
      } else if (question.questionType === 'checkbox') {
        // Check if arrays match (same elements, any order)
        const userSorted = [...(userAnswer || [])].sort();
        const correctSorted = [...question.correctAnswer].sort();
        isCorrect = JSON.stringify(userSorted) === JSON.stringify(correctSorted);
        earnedMarks = isCorrect ? question.mark : 0;
      } else if (question.questionType === 'input') {
        isCorrect = userAnswer?.toString().toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
        earnedMarks = isCorrect ? question.mark : 0;
      }

      totalScore += earnedMarks;

      return {
        questionId: question.id,
        questionTitle: question.questionTitle,
        questionType: question.questionType,
        userAnswer: userAnswer || (question.questionType === 'checkbox' ? [] : ''),
        correctAnswer: question.correctAnswer,
        isCorrect,
        earnedMarks,
        maxMarks: question.mark,
        difficulty: question.difficulty
      };
    });

    setScore(totalScore);
    setQuizSummary(summary);

    // Small delay before showing results for better UX
    setTimeout(() => {
      setShowResults(true);
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setScore(0);
    setShowResults(false);
    setQuizCompleted(false);
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    return (
      <Fade in timeout={400}>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Card
            sx={{
              p: 3,
              width: { xs: '95%', sm: '85%', md: '70%' },
              maxWidth: 700,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              border: '1px solid #e0e0e0'
            }}
          >
            {/* Question Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000' }}>
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </Typography>
              <Chip label={`${currentQuestion.mark} marks`} size="small" variant="outlined" />
            </Box>

            {/* Question Title */}
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', lineHeight: 1.4, color: '#000' }}>
              {currentQuestion.questionTitle}
            </Typography>

            {/* Timer */}
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <CountdownCircleTimer
                  key={timerKey}
                  isPlaying={quizStarted && !quizCompleted}
                  duration={currentQuestion.questionTime}
                  colors={['#000000', '#666666', '#999999']}
                  colorsTime={[
                    currentQuestion.questionTime,
                    Math.floor(currentQuestion.questionTime * 0.5),
                    Math.floor(currentQuestion.questionTime * 0.2)
                  ]}
                  size={100}
                  strokeWidth={8}
                  onComplete={handleTimerComplete}
                  trailColor="rgba(0, 0, 0, 0.1)"
                >
                  {({ remainingTime }) => (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#000' }}>
                        {formatTime(remainingTime)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        Remaining
                      </Typography>
                    </Box>
                  )}
                </CountdownCircleTimer>
              </Box>
            </Box>

            {/* Question Content based on type */}
            {currentQuestion.questionType === 'radio' && (
              <FormControl component="fieldset" fullWidth>
                <RadioGroup value={userAnswers[currentQuestion.id] || ''} onChange={(e) => handleAnswerSelect(e.target.value, 'radio')}>
                  {currentQuestion.options.map((option, index) => (
                    <Card
                      key={index}
                      sx={{
                        mb: 1.5,
                        p: 2,
                        border: userAnswers[currentQuestion.id] === option ? '1px solid #000' : '1px solid #e0e0e0',
                        bgcolor: userAnswers[currentQuestion.id] === option ? 'rgba(0, 0, 0, 0.04)' : '#fff'
                      }}
                    >
                      <FormControlLabel value={option} control={<Radio />} label={<Typography variant="body1">{option}</Typography>} />
                    </Card>
                  ))}
                </RadioGroup>
              </FormControl>
            )}

            {currentQuestion.questionType === 'checkbox' && (
              <FormGroup>
                {currentQuestion.options.map((option, index) => (
                  <Card
                    key={index}
                    sx={{
                      mb: 1.5,
                      p: 2,
                      border: (userAnswers[currentQuestion.id] || []).includes(option) ? '1px solid #000' : '1px solid #e0e0e0',
                      bgcolor: (userAnswers[currentQuestion.id] || []).includes(option) ? 'rgba(0, 0, 0, 0.04)' : '#fff'
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={(userAnswers[currentQuestion.id] || []).includes(option)}
                          onChange={() => handleAnswerSelect(option, 'checkbox')}
                        />
                      }
                      label={<Typography variant="body1">{option}</Typography>}
                    />
                  </Card>
                ))}
              </FormGroup>
            )}

            {currentQuestion.questionType === 'input' && (
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your answer here..."
                value={userAnswers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerSelect(e.target.value, 'input')}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1rem'
                  }
                }}
              />
            )}

            {/* Navigation Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, pt: 2, borderTop: '1px solid #e0e0e0' }}>
              <Button
                variant="contained"
                onClick={handleNextQuestion}
                disabled={
                  (currentQuestion.questionType === 'radio' && !userAnswers[currentQuestion.id]) ||
                  (currentQuestion.questionType === 'checkbox' &&
                    (!userAnswers[currentQuestion.id] || userAnswers[currentQuestion.id].length === 0)) ||
                  (currentQuestion.questionType === 'input' && !userAnswers[currentQuestion.id])
                }
                sx={{
                  px: 4,
                  py: 1,
                  backgroundColor: '#000',
                  '&:hover': {
                    backgroundColor: '#333'
                  }
                }}
              >
                {currentQuestionIndex === ALL_DUMMY_QUESTIONS.length - 1 ? 'Finish Quiz' : 'Next Question →'}
              </Button>
            </Box>
          </Card>
        </Box>
      </Fade>
    );
  };

  const renderResults = () => {
    let result;

    if (score >= totalMarks * 0.8) {
      result = 'Excellent! Outstanding performance!';
    } else if (score >= totalMarks * 0.6) {
      result = 'Congratulations! You passed!';
    } else {
      result = 'Keep learning! Better luck next time!';
    }

    return (
      <Zoom in={showResults} timeout={500}>
        <Box ref={resultsRef} sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Card
            sx={{
              p: 3,
              width: { xs: '95%', sm: '85%', md: '70%' },
              maxWidth: 700,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              border: '1px solid #e0e0e0'
            }}
          >
            <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Quiz Results
            </Typography>

            {/* Score Summary */}
            <Box
              sx={{
                textAlign: 'center',
                mb: 3,
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                bgcolor: '#fafafa'
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: '#000' }}>
                {score}/{totalMarks}
              </Typography>

              <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold' }}>
                {result}
              </Typography>

              <Typography variant="body1" sx={{ mb: 1 }}>
                Percentage: <strong>{((score / totalMarks) * 100).toFixed(1)}%</strong>
              </Typography>
            </Box>

            {/* Quick Stats */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'row', border: '1px solid #e0e0e0', p: 1, borderRadius: 1 }}>
                <CheckCircleIcon sx={{ color: 'success.main', mr: 1, fontSize: 18, mt: 0.3 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Correct :
                </Typography>
                <Typography variant="body1"> {quizSummary.filter((q) => q.isCorrect).length}</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'row', border: '1px solid #e0e0e0', p: 1, borderRadius: 1 }}>
                <CancelIcon sx={{ color: 'error.main', mr: 1, fontSize: 18, mt: 0.3 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Wrong :
                </Typography>
                <Typography variant="body1"> {quizSummary.filter((q) => !q.isCorrect).length}</Typography>
              </Box>
            </Box>

            {/* Detailed Results */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Question Results:
            </Typography>
            <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
              {quizSummary.map((item, index) => (
                <Card
                  key={index}
                  sx={{
                    mb: 1.5,
                    p: 2,
                    borderLeft: `3px solid ${item.isCorrect ? 'green' : 'red'}`,
                    bgcolor: item.isCorrect ? '#fafafa' : '#fff'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {item.isCorrect ? (
                      <CheckCircleIcon sx={{ color: 'success.main', mr: 1, fontSize: 18 }} />
                    ) : (
                      <CancelIcon sx={{ color: 'error.main', mr: 1, fontSize: 18 }} />
                    )}
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                      Q{index + 1}: {item.questionTitle.length > 40 ? `${item.questionTitle.substring(0, 40)}...` : item.questionTitle}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      {item.earnedMarks}/{item.maxMarks}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, fontSize: '0.85rem' }}>
                    <Typography variant="body2">
                      <strong>Your Answer:</strong>{' '}
                      {Array.isArray(item.userAnswer)
                        ? item.userAnswer.length > 0
                          ? item.userAnswer.join(', ')
                          : 'Not answered'
                        : item.userAnswer || 'Not answered'}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Correct:</strong> {Array.isArray(item.correctAnswer) ? item.correctAnswer.join(', ') : item.correctAnswer}
                    </Typography>
                  </Box>
                </Card>
              ))}
            </Box>
          </Card>
        </Box>
      </Zoom>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: { xs: 2, sm: 3, md: 4 }
      }}
    >
      {/* Header */}
      <Zoom in timeout={500}>
        <Box
          sx={{
            textAlign: 'center',
            mb: 4,
            width: '100%',
            maxWidth: 800
          }}
        >
          <EmojiEventsIcon sx={{ fontSize: 60, mb: 2, color: '#000' }} />
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              mb: 1,
              color: '#000'
            }}
          >
            React Fundamentals Quiz
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#666' }}>
            Test your React knowledge with {totalQuestions} challenging questions
          </Typography>
        </Box>
      </Zoom>

      {/* Progress Bar */}
      {quizStarted && !quizCompleted && (
        <Fade in timeout={300}>
          <Box
            sx={{
              mb: 3,
              width: '100%',
              maxWidth: 600
            }}
          >
            <LinearProgress
              variant="determinate"
              value={((currentQuestionIndex + 1) / totalQuestions) * 100}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: '#f0f0f0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#000'
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000' }}>
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000' }}>
                Score: {score}
              </Typography>
            </Box>
          </Box>
        </Fade>
      )}

      {/* Main Content */}
      {!quizStarted ? (
        <Zoom in timeout={500}>
          <Card
            sx={{
              mt: 4,
              p: { xs: 3, sm: 4 },
              width: '100%',
              maxWidth: 700,
              boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
              border: '1px solid #e0e0e0',
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Main Title */}
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{
                  color: '#000',
                  mb: 3,
                  textAlign: 'center',
                  width: '100%'
                }}
              >
                Ready to Test Your React Skills?
              </Typography>

              {/* Quiz Details Section */}
              <Box sx={{ width: '100%', mb: 4 }}>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{
                    color: '#000',
                    mb: 3,
                    textAlign: 'center',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 60,
                      height: 2,
                      backgroundColor: '#000'
                    }
                  }}
                >
                  Quiz Details
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 3,
                    maxWidth: 600,
                    margin: '0 auto'
                  }}
                >
                  {/* Column 1 */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: '#000'
                        }}
                      />
                      <Typography sx={{ color: '#000', fontSize: '1rem' }}>{totalQuestions} Questions</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: '#000'
                        }}
                      />
                      <Typography sx={{ color: '#000', fontSize: '1rem' }}>Total Marks: {totalMarks}</Typography>
                    </Box>
                  </Box>

                  {/* Column 2 */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: '#000'
                        }}
                      />
                      <Typography sx={{ color: '#000', fontSize: '1rem' }}>Passing: {Math.floor(totalMarks * 0.6)} (60%)</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: '#000'
                        }}
                      />
                      <Typography sx={{ color: '#000', fontSize: '1rem' }}>Timed Questions</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Start Button */}
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrowIcon />}
                onClick={startQuiz}
                sx={{
                  px: 6,
                  py: 1.5,
                  minWidth: 200,
                  fontWeight: 600,
                  fontSize: '1rem',
                  backgroundColor: '#000',
                  borderRadius: 1,
                  textTransform: 'none',
                  letterSpacing: '0.5px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#333',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }
                }}
              >
                Start Quiz
              </Button>
            </Box>
          </Card>
        </Zoom>
      ) : quizCompleted && showResults ? (
        renderResults()
      ) : (
        renderQuestion()
      )}
    </Box>
  );
};

export default QuizPage;
