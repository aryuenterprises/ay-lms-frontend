import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Typography,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Stack,
  FormLabel,
  Box,
  Button,
  Autocomplete,
  TextField,
  Paper,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  TableContainer,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import MainCard from 'components/MainCard';
import { APP_PATH_BASE_URL } from 'config';
import axiosInstance from 'utils/axios';
import { Capitalise } from 'utils/capitalise';
import { formatDateTime } from 'utils/dateUtils';
import { useLocation } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/PeopleOutline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SchoolIcon from '@mui/icons-material/School';
import PropTypes from 'prop-types';
import 'assets/css/commonStyle.css';
import { CloseSquare, DocumentDownload, SearchNormal1 } from 'iconsax-react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Add these imports for export functionality
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define columns for export
const getExportColumns = (mode) => {
  const baseColumns = [
    { name: 'S.No', selector: (row) => row.sno },
    { name: 'Date', selector: (row) => formatDateTime(row.scheduled_date, { includeTime: false }) },
    { name: 'Time Slot', selector: (row) => `${row.start_time || '-'} - ${row.end_time || '-'}` },
    { name: 'Course', selector: (row) => row.course_name },
    { name: 'Batch', selector: (row) => row.title },
    { name: 'Tutor', selector: (row) => row.trainer_name || '-' }
  ];

  if (mode === 'organization') {
    return [
      ...baseColumns,
      { name: 'Present Count', selector: (row) => row.attendance?.present_count || 0 },
      { name: 'Absent Count', selector: (row) => row.attendance?.absent_count || 0 },
      { name: 'Absent Students', selector: (row) => (row.attendance?.absent_names || []).join(', ') }
    ];
  } else {
    return [...baseColumns, { name: 'Status', selector: (row) => Capitalise(row.status) }];
  }
};

const ReportSelector = ({ mode, organizations, students, selectedOrg, selectedStudent, setSelectedOrg, setSelectedStudent, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Card sx={{ mb: 3, p: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: isMobile ? 'flex-end' : 'flex-end' }}>
              <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>
                {mode === 'organization' ? 'Select Organization' : 'Select Student'}
              </FormLabel>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              id="select-id"
              options={mode === 'organization' ? organizations : students}
              getOptionLabel={(option) => (mode === 'organization' ? option.company_name : Capitalise(option.student_name))}
              value={
                mode === 'organization'
                  ? organizations.find((or) => or.company_id === selectedOrg) || null
                  : students.find((s) => s.student_id === selectedStudent) || null
              }
              onChange={(_, newValue) => {
                if (mode === 'organization') {
                  setSelectedOrg(newValue ? newValue.company_id : '');
                } else {
                  setSelectedStudent(newValue ? newValue.student_id : '');
                }
              }}
              isOptionEqualToValue={(option, value) =>
                mode === 'organization' ? option.company_id === value.company_id : option.student_id === value.student_id
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={`Select ${mode === 'organization' ? 'Organization' : 'Student'}`}
                  variant="outlined"
                  size="small"
                  disabled={loading}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
              // noOptionsText={mode === 'organization' ? 'No organization found' : 'No students found'}
              sx={{ width: '100%' }}
            />
          </Grid>

          {(mode === 'organization' && selectedOrg) || (mode === 'student' && selectedStudent) ? (
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: isMobile ? 'flex-start' : 'flex-start' }}>
                <SchoolIcon color="primary" />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {mode === 'organization'
                      ? organizations.find((o) => o.company_id === selectedOrg)?.company_name
                      : Capitalise(students.find((s) => s.student_id === selectedStudent)?.student_name)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ) : null}
        </Grid>
      </CardContent>
    </Card>
  );
};

ReportSelector.propTypes = {
  mode: PropTypes.string.isRequired,
  organizations: PropTypes.array.isRequired,
  students: PropTypes.array.isRequired,
  selectedOrg: PropTypes.number.isRequired,
  selectedStudent: PropTypes.number.isRequired,
  setSelectedOrg: PropTypes.func.isRequired,
  setSelectedStudent: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
};

const EmptyState = ({ message, icon: Icon }) => (
  <Paper sx={{ p: 6, textAlign: 'center', background: 'transparent' }}>
    <Icon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
    <Typography variant="h6" color="text.secondary" gutterBottom>
      {message}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Select an item from the dropdown above to view reports
    </Typography>
  </Paper>
);

EmptyState.propTypes = {
  message: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired
};

const StudentRecordTable = ({ students }) => (
  <TableContainer component={Paper} variant="outlined">
    <Table>
      <TableHead>
        <TableRow sx={{ background: 'rgba(240,240,255,0.65)' }}>
          <TableCell sx={{ fontWeight: 700 }}>S.No</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Total Classes</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Attendance</TableCell>
          {/* <TableCell sx={{ fontWeight: 700 }}>Assignments</TableCell> */}
        </TableRow>
      </TableHead>
      <TableBody>
        {students.map((student, index) => (
          <TableRow key={student.student_id || student.id} hover>
            <TableCell>
              <Typography fontWeight={600}>{index + 1}</Typography>
            </TableCell>
            <TableCell>
              <Typography fontWeight={600}>{Capitalise(student.student_name || student.name)}</Typography>
            </TableCell>
            <TableCell>
              <Typography fontWeight={600}>{student.total_classes}</Typography>
            </TableCell>
            <TableCell>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`Present: ${student.attended_classes || 0}`} color="success" size="small" />
                <Chip label={`Absent: ${student.absent_classes || 0}`} color="error" size="small" />
              </Stack>
            </TableCell>
            {/* <TableCell>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`Submitted: ${student.submitted_assignments || 0}`} color="info" size="small" />
                <Chip className="warning-chip" label={`Pending: ${student.pending_assignments || 0}`} color="warning" size="small" />
              </Stack>
            </TableCell> */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

StudentRecordTable.propTypes = {
  students: PropTypes.array.isRequired
};

const ScheduleAttendanceTable = ({ attendance, mode }) => {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow sx={{ background: 'rgba(240,240,255,0.65)' }}>
            <TableCell sx={{ fontWeight: 700 }}>S.No</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Time Slot</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Course</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Batch</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Tutor</TableCell>
            {mode === 'organization' ? (
              <>
                <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Present</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Absent</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Absent Students</TableCell>
              </>
            ) : (
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Status</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {attendance.map((cs) => (
            <TableRow key={cs.sno} hover>
              <TableCell>
                <Typography fontWeight={600}>{cs.sno}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {formatDateTime(cs.scheduled_date, { includeTime: false })}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>{`${cs.start_time || '-'} - ${cs.end_time || '-'}`}</Typography>
              </TableCell>
              <TableCell>
                {' '}
                <Typography variant="body2" fontWeight={600}>
                  {cs.course_name}
                </Typography>
              </TableCell>
              <TableCell>
                {' '}
                <Typography variant="body2" fontWeight={600}>
                  {cs.title}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {cs.trainer_name || '-'}
                </Typography>
              </TableCell>
              {mode === 'organization' ? (
                <>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Chip label={cs.attendance.present_count || 0} color="success" size="small" />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Chip label={cs.attendance.absent_count || 0} color="error" size="small" />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {(cs.attendance.absent_names || []).slice(0, 3).map((name, idx) => (
                        <Chip key={idx} label={name} color="error" size="small" />
                      ))}
                      {(cs.attendance.absent_names || []).length > 3 && (
                        <Chip label={`+${(cs.attendance.absent_names || []).length - 3}`} size="small" />
                      )}
                    </Stack>
                  </TableCell>
                </>
              ) : (
                <TableCell sx={{ textAlign: 'center' }}>
                  <Chip
                    label={Capitalise(cs.status)}
                    color={cs.status === 'Upcoming' ? 'default' : cs.status === 'Present' ? 'success' : 'error'}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

ScheduleAttendanceTable.propTypes = {
  attendance: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired
};

const ExerciseCourseTable = ({ courses, selectCourse, mode }) => (
  <TableContainer component={Paper} variant="outlined">
    <Table>
      <TableHead>
        <TableRow sx={{ background: 'rgba(240,240,255,0.65)' }}>
          <TableCell sx={{ fontWeight: 700 }}>S.No</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Course Name</TableCell>
          <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Assignments</TableCell>
          {mode === 'organization' && <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Students</TableCell>}
          <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {courses.map((course, index) => (
          <TableRow key={course.course_id} hover>
            <TableCell>
              <Typography fontWeight={600}>{index + 1}</Typography>
            </TableCell>
            <TableCell>
              <Typography fontWeight={600}>{course.course_name}</Typography>
            </TableCell>
            <TableCell sx={{ textAlign: 'center' }}>
              <Chip label={course.total_assignments} color="primary" variant="filled" sx={{ fontWeight: 600, minWidth: 60 }} />
            </TableCell>
            {mode === 'organization' && (
              <TableCell sx={{ textAlign: 'center' }}>
                <Chip label={course.total_students} color="success" variant="filled" sx={{ fontWeight: 600, minWidth: 60 }} />
              </TableCell>
            )}
            <TableCell sx={{ textAlign: 'center' }}>
              <Button variant="contained" size="small" onClick={() => selectCourse(course.course_id)} startIcon={<AssignmentIcon />}>
                View Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

ExerciseCourseTable.propTypes = {
  courses: PropTypes.array.isRequired,
  selectCourse: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired
};

const ExerciseStudentTable = ({ students, courseName, onBack }) => (
  <Box>
    <Button variant="outlined" onClick={onBack} startIcon="←" sx={{ mb: 2 }}>
      Back to Courses
    </Button>
    <Typography variant="h6" gutterBottom color="primary">
      Exercise Tracking for {courseName}
    </Typography>
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow sx={{ background: 'rgba(240,240,255,0.65)' }}>
            <TableCell sx={{ fontWeight: 700 }}>S.No</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Submitted</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Pending</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((student, index) => {
            return (
              <TableRow key={student.student_id} hover>
                <TableCell>
                  <Typography fontWeight={600}>{index + 1}</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight={600}>{Capitalise(student.student_name)}</Typography>
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Chip label={student.submitted || 0} color="success" variant="filled" sx={{ fontWeight: 600, minWidth: 60 }} />
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Chip
                    className="warning-chip"
                    label={student.pending || 0}
                    color="warning"
                    variant="filled"
                    sx={{ fontWeight: 600, minWidth: 60 }}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

ExerciseStudentTable.propTypes = {
  students: PropTypes.array.isRequired,
  courseName: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired
};

const AssessmentTable = ({ students, selectStudent }) => (
  <TableContainer component={Paper} variant="outlined">
    <Table>
      <TableHead>
        <TableRow sx={{ background: 'rgba(240,240,255,0.65)' }}>
          <TableCell sx={{ fontWeight: 700 }}>S.No</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
          <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Completed</TableCell>
          <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Pending</TableCell>
          <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {students.map((student, index) => {
          return (
            <TableRow key={student.student_id} hover>
              <TableCell>
                <Typography fontWeight={600}>{index + 1}</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={600}>{Capitalise(student.student_name)}</Typography>
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <Chip label={student.completed_tests || 0} color="success" variant="filled" sx={{ fontWeight: 600, minWidth: 60 }} />
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <Chip
                  className="warning-chip"
                  label={student.pending_tests || 0}
                  color="warning"
                  variant="filled"
                  sx={{ fontWeight: 600, minWidth: 60 }}
                />
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => selectStudent(student.student_id)}
                  startIcon={<AssessmentIcon />}
                  disabled={!student.test_details || student.test_details.length === 0}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </TableContainer>
);

AssessmentTable.propTypes = {
  students: PropTypes.array.isRequired,
  selectStudent: PropTypes.func.isRequired
};

const AssessmentDetailTable = ({ student, onBack }) => (
  <Box>
    <Button variant="outlined" onClick={onBack} startIcon="←" sx={{ mb: 2 }}>
      Back to Students
    </Button>
    <Typography variant="h6" gutterBottom color="primary">
      Assessment Details for {Capitalise(student.student_name)}
    </Typography>
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow sx={{ background: 'rgba(240,240,255,0.65)' }}>
            <TableCell sx={{ fontWeight: 700 }}>Test Name</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Course</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Total Marks</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {student.test_details && student.test_details.length > 0 ? (
            student.test_details.map((test) => (
              <TableRow key={test.test_id} hover>
                <TableCell>
                  <Typography fontWeight={600}>{test.test_name}</Typography>
                </TableCell>
                <TableCell>
                  {' '}
                  <Typography variant="body2" fontWeight={600}>
                    {test.course_name}
                  </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" fontWeight={600}>
                    {test.total_marks}
                  </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Chip label={test.status || 'Completed'} color={test.status === 'pending' ? 'warning' : 'success'} size="small" />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">No tests found for this student.</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

AssessmentDetailTable.propTypes = {
  student: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired
};

// Main Component Function
function ReportsPage() {
  const location = useLocation();
  const path = location.pathname;
  const mode = path.includes('student-reports') ? 'student' : 'organization';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [tab, setTab] = useState(0);
  const [organizations, setOrganizations] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [data, setData] = useState({
    students: [],
    courses: [],
    attendance_summary: [],
    test_summary: [],
    schedules: []
  });
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedStudentIdForAssessment, setSelectedStudentIdForAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterText, setFilterText] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filterbyCourse, setSelectedCourse] = useState('');
  const [filterbyCategory, setSelectedCategory] = useState('');
  const [filterbyBatch, setSelectedBatch] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const fetchOrganizations = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`${APP_PATH_BASE_URL}api/jarugandi`);
      setOrganizations(res.data.organizations_list || []);
    } catch (e) {
      console.error('Error fetching organizations:', e);
      setError('Failed to load organizations');
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`${APP_PATH_BASE_URL}api/jarugandi`);
      setStudents(res.data.students_list || []);
    } catch (e) {
      console.error('Error fetching students:', e);
      setError('Failed to load students');
    }
  }, []);

  const fetchData = useCallback(async () => {
    if ((mode === 'organization' && !selectedOrg) || (mode === 'student' && !selectedStudent)) {
      setData({
        students: [],
        courses: [],
        attendance_summary: [],
        test_summary: [],
        schedules: []
      });
      return;
    }

    setLoading(true);
    setError('');
    try {
      const params = mode === 'organization' ? { organization_id: selectedOrg } : { student_id: selectedStudent };
      const res = await axiosInstance.get(`${APP_PATH_BASE_URL}api/jarugandi/`, { params });

      setData(
        res.data.success
          ? {
              students: res.data.students || [],
              courses: res.data.courses || [],
              attendance_summary: res.data.attendance_summary || [],
              test_summary: res.data.test_summary || [],
              schedules: res.data.schedules || [],
              filterCourse: res.data.course || [],
              filterCategory: res.data.category || [],
              filterBatch: res.data.batch || []
            }
          : {
              students: [],
              courses: [],
              attendance_summary: [],
              test_summary: [],
              schedules: [],
              filterCourse: [],
              filterCategory: [],
              filterBatch: []
            }
      );
    } catch (e) {
      console.error('Error fetching data:', e);
      setError('Failed to load report data');
      setData({
        students: [],
        courses: [],
        attendance_summary: [],
        test_summary: [],
        schedules: []
      });
    } finally {
      setLoading(false);
    }
  }, [mode, selectedOrg, selectedStudent]);

  useEffect(() => {
    setTab(0);
    setSelectedCourseId(null);
    setSelectedStudentIdForAssessment(null);
    setData({
      students: [],
      courses: [],
      attendance_summary: [],
      test_summary: [],
      schedules: []
    });
    if (mode === 'organization') {
      setSelectedOrg('');
      fetchOrganizations();
    } else {
      setSelectedStudent('');
      fetchStudents();
    }
  }, [mode, fetchOrganizations, fetchStudents]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const courses = data.courses || [];
  const schedules = data.schedules || [];
  const assessment = data.test_summary || [];
  const attendance_summary = data.attendance_summary || [];
  // console.log('schedules :', schedules);
  const mergedData = schedules.map((schedule, index) => {
    const attendance = attendance_summary.find((att) => att.date === schedule.scheduled_date && att.batch_name === schedule.batch_name);
    return {
      ...schedule,
      sno: index + 1,
      status: schedule.status,
      attendance: attendance || {
        date: schedule.scheduled_date,
        present_count: 0,
        absent_count: 0,
        absent_names: []
      }
    };
  });

  // const attendance = mergedData.length > 0 ? mergedData : [];

  const selectedCourse = courses.find((c) => c.course_id === selectedCourseId);
  const selectedAssessmentStudent = assessment.find((s) => s.student_id === selectedStudentIdForAssessment);

  const allfilteredData = useMemo(
    () =>
      mergedData.filter((item) => {
        // If no filters are applied, return all items
        if (!filterText && !filterbyCourse && !filterbyCategory && !filterbyBatch && !startDate && !endDate) {
          return true;
        }

        // Apply text filter
        if (filterText) {
          const matchesText =
            filterText === '' ||
            item.batch_name?.toLowerCase().includes(filterText.toLowerCase()) ||
            item.class_link?.toLowerCase().includes(filterText.toLowerCase()) ||
            item.status?.toLowerCase().includes(filterText.toLowerCase()) ||
            item.trainer_id?.toLowerCase().includes(filterText.toLowerCase()) ||
            item.trainer_name?.toLowerCase().includes(filterText.toLowerCase()) ||
            item.course_name?.toLowerCase().includes(filterText.toLowerCase());

          if (!matchesText) return false;
        }

        // Apply category filter
        if (filterbyCategory) {
          const courseMatch = item.category_id === filterbyCategory.category_id;
          if (!courseMatch) return false;
        }

        // Apply course filter
        if (filterbyCourse) {
          const courseMatch = item.course_name === filterbyCourse.course_name;
          if (!courseMatch) return false;
        }

        // Apply batch filter
        if (filterbyBatch) {
          const courseMatch = item.title === filterbyBatch.title;
          if (!courseMatch) return false;
        }

        // Apply date range filter
        if (startDate || endDate) {
          // Handle invalid dates
          if (!item.scheduled_date) return false;

          const attendanceDate = new Date(item.scheduled_date);

          // Check if date is valid
          if (isNaN(attendanceDate.getTime())) return false;

          if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            if (attendanceDate < start || attendanceDate > end) return false;
          } else if (startDate) {
            const start = new Date(startDate);
            if (isNaN(start.getTime())) return false;
            if (attendanceDate < start) return false;
          } else if (endDate) {
            const end = new Date(endDate);
            if (isNaN(end.getTime())) return false;
            end.setHours(23, 59, 59, 999);
            if (attendanceDate > end) return false;
          }
        }

        return true;
      }),
    [mergedData, filterText, filterbyCourse, filterbyCategory, filterbyBatch, startDate, endDate]
  );

  const filteredData = allfilteredData.map((item, index) => ({
    ...item,
    sno: index + 1
  }));

  const handleClearDates = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const handleClear = () => {
    if (filterText) {
      setFilterText('');
    }
  };

  const handleDownloadMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDownloadMenuClose = () => {
    setAnchorEl(null);
  };

  // Prepare data for export
  const prepareExportData = (dataToExport) => {
    const columns = getExportColumns(mode);
    return dataToExport.map((row) => {
      const exportRow = {};
      columns.forEach((col) => {
        const value = col.selector ? col.selector(row) : row[col.name.toLowerCase().replace(/ /g, '_')];
        exportRow[col.name] = value !== undefined ? value : '';
      });
      return exportRow;
    });
  };

  // Export to Excel - Updated with mode-based file names
  const exportToExcel = (dataToExport) => {
    try {
      if (!dataToExport || dataToExport.length === 0) {
        alert('No data to export');
        return;
      }

      const exportData = prepareExportData(dataToExport);
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Add headers
      const headers = Object.keys(exportData[0]);
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'AttendanceData');

      // Mode-based file names
      const fileName =
        mode === 'organization'
          ? `organization_report_${new Date().toISOString().slice(0, 10)}.xlsx`
          : `student_report_${new Date().toISOString().slice(0, 10)}.xlsx`;

      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel');
    }
  };

  // Export to PDF - Updated with mode-based file names
  const exportToPDF = (dataToExport) => {
    try {
      if (!dataToExport || dataToExport.length === 0) {
        alert('No data to export');
        return;
      }

      const exportData = prepareExportData(dataToExport);
      const headers = Object.keys(exportData[0]);
      const body = exportData.map((row) => headers.map((header) => row[header] || ''));

      const doc = new jsPDF();

      // Mode-based titles and file names
      const reportTitle =
        mode === 'organization'
          ? `Organization Report - ${new Date().toLocaleDateString()}`
          : `Student Report - ${new Date().toLocaleDateString()}`;

      const fileName =
        mode === 'organization'
          ? `organization_report_${new Date().toISOString().slice(0, 10)}.pdf`
          : `student_report_${new Date().toISOString().slice(0, 10)}.pdf`;

      doc.text(reportTitle, 14, 15);

      autoTable(doc, {
        head: [headers],
        body: body,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });

      doc.save(fileName);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export to PDF');
    }
  };

  return (
    <MainCard sx={{ mt: 2, background: theme.palette.background.paper }}>
      {/* Header Section */}
      <Box sx={{ mb: 3, mt: 2, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
          {mode === 'organization' ? 'Organization Analytics Dashboard' : 'Student Performance Dashboard'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {mode === 'organization'
            ? 'Comprehensive overview of organization performance and student progress'
            : 'Track your learning progress, attendance, and assessment results'}
        </Typography>
      </Box>

      {/* Report Selector */}
      <ReportSelector
        mode={mode}
        organizations={organizations}
        students={students}
        selectedOrg={Number(selectedOrg)}
        selectedStudent={Number(selectedStudent)}
        setSelectedOrg={(id) => {
          setSelectedOrg(id);
          setTab(0);
          setSelectedCourseId(null);
          setSelectedStudentIdForAssessment(null);
        }}
        setSelectedStudent={(id) => {
          setSelectedStudent(id);
          setTab(0);
          setSelectedCourseId(null);
          setSelectedStudentIdForAssessment(null);
        }}
        loading={loading}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Content Area */}
      {!((mode === 'organization' && selectedOrg) || (mode === 'student' && selectedStudent)) ? (
        <EmptyState
          message={`Select a ${mode === 'organization' ? 'Organization' : 'Student'} to view reports`}
          icon={mode === 'organization' ? SchoolIcon : PeopleIcon}
        />
      ) : (
        <>
          {/* Tabs Section */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Tabs
                value={tab}
                onChange={(_, v) => {
                  setTab(v);
                  setSelectedStudentIdForAssessment(null);
                  setSelectedCourseId(null);
                }}
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  px: 2,
                  '& .MuiTab-root': { minHeight: 60 }
                }}
                variant={isMobile ? 'scrollable' : 'standard'}
                centered={!isMobile}
              >
                <Tab label="Student Records" icon={<PeopleIcon />} iconPosition="start" />
                <Tab label="Class Schedule & Attendance" icon={<CalendarMonthIcon />} iconPosition="start" />
                <Tab label="Exercise Tracking" icon={<AssignmentIcon />} iconPosition="start" />
                <Tab label="Assessment Tracking" icon={<AssessmentIcon />} iconPosition="start" />
              </Tabs>

              <Box sx={{ p: isMobile ? 1 : 3 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    {tab === 0 &&
                      (data.students.length > 0 ? (
                        <StudentRecordTable students={data.students} />
                      ) : (
                        <EmptyState message="No student records available" icon={PeopleIcon} />
                      ))}

                    {tab === 1 && (
                      <>
                        {/* Filter Controls */}
                        <Box
                          sx={{
                            mt: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                          }}
                        >
                          {/* First Row - Search, Category, Course, Batch */}
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: { xs: 'column', sm: 'row' },
                              gap: 2,
                              alignItems: { xs: 'stretch', sm: 'flex-start' }
                            }}
                          >
                            {/* Search filter */}
                            <TextField
                              placeholder="Search..."
                              variant="outlined"
                              size="small"
                              value={filterText}
                              name={`search${Date.now()}`}
                              onChange={(e) => setFilterText(e.target.value)}
                              sx={{
                                width: { xs: '100%', sm: 200 },
                                minWidth: { xs: 'auto', sm: 200 }
                              }}
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

                            {/* Category Filter */}
                            <Autocomplete
                              id="category_id"
                              options={data?.filterCategory || []}
                              getOptionLabel={(option) => option.category_name || ''}
                              value={filterbyCategory}
                              onChange={(event, newValue) => {
                                setSelectedCategory(newValue);
                              }}
                              size="small"
                              sx={{
                                width: { xs: '100%', sm: 180 },
                                minWidth: { xs: 'auto', sm: 180 }
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Filter by category..."
                                  InputProps={{
                                    ...params.InputProps
                                  }}
                                />
                              )}
                              filterOptions={(options = [], state) => {
                                return options.filter((option) =>
                                  option.category_name?.toLowerCase().includes(state.inputValue.toLowerCase())
                                );
                              }}
                              isOptionEqualToValue={(option, value) => option.category_id === value.category_id}
                              renderOption={(props, option) => (
                                <li {...props} key={option.category_id}>
                                  {option.category_name}
                                </li>
                              )}
                            />

                            {/* Course Filter */}
                            <Autocomplete
                              id="course_id"
                              options={data?.filterCourse || []}
                              getOptionLabel={(option) => option.course_name || ''}
                              value={filterbyCourse}
                              onChange={(event, newValue) => {
                                setSelectedCourse(newValue);
                              }}
                              size="small"
                              sx={{
                                width: { xs: '100%', sm: 180 },
                                minWidth: { xs: 'auto', sm: 180 }
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Filter by course..."
                                  InputProps={{
                                    ...params.InputProps
                                  }}
                                />
                              )}
                              filterOptions={(options = [], state) => {
                                return options.filter((option) =>
                                  option.course_name?.toLowerCase().includes(state.inputValue.toLowerCase())
                                );
                              }}
                              isOptionEqualToValue={(option, value) => option.course_id === value.course_id}
                              renderOption={(props, option) => (
                                <li {...props} key={option.course_id}>
                                  {option.course_name}
                                </li>
                              )}
                            />

                            {/* Batch Filter */}
                            <Autocomplete
                              id="batch_id"
                              options={data?.filterBatch || []}
                              getOptionLabel={(option) => option.title || ''}
                              value={filterbyBatch}
                              onChange={(event, newValue) => {
                                setSelectedBatch(newValue);
                              }}
                              size="small"
                              sx={{
                                width: { xs: '100%', sm: 180 },
                                minWidth: { xs: 'auto', sm: 180 }
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Filter by batch..."
                                  InputProps={{
                                    ...params.InputProps
                                  }}
                                />
                              )}
                              filterOptions={(options = [], state) => {
                                return options.filter((option) => option.title?.toLowerCase().includes(state.inputValue.toLowerCase()));
                              }}
                              isOptionEqualToValue={(option, value) => option.batch_id === value.batch_id}
                              renderOption={(props, option) => (
                                <li {...props} key={option.batch_id}>
                                  {option.title}
                                </li>
                              )}
                            />
                          </Box>

                          {/* Second Row - Date Range Filter */}
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: { xs: 'column', sm: 'row' },
                              alignItems: { xs: 'stretch', sm: 'center' },
                              gap: 2,
                              width: '100%'
                            }}
                          >
                            {/* Date Range Filter */}
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: 'center',
                                gap: 1,
                                width: { xs: '100%', sm: 'auto' }
                              }}
                            >
                              <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    gap: 1,
                                    width: { xs: '100%', sm: 'auto' }
                                  }}
                                >
                                  <DatePicker
                                    label="From Date"
                                    value={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                                        size="small"
                                        sx={{
                                          width: { xs: '100%', sm: 150 },
                                          '& .MuiInputBase-root': {
                                            fontSize: '0.75rem'
                                          },
                                          '& input': {
                                            padding: '8px 12px'
                                          }
                                        }}
                                      />
                                    )}
                                  />

                                  <DatePicker
                                    label="To Date"
                                    value={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                                        size="small"
                                        sx={{
                                          width: { xs: '100%', sm: 150 },
                                          '& .MuiInputBase-root': {
                                            fontSize: '0.75rem'
                                          },
                                          '& input': {
                                            padding: '8px 12px'
                                          }
                                        }}
                                      />
                                    )}
                                  />
                                </Box>
                              </LocalizationProvider>
                              {(startDate || endDate) && (
                                <IconButton
                                  onClick={handleClearDates}
                                  size="small"
                                  title="Clear dates"
                                  sx={{
                                    alignSelf: { xs: 'flex-start', sm: 'center' },
                                    mt: { xs: 1, sm: 0 }
                                  }}
                                >
                                  <CloseSquare size={20} />
                                </IconButton>
                              )}
                            </Box>
                          </Box>

                          {/* Download Button */}
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                              alignItems: 'center',
                              flex: 1
                            }}
                          >
                            <Tooltip title="Download Report">
                              <IconButton
                                variant="contained"
                                color="secondary"
                                sx={{
                                  borderRadius: 2
                                }}
                                onClick={handleDownloadMenuClick}
                                aria-controls="download-menu"
                                aria-haspopup="true"
                                aria-expanded={open ? 'true' : undefined}
                              >
                                <DocumentDownload />
                              </IconButton>
                            </Tooltip>
                            <Menu
                              id="download-menu"
                              anchorEl={anchorEl}
                              open={open}
                              onClose={handleDownloadMenuClose}
                              MenuListProps={{
                                'aria-labelledby': 'download-button'
                              }}
                            >
                              <MenuItem
                                onClick={() => {
                                  exportToExcel(filteredData);
                                  handleDownloadMenuClose();
                                }}
                                disabled={filteredData.length === 0}
                              >
                                Export to Excel
                              </MenuItem>
                              <MenuItem
                                onClick={() => {
                                  exportToPDF(filteredData);
                                  handleDownloadMenuClose();
                                }}
                                disabled={filteredData.length === 0}
                              >
                                Export to PDF
                              </MenuItem>
                            </Menu>
                          </Box>
                        </Box>

                        {/* Table or Empty State */}
                        {filteredData.length > 0 ? (
                          <ScheduleAttendanceTable attendance={filteredData} mode={mode} />
                        ) : (
                          <EmptyState message="No schedule data available" icon={CalendarMonthIcon} />
                        )}
                      </>
                    )}

                    {tab === 2 && (
                      <Box>
                        {!selectedCourseId ? (
                          courses.length > 0 ? (
                            <>
                              {/* <Typography variant="h6" gutterBottom color="primary">
                                Select a Course to View Exercise Details
                              </Typography> */}
                              <ExerciseCourseTable courses={courses} selectCourse={setSelectedCourseId} mode={mode} />
                            </>
                          ) : (
                            <EmptyState message="No courses available" icon={AssignmentIcon} />
                          )
                        ) : (
                          <ExerciseStudentTable
                            students={selectedCourse?.students || []}
                            courseName={selectedCourse?.course_name || ''}
                            onBack={() => setSelectedCourseId(null)}
                          />
                        )}
                      </Box>
                    )}

                    {tab === 3 && (
                      <Box>
                        {!selectedStudentIdForAssessment ? (
                          assessment.length > 0 ? (
                            <AssessmentTable students={assessment} selectStudent={setSelectedStudentIdForAssessment} />
                          ) : (
                            <EmptyState message="No assessment data available" icon={AssessmentIcon} />
                          )
                        ) : selectedAssessmentStudent ? (
                          <AssessmentDetailTable
                            student={selectedAssessmentStudent}
                            onBack={() => setSelectedStudentIdForAssessment(null)}
                          />
                        ) : (
                          <EmptyState message="Assessment data not found" icon={AssessmentIcon} />
                        )}
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </MainCard>
  );
}

export default ReportsPage;
