import { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Stepper, Step, StepButton, MenuItem, Stack, Divider } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

/* ------------------ CONSTANTS ------------------ */

const steps = ['Personal Details', 'Professional Details', 'Bank Details'];

const indianStates = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Puducherry'
];

const MotionBlob = motion(Box);
const MotionStack = motion(Stack);
const Bubble = ({ size, top, left, right, bottom, delay }) => (
  <Box
    component={motion.div}
    animate={{
      y: [0, -30, 0],
      opacity: [0.6, 0.9, 0.6]
    }}
    transition={{
      duration: 18,
      repeat: Infinity,
      delay
    }}
    sx={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'rgba(255, 180, 180, 0.35)', // rose tone
      top,
      left,
      right,
      bottom,
      zIndex: 0
    }}
  />
);
/* ------------------ COMPONENT ------------------ */

const TrainerSignupPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    email: '',
    contact_no: '',
    gender: '',
    city: '',
    state: '',
    specialization: '',
    experience: '',
    working_hours: '',
    linkedin: '',
    bio: '',
    account_name: '',
    bank_name: '',
    account_no: '',
    ifsc: ''
  });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const next = () => setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setActiveStep((s) => Math.max(s - 1, 0));
  const goToStep = (s) => setActiveStep(s);

  const handleSubmit = () => {
    console.log('FINAL PAYLOAD:', form);

    // simulate success
    setTimeout(() => {
      setSubmitted(true);
    }, 400);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: '#fdf4f4'
      }}
    >
      <Bubble size={420} top="20%" right="-120px" delay={2} />
      <Bubble size={220} bottom="-100px" left="30%" delay={4} />
      <Bubble size={180} bottom="10%" right="15%" delay={6} />
      <Bubble size={180} bottom="30%" right="40%" delay={6} />
      <Bubble size={100} top="60%" bottom="50%" right="48%" delay={6} />
      <Box sx={{ position: 'relative', zIndex: 2 }}></Box>
      {/* ================= ROSE BLOBS BACKGROUND ================= */}
      <Bubble size={260} top="-80px" left="-80px" delay={0} />
      <MotionBlob
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
        sx={{
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'rgba(255, 120, 140, 0.25)',
          top: '-120px',
          right: '-120px',
          filter: 'blur(60px)'
        }}
      />

      <MotionBlob
        animate={{ y: [0, 40, 0] }}
        transition={{ duration: 25, repeat: Infinity }}
        sx={{
          position: 'absolute',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'rgba(255, 150, 170, 0.2)',
          bottom: '-100px',
          left: '-100px',
          filter: 'blur(60px)'
        }}
      />

      <MotionBlob
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity }}
        sx={{
          position: 'absolute',
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'rgba(255, 180, 190, 0.18)',
          top: '30%',
          left: '40%',
          filter: 'blur(50px)'
        }}
      />

      {/* ================= MAIN LAYOUT ================= */}

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
        {/* ================= LEFT CONTENT ================= */}

        <Box sx={{ pr: { md: 6 }, mb: { xs: 6, md: 0 }, ml: { xs: 0, md: 15 } }}>
          {/* Brand */}
          <Typography variant="overline" sx={{ letterSpacing: 1.2, fontWeight: 900, color: '#b71c1c' }}>
            ARYU ACADEMY
          </Typography>

          {/* Main Heading */}
          <Typography
            sx={{
              mt: 2,
              fontSize: { xs: 36, md: 44 },
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#1c1c1c'
            }}
          >
            Share Your Expertise with{' '}
            <Box component="span" sx={{ color: '#b71c1c' }}>
              Aryu Academy
            </Box>
            <br />
            as a Certified Trainer
          </Typography>

          {/* Decorative underline */}
          <Box sx={{ mt: 1.5, ml: 1.5 }}>
            <svg width="260" height="28" viewBox="0 0 260 28" fill="none" style={{ overflow: 'visible' }}>
              <motion.path
                d="
                    M6 30
                    C 50 9, 150 10, 130 30
                    C 80 12, 215 5, 280 15
                    "
                stroke="#b71c1c"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 1.2,
                  ease: 'easeOut'
                }}
              />
            </svg>
          </Box>

          {/* Description */}
          <Typography
            sx={{
              maxWidth: 480,
              fontSize: 16,
              color: '#555',
              lineHeight: 1.7,
              mt: 3
            }}
          >
            Join Aryu Academy’s certified trainer network and teach learners across India through live sessions, workshops, and structured
            programs.
          </Typography>

          {/* Soft feature text (no icons, clean) */}
          <Stack spacing={1.2} sx={{ mt: 4 }}>
            <Typography sx={{ color: '#333' }}>✔ Paid teaching opportunities</Typography>
            <Typography sx={{ color: '#333' }}>✔ Flexible schedules</Typography>
            <Typography sx={{ color: '#333' }}>✔ Dedicated trainer dashboard</Typography>
            <Typography sx={{ color: '#333' }}>✔ Nationwide learner reach</Typography>
          </Stack>
        </Box>

        {/* ================= RIGHT FORM CARD ================= */}

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
            <Stack spacing={1} mb={3}>
              <Typography variant="h6" fontWeight={700}>
                Trainer Registration
              </Typography>
              <Typography color="text.secondary">Complete the steps below to apply.</Typography>
            </Stack>

            {/* Stepper */}
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepButton onClick={() => goToStep(index)}>{label}</StepButton>
                </Step>
              ))}
            </Stepper>

            <AnimatePresence mode="wait">
              <MotionStack
                key={activeStep}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                spacing={2}
              >
                {/* STEP 1 */}
                {activeStep === 0 && (
                  <>
                    <TextField label="Full Name" name="full_name" fullWidth value={form.full_name} onChange={handleChange} />
                    <TextField label="Username" name="username" fullWidth value={form.username} onChange={handleChange} />
                    <TextField label="Email" name="email" fullWidth value={form.email} onChange={handleChange} />
                    <TextField label="Contact Number" name="contact_no" fullWidth value={form.contact_no} onChange={handleChange} />
                    <TextField select label="Gender" name="gender" fullWidth value={form.gender} onChange={handleChange}>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </TextField>
                    <TextField label="City" name="city" fullWidth value={form.city} onChange={handleChange} />
                    <TextField select label="State" name="state" fullWidth value={form.state} onChange={handleChange}>
                      {indianStates.map((state) => (
                        <MenuItem key={state} value={state}>
                          {state}
                        </MenuItem>
                      ))}
                    </TextField>
                  </>
                )}

                {/* STEP 2 */}
                {activeStep === 1 && (
                  <>
                    <TextField label="Specialization" name="specialization" fullWidth value={form.specialization} onChange={handleChange} />
                    <TextField select label="Experience" name="experience" fullWidth value={form.experience} onChange={handleChange}>
                      <MenuItem value="0-1">0–1 Years</MenuItem>
                      <MenuItem value="1-3">1–3 Years</MenuItem>
                      <MenuItem value="3-5">3–5 Years</MenuItem>
                      <MenuItem value="5+">5+ Years</MenuItem>
                    </TextField>
                    <TextField label="Working Hours" name="working_hours" fullWidth value={form.working_hours} onChange={handleChange} />
                    <TextField label="LinkedIn Profile" name="linkedin" fullWidth value={form.linkedin} onChange={handleChange} />
                    <TextField label="Short Bio" name="bio" multiline rows={3} fullWidth value={form.bio} onChange={handleChange} />
                  </>
                )}

                {/* STEP 3 */}
                {activeStep === 2 && (
                  <>
                    <TextField
                      label="Account Holder Name"
                      name="account_name"
                      fullWidth
                      value={form.account_name}
                      onChange={handleChange}
                    />
                    <TextField label="Bank Name" name="bank_name" fullWidth value={form.bank_name} onChange={handleChange} />
                    <TextField label="Account Number" name="account_no" fullWidth value={form.account_no} onChange={handleChange} />
                    <TextField label="IFSC Code" name="ifsc" fullWidth value={form.ifsc} onChange={handleChange} />
                  </>
                )}
              </MotionStack>
            </AnimatePresence>

            <Divider sx={{ my: 3 }} />

            <Stack direction="row" justifyContent="space-between">
              <Button variant="outlined" disabled={activeStep === 0} onClick={back}>
                Back
              </Button>

              {activeStep < steps.length - 1 ? (
                <Button variant="contained" onClick={next}>
                  Continue
                </Button>
              ) : (
                <Button variant="contained" onClick={handleSubmit}>
                  Submit
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
        <AnimatePresence>
          {submitted && (
            <Box
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              sx={{
                position: 'fixed',
                inset: 0,
                bgcolor: 'rgba(0,0,0,0.35)',
                zIndex: 1500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Box
                component={motion.div}
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                sx={{
                  width: 420,
                  bgcolor: '#fff',
                  borderRadius: 4,
                  p: 4,
                  boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
                  textAlign: 'center'
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2,
                    borderRadius: '50%',
                    bgcolor: '#e8f5e9',
                    color: '#2e7d32',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                    fontWeight: 700
                  }}
                >
                  ✓
                </Box>

                <Typography variant="h6" fontWeight={700}>
                  Application Submitted
                </Typography>

                <Typography sx={{ mt: 1.5, color: 'text.secondary', fontSize: 15 }}>
                  Thank you for applying as a trainer at Aryu Academy. Our team will review your application and get back to you within{' '}
                  <b>24–48 hours</b>.
                </Typography>

                <Button variant="contained" sx={{ mt: 3, px: 4 }} onClick={() => setSubmitted(false)}>
                  Done
                </Button>
              </Box>
            </Box>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default TrainerSignupPage;
