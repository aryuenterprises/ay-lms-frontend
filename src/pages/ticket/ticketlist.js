import React, { useCallback, useEffect, useState } from 'react';
import MainCard from 'components/MainCard';
import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import DataTable from 'react-data-table-component';
import { Eye, User, Calendar, Message, Send, Mobile, CloseSquare } from 'iconsax-react';
import 'assets/css/DataTable.css';
import { Email } from '@mui/icons-material';
import PropTypes from 'prop-types';
import axiosInstance from 'utils/axios';
import { APP_PATH_BASE_URL } from 'config';
import { Capitalise } from 'utils/capitalise';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { formatDateTime } from 'utils/dateUtils';

const TicketTable = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminReply, setAdminReply] = useState('');
  const [closeCount, setCloseCount] = useState(0);
  const [progressCount, setInProgressCount] = useState(0);
  const [newCount, setNewCount] = useState(0);

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
    const s = status?.toLowerCase();
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
    const s = status?.toLowerCase();
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
      case 'all':
        return 'All Tickets';
      default:
        return '-';
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/tickets/?type=wonder_women`);

      setCloseCount(response.data.closed);
      setInProgressCount(response.data.in_progress);
      setNewCount(response.data.new);

      const result = response.data.tickets;
      // Ensure data is an array
      setData(Array.isArray(result) ? result : []);
      setFilteredData(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize with empty data to prevent layout shift
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedStatus === 'all') {
      const ft = data.map((d, index) => {
        return {
          ...d,
          sno: index + 1
        };
      });
      setFilteredData(ft);
    } else {
      const filtered = data.filter((ticket) => ticket.status === selectedStatus);
      const ft = filtered.map((d, index) => {
        return {
          ...d,
          sno: index + 1
        };
      });
      setFilteredData(ft);
    }
  }, [selectedStatus, data]);

  const handleView = (row) => {
    setSelectedTicket(row);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTicket(null);
    setAdminReply('');
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;

    if (!selectedTicket) return;

    const response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/tickets/?close=${selectedTicket.ticket_id}`, {
      status: newStatus
    });
    const data = response.data;
    if (!data.success) return;

    dispatch(
      openSnackbar({
        open: true,
        message: 'Status updated successfully!',
        variant: 'alert',
        alert: { color: 'success' }
      })
    );

    await fetchData();

    const updatedTicket = {
      ...selectedTicket,
      status: newStatus
    };
    setSelectedTicket(updatedTicket);
  };

  const handleSendReply = useCallback(async () => {
    if (!adminReply.trim() || !selectedTicket) return;

    try {
      const response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/tickets/?bat_man=${selectedTicket.ticket_id}`, {
        message: adminReply
      });

      if (!response.data) return;

      dispatch(
        openSnackbar({
          open: true,
          message: 'Reply sent successfully!',
          variant: 'alert',
          alert: { color: 'success' }
        })
      );

      // Clear the reply input immediately for better UX
      setAdminReply('');
      await fetchData();

      const newReply = response.data.reply;

      // Update selected ticket
      const updatedTicket = {
        ...selectedTicket,
        status: 'in_progress',
        replies: [...selectedTicket.replies, newReply]
      };

      setSelectedTicket(updatedTicket);
    } catch (error) {
      console.error('Error sending reply:', error);

      // Show error message
      dispatch(
        openSnackbar({
          open: true,
          message: 'Failed to send reply. Please try again.',
          variant: 'alert',
          alert: { color: 'error' }
        })
      );
    }
  }, [adminReply, selectedTicket, fetchData]);

  const columns = [
    {
      name: 'S.No',
      selector: (row) => row.sno,
      sortable: true,
      width: '120px'
    },
    {
      name: 'Name',
      selector: (row) => Capitalise(row.student_name),
      sortable: true,
      width: '180px'
    },
    {
      name: 'Email',
      selector: (row) => row.email,
      sortable: true,
      width: '220px'
    },
    {
      name: 'Mobile',
      selector: (row) => row.contact_no,
      sortable: true,
      width: '150px'
    },
    {
      name: 'Status',
      cell: (row) => (
        <Chip
          label={getLables(row.status)}
          sx={{
            backgroundColor: getStatusBgColor(row.status),
            color: getStatusColor(row.status),
            minWidth: '90px', // Fixed width
            justifyContent: 'center'
          }}
          size="small"
        />
      ),
      sortable: true,
      width: '130px'
    },
    {
      name: 'Priority',
      cell: (row) => (
        <Chip
          label={row.priority}
          size="small"
          sx={{
            backgroundColor: getPriorityBgColor(row.priority),
            color: getPriorityColor(row.priority),
            justifyContent: 'center'
          }}
        />
      ),
      sortable: true,
      width: '100px'
    },
    {
      name: 'Created At',
      selector: (row) => formatDateTime(row.created_at, { includeTime: false }),
      sortable: true,
      width: '130px'
    },
    {
      name: 'Last Updated',
      selector: (row) => formatDateTime(row.updated_at, { includeTime: false }),
      sortable: true,
      width: '120px'
    },
    {
      name: 'Actions',
      cell: (row) => (
        <Box sx={{ display: 'flex', gap: 1, width: '60px' }}>
          <Tooltip title="View Ticket">
            <IconButton variant="contained" onClick={() => handleView(row)}>
              <Eye />
            </IconButton>
          </Tooltip>
        </Box>
      ),
      width: '100px'
    }
  ];

  const StatusButton = ({ status, count, color }) => (
    <Button
      variant={selectedStatus === status ? 'contained' : 'outlined'}
      color={color}
      onClick={() => setSelectedStatus(status)}
      sx={{
        width: '150px', // Fixed width for all
        height: '40px',
        position: 'relative'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 12,
          right: 40,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textAlign: 'left'
        }}
      >
        {getLables(status)}
      </Box>
      <Box
        sx={{
          position: 'absolute',
          right: 8,
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      >
        {count}
      </Box>
    </Button>
  );

  StatusButton.propTypes = {
    status: PropTypes.string,
    count: PropTypes.number,
    color: PropTypes.string
  };

  return (
    <MainCard
      title="Ticket Management System"
      secondary={
        <Typography variant="h6" color="primary" sx={{ minWidth: '140px' }}>
          Total Tickets: {filteredData.length}
        </Typography>
      }
      sx={{ borderRadius: 2 }}
    >
      {/* Filter Section - Fixed height container */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          bgcolor: 'background.default',
          minHeight: '80px', // Fixed height to prevent shift
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
          <Typography variant="subtitle1" sx={{ minWidth: '120px' }}>
            Filter by Status:
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              flex: 1,
              justifyContent: 'flex-start'
            }}
          >
            <StatusButton status="all" count={data.length} color="primary" label="All Tickets" />
            <StatusButton status="new" count={newCount} color="error" />
            <StatusButton status="in_progress" count={progressCount} color="warning" />
            <StatusButton status="closed" count={closeCount} color="success" />
          </Stack>
        </Stack>
      </Paper>

      {/* Data Table */}
      {loading ? (
        <Box
          sx={{
            height: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Loading tickets...
          </Typography>
        </Box>
      ) : (
        <Box sx={{ minHeight: '400px' }}>
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[5, 10, 20, 30]}
            highlightOnHover
            responsive
            striped
            pointerOnHover
            noDataComponent={
              <Box
                sx={{
                  height: '200px', // Fixed height for empty state
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="body1">
                  {filteredData.length === 0 && data.length > 0 ? 'No tickets found for the selected filter' : 'No tickets available'}
                </Typography>
              </Box>
            }
          />
        </Box>
      )}

      {/* Ticket Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        TransitionProps={{
          // Add transition to prevent immediate layout shift
          timeout: { enter: 300, exit: 200 }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '64px', // Fixed height, not minHeight
            boxSizing: 'border-box',
            visibility: selectedTicket ? 'visible' : 'hidden'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">{selectedTicket ? `Ticket Details - ${selectedTicket.ticketId}` : 'Loading...'}</Typography>
            {selectedTicket && (
              <Chip
                label={getLables(selectedTicket.status)}
                sx={{
                  backgroundColor: getStatusBgColor(selectedTicket.status),
                  color: getStatusColor(selectedTicket.status),
                  fontWeight: 'bold',
                  width: '100px'
                }}
              />
            )}
          </Box>
          <Box>
            <IconButton onClick={handleCloseDialog}>
              <CloseSquare size="20" />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            p: 3,
            height: '600px', // Fixed height, not minHeight
            overflowY: 'auto',
            boxSizing: 'border-box'
          }}
        >
          {/* Always render all sections, just show/hide content */}

          {/* User Information - Always rendered */}
          <Card
            elevation={0}
            sx={{
              mb:8,
              bgcolor: 'background.default',
              height: '180px', // Fixed
              visibility: selectedTicket ? 'visible' : 'hidden'
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <User size="20" /> User Information
              </Typography>
              {selectedTicket ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <User size="18" />
                      <Typography noWrap>
                        <strong>Name:</strong> {Capitalise(selectedTicket.student_name)}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Email size="18" />
                      <Typography noWrap>
                        <strong>Email:</strong> {selectedTicket.email}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Mobile size="18" />
                      <Typography noWrap>
                        <strong>Mobile:</strong> {selectedTicket.contact_no}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              ) : (
                <Box sx={{ height: '40px' }} /> // Reserve space
              )}
              <Box sx={{ mb: 3, height: '90px' }}>
                <Typography variant="h6" gutterBottom>
                  Change Status
                </Typography>

                {selectedTicket ? (
                  <FormControl sx={{ width: 300 }}>
                    <InputLabel id="status-select-label">Status</InputLabel>

                    <Select
                      labelId="status-select-label"
                      id="status-select"
                      value={selectedTicket.status || ''}
                      label="Status"
                      onChange={handleStatusChange}
                    >
                      <MenuItem value="new">New</MenuItem>
                      <MenuItem value="in_progress">In Progress</MenuItem>
                      <MenuItem value="closed">Closed</MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <Box sx={{ height: '40px' }} />
                )}
              </Box>

            </CardContent>
          </Card>

          {/* Ticket Information - Always rendered */}
          <Card
            elevation={0}
            sx={{
              mb: 3,
              bgcolor: 'background.default',
              height: '220px', // Fixed
              visibility: selectedTicket ? 'visible' : 'hidden'
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Message size="20" /> Ticket Information
              </Typography>

              {selectedTicket ? (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Title
                    </Typography>
                    <Typography>{selectedTicket.subject}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Message
                    </Typography>
                    <Typography>{selectedTicket.message}</Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Calendar size="18" />
                        <Typography variant="body2">
                          <strong>Created:</strong> {selectedTicket.created_at}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Last Updated:</strong> {selectedTicket.updated_at}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
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
                  </Grid>
                </Stack>
              ) : (
                <Box sx={{ height: '120px' }} /> // Reserve space
              )}
            </CardContent>
          </Card>




          {/* Admin Reply - Always rendered */}
          <Box sx={{ height: '180px' }}>
            <Typography variant="h6" gutterBottom>
              Admin Reply
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder={selectedTicket ? 'Type your reply here...' : 'Loading...'}
              value={adminReply}
              onChange={(e) => setAdminReply(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
              disabled={!selectedTicket}
            />
          </Box>
             {/* Conversation History - Always rendered */}
          <Box
            sx={{
              mb: 3,
              height: selectedTicket?.replies?.length > 0 ? 'auto' : '100px',
              minHeight: '100px'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Conversation History
            </Typography>
            {selectedTicket?.replies?.length > 0 ? (
              <Stack spacing={2}>
                {selectedTicket.replies.map((reply) => (
                  <Paper
                    key={reply.reply_id}
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: reply.sender_name === 'Academy Admin' ? 'secondary.light' : 'grey.100',
                      alignSelf: reply.sender_name === 'Academy Admin' ? 'flex-end' : 'flex-start',
                      maxWidth: '100%',
                      minWidth: '30%',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      <strong>{reply.sender_name}</strong> • {reply.created_at}
                    </Typography>
                    <Typography variant="body2">{reply.message}</Typography>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Typography color="textSecondary" sx={{ py: 2 }}>
                {selectedTicket ? 'No conversation yet' : 'Loading...'}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            justifyContent: 'space-between',
            height: '64px', // Fixed
            boxSizing: 'border-box'
          }}
        >
          <Button onClick={handleCloseDialog} color="inherit" sx={{ width: '80px' }}>
            Close
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Send />}
            onClick={handleSendReply}
            disabled={!adminReply.trim() || !selectedTicket}
            sx={{ width: '120px' }}
          >
            Send Reply
          </Button>
          
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default TicketTable;
