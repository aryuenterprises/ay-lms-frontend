import {
  Grid,
  Box,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
  Chip,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { AttachCircle } from 'iconsax-react';
import { useEffect, useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import PropTypes from 'prop-types'; // Added for prop validation
import { Capitalise } from 'utils/capitalise';
import { formatDateTime } from 'utils/dateUtils';

const ExercisesTab = ({ data }) => {
  const [exercises, setExercises] = useState([]);
  // console.log('exercises :', exercises);
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const auth = JSON.parse(localStorage.getItem('auth'));
  const userType = auth?.loginType;

  const handleCourseChange = (event) => {
    setSelectedCourse(event.target.value);
  };

  useEffect(() => {
    if (data) {
      setExercises(data);
      setIsLoading(false);
    }
  }, [data]);

  const selectedExercise = Array.isArray(exercises) ? exercises.find((ex) => ex.id === selectedExerciseId) : null;

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          zIndex: 1,
          gap: 2
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6">Loading exercises...</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={3} sx={{ p: 3 }}>
        {/* Exercises List */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, minHeight: '100%' }}>
            <Grid spacing={3} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Exercises</Typography>
              </Box>
              {(userType === 'admin' || userType === 'employer' || userType === 'super_admin') && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Select
                    labelId="course-select-label"
                    id="course-select"
                    size="small"
                    value={selectedCourse || ''}
                    onChange={handleCourseChange}
                    sx={{ minWidth: 200 }}
                    displayEmpty
                  >
                    <MenuItem value="">Select a course</MenuItem>
                    {exercises
                      // Filter duplicates by checking if the course_id is the first occurrence
                      .filter((ex, index, self) => index === self.findIndex((e) => e.course.course_id === ex.course.course_id))
                      .map((ex) => (
                        <MenuItem key={ex.course.course_id} value={ex.course.course_id}>
                          {ex.course.course_name}
                        </MenuItem>
                      ))}
                  </Select>
                </Box>
              )}
            </Grid>
            <List
              dense
              sx={{
                maxHeight: '600px',
                overflowY: 'hidden', // Always hide scrollbar by default
                '&:hover': {
                  overflowY: 'auto' // Show scrollbar on hover
                },
                // Custom scrollbar styling (only visible on hover)
                '&::-webkit-scrollbar': {
                  width: '5px'
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent'
                },
                '&:hover::-webkit-scrollbar-track': {
                  background: '#f1f1f1'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'transparent',
                  borderRadius: '4px'
                },
                '&:hover::-webkit-scrollbar-thumb': {
                  background: '#888'
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#555'
                },
                pr: 1, // Keep padding to prevent content shift
                transition: 'overflow 0.2s ease' // Smooth transition
              }}
            >
              {exercises
                .filter((exercise) => exercise.course.course_id === selectedCourse || selectedCourse === '')
                .map((exercise) => (
                  <Paper
                    key={exercise.id}
                    elevation={exercise.id === selectedExerciseId ? 3 : 1}
                    sx={{
                      mb: 2,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: exercise.id === selectedExerciseId ? '#e3f2fd' : 'inherit',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        transform: 'translateY(-4px)',
                        borderColor: 'secondary.light'
                      },
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      minHeight: 120
                    }}
                    onClick={() => setSelectedExerciseId(exercise.id)}
                  >
                    <ListItem sx={{ py: 1.5, pr: 6 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {exercise.title}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <>
                            {exercise.description && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  mb: 1.5,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                              >
                                <div dangerouslySetInnerHTML={{ __html: exercise.description }} />
                              </Typography>
                            )}

                            {/* <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 0.5 }}>
                            {exercise.duedate && (
                              <Chip
                                icon={<Calendar size={14} />}
                                label={new Date(exercise.duedate).toLocaleDateString()}
                                size="small"
                                variant="outlined"
                                sx={{ borderRadius: 1 }}
                              />
                            )}
                            {exercise.priority && (
                              <Chip
                                label={`Priority: ${exercise.priority}`}
                                size="small"
                                color={getPriorityColor(exercise.priority)}
                                sx={{ borderRadius: 1 }}
                              />
                            )}
                          </Box> */}

                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ mr: 1.5 }}>
                                <Box component="span" sx={{ fontWeight: 500 }}>
                                  {exercise.submissions.length}
                                </Box>{' '}
                                submission{exercise.submissions.length !== 1 ? 's' : ''}
                              </Typography>
                              {exercise.submissions.some((s) => s.replies.length > 0) && (
                                <Chip
                                  label="Feedback available"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                  </Paper>
                ))}
            </List>
          </Paper>
        </Grid>

        {/* Exercise Details */}
        <Grid item xs={12} md={8}>
          {selectedExercise ? (
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 3, // Adds spacing between columns
                  maxWidth: '1200px', // Fixed maximum width
                  margin: '0 auto', // Center the container
                  alignItems: 'flex-start'
                }}
              >
                <Box
                  sx={{
                    flex: 1, // Takes remaining space
                    minWidth: 0, // Prevents overflow
                    maxWidth: '100%' // Maximum width for text content
                  }}
                >
                  <Typography variant="h5" gutterBottom>
                    {selectedExercise.title}
                  </Typography>
                  <Box
                    dangerouslySetInnerHTML={{ __html: selectedExercise.description }}
                    sx={{
                      '& p': { marginBottom: '1em' },
                      '& h1, & h2, & h3': { marginTop: '1em', marginBottom: '0.5em' },
                      maxHeight: '400px', // Limit height
                      overflowY: 'auto', // Add scroll if content is too long
                      pr: 2 // Padding for scrollbar
                    }}
                  />
                </Box>
              </Box>
              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Submissions
              </Typography>

              {selectedExercise.submissions.length > 0 ? (
                <List
                  dense
                  sx={{
                    maxHeight: '600px',
                    overflowY: 'hidden', // Always hide scrollbar by default
                    '&:hover': {
                      overflowY: 'auto' // Show scrollbar on hover
                    },
                    // Custom scrollbar styling (only visible on hover)
                    '&::-webkit-scrollbar': {
                      width: '5px'
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent'
                    },
                    '&:hover::-webkit-scrollbar-track': {
                      background: '#f1f1f1'
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'transparent',
                      borderRadius: '4px'
                    },
                    '&:hover::-webkit-scrollbar-thumb': {
                      background: '#888'
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      background: '#555'
                    },
                    pr: 1, // Keep padding to prevent content shift
                    transition: 'overflow 0.2s ease' // Smooth transition
                  }}
                >
                  {selectedExercise.submissions.map((submission) => (
                    <Box key={submission.id} sx={{ mb: 3 }}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>
                            {submission.student ? (
                              submission.student.profile_pic ? (
                                <img src={`${submission.student.profile_pic}`} alt="Profile" className="profile-pic" />
                              ) : (
                                <span style={{ fontSize: '1rem' }}>{submission.student.first_name?.charAt(0) || '?'}</span>
                              )
                            ) : (
                              <span>?</span>
                            )}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={Capitalise(submission.student.first_name)}
                          secondary={
                            <>
                              <Typography variant="body2" color="text.primary">
                                {submission.text}
                              </Typography>
                              {submission.file_url && (
                                <Box sx={{ mt: 1 }}>
                                  {/* {submission.file.map((file, index) => ( */}
                                  <Chip
                                    icon={<AttachCircle fontSize="small" />}
                                    label={submission.file_url.split('/').pop()}
                                    variant="outlined"
                                    sx={{ mr: 1, cursor: 'pointer' }}
                                    onClick={() => {
                                      window.open(submission.file_url, '_blank');
                                      const filename = submission.file_url.split('/').pop();
                                      const downloadLink = document.createElement('a');
                                      downloadLink.href = submission.file_url;
                                      downloadLink.download = filename;
                                      document.body.appendChild(downloadLink);
                                      downloadLink.click();
                                      document.body.removeChild(downloadLink);
                                    }}
                                  />
                                  {/* ))} */}
                                </Box>
                              )}
                              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                {formatDateTime(submission.date)}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>

                      {/* Replies */}
                      {submission.replies.length > 0 && (
                        <List sx={{ pl: 6 }}>
                          {submission.replies?.map((reply) => (
                            <ListItem key={reply.id} alignItems="flex-start">
                              <ListItemAvatar>
                                <Avatar>
                                  {reply.trainer ? (
                                    reply.trainer.profile_pic ? (
                                      <img src={`${reply.trainer.profile_pic}`} alt="Profile" className="profile-pic" />
                                    ) : (
                                      <span style={{ fontSize: '1rem' }}>{reply.trainer?.full_name?.charAt(0) || '?'}</span>
                                    )
                                  ) : (
                                    <span>?</span>
                                  )}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={Capitalise(reply.trainer?.full_name)}
                                secondary={
                                  <>
                                    <Typography variant="body2" color="text.primary">
                                      {reply.text}
                                    </Typography>
                                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                      {formatDateTime(reply.date)}
                                    </Typography>
                                  </>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No submissions yet.
                </Typography>
              )}
            </Paper>
          ) : (
            <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                {exercises.length === 0 ? 'No exercises available' : 'Select an exercise to view details'}
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

ExercisesTab.propTypes = {
  data: PropTypes.array
};

export default ExercisesTab;
