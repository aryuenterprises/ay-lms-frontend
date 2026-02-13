import { useState } from 'react';
import {
  Box,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import PropTypes from 'prop-types';

export default function Schedule({ schedule }) {
  const [open, setOpen] = useState(false);
  const displayedSchedules = schedule?.slice(0, 4) || [];

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Shared rendering function for list items
  const renderScheduleItem = (item, index, arr) => (
    <ListItem
      key={index}
      divider={index !== arr.length - 1}
      secondaryAction={
        <Stack spacing={0.25} alignItems="flex-end">
          <Typography variant="subtitle1">{item.scheduled_date}</Typography>
          <Typography color="error" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip
              color={
                item.status === 'done' ? 'success' : item.status === 'upcoming' ? 'warning' : item.status === 'ongoing' ? 'info' : 'error'
              }
              size="small"
              label={item.status}
            />
          </Typography>
        </Stack>
      }
    >
      <ListItemAvatar>
        <Avatar
          variant="rounded"
          type="outlined"
          color="secondary"
          sx={{ color: 'secondary.darker', borderColor: 'secondary.light', fontWeight: 600 }}
        >
          {item.course_name.charAt(0)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={<Typography variant="subtitle1">{item.course_name}</Typography>}
        secondary={
          <>
            <Grid container flexDirection={'column'}>
              <Grid item>
                <Typography variant="caption" color="text.secondary">
                  #{item.batch_name}
                </Typography>
              </Grid>
              <Grid item>
                <Stack flexDirection={'row'} gap={1}>
                  <Typography variant="caption" color="text.secondary">
                    Meet link :
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.info"
                    component="a"
                    href={item.class_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {item.class_link}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </>
        }
      />
    </ListItem>
  );

  return (
    <MainCard content={false}>
      <Box sx={{ p: 3, pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography variant="h5">Upcoming Schedule</Typography>
        </Stack>
      </Box>
      <Box sx={{ width: '100%' }}>
        <List disablePadding sx={{ '& .MuiListItem-root': { px: 3, py: 1.5 } }}>
          {displayedSchedules.map((item, idx) => renderScheduleItem(item, idx, displayedSchedules))}
        </List>
        {schedule && schedule.length > 4 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <Button variant="text" onClick={handleOpen}>
              View All
            </Button>
          </Box>
        )}
      </Box>

      {/* Modal for all schedule items */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>All Schedules</DialogTitle>
        <DialogContent dividers>
          <List disablePadding sx={{ '& .MuiListItem-root': { px: 3, py: 1.5 } }}>
            {schedule && schedule.map((item, idx) => renderScheduleItem(item, idx, schedule))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}

Schedule.propTypes = {
  schedule: PropTypes.array,
  slice: PropTypes.number
};
