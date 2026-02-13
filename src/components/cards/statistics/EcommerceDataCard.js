import PropTypes from 'prop-types';

// material-ui
import { Box, Grid, Stack, Typography } from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';

// ==============================|| CHART WIDGET - ECOMMERCE CARD  ||============================== //

const EcommerceDataCard = ({ title, count, color, iconPrimary, percentage, trend }) => {
  return (
    <MainCard
      contentSX={{ p: 2.5 }}
      sx={{
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => `0 6px 16px 0 ${theme.palette.grey[400]}`
        }
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar
                variant="rounded"
                color={color}
                sx={{
                  width: 46,
                  height: 46,
                  bgcolor: `${color}.lighter`,
                  color: `${color}.dark`,
                  borderRadius: 2
                }}
              >
                {iconPrimary}
              </Avatar>
              <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
                {title}
              </Typography>
            </Stack>
            {percentage && (
              <Typography
                variant="caption"
                sx={{
                  color: trend === 'up' ? 'success.main' : 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 500
                }}
              >
                {trend === 'up' ? '↑' : '↓'} {percentage}%
              </Typography>
            )}
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              p: 2,
              backgroundColor: 'background.default',
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`
            }}
          >
            <Stack spacing={0.5}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {count}
              </Typography>
              {/* <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Last 30 days
              </Typography> */}
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </MainCard>
  );
};

EcommerceDataCard.propTypes = {
  color: PropTypes.string,
  title: PropTypes.string,
  count: PropTypes.number,
  iconPrimary: PropTypes.node,
  percentage: PropTypes.string,
  trend: PropTypes.oneOf(['up', 'down'])
};

EcommerceDataCard.defaultProps = {
  trend: 'up'
};

export default EcommerceDataCard;
