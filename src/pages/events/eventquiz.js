import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Checkbox,
  TextField,
  FormGroup,
  Fade,
  Chip,
  Divider
} from '@mui/material';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';

const QuizPage = () => {
  const wsRef = useRef(null);
  const { id: roomId } = useParams();

  const [question, setQuestion] = useState(null);
  const [canAnswer, setCanAnswer] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [answerResult, setAnswerResult] = useState(null);
  const [error, setError] = useState(null);
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = window.location.host;

  useEffect(() => {
    if (!roomId) return;

    const token = localStorage.getItem('quiz_token');
    if (!token) {
      setError('Session expired. Please rejoin the quiz.');
      return;
    }

    // prevent duplicate socket
    if (wsRef.current) return;

    const ws = new WebSocket(
      `${protocol}://${host}/ws/room/${roomId}/?role=participant&token=${token}`
    );

    wsRef.current = ws;

    ws.onopen = () => {
      console.log(' Quiz WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'error') {
        setError(data.message);
        return;
      }

      // Preview (admin sent, not started)
      if (data.type === 'question_preview') {
        setQuestion(data);
        setRemainingTime(data.timer);
        setTimerKey((k) => k + 1);
        setCanAnswer(false);
        setAnswerLocked(true);
        setAnswer(null);
        setAnswerResult(null);
        return;
      }

      // Started
      if (data.type === 'question_started') {
        setRemainingTime(
          Math.max(0, Math.floor(data.ends_at - Date.now() / 1000))
        );
        setTimerKey((k) => k + 1);
        setCanAnswer(true);
        setAnswerLocked(false);
        return;
      }

      // Resume (refresh / late join)
      if (data.type === 'resume_question') {
        setQuestion(data);
        setRemainingTime(data.timer_remaining);
        setTimerKey((k) => k + 1);
        setCanAnswer(true);
        setAnswerLocked(false);
        setAnswer(null);
        setAnswerResult(null);
        return;
      }

      // Already answered
      if (data.type === 'answer_status') {
        setAnswerLocked(data.already_answered);
        setCanAnswer(!data.already_answered);
        return;
      }

      // Result
      if (data.type === 'answer_result') {
        setAnswerResult(data);
        setAnswerLocked(true);
        setCanAnswer(false);
      }
    };

    ws.onerror = () => {
      setError('WebSocket connection failed');
    };

    ws.onclose = () => {
      wsRef.current = null;
      console.log('Quiz WebSocket closed');
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [roomId]);

  /* ---------------- Submit Answer ---------------- */
  const submitAnswer = (value) => {
    if (!wsRef.current || !question || answerLocked) return;

    setAnswer(value);
    setAnswerLocked(true);

    wsRef.current.send(
      JSON.stringify({
        type: 'submit_answer',
        question_id: question.id,
        response: value
      })
    );
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  /* ---------------- UI STATES ---------------- */
  if (error) {
    return (
      <Box sx={{ mt: 10, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!question) {
    return (
      <Box sx={{ mt: 10, textAlign: 'center' }}>
        <Typography>Waiting for host to start the quiz…</Typography>
      </Box>
    );
  }

  return (
    <Fade in>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Card sx={{ p: 3, width: '95%', maxWidth: 720 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Live Question</Typography>
            <Chip label={question.question_type.toUpperCase()} />
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Question Text */}
          <Typography variant="h6" sx={{ mb: 3 }}>
            {question.text}
          </Typography>

          {/* Timer */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <CountdownCircleTimer
              key={timerKey}
              isPlaying={canAnswer}
              duration={remainingTime}
              colors={['#701616']}
              onComplete={() => ({ shouldRepeat: false })}
            >
              {({ remainingTime }) => <Typography variant="h5">{formatTime(remainingTime)}</Typography>}
            </CountdownCircleTimer>
          </Box>

          {/* ---------------- QUESTION TYPES ---------------- */}

          {/* RADIO / MCQ */}
          {(question.question_type === 'radio' || question.question_type === 'mcq') && (
            <FormControl fullWidth>
              <RadioGroup value={answer || ''} onChange={(e) => submitAnswer(e.target.value)}>
                {question.config?.choices?.map((opt, i) => (
                  <FormControlLabel key={i} value={opt} control={<Radio />} label={opt} disabled={!canAnswer} />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {/* CHECKBOX */}
          {question.question_type === 'checkbox' && (
            <FormGroup>
              {question.config?.choices?.map((opt, i) => {
                const selected = Array.isArray(answer) && answer.includes(opt);
                return (
                  <FormControlLabel
                    key={i}
                    control={
                      <Checkbox
                        checked={selected}
                        disabled={!canAnswer}
                        onChange={() => {
                          const prev = answer || [];
                          const updated = selected ? prev.filter((x) => x !== opt) : [...prev, opt];
                          submitAnswer(updated);
                        }}
                      />
                    }
                    label={opt}
                  />
                );
              })}
            </FormGroup>
          )}

          {/* TRUE / FALSE */}
          {question.question_type === 'tf' && (
            <FormControl fullWidth>
              <RadioGroup value={answer ?? ''} onChange={(e) => submitAnswer(e.target.value === 'true')}>
                <FormControlLabel value="true" control={<Radio />} label="True" />
                <FormControlLabel value="false" control={<Radio />} label="False" />
              </RadioGroup>
            </FormControl>
          )}

          {/* TEXT */}
          {question.question_type === 'text' && (
            <TextField fullWidth placeholder="Type your answer" disabled={!canAnswer} onBlur={(e) => submitAnswer(e.target.value)} />
          )}

          {/* MATCH */}
          {question.question_type === 'match' && (
            <Box>
              {Object.entries(question.config?.pairs || {}).map(([left, right], i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1
                  }}
                >
                  <Typography>{left}</Typography>
                  <Typography color="text.secondary">→ {right}</Typography>
                </Box>
              ))}
              <Typography sx={{ mt: 2 }} color="text.secondary">
                Matching questions are auto-evaluated.
              </Typography>
            </Box>
          )}

          {/* ---------------- ANSWER RESULT ---------------- */}
          {answerResult && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography color={answerResult.is_correct ? 'success.main' : 'error.main'}>
                {answerResult.is_correct ? 'Correct!' : 'Wrong'}
              </Typography>
              <Typography variant="body2">Score awarded: {answerResult.score_awarded}</Typography>
            </Box>
          )}
        </Card>
      </Box>
    </Fade>
  );
};

export default QuizPage;
