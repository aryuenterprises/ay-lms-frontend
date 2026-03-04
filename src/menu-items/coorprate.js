import CorporateFareRoundedIcon from '@mui/icons-material/CorporateFareRounded';
import GroupIcon from '@mui/icons-material/Group';

const corporate = {
  id: 'corporate',
  title: 'Organization Management',
  type: 'group',
  children: [
    {
      id: 'organizations',
      title: 'Organizations',
      type: 'item',
      url: '/dashboard/corporate/organizations',
      icon: CorporateFareRoundedIcon
    },
    {
      id: 'organization-employees',
      title: 'Employee',
      type: 'item',
      url: '/dashboard/corporate/organization-employees',
      icon: GroupIcon
    }
  ]
};

export default corporate;
