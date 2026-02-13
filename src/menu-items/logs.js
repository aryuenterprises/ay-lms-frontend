// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Graph, Chart21 } from 'iconsax-react';

// icons
const icons = {
  charts: Chart21,
  chart: Graph
};

// Get login type from session storage
// const auth = JSON.parse(localStorage.getItem('auth'));
// const loginType = auth?.loginType;
// const permissions = auth?.user?.permissions || [];

// // Function to check if user has read permission for a module
// const hasReadPermission = (moduleName) => {
//   // Super admin has all permissions
//   if (loginType === 'super_admin') return true;

//   // For admin, check permissions array
//   if (loginType === 'admin') {
//     return permissions.some((permission) => permission.module_name === moduleName && permission.allowed_actions.includes('read'));
//   }

//   // For other user types, rely on loginType only
//   return false;
// };

// ==============================|| MENU ITEMS - CHARTS & MAPS ||============================== //

const logs = {
  id: 'logs',
  title: <FormattedMessage id="logs" defaultMessage="Logs" />,
  icon: icons.charts,
  type: 'group',
  children: [
    {
      id: 'logs',
      title: <FormattedMessage id="logs" defaultMessage="Attendance Logs" />,
      type: 'item',
      icon: icons.chart,
      url: '/attendance-logs'
      // show: (loginType === 'admin' || loginType === 'super_admin') && hasReadPermission('Attendance Logs')
    }
    // {
    //   id: 'activity-logs',
    //   title: <FormattedMessage id="activity-logs" defaultMessage="Activity Logs" />,
    //   type: 'item',
    //   icon: icons.chart,
    //   url: '/activity-logs',
    //   show: ['admin'].includes(loginType)
    // }
  ]
};

// const logs = {
//   ...baseMenuItems,
//   children: baseMenuItems.children.filter((item) => item.show === true || item.show)
// };

export default logs;
