import React, { useCallback, useEffect, useState } from 'react';
import MainCard from 'components/MainCard';
import { Grid, Box, Tabs, Tab, Typography, Stack, IconButton } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Note, Profile, Document, RecordCircle } from 'iconsax-react';
import { ArrowBack, QuestionAnswerOutlined } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Capitalise } from 'utils/capitalise';
import { ProfileTab } from './studentViewTabs/profileTab';
import SyllablesTab from './studentViewTabs/syllablusTab';
import AddentencesTab from './studentViewTabs/addentenceTab';
import TopicsTab from './studentViewTabs/topicsTab';
import ExercisesTab from './studentViewTabs/exercisesTab';
import RecordingTab from './studentViewTabs/recordingsTab';
import { APP_PATH_BASE_URL } from 'config';
import axiosInstance from 'utils/axios';
import TutorAssessmentTab from './studentViewTabs/TutorAssessmentTab';
import PropTypes from 'prop-types';
import AdminAssessmentTab from './studentViewTabs/AdminAssesmentTab';

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

const StudentView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { name, student_id, notification, user_type } = location.state || {};
  const auth = JSON.parse(localStorage.getItem('auth'));
  const userType = auth?.loginType;
  const regId = auth?.user?.employee_id || auth?.user?.user_id;

  // Show profile tab for admin and student, but not for tutor
  const showProfileTab = userType !== 'tutor';

  // Check if this is a tutor view (includes both tutor and admin)
  const isTutorView = user_type === 'tutor';
  const isAdminView = user_type === 'admin';

  // Define all possible tabs in order
  const ALL_TABS = [
    { id: 'profile', label: 'Profile', icon: <Profile /> },
    { id: 'attendance', label: 'Attendance', icon: <Note /> },
    { id: 'syllabus', label: 'Syllabus', icon: <Note /> },
    { id: 'topics', label: 'Topics', icon: <Profile /> },
    { id: 'exercise', label: 'Exercise', icon: <Document /> },
    { id: 'recording', label: 'Recording', icon: <RecordCircle /> },
    { id: 'assessments', label: 'Assessments', icon: <QuestionAnswerOutlined /> }
  ];

  // Filter tabs based on user type
  const visibleTabs = ALL_TABS.filter((tab) => {
    // If it's a tutor/admin view (isTutorView is true)
    if (isTutorView) {
      // Tutor/Admin should see these tabs
      if (['attendance'].includes(tab.id)) return true;
      // Tutor/Admin should NOT see these tabs
      if (['syllabus', 'recording', 'topics', 'exercise', 'assessments'].includes(tab.id)) return false;
      // Profile tab visibility depends on showProfileTab
      if (tab.id === 'profile') return showProfileTab;
    } else if (isAdminView) {
      // Tutor/Admin should NOT see these tabs
      if (['syllabus', 'recording', 'topics', 'exercise', 'assessments', 'attendance'].includes(tab.id)) return false;
      // Profile tab visibility depends on showProfileTab
      if (tab.id === 'profile') return showProfileTab;
    } else {
      // Students should see all tabs except profile if showProfileTab is false
      if (['profile', 'recording'].includes(tab.id)) return showProfileTab;
      // Students should see all other tabs
      return true;
    }

    return true;
  });

  // Create a mapping from tab ID to index in visibleTabs
  const tabIdToIndexMap = {};
  visibleTabs.forEach((tab, index) => {
    tabIdToIndexMap[tab.id] = index;
  });

  // Map notification values to tab indices in visibleTabs
  const getTabIndexFromNotification = (notification) => {
    if (!notification) return 0;

    const notificationToTabIdMap = {
      profile: 'profile',
      attendance: 'attendance',
      syllabus: 'syllabus',
      topic: 'topics',
      topics: 'topics',
      exercise: 'exercise',
      recording: 'recording',
      assessments: 'assessments',
      assessment: showProfileTab ? 'recording' : 'assessments'
    };

    const tabId = notificationToTabIdMap[notification.toLowerCase()];
    return tabIdToIndexMap[tabId] || 0;
  };

  const [value, setValue] = useState(getTabIndexFromNotification(notification));
  const [profileData, setProfileData] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      let response;
      if (isTutorView) {
        response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/trainers/${student_id}`);
        setProfileData(response.data.data);
        setCourse(response.data.course);
      } else if (isAdminView) {
        response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/ad_employee/${student_id}`);
        setProfileData(response.data.data);
      } else {
        if (userType === 'tutor') {
          response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/trainer/${regId}/student_list/${student_id}`);
        } else {
          response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/student_profile/${student_id}`);
        }
        const result = response.data;
        setProfileData(result.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [student_id, regId, userType, isTutorView, isAdminView]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography variant="h6">Loading data for {name}...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={3} sx={{ position: 'absolute', top: 18, left: '50%', zIndex: 1, width: '50%' }}>
        <Grid item xs={12} sx={{ justifyItems: 'flex-end' }}>
          <Stack sx={{ mb: { xs: -0.5, sm: 0.5 } }} spacing={1}>
            <IconButton variant="contained" color="secondary" size="medium" onClick={() => navigate(-1)} sx={{ width: 100, gap: 1 }}>
              <ArrowBack />
              Back
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
      <MainCard>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Stack spacing={1} mb={2}>
              <Typography variant="h4">
                {isTutorView ? 'Tutor' : 'Student'} Name: {Capitalise(name)}
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', py: 2, px: 4, bgcolor: 'background.paper' }}>
                <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto" aria-label="student tabs">
                  {visibleTabs.map((tab, index) => (
                    <Tab key={tab.id} className="tabs" label={tab.label} icon={tab.icon} iconPosition="start" {...a11yProps(index)} />
                  ))}
                </Tabs>
              </Box>

              {/* Render tab panels based on the visible tabs */}
              {visibleTabs.map((tab, index) => (
                <TabPanel key={tab.id} value={value} index={index}>
                  {tab.id === 'profile' && <ProfileTab data={profileData || []} />}
                  {tab.id === 'attendance' && (
                    <AddentencesTab
                      attendance={profileData?.attendance || []}
                      course={course || profileData?.course || profileData?.courses_assigned || []}
                      student_id={student_id}
                      batch={profileData?.batch || []}
                      user_type={user_type}
                    />
                  )}
                  {tab.id === 'syllabus' && <SyllablesTab courses={profileData?.course_detail} />}
                  {tab.id === 'topics' && (
                    <TopicsTab topics={profileData?.course_detail} completedTopics={profileData?.studenttopicstatus} />
                  )}
                  {tab.id === 'exercise' && <ExercisesTab data={profileData?.assignment || []} />}
                  {tab.id === 'recording' && <RecordingTab StuId={profileData?.student_id} />}
                  {tab.id === 'assessments' &&
                    (userType === 'tutor' || userType === 'admin' ? (
                      <TutorAssessmentTab course={profileData?.course_detail} student_id={student_id} />
                    ) : (
                      <AdminAssessmentTab course={profileData?.course_detail} student_id={student_id} />
                    ))}
                </TabPanel>
              ))}
            </Box>
          </Grid>
        </Grid>
      </MainCard>
    </LocalizationProvider>
  );
};

export default StudentView;
