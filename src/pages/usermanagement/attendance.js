// src/views/attendance/index.js
import { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import MainCard from 'components/MainCard';
import { AttachSquare, Notepad, SafeHome } from 'iconsax-react';
import AttendanceTab from './AttendanceTab';
import LeaveRequestTab from './LeaveRequestTab';
import EventsTab from './EventsTab';
import PropTypes from 'prop-types';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.any.isRequired,
  index: PropTypes.any.isRequired
};

const Attendance = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <MainCard sx={{ borderRadius: 2, mb: 3 }}>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', padding: 2 }}>
          <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto" aria-label="basic tabs example">
            <Tab className="tabs" label="Attendance" icon={<AttachSquare />} iconPosition="start" />
            <Tab className="tabs" label="Leave Request" icon={<Notepad />} iconPosition="start" disabled />
            <Tab className="tabs" label="Events" icon={<SafeHome />} iconPosition="start" disabled />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <AttendanceTab />
        </TabPanel>

        <TabPanel value={value} index={1}>
          <LeaveRequestTab />
        </TabPanel>

        <TabPanel value={value} index={2}>
          <EventsTab />
        </TabPanel>
      </Box>
    </MainCard>
  );
};

export default Attendance;
