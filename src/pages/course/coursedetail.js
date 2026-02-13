import React from 'react';
import MainCard from 'components/MainCard';
import {
  Grid,
  Box,
  Tabs,
  Tab,
  Typography,
  Stack,
  IconButton,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField
} from '@mui/material';
import PropTypes from 'prop-types';
import 'assets/css/commonStyle.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Note, Document, Book1 } from 'iconsax-react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ArrowBack, QuestionAnswerOutlined } from '@mui/icons-material';
import SyllablesTab from './SyllablesTab';
import TopicsTab from './TopicsTab';
import ExercisesTab from './ExercisesTab';
// import SchedulesTab from './SchedulesTab';
import StudentAssessmentTab from './StudentAssessmentTab';
import axiosInstance from 'utils/axios';
import { APP_PATH_BASE_URL } from 'config';
import { Capitalise } from 'utils/capitalise';
import { usePermission } from 'hooks/usePermission';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import YouTubeIcon from '@mui/icons-material/YouTube';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import AddIcon from '@mui/icons-material/Add';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number,
  index: PropTypes.number
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
}

const CourseDetail = () => {
  const { checkPermission } = usePermission();

  const canRead = checkPermission('Exercise', 'read');

  const navigate = useNavigate();
  const location = useLocation();
  const { title, courseData, notification } = location.state || {};
  // Get user type from auth
  const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  const userType = auth?.loginType || 'student';
  const [openVideoDialog, setOpenVideoDialog] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videos, setVideos] = useState([]);

  const handleAddVideo = () => {
    if (!videoUrl.trim()) return;

    setVideos((prev) => [...prev, videoUrl]);
    setVideoUrl('');
    setOpenVideoDialog(false);
  };

  // Define all possible tabs
  const ALL_TABS = useMemo(
    () => [
      { id: 'syllabus', label: 'Syllabus', icon: <Note /> },
      { id: 'topics', label: 'Topics', icon: <Book1 /> },
      { id: 'exercise', label: 'Exercise', icon: <Document /> },
      { id: 'youtube', label: 'YouTube', icon: <YouTubeIcon /> },
      // { id: 'classSchedule', label: 'Schedule', icon: <Calendar2 /> },
      { id: 'assessments', label: 'Assessments', icon: <QuestionAnswerOutlined /> }
    ],
    []
  );

  // Filter tabs based on user type
  const visibleTabs = useMemo(
    () =>
      ALL_TABS.filter((tab) => {
        if (userType === 'student') {
          return ['syllabus', 'topics', 'exercise', 'youtube', 'assessments'].includes(tab.id);
        } else {
          // For non-students, check permission only for 'exercise' tab and only for admin
          if (tab.id === 'exercise') {
            // Only check canRead permission for admin, tutor can always see exercise tab
            return userType === 'admin' ? canRead : true;
          } else {
            return ['syllabus', 'topics', 'youtube', 'classSchedule'].includes(tab.id);
          }
        }
      }),
    [ALL_TABS, userType, canRead]
  );

  // Create mapping from tab ID to index
  const tabIdToIndexMap = useMemo(() => {
    const map = {};
    visibleTabs.forEach((tab, index) => {
      map[tab.id] = index;
    });
    return map;
  }, [visibleTabs]);

  // Map notification to tab inde
  const getTabIndexFromNotification = useCallback(
    (notification) => {
      if (!notification) return 0;

      const notificationMap = {
        syllabus: 'syllabus',
        topic: 'topics',
        topics: 'topics',
        exercise: 'exercise',
        youtube: 'youtube',
        video: 'youtube',
        assessment: 'assessments',
        assessments: 'assessments',
        schedule: 'classSchedule',
        classSchedule: 'classSchedule'
      };

      const normalizedNotification = notification.toLowerCase();
      const tabId = notificationMap[normalizedNotification];

      return tabIdToIndexMap[tabId] || 0;
    },
    [tabIdToIndexMap]
  );

  const [value, setValue] = useState(0);
  const [syllabusData, setSyllabusData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openAddSyllabus, setOpenAddSyllabus] = useState(false);
  const [syllabusFile, setSyllabusFile] = useState(null);
  // const [openDialog, setOpenDialog] = useState(false);

  // Set initial tab based on notification
  useEffect(() => {
    const initialTabIndex = getTabIndexFromNotification(notification);
    setValue(initialTabIndex);
  }, [notification, getTabIndexFromNotification]);

  // Transform syllabus data from API response
  const transformSyllabusData = (data) => {
    if (!data || !data.syllabus_info) return [];

    return data.syllabus_info.map((item) => ({
      ...item,
      file: {
        name: item.file?.name || 'Untitled',
        type: item.file?.type || '',
        size: item.file?.size || 0,
        url: item.file?.url || ''
      }
    }));
  };

  // Fetch course details
  const fetchCourseDetails = useCallback(async () => {
    if (!courseData?.course_id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/courses/${courseData.course_id}`);
      const data = response.data;
      if (data) {

        // console.log(data,"first recived here ")
        setSyllabusData(transformSyllabusData(data));
      } else {
        // New course may not have syllabus yet
        setSyllabusData([]);
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
      setSyllabusData([]); // allow empty syllabus
    } finally {
      setLoading(false);
    }
  }, [courseData?.course_id]);

  useEffect(() => {
    // if (courseData?.syllabus_info) {
    //   setSyllabusData(transformSyllabusData(courseData));
    // } else {
    fetchCourseDetails();
    // }
  }, [fetchCourseDetails]);
  // const handleSaveVideo = () => {
  //   if (!videoUrl.trim()) return;

  //   console.log('YouTube Video URL:', videoUrl);

  //   // 🔜 API call later
  //   // axiosInstance.post(`${APP_PATH_BASE_URL}/api/courses/${courseData.course_id}/video`, {
  //   //   url: videoUrl
  //   // });

  //   setVideoUrl('');
  //   setOpenVideoDialog(false);
  // };

  const handleAddItem = async (itemData) => {
    try {
      const formData = new FormData();

      // Append all relevant data to formData
      Object.keys(itemData).forEach((key) => {
        if (key === 'file' && itemData[key]) {
          formData.append('syllabus', itemData.file);
        } else if (itemData[key]) {
          formData.append(key, itemData[key]);
        }
      });

      const response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/courses/${courseData.course_id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        // Refresh the syllabus data
        await fetchCourseDetails();
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to add syllabus item');
      }
    } catch (error) {
      console.error('Error adding syllabus item:', error);
      throw error;
    }
  };

  const handleUpdateItem = async (id, itemData) => {
    try {
      const formData = new FormData();

      // Append all relevant data to formData
      Object.keys(itemData).forEach((key) => {
        if (key === 'file' && itemData[key]) {
          formData.append('syllabus', itemData.file);
        } else if (itemData[key]) {
          formData.append(key, itemData[key]);
        }
      });

      const response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/courses/${courseData.course_id}/syllabus/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        // Refresh the syllabus data
        await fetchCourseDetails();
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update syllabus item');
      }
    } catch (error) {
      console.error('Error updating syllabus item:', error);
      throw error;
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const response = await axiosInstance.delete(`${APP_PATH_BASE_URL}api/courses/${courseData.course_id}/syllabus/${id}`);

      if (response.data.success) {
        // Refresh the syllabus data
        await fetchCourseDetails();
      } else {
        throw new Error(response.data.message || 'Failed to delete syllabus item');
      }
    } catch (error) {
      console.error('Error deleting syllabus item:', error);
      throw error;
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MainCard>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Stack spacing={1}>
              <Typography variant="h4">Course Name : {Capitalise(title)}</Typography>
              {error && (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              )}
            </Stack>
            <Stack sx={{ mb: { xs: -0.5, sm: 0.5 } }} spacing={1} direction="row" justifyContent="flex-end">
              <IconButton
                variant="contained"
                color="white"
                size="medium"
                onClick={() => navigate(-1)}
                sx={{ width: 100, gap: 1, backgroundColor: 'red', ml: { xs: 2, sm: 5 }, color: 'white' }}
              >
                <ArrowBack />
                Back
              </IconButton>
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', py: 2, px: 4, bgcolor: 'background.paper' }}>
                <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto" aria-label="course detail tabs">
                  {visibleTabs.map((tab, index) => (
                    <Tab key={tab.id} className="tabs" label={tab.label} icon={tab.icon} iconPosition="start" {...a11yProps(index)} />
                  ))}
                </Tabs>
              </Box>

              {/* Syllabus Tab */}
              <TabPanel value={value} index={tabIdToIndexMap['syllabus']}>
                {loading ? (
                  <Typography>Loading syllabus...</Typography>
                ) : syllabusData.length === 0 && (!["admin","student"].includes(userType)) ? (
                  <Box
                    sx={{
                      minHeight: 220,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: 2
                    }}
                  >
                    {/* Upload Dialog */}
                    <Dialog
                      open={openAddSyllabus}
                      onClose={() => {
                        setOpenAddSyllabus(false);
                        setSyllabusFile(null);
                      }}
                      maxWidth="sm"
                      fullWidth
                    >
                      <DialogTitle>Upload Syllabus</DialogTitle>
                      <DialogContent>Drag and drop a file here, or click to select a file to upload as the syllabus.</DialogContent>

                      <DialogContent>
                        <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} fullWidth>
                          Browse Files
                          <input type="file" hidden accept=".pdf,.doc,.docx" onChange={(e) => setSyllabusFile(e.target.files[0])} />
                        </Button>

                        {syllabusFile && (
                          <Typography sx={{ mt: 2 }} variant="body2">
                            Selected file: <b>{syllabusFile.name}</b>
                          </Typography>
                        )}
                      </DialogContent>

                      <DialogActions>
                        <Button onClick={() => setOpenAddSyllabus(false)}>Cancel</Button>
                        <Button
                          variant="contained"
                          disabled={!syllabusFile}
                          onClick={async () => {
                            await handleAddItem({ file: syllabusFile });
                            setOpenAddSyllabus(false);
                            setSyllabusFile(null);
                          }}
                        >
                          Upload
                        </Button>
                      </DialogActions>
                    </Dialog>

                    {/* Main Button */}
                    <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => setOpenAddSyllabus(true)}>
                      Upload Syllabus
                    </Button>
                  </Box>
                ) : (
                  <SyllablesTab
                    data={syllabusData}
                    onAddItem={handleAddItem}
                    onUpdateItem={handleUpdateItem}
                    onDeleteItem={handleDeleteItem}
                    openAddSyllabus={openAddSyllabus}
                    setOpenAddSyllabus={setOpenAddSyllabus}
                  />
                )}
              </TabPanel>
              {/* Topics Tab */}
              <TabPanel value={value} index={tabIdToIndexMap['topics']}>
                <TopicsTab courseId={courseData?.course_id} />
              </TabPanel>

              {/* Exercise Tab */}
              <TabPanel value={value} index={tabIdToIndexMap['exercise']}>
                <ExercisesTab courseId={courseData?.course_id} />
              </TabPanel>

              {/* Schedule Tab (for tutors) */}
              {/* {tabIdToIndexMap['classSchedule'] !== undefined && (
              <TabPanel value={value} index={tabIdToIndexMap['classSchedule']}>
                <SchedulesTab courseId={courseData} />
              </TabPanel>
            )} */}
              {/* YouTube Tab */}
              {tabIdToIndexMap['youtube'] !== undefined && (
                <TabPanel value={value} index={tabIdToIndexMap['youtube']}>
                  {/* Add Video Dialog */}
                  <Dialog open={openVideoDialog} onClose={() => setOpenVideoDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Add YouTube Video</DialogTitle>

                    <DialogContent>
                      <TextField
                        autoFocus
                        fullWidth
                        label="YouTube Video URL"
                        placeholder="https://www.youtube.com/watch?v=xxxxx"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        margin="dense"
                      />
                    </DialogContent>

                    <DialogActions>
                      <Button onClick={() => setOpenVideoDialog(false)}>Cancel</Button>
                      <Button variant="contained" onClick={handleAddVideo}>
                        Add
                      </Button>
                    </DialogActions>
                  </Dialog>

                  {/* Empty State */}
                  {videos.length === 0 && (
                    <Box
                      sx={{
                        minHeight: 220,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: 2
                      }}
                    >
                      <YouTubeIcon color="error" sx={{ fontSize: 60 }} />

                      <Typography variant="h5">Add Course Videos</Typography>

                      <Typography variant="body2" color="text.secondary">
                        Upload or link YouTube videos related to this course
                      </Typography>

                      <Button variant="contained" startIcon={<YouTubeIcon />} onClick={() => setOpenVideoDialog(true)}>
                        Add Your Video
                      </Button>
                    </Box>
                  )}

                  {/* Video List */}
                  {videos.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      {videos.map((url, index) => (
                        <Box key={index} mb={2}>
                          <iframe
                            width="100%"
                            height="315"
                            src={url.replace('watch?v=', 'embed/')}
                            title={`youtube-${index}`}
                            frameBorder="0"
                            allowFullScreen
                          />
                        </Box>
                      ))}

                      <Button variant="contained" startIcon={<YouTubeIcon />} onClick={() => setOpenVideoDialog(true)}>
                        Add Another Video
                      </Button>
                    </Box>
                  )}
                </TabPanel>
              )}

              {/* Assessments Tab (for students) */}
              {tabIdToIndexMap['assessments'] !== undefined && (
                <TabPanel value={value} index={tabIdToIndexMap['assessments']}>
                  <StudentAssessmentTab courseId={courseData?.course_id} />
                </TabPanel>
              )}
            </Box>
          </Grid>
        </Grid>
      </MainCard>
    </LocalizationProvider>
  );
};

export default CourseDetail;
