// ReportsPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
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
  Paper,
  CircularProgress,
  Chip,
  Grid,
  Alert,
  TableContainer,
  useTheme,
  useMediaQuery,
  FormLabel,
  TextField,
  Autocomplete,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { People, PeopleOutline, Schedule } from '@mui/icons-material';
import axiosInstance from 'utils/axios';
import { APP_PATH_BASE_URL } from 'config';
import MainCard from 'components/MainCard';
import { CloseSquare, DocumentDownload, SearchNormal1 } from 'iconsax-react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import 'assets/css/DataTable.css';
import { formatDateTime } from 'utils/dateUtils';

// Add these imports for export functionality
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define columns for export
const getExportColumns = () => {
  return [
    { name: 'S.No', selector: (row, index) => index + 1 },
    { name: 'Date', selector: (row) => formatDateTime(row.scheduled_date, { includeTime: false }) },
    { name: 'Batch', selector: (row) => row.title || '-' },
    { name: 'Course', selector: (row) => row.course_name || '-' },
    { name: 'Time Slot', selector: (row) => `${row.start_time || '-'} - ${row.end_time || '-'}` },
    { name: 'Login Time', selector: (row) => row.login || '-' },
    { name: 'Logout Time', selector: (row) => row.logout || '-' },
    { name: 'Working Hours', selector: (row) => `${(parseFloat(row.total_working_hours) || 0).toFixed(1)} hours` },
    { name: 'Status', selector: (row) => row.status || '-' }
  ];
};

function TutorReportsPage() {
  const [selectedTutorId, setSelectedTutorId] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [tutors, setTutors] = useState([]);
  const [reportData, setReportData] = useState({
    report: [],
    courses: [],
    batches: [],
    category: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterText, setFilterText] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Fetch tutors list on component mount
  const fetchTutors = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`${APP_PATH_BASE_URL}api/jarugandi`);
      setTutors(res.data.trainers_list || []);
    } catch (error) {
      console.error('Error fetching tutors:', error);
      setError('Failed to load tutors list');
    }
  }, []);

  // Fetch report data when tutor is selected
  const fetchReportData = useCallback(async (tutorId) => {
    if (!tutorId) return;

    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get(`${APP_PATH_BASE_URL}api/jarugandi/`, {
        params: { trainer_id: tutorId }
      });

      setReportData(
        res.data.success
          ? {
              report: res.data.report || [],
              courses: res.data.courses || [],
              batches: res.data.batches || [],
              category: res.data.category || []
            }
          : {
              report: [],
              courses: [],
              batches: [],
              category: []
            }
      );
      setCourses(res.data.courses || []);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError('Failed to load report data');
      setReportData({
        attendance_report: [],
        student_records: []
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  useEffect(() => {
    if (selectedTutorId) {
      fetchReportData(selectedTutorId);
    }
  }, [selectedTutorId, fetchReportData]);

  const filteredData = useMemo(
    () =>
      reportData.report.filter((item) => {
        // If no filters are applied, return all items
        if (!filterText && !selectedCourse && !selectedBatch && !selectedCategory && !startDate && !endDate) {
          return true;
        }

        // Pre-compute lowercase filter text once
        const lowerFilterText = filterText?.toLowerCase() || '';

        // Apply text filter
        if (filterText) {
          const matchesText =
            lowerFilterText === '' ||
            (item.course && item.course.toLowerCase().includes(lowerFilterText)) ||
            (item.course_name && item.course_name.toLowerCase().includes(lowerFilterText)) ||
            (item.batch && item.batch.toLowerCase().includes(lowerFilterText)) ||
            (item.status && item.status.toLowerCase().includes(lowerFilterText)) ||
            (item.title && item.title.toLowerCase().includes(lowerFilterText)) ||
            (item.batch_name && item.batch_name.toLowerCase().includes(lowerFilterText)) ||
            (item.trainer_name && item.trainer_name.toLowerCase().includes(lowerFilterText)) ||
            (item.total_working_hours && item.total_working_hours.toLowerCase().includes(lowerFilterText));

          if (!matchesText) return false;
        }

        // Apply course filter
        if (selectedCourse) {
          const courseMatch = item.course_id === selectedCourse.course_id;
          if (!courseMatch) return false;
        }

        // Apply batch filter
        if (selectedBatch) {
          const batchMatch = item.batch_id === selectedBatch.batch__batch_id;
          if (!batchMatch) return false;
        }

        // Apply category filter
        if (selectedCategory) {
          const categoryMatch = item.category_id === selectedCategory.category_id;
          if (!categoryMatch) return false;
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
    [reportData, filterText, selectedCourse, selectedBatch, selectedCategory, startDate, endDate]
  );

  const handleTutorChange = (tutorId) => {
    setSelectedTutorId(tutorId);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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

  // Prepare data for export - Fixed parameter
  const prepareExportData = (dataToExport) => {
    const columns = getExportColumns(); // Remove the 'mode' parameter
    return dataToExport.map((row, index) => {
      const exportRow = {};
      columns.forEach((col) => {
        const value = col.selector ? col.selector(row, index) : row[col.name.toLowerCase().replace(/ /g, '_')];
        exportRow[col.name] = value !== undefined ? value : '';
      });
      return exportRow;
    });
  };

  // Export to Excel - Updated file name
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
      XLSX.utils.book_append_sheet(wb, ws, 'TutorAttendanceData');

      // Updated file name for tutor reports
      const tutorName = selectedTutor ? selectedTutor.full_name.replace(/\s+/g, '_') : 'tutor';
      XLSX.writeFile(wb, `tutor_attendance_report_${tutorName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel');
    }
  };

  // Export to PDF - Updated file name
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

      // Updated title and file name for tutor reports
      const tutorName = selectedTutor ? selectedTutor.full_name : 'Tutor';
      doc.text(`Tutor Attendance Report - ${tutorName} - ${new Date().toLocaleDateString()}`, 14, 15);

      autoTable(doc, {
        head: [headers],
        body: body,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });

      // Updated file name for tutor reports
      const fileNameTutorName = selectedTutor ? selectedTutor.full_name.replace(/\s+/g, '_') : 'tutor';
      doc.save(`tutor_attendance_report_${fileNameTutorName}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export to PDF');
    }
  };

  const selectedTutor = tutors.find((t) => t.employee_id === selectedTutorId);

  return (
    <MainCard sx={{ mt: 2, background: theme.palette.background.paper }}>
      {/* Header Section */}
      <Box sx={{ mb: 3, mt: 2, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
          Tutor Performance Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Monitor tutor performance, student progress, and attendance records
        </Typography>
      </Box>

      {/* Tutor Selection */}
      <Card sx={{ mb: 3, p: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: isMobile ? 'flex-end' : 'flex-end' }}>
                <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Select Tutor</FormLabel>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                id="tutor-select"
                options={tutors}
                getOptionLabel={(option) => `${option.full_name} (${option.employee_id})`}
                value={tutors.find((tutor) => tutor.employee_id === selectedTutorId) || null}
                onChange={(_, newValue) => {
                  handleTutorChange(newValue ? newValue.employee_id : '');
                }}
                isOptionEqualToValue={(option, value) => option.employee_id === value.employee_id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select Tutor"
                    variant="outlined"
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: <>{params.InputProps.endAdornment}</>
                    }}
                  />
                )}
                sx={{ width: '100%' }}
              />
            </Grid>
            {selectedTutor ? (
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: isMobile ? 'flex-start' : 'flex-start' }}>
                  <People color="primary" />
                  <Box>
                    <Typography variant="h6">{selectedTutor.full_name}</Typography>
                  </Box>
                </Box>
              </Grid>
            ) : null}
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!selectedTutor ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PeopleOutline sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            select a tutor to view reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select an item from the dropdown above to view reports
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Tabs Section */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  px: 2,
                  '& .MuiTab-root': { minHeight: 60 }
                }}
                variant={isMobile ? 'scrollable' : 'standard'}
                centered={!isMobile}
              >
                {/* <Tab icon={<People />} label="Student Records" iconPosition="start" /> */}
                <Tab icon={<Schedule />} label="Attendance Report" iconPosition="start" />
              </Tabs>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ p: isMobile ? 1 : 2 }}>
                  {activeTab === 0 && (
                    <>
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
                              flex: { xs: '1 1 auto', sm: '1 1 200px' },
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
                            options={reportData?.category || []}
                            getOptionLabel={(option) => option.category_name || ''}
                            value={selectedCategory}
                            onChange={(event, newValue) => {
                              setSelectedCategory(newValue);
                            }}
                            size="small"
                            sx={{
                              flex: { xs: '1 1 auto', sm: '1 1 200px' },
                              minWidth: { xs: 'auto', sm: 200 }
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

                          {/* Course filter */}
                          <Autocomplete
                            id="course_id"
                            options={courses || []}
                            getOptionLabel={(option) => option.course_name || ''}
                            value={selectedCourse}
                            onChange={(event, newValue) => {
                              setSelectedCourse(newValue);
                            }}
                            size="small"
                            sx={{
                              flex: { xs: '1 1 auto', sm: '1 1 250px' },
                              minWidth: { xs: 'auto', sm: 200 }
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
                            options={reportData?.batches || []}
                            getOptionLabel={(option) => option.batch__title || ''}
                            value={selectedBatch}
                            onChange={(event, newValue) => {
                              setSelectedBatch(newValue);
                            }}
                            size="small"
                            sx={{
                              flex: { xs: '1 1 auto', sm: '1 1 200px' },
                              minWidth: { xs: 'auto', sm: 200 }
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
                              return options.filter((option) =>
                                option.batch__title?.toLowerCase().includes(state.inputValue.toLowerCase())
                              );
                            }}
                            isOptionEqualToValue={(option, value) => option.batch__batch_id === value.batch__batch_id}
                            renderOption={(props, option) => (
                              <li {...props} key={option.batch__batch_id}>
                                {option.batch__title}
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
                              flex: { xs: '1 1 auto', sm: '0 1 auto' }
                            }}
                          >
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                              <DatePicker
                                label="From Date"
                                value={startDate}
                                onChange={(date) => setStartDate(date)}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    size="small"
                                    sx={{
                                      width: { xs: '100%', sm: 160 },
                                      '& .MuiInputBase-root': {
                                        fontSize: '0.75rem',
                                        height: 40
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
                                      width: { xs: '100%', sm: 160 },
                                      '& .MuiInputBase-root': {
                                        fontSize: '0.75rem',
                                        height: 40
                                      },
                                      '& input': {
                                        padding: '8px 12px'
                                      }
                                    }}
                                  />
                                )}
                              />
                            </LocalizationProvider>
                            {(startDate || endDate) && (
                              <IconButton
                                onClick={handleClearDates}
                                size="small"
                                title="Clear dates"
                                sx={{
                                  alignSelf: { xs: 'flex-end', sm: 'center' },
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

                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead sx={{ bgcolor: 'grey.50' }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700 }}>S.No</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Batch</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Course</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Time Slot</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Login Time</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Logout Time</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Working Hours</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredData?.length > 0 ? (
                              filteredData?.map((attendance, index) => {
                                const workingHours = parseFloat(attendance.total_working_hours) || 0;

                                return (
                                  <TableRow key={index} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                                    <TableCell>
                                      <Typography fontWeight={600} variant="body2">
                                        {index + 1}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography fontWeight={600} variant="body2">
                                        {formatDateTime(attendance.scheduled_date, { includeTime: false })}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography fontWeight={600} variant="body2">
                                        {attendance.title}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography fontWeight={600} variant="body2">
                                        {attendance.course_name}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" fontWeight={600}>{`${attendance.start_time || '-'} - ${
                                        attendance.end_time || '-'
                                      }`}</Typography>
                                    </TableCell>
                                    <TableCell>
                                      {attendance.login ? (
                                        <Chip label={attendance.login} color="primary" size="small" />
                                      ) : (
                                        <Chip label="-" color="default" size="small" />
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {attendance.logout ? (
                                        <Chip label={attendance.logout} color="secondary" size="small" />
                                      ) : (
                                        <Chip label="-" color="default" size="small" />
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Typography fontWeight={600} variant="body2">
                                        {workingHours.toFixed(1)} hours
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography fontWeight={600} variant="body2">
                                        <Chip
                                          label={attendance.status}
                                          color={
                                            attendance.status === 'Present'
                                              ? 'success'
                                              : attendance.status === 'Absent'
                                              ? 'error'
                                              : 'default'
                                          }
                                          size="small"
                                        />
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            ) : (
                              <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                  <Typography color="text.secondary">No attendance records found for this tutor</Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </MainCard>
  );
}

export default TutorReportsPage;
