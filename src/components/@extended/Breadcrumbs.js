import PropTypes from 'prop-types';
import { useEffect, useState, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Divider, Grid, Typography, Box } from '@mui/material';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import MainCard from 'components/MainCard';
import { ArrowRight2 } from 'iconsax-react';
import { useBreadcrumb } from './BreadcrumbContext';
import { Home } from '@mui/icons-material';

const Breadcrumbs = ({
  card = true,
  divider = true,
  maxItems = 8,
  navigation,
  rightAlign = false,
  separator = ArrowRight2,
  title = false,
  titleBottom = false,
  sx,
  ...others
}) => {
  const location = useLocation();
  const [breadcrumbItems, setBreadcrumbItems] = useState([]);
  const { setBreadcrumbTitle } = useBreadcrumb();
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';

  useEffect(() => {
    if (breadcrumbItems.length > 0) {
      setBreadcrumbTitle(breadcrumbItems[breadcrumbItems.length - 1]?.title || '');
    }
  }, [breadcrumbItems, setBreadcrumbTitle]);

  // Helper function to find route by path
  const findRouteByPath = useCallback((path, routes) => {
    if (!routes) return null;

    for (const route of routes) {
      if (!route || route.Breadcrumbs === false || route.hidden) continue;

      // Exact path match
      if (route.path && path.endsWith(route.path)) {
        return route;
      }

      // Handle dynamic routes (like :id)
      if (route.path && route.path.includes(':')) {
        const routePathParts = route.path.split('/');
        const currentPathParts = path.split('/').filter(Boolean);

        if (routePathParts.length === currentPathParts.length) {
          let match = true;
          for (let i = 0; i < routePathParts.length; i++) {
            if (!routePathParts[i].startsWith(':') && routePathParts[i] !== currentPathParts[i]) {
              match = false;
              break;
            }
          }
          if (match) return route;
        }
      }

      // Check children (including group routes)
      if (route.children) {
        const childMatch = findRouteByPath(path, route.children);
        if (childMatch) {
          // Return the child match unless it's a group route
          if (childMatch.type !== 'group') {
            return childMatch;
          }
          // For group routes, return the route itself if it matches
          if (route.path && path.endsWith(route.path)) {
            return route;
          }
        }
      }
    }
    return null;
  }, []);

  // Function to build breadcrumb items
  const buildBreadcrumbs = useCallback(
    (pathname, routes) => {
      const pathSegments = pathname.split('/').filter(Boolean);
      let currentPath = '';
      const items = [];

      // Always include the home route if it exists
      const homeRoute = findRouteByPath('/', routes);
      if (homeRoute) {
        items.push({
          ...homeRoute,
          url: '/dashboard',
          title: homeRoute.title
        });
      }

      pathSegments.forEach((segment) => {
        currentPath = `${currentPath}/${segment}`;
        const matchingRoute = findRouteByPath(currentPath, routes);

        if (matchingRoute && matchingRoute.type !== 'group') {
          items.push({
            ...matchingRoute,
            url: currentPath,
            title: matchingRoute.title
          });
        }
      });

      return items;
    },
    [findRouteByPath]
  );

  useEffect(() => {
    if (!navigation?.children) return;

    const items = buildBreadcrumbs(location.pathname, navigation.children);
    setBreadcrumbItems(items);
  }, [location, navigation, buildBreadcrumbs]);

  const SeparatorIcon = separator || ArrowRight2;
  const separatorIcon = <SeparatorIcon size={12} />;

  return (
    <MainCard
      border={card}
      sx={card === false ? { mb: 3, bgcolor: 'transparent', ...sx } : { mb: 3, ...sx }}
      {...others}
      content={card}
      boxShadow={false}
    >
      <Grid
        container
        direction={rightAlign ? 'row' : 'row'}
        justifyContent={rightAlign ? 'space-between' : 'flex-start'}
        alignItems={rightAlign ? 'center' : 'flex-start'}
        spacing={0.5}
      >
        {title && titleBottom && (
          <Grid item>
            <Typography variant="h2" sx={{ fontWeight: 700 }}>
              {breadcrumbItems[breadcrumbItems.length - 1]?.title || ''}
            </Typography>
          </Grid>
        )}

        <Grid item sx={{ mt: title ? 1 : 0, ml: title ? 2 : 0 }}>
          {isDashboard ? (
            // Show only home icon on dashboard
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Home size={24} style={{ color: 'textPrimary' }} />
            </Box>
          ) : (
            // Show full breadcrumbs on other pages
            <MuiBreadcrumbs aria-label="breadcrumb" maxItems={maxItems} separator={separatorIcon}>
              {breadcrumbItems.map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1;
                const isHome = item.url === '/dashboard' || item.url === '/';

                return (
                  <Typography
                    key={index}
                    component={isLast ? 'span' : Link}
                    to={isLast ? undefined : item.url}
                    variant="h6"
                    sx={{
                      textDecoration: isLast ? 'none' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: isHome ? '4px' : '0',
                      '&:hover': isLast ? {} : { textDecoration: 'underline' }
                    }}
                    color={isLast ? 'textPrimary' : 'secondary'}
                  >
                    {isHome && <Home size={16} />}
                    {!isHome && item.title}
                  </Typography>
                );
              })}
            </MuiBreadcrumbs>
          )}
        </Grid>

        {title && !titleBottom && (
          <Grid item sx={{ mt: card === false ? 0 : 1 }}>
            <Typography variant="h2" sx={{ fontWeight: 700 }}>
              {breadcrumbItems[breadcrumbItems.length - 1]?.title || ''}
            </Typography>
          </Grid>
        )}
      </Grid>

      {card === false && divider !== false && <Divider sx={{ mt: 2 }} />}
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
