// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Story, Fatrows, PresentionChart, HomeTrendUp } from 'iconsax-react';

// icons
const icons = {
  widgets: Story,
  statistics: Story,
  data: Fatrows,
  chart: PresentionChart,
  dashboard: HomeTrendUp
};

// ==============================|| MENU ITEMS - WIDGETS ||============================== //

const dashboard = {
  id: 'dashboard',
  title: <FormattedMessage id="dashboard" />,
  icon: icons.widgets,
  type: 'group',
  children: [
    {
      id: 'Dashboard',
      title: <FormattedMessage id="dashboard" />,
      type: 'item',
      url: '/dashboard',
      icon: icons.dashboard
    }
  ]
};

export default dashboard;
