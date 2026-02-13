import { Box, Container, Typography, Stack } from '@mui/material';

const RefundPolicy = () => {
    return (
        <Container sx={{ pt: 10,marginLeft:10 ,marginRight:0, width:'100%'}}>
            <Box width={'100%'}>
                <Typography variant="h1" align="center" gutterBottom fontWeight="bold">
                    Refund{' '}
                    <Typography variant="h1" component="span" color="red" fontWeight="bold">
                        Policy
                    </Typography>
                </Typography>
                <Box sx={
                    {
                        width: '100%'
                    }
                }>

                    <Typography variant="body1" sx={{ mb: 1,fontSize:'1.0rem' }}>
                        Thank you for enrolling in our courses at Aryu Academy.
                         We are committed to providing a rewarding learning experience and ensuring that our students receive the best quality education. 
                         Please take a moment to review our refund policy, which outlines the terms for cancellation and refunds.
                         By purchasing a course at Aryu Academy, you agree to our Privacy Policy, Terms & condition, and Refund Policy.
                    </Typography>

                   
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="h3" sx={{pt:5}}>Our refund policy is as follows:</Typography>
                            <Typography variant="h4">Refunds for Full Payment:</Typography>
                            <Typography variant="body1" sx={{fontSize:'1.0rem'}}>
                                Strictly no refunds will be provided once payment has been made.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h4">Refunds for Paid Installments:</Typography>
                            <Typography variant="body1"sx={{fontSize:'1.0rem'}}>
                               If the payment is made in installments, no refund will be provided for the first installment.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h4">Refunds for Loans (e.g., Bajaj Finserv):</Typography>
                            <Typography variant="body1"sx={{fontSize:'1.0rem'}}>
                               If a loan was used to pay for the course, we are not responsible for refunding the loan amount. 
                               The loan terms will apply as per the agreement with the loan provider.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h4">Cancellation Requests:</Typography>
                            <Typography variant="body1"sx={{fontSize:'1.0rem'}}>
                                Course cancellations are allowed; however, the course is non-transferable and cannot be assigned to another individual.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h4">Refunds for Duplicate Payments:</Typography>
                            <Typography variant="body1"sx={{fontSize:'1.0rem'}}>
                                If a duplicate payment is made, the refund will be processed through the original payment method within 7 to 10 working days after the customer notifies us.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h4">Note:</Typography>
                            <Typography variant="body1"sx={{fontSize:'1.0rem'}}>
                               No refunds are provided once payment is made, except for duplicate payments, which will be refunded within 7 to 10 working days
                            </Typography>
                        </Box>

                        
                    </Stack>
                </Box>
            </Box>
        </Container>
    );
};

export default RefundPolicy;
