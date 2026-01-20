import { Grid, Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody, Typography, Box } from '@mui/material';
import MainCard from 'components/MainCard';
import { useLocation, useNavigate } from 'react-router-dom';
import { Capitalise } from 'utils/capitalise';

const Reports = () => {
  const location = useLocation();
  const { per_courses = [] } = location.state || {};
  const navigate = useNavigate();

  const handleRowClick = (student) => {
    navigate(`/students/${student.student_id}`, {
      state: {
        name: student.student_name,
        notification: 'Exercise',
        student_id: student.student_id
      }
    });
  };

  return (
    <MainCard title="Assignment report">
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {per_courses.map((course) => (
              <Grid item xs={12} key={course.course_id}>
                <Box mb={3}>
                  {' '}
                  {/* Adds margin-bottom for spacing between courses */}
                  <Typography variant="h4" gutterBottom>
                    {course.course_name}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Total Assignments: {course.total_assignments}, Total Students: {course.total_students}
                  </Typography>
                  <Table sx={{ mb: 2 }}>
                    {' '}
                    {/* Margin bottom after table */}
                    <TableHead>
                      <TableRow>
                        <TableCell>Student Name</TableCell>
                        <TableCell>Submitted</TableCell>
                        <TableCell>Pending</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {course.students.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} align="center">
                            No students enrolled.
                          </TableCell>
                        </TableRow>
                      ) : (
                        course.students.map((student) => (
                          <TableRow key={student.student_id}>
                            <TableCell>{Capitalise(student.student_name)}</TableCell>
                            <TableCell
                              onClick={() => {
                                handleRowClick(student);
                              }}
                              style={{ cursor: 'pointer', color: 'blue' }}
                            >
                              {student.submitted}
                            </TableCell>
                            <TableCell
                              onClick={() => {
                                handleRowClick(student);
                              }}
                              style={{ cursor: 'pointer', color: 'blue' }}
                            >
                              {student.pending}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </MainCard>
  );
};

export default Reports;
