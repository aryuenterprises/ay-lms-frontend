import React, { useCallback, useState, useMemo, useEffect } from 'react';
// import { DatePicker} from "@mui/x-date-pickers";
import {
  Box,
  Stack,
  Grid,
  Divider,
  Menu,
  Card,
  // CardContent,
  Typography,
  // Link,
  Chip,
  Button,
  TextField,
  MenuItem,
  IconButton,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
// import ContentCopyIcon from '@mui/icons-material/ContentCopy';
// import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import { Container } from '@mui/system';
// import { People, CalendarToday, Description } from '@mui/icons-material';
// import DataTable from 'react-data-table-component';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "assets/css/commonStyle.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { capitalize } from 'lodash';
import { formatDateTime } from 'utils/dateUtils';
import * as XLSX from 'xlsx';
// import { jsPDF } from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import LinkIcon from "@mui/icons-material/Link";
// import CertificateSample from '../../assets/certificate/4016369-ai.png';
import FeedbackIcon from '@mui/icons-material/Feedback';
import WebinarFeedbackDialog from 'components/webinarfeedbackpop';
import Swal from 'sweetalert2';
import axiosInstance from 'utils/axios';
// import Certification from 'pages/course/certification';
//Icon
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

const ParticipantTable = () => {

  // const today = new Date().toISOString().split("T")[0];
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const location = useLocation();
  const [attendanceFilter, setAttendanceFilter] = useState('All');
  const [nameFilter, setNameFilter] = useState("");
  const [hoursFilter, setHoursFilter] = useState('All');
  const { webinarData } = location.state || {};
  const [selectedWebinarUuid, setSelectedWebinarUuid] = useState(null);
  const [webinarDetail, setWebinarDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError, setDetailError] = useState(null);

  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const [openView, setOpenView] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [openCertificate, setOpenCertificate] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [openLogs, setOpenLogs] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [selectedLogsUser, setSelectedLogsUser] = useState(null);

  console.log("certificate",selectedCertificate);
  console.log(webinarDetail, "Detail is give to it");


  useEffect(() => {
    // We use the slug from location.state to call the retrieve endpoint.
    // The list API still returns slug on each webinar object,
    // so webinarData.slug is always available.
    const slug = webinarData?.slug;

    if (!slug) {
      setDetailError('Webinar slug not found. Please go back and try again.');
      setDetailLoading(false);
      return;
    }

    const fetchWebinarDetail = async () => {
      try {
        setDetailLoading(true);
        // This calls your retrieve endpoint: GET /api/webinar/web/{slug}/
        const response = await axiosInstance.get(`api/webinar/web/${slug}/`);
        // Your retrieve endpoint wraps data in { status, message, data }
        setWebinarDetail(response.data.data);
      } catch (err) {
        console.error('Failed to fetch webinar detail', err);
        setDetailError(err.message);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchWebinarDetail();
  }, [webinarData?.slug]); // re-runs only if slug changes (i.e., never in practice)

  const handleViewParticipant = (participant) => {
    setSelectedParticipant(participant);
    setOpenView(true);
  };







  const handleCloseView = () => {
    setOpenView(false);
    setSelectedParticipant(null);
  };

  const handleViewCertificate = (row) => {
    // console.log("rowcertifacre:",row)
    setSelectedCertificate(row?.certificate_url);
    setOpenCertificate(true);
  };
  const handleCloseCertificate = () => {
    setOpenCertificate(false);
    setSelectedCertificate(null);
  };
  const handleViewLogs = (participant) => {
    setSelectedLogs(participant.logs || []);
    setSelectedLogsUser(participant.name);
    setOpenLogs(true);
  };

  const handleCloseLogs = () => {
    setOpenLogs(false);
    setSelectedLogs([]);
    setSelectedLogsUser(null);
  };
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleColumnClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleColumnClose = () => {
    setAnchorEl(null);
  };

  const defaultColumnVisibility = {
    sNo: true,
    name: true,
    totalHours: true,
    mobile: true,
    email: true,
    payment: true,
    feedback: true,
    registeredAt: true,
    certificateStatus: true,
    certificate: true
  };

  const [visibleColumns, setVisibleColumns] = useState(defaultColumnVisibility);

  const handleWebinarcertification = useCallback(async (row) => {
    if (!row.attended || !row.eligible_for_certificate) {
      const result = await Swal.fire({
        title: 'Alert',
        text: 'Not Eligible ',
        showCancelButton: true,
        confirmButtonText: 'yes,send',
        cancelButtonText: 'cancel'
      });
      if (!result.isConfirmed) return;
    }
    try {
      await axiosInstance.post(`api/webinar/certificates/send/`, {
        webinar_uuid: webinarData.uuid,
        participant_ids: [row.id]
      });
      Swal.fire({
        title: 'Certification send',
        text: 'Eligible for certification'
      });
    } catch (error) {
      console.error('Certificate send failed', error);
    }
  }, []);

  const formatHoursFixed = (hours) => {
    if (hours === null || hours === undefined) return '—';

    const num = Number(hours);
    if (Number.isNaN(num)) return '—';

    return num.toFixed(2); // 0.3 → "0.30"
  };

  const columns = [
    {
      id: 'sno',
      name: 'S.No',
      selector: (row) => row.index,
      width: '80px'
    },
    {
      id: 'name',
      name: 'Name',
      selector: (row) => row.name,
      wrap: true,
      cell: (row) => (
        <ButtonBase
          onClick={() => handleViewParticipant(row)}
          sx={{
            justifyContent: 'flex-start',
            textAlign: 'left'
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: row.attended ? 'success.main' : 'text.primary',
              fontWeight: row.attended ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            {row.attended && (
              <Typography
                component="span"
                sx={{
                  color: 'success.main',
                  fontWeight: 700
                }}
              >
                ✓
              </Typography>
            )}
            {row.name}
          </Typography>
        </ButtonBase>
      )
    },
    {
      id: 'totalHours',
      name: 'Total Hours',
      center: true,
      cell: (row) =>
        row.logs && row.logs.length > 0 ? (
          <Tooltip title="View Attendance Logs">
            <ButtonBase
              onClick={() => handleViewLogs(row)}
              sx={{
                color: 'black',
                fontSize: '0.9rem'
              }}
            >
              {formatHoursFixed(row.total_hours_participated)}
            </ButtonBase>
          </Tooltip>
        ) : (
          <Typography color="text.secondary">—</Typography>
        )
    },
    { id: 'mobile', name: 'Mobile', selector: (row) => row.phone },
    { id: 'email', name: 'Email', selector: (row) => row.email },
    {
      id: 'payment',
      name: 'Payment',
      center: true,
      cell: (row) => {
        const status = row.payment_status?.toLowerCase();

        const isFree = status === 'free';

        const isPaid = status === 'paid' || status === 'success' || status === 'done' || status === 'completed';

        if (isFree) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'info.main',
                  fontWeight: 600,
                  fontSize: { xs: '12px', sm: '14px' }
                }}
              >
                Free
              </Typography>
            </Box>
          );
        }

        if (isPaid) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon
                sx={{
                  color: 'success.main',
                  fontSize: { xs: 18, sm: 22 }
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: 'success.main',
                  fontWeight: 600,
                  fontSize: { xs: '12px', sm: '14px' }
                }}
              >
                Done
              </Typography>
            </Box>
          );
        }

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CancelIcon
              sx={{
                color: 'error.main',
                fontSize: { xs: 18, sm: 22 }
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: 'error.main',
                fontWeight: 600,
                fontSize: { xs: '12px', sm: '14px' }
              }}
            >
              Failed
            </Typography>
          </Box>
        );
      }
    },
    {
      id: 'feedback',
      name: 'Feedback',
      cell: (row) => (
        <Tooltip title="Webinar Feedback">
          <IconButton
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedWebinarUuid(row.feedback);
              setFeedbackOpen(true);
            }}
          >
            <FeedbackIcon />
          </IconButton>
        </Tooltip>
      )
    },
    {
      id: 'registeredAt',
      name: 'Registered At',
      selector: (row) => formatDateTime(row.registered_at),
      minWidth: '200px',
      wrap: true
    },
    {
      id: 'certificateStatus',
      name: 'Certificate Status',
      cell: (row) =>
        row.certificate_sent ? (
          <Button
            variant="text"
            // onClick={ () => handleViewCertificate(row.certificate_url)}
            // sx={{
            //   color: 'success.main',
            //   fontWeight: 600,
            //   textDecoration: 'underline',
            //   padding: 0,
            //   minWidth: 0
            // }}


          >
            Yes
          </Button>
        ) : (
          <Typography color="text.secondary">No</Typography>
        )
    },
    {
      id: 'certificate',
      name: 'Certificate',
      cell: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* {row.eligible_for_certificate == true && ( */}
          <Button variant="contained" size="small" onClick={() => handleWebinarcertification(row)}>
            Send
          </Button>
          {/* )} */}
        </Box>
      )
    }
  ];

  useEffect(() => {
    const initialVisibility = {};
    columns.forEach((col) => {
      initialVisibility[col.id] = true;
    });
    setVisibleColumns(initialVisibility);
  }, []);

  // const filteredColumns = useMemo(() => {
  //   return columns.filter((col) => visibleColumns[col.id] !== false);
  // }, [visibleColumns]);
  // const[feedbackRows,setFeedbackRows]=useState("");
  const allRows = useMemo(() => {
    // Previously: webinarData?.participants?.map(...)
    // Now: webinarDetail?.participants?.map(...)
    // webinarDetail comes from the retrieve endpoint which includes participants
    return (
      webinarDetail?.participants?.map((p, index) => ({
        id: p.id,
        index: index + 1,
        name: capitalize(p.name),
        logs: p.logs || [],
        phone: p.phone,
        email: p.email,
        registered_at: p.registered_at,
        webinar_uuid: webinarDetail?.uuid,
        scheduled_start: webinarDetail?.scheduled_start || '-',
        attended: p.attended || false,
        total_hours_participated: p.total_hours_participated ||'0',
        hours_participated: p.hours_participated,
        payment_status: p.payment_status,
        certificate_sent: p.certificate_sent || false,
        certificate_url: p.certificate_url,
        feedback: p.feedback_data || [],
        price: p.price,
        regular_price: p.regular_price,
        eligible_for_certificate: p.eligible_for_certificate,
        // setFeedbackRows(feedback)
      })) || []
    );
      
  }, [webinarDetail]); // dependency is now webinarDetail, not webinarData
 
  // Filter rows based on attendance
  const filteredRows = useMemo(() => {
    return allRows.filter((r) => {

      // Name filter
      if (
        nameFilter &&
        !r.name?.toLowerCase().includes(nameFilter.toLowerCase())
      )
        return false;

      // Attendance filter
      if (attendanceFilter === "Attended" && !r.attended) return false;
      if (attendanceFilter === "Not Attended" && r.attended) return false;

      // Date filter
      const rowDate = r.registered_at?.split(" ")[0];

      if (startDate && rowDate < startDate) return false;
      if (endDate && rowDate > endDate) return false;

      return true;
    });
  }, [allRows, attendanceFilter, startDate, endDate, nameFilter]);

  const exportToExcel = useCallback(() => {
    if (!filteredRows || filteredRows.length === 0) {
      alert('No data to export');
      return;
    }


    // const rows

    const worksheetData = filteredRows.map((row) => ({
      'S.No': row.index,
      Name: row.name,
      id: row.id,
      'Phone Number': row.phone,
      Email: row.email,
      payment: row.payment_status,
      total_hours_participated: formatHoursFixed(row.total_hours_participated),
      'Registered At': formatDateTime(row.registered_at),
      scheduled_start: row.scheduled_start,
      eligible_for_certificate: row.eligible_for_certificate,
      certificate_sent: row.certificate_sent
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');
    XLSX.writeFile(workbook, `${webinarData.title || 'webinar'}_Participants.xlsx`);
  }, [filteredRows, webinarData]);

  const formatTimeOnly = (dateTimeStr) => {
    if (!dateTimeStr) return '—';
    return dateTimeStr.split(' ')[1] || dateTimeStr; // "2026-01-27 06:22:17" → "06:22:17"
  };
  if (detailLoading) {
    return (
      
      <Container sx={{ mt: 4, mb: 4 }} maxWidth={false}>
        <Card sx={{ mb: 4, borderRadius: 2, p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937' }}>
            {webinarData?.title}
          </Typography>
          <Typography sx={{ mt: 2, color: '#6b7280' }}>Loading participants...</Typography>
        </Card>
      </Container>
    );
  }

  // ─── GUARD: show if the retrieve API call failed ─────────────────────────────
  if (detailError) {
    return (
     <Container sx={{ mt: 4, mb: 4 }} maxWidth={false}>
        <Typography color="error">Error: {detailError}</Typography>
        <Button sx={{
          backgroundColor: "#2D3436",
          color: "#fff",
          "&:hover": {
            backgroundColor: "#2D3436",
            color: "#fff",
          }
        }} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }
  /* ================= UI ================= */
  return (
    <Container sx={{ mt: 4, mb: 4 }} maxWidth={false}>
      {/* <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          background: '#ffffff',
          border: '1px solid #e6e8ec',
          boxShadow: '0 12px 35px rgba(17, 24, 39, 0.08)',
          overflow: 'hidden'
        }}
      > */}
        {/* Premium Header Section */}
        {/* <Box
          sx={{
            px: 4,
            py: 3,
            borderBottom: '1px solid #eef1f5',
            background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)'
          }}
        >
          <Grid container alignItems="center">
            <Grid item xs>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  color: '#1f2937'
                }}
              >
                {webinarData?.title}
              </Typography>
            </Grid>

            <Grid item>
              <Button
                variant="outlined"
                size="medium"
                onClick={() => navigate(-1)}
                startIcon={<ArrowBack />}
                sx={{
                  backgroundColor: "#2D3436",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#2D3436",
                    color: "#fff",
                  }
                }}
              >
                Back
              </Button>
            </Grid>
          </Grid>
        </Box> */}

      {/* </Card> */}

      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          background: '#ffffff',
          border: '1px solid #e6e8ec',
          boxShadow: '0 18px 45px rgba(15, 23, 42, 0.08)',
          overflow: 'hidden'
        }}
      >
        {/* <Box
          sx={{
            px: 4,
            py: 3,
            borderBottom: '1px solid #eef1f5',
            background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)'
          }}
        > */}
          {/* <Grid container alignItems="center">
            <Grid item xs>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  color: '#1f2937'
                }}
              >
                {webinarData?.title}
              </Typography>
            </Grid>

            <Grid item>
              <Button
                variant="outlined"
                size="medium"
                onClick={() => navigate(-1)}
                startIcon={<ArrowBack />}
                sx={{
                  backgroundColor: "#2D3436",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#2D3436",
                    color: "#fff",
                  }
                }}
              >
                Back
              </Button>
            </Grid>
          </Grid> */}
        {/* </Box> */}
        {/* Executive Header */}
        <Box
          sx={{
            px: 4,
            py: 3,
            borderBottom: '1px solid #eef1f5',
            background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)'
          }}
        >
          <Grid container alignItems="center">
            <Grid item xs>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  color: '#1f2937'
                }}
              >
                {webinarData?.title}
              </Typography>
            </Grid>

            
          </Grid>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                letterSpacing: 0.5,
                color: '#111827'
              }}
            >
              Registered Participants
            </Typography>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={handleColumnClick}
                endIcon={<ArrowDropDownIcon />}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  fontWeight: 600,
                  borderColor: '#d1d5db',
                  color: '#374151',
                  '&:hover': {
                    backgroundColor: '#f3f4f6'
                  }
                }}
              >
                Columns
              </Button>

              <Button
                variant="contained"
                onClick={exportToExcel}
                sx={{
                  backgroundColor: "#00B894",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#00B894",
                    color: "#fff",
                  }
                }}
              >
                Export
              </Button>
              <Grid item >
              <Button
                variant="outlined"
                size="medium"
                onClick={() => navigate(-1)}
                startIcon={<ArrowBack />}
                sx={{
                  backgroundColor: "#2D3436",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#2D3436",
                    color: "#fff",
                  }
                }}
               
              >
                Back
              </Button>
            </Grid>
            </Stack>
            
          </Stack>
        </Box>

        {/* Filters Section */}
        <Box sx={{ px: 4, py: 3 }}>
          <Stack direction="row" spacing={3}>
            <TextField
              size="small"
              label="Search Name"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              sx={{ minWidth: 180 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              size="small"
              label="Attendance"
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Attended">Attended</MenuItem>
              <MenuItem value="Not Attended">Not Attended</MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              label="Hours Participated"
              value={hoursFilter}
              onChange={(e) => setHoursFilter(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="15 min">15 Min</MenuItem>
              <MenuItem value="30 min">30 Min</MenuItem>
              <MenuItem value="45 min">45 Min</MenuItem>
              <MenuItem value="1 hour">1 Hour</MenuItem>
              <MenuItem value="1:15 min">1:15 Min</MenuItem>
              <MenuItem value="1:30 min">1:30 Min</MenuItem>
              <MenuItem value="1:45 min">1:45 Min</MenuItem>
              <MenuItem value="2 hour">2 Hour</MenuItem>
            </TextField>

            <TextField
              label="Start Date"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />

            {/* End Date */}
            <TextField
              label="End Date"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />



          </Stack>
        </Box>

        {/* Table Section */}
        <Box
  sx={{
    px: 4,
    pb: 4
  }}
  // fullWidth="100%"
>

   {/* PrimeReact DataTable */}
<DataTable
  value={filteredRows}
  paginator
  rows={10}
  rowsPerPageOptions={[50,100,150,200]}
  dataKey="id"
  emptyMessage="No participants found"
  rowHover
  stripedRows
  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
  currentPageReportTemplate="Showing {first} to {last} of {totalRecords} participants"
  className="modern-datatable"
  // style={{ width: "100%" }}
>

{/* S.No */}
<Column
  header="S.No"
  body={(data, options) => (
    <Chip
      label={options.rowIndex + 1}
      size="small"
      sx={{
                  backgroundColor: '#f3e5f5',
                  color: '#6a1b9a',
                  minWidth: 32
                }}
    />
  )}
/>

{/* Name */}
<Column
  header="Name"
  body={(row) => (
    <ButtonBase
      onClick={() => handleViewParticipant(row)}
      sx={{ justifyContent: "flex-start" }}
    >
      <Typography
        sx={{
          color: row.attended ? "success.main" : "text.primary",
          fontWeight: row.attended ? 600 : 400
        }}
      >
        {row.attended && "✓ "} {row.name}
      </Typography>
    </ButtonBase>
  )}
/>

{/* Total Hours */}
<Column
  header="Total Hours"
  body={(row) =>
    row.logs?.length ? (
      <ButtonBase onClick={() => handleViewLogs(row)}>
        {formatHoursFixed(row.total_hours_participated)}
      </ButtonBase>
    ) : (
      <Typography>—</Typography>
    )
  }
/>

{/* Mobile */}
<Column field="phone" header="Mobile" />

{/* Email */}
<Column field="email" header="Email" />

{/* Payment */}
<Column
  header="Payment"
  body={(row) => {
    const status = row.payment_status?.toLowerCase();

    if (status === "free")
      return <Chip label="Free" color="info" size="small" />;

    if (
      status === "paid" ||
      status === "success" ||
      status === "done" ||
      status === "completed"
    )
      return <Chip label="Done" color="success" size="small" />;

    return <Chip label="Failed" color="error" size="small" />;
  }}
/>

{/* Feedback */}
<Column
  header="Feedback"
  body={(row) => (
    <IconButton
      onClick={(e) => {
        e.stopPropagation();
        setSelectedWebinarUuid(row.feedback);
        setFeedbackOpen(true);
      }}
    >
      <FeedbackIcon />
    </IconButton>
  )}
/>

{/* Registered At */}
<Column
  header="Registered At"
  body={(row) => formatDateTime(row.registered_at)}
/>

{/* Certificate Status */}
<Column
  header="Certificate Status"
  body={(row) =>
    row?.certificate_sent ? (
      <Button
        variant="text"
        onClick={() => handleViewCertificate(row)}
        sx={{
          color: "success.main",
          // fontWeight: 600,
          textDecoration: "underline",
          // minWidth: 0
        }}
      >
        Yes
      </Button>
    ) : (
      <Button
        variant="text"
        
        // sx={{
        //   color: "success.main",
        //   // fontWeight: 600,
        //   textDecoration: "underline",
        //   // minWidth: 0
        // }}
      >
      No
      </Button>
    )
  }
/>

{/* Send Certificate */}
<Column
  header="Certificate"
  body={(row) => (
    <Button
      variant="contained"
      size="small"
      onClick={() => handleWebinarcertification(row)}
    >
      Send
    </Button>
  )}
/>

</DataTable>
</Box>

        {/* Column Selection Menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleColumnClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              width: 260,
              mt: 1,
              p: 2,
              borderRadius: 3,
              boxShadow: '0 12px 30px rgba(0,0,0,0.12)'
            }
          }}
        >
          <Typography fontWeight={600} sx={{ mb: 1 }}>
            Select Columns
          </Typography>

          <Divider sx={{ mb: 1 }} />

          {columns.map((col) => (
            <FormControlLabel
              key={col.id}
              control={
                <Checkbox
                  size="small"
                  checked={visibleColumns[col.id] ?? true}
                  onChange={(e) =>
                    setVisibleColumns((prev) => ({
                      ...prev,
                      [col.id]: e.target.checked
                    }))
                  }
                />
              }
              label={col.name}
              sx={{ display: 'block' }}
            />
          ))}
        </Menu>
      </Card>
      <Dialog
        open={openView}
        onClose={handleCloseView}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.18)'
          }
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 4,
            py: 3,
            borderBottom: '1px solid #eef1f5',
            background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              letterSpacing: 0.5,
              color: '#111827'
            }}
          >
            Participant Details
          </Typography>
        </Box>

        {/* Content */}
        <DialogContent sx={{ px: 4, py: 4 }}>
          {selectedParticipant && (
            <Stack spacing={3}>
              {/* Name */}
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                  FULL NAME
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                  {selectedParticipant.name}
                </Typography>
              </Box>

              <Divider />

              {/* Contact Info */}
              <Stack direction="row" spacing={4}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                    PHONE
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1f2937' }}>
                    {selectedParticipant.phone}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                    EMAIL
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1f2937' }}>
                    {selectedParticipant.email}
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              {/* Status Section */}
              <Stack direction="row" spacing={4}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                    PAYMENT STATUS
                  </Typography>
                  <Chip
                    label={selectedParticipant.payment_status}
                    size="small"
                    sx={{
                      mt: 1,
                      ml: 1,
                      fontWeight: 600,
                      backgroundColor: '#eef2ff',
                      color: '#3730a3'
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                    ATTENDANCE
                  </Typography>
                  <Chip
                    label={selectedParticipant.attended ? 'Attended' : 'Not Attended'}
                    size="small"
                    sx={{
                      mt: 1,
                      ml: 1,
                      fontWeight: 600,
                      backgroundColor: selectedParticipant.attended ? '#ecfdf5' : '#fef2f2',
                      color: selectedParticipant.attended ? '#065f46' : '#991b1b'
                    }}
                  />
                </Box>
              </Stack>

              <Divider />

              {/* Participation */}
              <Stack direction="row" spacing={4}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                    HOURS PARTICIPATED
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatHoursFixed(selectedParticipant.total_hours_participated)} hrs
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                    REGISTERED AT
                  </Typography>
                  <Typography variant="body1">{formatDateTime(selectedParticipant.registered_at)}</Typography>
                </Box>
              </Stack>
            </Stack>
          )}
        </DialogContent>

        {/* Footer */}
        <DialogActions
          sx={{
            px: 4,
            py: 2,
            borderTop: '1px solid #eef1f5'
          }}
        >
          <Button
            onClick={handleCloseView}
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              backgroundColor: '#111827',
              '&:hover': { backgroundColor: '#000000' }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openLogs}
        onClose={handleCloseLogs}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 22px 55px rgba(15, 23, 42, 0.18)'
          }
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 4,
            py: 3,
            borderBottom: '1px solid #eef1f5',
            background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)'
          }}
        >
          <Stack spacing={1}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
              Attendance Logs
            </Typography>

            <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
              Participant: <span style={{ color: '#111827', fontWeight: 600 }}>{selectedLogsUser}</span>
            </Typography>
          </Stack>
        </Box>

        {/* Content */}
        <DialogContent sx={{ px: 4, py: 4 }}>
          {selectedLogs.length === 0 ? (
            <Box
              sx={{
                py: 6,
                textAlign: 'center',
                borderRadius: 3,
                backgroundColor: '#f9fafb',
                border: '1px dashed #e5e7eb'
              }}
            >
              <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 500 }}>
                No attendance logs available
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                borderRadius: 3,
                border: '1px solid #eef1f5',
                overflow: 'hidden',
                '& .rdt_TableHead': {
                  backgroundColor: '#f9fafb'
                }
              }}
            >
              <DataTable
                columns={[
                  {
                    name: 'S.No',
                    selector: (row, i) => i + 1,
                    width: '80px'
                  },
                  {
                    name: 'Join Time',
                    selector: (row) => formatTimeOnly(row.join_time)
                  },
                  {
                    name: 'Leave Time',
                    selector: (row) => formatTimeOnly(row.leave_time)
                  },
                  {
                    name: 'Duration (min)',
                    selector: (row) => row.duration_minutes
                  }
                ]}
                data={selectedLogs}
                pagination
                paginationPerPage={5}
                highlightOnHover
                dense
              />
            </Box>
          )}
        </DialogContent>

        {/* Footer */}
        <DialogActions
          sx={{
            px: 4,
            py: 2,
            borderTop: '1px solid #eef1f5'
          }}
        >
          <Button
            onClick={handleCloseLogs}
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              backgroundColor: '#111827',
              '&:hover': { backgroundColor: '#000000' }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCertificate} onClose={handleCloseCertificate} maxWidth="md" fullWidth maxheight="md" fullScreen>
        <DialogTitle>Certificate Preview</DialogTitle>

        <DialogContent dividers>
          {selectedCertificate ? (
            <Box
              component="iframe"
              src={selectedCertificate}
              alt="Certificate"
              sx={{
                width: '100%',
                borderRadius: 2,
                border: '1px solid #ddd',
                height:'100%'
              }}
            />
          ) : (
            <Typography>No certificate available</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseCertificate}>Close</Button>
        </DialogActions>
      </Dialog>
      <WebinarFeedbackDialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        webinarUuid={selectedWebinarUuid}
      // feedback=[]
      />
    </Container>
  );
};

export default ParticipantTable;
