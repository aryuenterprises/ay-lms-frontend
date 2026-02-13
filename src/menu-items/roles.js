// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Book, PasswordCheck, Next, RowVertical, CpuCharge, TableDocument, Subtitle } from 'iconsax-react';

// icons
const icons = {
  formsTable: Book,
  validation: PasswordCheck,
  wizard: Next,
  layout: RowVertical,
  plugins: CpuCharge,
  reactTables: TableDocument,
  muiTables: Subtitle
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

// ==============================|| MENU ITEMS - FORMS & TABLES ||============================== //

const baseMenuItems = {
  id: 'roles',
  title: <FormattedMessage id="roles" defaultMessage="Roles" />,
  icon: icons.formsTable,
  type: 'group',
  children: [
    {
      id: 'roles',
      title: <FormattedMessage id="roles" defaultMessage="Roles" />,
      type: 'item',
      url: '/roles',
      icon: icons.validation,
      show: (loginType === 'admin' || loginType === 'super_admin') && hasReadPermission('Roles')
    }
  ]
};

// Filter menu items based on login type
const filteredChildren = baseMenuItems.children.filter((item) => item.show === true || item.show);

// Return null if no children are visible to avoid empty menu groups
const roles =
  filteredChildren.length > 0
    ? {
        ...baseMenuItems,
        children: filteredChildren
      }
    : null;

export default roles;
