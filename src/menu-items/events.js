import { FormattedMessage } from 'react-intl';

import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import AssignmentIcon from '@mui/icons-material/Assignment';

/* ---------------- ICONS ---------------- */

const icons = {
  events: EventAvailableIcon,
  webinar: VideoCameraFrontIcon,
  forms: AssignmentIcon
};

/* ---------------- MENU CONFIG ---------------- */

const events = {
  id: 'events-group',
  title: <FormattedMessage id="events" defaultMessage="Events" />,
  type: 'group',
  children: [
    {
      id: 'events',
      title: <FormattedMessage id="events" defaultMessage="Events" />,
      type: 'item',
      url: '/events',
      icon: icons.events
    },
    {
      id: 'webinar',
      title: <FormattedMessage id="webinar" defaultMessage="Webinar" />,
      type: 'item',
      url: '/webinar',
      icon: icons.webinar
    },
    {
      id: 'forms',
      title: 'Data Forms',
      type: 'item',
      url: '/forms',
      icon: icons.forms
    }
  ]
};

export default events;