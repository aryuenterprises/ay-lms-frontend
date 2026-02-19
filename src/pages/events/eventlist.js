import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable from 'react-data-table-component';
import {
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Stack,
  Grid,
  IconButton,
  FormLabel,
  InputAdornment,
  Tooltip
} from '@mui/material';
// import axiosInstance from 'utils/axios';
import { BoxAdd, CloseSquare, Edit, Eye, SearchNormal1, Trash } from 'iconsax-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { PopupTransition } from 'components/@extended/Transitions';
import Swal from 'sweetalert2';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
// Css import
import 'assets/css/commonStyle.css';
import 'assets/css/DataTable.css';
import MainCard from 'components/MainCard';
import { usePermission } from 'hooks/usePermission';

import { useNavigate } from 'react-router';
import axiosInstance from 'utils/axios';
import { formatDateTime } from 'utils/dateUtils';

const EventsList = () => {
  const navigate = useNavigate();
  const { checkPermission } = usePermission();

  const canView = checkPermission('Events', 'view');
  const canCreate = checkPermission('Events', 'create');
  const canUpdate = checkPermission('Events', 'update');
  const canDelete = checkPermission('Events', 'delete');

  const getJoinLink = (roomId) => {
    return `${window.location.origin}/events/${roomId}/qr`;
  };

  const getLeaderboardLink = (roomId) => {
    return `${window.location.origin}/events/user/${roomId}/points/in`;
  };

  const getAdminQuizLink = (roomId) => {
    return `${window.location.origin}/events/admin/${roomId}/live`;
  };
  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: `${label} copied to clipboard`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: 'Unable to copy link'
      });
    }
  };

  const [open, setOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [filterText, setFilterText] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [loading, setLoading] = useState(false);

  // const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  // const userId = auth?.user?.user_id;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`api/live-quiz/rooms/`);
      const result = response?.data?.data || [];
      setEvents(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpen = () => {
    setCurrentEvent(null);
    setOpen(true);
  };

  const filteredItems = useMemo(() => {
    if (!events || !Array.isArray(events)) return [];

    if (filterText) {
      return events?.filter(
        (item) =>
          item.title.toLowerCase().includes(filterText.toLowerCase()) || item.description.toLowerCase().includes(filterText.toLowerCase())
      );
    }
    return events ? events : [];
  }, [events, filterText]);

  const subHeaderComponentMemo = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText('');
      }
    };

    return (
      <Grid container justifyContent="space-between" alignItems="center" my={3}>
        <Grid item xs={12} md={6}>
          <TextField
            placeholder="Search by event name or description..."
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
        </Grid>
        <Grid item xs={12} md={6} textAlign="right">
          {canCreate && (
            <Button color="success" variant="contained" startIcon={<BoxAdd />} onClick={handleOpen}>
              Add Event
            </Button>
          )}
        </Grid>
      </Grid>
    );
  }, [filterText, resetPaginationToggle, canCreate]);

  const handleEdit = (event) => {
    setCurrentEvent({
      id: event.id,
      eventName: event.title,
      eventDescription: event.description,
      eventDate: event.start_at,
      eventParticipantsCount: event.max_participants
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.delete(`api/live-quiz/rooms/${id}/`);
        if (response.data.success === true) {
          Swal.fire({
            title: 'Success!',
            text: 'Event has been deleted.',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          fetchData();
        } else {
          Swal.fire({
            title: 'Error!',
            text: response?.data?.message || 'Error deleting event.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to delete event.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    formik.resetForm();
  };

  const handleViewChange = useCallback(
    (event) => {
      if (event) {
        navigate(`/events/${event.id}`, {
          state: {
            eventId: event.id,
            eventData: {
              eventId: event.id,
              eventName: event.title,
              eventDescription: event.description,
              eventDate: event.start_at,
              eventParticipantsCount: event.max_participants
            }
          }
        });
      }
    },
    [navigate]
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      eventName: currentEvent?.eventName || '',
      eventDescription: currentEvent?.eventDescription || '',
      eventDate: currentEvent?.eventDate ? new Date(currentEvent.eventDate) : null,
      eventParticipantsCount: currentEvent?.eventParticipantsCount || ''
    },
    validationSchema: Yup.object().shape({
      eventName: Yup.string()
        .required('Event name is required')
        .matches(/^[A-Za-z0-9\s\-_,.!?;:'"()]+$/, 'Event name can only contain letters, numbers, spaces and basic punctuation')
        .trim(),
      eventDescription: Yup.string().required('Event description is required').trim(),
      eventDate: Yup.date().required('Event date is required').min(new Date(), 'Event date must be in the future').nullable(),
      eventParticipantsCount: Yup.number()
        .required('Participants count is required')
        .min(1, 'Must have at least 1 participant')
        .integer('Must be a whole number')
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const payload = {
          title: values.eventName.trim(),
          description: values.eventDescription.trim(),
          start_at: values.eventDate,
          max_participants: parseInt(values.eventParticipantsCount)
        };

        const method = currentEvent ? 'PATCH' : 'POST';
        const url = currentEvent ? `api/live-quiz/rooms/${currentEvent.id}/` : `api/live-quiz/rooms/`;

        const response = await axiosInstance({
          method: method,
          url: url,
          data: payload
        });

        const result = response.data;

        if (result.success === true) {
          Swal.fire({
            title: 'Success!',
            text: currentEvent ? 'Event updated successfully!' : 'Event added successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });

          resetForm();
          fetchData();
          handleClose();
        } else {
          const errorMessage = result.message;
          Swal.fire({
            title: 'Error!',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        Swal.fire({
          title: 'Error!',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleEventChange = async (action, currentEvent) => {
    const actionText = action === 'start' ? true : false;

    try {
      // Show confirmation dialog and wait for user response
      const confirmation = await Swal.fire({
        title: 'Confirm',
        text: `Are you sure you want to ${action} this event?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, ' + action + ' it!',
        cancelButtonText: 'Cancel'
      });

      // If user cancels, exit the function
      if (!confirmation.isConfirmed) {
        return;
      }

      // Make API call only after user confirms
      const response = await axiosInstance.post(`api/live-quiz/rooms/${currentEvent.id}/start_quiz/`, { started: actionText });

      const result = response.data;

      if (result.success === true) {
        await Swal.fire({
          title: 'Success!',
          text: `Event ${action}ed successfully!`,
          icon: 'success',
          confirmButtonText: 'OK'
        });

        // Refresh data
        fetchData();
      } else {
        const errorMessage = result.message;
        await Swal.fire({
          title: 'Error!',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      await Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const columns = [
    {
      name: 'S.No',
      selector: (row, index) => index + 1,
      sortable: true,
      width: '80px'
    },
    {
      name: 'Event Name',
      selector: (row) => row.title,
      sortable: true,
      wrap: true
    },
    {
      name: 'Event Date',
      selector: (row) => row.start_at,
      sortable: true,
      cell: (row) => formatDateTime(row.start_at, { includeTime: false })
    },
    {
      name: 'Participants',
      selector: (row) => row.max_participants,
      sortable: true
    },

    {
      name: 'Status',
      cell: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {row.started ? (
            <Box>
              <Button variant="contained" color="success" size="small" onClick={() => handleEventChange('stop', row)}>
                Event Started
              </Button>
            </Box>
          ) : (
            <Box>
              <Button variant="contained" color="error" size="small" onClick={() => handleEventChange('start', row)}>
                Event Not Started
              </Button>
            </Box>
          )}
        </Box>
      ),
      sortable: true
    },

    ...(canUpdate || canDelete || canView
      ? [
          {
            name: 'Actions',
            cell: (row) => {
              const joinLink = getJoinLink(row.id);
              const leaderboardLink = getLeaderboardLink(row.id);
              const adminQuizLink = getAdminQuizLink(row.id);

              return (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {/* View */}
                  <Tooltip title="View Details">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewChange(row);
                      }}
                    >
                      <Eye />
                    </IconButton>
                  </Tooltip>

                  {/* QR Link */}
                  <Tooltip title="Copy QR Join Link">
                    <IconButton color="#000000" onClick={() => copyToClipboard(joinLink, 'QR Join Link')}>
                      <QrCode2Icon />
                    </IconButton>
                  </Tooltip>

                  {/* Leaderboard Link */}
                  <Tooltip title="Open Leaderboard">
                    <IconButton color="success" onClick={() => window.open(leaderboardLink, '_blank')}>
                      <EmojiEventsIcon />
                    </IconButton>
                  </Tooltip>

                  {/* ADMIN QUIZ PAGE */}
                  <Tooltip title="Open Admin Quiz">
                    <IconButton size="medium" color="primary" onClick={() => window.open(adminQuizLink)}>
                      <SportsEsportsIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {/* Edit */}
                  {canUpdate && (
                    <Tooltip title="Edit">
                      <IconButton color="info" onClick={() => handleEdit(row)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Delete */}
                  {canDelete && (
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(row.id)}>
                        <Trash />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              );
            }
          }
        ]
      : [])
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
  const customStyles = {
    table: {
      style: {
        borderSpacing: 0
      }
    },
    headCells: {
      style: {
        paddingTop: '8px',
        paddingBottom: '8px',
        paddingLeft: '8px',
        paddingRight: '8px',
        fontWeight: 600
      }
    },
    cells: {
      style: {
        paddingTop: '6px',
        paddingBottom: '6px',
        paddingLeft: '8px',
        paddingRight: '8px',
        lineHeight: '1.4'
      }
    },
    rows: {
      style: {
        minHeight: '44px' // default is 56px (this is the big gap!)
      }
    }
  };

  return (
    <MainCard>
      {subHeaderComponentMemo}

      <DataTable
        columns={columns}
        data={filteredItems}
        customStyles={customStyles}
        pagination
        paginationPerPage={10}
        paginationRowsPerPageOptions={[5, 10, 20, 30]}
        highlightOnHover
        progressPending={loading}
        responsive
        fixedHeader
        persistTableHead
      />

      {/* Add/Edit Event Dialog */}
      <Dialog
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') handleClose();
        }}
        BackdropProps={{
          onClick: (event) => event.stopPropagation()
        }}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle className="dialogTitle">
          {currentEvent ? (currentEvent.viewOnly ? 'View Event' : 'Edit Event') : 'Add New Event'}
          <IconButton color="dark" onClick={handleClose} edge="end" size="big" aria-label="close">
            <CloseSquare />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={formik.handleSubmit}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <FormLabel>Event Name*</FormLabel>
                    <TextField
                      fullWidth
                      id="eventName"
                      name="eventName"
                      placeholder="e.g., Annual Conference, Webinar on AI"
                      value={formik.values.eventName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.eventName && Boolean(formik.errors.eventName)}
                      helperText={formik.touched.eventName && formik.errors.eventName}
                      disabled={currentEvent?.viewOnly}
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <FormLabel>Event Description*</FormLabel>
                    <TextField
                      fullWidth
                      id="eventDescription"
                      name="eventDescription"
                      placeholder="Describe the event details, agenda, and objectives..."
                      value={formik.values.eventDescription}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.eventDescription && Boolean(formik.errors.eventDescription)}
                      helperText={formik.touched.eventDescription && formik.errors.eventDescription}
                      multiline
                      rows={4}
                      disabled={currentEvent?.viewOnly}
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <FormLabel>Event Date*</FormLabel>
                    <DatePicker
                      value={formik.values.eventDate}
                      onChange={(date) => formik.setFieldValue('eventDate', date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: formik.touched.eventDate && Boolean(formik.errors.eventDate),
                          helperText: formik.touched.eventDate && formik.errors.eventDate,
                          disabled: currentEvent?.viewOnly
                        }
                      }}
                      disablePast
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <FormLabel>Participants Count*</FormLabel>
                    <TextField
                      fullWidth
                      id="eventParticipantsCount"
                      name="eventParticipantsCount"
                      placeholder="e.g., 100"
                      type="number"
                      value={formik.values.eventParticipantsCount}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.eventParticipantsCount && Boolean(formik.errors.eventParticipantsCount)}
                      helperText={formik.touched.eventParticipantsCount && formik.errors.eventParticipantsCount}
                      inputProps={{ min: 1, max: 1000 }}
                      disabled={currentEvent?.viewOnly}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </LocalizationProvider>

            {!currentEvent?.viewOnly && (
              <DialogActions sx={{ mt: 3 }}>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
                  {currentEvent ? 'Update' : 'Submit'}
                </Button>
              </DialogActions>
            )}

            {currentEvent?.viewOnly && (
              <DialogActions sx={{ mt: 3 }}>
                <Button onClick={handleClose} variant="contained">
                  Close
                </Button>
              </DialogActions>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </MainCard>
  );
};

export default EventsList;
