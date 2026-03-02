import FeedbackIcon from '@mui/icons-material/Feedback';

const Feedback = {
  id: 'feedback',
  title: 'Forms',
  type: 'group',
  children: [
    {
      id: 'webinar-feedback',
      title: 'Feedback',
      type: 'item',
      url: '/webinar/feedback',
      icon: FeedbackIcon
    },
    {
      id: 'forms',
      title: 'Data Forms',
      type: 'item',
      url: '/forms',
      icon: FeedbackIcon
    }
  ]
};

export default Feedback;
