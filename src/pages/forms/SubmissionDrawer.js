import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Divider,
  Fade,
  Slide,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

/* ---------------- VALUE RENDERER ---------------- */
const renderValue = (a) => {
  if (a.value_text) return a.value_text;
  if (a.value_number !== null && a.value_number !== undefined) return a.value_number;
  if (a.value_json) return JSON.stringify(a.value_json, null, 2);
  if (a.value_file)
    return (
      <Chip
        icon={<InsertDriveFileIcon />}
        label="File uploaded"
        variant="outlined"
        size="small"
        sx={{ mt: 1 }}
      />
    );
  return '-';
};

const SubmissionDrawer = ({ submission }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
            Select a submission to view details
          </Typography>
        </Box>
      </Fade>
    );
  }

  return (
    <Slide
      in
      direction={isMobile ? 'up' : 'left'}
      timeout={350}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#f7f9fc',
          borderRadius: isMobile ? '16px 16px 0 0' : 0,
          overflow: 'hidden'
        }}
      >
        {/* ================= HEADER ================= */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            borderBottom: '1px solid #e0e0e0',
            bgcolor: '#ffffff',
            position: 'sticky',
            top: 0,
            zIndex: 2
          }}
        >
          {/* Mobile handle */}
          {isMobile && (
            <Box
              sx={{
                width: 40,
                height: 4,
                bgcolor: '#ccc',
                borderRadius: 2,
                mx: 'auto',
                mb: 1
              }}
            />
          )}

          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            fontWeight={700}
          >
            Submission Details
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Submitted on{' '}
            {new Date(submission.submitted_at).toLocaleString()}
          </Typography>
        </Box>

        {/* ================= CONTENT ================= */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: { xs: 2, sm: 3 }
          }}
        >
          <Stack spacing={2.5}>
            {submission.answers.map((a, idx) => (
              <Fade in timeout={300 + idx * 60} key={idx}>
                <Paper
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 3,
                    boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Typography
                    fontWeight={600}
                    sx={{
                      fontSize: 14,
                      wordBreak: 'break-word'
                    }}
                  >
                    {a.question}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      color: 'text.primary'
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