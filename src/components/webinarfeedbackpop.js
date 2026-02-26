import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  CircularProgress,
  Stack,
  IconButton,
  Box,
  Divider,
  Chip,
  DialogActions,
  Button
} from '@mui/material';
import { CloseSquare } from 'iconsax-react';

// import { getFeedbackByWebinar } from '../api/webinarfeedback';


// import GetFeedbackByWebinar from 'api/webinarfeedback';


export default function WebinarFeedbackDialog({ open, onClose, webinarUuid }) {
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  console.log("uuid", webinarUuid);
  // const[viewOpen,setViewOpen]=useState("");
  // console.log("viewopen",viewOpen);
  //  const handleViewClose = () => {
  //       setViewOpen(false);
  //   };
  useEffect(() => {
    if (!open || !webinarUuid) return;

    setLoading(true);
    setFeedbacks(webinarUuid);
    setLoading(false)

  }, [open, webinarUuid]);

  return (
  <Dialog
    open={open}
    onClose={onClose}
    fullWidth
    maxWidth="md"
    PaperProps={{
      sx: {
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(15, 23, 42, 0.2)'
      }
    }}
  >
    {/* Header */}
    <Box
      sx={{
        px: 4,
        py: 3,
        borderBottom: '1px solid #eef1f5',
        background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)'
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Webinar Feedback
        </Typography>

        <IconButton onClick={onClose}>
          <CloseSquare />
        </IconButton>
      </Stack>
    </Box>

    {/* Content */}
    <DialogContent sx={{ px: 4, py: 4 }}>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : !feedbacks || 
    (Array.isArray(feedbacks) && feedbacks.length === 0) ||
    (typeof feedbacks === 'object' && Object.keys(feedbacks).length === 0) ? (
        <Typography color="text.secondary">
          No feedback available
        </Typography>
      ) : (
        <Stack spacing={4}>

          {/* Basic Info */}
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 2 }}>
              Participant Information
            </Typography>

            <Stack direction="row" spacing={6}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Webinar
                </Typography>
                <Typography fontWeight={600}>
                  {feedbacks?.webinar}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Phone
                </Typography>
                <Typography fontWeight={600}>
                  {feedbacks?.phone}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Ratings Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 2 }}>
              Ratings
            </Typography>

            <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
              {[
                { label: 'Content Quality', value: feedbacks?.content_quality },
                { label: 'Interaction', value: feedbacks?.interaction_rating },
                { label: 'Pace', value: feedbacks?.pace_of_session },
                { label: 'Speaker', value: feedbacks?.speaker_quality },
                { label: 'Overall', value: feedbacks?.overall_rating }
              ].map((item) => (
                <Box key={item.label}>
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Chip
                    label={`${item.value}/5`}
                    size="small"
                    sx={{
                      mt: 1,
                      fontWeight: 600,
                      backgroundColor: '#eef2ff',
                      color: '#3730a3'
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* Preferences Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 2 }}>
              Preferences
            </Typography>

            <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
              {[
                { label: 'Future Webinars', value: feedbacks?.interested_in_future_webinars },
                { label: 'Paid Courses', value: feedbacks?.interested_in_paid_courses },
                { label: 'Learned Something New', value: feedbacks?.learned_something_new },
                { label: 'Would Recommend', value: feedbacks?.would_recommend }
              ].map((item) => (
                <Chip
                  key={item.label}
                  label={`${item.label}: ${item.value ? 'Yes' : 'No'}`}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    backgroundColor: item.value ? '#ecfdf5' : '#fef2f2',
                    color: item.value ? '#065f46' : '#991b1b'
                  }}
                />
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* Comments */}
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
              Improvement Suggestions
            </Typography>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {feedbacks?.improvement_suggestions || 'No suggestions provided.'}
              </Typography>
            </Box>
          </Box>

          {/* Screenshot */}
          {feedbacks?.rating_screenshot && (
            <>
              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 2 }}>
                  Rating Screenshot
                </Typography>

                <Box
                  component="img"
                  src={`https://portal.aryuacademy.com/api/${feedbacks.rating_screenshot}`}
                  alt="Screenshot"
                  sx={{
                    width: 260,
                    borderRadius: 3,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                  }}
                />
              </Box>
            </>
          )}

        </Stack>
      )}
    </DialogContent>

    {/* Footer */}
    <DialogActions
      sx={{
        px: 4,
        py: 2,
        borderTop: '1px solid #eef1f5'
      }}
    >
      <Button
        onClick={onClose}
        variant="contained"
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 2,
          backgroundColor: '#111827',
          '&:hover': { backgroundColor: '#000000' }
        }}
      >
        Close
      </Button>
    </DialogActions>
  </Dialog>
);
}
