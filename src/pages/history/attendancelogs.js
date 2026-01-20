import DataTable from 'react-data-table-component';
import { TextField, Box, InputAdornment, IconButton, MenuItem, Menu, Tooltip, Autocomplete, Button } from '@mui/material';
import 'assets/css/commonStyle.css';
import 'assets/css/DataTable.css';
import MainCard from 'components/MainCard';
import { useState, useEffect, useCallback } from 'react';
import { APP_PATH_BASE_URL } from 'config';
import axiosInstance from 'utils/axios';
import { formatDateTime } from 'utils/dateUtils';
import { CloseSquare, DocumentDownload, SearchNormal1 } from 'iconsax-react';
import { Capitalise } from 'utils/capitalise';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router';

const AttendanceLogs = () => {
  const navigate = useNavigate();
  const auth = JSON.parse(localStorage.getItem('auth'));
  const userId = auth?.user?.employee_id || auth?.user?.user_id;
  const regId = auth?.user?.student_id;
  const company = auth?.user?.company_id;
  const userType = auth?.loginType;

  const [data, setData] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [course, setCourse] = useState([]);
  const [batch, setBatch] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [filterUserType, setUserType] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      if (userType === 'admin' || userType === 'super_admin') {
        response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/attendance`);
      } else if (userType === 'tutor') {
        response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/trainer_attendance/${userId}/full_logs`);
      } else if (userType === 'student') {
        response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/attendance/${regId}/full_logs`);
      } else {
        response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/employer/${company}/attendance`);
      }

      let responseData;
      // Ensure the response data is an array
      if (userType === 'admin' || userType === 'super_admin') {
        responseData = Array.isArray(response.data.logs) ? response.data.logs : [];
      } else if (userType === 'employer') {
        responseData = Array.isArray(response.data.attendance_logs) ? response.data.attendance_logs : [];
      } else {
        responseData = Array.isArray(response.data.data) ? response.data.data : [];
      }

      const addedData = responseData.map((item, index) => ({
        ...item,
        sno: index + 1
      }));
      setCourse(response.data.course);
      setBatch(response.data.batch);
      setData(addedData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
      setData([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [userType, userId, regId, company]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Function to get date field name based on user type
  const getDateFieldName = () => {
    if (userType === 'tutor' || userType === 'student') return 'scheduled_date';
    return 'scheduled_date';
  };

  // Enhanced filter function that searches all string values in the object and applies date filter
  const filteredData = data.filter((item) => {
    const dateField = getDateFieldName();
    const itemDate = item[dateField];

    // Apply text filter
    if (filterText) {
      const searchText = filterText.toLowerCase();
      const textMatch = Object.values(item).some((value) => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchText);
        } else if (typeof value === 'number') {
          return value.toString().includes(searchText);
        }
        return false;
      });

      if (!textMatch) return false;
    }
    // console.log('selectedCourse :', selectedCourse);
    // Apply course filter
    if (selectedCourse) {
      if (item.course_id !== selectedCourse.course_id) return false;
    }

    // Apply batch filter
    // if (selectedBatch) {
    //   if (item.batch !== selectedBatch.batch_id) return false;
    // }

    if (selectedBatch) {
      if (item.batch_id !== selectedBatch.batch_id) return false;
    }

    // Apply user type filter
    if (filterUserType) {
      if (item.user_type !== filterUserType) return false;
    }

    // Apply date filter
    if (itemDate && (startDate || endDate)) {
      const recordDate = new Date(itemDate);

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (recordDate < start) return false;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (recordDate > end) return false;
      }
    }

    return true;
  });

  const handleClearDates = () => {
    setStartDate(null);
    setEndDate(null);
  };

  // Column configuration
  const columns =
    userType === 'tutor'
      ? [
          {
            name: 'S.No',
            selector: (row) => row.sno || '-',
            sortable: true,
            width: '100px'
          },
          {
            name: 'Date',
            selector: (row) => (row.date ? formatDateTime(row.date, { includeTime: false }) : '-'),
            sortable: true,
            width: '150px'
          },
          {
            name: 'Trainer Name',
            selector: (row) => row.trainer_name || '-',
            sortable: true,
            width: '150px'
          },
          {
            name: 'Batch',
            selector: (row) => row.title || '-',
            sortable: true,
            width: '150px'
          },
          {
            name: 'Course Name',
            selector: (row) => row.course_name || '-',
            sortable: true,
            width: '200px'
          },
          // {
          //   name: 'Topic',
          //   cell: (row) => (
          //     <Tooltip title={row.topic || '-'} arrow placement="top">
          //       <span
          //         style={{
          //           display: 'inline-block',
          //           width: '100%',
          //           whiteSpace: 'nowrap',
          //           overflow: 'hidden',
          //           textOverflow: 'ellipsis'
          //         }}
          //       >
          //         {row.topic}
          //       </span>
          //     </Tooltip>
          //   ),
          //   sortable: true,
          //   width: '150px'
          // },
          // {
          //   name: 'Sub Topics',
          //   cell: (row) => (
          //     <Tooltip title={row.sub_topic || '-'} arrow placement="top">
          //       <span
          //         style={{
          //           display: 'inline-block',
          //           width: '100%',
          //           whiteSpace: 'nowrap',
          //           overflow: 'hidden',
          //           textOverflow: 'ellipsis'
          //         }}
          //       >
          //         {row.sub_topic}
          //       </span>
          //     </Tooltip>
          //   ),
          //   sortable: true,
          //   width: '150px'
          // },
          // {
          //   name: 'Time Slot',
          //   selector: (row) => `${row.start_time || '-'} - ${row.end_time || '-'}`,
          //   sortable: true,
          //   width: '150px'
          // },
          {
            name: 'Total Hours',
            selector: (row) => (row.working_hours ? row.working_hours : '-'),
            sortable: true,
            width: '150px'
          },
          {
            name: 'Login Time',
            selector: (row) => row.first_login_time || '-',
            sortable: true,
            width: '150px'
          },
          {
            name: 'Logout Time',
            selector: (row) => row.last_logout_time || '-',
            sortable: true,
            width: '150px'
          },
          {
            name: 'Status',
            selector: (row) => row.status || '-',
            sortable: true,
            width: '150px'
          }
        ]
      : userType === 'student'
      ? [
          {
            name: 'S.No',
            selector: (row) => row.sno || '-',
            sortable: true,
            width: '100px'
          },
          {
            name: 'Date',
            selector: (row) => (row.date ? formatDateTime(row.date, { includeTime: false }) : '-'),
            sortable: true
          },
          {
            name: 'Student Name',
            selector: (row) => row.student_name || '-',
            sortable: true,
            width: '150px'
          },
          {
            name: 'Batch',
            selector: (row) => row.title || '-',
            sortable: true,
            width: '200px'
          },
          {
            name: 'Course Name',
            selector: (row) => row.course_name || '-',
            sortable: true,
            width: '200px'
          },
          {
            name: 'Login Time',
            selector: (row) => formatDateTime(row.login_time) || '-',
            sortable: true,
            width: '180px'
          },
          {
            name: 'Logut Time',
            selector: (row) => formatDateTime(row.logout_time) || '-',
            sortable: true,
            width: '180px'
          },
          {
            name: 'Status',
            selector: (row) => row.status || '-',
            sortable: true,
            width: '150px'
          }
        ]
      : userType === 'employer'
      ? [
          {
            name: 'S.No',
            selector: (row) => row.sno || '-',
            sortable: true,
            width: '150px'
          },
          {
            name: 'Name',
            selector: (row) => Capitalise(row.name) || '-',
            sortable: true
          },
          {
            name: 'Batch',
            selector: (row) => row.title || '-',
            sortable: true,
            width: '200px'
          },
          {
            name: 'Course Name',
            selector: (row) => row.course || '-',
            sortable: true
          },
          {
            name: 'Date & Time',
            selector: (row) => (row.date_time ? formatDateTime(row.date_time) : '-'),
            sortable: true
          },
          {
            name: 'Status',
            selector: (row) => row.status || '-',
            sortable: true,
            width: '150px'
          }
        ]
      : [
          {
            name: 'S.No',
            selector: (row) => row.sno || '-',
            sortable: true,
            width: '150px'
          },
          {
            name: 'Name',
            selector: (row) => Capitalise(row.name) || '-',
            sortable: true,
            width: '150px'
          },
          {
            name: 'User Type',
            selector: (row) => Capitalise(row.user_type) || '-',
            sortable: true
          },
          {
            name: 'Batch',
            selector: (row) => row.title || '-',
            sortable: true,
            width: '200px'
          },
          {
            name: 'Course Name',
            selector: (row) => row.course || '-',
            sortable: true,
            width: '200px'
          },
          {
            name: 'Topic',
            cell: (row) => (
              <Tooltip title={row.topic || '-'} arrow placement="top">
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
            ),
            sortable: true
          },
          {
            name: 'Sub Topics',
            cell: (row) => (
              <Tooltip title={row.sub_topic || '-'} arrow placement="top">
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
            ),
            sortable: true
          },
          {
            name: 'Date & Time',
            selector: (row) => (row.date_time ? formatDateTime(row.date_time) : '-'),
            sortable: true,
            width: '200px'
          },
          {
            name: 'Total Hours',
            selector: (row) => (row.total_hours ? row.total_hours : '-'),
            sortable: true
          },
          {
            name: 'Status',
            selector: (row) => row.status || '-',
            sortable: true
          }
        ];

  if (error) {
    return (
      <MainCard sx={{ borderRadius: 2 }}>
        <Box p={3} color="error.main">
          Error: {error}
        </Box>
      </MainCard>
    );
  }

  const handleClear = () => {
    if (filterText) {
      setResetPaginationToggle(!resetPaginationToggle);
      setFilterText('');
    }
  };

  const handleDownloadMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDownloadMenuClose = () => {
    setAnchorEl(null);
  };

  const getCurrentPageData = (allData) => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return allData.slice(startIndex, endIndex);
  };

  // Prepare data for export - improved version
  const prepareExportData = (rows) => {
    return rows.map((row) => {
      const exportRow = {};
      columns.forEach((col) => {
        // Get the raw value from the row using the selector
        const value = col.selector ? col.selector(row) : row[col.name.toLowerCase().replace(/ /g, '_')];
        exportRow[col.name] = value !== undefined ? value : '';
      });
      return exportRow;
    });
  };

  // Export to Excel - working version
  const exportToExcel = (allData) => {
    try {
      const currentData = getCurrentPageData(allData);
      if (!currentData || currentData.length === 0) {
        alert('No data to export');
        return;
      }

      const exportData = prepareExportData(currentData);
      const ws = XLSX.utils.json_to_sheet(exportData);
      const header = columns.map((col) => col.name);
      XLSX.utils.sheet_add_aoa(ws, [header], { origin: 'A1' });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'AttendanceLogs');
      XLSX.writeFile(wb, `attendance_logs_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel');
    }
  };

  const exportToPDF = (allData) => {
    try {
      const currentData = getCurrentPageData(allData);
      const exportData = prepareExportData(currentData);
      const headers = columns.map((col) => col.name);

      const doc = new jsPDF();
      autoTable(doc, {
        head: [headers],
        body: exportData.map((row) => headers.map((header) => row[header] || '')),
        margin: { top: 20 },
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });

      doc.save(`attendance_logs_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export to PDF');
    }
  };

  const monthDedails = () => {
    navigate('/attendance-monthly-dedails');
  };

  return (
    <MainCard sx={{ borderRadius: 2 }}>
      {userType === 'tutor' || userType === 'student' ? (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
          <Button variant="contained" sx={{ float: 'right' }} onClick={monthDedails}>
            Monthely Dedails
          </Button>
        </Box>
      ) : null}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          p: { xs: 2, sm: 3 },
          gap: 3,
          flexWrap: 'wrap'
        }}
      >
        {/* Filters Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
            flex: 1,
            minWidth: { xs: '100%', sm: 'auto' }
          }}
        >
          {/* Search Field */}
          <TextField
            placeholder="Search any field..."
            variant="outlined"
            size="small"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            sx={{
              width: { xs: '100%', sm: 150 },
              minWidth: { xs: 'auto', sm: 150 }
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

          {/* userType Filter */}
          {(userType === 'admin' || userType === 'super_admin') && (
            <Autocomplete
              id="userType"
              options={['trainer', 'student']}
              getOptionLabel={(option) => option}
              value={filterUserType}
              onChange={(event, newValue) => {
                setUserType(newValue);
              }}
              size="small"
              sx={{
                width: { xs: '100%', sm: 150 },
                minWidth: { xs: 'auto', sm: 150 }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Filter by user type..."
                  InputProps={{
                    ...params.InputProps
                  }}
                />
              )}
            />
          )}

          {/* Filters Row */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 2,
              flex: 1
            }}
          >
            {/* Course Filter */}
            <Autocomplete
              id="course_id"
              options={course || []}
              getOptionLabel={(option) => option.course_name || ''}
              value={selectedCourse}
              onChange={(event, newValue) => {
                setSelectedCourse(newValue);
              }}
              size="small"
              sx={{
                width: { xs: '100%', sm: 150 },
                minWidth: { xs: 'auto', sm: 150 }
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
              value={selectedBatch}
              onChange={(event, newValue) => {
                setSelectedBatch(newValue);
              }}
              size="small"
              sx={{
                width: { xs: '100%', sm: 150 },
                minWidth: { xs: 'auto', sm: 150 }
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

            {/* Date Range Filter */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
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
                    width: '100%'
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
                          width: { xs: '100%', sm: 140 },
                          '& .MuiInputBase-root': {
                            fontSize: '0.75rem',
                            minHeight: 40
                          },
                          '& input': {
                            padding: '10px 14px',
                            fontSize: '0.875rem'
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
                          width: { xs: '100%', sm: 140 },
                          '& .MuiInputBase-root': {
                            fontSize: '0.75rem',
                            minHeight: 40
                          },
                          '& input': {
                            padding: '10px 14px',
                            fontSize: '0.875rem'
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
        </Box>

        {/* Download Button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
            alignItems: 'center',
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          <IconButton
            variant="contained"
            color="secondary"
            sx={{
              borderRadius: 2,
              ml: { xs: 0, sm: 2 }
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
            >
              Export to Excel
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToPDF(filteredData);
                handleDownloadMenuClose();
              }}
            >
              Export to PDF
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <DataTable
        columns={columns}
        data={filteredData}
        pagination
        paginationPerPage={10}
        paginationRowsPerPageOptions={[5, 10, 20, 30]}
        highlightOnHover
        responsive
        progressPending={loading}
        noDataComponent="No attendance records found"
        onChangePage={(page) => setCurrentPage(page)}
        onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
          setRowsPerPage(currentRowsPerPage);
          setCurrentPage(currentPage);
        }}
      />
    </MainCard>
  );
};

export default AttendanceLogs;
