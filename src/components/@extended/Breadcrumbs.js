import PropTypes from 'prop-types';
import { useEffect, useState, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Divider, Grid, Typography, Box } from '@mui/material';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import MainCard from 'components/MainCard';
import { ArrowRight2 } from 'iconsax-react';
import { useBreadcrumb } from './BreadcrumbContext';
import { Home } from '@mui/icons-material';
import { APP_PATH_BASE_URL } from 'config';
import axiosInstance from 'utils/axios';
import Announcements from 'sections/dashboard/default/Announcements';

// import axiosInstance from 'utils/axios';

// import { APP_PATH_BASE_URL } from 'config';

// import Announcements from 'sections/dashboard/default/Announcements';

// import Button from '@mui/material/Button';

const Breadcrumbs = ({
  card = true,
  divider = true,
  maxItems = 8,
  navigation,
  // rightAlign = true,
  separator = ArrowRight2,
  title = false,
  // titleBottom = true,
  sx,
  ...others
}) => {
  const location = useLocation();
  const [breadcrumbItems, setBreadcrumbItems] = useState([]);
  const { setBreadcrumbTitle } = useBreadcrumb();
  const [announcements, setAnnouncement] = useState([]);

  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';

  const auth = JSON.parse(localStorage.getItem('auth'));

  const userName = auth?.user?.name || 'User';
  const loginType = auth?.loginType;
  const loginname = userName.toUpperCase();
  const userType = auth?.loginType;

  // const [show,setshow]=useState("");

  // Set page title

  useEffect(() => {
    if (isDashboard) {
      setBreadcrumbTitle(userName);
    } else if (breadcrumbItems.length) {
      setBreadcrumbTitle(breadcrumbItems[breadcrumbItems.length - 1]?.title || '');
    }
  }, [breadcrumbItems, setBreadcrumbTitle, isDashboard, userName]);

  // Find route helper
  const findRouteByPath = useCallback((path, routes) => {
    if (!routes) return null;

    for (const route of routes) {
      if (!route || route.Breadcrumbs === false || route.hidden) continue;

      if (route.path && path.endsWith(route.path)) return route;

      if (route.path?.includes(':')) {
        const rp = route.path.split('/');
        const cp = path.split('/').filter(Boolean);

        if (rp.length === cp.length) {
          if (rp.every((p, i) => p.startsWith(':') || p === cp[i])) return route;
        }
      }

      if (route.children) {
        const child = findRouteByPath(path, route.children);
        if (child && child.type !== 'group') return child;
      }
    }
    return null;
  }, []);

  // Build breadcrumb list
  const buildBreadcrumbs = useCallback(
    (pathname, routes) => {
      // console.log(pathname.split('/'),'wroking her')

      let segments = pathname.split('/').filter(Boolean);

      // console.log("come here too ")

      // console.log(segments,"segments")
      if (segments[segments.length - 1] === 'organizations' || segments[segments.length - 1] === 'organization-employees') {
        segments = segments.slice(segments.length - 1);
      }
      let current = '';
      const items = [];

      segments.forEach((segment) => {
        current += `/${segment}`;
        const route = findRouteByPath(current, routes);
        if (route && route.type !== 'group') {
          items.push({ ...route, url: current });
        }
      });

      return items;
    },
    [findRouteByPath]
  );

  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/dashboard`);

      // console.log(response?.data?.announcements,"not data ")

      console.log(response?.data.announcements, response, 'working the value is there ');

      setAnnouncement(response?.data?.announcements || []);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!navigation?.children) return;
    setBreadcrumbItems(buildBreadcrumbs(location.pathname, navigation.children));
  }, [location.pathname, navigation, buildBreadcrumbs]);

  const SeparatorIcon = separator || ArrowRight2;

  return (
    <MainCard
      border={card}
      sx={card === false ? { mb: 3, bgcolor: 'transparent', ...sx } : { mb: 3, ...sx }}
      {...others}
      content={card}
      boxShadow={false}
    >
      {(userType === 'student' || userType === 'tutor' || userType === 'employer' || userType === 'admin' || userType === 'super_admin') &&
        location.pathname == '/dashboard' &&
        (announcements?.some(
          (a) =>
            a.audience === 'all' ||
            (userType === 'student' && a.audience === 'students') ||
            (userType === 'tutor' && a.audience === 'trainers') ||
            (userType === 'employer' && a.audience === 'students')
        ) ? (
          <Grid item xs={12}>
           
          </Grid>
        ) : (
          <Grid item xs={12}>
            {/* <WelcomeBanner /> */}
          </Grid>
        ))}
      <Grid container spacing={0.5} alignItems="center">
        {location.pathname !== '/dashboard' && (
          <Grid item>
            {isDashboard ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Home fontSize="small" />
                <Typography variant="h6" fontWeight={600}>
                  {userName}
                </Typography>
              </Box>
            ) : (
              <MuiBreadcrumbs maxItems={maxItems} separator={<SeparatorIcon size={12} />}>
                <Typography component={Link} to="/dashboard" color="secondary" sx={{ display: 'flex', gap: 0.5 }}>
                  <Home fontSize="small" />
                  {userName}
                </Typography>

                {breadcrumbItems.map((item, index) => {
                  const isLast = index === breadcrumbItems.length - 1;
                  return (
                    <Typography
                      key={index}
                      component={isLast ? 'span' : Link}
                      to={isLast ? undefined : item.url}
                      color={isLast ? 'textPrimary' : 'secondary'}
                      variant="h6"
                    >
                      {item.title}
                    </Typography>
                  );
                })}
              </MuiBreadcrumbs>
            )}
          </Grid>
        )}

        {/* {console.log(announcement, location.pathname, loginType)} */}
        {/* {announcement.map((items)=>setInterval(()=>{setshow(items.content)},2000000))} */}

        {location.pathname === '/dashboard' && loginType !== 'super_admin' && (
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
        )}

        {loginType && location.pathname === '/dashboard' && (
          <Grid item xs={12}>
            <Typography variant="h3" fontWeight={700}>
              {location.pathname.slice(1).toUpperCase()}{' '}
              <Typography component="span" variant="body2" fontWeight={500} sx={{ ml: 1 }}>
                {loginType.toUpperCase()}
              </Typography>
            </Typography>
          </Grid>
        )}

        {/* {title && location.pathname === "/dashboard" &&(
            </Typography>
          </Grid>
        )} */}

        {title && location.pathname === '/dashboard' && (
          <Grid item xs={12}>
            <Typography variant="h3" fontWeight={700}>
              WELCOME {loginname}!
            </Typography>
          </Grid>
        )}
      </Grid>

      {card === false && divider && <Divider sx={{ mt: 2 }} />}
    </MainCard>
  );
};

Breadcrumbs.propTypes = {
  card: PropTypes.bool,
  divider: PropTypes.bool,
  maxItems: PropTypes.number,
  navigation: PropTypes.object,
  rightAlign: PropTypes.bool,
  separator: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  title: PropTypes.bool,
  titleBottom: PropTypes.bool,
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
};

export default Breadcrumbs;
