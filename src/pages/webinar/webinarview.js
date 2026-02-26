import React, { useCallback, useState, useMemo, useEffect } from "react";
import {
  Box,
  Stack,
  Grid,
  Divider,
  Menu,
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
  DialogTitle,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
// import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import { Container } from "@mui/system";
import { People, CalendarToday, Description } from "@mui/icons-material";
import DataTable from "react-data-table-component";
import { capitalize } from "lodash";
import { formatDateTime } from "utils/dateUtils";
import * as XLSX from "xlsx";
// import { jsPDF } from 'jspdf';
// import autoTable from 'jspdf-autotable';
import LinkIcon from "@mui/icons-material/Link";
import CertificateSample from "../../assets/certificate/4016369-ai.png";
import FeedbackIcon from "@mui/icons-material/Feedback";
import WebinarFeedbackDialog from "components/webinarfeedbackpop";
import Swal from "sweetalert2";
import axiosInstance from "utils/axios";
// import Certification from 'pages/course/certification';

const ParticipantTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [attendanceFilter, setAttendanceFilter] = useState("All");
  const [hoursFilter, setHoursFilter] = useState("All");
  const { webinarData } = location.state || {};
  const [selectedWebinarUuid, setSelectedWebinarUuid] = useState(null);

  const [feedbackOpen, setFeedbackOpen] = useState(false);

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
    certificate: true,
  };

  const [visibleColumns, setVisibleColumns] = useState(defaultColumnVisibility);

  const handleWebinarcertification = useCallback(async (row) => {
    if (!row.attended || !row.eligible_for_certificate) {
      const result = await Swal.fire({
        title: "Alert",
        text: "Not Eligible ",
        showCancelButton: true,
        confirmButtonText: "yes,send",
        cancelButtonText: "cancel",
      });
      if (!result.isConfirmed) return;
    }
    try {
      await axiosInstance.post(`api/webinar/certificates/send/`, {
        webinar_uuid: webinarData.uuid,
        participant_ids: [row.id],
      });
      Swal.fire({
        title: "Certification send",
        text: "Eligible for certification",
      });
    } catch (error) {
      console.error("Certificate send failed", error);
    }
  }, []);

  const formatHoursFixed = (hours) => {
    if (hours === null || hours === undefined) return "—";

    const num = Number(hours);
    if (Number.isNaN(num)) return "—";

    return num.toFixed(2); // 0.3 → "0.30"
  };

  const columns = [
    {
      id: "sno",
      name: "S.No",
      selector: (row) => row.index,
      width: "80px",
    },
    {
      id: "name",
      name: "Name",
      selector: (row) => row.name,
      wrap: true,
      cell: (row) => (
        <ButtonBase
          onClick={() => handleViewParticipant(row)}
          sx={{
            justifyContent: "flex-start",
            textAlign: "left",
          }}>
          <Typography
            variant="body2"
            sx={{
              color: row.attended ? "success.main" : "text.primary",
              fontWeight: row.attended ? 600 : 400,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              "&:hover": { textDecoration: "underline" },
            }}>
            {row.attended && (
              <Typography
                component="span"
                sx={{
                  color: "success.main",
                  fontWeight: 700,
                }}>
                ✓
              </Typography>
            )}
            {row.name}
          </Typography>
        </ButtonBase>
      ),
    },
    {
      id: "totalHours",
      name: "Total Hours",
      center: true,
      cell: (row) =>
        row.logs && row.logs.length > 0 ? (
          <Tooltip title="View Attendance Logs">
            <ButtonBase
              onClick={() => handleViewLogs(row)}
              sx={{
                color: "black",
                fontSize: "0.9rem",
              }}>
              {formatHoursFixed(row.total_hours_participated)}
            </ButtonBase>
          </Tooltip>
        ) : (
          <Typography color="text.secondary">—</Typography>
        ),
    },
    { id: "mobile", name: "Mobile", selector: (row) => row.phone },
    { id: "email", name: "Email", selector: (row) => row.email },
    { id: "payment", name: "Payment", selector: (row) => row.payment_status },
    {
      id: "feedback",
      name: "Feedback",
      cell: (row) => (
        <Tooltip title="Webinar Feedback">
          <IconButton
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedWebinarUuid(row.feedback);
              setFeedbackOpen(true);
            }}>
            <FeedbackIcon />
          </IconButton>
        </Tooltip>
      ),
    },
    {
      id: "registeredAt",
      name: "Registered At",
      selector: (row) => formatDateTime(row.registered_at),
    },
    {
      id: "certificateStatus",
      name: "Certificate Status",
      cell: (row) =>
        row.certificate_sent ? (
          <Button
            variant="text"
            onClick={handleViewCertificate}
            sx={{
              color: "success.main",
              fontWeight: 600,
              textDecoration: "underline",
              padding: 0,
              minWidth: 0,
            }}>
            Yes
          </Button>
        ) : (
          <Typography color="text.secondary">No</Typography>
        ),
    },
    {
      id: "certificate",
      name: "Certificate",
      cell: (row) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          {/* {row.eligible_for_certificate == true && ( */}
          <Button
            variant="contained"
            size="small"
            onClick={() => handleWebinarcertification(row)}>
            Send
          </Button>
          {/* )} */}
        </Box>
      ),
    },
  ];

  useEffect(() => {
    const initialVisibility = {};
    columns.forEach((col) => {
      initialVisibility[col.id] = true;
    });
    setVisibleColumns(initialVisibility);
  }, []);

  const filteredColumns = useMemo(() => {
    return columns.filter((col) => visibleColumns[col.id] !== false);
  }, [visibleColumns]);

  const allRows = useMemo(() => {
    return (
      webinarData?.participants?.map((p, index) => ({
        id: p.id,
        index: index + 1,
        name: capitalize(p.name),
        logs: p.logs || [],
        phone: p.phone,
        email: p.email,
        registered_at: p.registered_at,
        webinar_uuid: webinarData?.uuid,
        scheduled_start: webinarData?.scheduled_start || "-",
        attended: p.attended || false,
        total_hours_participated: Number(p.total_hours_participated) || 0,
        hours_participated: p.hours_participated,
        payment_status: p.payment_status,
        certificate_sent: p.certificate_sent || false,
        certificate_image_url: p.certificate_image_url,
        feedback: p.feedback || [],
        price: p.price,
        regular_price: p.regular_price,
        eligible_for_certificate: p.eligible_for_certificate,
      })) || []
    );
  }, [webinarData]);

  // Filter rows based on attendance
  const rows = useMemo(() => {
    if (attendanceFilter === "Attended")
      return allRows.filter((r) => r.attended);
    if (attendanceFilter === "Not Attended")
      return allRows.filter((r) => !r.attended);
    return allRows;
  }, [allRows, attendanceFilter]);
  const exportToExcel = useCallback(() => {
    if (!rows || rows.length === 0) {
      alert("No data to export");
      return;
    }

    const worksheetData = rows.map((row) => ({
      "S.No": row.index,
      Name: row.name,
      id: row.id,
      "Phone Number": row.phone,
      Email: row.email,
      payment: row.payment_status,
      total_hours_participated: formatHoursFixed(row.total_hours_participated),
      "Registered At": formatDateTime(row.registered_at),
      scheduled_start: row.scheduled_start,
      eligible_for_certificate: row.eligible_for_certificate,
      certificate_sent: row.certificate_sent,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");
    XLSX.writeFile(
      workbook,
      `${webinarData.title || "webinar"}_Participants.xlsx`,
    );
  }, [rows, webinarData]);

  const formatTimeOnly = (dateTimeStr) => {
    if (!dateTimeStr) return "—";
    return dateTimeStr.split(" ")[1] || dateTimeStr; // "2026-01-27 06:22:17" → "06:22:17"
  };

  /* ================= UI ================= */
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Card
        sx={{
          mb: 4,
          borderRadius: 4,
          background: "#ffffff",
          border: "1px solid #e6e8ec",
          boxShadow: "0 12px 35px rgba(17, 24, 39, 0.08)",
          overflow: "hidden",
        }}>
        {/* Premium Header Section */}
        <Box
          sx={{
            px: 4,
            py: 3,
            borderBottom: "1px solid #eef1f5",
            background: "linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)",
          }}>
          <Grid container alignItems="center">
            <Grid item xs>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  color: "#1f2937",
                }}>
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
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 2.5,
                  borderColor: "#d1d5db",
                  color: "#374151",
                  "&:hover": {
                    backgroundColor: "#f3f4f6",
                    borderColor: "#9ca3af",
                  },
                }}>
                Back
              </Button>
            </Grid>
          </Grid>
        </Box>
        <CardContent sx={{ px: 4, py: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  borderRadius: 3,
                  p: 3,
                  background:
                    "linear-gradient(135deg, #4a0d18 0%, #6b1222 100%)",
                  color: "#ffffff",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                  position: "relative",
                  overflow: "hidden",
                }}>
                {/* Decorative Glow Circle */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -30,
                    left: -30,
                    width: 120,
                    height: 120,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "50%",
                  }}
                />

                <Stack spacing={3}>
                  {/* Event Date */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "rgba(255,255,255,0.12)",
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                    }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <CalendarToday fontSize="small" />
                      <Typography
                        variant="subtitle2"
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: 1,
                          opacity: 0.85,
                        }}>
                        Event Date
                      </Typography>
                    </Stack>

                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {webinarData?.scheduled_start || "-"}
                    </Typography>
                  </Box>

                  {/* Registered Count */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "rgba(255,255,255,0.12)",
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                    }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <People fontSize="small" />
                      <Typography
                        variant="subtitle2"
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: 1,
                          opacity: 0.85,
                        }}>
                        Registered
                      </Typography>
                    </Stack>

                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        letterSpacing: 1,
                      }}>
                      {webinarData?.participants_count ?? 0}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  borderRadius: 3,
                  p: 3,
                  background:
                    "linear-gradient(135deg, #5a0f1c 0%, #7a1628 100%)",
                  color: "#ffffff",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                  position: "relative",
                  overflow: "hidden",
                }}>
                {/* Subtle Overlay Glow */}
                <Box
                  sx={{
                    position: "absolute",
                    top: -40,
                    right: -40,
                    width: 140,
                    height: 140,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "50%",
                  }}
                />

                <Stack spacing={3}>
                  {/* Webinar Link Section */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        fontWeight: 600,
                        opacity: 0.8,
                        mb: 1,
                      }}>
                      Webinar Zoom Link
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: "rgba(255,255,255,0.12)",
                        px: 2,
                        py: 1.2,
                        borderRadius: 2,
                      }}>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "75%",
                        }}>
                        {webinarData?.zoom_link || "-"}
                      </Typography>

                      <Button
                        size="small"
                        variant="contained"
                        onClick={() =>
                          navigator.clipboard.writeText(webinarData?.zoom_link)
                        }
                        sx={{
                          backgroundColor: "#ffffff",
                          color: "#7a1628",
                          fontWeight: 600,
                          textTransform: "none",
                          "&:hover": {
                            backgroundColor: "#f3f4f6",
                          },
                        }}>
                        Copy
                      </Button>
                    </Box>
                  </Box>

                  {/* Pricing Section */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        fontWeight: 600,
                        opacity: 0.8,
                        mb: 1,
                      }}>
                      Pricing
                    </Typography>

                    {webinarData?.is_paid ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        {webinarData?.regular_price && (
                          <Typography
                            variant="body2"
                            sx={{
                              textDecoration: "line-through",
                              opacity: 0.7,
                            }}>
                            ₹
                            {Number(webinarData.regular_price).toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}
                          </Typography>
                        )}

                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            letterSpacing: 1,
                          }}>
                          ₹
                          {Number(webinarData.price || 0).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                        </Typography>
                      </Box>
                    ) : (
                      <Chip
                        label="Free Access"
                        sx={{
                          backgroundColor: "#ffffff",
                          color: "#7a1628",
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </Box>
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12} md={6} sx={{ p: 3 }}>
              <Box
                sx={{
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #eef2f7 100%)",
                  borderRadius: 3,
                  p: 3,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                  border: "1px solid #e5e7eb",
                }}>
                {/* Header */}
                <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                  <Box
                    sx={{
                      backgroundColor: "#8a1616",
                      color: "#fff",
                      borderRadius: 2,
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                    <Description fontSize="small" />
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: 0.5,
                      color: "#1f2937",
                    }}>
                    Webinar Description
                  </Typography>
                </Stack>

                {/* Content */}
                <Typography
                  variant="body1"
                  sx={{
                    color: "#4b5563",
                    lineHeight: 1.8,
                    fontSize: "0.95rem",
                  }}>
                  {webinarData?.description || "No description available."}
                </Typography>
              </Box>
            </Grid>
            {/* </Grid> */}
          </Grid>
        </CardContent>
      </Card>

      <Card
        sx={{
          mb: 4,
          borderRadius: 4,
          background: "#ffffff",
          border: "1px solid #e6e8ec",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
          overflow: "hidden",
        }}>
        {/* Executive Header */}
        <Box
          sx={{
            px: 4,
            py: 3,
            borderBottom: "1px solid #eef1f5",
            background: "linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)",
          }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between">
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                letterSpacing: 0.5,
                color: "#111827",
              }}>
              Registered Participants
            </Typography>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={handleColumnClick}
                endIcon={<ArrowDropDownIcon />}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  fontWeight: 600,
                  borderColor: "#d1d5db",
                  color: "#374151",
                  "&:hover": {
                    backgroundColor: "#f3f4f6",
                  },
                }}>
                Columns
              </Button>

              <Button
                variant="contained"
                onClick={exportToExcel}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  fontWeight: 600,
                  backgroundColor: "#111827",
                  "&:hover": {
                    backgroundColor: "#000000",
                  },
                }}>
                Export
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Filters Section */}
        <Box sx={{ px: 4, py: 3 }}>
          <Stack direction="row" spacing={3}>
            <TextField
              select
              size="small"
              label="Attendance"
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
              sx={{ minWidth: 180 }}>
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
              sx={{ minWidth: 200 }}>
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
          </Stack>
        </Box>

        {/* Table Section */}
        <Box
          sx={{
            px: 4,
            pb: 4,
            "& .rdt_Table": {
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid #eef1f5",
            },
          }}>
          <DataTable
            columns={filteredColumns}
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

        {/* Column Selection Menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleColumnClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: {
              width: 260,
              mt: 1,
              p: 2,
              borderRadius: 3,
              boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
            },
          }}>
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
                      [col.id]: e.target.checked,
                    }))
                  }
                />
              }
              label={col.name}
              sx={{ display: "block" }}
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
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.18)",
          },
        }}>
        {/* Header */}
        <Box
          sx={{
            px: 4,
            py: 3,
            borderBottom: "1px solid #eef1f5",
            background: "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
          }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              letterSpacing: 0.5,
              color: "#111827",
            }}>
            Participant Details
          </Typography>
        </Box>

        {/* Content */}
        <DialogContent sx={{ px: 4, py: 4 }}>
          {selectedParticipant && (
            <Stack spacing={3}>
              {/* Name */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: "#6b7280", fontWeight: 600 }}>
                  FULL NAME
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#111827" }}>
                  {selectedParticipant.name}
                </Typography>
              </Box>

              <Divider />

              {/* Contact Info */}
              <Stack direction="row" spacing={4}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#6b7280", fontWeight: 600 }}>
                    PHONE
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#1f2937" }}>
                    {selectedParticipant.phone}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#6b7280", fontWeight: 600 }}>
                    EMAIL
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#1f2937" }}>
                    {selectedParticipant.email}
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              {/* Status Section */}
              <Stack direction="row" spacing={4}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#6b7280", fontWeight: 600 }}>
                    PAYMENT STATUS
                  </Typography>
                  <Chip
                    label={selectedParticipant.payment_status}
                    size="small"
                    sx={{
                      mt: 1,
                      ml: 1,
                      fontWeight: 600,
                      backgroundColor: "#eef2ff",
                      color: "#3730a3",
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#6b7280", fontWeight: 600 }}>
                    ATTENDANCE
                  </Typography>
                  <Chip
                    label={
                      selectedParticipant.attended ? "Attended" : "Not Attended"
                    }
                    size="small"
                    sx={{
                      mt: 1,
                      ml: 1,
                      fontWeight: 600,
                      backgroundColor: selectedParticipant.attended
                        ? "#ecfdf5"
                        : "#fef2f2",
                      color: selectedParticipant.attended
                        ? "#065f46"
                        : "#991b1b",
                    }}
                  />
                </Box>
              </Stack>

              <Divider />

              {/* Participation */}
              <Stack direction="row" spacing={4}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#6b7280", fontWeight: 600 }}>
                    HOURS PARTICIPATED
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatHoursFixed(
                      selectedParticipant.total_hours_participated,
                    )}{" "}
                    hrs
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#6b7280", fontWeight: 600 }}>
                    REGISTERED AT
                  </Typography>
                  <Typography variant="body1">
                    {formatDateTime(selectedParticipant.registered_at)}
                  </Typography>
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
            borderTop: "1px solid #eef1f5",
          }}>
          <Button
            onClick={handleCloseView}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              backgroundColor: "#111827",
              "&:hover": { backgroundColor: "#000000" },
            }}>
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
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 22px 55px rgba(15, 23, 42, 0.18)",
          },
        }}>
        {/* Header */}
        <Box
          sx={{
            px: 4,
            py: 3,
            borderBottom: "1px solid #eef1f5",
            background: "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
          }}>
          <Stack spacing={1}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827" }}>
              Attendance Logs
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: "#6b7280", fontWeight: 500 }}>
              Participant:{" "}
              <span style={{ color: "#111827", fontWeight: 600 }}>
                {selectedLogsUser}
              </span>
            </Typography>
          </Stack>
        </Box>

        {/* Content */}
        <DialogContent sx={{ px: 4, py: 4 }}>
          {selectedLogs.length === 0 ? (
            <Box
              sx={{
                py: 6,
                textAlign: "center",
                borderRadius: 3,
                backgroundColor: "#f9fafb",
                border: "1px dashed #e5e7eb",
              }}>
              <Typography
                variant="body1"
                sx={{ color: "#6b7280", fontWeight: 500 }}>
                No attendance logs available
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                borderRadius: 3,
                border: "1px solid #eef1f5",
                overflow: "hidden",
                "& .rdt_TableHead": {
                  backgroundColor: "#f9fafb",
                },
              }}>
              <DataTable
                columns={[
                  {
                    name: "S.No",
                    selector: (row, i) => i + 1,
                    width: "80px",
                  },
                  {
                    name: "Join Time",
                    selector: (row) => formatTimeOnly(row.join_time),
                  },
                  {
                    name: "Leave Time",
                    selector: (row) => formatTimeOnly(row.leave_time),
                  },
                  {
                    name: "Duration (min)",
                    selector: (row) => row.duration_minutes,
                  },
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
            borderTop: "1px solid #eef1f5",
          }}>
          <Button
            onClick={handleCloseLogs}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              backgroundColor: "#111827",
              "&:hover": { backgroundColor: "#000000" },
            }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openCertificate}
        onClose={handleCloseCertificate}
        maxWidth="md"
        fullWidth>
        <DialogTitle>Certificate Preview</DialogTitle>

        <DialogContent dividers>
          {selectedCertificate ? (
            <Box
              component="img"
              src={selectedCertificate}
              alt="Certificate"
              sx={{
                width: "100%",
                borderRadius: 2,
                border: "1px solid #ddd",
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
