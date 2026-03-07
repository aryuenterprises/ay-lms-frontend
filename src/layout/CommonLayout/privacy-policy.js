import { Box, Container, Typography, Stack, Link } from "@mui/material";

const PrivacyPolicy = () => {
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
          align="center"
          sx={{
            fontWeight: "bold",
            mb: 4,
            fontSize: { xs: 28, sm: 36, md: 48 }
          }}
        >
          Privacy{" "}
          <Typography
            component="span"
            sx={{
              color: "red",
              fontWeight: "bold",
              fontSize: { xs: 28, sm: 36, md: 48 }
            }}
          >
            Policy
          </Typography>
        </Typography>

        <Box sx={{ maxWidth: 900, mx: "auto" }}>
          <Typography
            sx={{
              mb: 3,
              fontSize: { xs: 14, sm: 16 },
              lineHeight: 1.7
            }}
          >
            At <strong>Aryu Academy</strong>, your privacy is important to us.
            This Privacy Policy explains how we collect, use, and protect your
            personal information when you visit our website or use our services.
          </Typography>

          <Stack spacing={{ xs: 3, md: 4 }}>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: { xs: 18, md: 22 } }}>
                Our Commitment to Your Privacy
              </Typography>

              <Typography sx={{ fontSize: { xs: 14, sm: 16 } }}>
                We value your trust and are dedicated to ensuring the
                confidentiality of the information you share with us.
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: { xs: 18, md: 22 } }}>
                Data We Collect
              </Typography>

              <Typography sx={{ fontSize: { xs: 14, sm: 16 } }}>
                <strong>Personal Information:</strong> Name, email address,
                and details submitted through forms.
                <br />
                <strong>Technical Information:</strong> IP address, browser
                type, pages viewed, and visit duration.
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: { xs: 18, md: 22 } }}>
                How We Use Your Information
              </Typography>

              <Typography sx={{ fontSize: { xs: 14, sm: 16 } }}>
                • Respond to inquiries and provide course details <br />
                • Process registrations and training delivery <br />
                • Send updates and notifications <br />
                • Improve website and learning experience
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: { xs: 18, md: 22 } }}>
                Data Sharing Policy
              </Typography>

              <Typography sx={{ fontSize: { xs: 14, sm: 16 } }}>
                We do not sell or rent your data. Information may be shared only
                with trusted service providers or legal authorities when
                required.
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: { xs: 18, md: 22 } }}>
                Cookies
              </Typography>

              <Typography sx={{ fontSize: { xs: 14, sm: 16 } }}>
                Cookies are used to improve user experience. You may disable
                cookies in your browser, though some features may be limited.
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: { xs: 18, md: 22 } }}>
                Contact Us
              </Typography>

              <Typography sx={{ fontSize: { xs: 14, sm: 16 }, mb: 1 }}>
                Aryu Academy <br />
                No 33/14, Ground Floor, Jayammal St, Ayyavoo Colony,
                Aminjikarai, <br />
                Chennai, Tamil Nadu 600029
              </Typography>

              <Typography sx={{ fontSize: { xs: 14, sm: 16 } }}>
                Email:{" "}
                <Link href="mailto:info@aryuacademy.com">
                  info@aryuacademy.com
                </Link>
              </Typography>

              <Typography sx={{ fontSize: { xs: 14, sm: 16 } }}>
                Contact:{" "}
                <Link href="tel:+918122869706">
                  +91 8122869706
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