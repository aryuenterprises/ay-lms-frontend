import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import { TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, Box, Paper, Stack, Grid, IconButton } from '@mui/material';
import { UserAdd, Trash, UserEdit, Add } from 'iconsax-react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { PopupTransition } from 'components/@extended/Transitions';

//css import
import 'assets/css/commonStyle.css';

const CourseTable = () => {
  // Sample initial data
  const initialData = [
    { id: 1, name: 'John Doe', mobile: '9876543210', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', mobile: '9876543210', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', mobile: '9876543210', email: 'bob@example.com' }
  ];

  const [data, setData] = useState(initialData);
  const [open, setOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [filterText, setFilterText] = useState('');

  // Validation schema
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required('Name is required')
      .min(3, 'Name must be at least 3 characters')
      .max(50, 'Name must not exceed 50 characters'),
    mobile: Yup.string()
      .required('Mobile is required')
      .matches(/^[0-9]+$/, 'Mobile must contain only numbers')
      .min(10, 'Mobile must be at least 10 digits')
      .max(15, 'Mobile must not exceed 15 digits'),
    email: Yup.string().required('Email is required').email('Email is invalid')
  });

  // Column configuration
  const columns = [
    {
      name: 'ID',
      selector: (row) => row.id,
      sortable: true,
      width: '80px'
    },
    {
      name: 'Name',
      selector: (row) => row.name,
      sortable: true
    },
    {
      name: 'Mobile',
      selector: (row) => row.mobile,
      sortable: true
    },
    {
      name: 'Email',
      selector: (row) => row.email,
      sortable: true
    },
    {
      name: 'Actions',
      cell: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="info" variant="outlined" size="small" startIcon={<UserEdit />} onClick={() => handleEdit(row)}>
            Edit
          </Button>
          <Button variant="outlined" size="small" color="error" startIcon={<Trash />} onClick={() => handleDelete(row.id)}>
            Delete
          </Button>
        </Box>
      ),
      width: '200px'
    }
  ];

  // Filtered data based on search text
  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(filterText.toLowerCase()) ||
      item.email.toLowerCase().includes(filterText.toLowerCase()) ||
      item.course.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleOpen = () => {
    setCurrentStudent(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEdit = (student) => {
    setCurrentStudent(student);
    setOpen(true);
  };

  const handleDelete = (id) => {
    setData(data.filter((item) => item.id !== id));
  };

  const handleSubmit = (values, { resetForm }) => {
    const studentData = {
      id: currentStudent ? currentStudent.id : data.length + 1,
      name: values.name,
      mobile: values.mobile,
      email: values.email,
      course: values.course,
      grade: values.grade
    };

    if (currentStudent) {
      // Update existing student
      setData(data.map((item) => (item.id === currentStudent.id ? studentData : item)));
    } else {
      // Add new student
      setData([...data, studentData]);
    }

    resetForm();
    handleClose();
  };

  return (
    <Paper elevation={3} sx={{ borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
        <Box sx={{ display: 'flex' }}>
          <TextField label="Search" variant="outlined" size="small" value={filterText} onChange={(e) => setFilterText(e.target.value)} />
        </Box>
        <Box sx={{ display: 'flex' }}>
          <Button color="success" variant="contained" startIcon={<UserAdd />} onClick={handleOpen}>
            Add
          </Button>
        </Box>
      </Box>

      <DataTable
        columns={columns}
        data={filteredData}
        pagination
        paginationPerPage={10}
        paginationRowsPerPageOptions={[5, 10, 20, 30]}
        highlightOnHover
        responsive
        customStyles={{
          headCells: {
            style: {
              fontWeight: 'bold',
              fontSize: '14px',
              backgroundColor: '#f5f5f5'
            }
          }
        }}
      />

      {/* Add/Edit Roles Dialog */}
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
          {currentStudent ? 'Edit Role' : 'Add Role'}
          <IconButton color="dark" onClick={handleClose} edge="end" size="big" aria-label="close" title="close">
            <Add height={80} className="dialogCloseIcon" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              name: currentStudent?.name || '',
              email: currentStudent?.email || '',
              mobile: currentStudent?.mobile || '',
              course: currentStudent?.course || '',
              grade: currentStudent?.grade || ''
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Stack>
                      <Field
                        as={TextField}
                        margin="normal"
                        fullWidth
                        id="name"
                        label="Full Name"
                        name="name"
                        autoFocus
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack>
                      <Field
                        as={TextField}
                        margin="normal"
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        type="email"
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack>
                      <Field
                        as={TextField}
                        margin="normal"
                        fullWidth
                        id="mobile"
                        label="Mobile"
                        name="mobile"
                        type="number"
                        error={touched.mobile && Boolean(errors.mobile)}
                        helperText={touched.mobile && errors.mobile}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack>
                      <Field
                        as={TextField}
                        margin="normal"
                        fullWidth
                        id="course"
                        label="Course"
                        name="course"
                        error={touched.course && Boolean(errors.course)}
                        helperText={touched.course && errors.course}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack>
                      <Field
                        as={TextField}
                        margin="normal"
                        fullWidth
                        id="grade"
                        label="Grade"
                        name="grade"
                        error={touched.grade && Boolean(errors.grade)}
                        helperText={touched.grade && errors.grade}
                      />
                    </Stack>
                  </Grid>
                </Grid>
                <DialogActions>
                  <Button onClick={handleClose}>Cancel</Button>
                  <Button type="submit" variant="contained">
                    {currentStudent ? 'Update' : 'Add'}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default CourseTable;
