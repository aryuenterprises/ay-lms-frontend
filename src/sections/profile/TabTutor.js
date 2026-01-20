import { ExpandMore } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Grid, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import { APP_PATH_BASE_URL } from 'config';
import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/reducers/snackbar';
import axiosInstance from 'utils/axios';

const TabTutor = () => {
  const auth = JSON.parse(localStorage.getItem('auth'));
  const studentId = auth?.user?.student_id;
  const dispatch = useDispatch();

  const [tutors, setTutors] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };

  const fetchData = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/student_profile/${studentId}`);
      const result = response.data;

      if (result?.data?.batch) {
        // Extract unique courses with trainer information from batch data
        const uniqueCourses = result.data.batch.map((batchItem) => ({
          course_name: batchItem.course_name,
          course_id: batchItem.course_id,
          trainer_name: batchItem.trainer_name,
          trainer_id: batchItem.trainer_id,
          batch_title: batchItem.title || batchItem.batch_name || 'Unknown Batch',
          batch_id: batchItem.batch_id
        }));

        setTutors(uniqueCourses);
      } else {
        setTutors([]);
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
  }, [studentId, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Group tutors by batch for accordion display
  const tutorsByBatch = tutors.reduce((acc, tutor) => {
    const batchId = tutor.batch_id;
    if (!acc[batchId]) {
      acc[batchId] = {
        batch_title: tutor.batch_title,
        batch_id: batchId,
        tutors: []
      };
    }
    acc[batchId].tutors.push(tutor);
    return acc;
  }, {});

  const batchGroups = Object.values(tutorsByBatch);

  return (
    <MainCard content={false} title="Assigned Trainer Information" sx={{ '& .MuiInputLabel-root': { fontSize: '0.875rem' } }}>
      <Box sx={{ p: 2.5 }}>
        {!tutors || tutors.length === 0 ? (
          <Typography>No trainers assigned</Typography>
        ) : (
          <Grid container spacing={2}>
            {batchGroups.map((batchGroup) => {
              const panelId = `batch-${batchGroup.batch_id}`;
              return (
                <Grid item xs={12} md={6} key={batchGroup.batch_id}>
                  <Accordion
                    expanded={expanded === panelId}
                    onChange={handleAccordionChange(panelId)}
                    sx={{
                      mb: 2,
                      boxShadow: 'none',
                      border: 'none',
                      '&:before': { display: 'none' }
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{
                        backgroundColor: '#f5f5f5',
                        '&:hover': { backgroundColor: '#eeeeee' },
                        minHeight: '48px !important',
                        '& .MuiAccordionSummary-content': {
                          my: 0.5,
                          alignItems: 'center',
                          justifyContent: 'center'
                        },
                        borderRadius: 1
                      }}
                    >
                      <Chip label={`Batch: ${batchGroup.batch_title}`} sx={{ mr: 2 }} color="primary" variant="outlined" />
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 2, pb: 2 }}>
                      {batchGroup.tutors.map((tutor, index) => (
                        <Box
                          key={`${tutor.batch_id}-${tutor.course_id}-${index}`}
                          sx={{ mb: 4, pb: 3, borderBottom: index < batchGroup.tutors.length - 1 ? '1px solid #e0e0e0' : 'none' }}
                        >
                          <Grid container flexDirection="column" spacing={1}>
                            <Grid item display="flex">
                              <Stack width="10rem">
                                <Typography variant="body2" fontWeight="bold">
                                  Tutor Name
                                </Typography>
                              </Stack>
                              <Stack>
                                <Typography variant="body2">: {tutor.trainer_name || 'N/A'}</Typography>
                              </Stack>
                            </Grid>
                            <Grid item display="flex">
                              <Stack width="10rem">
                                <Typography variant="body2" fontWeight="bold">
                                  Course
                                </Typography>
                              </Stack>
                              <Stack>
                                <Typography variant="body2">: {tutor.course_name || 'N/A'}</Typography>
                              </Stack>
                            </Grid>
                            <Grid item display="flex">
                              <Stack width="10rem">
                                <Typography variant="body2" fontWeight="bold">
                                  Trainer ID
                                </Typography>
                              </Stack>
                              <Stack>
                                <Typography variant="body2">: {tutor.trainer_id || 'N/A'}</Typography>
                              </Stack>
                            </Grid>
                          </Grid>
                        </Box>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </MainCard>
  );
};

export default TabTutor;
