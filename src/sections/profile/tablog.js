import MainCard from 'components/MainCard';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import axiosInstance from 'utils/axios';
import { APP_PATH_BASE_URL } from 'config';
import { Box, Typography } from '@mui/material';
import { TableContainer, TableHead, Table, TableRow, TableCell, Paper, TableBody } from '@mui/material';

export default function Logs() {
  // ================= STATE =================

  const [data, setData] = useState({});
  const [load, setLoad] = useState(false);
  const [search, setSearch] = useState('');

  // Tutor Filters
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  const auth = JSON.parse(localStorage.getItem('auth'));

  const userId = auth?.user?.employee_id || auth?.user?.user_id;

  const regId = auth?.user?.student_id || auth?.user?.employer_id;

  const userType = auth?.loginType;

  // ================= FETCH DATA =================

  const fetchData = useCallback(async () => {
    try {
      setLoad(false);

      let response;

      if (userType === 'tutor') {
        response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/trainers/${userId}`);
      } else {
        response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/student_profile/${regId}`);
      }

      const result = response.data;

      setData(result.data);
      setLoad(true);
    } catch (err) {
      setLoad(true);

      dispatch(
        openSnackbar({
          open: true,
          message: 'Failed to load data',
          variant: 'alert',
          alert: { color: 'error' }
        })
      );
    }
  }, [userId, regId, userType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ================= DROPDOWN OPTIONS (TUTOR ONLY) =================

  const courseOptions = useMemo(() => {
    if (!data?.batch) return [];

    const courses = data.batch.map((b) => b.course_name);

    return [...new Set(courses)].filter(Boolean);
  }, [data]);

  const studentOptions = useMemo(() => {
    if (!data?.batch) return [];

    const students = data.batch.flatMap((b) => b.students?.map((s) => s.student_name) || []);

    return [...new Set(students)].filter(Boolean);
  }, [data]);

  // ================= STUDENT FILTER =================

  const studentFilteredData = useMemo(() => {
    if (!data?.batch) return [];

    const key = search.toLowerCase();

    return data.batch.filter(
      (item) =>
        item.title?.toLowerCase().includes(key) ||
        item.course_name?.toLowerCase().includes(key) ||
        item.trainer_name?.toLowerCase().includes(key)
    );
  }, [search, data]);

  // ================= TUTOR FILTER =================

  const tutorFilteredData = useMemo(() => {
    if (!data?.batch) return [];

    const key = search.toLowerCase();

    return data.batch.filter((item) => {
      const studentSearchMatch = item.students?.some((stu) => stu.student_name?.toLowerCase().includes(key));

      const searchMatch = item.title?.toLowerCase().includes(key) || item.course_name?.toLowerCase().includes(key) || studentSearchMatch;

      const courseMatch = selectedCourse === '' || item.course_name === selectedCourse;

      const studentDropdownMatch = selectedStudent === '' || item.students?.some((stu) => stu.student_name === selectedStudent);

      return searchMatch && courseMatch && studentDropdownMatch;
    });
  }, [search, selectedCourse, selectedStudent, data]);

  // ================= STUDENT TABLE =================

  const StudentBatchTable = ({ load, batchData }) => {
    if (!load) return <Typography>Loading...</Typography>;

    if (!batchData || batchData.length === 0) return <Typography>No Batch Found</Typography>;

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>Batch Name</b>
              </TableCell>
              <TableCell>
                <b>Course Name</b>
              </TableCell>
              <TableCell>
                <b>Tutor Name</b>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {batchData.map((batch) => (
              <TableRow key={batch.batch_id} hover>
                <TableCell>{batch.title}</TableCell>
                <TableCell>{batch.course_name}</TableCell>
                <TableCell>{batch.trainer_name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // ================= TUTOR TABLE =================

  const TrainerBatchTable = ({ load, batchData }) => {
    if (!load) return <Typography>Loading...</Typography>;

    if (!batchData || batchData.length === 0) return <Typography>No Records Found</Typography>;

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>Batch Name</b>
              </TableCell>
              <TableCell>
                <b>Course Name</b>
              </TableCell>
              <TableCell>
                <b>Student Name</b>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {batchData.map((batch) =>
              batch.students?.map((student) => (
                <TableRow key={`${batch.batch_id}-${student.student_id}`} hover>
                  <TableCell>{batch.title}</TableCell>
                  <TableCell>{batch.course_name}</TableCell>
                  <TableCell>{student.student_name}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // ================= UI =================

  return (
    <MainCard content={false} title="Logs">
      {/* FILTER BAR */}

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          mb: 2
        }}
      >
        {/* SEARCH (BOTH USERS) */}

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            width: '220px'
          }}
        />

        {/* DROPDOWNS ONLY FOR TUTOR */}

        {userType === 'tutor' && (
          <>
            {/* COURSE FILTER */}

            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{ padding: '8px', borderRadius: '6px' }}
            >
              <option value="">All Courses</option>
              {courseOptions.map((course, i) => (
                <option key={i} value={course}>
                  {course}
                </option>
              ))}
            </select>

            {/* STUDENT FILTER */}

            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              style={{ padding: '8px', borderRadius: '6px' }}
            >
              <option value="">All Students</option>
              {studentOptions.map((stu, i) => (
                <option key={i} value={stu}>
                  {stu}
                </option>
              ))}
            </select>
          </>
        )}
      </Box>

      {/* TABLE DISPLAY */}

      {userType === 'student' && <StudentBatchTable load={load} batchData={studentFilteredData} />}

      {userType === 'tutor' && <TrainerBatchTable load={load} batchData={tutorFilteredData} />}
    </MainCard>
  );
}
