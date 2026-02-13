import PropTypes from 'prop-types';

// material-ui
import { Chip, Grid, Stack, Typography } from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';

// assets
import { ArrowRight, ArrowUp } from 'iconsax-react';

// ==============================|| STATISTICS - ECOMMERCE CARD  ||============================== //

const AnalyticSubmissions = ({ color = 'primary', title, count, percentage, isLoss }) => (
  <MainCard contentSX={{ p: 2.25 }}>
    <Stack spacing={0.5}>
      <Typography variant="h5" color="inherit">
        Course : {title}
      </Typography>
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item>
          <Typography variant="h6" color="secondary">
            Total Assignments : {count}
          </Typography>
        </Grid>
        {/* <Grid item>
          <Typography variant="h6" color="secondary">
            <IconButton color="inherit" size="large">
              <Eye />
            </IconButton>
          </Typography>
        </Grid> */}
        {percentage && (
          <Grid item>
            <Chip
              variant="combined"
              color={color}
              icon={
                <>
                  {!isLoss && <ArrowUp style={{ transform: 'rotate(45deg)' }} />}
                  {isLoss && <ArrowRight style={{ transform: 'rotate(45deg)' }} />}
                </>
              }
              label={`${percentage}%`}
              sx={{ ml: 1.25, pl: 1, borderRadius: 1 }}
              size="small"
            />
          </Grid>
        )}
      </Grid>
    </Stack>
  </MainCard>
);

AnalyticSubmissions.propTypes = {
  title: PropTypes.string,
  count: PropTypes.string,
  percentage: PropTypes.number,
  isLoss: PropTypes.bool,
  color: PropTypes.string,
  extra: PropTypes.string
};

export default AnalyticSubmissions;
