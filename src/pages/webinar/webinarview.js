import React, { useCallback, useState, useMemo } from 'react';
import {
  Box,
  Stack,
  Grid,
  Divider,
  // Paper,
  Card,
  CardContent,
  Typography,
  Link,
  Chip,
  Button,
  TextField,
  MenuItem,
  IconButton,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { useLocation } from 'react-router-dom';

import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
// import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { Container } from '@mui/system';
import { People, CalendarToday, Description, Edit, Delete } from '@mui/icons-material';
import DataTable from 'react-data-table-component';
import { capitalize } from 'lodash';
import { formatDateTime } from 'utils/dateUtils';
import * as XLSX from 'xlsx';
// import { jsPDF } from 'jspdf';
// import autoTable from 'jspdf-autotable';
import LinkIcon from '@mui/icons-material/Link';
import CertificateSample from '../../assets/certificate/4016369-ai.png';
import FeedbackIcon from '@mui/icons-material/Feedback';
import WebinarFeedbackDialog from 'components/webinarfeedbackpop';
import Swal from 'sweetalert2';
import axiosInstance from 'utils/axios';
// import Certification from 'pages/course/certification';

const ParticipantTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [attendanceFilter, setAttendanceFilter] = useState('All');
  const [hoursFilter, setHoursFilter] = useState('All');
  const { webinarData } = location.state || {};
  const [selectedWebinarUuid, setSelectedWebinarUuid] = useState(null);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  // console.log(error);
  // if (!webinarData) {
  //   return (
  //     <Container maxWidth="md" sx={{ mt: 6 }}>
  //       <Typography variant="h5" align="center" color="text.secondary">
  //         Webinar details not available.
  //       </Typography>
  //     </Container>
  //   );
  // }

  const canUpdate = false;
  const canDelete = false;
  const [openView, setOpenView] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [openCertificate, setOpenCertificate] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [openLogs, setOpenLogs] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [selectedLogsUser, setSelectedLogsUser] = useState(null);

  const handleViewParticipant = (participant) => {
    setSelectedParticipant(participant);
    setOpenView(true);
  };

  const handleCloseView = () => {
    setOpenView(false);
    setSelectedParticipant(null);
  };

  const handleViewCertificate = () => {
    setSelectedCertificate(CertificateSample);
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
  // if (!webinarData) {
  //   return (
  //     <Container maxWidth="md" sx={{ mt: 6 }}>
  //       <Typography variant="h5" align="center" color="text.secondary">
  //         Webinar details not available.
  //       </Typography>
  //     </Container>
  //   );
  // }
  const columns = [
    {
      name: 'S.No',
      selector: (row, index) => index + 1,
      sortable: true,
      width: '80px'
    },
    {
      name: 'Name',
      selector: (row) => row.name,
      sortable: true,
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
    {
      name: 'Phone Number',
      selector: (row) => row.phone,
      wrap: true
    },
    {
      name: 'Profession',
      selector: (row) => row.profession,
      wrap: true
    },

    {
      name: 'Email',
      selector: (row) => row.email,
      sortable: true,
      wrap: true
    },
    {
      name: 'Payment',
      selector: (row) => row.payment_status,
      sortable: true,
      wrap: true
    },

    // {
    //   name: 'State',
    //   selector: (row) => row.state,
    //   wrap: true
    // },
    // {
    //   name: 'City',
    //   selector: (row) => row.city,
    //   wrap: true
    // },
    {
      name: 'Feedback',
      cell: (row) => (
        <Tooltip title="Webinar Feedback">
          <IconButton
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedWebinarUuid(row.feedback); // ✅ now row exists
              setFeedbackOpen(true);
            }}
          >
            <FeedbackIcon />
          </IconButton>
        </Tooltip>
      ),
      center: true
    },

    {
      name: 'Registered At',
      selector: (row) => formatDateTime(row.registered_at),
      wrap: true
    },
    {
      name: 'Certificate Status',
      cell: (row) =>
        row.certificate_sent ? (
          <Button
            variant="text"
            onClick={handleViewCertificate}
            sx={{
              color: 'success.main',
              fontWeight: 600,
              textDecoration: 'underline',
              padding: 0,
              minWidth: 0
            }}
          >
            Yes
          </Button>
        ) : (
          <Typography color="text.secondary">No</Typography>
        ),
      wrap: true
    },
    {
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

  const allRows = useMemo(() => {
    return (
      webinarData?.participants?.map((p, index) => ({
        id: p.id,
        index: index + 1,
        name: capitalize(p.name),
        logs: p.logs || [],
        phone: p.phone,
        profession: p.profession,
        email: p.email,
        registered_at: p.registered_at,
        webinar_uuid: webinarData?.uuid,
        scheduled_start: webinarData?.scheduled_start || '-',
        attended: p.attended || false,
        total_hours_participated: Number(p.total_hours_participated) || 0,
        hours_participated: p.hours_participated,
        payment_status: p.payment_status,
        // state: p.state,
        // city: p.city,
        certificate_sent: p.certificate_sent || false,
        certificate_image_url: p.certificate_image_url,
        feedback: p.feedback || [],
        price: p.price,
        regular_price: p.regular_price,
        eligible_for_certificate: p.eligible_for_certificate
      })) || []
    );
  }, [webinarData]);

  // Filter rows based on attendance
  const rows = useMemo(() => {
    if (attendanceFilter === 'Attended') return allRows.filter((r) => r.attended);
    if (attendanceFilter === 'Not Attended') return allRows.filter((r) => !r.attended);
    return allRows;
  }, [allRows, attendanceFilter]);
  const exportToExcel = useCallback(() => {
    if (!rows || rows.length === 0) {
      alert('No data to export');
      return;
    }

    const worksheetData = rows.map((row) => ({
      'S.No': row.index,
      Name: row.name,
      id: row.id,
      'Phone Number': row.phone,
      Profession: row.profession,
      Email: row.email,
      // State: row.state,
      // City: row.city,
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
  }, [rows, webinarData]);

  // ================= Export to PDF =================
  // const exportToPDF = useCallback(() => {
  //   if (!rows || rows.length === 0) {
  //     alert('No data to export');
  //     return;
  //   }

  //   const doc = new jsPDF();

  //   // Add title
  //   doc.setFontSize(16);
  //   doc.text(`Participants - ${webinarData.title || 'webinar'}`, 14, 15);

  //   // Add date generated
  //   doc.setFontSize(10);
  //   doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

  //   // Prepare table
  //   const tableColumn = ['S.No', 'Name', 'Phone Number', 'Profession', 'Email', 'State', 'City', 'Registered At'];
  //   const tableRows = rows.map((row) => [
  //     row.index || '-',
  //     row.name || '-',
  //     row.phone || '-',
  //     row.profession || '-',
  //     row.email || '-',
  //     row.state || '-',
  //     row.city || '-',
  //     formatDateTime(row.registered_at)
  //   ]);

  //   autoTable(doc, {
  //     head: [tableColumn],
  //     body: tableRows,
  //     startY: 30,
  //     styles: { fontSize: 8 },
  //     headStyles: { fillColor: [41, 128, 185] },
  //     theme: 'grid'
  //   });

  //   doc.save(`${webinarData.title}_Participants.pdf`);
  // }, [rows, webinarData]);

  const formatTimeOnly = (dateTimeStr) => {
    if (!dateTimeStr) return '—';
    return dateTimeStr.split(' ')[1] || dateTimeStr; // "2026-01-27 06:22:17" → "06:22:17"
  };

  /* ================= UI ================= */
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                alignItems: 'center',
                width: '100%',
                px: 2
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} sx={{ p: 2 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  {webinarData?.title}
                </Typography>
              </Stack>
              {/* 
               <Stack sx={{ mb: { xs: -0.5, sm: 0.5 } }} spacing={1}  direction="row"
                justifyContent="flex-end"> */}
              <Grid container justifyContent={'flex-end'}>
                <Button
                  variant="contained"
                  size="medium"
                  onClick={() => navigate(-1)}
                  sx={{ width: 100, gap: 1, backgroundColor: 'red', ml: { xs: 2, sm: 5 }, color: 'white' }}
                >
                  <ArrowBack />
                  Back
                </Button>
              </Grid>
              {/* </Stack> */}
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday color="primary" size="small" />
                  <Typography variant="h6">Event Date: {webinarData?.scheduled_start || '-'}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <People color="primary" size="small" />
                  <Typography variant="h6">Registered Count: {webinarData?.participants_count ?? 0}</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LinkIcon color="primary" size="small" />

                  <Link
                    component="button"
                    variant="h6"
                    underline="hover"
                    onClick={() => navigator.clipboard.writeText(webinarData?.zoom_link)}
                  >
                    Webinar Link: {webinarData?.zoom_link || '-'}
                  </Link>

                  {/* <ContentCopyIcon fontSize="small" color="action" /> */}
                </Box>
                <Grid container>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CurrencyRupeeIcon color="primary" />

                    {webinarData?.is_paid ? (
                      <Box>
                        {/* Regular price (strikethrough) */}
                        {webinarData?.regular_price && (
                          <Grid item sx={12} md={6}>
                            <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                              ₹
                              {Number(webinarData.regular_price).toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </Typography>
                          </Grid>
                        )}

                        {/* Offer price */}
                        <Grid item sx={12} md={6}>
                          <Typography variant="h6">
                            ₹
                            {Number(webinarData.price || 0).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </Typography>
                        </Grid>
                      </Box>
                    ) : (
                      <Chip label="Free" color="success" size="small" />
                    )}
                  </Box>
                </Grid>
              </Stack>
            </Grid>

            <Grid container xs={12} md={6} sx={{ p: 3 }}>
              {/* <Grid container sx={{pt:2}}> */}
              <Grid item xs={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Description color="primary" />
                  <Typography variant="h6">Description:</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                {/* <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: 'grey.50',
                  maxHeight: 150,
                  maxWidth: 350,
                  overflow: 'auto'
                }}
              > */}
                <Typography variant="body1">{webinarData?.description || '-'}</Typography>
                {/* </Paper> */}
              </Grid>
            </Grid>
            {/* </Grid> */}
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  Registered List
                </Typography>
                <Grid item xs={3} p={1} sx={{ mt: 2 }}>
                  <TextField select fullWidth value={attendanceFilter} onChange={(e) => setAttendanceFilter(e.target.value)}>
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="Attended">Attended</MenuItem>
                    <MenuItem value="Not Attended">Not Attended</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={3} p={1} sx={{ mt: 2 }}>
                  <TextField
                    select
                    fullWidth
                    label="Hours Participated"
                    value={hoursFilter}
                    onChange={(e) => setHoursFilter(e.target.value)}
                  >
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="15 min">15 Min</MenuItem>
                    <MenuItem value="30 min">30 Min</MenuItem>
                    <MenuItem value="45 min">45 Min</MenuItem>
                    <MenuItem value="1 hour"> 1 Hour</MenuItem>
                    <MenuItem value="1:15 min">1:15 min</MenuItem>
                    <MenuItem value="1:30 min">1:30 min</MenuItem>
                    <MenuItem value="1:45 min">1:45 min</MenuItem>
                    <MenuItem value="2 hour">2 Hour</MenuItem>
                  </TextField>
                </Grid>

                {/* Export Buttons */}
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" color="primary" onClick={exportToExcel}>
                    Export Excel
                  </Button>
                  {/* <Button variant="contained" color="secondary" onClick={exportToPDF}>
                    Export PDF
                  </Button> */}
                </Stack>
              </Stack>
              <Divider sx={{ my: 2 }} />
            </Grid>
            <Box sx={{ ml: 2, width: '100%' }}>
              <DataTable
                columns={columns}
                data={rows}
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[5, 10, 20, 30]}
                highlightOnHover
                responsive
                fixedHeader
                persistTableHead
              />
            </Box>
          </Grid>
        </CardContent>
      </Card>
      <Dialog open={openView} onClose={handleCloseView} maxWidth="sm" fullWidth>
        <DialogTitle>Participant Details</DialogTitle>

        <DialogContent dividers>
          {selectedParticipant && (
            <Stack spacing={1}>
              <Typography>
                <strong>Name:</strong> {selectedParticipant.name}
              </Typography>
              <Typography>
                <strong>Phone:</strong> {selectedParticipant.phone}
              </Typography>
              <Typography>
                <strong>Profession:</strong> {selectedParticipant.profession}
              </Typography>
              <Typography>
                <strong>Email:</strong> {selectedParticipant.email}
              </Typography>
              {/* <Typography>
                <strong>State:</strong> {selectedParticipant.state}
              </Typography> */}
              {/* <Typography>
                <strong>City:</strong> {selectedParticipant.city}
              </Typography> */}
              <Typography>
                <strong>Payment:</strong>
                {selectedParticipant.payment_status}
              </Typography>
              <Typography>
                <strong>Attended:</strong> {selectedParticipant.attended ? 'Yes' : 'No'}
              </Typography>
              <strong>Hours Participated:</strong> {formatHoursFixed(selectedParticipant.total_hours_participated)}
              <Typography>
                <strong>Registered At:</strong> {formatDateTime(selectedParticipant.registered_at)}
              </Typography>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseView}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openLogs} onClose={handleCloseLogs} maxWidth="md" fullWidth>
        <DialogTitle>Attendance Logs – {selectedLogsUser}</DialogTitle>

        <DialogContent dividers>
          {selectedLogs.length === 0 ? (
            <Typography>No attendance logs available</Typography>
          ) : (
            <DataTable
              columns={[
                { name: 'S.No', selector: (row, i) => i + 1, width: '80px' },
                { name: 'Join Time', selector: (row) => formatTimeOnly(row.join_time) },
                { name: 'Leave Time', selector: (row) => formatTimeOnly(row.leave_time) },
                { name: 'Duration (min)', selector: (row) => row.duration_minutes }
              ]}
              data={selectedLogs}
              pagination
              paginationPerPage={5}
              highlightOnHover
              dense
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseLogs}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCertificate} onClose={handleCloseCertificate} maxWidth="md" fullWidth>
        <DialogTitle>Certificate Preview</DialogTitle>

        <DialogContent dividers>
          {selectedCertificate ? (
            <Box
              component="img"
              src={selectedCertificate}
              alt="Certificate"
              sx={{
                width: '100%',
                borderRadius: 2,
                border: '1px solid #ddd'
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
