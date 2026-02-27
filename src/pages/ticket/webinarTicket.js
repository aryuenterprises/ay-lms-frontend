import { useState, useRef } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Stack, Divider, Chip, MenuItem } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_PATH_BASE_URL } from 'config';

/* ---------------- API ---------------- */

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) throw new Error(data?.detail || 'Something went wrong');
  return data;
};

const getTicket = async (mobile) => {
  const res = await fetch(`${APP_PATH_BASE_URL}/api/webinar/tickets/?mobile=${mobile}`);
  return handleResponse(res);
};

const createTicket = async (data) => {
  const res = await fetch(`${APP_PATH_BASE_URL}/api/webinar/tickets/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

const sendReply = async (ticketId, message) => {
  const res = await fetch(`${APP_PATH_BASE_URL}/api/webinar/tickets/${ticketId}/reply/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  return handleResponse(res);
};

/* ---------------- BUBBLE ---------------- */

const Bubble = ({ size, top, left, right, bottom, delay }) => (
  <Box
    component={motion.div}
    animate={{ y: [0, -30, 0], opacity: [0.5, 0.8, 0.5] }}
    transition={{ duration: 20, repeat: Infinity, delay }}
    sx={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'rgba(255, 120, 140, 0.25)',
      top,
      left,
      right,
      bottom,
      filter: 'blur(60px)',
      zIndex: 0
    }}
  />
);

/* ---------------- COMPONENT ---------------- */

const WebinarTicketPage = () => {
  const [mobile, setMobile] = useState('');
  const [ticket, setTicket] = useState(null);
  const [step, setStep] = useState('mobile');
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [error, setError] = useState(null);
  const chatRef = useRef(null);

  const scrollToBottom = () => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  };
  const [form, setForm] = useState({
    subject: '',
    message: '',
    priority: 'Low'
  });
  /* ---------- MOBILE CHECK ---------- */

  const handleMobile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTicket(mobile);
      if (res.data) {
        setTicket(res.data);
        setStep('chat');
        setTimeout(scrollToBottom, 200);
      } else {
        setStep('create');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- CREATE ---------- */

  const handleCreate = async (form) => {
    setLoading(true);
    try {
      await createTicket({
        mobile,
        subject: form.subject,
        message: form.message,
        priority: form.priority
      });
      const refreshed = await getTicket(mobile);
      setTicket(refreshed.data);
      setStep('chat');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- REPLY ---------- */

  const handleReply = async () => {
    if (!reply.trim()) return;
    await sendReply(ticket.ticket_id, reply);
    setReply('');
    const refreshed = await getTicket(mobile);
    setTicket(refreshed.data);
    setTimeout(scrollToBottom, 200);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#fdf4f4',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* ROSE BLOBS */}
      <Bubble size={300} top="-80px" left="-80px" delay={0} />
      <Bubble size={420} top="20%" right="-120px" delay={2} />
      <Bubble size={260} bottom="-100px" left="20%" delay={4} />

      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          alignItems: 'center',
          px: { xs: 3, md: 8 },
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* LEFT CONTENT */}
        <Box sx={{ pr: { md: 6 }, mb: { xs: 6, md: 0 } }}>
          <Typography variant="overline" sx={{ fontWeight: 900, color: '#b71c1c' }}>
            ARYU ACADEMY
          </Typography>

          <Typography
            sx={{
              mt: 2,
              fontSize: { xs: 34, md: 42 },
              fontWeight: 800,
              lineHeight: 1.2,
              color: '#1c1c1c'
            }}
          >
            Student Support
            <br />
            <Box component="span" sx={{ color: '#b71c1c' }}>
              Webinar Help Desk
            </Box>
          </Typography>

          <Typography sx={{ mt: 3, maxWidth: 480, color: '#555' }}>
            Need assistance regarding your webinar? Connect with our support team and get quick resolutions within 24 hours.
          </Typography>

          <Stack spacing={1.2} sx={{ mt: 4 }}>
            <Typography>✔ Fast response</Typography>
            <Typography>✔ Dedicated support team</Typography>
            <Typography>✔ Secure communication</Typography>
          </Stack>
        </Box>

        {/* RIGHT CARD */}
        <Card
          elevation={12}
          sx={{
            maxWidth: 600,
            borderRadius: 4,
            mx: 'auto',
            backdropFilter: 'blur(6px)'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <AnimatePresence mode="wait">
              {step === 'mobile' && (
                <motion.div key="mobile" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Typography variant="h6" fontWeight={700} mb={2}>
                    Enter Mobile Number
                  </Typography>
                  <TextField fullWidth label="Registered Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                  <Button variant="contained" sx={{ mt: 3 }} fullWidth onClick={handleMobile} disabled={loading}>
                    {loading ? 'Checking...' : 'Continue'}
                  </Button>
                </motion.div>
              )}

              {step === 'create' && (
                <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Typography variant="h6" fontWeight={700} mb={2}>
                    Create Ticket
                  </Typography>

                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Subject"
                      value={form.subject}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          subject: e.target.value
                        }))
                      }
                    />

                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Message"
                      value={form.message}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          message: e.target.value
                        }))
                      }
                    />

                    <TextField
                      select
                      fullWidth
                      label="Priority"
                      value={form.priority}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          priority: e.target.value
                        }))
                      }
                    >
                      <MenuItem value="Low">Low</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="High">High</MenuItem>
                    </TextField>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleCreate(form)}
                      disabled={loading || !form.subject || !form.message}
                    >
                      {loading ? 'Creating...' : 'Create Ticket'}
                    </Button>
                  </Stack>
                </motion.div>
              )}

              {step === 'chat' && ticket && (
                <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontWeight={700}>{ticket.subject}</Typography>
                    <Chip label={ticket.status} sx={{ bgcolor: '#fdecea', color: '#b71c1c' }} />
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Box ref={chatRef} sx={{ height: 300, overflowY: 'auto', mb: 2 }}>
                    {/* Initial Ticket Message (Always Student) */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        mb: 1
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: '#b71c1c',
                          color: '#fff',
                          px: 2,
                          py: 1.2,
                          borderRadius: 2,
                          maxWidth: '70%'
                        }}
                      >
                        <Typography variant="body2">{ticket.message}</Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.7,
                            display: 'block',
                            mt: 0.5
                          }}
                        >
                          {ticket.created_at}
                        </Typography>
                      </Box>
                    </Box>

                    {ticket.replies?.map((r) => {
                      const isStudent = r.sender_type === 'student';

                      return (
                        <Box
                          key={r.reply_id}
                          sx={{
                            display: 'flex',
                            justifyContent: isStudent ? 'flex-end' : 'flex-start',
                            mb: 1
                          }}
                        >
                          <Box
                            sx={{
                              bgcolor: isStudent ? '#b71c1c' : '#f1f1f1',
                              color: isStudent ? '#fff' : '#000',
                              px: 2,
                              py: 1.2,
                              borderRadius: 2,
                              maxWidth: '70%',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                            }}
                          >
                            <Typography variant="body2">{r.message}</Typography>

                            <Typography
                              variant="caption"
                              sx={{
                                opacity: 0.7,
                                display: 'block',
                                mt: 0.5,
                                textAlign: 'right'
                              }}
                            >
                              {r.created_at}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>

                  <Stack direction="row" spacing={2}>
                    <TextField fullWidth placeholder="Type reply..." value={reply} onChange={(e) => setReply(e.target.value)} />
                    <Button variant="contained" onClick={handleReply}>
                      Send
                    </Button>
                  </Stack>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default WebinarTicketPage;
