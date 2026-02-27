// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Profile, DocumentCode2, Note1, OceanProtocol, Level, ShieldCross, Home3, I24Support, Driving } from 'iconsax-react';

// icons
const icons = {
  userIcon: Profile,
  Note1: Note1,
  samplePage: DocumentCode2,
  menuLevel: OceanProtocol,
  menuLevelSubtitle: Level,
  disabledMenu: ShieldCross,
  chipMenu: Home3,
  documentation: I24Support,
  roadmap: Driving
};

// Get login type from session storage
const auth = JSON.parse(localStorage.getItem('auth'));
const loginType = auth?.user?.user_type;
const permissions = auth?.user?.permissions || [];
const attendanceType = auth?.user?.attendance_type; // 'manual_attendance' | 'automatic_attendance'

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

const hasAttendancePermission = () => {
  const hasReadPermission = permissions.some((p) => p.module_name === 'Attendance' && p.allowed_actions.includes('read'));

  return hasReadPermission && attendanceType === 'manual_attendance';
};

// Base menu items
const baseMenuItems = {
  id: 'user-management',
  title: <FormattedMessage id="user-management" defaultMessage="User Management" />,
  type: 'group',
  children: [
    {
      id: 'profile',
      title: <FormattedMessage id="profile" defaultMessage="User Profile" />,
      type: 'item',
      url: '/user/personal',
      icon: icons.userIcon,
      show: ['student', 'tutor'].includes(loginType)
    },
    {
      id: 'attendance',
      title: <FormattedMessage id="attendance" defaultMessage="Attendance" />,
      type: 'item',
      url: '/attendance',
      icon: icons.samplePage,
      show: ['student', 'tutor', 'admin'].includes(loginType) && hasAttendancePermission()
    },

    {
      id: 'admin-list',
      title: <FormattedMessage id="admin-list" defaultMessage="Admins" />,
      type: 'item',
      url: '/admins',
      icon: icons.userIcon,
      show: (loginType === 'admin' || loginType === 'super_admin') && hasReadPermission('Admins')
    },
    {
      id: 'tutor-list',
      title: <FormattedMessage id="tutor-list" defaultMessage="Tutors" />,
      type: 'item',
      url: '/tutors',
      icon: icons.userIcon,
      show: (loginType === 'admin' || loginType === 'super_admin') && hasReadPermission('Tutors')
    },
    {
      id: 'student-list',
      title: <FormattedMessage id="student-list" defaultMessage="Students" />,
      type: 'item',
      url: '/students',
      icon: icons.userIcon,
      show: ['super_admin', 'admin', 'employer', 'tutor'].includes(loginType) && (loginType !== 'admin' || hasReadPermission('Students'))
    },

    {
      id: 'batch-list',
      title: <FormattedMessage id="batch-list" defaultMessage="Batch" />,
      type: 'item',
      url: '/batch',
      icon: icons.roadmap,
      show:
        ((loginType === 'admin' || loginType === 'super_admin') && hasReadPermission('Batch')) ||
        loginType === 'tutor' ||
        loginType === 'student'
    }
    // {
    //   id: 'enquery-list',
    //   title: <FormattedMessage id="enquery-list" defaultMessage="Enquery List" />,
    //   type: 'item',
    //   url: '/enquery-list',
    //   icon: icons.roadmap,
    //   show: loginType === 'super_admin'
    // }
  ]
};

// Filter menu items based on login type
const filteredChildren = baseMenuItems.children.filter((item) => item.show === true || item.show);

// Return null if no children are visible to avoid empty menu groups
const user =
  filteredChildren.length > 0
    ? {
        ...baseMenuItems,
        children: filteredChildren
      }
    : null;

export default user;
