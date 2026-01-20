// src/views/attendance/AttendanceTab.js
import { useState, useEffect, useMemo, useCallback } from 'react';
// import { useTheme } from '@mui/material/styles';
import {
  Button,
  InputLabel,
  TextField,
  MenuItem,
  Select,
  Grid,
  Stack,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  FormLabel,
  InputAdornment,
  IconButton,
  DialogActions,
  Autocomplete,
  Chip,
  Tooltip
} from '@mui/material';
import DataTable from 'react-data-table-component';
import { CloseSquare, SearchNormal1 } from 'iconsax-react';
import axiosInstance from 'utils/axios';
import Swal from 'sweetalert2';
import { APP_PATH_BASE_URL } from 'config';
// import { PopupTransition } from 'components/@extended/Transitions';
import { formatDateTime } from 'utils/dateUtils';

import 'assets/css/commonStyle.css';
import 'assets/css/DataTable.css';

const AttendanceTab = () => {
  // const theme = useTheme();
  const [filterText, setFilterText] = useState('');
  const [reason, setReason] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('not_logged_in');
  const [attendanceData, setAttendanceData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [allData, setAllData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [topics, setTopics] = useState([]);
  const [subTopics, setSubTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedSubTopics, setSelectedSubTopics] = useState([]);

  const auth = JSON.parse(localStorage.getItem('auth'));
  const token = localStorage.getItem('serviceToken');
  const userId = auth?.user?.employee_id || auth?.user?.user_id;
  const regId = auth?.user?.student_id;
  const userType = auth?.loginType;

  useEffect(() => {
    if (userType === 'tutor' && selectedCourse) {
      const batch = allData.filter((batch) => batch.course === selectedCourse);
      // console.log('batch data', batch);
      setBatches(batch ? batch : []);
      const fetchTopics = async () => {
        try {
          const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/trainer/${userId}/courses`);
          if (response.data && response.data.data) {
            // Find the selected course and get its topics
            const selectedCourseData = response.data.data.find((course) => course.course_id === selectedCourse);
            if (selectedCourseData && selectedCourseData.topic) {
              setTopics(selectedCourseData.topic);
            } else {
              setTopics([]);
            }
          } else {
            setTopics([]);
          }
          setSelectedTopics([]); // Reset selected topics when course changes
          setSubTopics([]);
          // setLoginDetails((prev) => ({ ...prev, topic: '', sub_topic: '' }));
        } catch (err) {
          console.error('Error fetching topics:', err);
          setTopics([]);
        }
      };
      fetchTopics();
    } else if (userType === 'student' && selectedCourse) {
      const batch = allData.filter((batch) => batch.course === selectedCourse);
      setSelectedBatch(batch ? batch[0].batch_id : null);
    }
  }, [allData, selectedCourse, courses, userType, userId]);

  // Extract subtopics from all selected topics' descriptions
  useEffect(() => {
    if (userType === 'tutor' && selectedTopics.length > 0) {
      let allSubTopics = [];

      selectedTopics.forEach((topicId) => {
        const selectedTopicData = topics.find((t) => t.topic_id === topicId);
        if (selectedTopicData) {
          let extractedSubTopics = [];

          // Try to parse HTML content
          try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(selectedTopicData.description, 'text/html');

            // First try to get list items
            const listItems = doc.querySelectorAll('li');
            if (listItems.length > 0) {
              extractedSubTopics = Array.from(listItems).map((li) => li.textContent.trim());
            }
            // If no list items, try to get paragraphs
            else {
              const paragraphs = doc.querySelectorAll('p');
              if (paragraphs.length > 0) {
                extractedSubTopics = Array.from(paragraphs)
                  .map((p) => p.textContent.trim())
                  .filter((text) => text.length > 0);
              }
              // If no paragraphs either, try splitting by newlines or other delimiters
              else {
                const plainText = doc.body.textContent || '';
                extractedSubTopics = plainText
                  .split('\n')
                  .map((line) => line.trim())
                  .filter((line) => line.length > 0);
              }
            }
          } catch (error) {
            console.error('Error parsing description:', error);
            // Fallback to treating the whole description as one subtopic
            extractedSubTopics = [selectedTopicData.description];
          }

          // Add topic title as prefix to subtopics to distinguish them
          extractedSubTopics = extractedSubTopics.map((sub) => `${selectedTopicData.title}: ${sub}`);
          allSubTopics = [...allSubTopics, ...extractedSubTopics];
        }
      });
      setSubTopics(allSubTopics);
    } else {
      setSubTopics([]);
    }
  }, [selectedTopics, topics, userType]);

  const fetchData = useCallback(async () => {
    try {
      let response;
      let fetchedCourses;
      if (userType === 'tutor') {
        response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/trainer_attendance/${userId}`);
        fetchedCourses = response.data.batches;
      } else {
        response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/attendance/${regId}`);
        fetchedCourses = response.data.batches;
      }

      const uniqueCourses = fetchedCourses.filter((course, index, array) => array.findIndex((c) => c.course === course.course) === index);
      setCourses(uniqueCourses);
      setBatches(fetchedCourses);
      setAllData(fetchedCourses);

      // Sort and find the most recent record
      if (Array.isArray(response.data.data) && response.data.data.length > 0) {
        const sortedData = [...response.data.data].sort((a, b) => new Date(b.date) - new Date(a.date));
        const mostRecentRecord = sortedData[0];
        // console.log('mostRecentRecord :', mostRecentRecord);
        updateStatus(mostRecentRecord.status);
        // Only set course on initial load
        if (!['Logout', 'logout'].includes(mostRecentRecord.status)) {
          setSelectedCourse(mostRecentRecord.course_id || mostRecentRecord.course);
          setSelectedBatch(mostRecentRecord.batch || mostRecentRecord.batch_id);
        } else {
          setSelectedCourse('');
          setSelectedBatch('');
        }
      }
      const data = response.data.data.map((item, index) => ({
        ...item,
        sno: index + 1
      }));
      setAttendanceData(data);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
    }
  }, [regId, userId, userType]);

  const updateStatus = (status) => {
    if (status === 'Login' || status === 'login') {
      setCurrentStatus('logged_in');
    } else if (status === 'Break Out') {
      setCurrentStatus('on_break');
    } else if (status === 'Break In') {
      setCurrentStatus('logged_in');
    } else if (status === 'Logout' || status === 'logout') {
      setCurrentStatus('not_logged_in');
    }
  };

  useEffect(() => {
    if (userType) {
      fetchData();
    }
  }, [fetchData, userType]);

  const filteredItems = Array.isArray(attendanceData)
    ? attendanceData?.filter(
        (item) =>
          item &&
          ((typeof item.trainer === 'string' && item.trainer.toLowerCase().includes(filterText.toLowerCase())) ||
            (typeof item.topic === 'string' && item.topic.toLowerCase().includes(filterText.toLowerCase())) ||
            (typeof item.sub_topic === 'string' && item.sub_topic.toLowerCase().includes(filterText.toLowerCase())) ||
            (typeof item.student === 'string' && item.student.toLowerCase().includes(filterText.toLowerCase())) ||
            (typeof item.course_name === 'string' && item.course_name.toLowerCase().includes(filterText.toLowerCase())) ||
            (typeof item.batch_name === 'string' && item.batch_name.toLowerCase().includes(filterText.toLowerCase())) ||
            (typeof item.status === 'string' && item.status.toLowerCase().includes(filterText.toLowerCase())))
      )
    : [];

  const subHeaderComponentMemo = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText('');
      }
    };

    return (
      <Box sx={{ p: 2 }}>
        <Box>
          <TextField
            placeholder="Search..."
            variant="outlined"
            size="small"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchNormal1 size={20} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {filterText && (
                    <IconButton onClick={handleClear} edge="end" size="small">
                      <CloseSquare size={20} />
                    </IconButton>
                  )}
                </InputAdornment>
              )
            }}
          />
        </Box>
      </Box>
    );
  }, [filterText, resetPaginationToggle]);

  const handleLoginSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const subTopicsString = selectedSubTopics.join(', ');
      const topicTitles = selectedTopics
        .map((topicId) => {
          const topic = topics.find((t) => t.topic_id === topicId);
          return topic?.title || '';
        })
        .filter((title) => title !== '')
        .join(', ');

      const newRecord = {
        trainer: userId,
        topic: topicTitles,
        sub_topic: subTopicsString,
        course: selectedCourse,
        new_batch: selectedBatch,
        status: reason
      };

      const res = await axiosInstance.post(`${APP_PATH_BASE_URL}api/trainer_attendance/${userId}`, newRecord, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json'
        }
      });

      if (res.data.success === true) {
        fetchData();
        setLoginDialogOpen(false);
        // setLoginDetails({ topic: '', sub_topic: '' });
        setSelectedSubTopics([]);
        setSelectedTopics([]);
        setReason('');
      } else {
        Swal.fire({
          title: 'Error!',
          text: res?.data?.message || 'Error submitting Attendance data. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (userType === 'student') {
        const newRecord = {
          date: currentDateTime,
          student: regId,
          status: reason,
          course: selectedCourse,
          new_batch: selectedBatch
        };
        const res = await axiosInstance.post(`${APP_PATH_BASE_URL}api/attendance/${regId}`, newRecord);
        if (res.data.success === true) {
          fetchData();
          setReason('');
        } else {
          Swal.fire({
            title: 'Error!',
            text: res?.data?.message || 'Error submitting Attendance data. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      } else {
        if (reason === 'Login') {
          setLoginDialogOpen(true);
          setIsSubmitting(false); // Reset here since we're not making API call
          return;
        }

        const newRecord = {
          trainer: userId,
          topic: '',
          sub_topic: '',
          status: reason,
          course: selectedCourse,
          new_batch: selectedBatch
        };

        await axiosInstance.post(`${APP_PATH_BASE_URL}api/trainer_attendance/${userId}`, newRecord, {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        });

        fetchData();
        setReason('');
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Error submitting Attendance data. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailableOptions = () => {
    switch (currentStatus) {
      case 'not_logged_in':
        return ['Login'];
      case 'logged_in':
        return ['Break Out', 'Logout'];
      case 'on_break':
        return ['Break In'];
      default:
        return [];
    }
  };

  const columns =
    userType === 'tutor'
      ? [
          {
            name: 'S.No.',
            selector: (row) => row.sno,
            sortable: true,
            width: '120px'
          },
          {
            name: 'Trainer Id',
            selector: (row) => row.trainer,
            sortable: true,
            width: '120px'
          },
          {
            name: 'Batch',
            selector: (row) => row.title,
            sortable: true,
            width: '150px'
          },
          {
            name: 'Course Name',
            cell: (row) => (
              <Tooltip title={row.course_name || ''} arrow placement="top">
                <span
                  style={{
                    display: 'inline-block',
                    width: '100%',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {row.course_name}
                </span>
              </Tooltip>
            ),
            sortable: true,
            width: '200px'
          },
          {
            name: 'Topic',
            selector: (row) => row.topic,
            sortable: true,
            width: '200px',
            cell: (row) => (
              <Tooltip title={row.topic || ''} arrow placement="top">
                <span
                  style={{
                    display: 'inline-block',
                    width: '100%',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {row.topic}
                </span>
              </Tooltip>
            )
          },
          {
            name: 'Sub Topic',
            selector: (row) => row.sub_topic,
            sortable: true,
            width: '200px',
            cell: (row) => (
              <Tooltip title={row.sub_topic || ''} arrow placement="top">
                <span
                  style={{
                    display: 'inline-block',
                    width: '100%',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {row.sub_topic}
                </span>
              </Tooltip>
            )
          },
          {
            name: 'Date & Time',
            selector: (row) => formatDateTime(row.date),
            sortable: true,
            width: '180px'
          },
          {
            name: 'Status',
            selector: (row) => row.status,
            sortable: true,
            width: '120px'
          }
        ]
      : [
          {
            name: 'S.No.',
            selector: (row) => row.sno,
            sortable: true,
            width: '120px'
          },
          {
            name: 'Student Id',
            selector: (row) => row.student,
            sortable: true
          },
          {
            name: 'Batch',
            selector: (row) => row.new_batch_title,
            sortable: true
          },
          {
            name: 'Course',
            selector: (row) => row.course_name || row.course,
            sortable: true
          },
          {
            name: 'Date & Time',
            selector: (row) => formatDateTime(row.date),
            sortable: true
          },
          {
            name: 'Status',
            selector: (row) => row.status,
            sortable: true,
            width: '150px'
          }
        ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Box sx={{ width: '100%', px: { xs: 1, sm: 2, md: 10 } }}>
        <Grid container sx={{ minHeight: { xs: '50vh', md: '50vh', lg: '40vh' } }}>
          {/* Current Date & Time Row */}
          <Grid container item xs={12} alignItems="center">
            <Grid item xs={12} md={4} sx={{ pl: { xs: 0, md: 3 } }}>
              <InputLabel>Current Date & Time</InputLabel>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                value={formatDateTime(currentDateTime, { includeSeconds: true })}
                InputProps={{ readOnly: true }}
                sx={{
                  width: { xs: '100%', sm: 300, md: 400 },
                  maxWidth: '100%'
                }}
              />
            </Grid>
          </Grid>

          {/* Select Course Row */}
          <Grid container item xs={12} alignItems="center">
            <Grid item xs={12} md={4} sx={{ pl: { xs: 0, md: 3 } }}>
              <InputLabel>Course *</InputLabel>
            </Grid>
            <Grid item xs={12} md={8}>
              <Select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                displayEmpty
                fullWidth
                sx={{
                  width: { xs: '100%', sm: 300, md: 400 },
                  maxWidth: '100%'
                }}
              >
                <MenuItem value="">Select Course</MenuItem>
                {courses?.map((course) => (
                  <MenuItem key={course.course_id || course.course} value={course.course_id || course.course}>
                    {course.course_name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>

          {/* Select Batch Row - Only if tutor */}
          {userType === 'tutor' && (
            <Grid container item xs={12} alignItems="center">
              <Grid item xs={12} md={4} sx={{ pl: { xs: 0, md: 3 } }}>
                <InputLabel>Batch *</InputLabel>
              </Grid>
              <Grid item xs={12} md={8}>
                <Select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  displayEmpty
                  fullWidth
                  sx={{
                    width: { xs: '100%', sm: 300, md: 400 },
                    maxWidth: '100%'
                  }}
                >
                  <MenuItem value="">Select Batch</MenuItem>
                  {batches?.map((b) => (
                    <MenuItem key={b.batch_id} value={b.batch_id}>
                      {b.batch_name}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            </Grid>
          )}

          {/* Reason Row */}
          <Grid container item xs={12} alignItems="center">
            <Grid item xs={12} md={4} sx={{ pl: { xs: 0, md: 3 } }}>
              <InputLabel>Reason *</InputLabel>
            </Grid>
            <Grid item xs={12} md={8}>
              <Select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                displayEmpty
                fullWidth
                sx={{
                  width: { xs: '100%', sm: 300, md: 400 },
                  maxWidth: '100%'
                }}
              >
                <MenuItem value="">Select Option</MenuItem>
                {getAvailableOptions().map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>

          {/* Submit Button Centered */}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!(reason && (userType !== 'tutor' || selectedBatch) && selectedCourse)}
              sx={{ height: '40px', width: { xs: '60%', sm: 120, md: 150 }, mt: 1 }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Grid>
        </Grid>

        {subHeaderComponentMemo}

        {/* Responsive DataTable */}
        <Box sx={{ width: '100%', overflowX: 'auto', mt: 2 }}>
          {/* Replace with your DataTable, here is a placeholder */}
          <DataTable
            columns={columns}
            data={filteredItems}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[5, 10, 20, 30]}
            highlightOnHover
            responsive
          />
        </Box>

        {/* Login Details Dialog */}
        <Dialog
          maxWidth="sm"
          fullWidth
          open={loginDialogOpen}
          onClose={() => setLoginDialogOpen(false)}
          aria-labelledby="login-details-dialog"
          PaperProps={{
            sx: { width: { xs: '95%', sm: '80%', md: '60%' }, m: 0 }
          }}
        >
          <DialogTitle sx={{ pr: 6 }}>
            Enter Training Details
            <IconButton
              aria-label="close"
              onClick={() => setLoginDialogOpen(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8
              }}
            >
              <CloseSquare />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {/* Topic Autocomplete */}
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel>Topics *</FormLabel>
                  <Autocomplete
                    multiple
                    id="topics-select"
                    options={topics || []}
                    getOptionLabel={(option) => option.title}
                    value={topics?.filter((topic) => selectedTopics.includes(topic.topic_id))}
                    onChange={(event, newValue) => {
                      setSelectedTopics(newValue.map((topic) => topic.topic_id));
                    }}
                    renderInput={(params) => <TextField {...params} placeholder="Select topics..." />}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={option.topic_id}
                          label={option.title}
                          variant="outlined"
                          color="secondary"
                          size="medium"
                        />
                      ))
                    }
                    isOptionEqualToValue={(option, value) => option.topic_id === value.topic_id}
                    disabled={!selectedCourse || topics.length === 0}
                  />
                </Stack>
              </Grid>

              {/* Sub Topic Autocomplete */}
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel>Sub Topics *</FormLabel>
                  <Autocomplete
                    multiple
                    id="sub_topics"
                    options={subTopics || []}
                    getOptionLabel={(option) => option}
                    value={selectedSubTopics}
                    onChange={(event, newValue) => {
                      setSelectedSubTopics(newValue);
                    }}
                    renderInput={(params) => <TextField {...params} placeholder="Select sub topics..." />}
                    renderTags={(value, getTagProps) =>
                      value.map((subTopic, index) => (
                        <Chip {...getTagProps({ index })} key={index} label={subTopic} variant="outlined" color="secondary" size="medium" />
                      ))
                    }
                    filterOptions={(options = [], state) => {
                      return options.filter((option) => option.toLowerCase().includes(state.inputValue.toLowerCase()));
                    }}
                    isOptionEqualToValue={(option, value) => option === value}
                    renderOption={(props, option) => (
                      <li {...props} key={option}>
                        {option}
                      </li>
                    )}
                    disabled={selectedTopics.length === 0 || subTopics.length === 0}
                  />
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ paddingRight: 3, paddingBottom: 2 }}>
            <Button
              onClick={handleLoginSubmit}
              variant="contained"
              disabled={selectedTopics.length === 0 || selectedSubTopics.length === 0}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default AttendanceTab;
