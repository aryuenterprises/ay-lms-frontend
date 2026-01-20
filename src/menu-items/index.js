// project-imports
import widget from './widget';
import user from './user';
import course from './course';
// import category from './category';
import roles from './roles';
import logs from './logs';
import reports from './reports';
// import payment from './payment';
// import cms from './cms';
import settings from './settings';
import support from './supports';
import events from './events';

// ==============================|| MENU ITEMS ||============================== //

// Define menu items for each login type
const menuItemsByRole = {
  super_admin: [widget, user, course, reports, roles, events, settings, logs],
  admin: [widget, user, course, reports, roles, settings, logs],
  tutor: [widget, user, course, logs],
  student: [widget, user, course, support, logs],
  employer: [widget, user, logs]
};

// Get loginType from sessionStorage or localStorage
const auth = JSON.parse(localStorage.getItem('auth'));
let loginType = auth?.loginType;
if (!loginType) {
  // console.error('loginType is missing from both sessionStorage and localStorage');
  // window.location.reload();
}

// Set the items array based on the loginType
const items = menuItemsByRole[loginType] || [widget]; // Fallback to basic widget if loginType is invalid

// Define the menu items object
const menuItems = {
  items
};

export default menuItems;
