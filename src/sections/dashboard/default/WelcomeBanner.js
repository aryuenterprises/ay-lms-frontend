// material-ui
import { Grid, Typography, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project import
import MainCard from 'components/MainCard';

//asset
import cardBack from 'assets/images/5.svg';
import WelcomeImage from 'assets/images/favicon.svg';

// ==============================|| ANALYTICS - WELCOME ||============================== //

const WelcomeBanner = () => {
  const theme = useTheme();

  const auth = JSON.parse(localStorage.getItem('auth'));
  const loginType = auth?.loginType;
  const companyName = auth?.user?.company_name;

  return (
    <MainCard
      border={false}
      sx={{
        color: 'common.white',
        position: 'relative',
        overflow: 'hidden',
        '&:after': {
          content: '""',
          backgroundImage: `url(${cardBack})`,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundSize: 'cover',
          backgroundPosition: 'bottom right',
          backgroundRepeat: 'no-repeat',
          zIndex: 1
        }
      }}
    >
      <Grid container>
        <Grid item md={8} sm={8} xs={12}>
          <Stack spacing={2} sx={{ padding: 3, position: 'relative', zIndex: 2 }}>
            <Typography variant="h2" color={theme.palette.background.paper}>
              Welcome to the Aryu Academy {loginType === 'student' ? 'Student' : loginType === 'tutor' ? 'Tutor' : 'Admin'} Portal
            </Typography>
            {loginType === 'employer' && companyName && (
              <Typography variant="h5" color={theme.palette.background.paper}>
                {companyName} + Aryu Academy = A winning learning experience! Let&apos;s make every lesson count.
              </Typography>
            )}
            <Typography variant="h6" color={theme.palette.background.paper}>
              Your personalized dashboard for accessing course materials, class schedules, assignments, progress tracking, and academic
              tools.
            </Typography>
          </Stack>
        </Grid>
        <Grid item sm={4} xs={12} sx={{ display: { xs: 'none', sm: 'initial' }, alignSelf: 'center' }}>
          <Stack sx={{ position: 'relative', pr: { sm: 3, md: 8 }, zIndex: 2 }} justifyContent="center" alignItems="flex-end">
            <img src={WelcomeImage} alt="Welcome" width="200px" />
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default WelcomeBanner;
