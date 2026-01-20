// third-party
import { FormattedMessage } from 'react-intl';
import { memo } from 'react';

// assets
import { DocumentCode2, OceanProtocol, Level, ShieldCross, InfoCircle, I24Support, Driving } from 'iconsax-react';

// icons
const icons = {
  samplePage: DocumentCode2,
  menuLevel: OceanProtocol,
  menuLevelSubtitle: Level,
  disabledMenu: ShieldCross,
  chipMenu: InfoCircle,
  documentation: I24Support,
  roadmap: Driving
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

const createMenuItems = (loginType) => {
  const baseMenuItems = {
    id: 'category',
    title: <FormattedMessage id="category" defaultMessage="Category" />,
    type: 'group',
    children: [
      {
        id: 'category',
        title: <FormattedMessage id="category" defaultMessage="Category" />,
        type: 'item',
        url: '/category',
        icon: icons.samplePage,
        show: (loginType === 'admin' || loginType === 'super_admin') && hasReadPermission('Category')
      }
    ]
  };

  return {
    ...baseMenuItems,
    children: baseMenuItems.children.filter((item) => item.show === true || item.show)
  };
};

// Create a component that consumes the context
const MenuItemsWithContext = () => {
  const { loginType } = useContext(JWTContext);
  return createMenuItems(loginType || '');
};

// Memoize to prevent unnecessary recalculations
const MemoizedMenuItems = memo(MenuItemsWithContext);

export default MemoizedMenuItems;
