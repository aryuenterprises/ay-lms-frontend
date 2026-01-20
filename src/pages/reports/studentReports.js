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
  Button,
  Autocomplete,
  TextField
} from '@mui/material';
import MainCard from 'components/MainCard';
import { APP_PATH_BASE_URL } from 'config';
import axiosInstance from 'utils/axios';
import { Capitalise } from 'utils/capitalise';

function StudentReportsPage() {
  const [tab, setTab] = useState(0);
  const [studentsMap, setStudents] = useState([]);
  const [selectedstudent, setSelectedStudent] = useState('');
  const [data, setData] = useState({ students: [], schedules: [] });
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Load students list on mount
  const fetchStudents = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/jarugandi`);
      const studentList = response.data.students_list || [];
      setStudents(studentList);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }, []);

  // Load students and schedules data when organization changes
  const fetchStudentData = useCallback(async () => {
    if (!selectedstudent) return;
    try {
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/jarugandi/`, {
        params: { registration_id: selectedstudent }
      });
      if (response.data.success) {
        setData({
          students: response.data.students || [],
          schedules: response.data.schedules || [],
          courses: response.data.courses || []
        });
      } else {
        setData({ students: [], schedules: [], courses: [] });
      }
    } catch (error) {
      console.error('Error fetching organization data:', error);
      setData({ students: [], schedules: [] });
    }
  }, [selectedstudent]);

  // Fetch students list when the component mounts
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Fetch student data whenever the selected student changes
  useEffect(() => {
    fetchStudentData();
  }, [selectedstudent, fetchStudentData]);

  // Extract students, class schedules, and courses from the fetched data
  const students = data.students;
  const classSchedules = data.schedules;
  const courses = data.courses;

  // Find the selected course object based on selectedCourseId
  const selectedCourse = Array.isArray(courses) ? courses.find((c) => c.course_id === selectedCourseId) : null;

  console.log('data :', data);

  return (
    <MainCard maxWidth="xl" sx={{ mt: 4 }}>
      <Grid sx={{ mb: 3 }}>
        <Stack direction="column" spacing={1.5} sx={{ px: 2 }}>
          <FormLabel>Select Student:</FormLabel>
          <Autocomplete
            id="student-select"
            options={studentsMap || []}
            getOptionLabel={(option) => option.student_name}
            value={studentsMap?.find((s) => s.student_id === selectedstudent) || null}
            onChange={(event, newValue) => {
              setSelectedStudent(newValue ? newValue.student_id : '');
            }}
            isOptionEqualToValue={(option, value) => option.student_id === value.student_id}
            renderInput={(params) => <TextField {...params} placeholder="Search and select a student" />}
            noOptionsText="No students found"
            clearOnEscape
            clearOnBlur
            sx={{ width: 300 }}
          />
        </Stack>
      </Grid>

      {!selectedstudent ? (
        <Box sx={{ p: 2 }} textAlign="center">
          <Typography color="secondary" variant="h6">
            No student selected.
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
                    {classSchedules.map((cs, i) => (
                      <TableRow key={i}>
                        <TableCell>{cs.date}</TableCell>
                        <TableCell>{cs.present_students_count || 0}</TableCell>
                        <TableCell>{cs.absent_students_count || 0}</TableCell>
                        <TableCell>
                          {cs.absent_students_names?.map((name, idx) => (
                            <Chip key={idx} label={name} color="error" size="small" sx={{ mr: 1 }} />
                          )) || ''}
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
          {tab === 3 && (
            <Grid container spacing={2}>
              {students.map((s) => (
                <Grid item xs={12} md={6} lg={4} key={s.id}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1">{s.name}</Typography>
                      <Typography sx={{ mt: 1 }}>
                        Completed Assessments:{' '}
                        <Chip label={s.assessments?.filter((a) => a.status === 'completed').length || 0} color="success" size="small" />
                      </Typography>
                      <Typography>
                        Pending Assessments:{' '}
                        <Chip label={s.assessments?.filter((a) => a.status === 'pending').length || 0} color="warning" size="small" />
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </MainCard>
  );
}

export default StudentReportsPage;
