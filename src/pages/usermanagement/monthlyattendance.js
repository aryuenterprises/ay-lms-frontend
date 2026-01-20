import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable from 'react-data-table-component';
import {
  TextField,
  Box,
  Stack,
  Grid,
  IconButton,
  InputAdornment,
  CircularProgress,
  Chip,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Menu
} from '@mui/material';
import { CloseSquare, SearchNormal1, Calendar, DocumentDownload } from 'iconsax-react';
import MainCard from 'components/MainCard';

//css import
import 'assets/css/commonStyle.css';
import 'assets/css/DataTable.css';

// Imports
import { APP_PATH_BASE_URL } from 'config';
import { Capitalise } from 'utils/capitalise';
import axiosInstance from 'utils/axios';
import { formatDateTime } from 'utils/dateUtils';

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router';

const MonthlyAttendance = () => {
  const navigate = useNavigate();
  const [loading, setIsLoading] = useState(false);
  const [allData, setAllData] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return (new Date().getMonth() + 1).toString().padStart(2, '0');
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const auth = JSON.parse(localStorage.getItem('auth'));
  const userId = auth?.user?.employee_id || auth?.user?.student_id;
  const userType = auth?.loginType;

  const open = Boolean(anchorEl);

  const months = useMemo(
    () => [
      { value: '01', label: 'January' },
      { value: '02', label: 'February' },
      { value: '03', label: 'March' },
      { value: '04', label: 'April' },
      { value: '05', label: 'May' },
      { value: '06', label: 'June' },
      { value: '07', label: 'July' },
      { value: '08', label: 'August' },
      { value: '09', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' }
    ],
    []
  );

  // Generate years (current year and previous 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const fetchData = useCallback(
    async (month = selectedMonth, year = selectedYear) => {
      try {
        setIsLoading(true);
        setError('');
        let response;
        if (userType === 'tutor') {
          response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/trainer_attendance/${userId}/full_logs`, {
            params: {
              month: month,
              year: year
            }
          });
        } else {
          response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/attendance/${userId}/full_logs`, {
            params: {
              month: month,
              year: year
            }
          });
        }

        const result = response.data.data;

        const transformedData = result.map((item, index) => ({
          sno: index + 1,
          ...item
        }));

        setAllData(transformedData || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Error fetching attendance data');
        console.error('Error fetching attendance data:', err);
        setAllData([]);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, selectedMonth, selectedYear, userType]
  );

  useEffect(() => {
    fetchData(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear, fetchData]);

  const filteredItems = useMemo(() => {
    return allData.filter((item) => {
      const searchTerm = filterText.toLowerCase();
      return (
        filterText === '' ||
        (item.student_name && item.student_name.toLowerCase().includes(searchTerm)) ||
        (item.title && item.title.toLowerCase().includes(searchTerm)) ||
        (item.course_name && item.course_name.toLowerCase().includes(searchTerm)) ||
        (item.attendance_status && item.attendance_status.toLowerCase().includes(searchTerm))
      );
    });
  }, [allData, filterText]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleClearFilters = useCallback(() => {
    setFilterText('');
    setResetPaginationToggle(!resetPaginationToggle);
  }, [resetPaginationToggle]);

  const handleDownloadMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDownloadMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return { bg: 'success.lighter', color: 'success.main' };
      case 'login':
        return { bg: 'primary.lighter', color: 'primary.main' };
      case 'break in':
      case 'break out':
        return { bg: 'warning.lighter', color: 'warning.main' };
      case 'absent':
        return { bg: 'error.lighter', color: 'error.main' };
      default:
        return { bg: 'grey.lighter', color: 'grey.main' };
    }
  };

  const columnConfigs = {
    tutor: ['sno', 'date', 'trainer', 'batch', 'course', 'login', 'logout', 'working_hours', 'extra_working_hours', 'mark_trainer'],
    student: ['sno', 'date', 'student', 'batch', 'course', 'login', 'logout', 'mark_student']
  };

  const columnDefinitions = {
    sno: {
      name: 'S.No',
      selector: (row) => row.sno,
      sortable: true,
      width: '80px'
    },
    date: {
      name: 'Date',
      selector: (row) => formatDateTime(row.date, { includeTime: false }),
      sortable: true,
      width: '150px'
    },
    trainer: {
      name: 'Trainer Name',
      selector: (row) => Capitalise(row.trainer_name || 'N/A'),
      sortable: true,
      width: '150px'
    },
    student: {
      name: 'Student Name',
      selector: (row) => Capitalise(row.student_name || 'N/A'),
      sortable: true,
      width: '150px'
    },
    batch: {
      name: 'Batch',
      selector: (row) => row.title || 'N/A',
      sortable: true,
      width: '160px'
    },
    course: {
      name: 'Course',
      selector: (row) => row.course_name || 'N/A',
      sortable: true
    },
    login: {
      name: 'Login Time',
      selector: (row) => row.first_login_time || row.login_time || '-',
      sortable: true,
      width: '180px'
    },
    logout: {
      name: 'Logout Time',
      selector: (row) => row.last_logout_time || row.logout_time || '-',
      sortable: true,
      width: '180px'
    },
    working_hours: {
      name: 'Working Hours',
      selector: (row) => `${(parseFloat(row.working_hours) || 0).toFixed(1)} hours`,
      sortable: true,
      width: '150px'
    },
    extra_working_hours: {
      name: 'Extra Working Hours',
      selector: (row) => `${(parseFloat(row.extra_working_hours) || 0).toFixed(1)} hours`,
      sortable: true,
      width: '160px'
    },
    status: {
      name: 'Status',
      selector: (row) => row.status,
      cell: (row) => {
        const statusColors = getStatusColor(row.status);
        return (
          <Chip
            label={Capitalise(row.status || 'Unknown')}
            sx={{
              backgroundColor: statusColors.bg,
              color: statusColors.color,
              fontWeight: 600
            }}
            size="small"
          />
        );
      },
      sortable: true,
      width: '130px'
    },
    mark_trainer: {
      name: 'Marked By',
      selector: (row) => (row.marked_by_admin ? 'Admin' : 'Trainer'),
      sortable: true,
      width: '120px'
    },
    mark_student: {
      name: 'Marked By',
      selector: (row) => (row.marked_by_admin ? 'Admin' : 'Student'),
      sortable: true,
      width: '120px'
    }
  };

  const columns = useMemo(() => {
    const config = columnConfigs[userType] || columnConfigs.student;
    return config.map((columnKey) => columnDefinitions[columnKey]);
  }, [userType]);

  // Prepare data for export
  const prepareExportData = useCallback(
    (dataToExport) => {
      const exportColumns = columns;
      return dataToExport.map((row) => {
        const exportRow = {};
        exportColumns.forEach((col) => {
          const value = col.selector ? col.selector(row) : row[col.name.toLowerCase().replace(/ /g, '_')];
          exportRow[col.name] = value !== undefined ? value : '';
        });
        return exportRow;
      });
    },
    [columns]
  );

  // Get month name from value
  const getMonthName = useCallback(
    (monthValue) => {
      const month = months.find((m) => m.value === monthValue);
      return month ? month.label : 'Month';
    },
    [months]
  );

  // Export to Excel
  const exportToExcel = useCallback(
    (dataToExport) => {
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

        // Create filename with month and year
        const monthName = getMonthName(selectedMonth);
        const fileName = `monthly_attendance_${monthName}_${selectedYear}.xlsx`;

        XLSX.writeFile(wb, fileName);
      } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Failed to export to Excel');
      }
    },
    [selectedMonth, selectedYear, getMonthName, prepareExportData]
  );

  // Export to PDF
  const exportToPDF = useCallback(
    (dataToExport) => {
      try {
        if (!dataToExport || dataToExport.length === 0) {
          alert('No data to export');
          return;
        }

        const exportData = prepareExportData(dataToExport);
        const headers = Object.keys(exportData[0]);
        const body = exportData.map((row) => headers.map((header) => row[header] || ''));

        const doc = new jsPDF();

        // Create title with month and year
        const monthName = getMonthName(selectedMonth);
        const reportTitle = `Monthly Attendance Report - ${monthName} ${selectedYear}`;
        const fileName = `monthly_attendance_${monthName}_${selectedYear}.pdf`;

        // Add title
        doc.setFontSize(16);
        doc.text(reportTitle, 14, 15);

        // Add generation date
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

        // Add table
        autoTable(doc, {
          head: [headers],
          body: body,
          startY: 30,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] },
          theme: 'grid'
        });

        doc.save(fileName);
      } catch (error) {
        console.error('Error exporting to PDF:', error);
        alert('Failed to export to PDF');
      }
    },
    [selectedMonth, selectedYear, getMonthName, prepareExportData]
  );

  const subHeaderComponentMemo = useMemo(() => {
    return (
      <Grid container justifyContent="space-between" alignItems="center" spacing={2} my={3}>
        <Grid item xs={12} md={8}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {/* Month Selector */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Month</InputLabel>
              <Select
                value={selectedMonth}
                label="Month"
                onChange={handleMonthChange}
                startAdornment={
                  <InputAdornment position="start">
                    <Calendar size={18} />
                  </InputAdornment>
                }
              >
                {months.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Year Selector */}
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Year</InputLabel>
              <Select value={selectedYear} label="Year" onChange={handleYearChange}>
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Search Field */}
            <TextField
              placeholder="Search by name, batch, course..."
              variant="outlined"
              size="small"
              autoComplete="nope"
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
                      <IconButton onClick={handleClearFilters} edge="end" size="small">
                        <CloseSquare size={20} />
                      </IconButton>
                    )}
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: 250 }}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} md={4} textAlign={{ xs: 'left', md: 'right' }} mt={{ xs: 2, md: 0 }}>
          <Box>
            <Tooltip title="Download Monthly Report">
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
                  exportToExcel(filteredItems);
                  handleDownloadMenuClose();
                }}
                disabled={filteredItems.length === 0}
              >
                Export to Excel
              </MenuItem>
              <MenuItem
                onClick={() => {
                  exportToPDF(filteredItems);
                  handleDownloadMenuClose();
                }}
                disabled={filteredItems.length === 0}
              >
                Export to PDF
              </MenuItem>
            </Menu>
          </Box>
        </Grid>
      </Grid>
    );
  }, [
    selectedMonth,
    selectedYear,
    filterText,
    months,
    years,
    anchorEl,
    open,
    filteredItems,
    exportToExcel,
    exportToPDF,
    handleClearFilters
  ]);

  if (error) {
    return (
      <MainCard sx={{ borderRadius: 2 }}>
        <Box p={3} color="error.main">
          Error: {error}
        </Box>
      </MainCard>
    );
  }

  return (
    <>
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
      <MainCard sx={{ borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Monthly Attendance
        </Typography>

        {subHeaderComponentMemo}

        {loading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 300 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Loading attendance data...
            </Typography>
          </Stack>
        ) : filteredItems.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 300 }}>
            <Typography variant="h6" color="text.secondary">
              {filterText ? 'No records found matching your search' : 'No attendance records found for selected month and year'}
            </Typography>
          </Stack>
        ) : (
          <DataTable
            columns={columns}
            data={filteredItems}
            pagination
            paginationResetDefaultPage={resetPaginationToggle}
            paginationPerPage={10}
            paginationRowsPerPageOptions={[5, 10, 20, 30]}
            highlightOnHover
            responsive
            striped
          />
        )}
      </MainCard>
    </>
  );
};

export default MonthlyAttendance;
