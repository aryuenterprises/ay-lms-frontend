import React from 'react';
import { Box, Typography, Zoom } from '@mui/material';
import { QrCode as QrCodeIcon } from '@mui/icons-material';
import { QRCodeCanvas } from 'qrcode.react';
import { useParams } from 'react-router-dom';

const EventScanner = () => {
  const { id } = useParams();
  console.log("room_id", id)
  const roomId = id;

  if (!roomId) {
    return (
      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <Typography color="error">
          Room ID not found
        </Typography>
      </Box>
    );
  }

  const scanLink = `${window.location.origin}/events/user/${roomId}/form/in`;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
      }}
    >
      <Zoom in timeout={800}>
        <Box textAlign="center" mb={5}>
          <QrCodeIcon sx={{ fontSize: 56, mb: 2 }} />
          <Typography variant="h4" fontWeight={600}>
            Event Registration
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Scan to Register
          </Typography>
        </Box>
      </Zoom>

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
          <QRCodeCanvas
            value={scanLink}
            size={260}
            level="H"
            includeMargin
            bgColor="#ffffff"
          />
        </Box>
      </Zoom>

      <Box sx={{ position: 'absolute', bottom: 30 }}>
        <Typography fontSize="0.9rem" color="text.secondary">
          © {new Date().getFullYear()} Aryu Event Portal • Secure Registration
        </Typography>
      </Box>
    </Box>
  );
};

export default EventScanner;
