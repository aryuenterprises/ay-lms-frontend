import DataTable from 'react-data-table-component';
import { TextField, Box, InputAdornment, IconButton, MenuItem, Menu } from '@mui/material';
import 'assets/css/commonStyle.css';
import 'assets/css/DataTable.css';
import MainCard from 'components/MainCard';
import { useState, useEffect, useCallback } from 'react';
import { APP_PATH_BASE_URL } from 'config';
import axiosInstance from 'utils/axios';
import { formatDateTime } from 'utils/dateUtils';
import { CloseSquare, DocumentDownload, SearchNormal1, Calendar } from 'iconsax-react';
import { Capitalise } from 'utils/capitalise';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ActivityLogs = () => {
  const auth = JSON.parse(localStorage.getItem('auth'));
  //   const userId = auth?.user?.user_id;
  //   const regId = auth?.user?.registration_id;
  //   const company = auth?.user?.company_id;
  const userType = auth?.loginType;

  const [data, setData] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}/api/alllogs`);

      let responseData = Array.isArray(response.data) ? response.data : [];

      setData(responseData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
      setData([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Function to get date field name based on user type
  const getDateFieldName = () => {
    if (userType === 'tutor' || userType === 'student') return 'date';
    return 'date_time';
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
    setStartDate('');
    setEndDate('');
  };

  // Column configuration
  const columns = [
    {
      name: 'Name',
      selector: (row) => Capitalise(row.name) || '-',
      sortable: true
    },
    {
      name: 'User Type',
      selector: (row) => Capitalise(row.user_type) || '-',
      sortable: true
    },
    {
      name: 'Course Name',
      selector: (row) => row.course || '-',
      sortable: true
    },
    {
      name: 'Topic',
      selector: (row) => row.topic || '-',
      sortable: true
    },
    {
      name: 'Sub Topics',
      selector: (row) => row.sub_topic || '-',
      sortable: true
    },
    {
      name: 'Date & Time',
      selector: (row) => (row.date_time ? formatDateTime(row.date_time) : '-'),
      sortable: true
    },
    {
      name: 'Total Hours',
      selector: (row) => (row.total_hours ? row.total_hours : '-'),
      sortable: true
    },
    {
      name: 'Status',
      selector: (row) => row.status || '-',
      sortable: true,
      width: '150px'
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

  return (
    <MainCard sx={{ borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search any field..."
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

          {/* Date Range Filter */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              label="From Date"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Calendar size={18} />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              label="To Date"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Calendar size={18} />
                  </InputAdornment>
                )
              }}
            />
            {(startDate || endDate) && (
              <IconButton onClick={handleClearDates} size="small" title="Clear dates">
                <CloseSquare size={20} />
              </IconButton>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <IconButton
            variant="contained"
            color="secondary"
            sx={{ ml: 2, borderRadius: 2 }}
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

export default ActivityLogs;
