// OrganizationReportsPage.jsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  Chip,
  Stack,
  FormLabel,
  Box,
  // List,
  // ListItem,
  // ListItemText,
  Button,
  Autocomplete,
  TextField,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import MainCard from 'components/MainCard'; // Your card wrapper component
import { APP_PATH_BASE_URL } from 'config';
import axiosInstance from 'utils/axios';
import { Capitalise } from 'utils/capitalise';
import { formatDateTime } from 'utils/dateUtils';

function OrganizationReportsPage() {
  const [tab, setTab] = useState(0);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [data, setData] = useState({ students: [], courses: [], attendance_summary: [], test_summary: [] }); // Default empty
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Load organizations list on mount
  const fetchOrganizations = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/jarugandi`);
      const orgList = response.data.organizations_list || [];
      setOrganizations(orgList);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  }, []);

  // Load students and schedules data when organization changes
  const fetchOrgData = useCallback(async () => {
    if (!selectedOrg) return;
    try {
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/jarugandi/`, {
        params: { organization_id: selectedOrg }
      });
      if (response.data.success) {
        setData({
          students: response.data.students || [],
          courses: response.data.courses || [],
          attendance_summary: response.data.attendance_summary || [],
          test_summary: response.data.test_summary || []
        });
      } else {
        setData({ students: [], schedules: [], courses: [] });
      }
    } catch (error) {
      console.error('Error fetching organization data:', error);
      setData({ students: [], courses: [], attendance_summary: [], test_summary: [] });
    }
  }, [selectedOrg]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  useEffect(() => {
    fetchOrgData();
  }, [selectedOrg, fetchOrgData]);

  const students = data.students;
  const courses = data.courses;
  const attendance = data.attendance_summary;
  const assessment = data.test_summary;

  const selectedCourse = courses?.find((c) => c.course_id === selectedCourseId);

  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const selectedStudent = assessment.find((s) => s.student_id === selectedStudentId);

  console.log('data :', data);

  return (
    <MainCard maxWidth="xl" sx={{ mt: 4 }}>
      <Grid sx={{ mb: 3 }}>
        <Stack direction="column" spacing={1.5} sx={{ px: 2 }}>
          <FormLabel>Select Organization:</FormLabel>
          <Autocomplete
            id="student-select"
            options={organizations || []}
            getOptionLabel={(option) => option.company_name}
            value={organizations?.find((s) => s.company_id === selectedOrg) || null}
            onChange={(event, newValue) => {
              setSelectedOrg(newValue ? newValue.company_id : '');
            }}
            isOptionEqualToValue={(option, value) => option.company_id === value.company_id}
            renderInput={(params) => <TextField {...params} placeholder="Search and select a organization" />}
            noOptionsText="No organization found"
            clearOnEscape
            clearOnBlur
            sx={{ width: 300 }}
          />
        </Stack>
      </Grid>

      {!selectedOrg ? (
        <Box sx={{ p: 2 }} textAlign="center">
          <Typography color="secondary" variant="h6">
            No organization selected.
          </Typography>
        </Box>
      ) : (
        <>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Student Records" />
            <Tab label="Class Schedules & Attendance" />
            <Tab label="Exercise Tracking" />
            <Tab label="Assessment Tracking" />
          </Tabs>

          {/* Student Records */}
          {tab === 0 && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student Name</TableCell>
                      <TableCell>Scheduled Classes</TableCell>
                      <TableCell>Exercises (Completed / Pending)</TableCell>
                      <TableCell>Assessments (Completed / Pending)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((s) => (
                      <TableRow key={s.student_id}>
                        <TableCell>{Capitalise(s.student_name)}</TableCell>
                        <TableCell>{s.total_classes || 0}</TableCell>
                        <TableCell>
                          {s.exercises_completed || 0} / {s.exercises_pending || 0}
                        </TableCell>
                        <TableCell>
                          {s.assessments_pending || 0} / {s.assessments_completed || 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Class Schedules & Attendance */}
          {tab === 1 && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Present</TableCell>
                      <TableCell>Absent</TableCell>
                      <TableCell>Absent Names</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendance.map((cs, i) => (
                      <TableRow key={i}>
                        <TableCell>{formatDateTime(cs.date, { includeTime: false })}</TableCell>
                        <TableCell>{cs.present_count || 0}</TableCell>
                        <TableCell>{cs.absent_count || 0}</TableCell>
                        <TableCell>
                          {cs.absent_names?.map((name, idx) => <Chip key={idx} label={name} color="error" size="small" sx={{ mr: 1 }} />) ||
                            ''}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Exercise Tracking */}
          {tab === 2 && (
            <Box sx={{ p: 2 }}>
              {!selectedCourse && (
                <>
                  <Typography variant="h5" gutterBottom>
                    Select a Course
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {courses.map((course) => (
                      <Grid item xs={12} md={6} lg={4} key={course.course_id}>
                        <Card
                          sx={{
                            cursor: 'pointer',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                              borderColor: 'secondary.light'
                            }
                          }}
                          onClick={() => setSelectedCourseId(course.course_id)}
                        >
                          <CardContent>
                            <Typography variant="h5" color="dark" gutterBottom>
                              {course.course_name}
                            </Typography>
                            <Stack direction="column" alignItems="stretch" sx={{ mt: 2 }}>
                              <Typography variant="subtitle" color="secondary">
                                Total Assignments: {course.total_assignments}
                              </Typography>
                              <Typography variant="subtitle" color="secondary">
                                Total Students: {course.total_students}
                              </Typography>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}

              {selectedCourse && (
                <>
                  <Button variant="normal" onClick={() => setSelectedCourseId(null)} sx={{ mb: 3 }}>
                    &larr; Back to Courses
                  </Button>

                  <Typography variant="h5" gutterBottom>
                    Course Name: {selectedCourse.course_name}
                  </Typography>

                  {selectedCourse.students.length === 0 ? (
                    <Typography>No students found for this course.</Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {selectedCourse.students.map((student) => (
                        <Grid item xs={12} sm={6} md={4} key={student.student_id}>
                          <Card sx={{ mb: 2, borderRadius: 2 }}>
                            <CardContent>
                              <Typography variant="h5" color="dark" gutterBottom>
                                {Capitalise(student.student_name)}
                              </Typography>
                              <Stack direction="column" alignItems="stretch" sx={{ mt: 2 }}>
                                <Typography variant="subtitle" color="secondary">
                                  Submitted Assignments: {student.submitted}
                                </Typography>
                                <Typography variant="subtitle" color="secondary">
                                  Pending Assignments: {student.pending}
                                </Typography>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </>
              )}
            </Box>
          )}

          {/* Assessment Tracking */}
          {tab === 3 &&
            (!selectedStudent ? (
              <Grid container spacing={2}>
                {assessment.map((student) => (
                  <Grid item xs={12} md={6} lg={4} key={student.student_id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                          borderColor: 'secondary.light'
                        }
                      }}
                      onClick={() => setSelectedStudentId(student.student_id)}
                    >
                      <CardContent>
                        <Typography variant="h5" color="dark" gutterBottom>
                          {Capitalise(student.student_name)}
                        </Typography>
                        <Stack direction="column" alignItems="stretch" sx={{ mt: 2 }}>
                          <Typography variant="subtitle" color="secondary">
                            Completed Assessments: {student.completed_tests || 0}
                          </Typography>
                          <Typography variant="subtitle" color="secondary">
                            Pending Assessments: {student.pending_tests || 0}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box>
                <Button variant="outlined" onClick={() => setSelectedStudentId(null)} sx={{ mb: 2 }}>
                  &larr; Back to Students
                </Button>

                <Typography variant="h6" gutterBottom>
                  Test Details for {selectedStudent.student_name}
                </Typography>
                {selectedStudent.test_details.length === 0 ? (
                  <Typography>No tests found for this student.</Typography>
                ) : (
                  <List dense>
                    {selectedStudent.test_details.map((test) => (
                      <ListItem key={test.test_id}>
                        <ListItemText
                          primary={`${test.test_name} (${test.course_name})`}
                          secondary={`Total Marks: ${test.total_marks || 'N/A'}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            ))}
        </>
      )}
    </MainCard>
  );
}

export default OrganizationReportsPage;
