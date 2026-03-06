import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Button,
  TablePagination,
  Fade,
  Card,
  CardContent,
  CardActions,
  Grid,
  useTheme,
  useMediaQuery,
  Collapse,
  Skeleton
} from '@mui/material';
import { APP_PATH_BASE_URL } from 'config';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useParams } from 'react-router';
import axiosInstance from 'utils/axios';
import MainCard from 'components/MainCard';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import DownloadIcon from '@mui/icons-material/Download';

/* ─────────────────────────────────────────
   CONSTANTS & HELPERS
───────────────────────────────────────── */
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const getAnswer = (submission, questionId) => {
  const answer = submission.answers.find((a) => a.question === questionId);
  if (!answer) return null;
  return (
    answer.value_text ||
    answer.value_number?.toString() ||
    (Array.isArray(answer.value_json) ? answer.value_json.join(', ') : answer.value_json) ||
    null
  );
};

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const formatTime = (iso) => new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

/* ─────────────────────────────────────────
   STAT BADGE
───────────────────────────────────────── */
const StatBadge = ({ label, value, color = '#b30000' }) => (
  <Box
    sx={{
      px: { xs: 1.5, sm: 2.5 },
      py: { xs: 0.8, sm: 1.2 },
      borderRadius: '10px',
      background: `linear-gradient(135deg, ${color}14, ${color}08)`,
      border: `1px solid ${color}22`,
      minWidth: { xs: 70, sm: 90 },
      textAlign: 'center'
    }}
  >
    <Typography sx={{ fontSize: { xs: 16, sm: 20 }, fontWeight: 800, color, lineHeight: 1 }}>{value}</Typography>
    <Typography
      sx={{ fontSize: { xs: 9, sm: 10 }, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, mt: 0.3 }}
    >
      {label}
    </Typography>
  </Box>
);

/* ─────────────────────────────────────────
   MOBILE SUBMISSION CARD
───────────────────────────────────────── */
const SubmissionCard = ({ submission, index, questions, onView, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const previewQs = questions.slice(0, 2);
  const restQs = questions.slice(2);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid #f0f0f0',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': { boxShadow: '0 8px 32px rgba(179,0,0,0.10)', transform: 'translateY(-1px)' }
      }}
    >
      {/* Top accent bar */}
      <Box sx={{ height: 3, background: 'linear-gradient(90deg,#ff2e2e,#b30000,#ffb3b3)' }} />

      <CardContent sx={{ pb: 1 }}>
        {/* Header row */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '9px',
                flexShrink: 0,
                background: 'linear-gradient(135deg,#ff2e2e18,#b3000012)',
                border: '1px solid #ff2e2e22',
                display: 'grid',
                placeItems: 'center'
              }}
            >
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#b30000' }}>{index}</Typography>
            </Box>
            <Box>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CalendarTodayIcon sx={{ fontSize: 11, color: '#9ca3af' }} />
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{formatDate(submission.submitted_at)}</Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center" mt={0.2}>
                <AccessTimeIcon sx={{ fontSize: 11, color: '#9ca3af' }} />
                <Typography sx={{ fontSize: 11, color: '#6b7280' }}>{formatTime(submission.submitted_at)}</Typography>
              </Stack>
            </Box>
          </Stack>

          {/* Action buttons */}
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              onClick={() => onView(submission)}
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                background: '#eff6ff',
                color: '#2563eb',
                '&:hover': { background: '#dbeafe' }
              }}
            >
              <VisibilityIcon sx={{ fontSize: 15 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(submission.uuid)}
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                background: '#fff1f2',
                color: '#e11d48',
                '&:hover': { background: '#ffe4e6' }
              }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Stack>
        </Stack>

        <Divider sx={{ mb: 1.5, opacity: 0.5 }} />

        {/* Preview answers (first 2) */}
        <Stack spacing={1}>
          {previewQs.map((q) => {
            const ans = getAnswer(submission, q.id);
            return (
              <Box key={q.id}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  {q.label}
                </Typography>
                <Typography
                  sx={{ fontSize: 13, color: ans ? '#0f172a' : '#d1d5db', fontStyle: ans ? 'normal' : 'italic', mt: 0.2, lineHeight: 1.5 }}
                >
                  {ans || 'No answer'}
                </Typography>
              </Box>
            );
          })}
        </Stack>

        {/* Expandable rest */}
        {restQs.length > 0 && (
          <Collapse in={expanded} timeout="auto">
            <Stack spacing={1} mt={1.5}>
              {restQs.map((q) => {
                const ans = getAnswer(submission, q.id);
                return (
                  <Box key={q.id}>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                      {q.label}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: ans ? '#0f172a' : '#d1d5db', fontStyle: ans ? 'normal' : 'italic', mt: 0.2 }}>
                      {ans || 'No answer'}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Collapse>
        )}
      </CardContent>

      {restQs.length > 0 && (
        <CardActions sx={{ pt: 0, px: 2, pb: 1.5 }}>
          <Button
            size="small"
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setExpanded(!expanded)}
            sx={{ fontSize: 11, color: '#b30000', fontWeight: 600, p: 0, minWidth: 0, '&:hover': { background: 'transparent' } }}
          >
            {expanded ? 'Show less' : `+${restQs.length} more`}
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

/* ─────────────────────────────────────────
   LOADING SKELETON
───────────────────────────────────────── */
const LoadingSkeleton = ({ isMobile }) =>
  isMobile ? (
    <Stack spacing={2}>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} variant="rounded" height={160} sx={{ borderRadius: 3 }} />
      ))}
    </Stack>
  ) : (
    <Stack spacing={1}>
      <Skeleton variant="rounded" height={44} />
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} variant="rounded" height={52} sx={{ opacity: 1 - i * 0.1 }} />
      ))}
    </Stack>
  );

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
const FormDetail = () => {
  const { slug } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px → card view
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600–900px → 2-col cards

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openColumns, setOpenColumns] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewSubmission, setViewSubmission] = useState(null);

  /* ── fetch ── */
  useEffect(() => {
    const fetchForm = async () => {
      setLoading(true);
      try {
        if (!slug) return;
        const res = await axiosInstance.get(`${APP_PATH_BASE_URL}/api/webinar/forms/${slug}/`);
        const data = res?.data?.data;
        if (!data) throw new Error('Invalid form response');
        setForm(data);
        setVisibleColumns(data.questions?.map((q) => q.id) || []);
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || error.message || 'Failed to load form', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [slug]);

  /* ── copy link ── */
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/forms/${form.slug}/submit`);
    Swal.fire({ icon: 'success', title: 'Link copied!', timer: 1200, showConfirmButton: false, toast: true, position: 'top-end' });
  };

  // excel export

  const handleExportExcel = () => {
    if (!form?.submissions?.length) {
      Swal.fire('No Data', 'No submissions available to export', 'info');
      return;
    }

    const rows = form.submissions.map((submission, index) => {
      const row = {
        'S.No': index + 1
      };

      // Export only visible question columns
      visibleQs.forEach((q) => {
        const ans = getAnswer(submission, q.id);
        row[q.label] = ans || '';
      });

      // Add submitted at only once
      row['Submitted At'] = `${formatDate(submission.submitted_at)} ${formatTime(submission.submitted_at)}`;

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Responses');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const file = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    saveAs(file, `${form.title || 'form'}-responses.xlsx`);
  };

  /* ── toggle column ── */
  const toggleColumn = (id) => setVisibleColumns((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  /* ── delete ── */
  const handleDelete = async (uuid) => {
    const result = await Swal.fire({
      title: 'Delete this submission?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d40000',
      confirmButtonText: 'Yes, delete it'
    });
    if (!result.isConfirmed) return;

    try {
      await axiosInstance.delete(`${APP_PATH_BASE_URL}/api/webinar/submissions/${uuid}/`);
      Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false, toast: true, position: 'top-end' });
      setForm((prev) => ({
        ...prev,
        submissions: prev.submissions.filter((s) => s.uuid !== uuid),
        submissions_count: (prev.submissions_count || 1) - 1
      }));
      if (viewSubmission?.uuid === uuid) setViewSubmission(null);
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to delete', 'error');
    }
  };

  /* ── derived ── */
  const submissions = form?.submissions || [];
  const totalCount = submissions.length;
  const pageRows = submissions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const visibleQs = (form?.questions || []).filter((q) => visibleColumns.includes(q.id));

  /* ── shared pagination bar ── */
  const PaginationFooter = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: { xs: 'center', sm: 'space-between' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1,
        px: { xs: 1, sm: 3 },
        py: 1.5,
        borderTop: '1px solid #f0f0f0',
        background: 'linear-gradient(180deg,#fafafa,#f5f5f5)',
        borderRadius: '0 0 12px 12px'
      }}
    >
      <Typography sx={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
        Showing{' '}
        <strong style={{ color: '#0f172a' }}>
          {totalCount === 0 ? 0 : page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, totalCount)}
        </strong>{' '}
        of <strong style={{ color: '#0f172a' }}>{totalCount}</strong> submissions
      </Typography>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        sx={{
          border: 'none',
          '& .MuiTablePagination-toolbar': { minHeight: 0, p: 0 },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: 12, color: '#6b7280' },
          '& .MuiTablePagination-actions button': {
            border: '1px solid #e5e7eb',
            borderRadius: 1.5,
            mx: 0.3,
            '&:hover': { background: '#fff5f5', borderColor: '#b30000' }
          }
        }}
      />
    </Box>
  );

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
  return (
    <MainCard
      sx={{
        background: 'linear-gradient(160deg,#fff 0%,#fff7f7 100%)',
        border: '1px solid rgba(179,0,0,0.08)',
        borderRadius: { xs: 2, sm: 4 },
        p: { xs: 2, sm: 3 }
      }}
    >
      {/* ════════════════════
          HEADER
      ════════════════════ */}
      <Box pb={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} spacing={2}>
          {/* Title */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: { xs: 42, sm: 52 },
                height: { xs: 42, sm: 52 },
                borderRadius: 2.5,
                flexShrink: 0,
                background: 'linear-gradient(135deg,#ff2e2e,#b30000)',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 8px 24px rgba(255,46,46,0.28)'
              }}
            >
              <AssignmentIcon sx={{ color: '#fff', fontSize: { xs: 20, sm: 24 } }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#0f172a', letterSpacing: '-0.3px', fontSize: { xs: 17, sm: 22 } }}>
                {form?.title || '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3, fontSize: { xs: 12, sm: 13 } }}>
                {form?.description}
              </Typography>
            </Box>
          </Stack>

          {/* Badges + icons */}
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mt: { xs: 1, sm: 0 } }}>
            {form && (
              <>
                <StatBadge label="Submissions" value={form.submissions_count ?? totalCount} color="#b30000" />
                <StatBadge label="Questions" value={form.questions.length} color="#0369a1" />
                <StatBadge
                  label={form.is_active ? 'Active' : 'Inactive'}
                  value={form.is_active ? '●' : '○'}
                  color={form.is_active ? '#16a34a' : '#6b7280'}
                />
              </>
            )}

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, display: { xs: 'none', sm: 'block' } }} />

            <Tooltip title="Toggle Columns">
              <IconButton
                onClick={() => setOpenColumns(true)}
                sx={{ border: '1px solid #e5e7eb', borderRadius: 2, '&:hover': { background: '#fff7f7', borderColor: '#b30000' } }}
              >
                <ViewColumnOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Export Excel">
              <IconButton
                onClick={handleExportExcel}
                sx={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 2,
                  background: '#fff',
                  '&:hover': {
                    background: '#fff7f7',
                    borderColor: '#b30000'
                  }
                }}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Copy Public Link">
              <IconButton
                onClick={handleCopyLink}
                sx={{ border: '1px solid #e5e7eb', borderRadius: 2, '&:hover': { background: '#fff7f7', borderColor: '#b30000' } }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Box sx={{ mt: 3, height: 2, borderRadius: 1, background: 'linear-gradient(90deg,#ff2e2e 0%,#ffb3b3 60%,transparent 100%)' }} />
      </Box>

      {/* ════════════════════
          CONTENT
      ════════════════════ */}
      {loading ? (
        <LoadingSkeleton isMobile={isMobile} />
      ) : isMobile ? (
        /* ──────────────────────────────────
           MOBILE / TABLET  →  CARD GRID
        ────────────────────────────────── */
        <Box>
          {totalCount === 0 ? (
            <Stack alignItems="center" spacing={2} py={8}>
              <Box sx={{ width: 48, height: 48, borderRadius: '50%', background: '#f3f4f6', display: 'grid', placeItems: 'center' }}>
                <AssignmentIcon sx={{ color: '#9ca3af', fontSize: 24 }} />
              </Box>
              <Typography color="text.secondary" fontWeight={500} fontSize={14}>
                No submissions yet
              </Typography>
            </Stack>
          ) : (
            <>
              <Grid container spacing={isTablet ? 2 : 1.5}>
                {pageRows.map((submission, rowIndex) => (
                  <Grid item xs={12} sm={6} key={submission.id}>
                    <SubmissionCard
                      submission={submission}
                      index={page * rowsPerPage + rowIndex + 1}
                      questions={form.questions}
                      onView={setViewSubmission}
                      onDelete={handleDelete}
                    />
                  </Grid>
                ))}
              </Grid>

              <Box mt={2} sx={{ border: '1px solid #f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                <PaginationFooter />
              </Box>
            </>
          )}
        </Box>
      ) : (
        /* ──────────────────────────────────
           DESKTOP / LAPTOP  →  TABLE VIEW
        ────────────────────────────────── */
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #f0f0f0', overflow: 'hidden', boxShadow: '0 4px 24px rgba(85,10,10,0.04)' }}>
          <TableContainer sx={{ maxHeight: 560 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {/* S.No */}
                  <TableCell
                    sx={{
                      width: 60,
                      fontWeight: 700,
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      background: '#ffffff',
                      color: '#000000',
                      borderBottom: '2px solid #b30000',
                      py: 1.8
                    }}
                  >
                    S.No
                  </TableCell>

                  {/* Dynamic columns */}
                  {visibleQs.map((q) => (
                    <TableCell
                      key={q.id}
                      sx={{
                        fontWeight: 700,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        whiteSpace: 'nowrap',
                        background: '#ffffff',
                        color: '#000000',
                        borderBottom: '2px solid #b30000',
                        minWidth: 160
                      }}
                    >
                      {q.label}
                    </TableCell>
                  ))}
                  {/* Submitted At */}
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      background: '#ffffff',
                      color: '#000000',
                      borderBottom: '2px solid #b30000',
                      minWidth: 150
                    }}
                  >
                    Submitted At
                  </TableCell>
                  {/* Actions */}
                  <TableCell
                    align="center"
                    sx={{
                      width: 110,
                      fontWeight: 700,
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      background: '#ffffff',
                      color: '#000000',
                      borderBottom: '2px solid #b30000'
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {totalCount === 0 && (
                  <TableRow>
                    <TableCell colSpan={visibleQs.length + 3} align="center" sx={{ py: 8 }}>
                      <Stack alignItems="center" spacing={1.5}>
                        <Box
                          sx={{ width: 40, height: 40, borderRadius: '50%', background: '#f3f4f6', display: 'grid', placeItems: 'center' }}
                        >
                          <AssignmentIcon sx={{ color: '#9ca3af', fontSize: 20 }} />
                        </Box>
                        <Typography color="text.secondary" fontWeight={500}>
                          No submissions yet
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )}

                {pageRows.map((submission, rowIndex) => {
                  const globalIndex = page * rowsPerPage + rowIndex + 1;
                  const isEven = rowIndex % 2 === 0;

                  return (
                    <TableRow
                      key={submission.id}
                      hover
                      sx={{
                        background: isEven ? '#ffffff' : '#fafafa',
                        transition: 'background 0.15s',
                        '&:hover': { background: '#fff5f5' },
                        '&:hover .row-actions': { opacity: 1 }
                      }}
                    >
                      {/* S.No pill */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg,#ff2e2e18,#b3000012)',
                            border: '1px solid #ff2e2e22',
                            display: 'grid',
                            placeItems: 'center'
                          }}
                        >
                          <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#b30000' }}>{globalIndex}</Typography>
                        </Box>
                      </TableCell>

                      {/* Answers */}
                      {visibleQs.map((q) => {
                        const ans = getAnswer(submission, q.id);
                        return (
                          <TableCell key={q.id} sx={{ py: 1.5, maxWidth: 220 }}>
                            {ans ? (
                              <Typography
                                sx={{
                                  fontSize: 13,
                                  color: '#374151',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: 200
                                }}
                                title={ans}
                              >
                                {ans}
                              </Typography>
                            ) : (
                              <Typography sx={{ fontSize: 12, color: '#d1d5db', fontStyle: 'italic' }}>—</Typography>
                            )}
                          </TableCell>
                        );
                      })}

                      {/* Date + Time */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack spacing={0.2}>
                          <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
                            {formatDate(submission.submitted_at)}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: '#6b7280' }}>{formatTime(submission.submitted_at)}</Typography>
                        </Stack>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="center"
                          className="row-actions"
                          sx={{ opacity: 0.75, transition: 'opacity 0.2s' }}
                        >
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => setViewSubmission(submission)}
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: 1.5,
                                background: '#eff6ff',
                                color: '#2563eb',
                                '&:hover': { background: '#dbeafe' }
                              }}
                            >
                              <VisibilityIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(submission.uuid)}
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: 1.5,
                                background: '#fff1f2',
                                color: '#e11d48',
                                '&:hover': { background: '#ffe4e6' }
                              }}
                            >
                              <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <PaginationFooter />
        </Paper>
      )}

      {/* ════════════════════
          COLUMN DIALOG
      ════════════════════ */}
      <Dialog open={openColumns} onClose={() => setOpenColumns(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <ViewColumnOutlinedIcon sx={{ color: '#b30000' }} />
              <Typography fontWeight={700}>Visible Columns</Typography>
            </Stack>
            <IconButton size="small" onClick={() => setOpenColumns(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={0.5}>
            {(form?.questions || []).map((q) => (
              <FormControlLabel
                key={q.id}
                control={
                  <Checkbox
                    checked={visibleColumns.includes(q.id)}
                    onChange={() => toggleColumn(q.id)}
                    size="small"
                    sx={{ color: '#b30000', '&.Mui-checked': { color: '#b30000' } }}
                  />
                }
                label={<Typography sx={{ fontSize: 13, fontWeight: 500 }}>{q.label}</Typography>}
                sx={{ px: 1, py: 0.5, borderRadius: 1.5, '&:hover': { background: '#fff7f7' } }}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setVisibleColumns((form?.questions || []).map((q) => q.id))}
            sx={{ borderColor: '#e5e7eb', color: '#374151', fontSize: 12 }}
          >
            Select All
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => setOpenColumns(false)}
            sx={{ background: 'linear-gradient(90deg,#ff2e2e,#b30000)', fontSize: 12 }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* ════════════════════
          VIEW DIALOG
      ════════════════════ */}
      <Dialog
        open={Boolean(viewSubmission)}
        onClose={() => setViewSubmission(null)}
        fullWidth
        fullScreen={isMobile}
        maxWidth="sm"
        TransitionComponent={Fade}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3, overflow: 'hidden' } }}
      >
        {/* Dark top bar */}
        <Box sx={{ background: 'linear-gradient(90deg,#1a1a2e,#16213e)', px: 3, py: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack spacing={0.3}>
              <Typography fontWeight={700} sx={{ color: '#fff', fontSize: 15 }}>
                Submission Detail
              </Typography>
              {viewSubmission && (
                <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>
                  {new Date(viewSubmission.submitted_at).toLocaleString('en-IN')}
                </Typography>
              )}
            </Stack>
            <IconButton size="small" onClick={() => setViewSubmission(null)} sx={{ color: '#94a3b8', '&:hover': { color: '#fff' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          {viewSubmission && (
            <Stack divider={<Divider sx={{ opacity: 0.5 }} />}>
              {(form?.questions || []).map((q, index) => {
                const ans = getAnswer(viewSubmission, q.id);
                return (
                  <Box key={q.id} sx={{ px: 3, py: 2, '&:hover': { background: '#fafafa' } }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box
                        sx={{
                          mt: 0.2,
                          width: 22,
                          height: 22,
                          borderRadius: '6px',
                          flexShrink: 0,
                          background: 'linear-gradient(135deg,#ff2e2e18,#b3000012)',
                          border: '1px solid #ff2e2e22',
                          display: 'grid',
                          placeItems: 'center'
                        }}
                      >
                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#b30000' }}>{index + 1}</Typography>
                      </Box>
                      <Box flex={1}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#374151', mb: 0.5 }}>{q.label}</Typography>
                        {ans ? (
                          <Typography sx={{ fontSize: 13, color: '#0f172a', lineHeight: 1.6 }}>{ans}</Typography>
                        ) : (
                          <Typography sx={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>No answer provided</Typography>
                        )}
                      </Box>
                      <Chip
                        label={q.type}
                        size="small"
                        sx={{ fontSize: 10, height: 20, background: '#f3f4f6', color: '#6b7280', fontWeight: 600 }}
                      />
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 1.8, justifyContent: 'space-between' }}>
          <Button
            size="small"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => {
              const s = viewSubmission;
              setViewSubmission(null);
              handleDelete(s.uuid);
            }}
            sx={{ fontSize: 12 }}
          >
            Delete
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => setViewSubmission(null)}
            sx={{ background: 'linear-gradient(90deg,#ff2e2e,#b30000)', fontSize: 12 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default FormDetail;
