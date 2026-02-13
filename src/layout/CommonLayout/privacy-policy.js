import { Box, Container, Typography, Stack, Link } from '@mui/material';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md" sx={{ pt: 10, pb: 5 ,marginLeft:10}} >
      <Box>

        <Typography variant="h1" align="center" gutterBottom fontWeight="bold">
          Privacy{' '}
          <Typography variant="h1" component="span" color="red" fontWeight="bold">
            Policy
          </Typography>
        </Typography>
       <Box sx={{maxWidth:'100%', textAlign:'left'}}>
        <Typography variant="body1"  sx={{ mb: 3,}}>
          At <strong>Aryu Academy</strong>, your privacy is important to us. This Privacy Policy explains
          how we collect, use, and protect your personal information when you visit our website or
          use our services.
        </Typography>

        <Stack spacing={3}>
          <Box>
            <Typography variant="h3">Our Commitment to Your Privacy</Typography>
            <Typography variant="body1">
              We value your trust and are dedicated to ensuring the confidentiality of the
              information you share with us.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h3">Data We Collect</Typography>
            <Typography variant="body1">
              <strong>Personal Information:</strong> Name, email address, and details submitted
              through forms.
              <br />
              <strong>Technical Information:</strong> IP address, browser type, pages viewed, and
              visit duration.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h3">How We Use Your Information</Typography>
            <Typography variant="body1">
              • Respond to inquiries and provide course details<br />
              • Process registrations and training delivery<br />
              • Send updates and notifications<br />
              • Improve website and learning experience
            </Typography>
          </Box>

          <Box>
            <Typography variant="h3">Data Sharing Policy</Typography>
            <Typography variant="body1">
              We do not sell or rent your data. Information may be shared only with trusted service
              providers or legal authorities when required.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h3">Cookies</Typography>
            <Typography variant="body1">
              Cookies are used to improve user experience. You may disable cookies in your browser,
              though some features may be limited.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h3">Contact Us</Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Aryu Academy<br />
              No 33/14, Ground Floor, Jayammal St, Ayyavoo Colony, Aminjikarai,<br />
              Chennai, Tamil Nadu 600029
            </Typography>

            {/* EMAIL LINK */}
            <Typography variant="body1">
              Email:{' '}
              <Link href="mailto:info@aryuacademy.com">
                info@aryuacademy.com
              </Link>
            </Typography>

            {/* CALL BUTTON */}
            {/* <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              href="tel:+918122869706"
            >
              Call Us
            </Button> */}
            <Typography varient="body1">
              Contact:{' '}
              <Link href='tel:+918122869706'>
                +918122869706
              </Link>
            </Typography>
          </Box>
        </Stack>
        </Box>
      </Box>
    </Container>
  );
};

export default PrivacyPolicy;
