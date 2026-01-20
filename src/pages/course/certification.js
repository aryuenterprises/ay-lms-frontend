import React, { useRef, useState } from 'react';
import { Container, Button, Typography, Box, TextField, Paper } from '@mui/material';
import { Download } from '@mui/icons-material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import certificate from 'assets/images/course/Certificate.svg';

const Certification = () => {
  const certificateRef = useRef();
  const [formData, setFormData] = useState({
    name: 'John Doe',
    certificateId: 'RCT-23-0752',
    issueDate: 'June 15, 2023',
    signature: 'Director of Education'
  });

  const handleInputChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleDownload = () => {
    const input = certificateRef.current;

    html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 297; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('certificate.pdf');
    });
  };

  return (
    <Container sx={{ py: 4, textAlign: 'center' }}>
      <Typography variant="h3" sx={{ mb: 3, color: 'primary.dark', fontWeight: 'bold' }}>
        Professional Certification
      </Typography>

      <Typography variant="h6" color="textSecondary" paragraph>
        This certificate validates your expertise and accomplishment
      </Typography>

      {/* Form for editing certificate details */}
      <Paper sx={{ p: 3, mb: 4, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Edit Certificate Details
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Name" value={formData.name} onChange={handleInputChange('name')} fullWidth />
          <TextField label="Certificate ID" value={formData.certificateId} onChange={handleInputChange('certificateId')} fullWidth />
          <TextField label="Issue Date" value={formData.issueDate} onChange={handleInputChange('issueDate')} fullWidth />
          <TextField label="Signature" value={formData.signature} onChange={handleInputChange('signature')} fullWidth />
        </Box>
      </Paper>

      {/* Certificate with overlay */}
      <Box
        ref={certificateRef}
        sx={{
          position: 'relative',
          display: 'inline-block',
          my: 4,
          width: '100%',
          minWidth: 800,
          maxWidth: 800
        }}
      >
        {/* Certificate background image */}
        <Box
          component="img"
          src={certificate}
          alt="Certificate Background"
          sx={{
            width: '100%',
            height: 'auto',
            borderRadius: 2,
            boxShadow: '0px 5px 15px rgba(0,0,0,0.2)',
            display: 'block'
          }}
        />

        {/* Overlay content positioned absolutely id */}
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 0,
            right: 2,
            bottom: 0,
            p: 4,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          {/* Certificate ID */}
          <Box
            sx={{
              width: 80,
              display: 'flex',
              justifyContent: 'start',
              wordBreak: 'break-all'
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: '#34495e',
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
                fontSize: '10px'
              }}
            >
              {formData.certificateId}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {/* Certificate Name*/}
          <Box
            sx={{
              marginLeft: 7,
              width: 380,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              wordBreak: 'break-all'
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontWeight: 'bold',
                color: '#2c3e50',
                mb: 2,
                textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
              }}
            >
              {formData.name}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            // top: 0,
            left: 160,
            right: 0,
            bottom: 18,
            p: 4,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start'
          }}
        >
          {/* Completion text */}
          <Typography
            variant="h6"
            sx={{
              color: '#34495e',
              mb: 4.1,
              maxWidth: '80%',
              fontWeight: 'bold',
              fontSize: 12,
              textAlign: 'center',
              textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
            }}
          >
            {formData.issueDate}
          </Typography>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            // top: 0,
            left: 0,
            right: 70,
            bottom: 50,
            p: 4,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end'
          }}
        >
          {/* Signature area */}
          <Box
            sx={{
              border: '2px solid #34495e',
              borderRadius: 1,
              p: 2,
              width: '189px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              wordBreak: 'break-all'
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: '#2c3e50',
                display: 'inline-block',
                pt: 1,
                textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
              }}
            >
              {formData.signature}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Button
        variant="contained"
        color="primary"
        size="large"
        sx={{ mt: 3, py: 1.5, px: 4, fontSize: '1.1rem' }}
        startIcon={<Download />}
        onClick={handleDownload}
      >
        Download Certificate as PDF
      </Button>
    </Container>
  );
};

export default Certification;
