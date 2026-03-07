import { Box, Container, Typography, Stack } from "@mui/material";

const RefundPolicy = () => {
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
          Refund{" "}
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
            Thank you for enrolling in our courses at <strong>Aryu Academy</strong>. We are committed to providing a rewarding learning experience and ensuring that our students receive the best quality education. Please take a moment to review our refund policy, which outlines the terms for cancellation and refunds.
          </Typography>

          <Typography
            sx={{
              mb: 4,
              fontSize: { xs: 14, sm: 16 },
              lineHeight: 1.7
            }}
          >
            By purchasing a course at Aryu Academy, you agree to our Privacy Policy, Terms & Conditions, and Refund Policy.
          </Typography>

          <Stack spacing={{ xs: 3, md: 4 }}>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: { xs: 20, md: 24 } }}>
                Our Refund Policy
              </Typography>

              <Typography sx={{ fontWeight: 600, mt: 2 }}>
                Refunds for Full Payment
              </Typography>

              <Typography sx={{ fontSize: { xs: 14, sm: 16 } }}>
                Strictly no refunds will be provided once payment has been made.
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 600 }}>
                Refunds for Paid Installments
              </Typography>

              <Typography sx={{ fontSize: { xs: 14, sm: 16 } }}>
                If the payment is made in installments, no refund will be provided for the first installment.
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 600 }}>
                Refunds for Loans (e.g., Bajaj Finserv)
              </Typography>

              <Typography sx={{ fontSize: { xs: 14, sm: 16 } }}>
                If a loan was used to pay for the course, we are not responsible for refunding the loan amount. The loan terms will apply as per the agreement with the loan provider.
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 600 }}>
                Cancellation Requests
              </Typography>

              <Typography sx={{ fontSize: { xs: 14, sm: 16 } }}>
                Course cancellations are allowed; however, the course is non-transferable and cannot be assigned to another individual.
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 600 }}>
                Refunds for Duplicate Payments
              </Typography>

              <Typography sx={{ fontSize: { xs: 14, sm: 16 } }}>
                If a duplicate payment is made, the refund will be processed through the original payment method within 7–10 working days after the customer notifies us.
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 600 }}>
                Note
              </Typography>

              <Typography sx={{ fontSize: { xs: 14, sm: 16 } }}>
                No refunds are provided once payment is made, except for duplicate payments which will be refunded within 7–10 working days.
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
};

export default RefundPolicy;