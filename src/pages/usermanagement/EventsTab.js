// src/views/attendance/EventsTab.js
import { Grid } from '@mui/material';
import MainCard from 'components/MainCard';

const EventsTab = () => {
  return (
    <Grid container sx={{ minHeight: '70vh' }}>
      <Grid item xs={12}>
        <MainCard title="Upcoming Events">
          <div style={{ height: 600 }}>{/* Calendar component can be added here */}</div>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default EventsTab;
