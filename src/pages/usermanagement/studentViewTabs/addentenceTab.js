import { useState, useEffect, useMemo } from 'react';
import { TextField, Box, Grid, InputAdornment, IconButton, InputLabel, Select, MenuItem, Button, Stack, Autocomplete } from '@mui/material';
import DataTable from 'react-data-table-component';
import { CloseSquare, SearchNormal1 } from 'iconsax-react';
import { formatDateTime } from 'utils/dateUtils';
import PropTypes from 'prop-types';
import { DatePicker, DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Swal from 'sweetalert2';
import axiosInstance from 'utils/axios';
import { APP_PATH_BASE_URL } from 'config';
import 'assets/css/DataTable.css';

const AttendanceTab = ({ attendance, course, batch, student_id, user_type }) => {
  const [filterText, setFilterText] = useState('');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [reason, setReason] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [filterCourse, setFilterCourse] = useState('');
  const [filterBatch, setFilterBatch] = useState('');

  const auth = JSON.parse(localStorage.getItem('auth'));
  const userType = auth?.loginType;

  useEffect(() => {
    if (attendance) {
      const attendanceData = attendance.map((item, index) => ({
        ...item,
        sno: index + 1
      }));

      setAttendanceData(attendanceData);
    }

    if (course) setCourses(course);
    if (batch) setBatches(batch);
  }, [attendance, course, batch]);

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);

    // Filter batches where course_trainer_assignments.course_id equals selected courseId
    if (batch) {
      const filtered = batch.filter(
        (b) => b.course_trainer_assignments && b.course_trainer_assignments && b.course_trainer_assignments[0].course_id === courseId
      );
      setBatches(filtered);
    }
  };

  const normalizeDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const filteredItems = attendanceData.filter((item) => {
    const itemDate = item.date ? normalizeDate(item.date) : null;
    const fromNormalized = fromDate ? normalizeDate(fromDate) : null;
    const toNormalized = toDate ? normalizeDate(toDate) : null;

    const textMatch =
      // (item.student && item.student.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.status && item.status.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.course_name && item.course_name.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.batch_name && item.batch_name.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.date && item.date.toLowerCase().includes(filterText.toLowerCase()));

    // course filter
    if (filterCourse) {
      if (item.course_id !== filterCourse.course_id) {
        return false;
      }
    }

    // batch filter
    if (filterBatch) {
      if (item.batch_id !== filterBatch.batch_id) {
        return false;
      }
    }

    let dateMatch = true;
    if (itemDate) {
      if (fromNormalized && toNormalized) {
        dateMatch = itemDate >= fromNormalized && itemDate <= toNormalized;
      } else if (fromNormalized) {
        dateMatch = itemDate >= fromNormalized;
      } else if (toNormalized) {
        dateMatch = itemDate <= toNormalized;
      }
    } else {
      dateMatch = !fromNormalized && !toNormalized;
    }
    return textMatch && dateMatch;
  });

  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      let res;
      if (user_type === 'tutor') {
        res = await axiosInstance.post(`${APP_PATH_BASE_URL}api/trainer_attendance/${student_id}/adumneoie`, {
          trainer: student_id,
          status: reason,
          course: selectedCourse,
          batch: selectedBatch,
          date: selectedDate
        });
      } else {
        res = await axiosInstance.post(`${APP_PATH_BASE_URL}api/attendance/${student_id}/adumneoie`, {
          student: student_id,
          status: reason,
          course: selectedCourse,
          batch: selectedBatch,
          date: selectedDate
        });
      }
      if (res.data.success) {
        const newAttendanceRecord = {
          sno: attendanceData.length + 1,
          date: selectedDate, // use the manually chosen date
          batch_name: res.data.data.batch_name,
          title: res.data.data.title,
          course_name: res.data.data.course_name,
          trainer: res.data.data.trainer || '',
          student: res.data.data.student || '',
          status: res.data.data.status
        };
        setAttendanceData([newAttendanceRecord, ...attendanceData] || []);
        setReason('');
        Swal.fire({
          title: 'Success!',
          text: res.data.message || 'Attendance recorded successfully.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: res?.data?.message || 'Error submitting Attendance data. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Error submitting Attendance data. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Allow admin to always set any reason/status
  const allOptions = ['Login', 'Logout', 'Break Out', 'Break In'];

  const subHeaderComponentMemo = useMemo(() => {
    const handleClear = () => {
      if (filterText || fromDate || toDate) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText('');
        setFromDate(null);
        setToDate(null);
      }
    };
    return (
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          // Responsive adjustments
          flexDirection: { xs: 'column', sm: 'row' },
          '& > *': {
            width: { xs: '100%', sm: 'auto' }
          }
        }}
      >
        {/* Search Field */}
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
                  <IconButton onClick={() => setFilterText('')} edge="end" size="small">
                    <CloseSquare size={20} />
                  </IconButton>
                )}
              </InputAdornment>
            )
          }}
          sx={{
            minWidth: { xs: '100%', sm: 200 },
            flex: { xs: '1 1 auto', sm: '0 1 auto' }
          }}
        />

        {/* Course Filter */}
        <Autocomplete
          id="course_id"
          options={course || []}
          getOptionLabel={(option) => option.course_name || ''}
          value={filterCourse}
          onChange={(event, newValue) => {
            setFilterCourse(newValue);
          }}
          size="small"
          sx={{
            width: { xs: '100%', sm: 180 },
            minWidth: { xs: '100%', sm: 180 },
            flex: { xs: '1 1 auto', sm: '0 1 auto' }
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
            return options.filter((option) => option.course_name?.toLowerCase().includes(state.inputValue.toLowerCase()));
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
          options={batch || []}
          getOptionLabel={(option) => option.title || ''}
          value={filterBatch}
          onChange={(event, newValue) => {
            setFilterBatch(newValue);
          }}
          size="small"
          sx={{
            width: { xs: '100%', sm: 180 },
            minWidth: { xs: '100%', sm: 180 },
            flex: { xs: '1 1 auto', sm: '0 1 auto' }
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

        {/* Date Pickers Container */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            width: { xs: '100%', sm: 'auto' },
            flexDirection: { xs: 'column', sm: 'row' }
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="From Date"
              value={fromDate}
              onChange={(newValue) => setFromDate(newValue)}
              renderInput={(params) => <TextField {...params} size="small" sx={{ width: { xs: '100%', sm: 150 } }} />}
            />
          </LocalizationProvider>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="To Date"
              value={toDate}
              onChange={(newValue) => setToDate(newValue)}
              renderInput={(params) => <TextField {...params} size="small" sx={{ width: { xs: '100%', sm: 150 } }} />}
            />
          </LocalizationProvider>
        </Box>

        {/* Clear Filters Button */}
        {(fromDate || toDate || filterText || filterCourse || filterBatch) && (
          <IconButton
            onClick={handleClear}
            edge="end"
            size="small"
            title="Clear Filters"
            sx={{
              alignSelf: { xs: 'flex-start', sm: 'center' },
              mt: { xs: 1, sm: 0 }
            }}
          >
            <CloseSquare size={20} />
          </IconButton>
        )}
      </Box>
    );
  }, [filterText, fromDate, toDate, filterCourse, filterBatch, course, batch, resetPaginationToggle]);

  const columns = [
    { name: 'S.No', selector: (row) => row.sno, sortable: true },
    user_type === 'tutor'
      ? { name: 'Tutor ID', selector: (row) => row.trainer, sortable: true }
      : { name: 'Student ID', selector: (row) => row.student, sortable: true },
    { name: 'Batch', selector: (row) => row.new_batch_title, sortable: true },
    { name: 'Course', selector: (row) => row.course_name, sortable: true },
    { name: 'Date & Time', selector: (row) => formatDateTime(row.date), sortable: true },
    { name: 'Status', selector: (row) => row.status, sortable: true, width: '150px' }
  ];

  return (
    <Grid container sx={{ minHeight: '50vh', pl: 3 }}>
      {/* Add Attendance Card */}
      {(userType === 'admin' || userType === 'super_admin') && (
        <Grid container sx={{ minHeight: { xs: '50vh', md: '50vh', lg: '40vh' } }}>
          {/* Date & Time Picker Row */}
          <Grid container item xs={12} alignItems="center">
            <Grid item xs={12} md={4} sx={{ pl: { xs: 0, md: 3 } }}>
              <Stack spacing={2} direction="row" alignItems="center" justifyContent="center">
                <InputLabel>Date & Time *</InputLabel>
              </Stack>
            </Grid>
            <Grid item xs={12} md={8}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Attendance Date & Time"
                  value={selectedDate}
                  format="dd-MM-yyyy hh:mm a"
                  onChange={setSelectedDate}
                  renderInput={(params) => <TextField fullWidth size="small" {...params} />}
                  sx={{ width: { xs: '100%', sm: 300, md: 400 }, maxWidth: '100%' }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
          {/* Select Course Row */}
          <Grid container item xs={12} alignItems="center">
            <Grid item xs={12} md={4} sx={{ pl: { xs: 0, md: 3 } }}>
              <Stack spacing={2} direction="row" alignItems="center" justifyContent="center">
                <InputLabel>Course *</InputLabel>
              </Stack>
            </Grid>
            <Grid item xs={12} md={8}>
              <Select
                value={selectedCourse}
                // onChange={(e) => setSelectedCourse(e.target.value)}
                onChange={handleCourseChange}
                displayEmpty
                fullWidth
                sx={{ width: { xs: '100%', sm: 300, md: 400 }, maxWidth: '100%' }}
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
          {/* Select Batch Row */}
          <Grid container item xs={12} alignItems="center">
            <Grid item xs={12} md={4} sx={{ pl: { xs: 0, md: 3 } }}>
              <Stack spacing={2} direction="row" alignItems="center" justifyContent="center">
                <InputLabel>Batch *</InputLabel>
              </Stack>
            </Grid>
            <Grid item xs={12} md={8}>
              <Select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                displayEmpty
                fullWidth
                sx={{ width: { xs: '100%', sm: 300, md: 400 }, maxWidth: '100%' }}
              >
                <MenuItem value="">Select Batch</MenuItem>
                {batches?.map((b) => (
                  <MenuItem key={b.batch_id} value={b.batch_id}>
                    {b.title}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>
          {/* Status Row */}
          <Grid container item xs={12} alignItems="center">
            <Grid item xs={12} md={4} sx={{ pl: { xs: 0, md: 3 } }}>
              <Stack spacing={2} direction="row" alignItems="center" justifyContent="center">
                <InputLabel>Status *</InputLabel>
              </Stack>
            </Grid>
            <Grid item xs={12} md={8}>
              <Select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                displayEmpty
                fullWidth
                sx={{ width: { xs: '100%', sm: 300, md: 400 }, maxWidth: '100%' }}
              >
                <MenuItem value="">Select Status</MenuItem>
                {allOptions.map((option) => (
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
              disabled={!(reason && selectedCourse && selectedBatch && selectedDate)}
              sx={{ height: '40px', width: { xs: '60%', sm: 120, md: 150 }, mt: 1 }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Grid>
        </Grid>
      )}
      {subHeaderComponentMemo}
      <Grid item xs={12}>
        <DataTable
          columns={columns}
          data={filteredItems}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[5, 10, 20, 30]}
          highlightOnHover
          responsive
        />
      </Grid>
    </Grid>
  );
};

export default AttendanceTab;

AttendanceTab.propTypes = {
  attendance: PropTypes.array,
  course: PropTypes.array,
  batch: PropTypes.array,
  student_id: PropTypes.string,
  user_type: PropTypes.string
};
