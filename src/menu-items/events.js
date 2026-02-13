// third-party
import { FormattedMessage } from 'react-intl';

// assets
// import { Setting2, Information } from 'iconsax-react';

// icons
import EventIcon from '@mui/icons-material/Event';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

// Get login type from session storage

const getAuth = () => JSON.parse(localStorage.getItem('auth'));
const loginType = getAuth()?.loginType;


// Function to check if user has read permission for a module
const hasReadPermission = () => {
  // Super admin has all permissions
  if (loginType === 'super_admin') return true;
  // For other user types, rely on loginType only
  return false;
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const baseMenuItems = {
  id: 'Events',
  title: <FormattedMessage id="events" defaultMessage="Events" />,
  type: 'group',
  children: [
    {
      id: 'Events',
      title: <FormattedMessage id="events" defaultMessage="Events" />,
      type: 'item',
      url: '/events',
      icon: EventIcon,
      show: loginType === 'super_admin' && hasReadPermission('Events')
    },
    {
      id: 'Webinar',
      title: <FormattedMessage id="webinar" defaultMessage="Webinar" />,
      type: 'item',
      url: '/webinar',
      icon: MeetingRoomIcon,
      show: loginType === 'super_admin' && hasReadPermission('Webinar')
    }
  ]
};

// Filter menu items based on login type
const filteredChildren = baseMenuItems.children.filter((item) => item.show === true || item.show);

// Return null if no children are visible to avoid empty menu groups
const events =
  filteredChildren.length > 0
    ? {
        ...baseMenuItems,
        children: filteredChildren
      }
    : null;

export default events;
