// src/pages/forms/SubmissionDrawer.jsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Divider,
  Fade,
  Slide,
  Chip
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

/* ---------------- VALUE RENDERER ---------------- */
const renderValue = (a) => {
  if (a.value_text) return a.value_text;
  if (a.value_number !== null && a.value_number !== undefined) return a.value_number;
  if (a.value_json) return JSON.stringify(a.value_json);
  if (a.value_file)
    return (
      <Chip
        icon={<InsertDriveFileIcon />}
        label="File uploaded"
        variant="outlined"
        sx={{ mt: 1 }}
      />
    );
  return '-';
};

/* ================= COMPONENT ================= */
const SubmissionDrawer = ({ submission }) => {
  if (!submission) {
    return (
      <Fade in timeout={300}>
        <Box
          sx={{
            height: '100%',
            display: 'grid',
            placeItems: 'center',
            textAlign: 'center',
            color: 'text.secondary',
            px: 3
          }}
        >
          <Typography variant="h6" fontWeight={500}>
            No submission selected
          </Typography>
          <Typography variant="body2" mt={1}>
            Select a submission from the left panel to view details
          </Typography>
        </Box>
      </Fade>
    );
  }

  return (
    <Slide in direction="left" timeout={350}>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* ================= HEADER ================= */}
        <Box
          sx={{
            p: 3,
            borderBottom: '1px solid #e0e0e0',
            bgcolor: '#fff',
            position: 'sticky',
            top: 0,
            zIndex: 2
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            Submission Details
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Submitted on {new Date(submission.submitted_at).toLocaleString()}
          </Typography>
        </Box>

        {/* ================= CONTENT ================= */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 3,
            bgcolor: '#f7f9fc'
          }}
        >
          <Stack spacing={2.5}>
            {submission.answers.map((a, idx) => (
              <Fade in timeout={300 + idx * 60} key={idx}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    boxShadow: '0px 4px 14px rgba(0,0,0,0.06)',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Typography
                    fontWeight={600}
                    mb={0.5}
                    sx={{ wordBreak: 'break-word' }}
                  >
                    {a.question}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {renderValue(a)}
                  </Typography>
                </Paper>
              </Fade>
            ))}
          </Stack>
        </Box>
      </Box>
    </Slide>
  );
};

export default SubmissionDrawer;