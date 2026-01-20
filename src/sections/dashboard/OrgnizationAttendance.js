import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Grid, Stack, Typography, useMediaQuery } from '@mui/material';

// third-party
import ReactApexChart from 'react-apexcharts';

// project-imports
import MainCard from 'components/MainCard';
import { ThemeMode } from 'config';

// ==============================|| CHART ||============================== //

const ApexDonutChart = ({ attendance }) => {
  const theme = useTheme();
  const downSM = useMediaQuery(theme.breakpoints.down('sm'));

  const mode = theme.palette.mode;
  const { primary } = theme.palette.text;
  const line = theme.palette.divider;
  const backColor = theme.palette.background.paper;

  // Calculate present and absent counts from attendance data
  const presentCount = attendance?.present || 0;
  const absentCount = attendance?.absent || 0;
  const totalDays = attendance?.total;

  // Use the attendance data directly in the series
  const series = [presentCount, absentCount];

  const [options, setOptions] = useState({
    chart: {
      type: 'donut',
      height: 320
    },
    labels: ['Present', 'Absent'],
    legend: {
      show: false
    },
    dataLabels: {
      enabled: false
    }
  });

  useEffect(() => {
    const primaryMain = theme.palette.success.dark;
    const errorMain = theme.palette.error.dark;

    setOptions((prevState) => ({
      ...prevState,
      colors: [primaryMain, errorMain],
      xaxis: {
        labels: {
          style: {
            colors: [primary, primary]
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: [primary]
          }
        }
      },
      grid: {
        borderColor: line
      },
      stroke: {
        colors: [backColor]
      },
      theme: {
        mode: mode === ThemeMode.DARK ? 'dark' : 'light'
      }
    }));
  }, [mode, primary, line, backColor, theme, totalDays]);

  return (
    <div id="chart">
      <ReactApexChart options={options} series={series} type="donut" height={downSM ? 280 : 320} />
    </div>
  );
};

ApexDonutChart.propTypes = {
  attendance: PropTypes.shape({
    present: PropTypes.number,
    absent: PropTypes.number,
    total: PropTypes.number
  })
};

// ==============================|| CHART WIDGETS - ATTENDANCE ||============================== //

const OrgnizationAttendance = ({ attendance }) => {
  //   console.log('attendance :', attendance);
  //   const auth = JSON.parse(localStorage.getItem('auth'));
  //   const userType = auth?.loginType;
  const addData = attendance;

  return (
    <MainCard>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography variant="h5">Today Attendance</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} display={'flex'} justifyContent={'center'}>
          {addData?.present === 0 && addData?.absent === 0 ? (
            <Typography variant="subtitle1">No Data Available</Typography>
          ) : (
            <ApexDonutChart attendance={addData} />
          )}
        </Grid>
        <Grid item xs={12} display={'flex'} justifyContent={'space-between'}>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
            <Typography variant="subtitle1">Present : </Typography>
            <Typography color="success.dark" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
              {addData?.present}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
            <Typography variant="subtitle1">Absent : </Typography>
            <Typography color="error.dark" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
              {addData?.absent}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

OrgnizationAttendance.propTypes = {
  attendance: PropTypes.shape({ present: PropTypes.number, absent: PropTypes.number, total: PropTypes.number }).isRequired,
  today: PropTypes.shape({
    present: PropTypes.number,
    absent: PropTypes.number
  })
};

export default OrgnizationAttendance;
