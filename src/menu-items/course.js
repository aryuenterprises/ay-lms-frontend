// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Note1, DocumentCode2,Driving} from 'iconsax-react';

// icons
const icons = {
  Note1: Note1,
  samplePage: DocumentCode2,
  roadmap: Driving
};

// Get login type from session storage
const auth = JSON.parse(localStorage.getItem('auth'));
const loginType = auth?.user?.user_type;
const permissions = auth?.user?.permissions || [];

// Function to check if user has read permission for a module
const hasReadPermission = (moduleName) => {
  // Super admin has all permissions
  if (loginType === 'super_admin') return true;
  
  // ✅ All other users check their permissions array
  return permissions.some(
    (permission) =>
      permission.module_name === moduleName &&
      permission.allowed_actions.includes('read')
  );
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const baseMenuItems = {
  id: 'course',
  title: <FormattedMessage id="course" defaultMessage="Course Management" />,
  type: 'group',
  children: [
  {
    id: 'category',
    title: <FormattedMessage id="category" defaultMessage="Category" />,
    type: 'item',
    url: '/category',
    icon: icons.samplePage,
    show: hasReadPermission('Category')  // ✅ super_admin auto passes, others check permission
  },
  {
    id: 'course',
    title: <FormattedMessage id="course" defaultMessage="Course" />,
    type: 'item',
    url: '/course',
    icon: icons.Note1,
    show: hasReadPermission('Course')
  },
  {
    id: 'batch-list',
    title: <FormattedMessage id="batch-list" defaultMessage="Batch" />,
    type: 'item',
    url: '/batch',
    icon: icons.roadmap,
    show: hasReadPermission('Batch')
  },
  {
    id: 'schedule',
    title: <FormattedMessage id="schedule" defaultMessage="Schedule" />,
    type: 'item',
    url: '/schedule',
    icon: icons.samplePage,
    show: hasReadPermission('Schedule')
  },
  {
    id: 'assessment',
    title: <FormattedMessage id="assessment" defaultMessage="Assessment" />,
    type: 'item',
    url: '/assessment',
    icon: icons.samplePage,
    show: hasReadPermission('Assessment')
  }
]
};

// Filter menu items based on login type
const filteredChildren = baseMenuItems.children.filter((item) => item.show === true || item.show);

// Return null if no children are visible to avoid empty menu groups
const course =
  filteredChildren.length > 0
    ? {
        ...baseMenuItems,
        children: filteredChildren
      }
    : null;

export default course;
