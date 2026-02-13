import { Box, Container, Typography, Stack } from '@mui/material';

const TermsAndConditions = () => {
  return (
    <Container sx={{ pt: 10, pb: 5, marginLeft: 10, marginRight: 10, width: '100%' }}>
      <Box>
        <Typography variant="h1" align="center" gutterBottom fontWeight="bold">
          Terms &{' '}
          <Typography variant="h1" component="span" color="red" fontWeight="bold">
            conditions
          </Typography>
        </Typography>
        <Box
          sx={{
            maxWidth: '100%'
          }}
        >
          <Typography variant="body1" sx={{ mb: 3 }}>
            Welcome to <strong>Aryu Academy</strong>! We thank you for choosing us as your learning partner for professional software
            training in Chennai. Our mission is to empower students with career-oriented training, life skills, and placement assistance to
            prepare them for the competitive job market.
          </Typography>

          <Typography variant="body1" sx={{ mb: 3 }}>
            By enrolling in our courses, you agree to abide by the following terms and conditions:
          </Typography>

          <Stack spacing={3}>
            <Box>
              <Typography variant="h3">Placement Assistance</Typography>
              <Typography variant="body1">
                Aryu Academy provides placement assistance but does not guarantee job placement. Placement services include resume building,
                portfolio creation, mock interview preparation, and access to exclusive job opportunities.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h3">Refund & Cancellation Policy</Typography>
              <Typography variant="body1">
                For detailed information, please refer to our refund policy. Refund requests must be submitted directly.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h3">Student Behavior</Typography>
              <Typography variant="body1">
                Students are expected to maintain professional behavior and follow the institute’s rules. Disruptive behavior in classes may
                lead to disciplinary action, including termination of the course without a refund.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h3">Punctuality</Typography>
              <Typography variant="body1">
                Students must attend classes on time. Persistent lateness may result in a warning from the trainer.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h3">Use of Facilities</Typography>
              <Typography variant="body1">
                Students are encouraged to make the best use of the lab facilities. Any external devices or software installations require
                prior approval from the institute’s staff. Aryu Academy is not responsible for the loss or damage of personal belongings on
                its premises.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h3">Course Attendance</Typography>
              <Typography variant="body1">
                Regular attendance is required to complete the course successfully. In case of unavoidable circumstances, such as staff
                issues, postponed classes will be rescheduled.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h3">Data Protection</Typography>
              <Typography variant="body1">
                Aryu Academy ensures the confidentiality of your personal data. Information collected during enrollment will be used solely
                for educational and promotional purposes.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h3">Chennai-Specific Policy</Typography>
              <Typography variant="body1">
                These terms and conditions are subject to Indian legal jurisdiction. Any disputes shall be subject to the exclusive
                jurisdiction of the courts located in Chennai, Tamil Nadu.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h3">Public Holidays</Typography>
              <Typography variant="body1">
                Classes will not be conducted on public holidays unless otherwise informed in advance for special cases.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h3">Resume and Portfolio Building</Typography>
              <Typography variant="body1">
                Aryu Academy assists students in developing professional resumes and portfolios to enhance employability.
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
};

export default TermsAndConditions;
