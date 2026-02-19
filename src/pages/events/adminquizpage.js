import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Button, Card, Chip, LinearProgress, Fade } from '@mui/material';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { useParams } from 'react-router-dom';
import { APP_PATH_BASE_URL } from 'config';

const AdminQuizPage = () => {
  const { roomId } = useParams();
  const wsRef = useRef(null);
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [wsError, setWsError] = useState(null);
  const [wsReady, setWsReady] = useState(false);

  const currentQuestion = questions[currentIndex];
  const sendQuestion = (question) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: 'send_question',
        question_id: question.id
      })
    );
  };

  /* ---------------- Fetch Questions ---------------- */
  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await fetch(`${APP_PATH_BASE_URL}api/live-quiz/questions/?room=${roomId}`);
      const data = await res.json();
      setQuestions(data.data || data);
    };

    fetchQuestions();
  }, [roomId]);

  /* ---------------- WebSocket ---------------- */
  useEffect(() => {
    const token = getCookie('token');
    if (!token) {
      console.error('Token not found in cookies');
      return;
    }
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;

    const ws = new WebSocket(
      `${protocol}://${host}/ws/room/${roomId}/?role=admin&token=${token}`
    );

    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Admin WebSocket connected');
      setWsReady(true);
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setWsReady(false);
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      wsRef.current = null;
      setWsReady(false);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'error') {
        setWsError(data.message);
        setIsRunning(false);
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
      setWsReady(false);
    };
  }, [roomId]);

  useEffect(() => {
    if (questions.length > 0 && wsRef.current) {
      sendQuestion(questions[0]); // preview only
    }
  }, [questions]);

  /* ---------------- Start Question ---------------- */
  const handleStart = () => {
    if (!currentQuestion) return;

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not ready yet');
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: 'start_question'
      })
    );

    setIsRunning(true);
    setTimerKey((prev) => prev + 1);
  };

  /* ---------------- Next Question ---------------- */
  const handleNext = () => {
    if (currentIndex >= questions.length - 1) return;

    const nextIndex = currentIndex + 1;
    const nextQuestion = questions[nextIndex];

    // Stop timer
    setIsRunning(false);

    // Move UI
    setCurrentIndex(nextIndex);

    // SEND question preview ONLY
    setTimeout(() => {
      sendQuestion(nextQuestion);
      setTimerKey((prev) => prev + 1);
    }, 100);
  };

  /* ---------------- Format Time ---------------- */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#f4f6f8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 4
      }}
    >
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Admin Live Quiz
      </Typography>

      {/* ---------- ERROR ---------- */}
      {wsError && (
        <Card
          sx={{
            p: 4,
            maxWidth: 600,
            mt: 4,
            textAlign: 'center',
            background: '#fff3f3',
            border: '1px solid #ffcdd2'
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            Quiz Error
          </Typography>

          <Typography color="text.secondary">{wsError}</Typography>
        </Card>
      )}

      {/* ---------- PROGRESS + QUESTION (ONLY WHEN NO ERROR) ---------- */}
      {!wsError && (
        <>
          {/* Progress */}
          <Box sx={{ width: '100%', maxWidth: 600, mb: 5, mt: 10 }}>
            <LinearProgress variant="determinate" value={questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0} />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mt: 1
              }}
            >
              <Typography>
                Question {questions.length ? currentIndex + 1 : 0} of {questions.length}
              </Typography>
            </Box>
          </Box>

          {/* Question Card */}
          {currentQuestion && (
            <Fade in>
              <Card
                sx={{
                  p: 4,
                  width: '100%',
                  maxWidth: 700,
                  boxShadow: 3
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 2
                  }}
                >
                  <Typography variant="h6">Question {currentIndex + 1}</Typography>

                  <Chip label={`${currentQuestion.mark} marks`} />
                </Box>

                {/* Question Text */}
                <Typography variant="h6" sx={{ mb: 3 }}>
                  {currentQuestion.text}
                </Typography>

                {/* Timer */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 3
                  }}
                >
                  <CountdownCircleTimer
                    key={timerKey}
                    isPlaying={isRunning}
                    duration={currentQuestion.timer_seconds}
                    colors={['#000']}
                    size={120}
                    strokeWidth={8}
                    onComplete={() => {
                      setIsRunning(false);
                      return { shouldRepeat: false };
                    }}
                  >
                    {({ remainingTime }) => <Typography variant="h5">{formatTime(remainingTime)}</Typography>}
                  </CountdownCircleTimer>
                </Box>

                {/* Options Preview */}
                <Box sx={{ mb: 3 }}>
                  {currentQuestion.question_type === 'mcq' ||
                  currentQuestion.question_type === 'radio' ||
                  currentQuestion.question_type === 'poll' ? (
                    currentQuestion.config?.choices?.map((opt, index) => (
                      <Box
                        key={index}
                        sx={{
                          border: '1px solid #ddd',
                          p: 1.5,
                          mb: 1,
                          borderRadius: 1
                        }}
                      >
                        {opt}
                      </Box>
                    ))
                  ) : currentQuestion.question_type === 'match' ? (
                    Object.entries(currentQuestion.config?.pairs || {}).map(([left, right], index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          border: '1px solid #ddd',
                          p: 1.5,
                          mb: 1,
                          borderRadius: 1
                        }}
                      >
                        <Typography>{left}</Typography>
                        <Typography>{right}</Typography>
                      </Box>
                    ))
                  ) : currentQuestion.question_type === 'text' ? (
                    <Box
                      sx={{
                        border: '1px dashed #aaa',
                        p: 2,
                        borderRadius: 1,
                        color: '#777'
                      }}
                    >
                      Text Input Question
                    </Box>
                  ) : null}
                </Box>

                {/* Buttons */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 2
                  }}
                >
                  <Button variant="contained" onClick={handleStart} disabled={isRunning || !wsReady}>
                    Start Question
                  </Button>

                  <Button variant="outlined" onClick={handleNext} disabled={currentIndex >= questions.length - 1}>
                    Next Question →
                  </Button>
                </Box>
              </Card>
            </Fade>
          )}
        </>
      )}
    </Box>
  );
};

export default AdminQuizPage;
