import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  CircularProgress,
  Stack,
  Grid,
  IconButton,
  Box,
  // Divider
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
    // getFeedbackByWebinar(webinarUuid)
    //   .then((res) => {
    //     setFeedbacks(res.data || []);
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //     setFeedbacks([]);
    //   })
    //   .finally(() => );
  }, [open, webinarUuid]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth overflowx='hidden'>
      <Grid container>
        <Grid
          sx={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            width: "100%",
            px: 2,
          }}
        >
          {/* Left close button */}
         <Box/>

          {/* Center title */}
          <Typography fontWeight={600} textAlign="center">
            Webinar Feedback
          </Typography>

          {/* Right spacer (keeps title truly centered) */}
          <IconButton
            onClick={onClose}
            size="large"
            aria-label="close"
          >
            <CloseSquare style={{ pointerEvents: "none" }} />
          </IconButton>
        </Grid>


        <DialogContent dividers>
          {loading ? (
            <CircularProgress />
          ) : feedbacks.length === 0 ? (
            <Typography>No feedback available</Typography>
          ) : (
            <Stack spacing={2}>
              {feedbacks &&
                <DialogTitle>
                  <Grid container spacing={2} sx={{ p: 3 }}>
                    {/* <Grid item sx={12} md={6}> */}
                    <Grid item xs={5}>
                      <Typography variant="body1" fontWeight="bold">
                        <strong>Webinar</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        :{feedbacks?.webinar}
                      </Typography>
                    </Grid>

                    {/* </Grid> */}
                    <Grid item xs={5}>
                      <Typography>
                        <strong>Phone no</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        :{feedbacks?.phone}
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        <strong>Content Quality</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        :{feedbacks?.content_quality}
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        <strong>Interaction Rating</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        :{feedbacks?.interaction_rating}
                      </Typography>
                    </Grid>

                    <Grid item xs={5}>
                      <Typography>
                        <strong>Pace of Session</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        :{feedbacks?.pace_of_session}
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        <strong>Speaker Quality</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        :{feedbacks?.speaker_quality}
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        <strong>Overall Rating</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        :{feedbacks?.overall_rating}
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        <strong>Interested in Future Webinars</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        :{feedbacks?.interested_in_future_webinars == true ? 'Yes' : 'No'}
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        <strong>Interested in Paid Courses</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        :{feedbacks?.interested_in_paid_courses == true ? 'Yes' : 'No'}
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        <strong>Learned Something New</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        :{feedbacks?.learned_something_new == true ? 'Yes' : 'No'}
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        <strong>Would Recommend</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        :{feedbacks?.would_recommend == true ? 'Yes' : 'No'}
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        <strong>Liked Most</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        :{feedbacks?.liked_most == true ? 'Yes' : 'No'}
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        <strong>Improvement Suggestions</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        :{feedbacks?.improvement_suggestions}
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography>
                        <strong>Rating Screenshot</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>

                      :{feedbacks && feedbacks?.rating_screenshot && (
                        <Grid >
                          <Box
                            component="img"
                            src={`https://portal.aryuacademy.com/api/${feedbacks.rating_screenshot}`}
                            alt="Screenshot"
                            sx={{
                              width: 200,
                              mt: 1,
                              borderRadius: 2,
                              border: "1px solid #ddd",
                            }}
                          />
                        </Grid>

                      )}

                    </Grid>
                  </Grid>
                </DialogTitle>
              }


            </Stack>
          )}
        </DialogContent>
      </Grid>
    </Dialog>
  );
}
