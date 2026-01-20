import React from 'react';

import { Box, Stack, Grid, Divider, Paper, Card, CardContent, Typography } from '@mui/material';
import { useLocation } from 'react-router';
import { Container } from '@mui/system';
import { People, CalendarToday, Description } from '@mui/icons-material';
import DataTable from 'react-data-table-component';
import { capitalize } from 'lodash';
import { formatDateTime } from 'utils/dateUtils';

const ParticipantTable = () => {
  const location = useLocation();

  const { webinarData } = location?.state || null;
  console.log('webinar test', webinarData);

  const columns = [
    {
      name: 'S.No',
      selector: (row, index) => index + 1,
      sortable: true,
      width: '80px'
    },
    {
  name: 'Name',
  selector: row => row.name,
  sortable: true,
  wrap: true,
  cell: row => (
    <span
      style={{
        color: row.attended  ? 'green' : 'inherit',
        fontWeight: row.attended ? 600 : 400,
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}
    >
     
      {row.attended  && '✓ '} 
      {row.name}
    </span>
  )
},
    {
      name: 'Email',
      selector: (row) => row.email,
      sortable: true,
      wrap: true
    },
    {
      name: 'Phone Number',
      selector: (row) => row.phone,
      wrap: true
    },
    {
      name: 'Registered At',
      selector: (row) => formatDateTime(row.registered_at),
      wrap: true
    },
   
   
  ];

  const rows =
    webinarData?.participants?.map((participant, index) => ({
      id: index,
      index: index + 1,
      name: capitalize(participant.name),
      email: participant.email,
      phone: participant.phone,
      registered_at: participant.registered_at
    })) || [];

  /* ================= UI ================= */
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  {webinarData.title}
                </Typography>
              </Stack>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday color="primary" />
                  <Typography variant="h6">Event Date: {webinarData.scheduled_start}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <People color="primary" />
                  <Typography variant="h6">Participants: {webinarData.participants_count}</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Description color="primary" />
                <Typography variant="h6">Description:</Typography>
              </Box>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: 'grey.50',
                  maxHeight: 150,
                  overflow: 'auto'
                }}
              >
                <Typography variant="body1">{webinarData.description}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  Participant List
                </Typography>
              </Stack>
              <Divider sx={{ my: 2 }} />
            </Grid>
            <Box sx={{ ml: 2, width: '100%' }}>
              <DataTable
                columns={columns}
                data={rows}
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[5, 10, 20, 30]}
                highlightOnHover
                responsive
                fixedHeader
                persistTableHead
              />
            </Box>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ParticipantTable;
