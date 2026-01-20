// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { DocumentCode2, OceanProtocol, Level, ShieldCross, InfoCircle, I24Support, Driving } from 'iconsax-react';

// icons
const icons = {
  samplePage: DocumentCode2,
  menuLevel: OceanProtocol,
  menuLevelSubtitle: Level,
  disabledMenu: ShieldCross,
  chipMenu: InfoCircle,
  documentation: I24Support,
  roadmap: Driving
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const cms = {
  id: 'cms',
  title: <FormattedMessage id="cms" defaultMessage="CMS" />,
  type: 'group',
  children: [
    {
      id: 'cms',
      title: <FormattedMessage id="cms" defaultMessage="CMS" />,
      type: 'item',
      url: '/cms',
      icon: icons.samplePage
    }
  ]
};

export default cms;
