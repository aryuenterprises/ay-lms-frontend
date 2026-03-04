// project-imports
// import widget from './widget';
// import user from './user';
// import coorprate from './coorprate';
// import course from './course';
// import feedback from './feedback';
// // import category from './category';
// import roles from './roles';
// import logs from './logs';
// import reports from './reports';
// // import payment from './payment';
// // import cms from './cms';
// import settings from './settings';
// import support from './supports';
// import events from './events';
// // import { CognitoUserSession } from 'amazon-cognito-identity-js';

// // ==============================|| MENU ITEMS ||============================== //

// // Define menu items for each login type
// const menuItemsByRole = {
//   super_admin: [widget, user, coorprate, course,reports, roles, events, feedback, settings, logs],
//   // super_admin: [widget, user, course,reports, roles, events, settings, logs],
//   // admin: [widget, user, course, reports, roles, settings, logs],


//   admin: [
//     widget,
//     user, 
//     coorprate,
//     course,
//      reports,
//      roles,
//      feedback,
//      settings, 
//      logs],
//   tutor: [widget, user, course, logs],
//   student: [widget, user,feedback, course, support, logs],
//   employer: [widget, user,feedback, logs]
// };

// // Get loginType from sessionStorage or localStorage
// const auth = JSON.parse(localStorage.getItem('auth'));
// let loginType = auth?.loginType;
// if (!loginType) {
//   // console.error('loginType is missing from both sessionStorage and localStorage');
//   // window.location.reload();
// }

// // Set the items array based on the loginType
// const items = menuItemsByRole[loginType] || [widget]; // Fallback to basic widget if loginType is invalid

// // Define the menu items object
// const menuItems = {
//   items
// };

// export default menuItems;


// project-imports
import widget from './widget';
import user from './user';
import coorprate from './coorprate';
import course from './course';
import roles from './roles';
import logs from './logs';
import reports from './reports';
import settings from './settings';
import support from './supports';
import events from './events';


// Get loginType from sessionStorage or localStorage
const auth = JSON.parse(localStorage.getItem('auth'));

let items = [widget];

if (auth?.user?.user_type === 'super_admin') {
  items = [
    widget,
    user,
    coorprate,
    course,
    events,
    reports,
    logs,
    settings,
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
    Attendance: user,
    Course: course,
    Reports: reports,
    Ticket: support,
    Logs: logs,
    Schedule: course,
    Roles: roles,
    Settings: settings,
    Support: support
  };

  const otherMenus = allowedModules
    .filter((name) => moduleMenuMap[name])
    .map((name) => moduleMenuMap[name]);

  items = [widget, ...items.slice(1), ...otherMenus];
}

const menuItems = { items };

export default menuItems;
