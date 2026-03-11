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
  chat: Messages2
};
const auth = JSON.parse(localStorage.getItem('auth'));
const loginType = auth?.loginType;
const permissions = auth?.user?.permissions || [];

// Function to check if user has read permission for a module
const hasReadPermission = (moduleName) => {
  if (loginType === 'super_admin') return true;

  return permissions.some(
    (permission) =>
      permission.module_name.toLowerCase() === moduleName.toLowerCase() &&
      permission.allowed_actions.includes('read')
  );
};
const hasReportsAccess = (loginType === 'admin' || loginType === 'super_admin') && hasReadPermission('Reports');
const hasAttendanceLogsAccess = hasReadPermission('Attendance Logs');

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
      icon: AccountCircleIcon,
      show: hasReportsAccess
    },
    {
      id: 'tutor-reports',
      title: <FormattedMessage id="Tutor Reports" />,
      type: 'item',
      url: '/reports/tutor-reports',
      icon: AccountCircleIcon,
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
      url: '/attendance-logs',
      show: hasAttendanceLogsAccess
    }
    // {
    //   id: 'activity-logs',
    //   title: <FormattedMessage id="activity-logs" defaultMessage="Activity Logs" />,
    //   type: 'item',
    //   icon: icons.chart,
    //   url: '/activity-logs',
    //   show: ['admin'].includes(loginType)
    // }
  ].filter((item) => item.show)
};

// const logs = {
//   ...baseMenuItems,
//   children: baseMenuItems.children.filter((item) => item.show === true || item.show)
// };
// const logs = hasReportsAccess ? Baselogs : null;
const logs = Baselogs;
export default logs;
