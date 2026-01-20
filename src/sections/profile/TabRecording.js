import { Box, Grid, Typography, Card, CardContent, Button, CardActionArea } from '@mui/material';
import MainCard from 'components/MainCard';
import { APP_PATH_BASE_URL } from 'config';
import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/reducers/snackbar';
import axiosInstance from 'utils/axios';
import { Capitalise } from 'utils/capitalise';
import { formatDateTime } from 'utils/dateUtils';

const TabRecording = () => {
  const auth = JSON.parse(localStorage.getItem('auth'));
  const regId = auth?.user?.student_id;
  const dispatch = useDispatch();

  const [recordings, setRecordings] = useState([]);
  const fetchData = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/recordings/${regId}`);
      const result = response.data;

      if (result?.data) {
        // Format dates for display
        const formattedRecordings = result.data.map((recording) => ({
          ...recording,
          formattedDate: recording.date
            ? new Date(recording.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            : 'N/A',
          formattedDuration: recording.duration || 'N/A'
        }));
        setRecordings(formattedRecordings);
      } else {
        setRecordings(null);
        console.warn('No trainer data found in response');
      }
    } catch (err) {
      console.error('Error fetching user data:', err.message);
      dispatch(
        openSnackbar({
          open: true,
          message: 'Failed to load user data',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: false
        })
      );
    }
  }, [regId, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <MainCard content={false} title="Recordings">
      <Box sx={{ p: 2.5 }}>
        {!recordings || recordings.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No recordings available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Your course recordings will appear here once they are available.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {recordings.map((file, idx) => (
              <Grid item xs={12} sm={6} md={4} key={file.id || idx}>
                <Card variant="outlined">
                  <CardActionArea
                    component="a"
                    href={file.recording}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'block', textAlign: 'left' }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" noWrap>
                        {Capitalise(file.topic) || 'Untitled File'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(file.created_date)}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Button fullWidth variant="contained" color="primary" href={file.recording} target="_blank" rel="noopener noreferrer">
                      Click to View
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </MainCard>
  );
};

export default TabRecording;
