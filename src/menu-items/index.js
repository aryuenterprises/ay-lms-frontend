import widget from './widget';
import user from './user';
import coorprate from './coorprate';
import course from './course';
import feedback from './feedback';
import roles from './roles';
import logs from './logs';
import reports from './reports';
import settings from './settings';
import support from './supports';
import events from './events';

// import { CognitoUserSession } from 'amazon-cognito-identity-js';

// ==============================|| MENU ITEMS ||============================== //
// Define menu items for each login type


// Get loginType from sessionStorage or localStorage
const auth = JSON.parse(localStorage.getItem('auth'));

let items = [widget];

if (auth?.user?.user_type === 'super_admin') {
  items = [
    widget,
    user,
    coorprate,
    course,
    reports,
    roles,
    events,
    feedback,
    settings,
    logs,
    support
  ];
} else if (auth?.user?.permissions) {
  const allowedModules = auth.user.permissions
    .filter((perm) => perm.allowed_actions.includes('read'))
    .map((perm) => perm.module_name);

  // Special handling for Events group
  if (allowedModules.includes('Webinar') || allowedModules.includes('Events')) {
    const filteredChildren = events.children.filter((child) =>
      allowedModules.includes(child.id)
    );

    if (filteredChildren.length > 0) {
      items.push({
        ...events,
        children: filteredChildren
      });
    }
  }

  // Add other modules normally
  const moduleMenuMap = {
    Tutors: user,
    Organizations: coorprate,
    Students: user,
    Course: course,
    Reports: reports,
    Roles: roles,
    Feedback: feedback,
    Settings: settings,
    Logs: logs,
    Support: support
  };

  const otherMenus = allowedModules
    .filter((name) => moduleMenuMap[name])
    .map((name) => moduleMenuMap[name]);

  items = [widget, ...items.slice(1), ...otherMenus];
}

const menuItems = { items };

export default menuItems;