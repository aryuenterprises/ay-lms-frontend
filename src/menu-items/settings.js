// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Setting2, Information } from 'iconsax-react';

// icons
const icons = {
  settings: Setting2,
  Information: Information
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

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const baseMenuItems = {
  id: 'settings',
  title: <FormattedMessage id="settings" defaultMessage="Settings" />,
  type: 'group',
  children: [
    {
      id: 'settings',
      title: <FormattedMessage id="settings" defaultMessage="Settings" />,
      type: 'item',
      url: '/settings',
      icon: icons.settings,
      show: (loginType === 'admin' || loginType === 'super_admin') && hasReadPermission('Settings')
    },
    {
      id: 'announcements',
      title: <FormattedMessage id="announcements" defaultMessage="Announcements" />,
      type: 'item',
      url: '/announcements',
      icon: icons.Information,
      show: (loginType === 'admin' || loginType === 'super_admin') && hasReadPermission('Announcements')
    }
  ]
};

// Filter menu items based on login type
const filteredChildren = baseMenuItems.children.filter((item) => item.show === true || item.show);

// Return null if no children are visible to avoid empty menu groups
const settings =
  filteredChildren.length > 0
    ? {
        ...baseMenuItems,
        children: filteredChildren
      }
    : null;

export default settings;
