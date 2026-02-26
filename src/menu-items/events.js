import { FormattedMessage } from 'react-intl';
import EventIcon from '@mui/icons-material/Event';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

const events = {
  id: 'Events',
  title: <FormattedMessage id="events" defaultMessage="Events" />,
  type: 'group',
  children: [
    {
      id: 'Events',
      title: <FormattedMessage id="events" defaultMessage="Events" />,
      type: 'item',
      url: '/events',
      icon: EventIcon
    },
    {
      id: 'Webinar',
      title: <FormattedMessage id="webinar" defaultMessage="Webinar" />,
      type: 'item',
      url: '/webinar',
      icon: MeetingRoomIcon
    }
  ]
};

export default events;