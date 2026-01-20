// material-ui
import { useTheme } from '@mui/material/styles';
import { Grid } from '@mui/material';

// project-imports
import EcommerceDataCard from 'components/cards/statistics/EcommerceDataCard';
// import EcommerceDataChart from 'sections/widget/chart/EcommerceDataChart';

// import RepeatCustomerRate from 'sections/widget/chart/RepeatCustomerRate';
// import ProjectOverview from 'sections/widget/chart/ProjectOverview';
// import ProjectRelease from 'sections/dashboard/default/ProjectRelease';
// import AssignUsers from 'sections/widget/statistics/AssignUsers';

// import Schedule from 'sections/dashboard/Schedule';
import Attendance from 'sections/dashboard/Attendance';
import CalendarTab from 'sections/dashboard/CalendarTab';
// import Assignments from 'sections/dashboard/Assignments';
import OrgnizationAttendance from 'sections/dashboard/OrgnizationAttendance';

// assets
import { Book, Teacher, User } from 'iconsax-react';
import WelcomeBanner from 'sections/dashboard/default/WelcomeBanner';
import Announcements from 'sections/dashboard/default/Announcements';
// import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import { APP_PATH_BASE_URL } from 'config';
import { useCallback, useEffect, useState } from 'react';
// import Cookies from 'js-cookie';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axiosInstance from 'utils/axios';
import AnalyticSubmissions from 'components/cards/statistics/AnalyticSubmissions';
import { useNavigate } from 'react-router';
import { Group } from '@mui/icons-material';
// ==============================|| DASHBOARD - DEFAULT ||============================== //

const DashboardDefault = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const auth = JSON.parse(localStorage.getItem('auth'));
  const userType = auth?.loginType;
  // const token = Cookies.get('token');

  const [data, setData] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [assignments, setAssignments] = useState([]);
  // console.log('scheduleData :', scheduleData);

  const fetchData = useCallback(async () => {
    const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/dashboard`);
    const data = response.data;
    setData(data?.data);
    setScheduleData(data?.schedule || []);
    setAttendanceData(data?.attendance || {});
    setAnnouncements(data?.announcements);
    if (userType === 'employer') {
      setAttendanceData(data.data.attendance);
      setAnnouncements(data?.data?.announcements);
      setAssignments(data.data.assignments.per_courses);
    } else if (userType === 'admin' || userType === 'super_admin') {
      setAnnouncements(data?.data?.announcements);
    }
  }, [userType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {(userType === 'student' || userType === 'tutor' || userType === 'employer' || userType === 'admin' || userType === 'super_admin') &&
        (announcements?.some(
          (a) =>
            a.audience === 'all' ||
            (userType === 'student' && a.audience === 'students') ||
            (userType === 'tutor' && a.audience === 'trainers') ||
            (userType === 'employer' && a.audience === 'students')
        ) ? (
          <Grid item xs={12}>
            <Announcements
              announcements={announcements.filter(
                (a) =>
                  a.audience === 'all' ||
                  (userType === 'student' && a.audience === 'students') ||
                  (userType === 'tutor' && a.audience === 'trainers') ||
                  (userType === 'employer' && a.audience === 'students')
              )}
            />
          </Grid>
        ) : (
          <Grid item xs={12}>
            <WelcomeBanner />
          </Grid>
        ))}

      {(userType === 'admin' || userType === 'super_admin') && (
        <>
          {/* row 1 */}
          <Grid item xs={12} sm={6} lg={3} onClick={() => navigate('/batch')}>
            <EcommerceDataCard
              title="Total Active Batches"
              count={data?.active_batches}
              color="error"
              iconPrimary={<Group />}
            ></EcommerceDataCard>
          </Grid>
          <Grid item xs={12} sm={6} lg={3} onClick={() => navigate('/course')}>
            <EcommerceDataCard
              title="Total Active Courses"
              count={data?.active_courses}
              color="warning"
              iconPrimary={<Book color={theme.palette.warning.dark} />}
            ></EcommerceDataCard>
          </Grid>
          <Grid item xs={12} sm={6} lg={3} onClick={() => navigate('/students')}>
            <EcommerceDataCard
              title="Total Active Students"
              count={data?.active_students}
              color="success"
              iconPrimary={<User color={theme.palette.success.dark} />}
            ></EcommerceDataCard>
          </Grid>
          <Grid item xs={12} sm={6} lg={3} onClick={() => navigate('/tutors')}>
            <EcommerceDataCard
              title="Total Active Tutors"
              count={data?.active_trainers}
              color="error"
              iconPrimary={<Teacher color={theme.palette.error.dark} />}
            ></EcommerceDataCard>
          </Grid>
          {/* <Grid item xs={12} md={6}>
            <Attendance attendance={attendanceData} />
          </Grid> */}
          {/* <Grid item xs={12} sm={6} lg={3} onClick={() => navigate('/batch')}>
            <EcommerceDataCard title="Active Batches" count={data?.active_batches} iconPrimary={<Group />}></EcommerceDataCard>
          </Grid>
          <Grid item xs={12} sm={6} lg={3} onClick={() => navigate('/course')}>
            <EcommerceDataCard
              title="Active Courses"
              count={data?.active_courses}
              color="warning"
              iconPrimary={<Book color={theme.palette.warning.dark} />}
            ></EcommerceDataCard>
          </Grid>
          <Grid item xs={12} sm={6} lg={3} onClick={() => navigate('/students')}>
            <EcommerceDataCard
              title="Active Students"
              count={data?.active_students}
              color="success"
              iconPrimary={<User color={theme.palette.success.darker} />}
            ></EcommerceDataCard>
          </Grid>
          <Grid item xs={12} sm={6} lg={3} onClick={() => navigate('/tutors')}>
            <EcommerceDataCard
              title="Active Tutors"
              count={data?.active_trainers}
              color="error"
              iconPrimary={<Teacher color={theme.palette.error.dark} />}
            ></EcommerceDataCard>
          </Grid> */}
        </>
      )}
      {/* row 2 */}
      {/* {userType === 'employer' && (
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <AnalyticEcommerce title="Total Assignments" count={assignments?.total} />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <AnalyticEcommerce
                title="Submitted Assignments"
                count={assignments?.submitted}
                percentage={assignments?.submission_rate}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <AnalyticEcommerce title="Pending Assignments" count={assignments?.pending} />
            </Grid>
          </Grid>
        </Grid>
      )} */}
      {userType === 'employer' && (
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {assignments?.map((assignment) => (
              <Grid
                item
                key={assignment.course_id}
                xs={12}
                sm={6}
                md={4}
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate('/report', { state: { per_courses: assignments } })}
              >
                <AnalyticSubmissions title={assignment.course_name} count={assignment.total_assignments} />
              </Grid>
            ))}
          </Grid>
        </Grid>
      )}
      {/* <Grid item xs={12} md={4} lg={3}>
        <Stack spacing={3}>
          <ProjectRelease />
          <AssignUsers />
        </Stack>
      </Grid> */}

      {/* row 3 */}
      {userType === 'student' && (
        <>
          {/* <Grid item xs={12} md={6}>
            <Schedule schedule={scheduleData} />
          </Grid> */}
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <CalendarTab schedule={scheduleData} fetchData={fetchData} />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={6}>
            <Attendance attendance={attendanceData} />
          </Grid>
        </>
      )}
      {userType === 'tutor' && (
        <>
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <CalendarTab schedule={scheduleData} fetchData={fetchData} />
            </LocalizationProvider>
          </Grid>
        </>
      )}
      {userType === 'employer' && (
        <>
          {/* <Grid item xs={12} md={6}>
            <Assignments assignments={assignments.per_student} />
          </Grid> */}
          <Grid item xs={12} md={6}>
            <OrgnizationAttendance attendance={attendanceData?.today} />
          </Grid>
        </>
      )}

      {/* {userType === 'employer' && (
        <>
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <CalendarTab schedule={scheduleData} />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={6}>
            <Attendance attendance={attendanceData} />
          </Grid>
        </>
      )} */}
      {/* {userType === 'student' && (
        <>
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <CalendarTab schedule={scheduleData} />
            </LocalizationProvider>
          </Grid>
        </>
      )} */}
    </Grid>
  );
};

export default DashboardDefault;
