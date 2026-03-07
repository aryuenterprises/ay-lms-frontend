import { Box, Container, Typography, Stack } from "@mui/material";

const TermsAndConditions = () => {
  return (
    <Container
      maxWidth="lg"
      sx={{
        pt: { xs: 8, md: 12 },
        pb: { xs: 6, md: 8 }
      }}
    >
      <Box>
        {/* TITLE */}
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{
            fontWeight: "bold",
            fontSize: { xs: 28, sm: 36, md: 48 }
          }}
        >
          Terms &{" "}
          <Typography
            component="span"
            sx={{
              color: "red",
              fontWeight: "bold",
              fontSize: { xs: 28, sm: 36, md: 48 }
            }}
          >
            Conditions
          </Typography>
        </Typography>

        <Box sx={{ maxWidth: 900, mx: "auto" }}>
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              fontSize: { xs: 14, sm: 16 }
            }}
          >
            Welcome to <strong>Aryu Academy</strong>! We thank you for choosing us as your learning partner for professional software training in Chennai. Our mission is to empower students with career-oriented training, life skills, and placement assistance to prepare them for the competitive job market.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 3,
              fontSize: { xs: 14, sm: 16 }
            }}
          >
            By enrolling in our courses, you agree to abide by the following terms and conditions:
          </Typography>

          <Stack spacing={{ xs: 3, md: 4 }}>
            {[
              {
                title: "Placement Assistance",
                text: "Aryu Academy provides placement assistance but does not guarantee job placement. Placement services include resume building, portfolio creation, mock interview preparation, and access to exclusive job opportunities."
              },
              {
                title: "Refund & Cancellation Policy",
                text: "For detailed information, please refer to our refund policy. Refund requests must be submitted directly."
              },
              {
                title: "Student Behavior",
                text: "Students are expected to maintain professional behavior and follow the institute’s rules. Disruptive behavior in classes may lead to disciplinary action."
              },
              {
                title: "Punctuality",
                text: "Students must attend classes on time. Persistent lateness may result in a warning from the trainer."
              },
              {
                title: "Use of Facilities",
                text: "Students are encouraged to make the best use of the lab facilities. Aryu Academy is not responsible for the loss or damage of personal belongings."
              },
              {
                title: "Course Attendance",
                text: "Regular attendance is required to complete the course successfully."
              },
              {
                title: "Data Protection",
                text: "Aryu Academy ensures the confidentiality of your personal data."
              },
              {
                title: "Chennai-Specific Policy",
                text: "Any disputes shall be subject to the exclusive jurisdiction of the courts located in Chennai, Tamil Nadu."
              },
              {
                title: "Public Holidays",
                text: "Classes will not be conducted on public holidays unless otherwise informed."
              },
              {
                title: "Resume and Portfolio Building",
                text: "Aryu Academy assists students in developing professional resumes and portfolios."
              }
            ].map((item, index) => (
              <Box key={index}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    fontSize: { xs: 18, md: 22 }
                  }}
                >
                  {item.title}
                </Typography>

                <Typography
                  sx={{
                    color: "text.secondary",
                    fontSize: { xs: 14, sm: 16 },
                    lineHeight: 1.7
                  }}
                >
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Container>
  );
};

export default TermsAndConditions;