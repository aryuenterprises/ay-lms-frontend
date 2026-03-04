// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Graph, Chart21, Messages2 } from 'iconsax-react';
import GroupsIcon from '@mui/icons-material/Groups';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CreditCardIcon from '@mui/icons-material/CreditCard';



// icons
const icons = {
  charts: Chart21,
  chart: Graph,
  chat: Messages2,
};

// Get login type from session storage
const auth = JSON.parse(localStorage.getItem('auth'));
const loginType = auth?.loginType;
const permissions = auth?.user?.permissions || [];

// Function to check if user has read permission for a module
const hasReadPermission = (moduleName) => {
  // Super admin has all permissions
  if (loginType === 'super_admin') return true;

  // For admin, check permissions array
  if (loginType === 'admin') {
    return permissions.some((permission) => permission.module_name === moduleName && permission.allowed_actions.includes('read'));
  }

  // For other user types, rely on loginType only
  return false;
};
const hasReportsAccess = (loginType === 'admin' || loginType === 'super_admin') && hasReadPermission('Reports');

// ==============================|| MENU ITEMS - CHARTS & MAPS ||============================== //

const Baselogs = {
  id: 'logs',
  title: <FormattedMessage id="logs" defaultMessage="Reports & Logs" />,
  icon: icons.charts,
  type: 'group',
  children: [

    // id: 'reports',
    // title: <FormattedMessage id="Reports" />,
    // type: '',
    // icon: icons.chat,
    // children: [
    {
      id: 'organization-reports',
      title: <FormattedMessage id="Organization Reports" />,
      type: 'item',
      url: '/reports/organization-reports',
      icon: GroupsIcon,
      show: hasReportsAccess
    },
    {
      id: 'student-reports',
      title: <FormattedMessage id="Student Reports" />,
      type: 'item',
      url: '/reports/student-reports',
      icon:AccountCircleIcon,
      show: hasReportsAccess
    },
    {
      id: 'tutor-reports',
      title: <FormattedMessage id="Tutor Reports" />,
      type: 'item',
      url: '/reports/tutor-reports',
      icon:AccountCircleIcon,
      show: hasReportsAccess
    },
    {
      id: 'payment-reports',
      title: <FormattedMessage id="Payment Reports" />,
      type: 'item',
      url: '/reports/payment-reports',
      icon: CreditCardIcon,
      show: hasReportsAccess
    },
    // ].filter((item) => item.show) // Filter out items that shouldn't be shown


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
const logs = hasReportsAccess ? Baselogs : null;
export default logs;
