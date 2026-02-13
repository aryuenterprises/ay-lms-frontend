// src/views/attendance/LeaveRequestTab.js
import { useState } from 'react';
import { Button, InputLabel, TextField, MenuItem, Select, Grid } from '@mui/material';
import DataTable from 'react-data-table-component';
import MainCard from 'components/MainCard';

const LeaveRequestTab = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    leaveType: '',
    reason: '',
    status: 'Pending'
  });

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    const newLeaveRequest = {
      id: Date.now(),
      ...leaveForm,
      submittedDate: new Date().toLocaleDateString()
    };
    setLeaveRequests([...leaveRequests, newLeaveRequest]);
    setLeaveForm({
      startDate: '',
      endDate: '',
      leaveType: '',
      reason: '',
      status: 'Pending'
    });
  };

  const handleLeaveChange = (e) => {
    const { name, value } = e.target;
    setLeaveForm({
      ...leaveForm,
      [name]: value
    });
  };

  const leaveRequestColumns = [
    {
      name: 'Start Date',
      selector: (row) => row.startDate,
      sortable: true
    },
    {
      name: 'End Date',
      selector: (row) => row.endDate,
      sortable: true
    },
    {
      name: 'Leave Type',
      selector: (row) => row.leaveType,
      sortable: true
    },
    {
      name: 'Reason',
      selector: (row) => row.reason,
      sortable: true
    },
    {
      name: 'Status',
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span
          style={{
            color: row.status === 'Approved' ? 'green' : row.status === 'Rejected' ? 'red' : 'orange',
            fontWeight: 'bold'
          }}
        >
          {row.status}
        </span>
      )
    },
    {
      name: 'Submitted Date',
      selector: (row) => row.submittedDate,
      sortable: true
    }
  ];

  return (
    <Grid container spacing={3} sx={{ minHeight: '50vh' }}>
      <Grid item xs={12} md={6}>
        <MainCard title="Apply for Leave">
          <form onSubmit={handleLeaveSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <InputLabel>Leave Type *</InputLabel>
                <Select fullWidth name="leaveType" value={leaveForm.leaveType} onChange={handleLeaveChange} required>
                  <MenuItem value="">Select Leave Type</MenuItem>
                  <MenuItem value="Sick Leave">Sick Leave</MenuItem>
                  <MenuItem value="Casual Leave">Casual Leave</MenuItem>
                  <MenuItem value="Earned Leave">Earned Leave</MenuItem>
                  <MenuItem value="Maternity Leave">Maternity Leave</MenuItem>
                  <MenuItem value="Paternity Leave">Paternity Leave</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} sm={6}>
                <InputLabel>Start Date *</InputLabel>
                <TextField
                  fullWidth
                  type="date"
                  name="startDate"
                  value={leaveForm.startDate}
                  onChange={handleLeaveChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InputLabel>End Date *</InputLabel>
                <TextField
                  fullWidth
                  type="date"
                  name="endDate"
                  value={leaveForm.endDate}
                  onChange={handleLeaveChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <InputLabel>Reason *</InputLabel>
                <TextField fullWidth multiline rows={3} name="reason" value={leaveForm.reason} onChange={handleLeaveChange} required />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" fullWidth>
                  Submit Leave Request
                </Button>
              </Grid>
            </Grid>
          </form>
        </MainCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <MainCard title="My Leave Requests">
          <DataTable columns={leaveRequestColumns} data={leaveRequests} pagination paginationPerPage={5} highlightOnHover responsive />
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default LeaveRequestTab;
