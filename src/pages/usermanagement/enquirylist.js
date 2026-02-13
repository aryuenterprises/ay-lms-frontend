import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Menu,
  MenuItem,
  Stack,
  CircularProgress,
  FormControl,
  Select,
  InputAdornment,
  FormHelperText,
  FormLabel
} from '@mui/material';
import {
  Visibility,
  Phone,
  CalendarToday,
  MoreVert,
  Person,
  Email,
  School,
  Notes,
  Call,
  AddComment,
  Source,
  BookOnline
} from '@mui/icons-material';
import DataTable from 'react-data-table-component';
import 'assets/css/DataTable.css';
import MainCard from 'components/MainCard';
import axiosInstance from 'utils/axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { APP_PATH_BASE_URL } from 'config';
import { CloseSquare, SearchNormal1, UserAdd } from 'iconsax-react';
import Swal from 'sweetalert2';
import { formatDateTime } from 'utils/dateUtils';
import { Capitalise } from 'utils/capitalise';
import 'assets/css/DataTable.css';
import PropTypes from 'prop-types';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import useDate from '../../config';

// Validation schemas
const enquiryValidationSchema = Yup.object({
  name: Yup.string().required('Student name is required'),
  phone: Yup.string().required('Phone number is required'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  enquiryDate: Yup.date().required('Enquiry date is required'),
  course: Yup.string().required('Course is required'),
  status: Yup.string().required('Status is required'),
  source: Yup.string().required('Source is required')
});

const followUpValidationSchema = Yup.object({
  notes: Yup.string().required('Notes are required')
});

const EnquiryList = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [enquiryDialogOpen, setEnquiryDialogOpen] = useState(false);
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [canCreate] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/leads`);
      const motifyData = response.data.leads.map((item, index) => {
        return {
          ...item,
          sno: index + 1
        };
      });
      setEnquiries(motifyData);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Enquiry Formik
  const enquiryFormik = useFormik({
    initialValues: {
      name: '',
      phone: '',
      email: '',
      course: '',
      enquiryDate: '',
      status: '',
      source: ''
    },
    validationSchema: enquiryValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (selectedEnquiry && selectedEnquiry.id) {
          // Edit existing enquiry
          await axiosInstance.patch(`${APP_PATH_BASE_URL}api/leads/${selectedEnquiry.id}`, values);
        } else {
          // Add new enquiry
          const res = await axiosInstance.post(`${APP_PATH_BASE_URL}api/leads`, values);
          // console.log('enquery form submit :', res);
          if (res.data.success === false) {
            await Swal.fire('Error', res.data.message, 'error');
            return;
          } else {
            await Swal.fire('Success', res.data.message, 'success');
          }
        }

        resetForm();
        setEnquiryDialogOpen(false);
        setSelectedEnquiry(null);
        fetchData(); // Refresh data
      } catch (error) {
        console.error('Error saving enquiry:', error);
      }
    }
  });

  // Follow Up Formik
  const followUpFormik = useFormik({
    initialValues: {
      notes: ''
    },
    validationSchema: followUpValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (selectedEnquiry && selectedEnquiry.id) {
          const res = await axiosInstance.post(
            `${APP_PATH_BASE_URL}api/leads/${selectedEnquiry.id}/call/${selectedFollowUp}/notes`,
            values
          );
          console.log('follow up res :', res);
          if (res.data.success === false) {
            await Swal.fire('Error', res.data.message, 'error');
          } else {
            await Swal.fire('Success', res.data.message, 'success');
          }
          resetForm();
          setFollowUpDialogOpen(false);
          fetchData();
        }
      } catch (error) {
        console.error('Error adding follow up:', error);
      }
    }
  });

  const handleViewDetails = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setDetailDialogOpen(true);
  };

  const handleFollowUp = (id) => {
    setSelectedFollowUp(id);
    setFollowUpDialogOpen(true);
  };

  const handleFollowUpCall = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setCallDialogOpen(true);
  };

  const handleCallNow = async () => {
    try {
      const res = await axiosInstance.post(`${APP_PATH_BASE_URL}api/leads/${selectedEnquiry.id}/call`);
      if (res.data.success === false) {
        await Swal.fire('Error', res.data.message, 'error');
      } else {
        await Swal.fire('Success', res.data.message, 'success');
      }
      fetchData();
      setCallDialogOpen(false);
    } catch (error) {
      console.error('Error adding follow up:', error);
    }
  };

  const handleAddEnquiry = useCallback(() => {
    setSelectedEnquiry(null);
    enquiryFormik.resetForm();
    setEnquiryDialogOpen(true);
  }, [enquiryFormik]);

  const handleEditEnquiry = (enquiry) => {
    setSelectedEnquiry(enquiry);
    enquiryFormik.setValues({
      name: enquiry.name || '',
      phone: enquiry.phone || '',
      email: enquiry.email || '',
      course: enquiry.course || '',
      enquiryDate: enquiry.enquiryDate || '',
      status: enquiry.status || 'New',
      source: enquiry.source || '',
      notes: enquiry.notes || ''
    });
    setEnquiryDialogOpen(true);
  };

  const handleDeleteEnquiry = async () => {
    if (selectedMenuId) {
      try {
        await axiosInstance.delete(`${APP_PATH_BASE_URL}api/leads/${selectedMenuId}`);
        handleMenuClose();
        fetchData(); // Refresh data
      } catch (error) {
        console.error('Error deleting enquiry:', error);
      }
    }
  };

  const handleMenuOpen = (event, enquiryId) => {
    setAnchorEl(event.currentTarget);
    setSelectedMenuId(enquiryId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMenuId(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'primary';
      case 'Follow Up':
        return 'warning';
      case 'Converted':
        return 'success';
      default:
        return 'default';
    }
  };

  // DataTable columns configuration
  const columns = [
    {
      name: 'S.No',
      selector: (row, index) => index + 1,
      sortable: true,
      width: '80px'
    },
    {
      name: 'Student Name',
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => <Box sx={{ display: 'flex', alignItems: 'center' }}>{row.name}</Box>,
      width: '200px'
    },
    {
      name: 'Contact',
      selector: (row) => `${row.phone} | ${row.email}`,
      sortable: true,
      cell: (row) => (
        <Box>
          <Typography variant="body2">{row.phone}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.email}
          </Typography>
        </Box>
      ),
      width: '220px'
    },
    {
      name: 'Course',
      selector: (row) => row.course,
      sortable: true,
      width: '180px'
    },
    {
      name: 'Enquiry Date',
      selector: (row) => formatDateTime(row.created_at),
      sortable: true,
      width: '150px'
    },
    {
      name: 'Status',
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => <Chip label={row.status} color={getStatusColor(row.status)} size="small" />,
      width: '120px'
    },
    {
      name: 'Last Follow Up',
      selector: (row) => (row.followup_date ? formatDateTime(row.followup_date, { includeTime: false }) : '-'),
      sortable: true,
      width: '140px'
    },
    {
      name: 'Source',
      selector: (row) => row.source,
      sortable: true,
      width: '120px'
    },
    {
      name: 'Actions',
      cell: (row) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton color="primary" onClick={() => handleViewDetails(row)} size="small">
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title="Follow Up">
            <IconButton color="secondary" onClick={() => handleFollowUpCall(row)} size="small">
              <Phone />
            </IconButton>
          </Tooltip>
          <IconButton onClick={(e) => handleMenuOpen(e, row.id)} size="small">
            <MoreVert />
          </IconButton>
        </Box>
      ),
      width: '150px',
      ignoreRowClick: true
    }
  ];

  const subHeaderComponentMemo = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText('');
      }
    };

    const handleStatusClear = () => {
      setStatusFilter('all');
    };

    return (
      <Grid container justifyContent="space-between" alignItems="center" my={3}>
        <Grid item xs={12} md={8} display="flex" flexDirection={{ xs: 'column', sm: 'row' }}>
          <Stack direction="row" spacing={2}>
            <TextField
              placeholder="Search..."
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
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                endAdornment={
                  statusFilter !== 'all' && (
                    <InputAdornment position="end" sx={{ mr: 3 }}>
                      <IconButton onClick={handleStatusClear} edge="end" size="small">
                        <CloseSquare size={16} />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              >
                <MenuItem value="all">Select Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">In active</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Grid>
        <Grid item xs={12} md={4} textAlign="right">
          {canCreate && (
            <Button color="success" variant="contained" startIcon={<UserAdd />} onClick={handleAddEnquiry}>
              Add Enquiry
            </Button>
          )}
        </Grid>
      </Grid>
    );
  }, [filterText, resetPaginationToggle, statusFilter, canCreate, handleAddEnquiry]);

  const InfoRow = ({ label, value, icon }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 2.5,
        p: 1.5,
        borderRadius: 1,
        backgroundColor: 'grey.50',
        '&:hover': {
          backgroundColor: 'grey.100'
        }
      }}
    >
      {icon && <Box sx={{ mr: 2, color: 'text.secondary' }}>{icon}</Box>}
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );

  InfoRow.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    icon: PropTypes.node
  };

  // FollowUpCard Component for individual follow-up items
  const FollowUpCard = ({ followUp, onAddComment }) => (
    <Box
      sx={{
        p: 2.5,
        backgroundColor: 'grey.50',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'grey.200',
        position: 'relative',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Chip label={followUp.type || 'Call'} size="small" color="primary" variant="outlined" />
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          {formatDateTime(followUp.call_time)}
        </Typography>
      </Box>

      <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.6 }}>
        {followUp.notes}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          By: <strong>{followUp.called_by_name}</strong>
        </Typography>

        <IconButton
          size="small"
          onClick={onAddComment}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark'
            }
          }}
        >
          <AddComment size={16} />
        </IconButton>
      </Box>
    </Box>
  );

  FollowUpCard.propTypes = {
    followUp: PropTypes.object,
    onAddComment: PropTypes.func
  };

  return (
    <MainCard>
      {subHeaderComponentMemo}

      {/* Enquiry List DataTable */}
      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 300 }}>
          <CircularProgress />
        </Stack>
      ) : (
        <DataTable
          columns={columns}
          data={enquiries}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[5, 10, 20, 30]}
          highlightOnHover
          responsive
        />
      )}

      {/* Add/Edit Enquiry Dialog */}
      <Dialog open={enquiryDialogOpen} onClose={() => setEnquiryDialogOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={enquiryFormik.handleSubmit}>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                {selectedEnquiry ? 'Edit Enquiry' : 'Add New Enquiry'}
              </Typography>
              <IconButton onClick={() => setEnquiryDialogOpen(false)}>
                <CloseSquare />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel>Enquiry Type</FormLabel>
                  <TextField
                    fullWidth
                    placeholder="Student Name"
                    name="name"
                    value={enquiryFormik.values.name}
                    onChange={enquiryFormik.handleChange}
                    onBlur={enquiryFormik.handleBlur}
                    error={enquiryFormik.touched.name && Boolean(enquiryFormik.errors.name)}
                    helperText={enquiryFormik.touched.name && enquiryFormik.errors.name}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel>Phone</FormLabel>
                  <TextField
                    fullWidth
                    placeholder="Phone"
                    name="phone"
                    value={enquiryFormik.values.phone}
                    onChange={enquiryFormik.handleChange}
                    onBlur={enquiryFormik.handleBlur}
                    error={enquiryFormik.touched.phone && Boolean(enquiryFormik.errors.phone)}
                    helperText={enquiryFormik.touched.phone && enquiryFormik.errors.phone}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel>Email</FormLabel>
                  <TextField
                    fullWidth
                    placeholder="Email"
                    name="email"
                    type="email"
                    value={enquiryFormik.values.email}
                    onChange={enquiryFormik.handleChange}
                    onBlur={enquiryFormik.handleBlur}
                    error={enquiryFormik.touched.email && Boolean(enquiryFormik.errors.email)}
                    helperText={enquiryFormik.touched.email && enquiryFormik.errors.email}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel>Course</FormLabel>
                  <TextField
                    fullWidth
                    placeholder="Course"
                    name="course"
                    value={enquiryFormik.values.course}
                    onChange={enquiryFormik.handleChange}
                    onBlur={enquiryFormik.handleBlur}
                    error={enquiryFormik.touched.course && Boolean(enquiryFormik.errors.course)}
                    helperText={enquiryFormik.touched.course && enquiryFormik.errors.course}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel>Enquiry Date</FormLabel>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      format={useDate.dateFormat}
                      minDate={new Date()}
                      value={enquiryFormik.values.enquiryDate ? new Date(enquiryFormik.values.enquiryDate) : null}
                      onChange={(newValue) => {
                        enquiryFormik.setFieldValue('enquiryDate', newValue);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          name: 'enquiryDate',
                          error: enquiryFormik.touched.enquiryDate && Boolean(enquiryFormik.errors.enquiryDate),
                          helperText: enquiryFormik.touched.enquiryDate && enquiryFormik.errors.enquiryDate,
                          onBlur: enquiryFormik.handleBlur
                        }
                      }}
                    />
                  </LocalizationProvider>
                  <FormHelperText>{enquiryFormik.touched.enquiryDate && enquiryFormik.errors.enquiryDate}</FormHelperText>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel>Status</FormLabel>
                  <FormControl fullWidth error={enquiryFormik.touched.status && Boolean(enquiryFormik.errors.status)}>
                    <Select
                      name="status"
                      value={enquiryFormik.values.status}
                      onChange={enquiryFormik.handleChange}
                      onBlur={enquiryFormik.handleBlur}
                      displayEmpty
                    >
                      <MenuItem value="">Select Status</MenuItem>
                      <MenuItem value="New">New</MenuItem>
                      <MenuItem value="Follow Up">Follow Up</MenuItem>
                      <MenuItem value="Converted">Converted</MenuItem>
                    </Select>
                    <FormHelperText>{enquiryFormik.touched.status && enquiryFormik.errors.status}</FormHelperText>
                  </FormControl>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel>Source</FormLabel>
                  <TextField
                    fullWidth
                    placeholder="Source"
                    name="source"
                    value={enquiryFormik.values.source}
                    onChange={enquiryFormik.handleChange}
                    onBlur={enquiryFormik.handleBlur}
                    error={enquiryFormik.touched.source && Boolean(enquiryFormik.errors.source)}
                    helperText={enquiryFormik.touched.source && enquiryFormik.errors.source}
                  />
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEnquiryDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedEnquiry ? 'Update' : 'Add'} Enquiry
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Enquiry Details Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: 'primary.secondary',
            color: 'black',
            py: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              Student Enquiry Details
            </Typography>
            <IconButton onClick={() => setDetailDialogOpen(false)}>
              <CloseSquare />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {selectedEnquiry && (
            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid item xs={12} md={6}>
                <Card
                  variant="outlined"
                  sx={{
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderRadius: 2
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box
                        sx={{
                          backgroundColor: 'secondary.light',
                          borderRadius: '50%',
                          p: 1,
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Person sx={{ color: 'secondary.main', fontSize: 20 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Personal Information
                      </Typography>
                    </Box>

                    <InfoRow label="Full Name" value={Capitalise(selectedEnquiry.name)} icon={<Person fontSize="small" />} />
                    <InfoRow label="Phone" value={selectedEnquiry.phone} icon={<Phone fontSize="small" />} />
                    <InfoRow label="Email" value={selectedEnquiry.email} icon={<Email fontSize="small" />} />
                  </CardContent>
                </Card>
              </Grid>

              {/* Academic Information */}
              <Grid item xs={12} md={6}>
                <Card
                  variant="outlined"
                  sx={{
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderRadius: 2
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box
                        sx={{
                          backgroundColor: 'secondary.light',
                          borderRadius: '50%',
                          p: 1,
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <School sx={{ color: 'secondary.main', fontSize: 20 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Academic Information
                      </Typography>
                    </Box>

                    <InfoRow label="Course Interested" value={Capitalise(selectedEnquiry.course)} icon={<BookOnline fontSize="small" />} />
                    <InfoRow
                      label="Enquiry Date"
                      value={formatDateTime(selectedEnquiry.created_at)}
                      icon={<CalendarToday fontSize="small" />}
                    />
                    <InfoRow label="Source" value={selectedEnquiry.source} icon={<Source fontSize="small" />} />
                  </CardContent>
                </Card>
              </Grid>

              {/* Follow-up History */}
              <Grid item xs={12}>
                <Card
                  variant="outlined"
                  sx={{
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderRadius: 2
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box
                        sx={{
                          backgroundColor: 'secondary.light',
                          borderRadius: '50%',
                          p: 1,
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Notes sx={{ color: 'secondary.main', fontSize: 20 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Follow-up History
                      </Typography>
                    </Box>

                    {selectedEnquiry.call_logs.length > 0 ? (
                      <Stack spacing={2}>
                        {selectedEnquiry.call_logs.map((followUp, index) => (
                          <FollowUpCard key={index} followUp={followUp} onAddComment={() => handleFollowUp(followUp.id)} />
                        ))}
                      </Stack>
                    ) : (
                      <Box
                        sx={{
                          textAlign: 'center',
                          py: 4,
                          color: 'text.secondary'
                        }}
                      >
                        <Notes sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                        <Typography variant="body1">No follow-up history yet</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => {
              setDetailDialogOpen(false);
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setDetailDialogOpen(false);
              handleFollowUpCall(selectedEnquiry);
            }}
          >
            Add Follow Up
          </Button>
        </DialogActions>
      </Dialog>

      {/* Follow Up Dialog */}
      <Dialog open={followUpDialogOpen} onClose={() => setFollowUpDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={followUpFormik.handleSubmit}>
          <DialogTitle
            sx={{
              backgroundColor: 'primary.secondary',
              color: 'black',
              py: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                Add Follow Up - {selectedEnquiry?.name}
              </Typography>
              <IconButton onClick={() => setFollowUpDialogOpen(false)}>
                <CloseSquare />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  name="notes"
                  multiline
                  rows={4}
                  value={followUpFormik.values.notes}
                  onChange={followUpFormik.handleChange}
                  onBlur={followUpFormik.handleBlur}
                  fullWidth
                  placeholder="Enter follow-up details..."
                  error={followUpFormik.touched.notes && Boolean(followUpFormik.errors.notes)}
                  helperText={followUpFormik.touched.notes && followUpFormik.errors.notes}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button
              onClick={() => {
                setFollowUpDialogOpen(false), followUpFormik.resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Save Follow Up
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* New Call Dialog */}
      <Dialog open={callDialogOpen} onClose={() => setCallDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
            <Call sx={{ mr: 1 }} /> Make a Call
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedEnquiry && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Call sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Call {Capitalise(selectedEnquiry.name)}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Phone Number:
              </Typography>
              <Typography variant="h5" color="primary" gutterBottom>
                {selectedEnquiry.phone}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Click Call Now to initiate the phone call
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={() => setCallDialogOpen(false)} variant="outlined" sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleCallNow} variant="contained" color="primary" startIcon={<Call />} size="large">
            Call Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            handleEditEnquiry(enquiries.find((e) => e.id === selectedMenuId));
            handleMenuClose();
          }}
        >
          Edit Enquiry
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>Change Status</MenuItem>
        <MenuItem onClick={handleMenuClose}>Send Email</MenuItem>
        <MenuItem onClick={handleDeleteEnquiry} sx={{ color: 'error.main' }}>
          Delete Enquiry
        </MenuItem>
      </Menu>
    </MainCard>
  );
};

export default EnquiryList;
