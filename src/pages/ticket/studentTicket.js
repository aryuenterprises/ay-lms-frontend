import React, { useState, useEffect, useCallback } from 'react';
import MainCard from 'components/MainCard';
import {
  Box,
  Button,
  Grid,
  TextField,
  MenuItem,
  Paper,
  Typography,
  Alert,
  Snackbar,
  Stack,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Send,
  Ticket,
  Category,
  Message,
  DocumentText,
  AttachCircle,
  ArrowUp2,
  ArrowDown2,
  Eye,
  Add,
  // User,
  // Mobile,
  CloseSquare
} from 'iconsax-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import DataTable from 'react-data-table-component';
// import { Email } from '@mui/icons-material';
import 'assets/css/DataTable.css';
import PropTypes from 'prop-types';
import { APP_PATH_BASE_URL } from 'config';
import axiosInstance from 'utils/axios';
import { Capitalise } from 'utils/capitalise';

const StudentTicket = () => {
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'create'
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [replyMessage, setReplyMessage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Priorities
  const priorities = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' }
  ];

  const auth = JSON.parse(localStorage.getItem('auth'));
  // const regId = auth?.user?.employee_id || auth?.user?.user_id;
  const loginType = auth?.loginType;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/tickets/?type=iron_man`);
      const data = response.data;
      const fd = data.tickets.map((ticket, index) => {
        return {
          ...ticket,
          sno: index + 1
        };
      });
      setTickets(fd);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, []);

  // Load initial tickets
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'info.main';
      case 'in_progress':
        return 'warning.main';
      case 'closed':
        return 'success.main';
      default:
        return 'default';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'new':
        return 'info.lighter';
      case 'in_progress':
        return 'warning.lighter';
      case 'closed':
        return 'success.lighter';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (status) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'high':
        return 'error.main';
      case 'medium':
        return 'warning.main';
      case 'low':
        return 'success.main';
      default:
        return 'default';
    }
  };

  const getPriorityBgColor = (status) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'high':
        return 'error.lighter';
      case 'medium':
        return 'warning.lighter';
      case 'low':
        return 'success.lighter';
      default:
        return 'default';
    }
  };

  const getLables = (status) => {
    switch (status) {
      case 'new':
        return 'New';
      case 'in_progress':
        return 'In Progress';
      case 'closed':
        return 'Closed';
      default:
        return '-';
    }
  };

  // Validation Schema for new ticket
  const validationSchema = Yup.object({
    priority: Yup.string().required('Priority is required'),
    subject: Yup.string().required('Subject is required'),
    message: Yup.string().required('Message is required')
  });

  // Formik hook for new ticket
  const formik = useFormik({
    initialValues: {
      priority: 'Medium',
      subject: '',
      message: '',
      attachment: null
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);

      try {
        const formData = new FormData();
        formData.append('priority', values.priority);
        formData.append('subject', values.subject);
        formData.append('message', values.message);
        if (values.attachment) {
          formData.append('attachment', values.attachment);
        }

        const response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/tickets/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        const newTicket = response.data.data;
        setTickets((prev) => {
          // Add sno=1 to new ticket
          const newTicketWithSno = {
            ...newTicket,
            sno: 1
          };

          // Increment all existing tickets' sno by 1
          const updatedExistingTickets = prev.map((ticket) => ({
            ...ticket,
            sno: ticket.sno + 1
          }));

          // Return new array with new ticket first
          return [newTicketWithSno, ...updatedExistingTickets];
        });

        // Show success message
        setSnackbar({
          open: true,
          message: `Ticket created successfully!`,
          severity: 'success'
        });

        // Switch back to list view
        setViewMode('list');

        // Reset form
        resetForm();
      } catch (error) {
        console.error('Submission error:', error);
        setSnackbar({
          open: true,
          message: 'Failed to submit ticket. Please try again.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // File upload handler
  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];
    if (file) {
      formik.setFieldValue('attachment', file);
    }
  };

  // View ticket details
  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setDialogOpen(true);
  };

  // Handle reply submission
  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    try {
      const response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/tickets/?bat_man=${selectedTicket.ticket_id}`, {
        message: replyMessage
      });

      if (!response.data) return;

      const newReply = response.data.reply;

      // Update selected ticket
      const updatedTicket = {
        ...selectedTicket,
        replies: [...selectedTicket.replies, newReply]
      };

      // Update tickets list
      const updatedTickets = tickets.map((ticket) => (ticket.ticket_id === selectedTicket.ticket_id ? updatedTicket : ticket));

      setTickets(updatedTickets);
      setSelectedTicket(updatedTicket);
      setReplyMessage('');

      // Show success message
      setSnackbar({
        open: true,
        message: 'Reply sent successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error sending reply:', error);

      // Show error message
      setSnackbar({
        open: true,
        message: 'Failed to send reply. Please try again.',
        severity: 'error'
      });
    }
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTicket(null);
    setReplyMessage('');
  };

  // DataTable columns
  const columns = [
    {
      name: 'S.No',
      selector: (row) => row.sno,
      sortable: true,
      width: '120px'
    },
    {
      name: 'Subject',
      selector: (row) => row.subject,
      sortable: true,
      width: '300px'
    },
    {
      name: 'Status',
      cell: (row) => (
        <Chip
          label={getLables(row.status)}
          sx={{
            backgroundColor: getStatusBgColor(row.status),
            color: getStatusColor(row.status),
            minWidth: '90px',
            justifyContent: 'center'
          }}
          size="small"
        />
      ),
      sortable: true
    },
    {
      name: 'Priority',
      cell: (row) => (
        <Chip
          label={Capitalise(row.priority)}
          size="small"
          sx={{
            color: getPriorityColor(row.priority),
            backgroundColor: getPriorityBgColor(row.priority)
          }}
        />
      ),
      sortable: true
    },
    {
      name: 'Created Date',
      selector: (row) => row.created_at,
      sortable: true
    },
    // {
    //   name: 'Last Updated',
    //   selector: (row) => new Date(row.lastUpdated).toLocaleDateString(),
    //   sortable: true
    // },
    {
      name: 'Actions',
      cell: (row) => (
        <Box sx={{ display: 'flex', gap: 1, width: '60px' }}>
          <Tooltip title="View Ticket">
            <IconButton variant="contained" onClick={() => handleViewTicket(row)}>
              <Eye />
            </IconButton>
          </Tooltip>
        </Box>
      ),
      width: '100px'
    }
  ];

  // Status Button Component
  const StatusButton = ({ status, count, color }) => (
    <Button
      variant={selectedStatus === status ? 'contained' : 'outlined'}
      color={color}
      onClick={() => setSelectedStatus(status)}
      sx={{
        minWidth: '120px',
        display: 'flex',
        gap: 1,
        justifyContent: 'space-between'
      }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
      <Badge
        badgeContent={count}
        color="default"
        sx={{
          '& .MuiBadge-badge': {
            backgroundColor: selectedStatus === status ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.1)',
            color: selectedStatus === status ? 'white' : 'text.primary'
          }
        }}
      />
    </Button>
  );

  StatusButton.propTypes = {
    status: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired
  };

  return (
    <MainCard
      title={
        <Box>
          <Typography variant="h4" gutterBottom>
            {viewMode === 'list' ? 'My Support Tickets' : 'Create New Ticket'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {viewMode === 'list' ? 'View and manage all your support tickets' : 'Submit a new support request'}
          </Typography>
        </Box>
      }
      secondary={
        viewMode === 'list' ? (
          <Button variant="contained" color="primary" startIcon={<Add size="20" />} onClick={() => setViewMode('create')}>
            Create New Ticket
          </Button>
        ) : (
          <Button variant="outlined" color="secondary" startIcon={<ArrowUp2 size="20" />} onClick={() => setViewMode('list')}>
            Back to Tickets
          </Button>
        )
      }
      sx={{ borderRadius: 2 }}
    >
      {viewMode === 'list' ? (
        <>
          {/* Tickets Table */}
          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 400 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Loading tickets...
              </Typography>
            </Stack>
          ) : (
            <DataTable
              columns={columns}
              data={tickets}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[5, 10, 20]}
              highlightOnHover
              responsive
              noDataComponent={
                <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
                  <Ticket size={64} color="#ccc" />
                  <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
                    No tickets found
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedStatus === 'all' ? "You haven't created any tickets yet." : `No ${selectedStatus} tickets found.`}
                  </Typography>
                </Stack>
              }
            />
          )}
        </>
      ) : (
        // Create Ticket Form
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Left Side - Form */}
            <Grid item xs={12} lg={8}>
              <Stack spacing={3}>
                {/* Ticket Details Card */}
                <Card elevation={1}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <Category size="20" variant="Bold" /> Ticket Details
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          select
                          fullWidth
                          name="priority"
                          label="Priority"
                          variant="outlined"
                          size="small"
                          value={formik.values.priority}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.priority && Boolean(formik.errors.priority)}
                          helperText={formik.touched.priority && formik.errors.priority}
                        >
                          {priorities.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name="subject"
                          label="Subject"
                          variant="outlined"
                          size="small"
                          value={formik.values.subject}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.subject && Boolean(formik.errors.subject)}
                          helperText={formik.touched.subject && formik.errors.subject}
                          InputProps={{
                            startAdornment: <DocumentText size="18" style={{ marginRight: 8, color: '#666' }} />
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name="message"
                          label="Message"
                          variant="outlined"
                          multiline
                          rows={6}
                          value={formik.values.message}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.message && Boolean(formik.errors.message)}
                          helperText={formik.touched.message && formik.errors.message}
                          InputProps={{
                            startAdornment: (
                              <Message
                                size="18"
                                style={{
                                  marginRight: 8,
                                  color: '#666',
                                  alignSelf: 'flex-start',
                                  marginTop: '12px'
                                }}
                              />
                            )
                          }}
                          placeholder="Please provide detailed information about your issue..."
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Box>
                          <Button component="label" variant="outlined" startIcon={<AttachCircle size="18" />} sx={{ mb: 1 }}>
                            Attach File
                            <input type="file" hidden onChange={handleFileChange} accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx" />
                          </Button>
                          {formik.values.attachment && (
                            <Typography variant="body2" sx={{ mt: 1, ml: 1 }}>
                              Selected: {formik.values.attachment.name}
                              {formik.errors.attachment && (
                                <Typography color="error" variant="caption" display="block">
                                  {formik.errors.attachment}
                                </Typography>
                              )}
                            </Typography>
                          )}
                          <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                            Supported formats: JPG, PNG, GIF, PDF, DOC
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="outlined" color="secondary" onClick={() => formik.resetForm()} disabled={loading || formik.isSubmitting}>
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={loading ? <CircularProgress size={20} /> : <Send size="20" />}
                    disabled={loading || formik.isSubmitting || !formik.isValid}
                    sx={{ minWidth: 120 }}
                  >
                    {loading ? 'Submitting...' : 'Submit Ticket'}
                  </Button>
                </Box>
              </Stack>
            </Grid>

            {/* Right Side - Guidelines */}
            <Grid item xs={12} lg={4}>
              <Card elevation={1} sx={{ position: 'sticky', top: 20 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Message size="20" variant="Bold" /> Submission Guidelines
                  </Typography>

                  <Stack spacing={2}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.lighter' }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ArrowUp2 size="16" /> Provide Clear Subject
                      </Typography>
                      <Typography variant="body2">Use a descriptive subject line that summarizes your issue</Typography>
                    </Paper>

                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'warning.lighter' }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DocumentText size="16" /> Detailed message
                      </Typography>
                      <Typography variant="body2">Include steps to reproduce, error messages, and what youve tried</Typography>
                    </Paper>

                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'success.lighter' }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachCircle size="16" /> Attach Screenshots
                      </Typography>
                      <Typography variant="body2">Visual evidence helps us understand and resolve issues faster</Typography>
                    </Paper>

                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'info.lighter' }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ArrowDown2 size="16" /> Response Time
                      </Typography>
                      <Typography variant="body2">Urgent: Within 2 hours | High: 4-6 hours | Medium: 24 hours | Low: 48 hours</Typography>
                    </Paper>
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  {/* <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Your Information
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <User size="14" /> {'-'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email size="14" /> {'-'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Mobile size="14" /> {'-'}
                      </Typography>
                    </Stack>
                  </Box> */}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>
      )}

      {/* Ticket Detail Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedTicket && (
          <>
            <DialogTitle
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6">Ticket Details</Typography>
                <Chip
                  label={getLables(selectedTicket.status)}
                  sx={{
                    backgroundColor: getStatusBgColor(selectedTicket.status),
                    color: getStatusColor(selectedTicket.status),
                    fontWeight: 'bold',
                    minWidth: '100px'
                  }}
                />
              </Box>
              <Box>
                <IconButton onClick={handleCloseDialog}>
                  <CloseSquare size="20" />
                </IconButton>
              </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3 }}>
              {/* Ticket Information */}
              <Card elevation={0} sx={{ mb: 3, backgroundColor: 'background.default', borderRadius: 1 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DocumentText size="20" /> Ticket Information
                  </Typography>

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Title
                      </Typography>
                      <Typography variant="h6">{selectedTicket.subject}</Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Message
                      </Typography>
                      <Typography>{selectedTicket.message}</Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Priority:</strong>
                          <Chip
                            label={Capitalise(selectedTicket.priority)}
                            size="small"
                            sx={{
                              ml: 1,
                              color: getPriorityColor(selectedTicket.priority),
                              backgroundColor: getPriorityBgColor(selectedTicket.priority)
                            }}
                          />
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Created:</strong> {selectedTicket.created_at}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Last Updated:</strong> {'-'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Stack>
                </CardContent>
              </Card>

              {/* Conversation History */}
              {selectedTicket.replies.length > 0 ? (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Message size="20" /> Conversation History
                  </Typography>
                  <Stack spacing={2}>
                    {selectedTicket.replies.map((reply) => (
                      <Paper
                        key={reply.reply_id}
                        elevation={0}
                        sx={{
                          p: 2,
                          bgcolor: reply.sender_type === loginType ? 'secondary.light' : 'grey.100',
                          alignSelf: reply.sender_type === loginType ? 'flex-end' : 'flex-start',
                          maxWidth: '80%',
                          borderRadius: 2,
                          ml: reply.sender_type === loginType ? 'auto' : 0,
                          mr: reply.sender_type === loginType ? 0 : 'auto'
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong>{reply.sender_name}</strong>
                          <Typography variant="caption">{reply.created_at}</Typography>
                        </Typography>
                        <Typography variant="body2">{reply.message}</Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              ) : (
                <Paper elevation={0} sx={{ p: 3, mb: 3, textAlign: 'center', bgcolor: 'background.default' }}>
                  <Message size={32} color="#ccc" />
                  <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                    No conversation yet. Admin will reply soon.
                  </Typography>
                </Paper>
              )}

              {/* Student Reply */}
              {selectedTicket.status === 'in_progress' && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Send size="20" /> Your Reply
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Type your reply here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
              <Button onClick={handleCloseDialog} color="inherit">
                Close
              </Button>
              {selectedTicket.status === 'in_progress' && (
                <Button variant="contained" color="primary" startIcon={<Send />} onClick={handleSendReply} disabled={!replyMessage.trim()}>
                  Send Reply
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default StudentTicket;
