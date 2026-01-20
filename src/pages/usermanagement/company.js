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
  CircularProgress,
  Tooltip,
  Chip,
  MenuItem,
  FormControl,
  Select,
  Typography
} from '@mui/material';
import { UserAdd, Trash, UserEdit, CloseSquare, SearchNormal1 } from 'iconsax-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { PopupTransition } from 'components/@extended/Transitions';
import Swal from 'sweetalert2';
import MainCard from 'components/MainCard';

//css import
import 'assets/css/commonStyle.css';
import 'assets/css/DataTable.css';

// Impots
import { APP_PATH_BASE_URL } from 'config';
import { Capitalise } from 'utils/capitalise';
import axiosInstance from 'utils/axios';
import { Notes } from '@mui/icons-material';
import { usePermission } from 'hooks/usePermission';
import { formatDateTime } from 'utils/dateUtils';

const OrganizationTable = () => {
  const { checkPermission } = usePermission();

  const canCreate = checkPermission('Organizations', 'create');
  const canUpdate = checkPermission('Organizations', 'update');
  const canDelete = checkPermission('Organizations', 'delete');

  const [loading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [error, setError] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNotesField, setShowNotesField] = useState(false);
  const [notespopup, setNotesPopup] = useState(false);
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/employer`);

      const result = response.data;

      const data =
        result.data?.map((item, index) => ({
          sno: index + 1,
          ...item
        })) || [];

      setData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching company data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpen = () => {
    setCurrentCompany(null);
    setOpen(true);
    setShowNotesField(false);
  };

  const handleClose = () => {
    setOpen(false);
    formik.resetForm();
    setNotesPopup(false);
    setNotes('');
  };

  const handleEdit = useCallback((company) => {
    setCurrentCompany(company);
    setOpen(true);
    setShowNotesField(false);
  }, []);

  const handleNotes = async (data) => {
    setNotesPopup(true);
    setNotes(data.notes);
  };

  const handleDelete = useCallback(
    async (id) => {
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
          setIsLoading(true);
          const response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/employer/${id}/archive`, {
            user_type: 'admin'
          });

          if (response.data.success) {
            await Swal.fire({
              title: 'Success!',
              text: 'Company deleted successfully!',
              icon: 'success',
              confirmButtonText: 'OK'
            });
            fetchData();
          } else {
            throw new Error(response.data.message || 'Error deleting data');
          }
        } catch (error) {
          console.error('Delete error:', error);
          Swal.fire({
            title: 'Error!',
            text: error.response?.data?.message || 'Failed to delete company.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        } finally {
          setIsLoading(false);
        }
      }
    },
    [fetchData]
  );

  const filteredItems = useMemo(() => {
    return data.filter((item) => {
      // Text search filter
      const matchesText =
        filterText === '' ||
        (item.company_name && item.company_name.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.contact_person && item.contact_person.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.email && item.email.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.phone && item.phone.includes(filterText)) ||
        (item.address && item.address.toLowerCase().includes(filterText.toLowerCase()));

      // Status filter
      const matchesStatus =
        statusFilter === 'all' || (statusFilter === true && item.status === true) || (statusFilter === false && item.status === false);

      return matchesText && matchesStatus;
    });
  }, [data, filterText, statusFilter]);

  const columns = [
    {
      name: 'S.No',
      selector: (row) => row.sno,
      sortable: true,
      width: '100px'
    },
    {
      name: 'Organization Name',
      selector: (row) => Capitalise(row.company_name),
      sortable: true,
      width: '200px'
    },
    {
      name: 'Mobile',
      selector: (row) => row.phone,
      sortable: true,
      width: '150px'
    },
    {
      name: 'Email',
      selector: (row) => row.email,
      sortable: true,
      width: '200px'
    },
    {
      name: 'Contact Person',
      selector: (row) => row.contact_person,
      sortable: true,
      width: '150px'
    },
    {
      name: 'Address',
      selector: (row) => row.address,
      sortable: true,
      width: '200px'
    },
    {
      name: 'Status',
      selector: (row) => row.status,
      cell: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={row.status === true ? 'Active' : 'In active'}
            sx={{
              backgroundColor: row.status === true ? 'success.lighter' : 'error.lighter',
              color: row.status === true ? 'success.main' : 'error.main'
            }}
          />
        </Box>
      ),
      sortable: true,
      width: '150px'
    },
    {
      name: 'Actions',
      cell: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {canUpdate && (
            <Tooltip title="Edit">
              <IconButton color="info" variant="contained" onClick={() => handleEdit(row)}>
                <UserEdit />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Notes">
            <IconButton color="success" variant="contained" onClick={() => handleNotes(row)}>
              <Notes />
            </IconButton>
          </Tooltip>
          {canDelete && (
            <Tooltip title="Delete">
              <IconButton color="error" variant="contained" onClick={() => handleDelete(row.company_id)}>
                <Trash />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
      width: '200px'
    }
  ];

  const validationSchema = Yup.object().shape({
    company_name: Yup.string()
      .required('Organization name is required')
      .matches(/^[A-Za-z0-9\s]+$/, 'Name can only contain letters and spaces')
      .test('no-only-spaces', 'Name cannot be only spaces', (value) => {
        return value.trim().length > 0;
      }),

    email: Yup.string().required('Email is required').email('Email is invalid'),

    phone: Yup.string()
      .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
      .required('Phone number is required'),

    contact_person: Yup.string()
      .required('Contact Person is required')
      .matches(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces')
      .test('no-only-spaces', 'Contact Person cannot be only spaces', (value) => {
        return value.trim().length > 0;
      }),

    address: Yup.string()
      .required('Address is required')
      .test('no-only-spaces', 'Address cannot be only spaces', (value) => {
        return value.trim().length > 0;
      }),

    notes: Yup.string().when(['status'], {
      is: (status) => {
        // Check if status has changed from initial value
        const initialStatus = currentCompany?.status ?? true;
        return status !== initialStatus;
      },
      then: () =>
        Yup.string()
          .required('Notes are required')
          .test('no-only-spaces', 'Notes cannot be only spaces', (value) => {
            return value && value.trim().length > 0;
          }),
      otherwise: () => Yup.string().notRequired()
    })
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      company_name: currentCompany?.company_name || '',
      email: currentCompany?.email || '',
      phone: currentCompany?.phone || '',
      contact_person: currentCompany?.contact_person || '',
      address: currentCompany?.address || '',
      status: currentCompany?.status ?? true,
      notes: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      // Prevent multiple submissions
      if (isSubmitting) return;

      setIsSubmitting(true);
      const formData = new FormData();

      // Append basic fields
      formData.append('company_name', values.company_name);
      formData.append('email', values.email);
      formData.append('phone', values.phone);
      formData.append('contact_person', values.contact_person);
      formData.append('address', values.address);
      formData.append('status', values.status);

      formData.append('notes', values.notes);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      try {
        let response;

        if (currentCompany) {
          response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/employer/${currentCompany.company_id}`, formData, config);
        } else {
          response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/employer`, formData, config);
        }

        if (response.data.success === true) {
          Swal.fire({
            title: 'Success!',
            text: currentCompany ? 'Company updated successfully!' : 'Company added successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          resetForm();
          setShowNotesField(false);
          handleClose();
          fetchData();
        } else {
          Swal.fire({
            title: 'Error!',
            text: response?.data?.message || 'Error submitting company data. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Error submitting company data. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        setSubmitting(false);
        setIsSubmitting(false);
      }
    }
  });

  // Add this useEffect to track status changes
  useEffect(() => {
    if (currentCompany) {
      // For edit mode: show notes field only when status changes from initial value
      const initialStatus = currentCompany.status ?? true;
      if (formik.values.status !== initialStatus) {
        setShowNotesField(true);
      } else {
        setShowNotesField(false);
      }
    } else {
      // For add mode: always hide notes field initially
      setShowNotesField(false);
    }
  }, [formik.values.status, currentCompany]);

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
      <Grid container justifyContent="space-between" alignItems="center" my={3} spacing={2}>
        <Grid item xs={12}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} width="100%">
            {/* Filters Container - Wraps to next row */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 2,
                width: { xs: '100%', sm: 'auto' },
                '& > *': {
                  minWidth: { xs: 'calc(50% - 8px)', sm: 200 },
                  flexGrow: 1
                }
              }}
            >
              <TextField
                placeholder="Search..."
                variant="outlined"
                size="small"
                sx={{
                  minWidth: { xs: '100%', sm: 250 },
                  flexGrow: 1
                }}
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
              <FormControl
                size="small"
                sx={{
                  minWidth: { xs: '100%', sm: 180 },
                  flex: { xs: '1 1 100%', sm: '0 1 auto' },
                  maxWidth: { sm: 250 }
                }}
              >
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
                  <MenuItem value={true}>Active</MenuItem>
                  <MenuItem value={false}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack spacing={2} direction="row" justifyContent="flex-end">
            {canCreate && (
              <Button color="success" variant="contained" startIcon={<UserAdd />} onClick={handleOpen}>
                Add Organization
              </Button>
            )}
          </Stack>
        </Grid>
      </Grid>
    );
  }, [filterText, resetPaginationToggle, statusFilter, canCreate]);

  if (error) {
    return (
      <MainCard sx={{ borderRadius: 2 }}>
        <Box p={3} color="error.main">
          Error: {error}
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard sx={{ borderRadius: 2 }}>
      {subHeaderComponentMemo}

      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 300 }}>
          <CircularProgress />
        </Stack>
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[5, 10, 20, 30]}
          highlightOnHover
          responsive
        />
      )}

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
          {currentCompany ? 'Edit Organization' : 'Add New Organization'}
          <IconButton color="dark" onClick={handleClose} edge="end" size="big" aria-label="close" title="close">
            <CloseSquare height={30} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              {/*Company Name*/}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Organization Name*</FormLabel>
                  <TextField
                    fullWidth
                    id="company_name"
                    placeholder="Organization Name"
                    name="company_name"
                    value={formik.values.company_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.company_name && Boolean(formik.errors.company_name)}
                    helperText={formik.touched.company_name && formik.errors.company_name}
                  />
                </Stack>
              </Grid>

              {/*Email Address*/}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Email Address*</FormLabel>
                  <TextField
                    fullWidth
                    id="email"
                    placeholder="Email Address"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                </Stack>
              </Grid>

              {/*Mobile*/}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Mobile*</FormLabel>
                  <TextField
                    fullWidth
                    id="phone"
                    placeholder="Mobile"
                    name="phone"
                    type="number"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                    helperText={formik.touched.phone && formik.errors.phone}
                  />
                </Stack>
              </Grid>

              {/*Contact Person*/}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Contact Person*</FormLabel>
                  <TextField
                    fullWidth
                    id="contact_person"
                    placeholder="Contact Person"
                    name="contact_person"
                    type="text"
                    value={formik.values.contact_person}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.contact_person && Boolean(formik.errors.contact_person)}
                    helperText={formik.touched.contact_person && formik.errors.contact_person}
                  />
                </Stack>
              </Grid>

              {/*Address*/}
              <Grid item xs={12}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Address*</FormLabel>
                  <TextField
                    fullWidth
                    id="address"
                    placeholder="Address"
                    name="address"
                    type="text"
                    multiline
                    rows={3}
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.address && Boolean(formik.errors.address)}
                    helperText={formik.touched.address && formik.errors.address}
                  />
                </Stack>
              </Grid>

              {/*Status*/}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Status*</FormLabel>
                  <TextField
                    select
                    fullWidth
                    id="status"
                    name="status"
                    value={formik.values.status} // This should be boolean
                    onChange={formik.handleChange} // Use formik's handleChange directly
                    onBlur={formik.handleBlur}
                    error={formik.touched.status && Boolean(formik.errors.status)}
                    helperText={formik.touched.status && formik.errors.status}
                  >
                    <MenuItem value={true}>Active</MenuItem>
                    <MenuItem value={false}>Inactive</MenuItem>
                  </TextField>
                </Stack>
              </Grid>
              {/* Notes - Show only when status is changed */}
              {showNotesField && (
                <Grid item xs={12}>
                  <Stack sx={{ mt: 2, gap: 1 }}>
                    <FormLabel>Notes*</FormLabel>
                    <TextField
                      fullWidth
                      id="notes"
                      placeholder="Notes"
                      name="notes"
                      multiline
                      rows={4}
                      value={formik.values.notes}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.notes && Boolean(formik.errors.notes)}
                      helperText={formik.touched.notes && formik.errors.notes}
                    />
                  </Stack>
                </Grid>
              )}
            </Grid>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={formik.isSubmitting} // Disable when submitting
              >
                {formik.isSubmitting ? 'Processing...' : currentCompany ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
      {/* Notes Dialog */}
      <Dialog
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        open={notespopup}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') handleClose();
        }}
        BackdropProps={{
          onClick: (event) => event.stopPropagation()
        }}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle className="dialogTitle" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          Notes
          <IconButton color="dark" onClick={handleClose} edge="end" size="big" aria-label="close" title="close">
            <CloseSquare height={30} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ borderBottom: 1, borderColor: 'divider', py: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack spacing={3} sx={{ mt: 1 }}>
                {notes && notes.length > 0 ? (
                  notes.map((note) => (
                    <Box
                      key={note.id}
                      sx={{
                        p: 3,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      <Grid container spacing={3} alignItems="flex-start">
                        {/* Created By with enhanced styling */}
                        <Grid item xs={12} sm={3}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">
                              CREATED BY
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  backgroundColor: note.status === false ? 'success.main' : 'error.main'
                                }}
                              />
                              <Typography variant="body1" fontWeight="medium" fontSize="1.1rem">
                                {note.created_by || '-'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Reason with enhanced text wrapping */}
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">
                              REASON
                            </Typography>
                            <Box
                              sx={{
                                p: 1.5,
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1,
                                backgroundColor: 'grey.50',
                                minHeight: '60px',
                                display: 'flex',
                                alignItems: 'flex-start'
                              }}
                            >
                              <Typography
                                variant="body1"
                                sx={{
                                  lineHeight: 1.5,
                                  wordWrap: 'break-word',
                                  overflowWrap: 'break-word',
                                  whiteSpace: 'normal',
                                  wordBreak: 'break-word',
                                  width: '100%'
                                }}
                              >
                                {note.reason || '-'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Date with improved formatting */}
                        <Grid item xs={12} sm={3}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">
                              DATE
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                backgroundColor: 'action.hover',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                display: 'inline-block',
                                width: 'fit-content'
                              }}
                            >
                              {formatDateTime(note.created_at, { includeTime: false }) || '-'}
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Status with badge styling */}
                        <Grid item xs={12} sm={2}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">
                              STATUS
                            </Typography>
                            <Box
                              sx={{
                                borderRadius: 2,
                                width: 'fit-content'
                              }}
                            >
                              <Chip
                                label={note.status === false ? 'Active' : 'Inactive'}
                                sx={{
                                  color: note.status === false ? 'success.dark' : 'error.dark',
                                  fontWeight: 600
                                }}
                              />
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  ))
                ) : (
                  <Box
                    sx={{
                      p: 6,
                      textAlign: 'center',
                      border: 2,
                      borderColor: 'divider',
                      borderStyle: 'dashed',
                      borderRadius: 3,
                      backgroundColor: 'action.hover',
                      my: 2
                    }}
                  >
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Notes Available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      There are no notes to display at the moment.
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default OrganizationTable;
