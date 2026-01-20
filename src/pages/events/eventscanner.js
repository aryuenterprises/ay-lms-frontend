import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Zoom } from '@mui/material';
import { QrCode as QrCodeIcon } from '@mui/icons-material';
import { QRCodeCanvas } from 'qrcode.react';

const EventScanner = () => {
  const [scanLink, setScanLink] = useState('');

  const generateRandomId = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const generateScanLink = useCallback(() => {
    const link = `https://aylms.aryuprojects.com/event/user/${generateRandomId()}/form/in?t=${Date.now()}`;
    setScanLink(link);
  }, []);

  useEffect(() => {
    generateScanLink();
    const interval = setInterval(generateScanLink, 30000);
    return () => clearInterval(interval);
  }, [generateScanLink]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#000000',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        padding: 2
      }}
    >
      {/* Header with Zoom */}
      <Zoom in timeout={800}>
        <Box
          sx={{
            textAlign: 'center',
            mb: 5
          }}
        >
          <QrCodeIcon
            sx={{
              fontSize: 56,
              mb: 2
            }}
          />
          <Typography
            variant="h4"
            fontWeight={600}
            sx={{
              mb: 1,
              color: '#000000ff'
            }}
          >
            Event Registration
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#666666',
              fontWeight: 400
            }}
          >
            Scan to Register
          </Typography>
        </Box>
      </Zoom>

      {/* QR Code with Zoom */}
      <Zoom in timeout={1000}>
        <Box
          sx={{
            bgcolor: 'white',
            mt: 5,
            p: 3.5,
            borderRadius: '20px',
            border: '2px solid #e3f2fd',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.1)'
          }}
        >
          <QRCodeCanvas value={scanLink} size={260} level="H" includeMargin bgColor="#ffffff" />
        </Box>
      </Zoom>

      {/* Footer */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 30,
          textAlign: 'center',
          width: '100%',
          paddingX: 2
        }}
      >
        <Typography
          sx={{
            fontSize: '0.9rem',
            color: '#666666',
            fontWeight: 500
          }}
        >
          © {new Date().getFullYear()} Aryu Event Portal • Secure Registration
        </Typography>
      </Box>
    </Box>
  );
};

export default EventScanner;
