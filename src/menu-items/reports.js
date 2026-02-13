// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { KyberNetwork, Messages2, Calendar1, Kanban, Profile2User, Bill, UserSquare, ShoppingBag } from 'iconsax-react';

// icons
const icons = {
  applications: KyberNetwork,
  chat: Messages2,
  calendar: Calendar1,
  kanban: Kanban,
  customer: Profile2User,
  tiket: Bill,
  profile: UserSquare,
  ecommerce: ShoppingBag
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

// Check if user has access to reports module
const hasReportsAccess = (loginType === 'admin' || loginType === 'super_admin') && hasReadPermission('Reports');
// const hasReportsAccess = (loginType === 'admin' || loginType === 'super_admin') && hasReadPermission('Reports');

// ==============================|| MENU ITEMS - APPLICATIONS ||============================== //

const baseMenuItems = {
  id: 'reports',
  title: <FormattedMessage id="reports" defaultMessage="Reports" />,
  icon: icons.applications,
  type: 'group',
  children: [
    {
      id: 'reports-collapse',
      title: <FormattedMessage id="Reports" />,
      type: 'collapse',
      icon: icons.chat,
      children: [
        {
          id: 'organization-reports',
          title: <FormattedMessage id="Organization Reports" />,
          type: 'item',
          url: '/reports/organization-reports',
          show: hasReportsAccess
        },
        {
          id: 'student-reports',
          title: <FormattedMessage id="Student Reports" />,
          type: 'item',
          url: '/reports/student-reports',
          show: hasReportsAccess
        },
        {
          id: 'tutor-reports',
          title: <FormattedMessage id="Tutor Reports" />,
          type: 'item',
          url: '/reports/tutor-reports',
          show: hasReportsAccess
        },
        {
          id: 'payment-reports',
          title: <FormattedMessage id="Payment Reports" />,
          type: 'item',
          url: '/reports/payment-reports',
          show: hasReportsAccess
        }
      ].filter((item) => item.show) // Filter out items that shouldn't be shown
    },
    {
      id: 'enquery-list',
      title: <FormattedMessage id="Enquiry List"/>,
      type: 'item',
      url: '/enquiry-list',
      icon: icons.calendar,
      show: true
    },
    {
      id: 'ticket-list',
      title: <FormattedMessage id="Ticket List" />,
      type: 'item',
      url: '/ticket-list',
      icon: icons.tiket,
      show: true
    }
  ]
};

// Only show the reports group if user has access to at least one report type
const reports = hasReportsAccess ? baseMenuItems : null;

export default reports;
