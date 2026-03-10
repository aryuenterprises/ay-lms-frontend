// PaymentReportsPage.jsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  FormLabel,
  Box,
  Button,
  Autocomplete,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Payment, Receipt, Close, Visibility, ArrowBack, Email, Phone, LocationOn, CalendarToday } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import MainCard from 'components/MainCard';
import { APP_PATH_BASE_URL } from 'config';
import axiosInstance from 'utils/axios';
import { Capitalise } from 'utils/capitalise';
import DataTable from 'react-data-table-component';
import { formatDateTime } from 'utils/dateUtils';
import Swal from 'sweetalert2';

// Human-readable labels for gateway string values
const GATEWAY_LABELS = {
  stripe_enabled:   'Stripe',
  paypal_enabled:   'PayPal',
  razorpay_enabled: 'Razorpay',
};

// ─── Helper: parse deeply nested/stringified Django error messages ────────────
// Backend returns messages like:
// "[ErrorDetail(string='[ErrorDetail(string=\'paypal gateway not configured\', code=\'invalid\')]', code='invalid')]"
// This extracts the human-readable string inside
const parseBackendError = (message) => {
  if (!message) return 'Something went wrong. Please try again.';

  // Already a clean string
  if (typeof message !== 'string') return String(message);

  // Try to extract the innermost string='...' value
  const matches = [...message.matchAll(/string='([^']+)'/g)];
  if (matches.length > 0) {
    // Return the last (innermost) match — most specific error
    return matches[matches.length - 1][1];
  }

  // Try double-quote variant: string="..."
  const matchesDouble = [...message.matchAll(/string="([^"]+)"/g)];
  if (matchesDouble.length > 0) {
    return matchesDouble[matchesDouble.length - 1][1];
  }

  // Fallback: return the raw message
  return message;
};

function PaymentReportsPage() {
  const [studentsMap, setStudents]                         = useState([]);
  const [selectedStudent, setSelectedStudent]               = useState('');
  const [allStudentsData, setAllStudentsData]               = useState({ students: [], paymentDetails: [] });
  const [filteredStudentsData, setFilteredStudentsData]     = useState([]);
  const [data, setData]                                     = useState([]);
  const [paymentDialogOpen, setPaymentDialogOpen]           = useState(false);
  const [selectedPayment, setSelectedPayment]               = useState(null);
  const [paymentAmount, setPaymentAmount]                   = useState('');
  const [loading, setLoading]                               = useState(false);
  const [showDetails, setShowDetails]                       = useState(false);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);
  const [paymentAddUserOpen, setPaymentAddUserOpen]         = useState(false);
  const [gateway, setGateway]                               = useState([]);

  const validationSchema = yup.object({
    student:        yup.string().required('Student is required'),
    gateway:        yup.string().required('Gateway is required'), // ✅ string not number
    amount:         yup.number().required('Amount is required').positive('Amount must be positive').min(1, 'Amount must be at least 1'),
    currency:       yup.string().required('Currency is required'),
    payment_status: yup.string().required('Payment status is required'),
    transaction_id: yup.string(),
    order_id:       yup.string(),
    description:    yup.string(),
    metadata: yup.object({
      mode: yup.string().required('Payment mode is required'),
    }),
  });

  const formik = useFormik({
    initialValues: {
      student:        '',
      gateway:        '',
      amount:         '',
      currency:       'INR',
      payment_status: 'Success',
      transaction_id: '',
      order_id:       '',
      description:    '',
    
      metadata: { mode: 'OFFLINE' },
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      await handleAddUserSubmit(values, resetForm);
    },
  });

  // ─── Fetch students + gateway list ───────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/jarugandi`);
      const studentList = response.data.students_list || [];
      setStudents(studentList);

      // ✅ Safely set gateway — guard against missing/non-array value
      const paymentMethod = response.data?.setting?.[0]?.payment_method;
      setGateway(Array.isArray(paymentMethod) ? paymentMethod : []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
      setGateway([]);
    }
  }, []);

  // ─── Fetch payment transactions ───────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/payment_transaction`);
      if (response.data.success) {
        setAllStudentsData({
          students:       response.data.students || [],
          paymentDetails: response.data.student_payment_summaries || [],
        });
      } else {
        setAllStudentsData({ students: [], paymentDetails: [] });
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
      setAllStudentsData({ students: [], paymentDetails: [] });
    }
  }, []);

  // ─── Filter + sort by latest transaction date ─────────────────────────────────
  useEffect(() => {
    const getLatestDate = (student) => {
      if (!student.transactions || student.transactions.length === 0) return 0;
      return new Date(student.transactions[0].created_at);
    };

    let rows = allStudentsData?.paymentDetails || [];
    if (selectedStudent) {
      rows = rows.filter((s) => s.student_id === selectedStudent);
    }
    const sorted = [...rows].sort((a, b) => getLatestDate(b) - getLatestDate(a));
    setFilteredStudentsData(sorted);
  }, [selectedStudent, allStudentsData]);

  useEffect(() => {
    fetchStudents();
    fetchData();
  }, [fetchStudents, fetchData]);

  const paymentDetails = data.transactions;

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  const getPaymentStatus = (student) => {
    const totalPaid   = student.total_paid   || 0;
    const totalAmount = student.total_amount || 0;
    const remaining   = totalAmount - totalPaid;
    if (remaining <= 0) return { status: 'fully_paid', text: 'Fully Paid', color: 'success' };
    return { status: 'pending', text: `Pending: ₹${remaining?.toLocaleString('en-IN')}`, color: 'warning', remaining };
  };

  const formatCurrency = (amount) => `₹${amount?.toLocaleString('en-IN') || '0'}`;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // ─── Quick Pay submit ─────────────────────────────────────────────────────────
  const handlePaymentSubmit = async () => {
    if (!paymentAmount || isNaN(paymentAmount) || parseFloat(paymentAmount) <= 0) {
      Swal.fire('Error!', 'Please enter a valid payment amount', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/payment_transaction`, {
        student:        selectedPayment.student_id,
        amount:         parseFloat(paymentAmount),
        currency:       'INR',
        payment_status: 'Success',
      });
      if (response.data.success) {
        await fetchData();
        setPaymentDialogOpen(false);
        setPaymentAmount('');
        setSelectedPayment(null);
        Swal.fire('Success!', 'Payment processed successfully!', 'success');
      } else {
        // ✅ Parse the nested Django error message
        const errorMsg = parseBackendError(response.data.message);
        Swal.fire('Payment Failed', errorMsg, 'error');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      // ✅ Also handle axios error response
      const errorMsg = parseBackendError(error?.response?.data?.message || error.message);
      Swal.fire('Error!', errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ─── Add Payment submit ───────────────────────────────────────────────────────
  const handleAddUserSubmit = async (values, resetForm) => {
    setLoading(true);
    try {
      const payload = {
        student:        parseInt(values.student),
        gateway:        values.gateway,        // string e.g. "stripe_enabled"
        amount:         parseFloat(values.amount),
        currency:       values.currency,
        payment_status: values.payment_status,
        transaction_id: values.transaction_id,
        order_id:       values.order_id,
        description:    values.description,
     
        metadata:       values.metadata,
      };

      const response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/payment_transaction`, payload);

      if (response.data.success) {
        await fetchData();
        setPaymentAddUserOpen(false);
        resetForm();
        Swal.fire('Success!', 'Payment added successfully!', 'success');
      } else {
        // ✅ Parse the nested Django error — e.g. "paypal gateway not configured"
        const errorMsg = parseBackendError(response.data.message);
        Swal.fire({
          title:             'Payment Failed',
          text:              errorMsg,
          icon:              'error',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      // ✅ Handle HTTP error responses too (4xx/5xx)
      const errorMsg = parseBackendError(
        error?.response?.data?.message || error?.response?.data?.detail || error.message
      );
      Swal.fire('Error!', errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ─── Dialog / navigation handlers ────────────────────────────────────────────
  const handleOpenPaymentDialog = (student) => { setSelectedPayment(student); setPaymentAmount(''); setPaymentDialogOpen(true); };
  const handleOpenAddUserModal  = () => setPaymentAddUserOpen(true);
  const handleCloseAddUserModal = () => { setPaymentAddUserOpen(false); formik.resetForm(); };
  const handleViewDetails       = (student) => { setSelectedStudent(student.student_id); setSelectedStudentDetails(student); setData(student); setShowDetails(true); };
  const handleBackToList        = () => { setShowDetails(false); setSelectedStudentDetails(null); };

  // ─── Table columns ────────────────────────────────────────────────────────────
  const columns = [
    { name: 'S.No',             selector: (row, index) => index + 1,                    sortable: true, width: '80px' },
    { name: 'Student Name',     selector: (row) => Capitalise(row.student_name),         sortable: true, wrap: true },
    { name: 'Course',           selector: (row) => row.course_name || 'N/A',            sortable: true, wrap: true },
    { name: 'Total Amount',     selector: (row) => formatCurrency(row.total_course_fee), sortable: true, wrap: true },
    { name: 'Paid Amount',      selector: (row) => formatCurrency(row.paid_amount),      sortable: true, wrap: true },
    { name: 'Remaining Amount', cell:     (row) => formatCurrency(row.remaining_amount), sortable: true, wrap: true },
    {
      name: 'Status',
      cell: (row) => {
        const ps = getPaymentStatus(row);
        return <Chip label={ps.text} color={ps.color} variant={ps.status === 'pending' ? 'outlined' : 'filled'} size="small" />;
      },
      sortable: true, wrap: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" startIcon={<Visibility />} onClick={() => handleViewDetails(row)}>Details</Button>
          <Button variant="contained" size="small" startIcon={<Payment />}   onClick={() => handleOpenPaymentDialog(row)} color="primary">Pay</Button>
        </Stack>
      ),
      width: '200px',
      ignoreRowClick: true,
    },
  ];

  const customStyles = {
    headRow: { style: { backgroundColor: '#f5f5f5', fontWeight: 'bold' } },
    rows:    { style: { minHeight: '60px' } },
  };

  const paymentHistoryColumns = [
    { name: 'Date',           selector: (row) => formatDateTime(row.created_at),    sortable: true, width: '180px' },
    { name: 'Amount',         selector: (row) => formatCurrency(row.amount),        sortable: true, width: '120px' },
    { name: 'Type',           selector: (row) => row.payment_type || 'Installment', sortable: true, width: '150px' },
    { name: 'Transaction ID', selector: (row) => row.order_id || 'N/A',            sortable: true, width: '180px' },
    {
      name: 'Status',
      cell: (row) => (
        <Chip
          label={row.payment_status === 'completed' ? 'Completed' : 'Pending'}
          color={row.payment_status === 'completed' ? 'success' : 'warning'}
          size="small"
        />
      ),
      width: '130px',
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <MainCard sx={{ mt: 4 }}>
      <Grid sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Stack direction="column" spacing={1.5} sx={{ px: 2 }}>
          <FormLabel>Filter by Student:</FormLabel>
          <Autocomplete
            id="student-select"
            options={studentsMap || []}
            getOptionLabel={(option) => option.student_name}
            value={studentsMap?.find((s) => s.student_id === selectedStudent) || null}
            onChange={(event, newValue) => {
              setSelectedStudent(newValue ? newValue.student_id : '');
              setShowDetails(false);
              setSelectedStudentDetails(null);
            }}
            isOptionEqualToValue={(option, value) => option.student_id === value.student_id}
            renderInput={(params) => <TextField {...params} placeholder="Filter by student name" />}
            noOptionsText="No students found"
            clearOnEscape
            clearOnBlur
            sx={{ width: 300 }}
          />
        </Stack>
        <Stack direction="column" spacing={1.5} sx={{ px: 2 }}>
          <Button variant="contained" sx={{ width: 100 }} onClick={handleOpenAddUserModal}>
            Add User
          </Button>
        </Stack>
      </Grid>

      {showDetails && selectedStudentDetails ? (
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <IconButton onClick={handleBackToList} color="primary"><ArrowBack /></IconButton>
              <Typography variant="h5">Student Details - {Capitalise(selectedStudentDetails.student_name)}</Typography>
            </Stack>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    <LocationOn sx={{ fontSize: 20, mr: 1 }} />Student Information
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">Student Name</Typography>
                      <Typography variant="body1" fontWeight="bold">{Capitalise(selectedStudentDetails.student_name)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">Course</Typography>
                      <Typography variant="body1">{selectedStudentDetails.course_name || 'N/A'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">Student ID</Typography>
                      <Typography variant="body1" fontFamily="monospace">{selectedStudentDetails.student_id}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary"><Email sx={{ fontSize: 16, mr: 0.5 }} />Email</Typography>
                      <Typography variant="body1">{selectedStudentDetails.email || 'N/A'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary"><Phone sx={{ fontSize: 16, mr: 0.5 }} />Phone</Typography>
                      <Typography variant="body1">{selectedStudentDetails.contact_no || 'N/A'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary"><CalendarToday sx={{ fontSize: 16, mr: 0.5 }} />Registration Date</Typography>
                      <Typography variant="body1">{formatDate(selectedStudentDetails.joining_date || 'N/A')}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary"><LocationOn sx={{ fontSize: 16, mr: 0.5 }} />Address</Typography>
                      <Typography variant="body2">{selectedStudentDetails.address || 'N/A'}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    <Receipt sx={{ fontSize: 20, mr: 1 }} />Payment Summary
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">Total Course Fee</Typography>
                      <Typography variant="body1" fontWeight="bold">{formatCurrency(selectedStudentDetails.total_course_fee || 0)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">Paid Amount</Typography>
                      <Typography variant="body1" color="success.main" fontWeight="bold">{formatCurrency(selectedStudentDetails.paid_amount || 0)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">Remaining Amount</Typography>
                      <Typography variant="body1" color="warning.main" fontWeight="bold">{formatCurrency(selectedStudentDetails.remaining_amount || 0)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">Payment Status</Typography>
                      {(() => {
                        const ps = getPaymentStatus(selectedStudentDetails);
                        return <Chip label={ps.text} color={ps.color} variant={ps.status === 'pending' ? 'outlined' : 'filled'} size="medium" />;
                      })()}
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              {paymentDetails && paymentDetails.length > 0 && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom color="primary">Payment History</Typography>
                    <Box sx={{ mt: 2 }}>
                      <DataTable columns={paymentHistoryColumns} data={paymentDetails} customStyles={customStyles} pagination highlightOnHover />
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" startIcon={<Receipt />} onClick={() => handleOpenPaymentDialog(selectedStudentDetails)}>Payment Details</Button>
              {getPaymentStatus(selectedStudentDetails).status === 'pending' && (
                <Button variant="contained" startIcon={<Payment />} onClick={() => handleOpenPaymentDialog(selectedStudentDetails)}>Make Payment</Button>
              )}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <DataTable
              columns={columns}
              data={filteredStudentsData}
              customStyles={customStyles}
              pagination
              highlightOnHover
              responsive
              noDataComponent={
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="textSecondary">
                    {selectedStudent ? 'No student data found for the selected filter.' : 'No student data available.'}
                  </Typography>
                </Box>
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Quick Pay Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{selectedPayment ? `Payment for ${Capitalise(selectedPayment.student_name)}` : 'Payment'}</Typography>
            <IconButton onClick={() => setPaymentDialogOpen(false)}><Close /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="body2" color="textSecondary">Course: {selectedPayment?.course_name || 'N/A'}</Typography>
                <Typography variant="body2" color="textSecondary">Total Amount: {formatCurrency(selectedPayment?.total_amount)}</Typography>
                <Typography variant="body2" color="textSecondary">Paid Amount: {formatCurrency(selectedPayment?.total_paid)}</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Remaining: {formatCurrency((selectedPayment.total_amount || 0) - (selectedPayment.total_paid || 0))}
                </Typography>
              </Box>
              <TextField
                label="Payment Amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                fullWidth
                placeholder="Enter amount"
                InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography> }}
              />
              {paymentDetails && paymentDetails.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Recent Payments:</Typography>
                  <Stack spacing={1}>
                    {paymentDetails.slice(0, 3).map((payment, index) => (
                      <Alert key={index} severity="info" icon={<Receipt />} sx={{ py: 0.5 }}>
                        {formatDateTime(payment.created_at)}: {formatCurrency(payment.amount)}
                      </Alert>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePaymentSubmit} variant="contained" disabled={loading || !paymentAmount} startIcon={<Payment />}>
            {loading ? 'Processing...' : 'Submit Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Payment Modal */}
      <Dialog open={paymentAddUserOpen} onClose={handleCloseAddUserModal} maxWidth="md" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Add Payment</Typography>
              <IconButton onClick={handleCloseAddUserModal}><Close /></IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 0.5 }}>

              {/* Student */}
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <InputLabel>Student *</InputLabel>
                  <FormControl fullWidth error={formik.touched.student && Boolean(formik.errors.student)}>
                    <Select name="student" value={formik.values.student} onChange={formik.handleChange} onBlur={formik.handleBlur} displayEmpty>
                      <MenuItem value="" disabled>Select student</MenuItem>
                      {studentsMap.map((student) => (
                        <MenuItem key={student.student_id} value={student.student_id}>
                          {Capitalise(student.student_name)} ({student.student_id})
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.student && formik.errors.student && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>{formik.errors.student}</Typography>
                    )}
                  </FormControl>
                </Stack>
              </Grid>

              {/* ✅ Gateway — uses `gateway` state, loop var renamed to `gw` to avoid shadowing */}
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <InputLabel>Gateway *</InputLabel>
                  <FormControl fullWidth error={formik.touched.gateway && Boolean(formik.errors.gateway)}>
                    <Select name="gateway" value={formik.values.gateway} onChange={formik.handleChange} onBlur={formik.handleBlur} displayEmpty>
                      <MenuItem value="" disabled>Select gateway</MenuItem>
                      {gateway.map((gw) => (
                        <MenuItem key={gw} value={gw}>
                          {GATEWAY_LABELS[gw] || gw}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.gateway && formik.errors.gateway && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>{formik.errors.gateway}</Typography>
                    )}
                  </FormControl>
                </Stack>
              </Grid>

              {/* Amount */}
              <Grid item xs={6}>
                <Stack spacing={2}>
                  <InputLabel>Amount *</InputLabel>
                  <TextField
                    name="amount"
                    type="number"
                    value={formik.values.amount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                    helperText={formik.touched.amount && formik.errors.amount}
                    fullWidth
                    InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography> }}
                  />
                </Stack>
              </Grid>

              {/* Currency */}
              <Grid item xs={6}>
                <Stack spacing={2}>
                  <InputLabel>Currency</InputLabel>
                  <FormControl fullWidth>
                    <Select name="currency" value={formik.values.currency} onChange={formik.handleChange}>
                      <MenuItem value="INR">INR</MenuItem>
                      <MenuItem value="USD">USD</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>

              {/* Transaction ID */}
              <Grid item xs={6}>
                <Stack spacing={2}>
                  <InputLabel>Transaction ID</InputLabel>
                  <TextField name="transaction_id" value={formik.values.transaction_id} onChange={formik.handleChange} fullWidth placeholder="TXN_889933" />
                </Stack>
              </Grid>

              {/* Order ID */}
              <Grid item xs={6}>
                <Stack spacing={2}>
                  <InputLabel>Order ID</InputLabel>
                  <TextField name="order_id" value={formik.values.order_id} onChange={formik.handleChange} fullWidth placeholder="ORDER_112233" />
                </Stack>
              </Grid>

              {/* Description */}
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <InputLabel>Description</InputLabel>
                  <TextField name="description" value={formik.values.description} onChange={formik.handleChange} fullWidth multiline rows={2} placeholder="Full payment" />
                </Stack>
              </Grid>

              {/* Source */}
           
              {/* Payment Mode */}
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <InputLabel>Payment Mode</InputLabel>
                  <FormControl fullWidth error={formik.touched.metadata?.mode && Boolean(formik.errors.metadata?.mode)}>
                    <Select name="metadata.mode" value={formik.values.metadata.mode} onChange={formik.handleChange} onBlur={formik.handleBlur}>
                      <MenuItem value="ONLINE">ONLINE</MenuItem>
                      <MenuItem value="OFFLINE">OFFLINE</MenuItem>
                    </Select>
                    {formik.touched.metadata?.mode && formik.errors.metadata?.mode && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>{formik.errors.metadata.mode}</Typography>
                    )}
                  </FormControl>
                </Stack>
              </Grid>

            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddUserModal}>Cancel</Button>
            <Button type="submit" 
            sx={{
                  backgroundColor: "#6C5CE7",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#6C5CE7"
                  }
                }}
                variant="contained" disabled={loading || !formik.isValid}>
              {loading ? 'Processing...' : 'Submit Payment'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </MainCard>
  );
}

export default PaymentReportsPage;