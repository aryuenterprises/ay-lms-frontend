// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { KyberNetwork, Messages2, Calendar1, Kanban, Profile2User, Bill, UserSquare, ShoppingBag } from 'iconsax-react';

// icons
const icons = {
  applications: KyberNetwork,
  chat: Messages2,
  calendar: Calendar1,
  kanban: Kanban,
  customer: Profile2User,
  invoice: Bill,
  profile: UserSquare,
  ecommerce: ShoppingBag
};

// ==============================|| MENU ITEMS - APPLICATIONS ||============================== //

const payment = {
  id: 'payment',
  title: <FormattedMessage id="payment" defaultMessage="Payment" />,
  icon: icons.applications,
  type: 'group',
  children: [
    {
      id: 'invoice',
      title: <FormattedMessage id="invoice" defaultMessage="Invoice" />,
      type: 'item',
      url: '/invoice',
      icon: icons.chat
    }
    // {
    //   id: 'invoice-design',
    //   title: <FormattedMessage id="invoice-design" defaultMessage="Invoice Design" />,
    //   type: 'item',
    //   url: '/invoice-design',
    //   icon: icons.chat
    // }
  ]
};

export default payment;
