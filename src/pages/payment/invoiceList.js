import React, { useState, useEffect, useMemo, useRef } from 'react';
import DataTable from 'react-data-table-component';
import {
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Grid,
  IconButton,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormLabel,
  Stack,
  Chip,
  FormHelperText,
  InputAdornment,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { Trash, ReceiptEdit, ReceiptAdd, CloseSquare, SearchNormal1, DocumentDownload } from 'iconsax-react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { PopupTransition } from 'components/@extended/Transitions';
import { APP_PATH_BASE_URL } from 'config';
import Swal from 'sweetalert2';

//css import
import 'assets/css/commonStyle.css';
import 'assets/css/DataTable.css';
import MainCard from 'components/MainCard';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { formatDate } from 'utils/formatDate';
import axiosInstance from 'utils/axios';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import InvoiceDesign from './invoice';

const InvoiceList = () => {
  const invoiceRef = useRef();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [selectedInvoiceForDownload, setSelectedInvoiceForDownload] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/invoice`);
      const result = response.data.data;
      // Ensure data is an array
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data based on search text
  const filteredData = useMemo(() => {
    if (!filterText) return data;

    return data.filter((item) =>
      Object.values(item).some((value) => value && value.toString().toLowerCase().includes(filterText.toLowerCase()))
    );
  }, [data, filterText]);

  // Validation schema
  const validationSchema = Yup.object().shape({
    student: Yup.string().required('Student name is required'),
    academic_year: Yup.string().required('Academic year is required'),
    fee_amount: Yup.number().required('Fee amount is required'),
    discount_amount: Yup.number(),
    amount_paid: Yup.number(),
    payment_status: Yup.string().required('Payment status is required'),
    due_date: Yup.date().required('Due date is required'),
    payment_method: Yup.string().required('Payment method is required'),
    installment_enabled: Yup.boolean()
  });

  // Column configuration
  const columns = [
    {
      name: 'Invoice No',
      selector: (row) => row.invoice_number,
      sortable: true,
      width: '100px'
    },
    {
      name: 'Student Name',
      selector: (row) => row.student_name || row.student,
      sortable: true
    },
    {
      name: 'Student Id',
      selector: (row) => row.student_id || '-',
      sortable: true
    },
    {
      name: 'Academic Year',
      selector: (row) => row.academic_year,
      sortable: true
    },
    {
      name: 'Fee Amount',
      selector: (row) => `$${row.fee_amount || 0}`,
      sortable: true,
      width: '120px'
    },
    {
      name: 'Amount Paid',
      selector: (row) => `$${row.amount_paid || 0}`,
      sortable: true,
      width: '120px'
    },
    {
      name: 'Amount Due',
      selector: (row) => `$${(row.fee_amount || 0) - (row.amount_paid || 0)}`,
      sortable: true,
      width: '120px'
    },
    {
      name: 'Status',
      selector: (row) => {
        switch (row.payment_status) {
          case 'Paid':
            return <Chip color="success" label="Paid" size="small" variant="light" />;
          case 'Partial':
            return <Chip color="info" label="Partial" size="small" variant="light" />;
          case 'Unpaid':
            return <Chip color="error" label="Unpaid" size="small" variant="light" />;
          case 'Overdue':
            return <Chip color="warning" label="Overdue" size="small" variant="light" />;
          default:
            return <Chip color="default" label="Unknown" size="small" variant="light" />;
        }
      },
      sortable: true,
      width: '100px'
    },
    {
      name: 'Actions',
      cell: (row) => (
        <Box sx={{ display: 'flex' }}>
          <Tooltip title="Edit">
            <IconButton color="info" variant="contained" onClick={() => handleEdit(row)}>
              <ReceiptEdit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton variant="contained" color="error" onClick={() => handleDelete(row.id)}>
              <Trash />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download Invoice">
            <IconButton variant="contained" color="success" onClick={() => handleInvoiceDownload(row)}>
              <DocumentDownload />
            </IconButton>
          </Tooltip>
        </Box>
      ),
      width: '200px'
    }
  ];

  const handleOpen = () => {
    setCurrentInvoice(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEdit = (invoice) => {
    setCurrentInvoice(invoice);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
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
        const response = await fetch(`${APP_PATH_BASE_URL}api/invoice/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete invoice');
        }

        setData(data.filter((item) => item.id !== id));
        Swal.fire('Deleted!', 'The invoice has been deleted.', 'success');
      }
    } catch (error) {
      Swal.fire('Error!', error.message, 'error');
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const invoiceData = {
        student: values.student,
        academic_year: values.academic_year,
        fee_amount: parseFloat(values.fee_amount || 0),
        discount_amount: parseFloat(values.discount_amount || 0),
        amount_paid: parseFloat(values.amount_paid || 0),
        payment_status: values.payment_status,
        due_date: values.due_date ? formatDate(values.due_date) : null,
        payment_date: values.payment_date ? formatDate(values.payment_date) : null,
        payment_method: values.payment_method,
        installment_enabled: values.installment_enabled || false,
        installment_plan: values.installment_plan,
        installment_paid: values.installment_paid,
        installment_due: values.installment_due,
        notes: values.notes
      };

      // Calculate amount due
      invoiceData.amount_due = invoiceData.fee_amount - invoiceData.discount_amount - invoiceData.amount_paid;

      const method = currentInvoice ? 'PUT' : 'POST';
      const url = currentInvoice ? `${APP_PATH_BASE_URL}api/invoice/${currentInvoice.id}` : `${APP_PATH_BASE_URL}api/invoice`;

      const response = await axiosInstance(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      });

      const result = response.data;

      if (currentInvoice) {
        setData(data.map((item) => (item.id === currentInvoice.id ? result : item)));
      } else {
        setData([...data, result]);
      }

      Swal.fire({
        title: 'Success!',
        text: currentInvoice ? 'Invoice updated successfully!' : 'Invoice added successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });

      resetForm();
      fetchData();
      handleClose();
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Error submitting invoice data. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleInvoiceDownload = (invoice) => {
    setSelectedInvoiceForDownload(invoice);

    // Use setTimeout to ensure the state update and DOM rendering happens before capturing
    setTimeout(() => {
      const input = invoiceRef.current;
      if (!input) return;

      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`invoice-${invoice.invoice_number || invoice.id}.pdf`);
      });
    }, 100);
  };

  const paymentStatusOptions = [
    { value: 'Paid', label: 'Paid' },
    { value: 'Partial', label: 'Partial' },
    { value: 'Unpaid', label: 'Unpaid' },
    { value: 'Overdue', label: 'Overdue' }
  ];

  const paymentMethodOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Credit Card', label: 'Credit Card' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Check', label: 'Check' },
    { value: 'Online Payment', label: 'Online Payment' }
  ];

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
        </Grid>
        <Grid item xs={12} md={6} textAlign="right">
          <Button color="success" variant="contained" startIcon={<ReceiptAdd />} onClick={handleOpen}>
            Add Invoice
          </Button>
        </Grid>
      </Grid>
    );
  }, [filterText, resetPaginationToggle]);

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
    <>
      {/* Hidden invoice design for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div ref={invoiceRef}>{selectedInvoiceForDownload && <InvoiceDesign invoice={selectedInvoiceForDownload} />}</div>
      </div>

      <MainCard sx={{ borderRadius: 2 }}>
        {subHeaderComponentMemo}

        <DataTable
          columns={columns}
          data={filteredData}
          progressPending={loading}
          progressComponent={<CircularProgress />}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[5, 10, 20, 30]}
          highlightOnHover
          responsive
          noDataComponent={<Box p={3}>No invoices found</Box>}
        />

        {/* Add/Edit Invoice Dialog */}
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
            {currentInvoice ? 'Edit Invoice' : 'Add New Invoice'}
            <IconButton color="dark" onClick={handleClose} edge="end" size="big" aria-placeholder="close" title="close">
              <CloseSquare height={80} />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Formik
              initialValues={{
                student: currentInvoice?.student || '',
                academic_year: currentInvoice?.academic_year || '2023-2024',
                fee_amount: currentInvoice?.fee_amount || '',
                discount_amount: currentInvoice?.discount_amount || '',
                amount_paid: currentInvoice?.amount_paid || '',
                payment_status: currentInvoice?.payment_status || '',
                due_date: currentInvoice?.due_date || '',
                payment_date: currentInvoice?.payment_date || '',
                payment_method: currentInvoice?.payment_method || '',
                installment_enabled: currentInvoice?.installment_enabled || false,
                installment_plan: currentInvoice?.installment_plan || '',
                installment_paid: currentInvoice?.installment_paid || '',
                installment_due: currentInvoice?.installment_due || '',
                notes: currentInvoice?.notes || ''
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, values, setFieldValue }) => (
                <Form>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                      <Stack sx={{ mt: 2, gap: 1 }}>
                        <FormLabel>Student Name</FormLabel>
                        <Field
                          as={TextField}
                          fullWidth
                          id="student"
                          placeholder="Student Name"
                          name="student"
                          error={touched.student && Boolean(errors.student)}
                          helperText={touched.student && errors.student}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack sx={{ mt: 2, gap: 1 }}>
                        <FormLabel>Academic Year</FormLabel>
                        <Field
                          as={TextField}
                          fullWidth
                          id="academic_year"
                          placeholder="Academic Year"
                          name="academic_year"
                          error={touched.academic_year && Boolean(errors.academic_year)}
                          helperText={touched.academic_year && errors.academic_year}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack sx={{ mt: 2, gap: 1 }}>
                        <FormLabel>Fee Amount</FormLabel>
                        <Field
                          as={TextField}
                          fullWidth
                          id="fee_amount"
                          placeholder="Fee Amount"
                          name="fee_amount"
                          type="number"
                          error={touched.fee_amount && Boolean(errors.fee_amount)}
                          helperText={touched.fee_amount && errors.fee_amount}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack sx={{ mt: 2, gap: 1 }}>
                        <FormLabel>Discount Amount</FormLabel>
                        <Field
                          as={TextField}
                          fullWidth
                          id="discount_amount"
                          placeholder="Discount Amount"
                          name="discount_amount"
                          type="number"
                          error={touched.discount_amount && Boolean(errors.discount_amount)}
                          helperText={touched.discount_amount && errors.discount_amount}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack sx={{ mt: 2, gap: 1 }}>
                        <FormLabel>Amount Paid</FormLabel>
                        <Field
                          as={TextField}
                          fullWidth
                          id="amount_paid"
                          placeholder="Amount Paid"
                          name="amount_paid"
                          type="number"
                          error={touched.amount_paid && Boolean(errors.amount_paid)}
                          helperText={touched.amount_paid && errors.amount_paid}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack sx={{ mt: 2, gap: 1 }}>
                        <FormLabel>Payment Status</FormLabel>
                        <Field
                          as={TextField}
                          fullWidth
                          id="payment_status"
                          placeholder="Payment Status"
                          name="payment_status"
                          select
                          error={touched.payment_status && Boolean(errors.payment_status)}
                          helperText={touched.payment_status && errors.payment_status}
                          value={values.payment_status || ''}
                        >
                          <MenuItem value="">Select a payment status</MenuItem>
                          {paymentStatusOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Field>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack sx={{ mt: 2, gap: 1 }}>
                        <FormLabel>Payment Method</FormLabel>
                        <Field
                          as={TextField}
                          fullWidth
                          id="payment_method"
                          placeholder="Payment Method"
                          name="payment_method"
                          select
                          error={touched.payment_method && Boolean(errors.payment_method)}
                          helperText={touched.payment_method && errors.payment_method}
                          value={values.payment_method || ''} // Ensure empty value is handled
                        >
                          <MenuItem value="" disabled>
                            Select a payment method
                          </MenuItem>
                          {paymentMethodOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Field>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack sx={{ mt: 2, gap: 1 }}>
                        <FormLabel>Due Date</FormLabel>
                        <Field name="due_date">
                          {({ field, form }) => (
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                              <DatePicker
                                selected={field.value ? new Date(field.value) : null}
                                onChange={(date) => form.setFieldValue(field.name, date)}
                                customInput={
                                  <TextField
                                    fullWidth
                                    error={touched.due_date && Boolean(errors.due_date)}
                                    helperText={touched.due_date && errors.due_date}
                                  />
                                }
                              />
                            </LocalizationProvider>
                          )}
                        </Field>
                        <FormHelperText error>{touched.due_date && errors.due_date}</FormHelperText>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack sx={{ mt: 2, gap: 1 }}>
                        <FormLabel>Payment Date</FormLabel>
                        <Field name="payment_date">
                          {({ field, form }) => (
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                              <DatePicker
                                selected={field.value ? new Date(field.value) : null}
                                onChange={(date) => form.setFieldValue(field.name, date)}
                                customInput={
                                  <TextField
                                    fullWidth
                                    error={touched.payment_date && Boolean(errors.payment_date)}
                                    helperText={touched.payment_date && errors.payment_date}
                                  />
                                }
                              />
                            </LocalizationProvider>
                          )}
                        </Field>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Field
                            as={Checkbox}
                            name="installment_enabled"
                            checked={values.installment_enabled}
                            onChange={(e) => setFieldValue('installment_enabled', e.target.checked)}
                          />
                        }
                        label="Enable Installment Payment"
                      />
                      {errors.installment_enabled && touched.installment_enabled && (
                        <FormHelperText error>{errors.installment_enabled}</FormHelperText>
                      )}
                    </Grid>
                    {values.installment_enabled && (
                      <>
                        <Grid item xs={12} md={4}>
                          <Stack sx={{ mt: 2, gap: 1 }}>
                            <FormLabel>Installment Plan</FormLabel>
                            <Field
                              as={TextField}
                              fullWidth
                              id="installment_plan"
                              placeholder="Installment Plan"
                              name="installment_plan"
                              error={touched.installment_plan && Boolean(errors.installment_plan)}
                              helperText={touched.installment_plan && errors.installment_plan}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Stack sx={{ mt: 2, gap: 1 }}>
                            <FormLabel>Installments Paid</FormLabel>
                            <Field
                              as={TextField}
                              fullWidth
                              id="installment_paid"
                              placeholder="Installments Paid"
                              name="installment_paid"
                              type="number"
                              error={touched.installment_paid && Boolean(errors.installment_paid)}
                              helperText={touched.installment_paid && errors.installment_paid}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Stack sx={{ mt: 2, gap: 1 }}>
                            <FormLabel>Installments Due</FormLabel>
                            <Field
                              as={TextField}
                              fullWidth
                              id="installment_due"
                              placeholder="Installments Due"
                              name="installment_due"
                              type="number"
                              error={touched.installment_due && Boolean(errors.installment_due)}
                              helperText={touched.installment_due && errors.installment_due}
                            />
                          </Stack>
                        </Grid>
                      </>
                    )}
                    <Grid item xs={12}>
                      <Stack sx={{ mt: 2, gap: 1 }}>
                        <FormLabel>Notes</FormLabel>
                        <Field
                          as={TextField}
                          fullWidth
                          id="notes"
                          placeholder="Notes"
                          name="notes"
                          multiline
                          rows={3}
                          error={touched.notes && Boolean(errors.notes)}
                          helperText={touched.notes && errors.notes}
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                  <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleClose} variant="outlined">
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="primary">
                      {currentInvoice ? 'Update Invoice' : 'Add Invoice'}
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </Dialog>
      </MainCard>
    </>
  );
};

export default InvoiceList;
