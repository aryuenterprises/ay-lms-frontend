export const ticketsData = [
  {
    id: 1,
    student_id: 'STU001',
    ticketId: 'TKT001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    mobile: '+1 (555) 123-4567',
    status: 'new',
    title: 'Login Issue',
    description: 'Unable to login to my account even with correct credentials. Getting "Invalid Credentials" error.',
    priority: 'High',
    category: 'Account',
    createdAt: '2024-01-15 10:30:00',
    lastUpdated: '2024-01-15 10:30:00',
    assignedTo: null,
    replies: []
  },
  {
    id: 2,
    student_id: 'STU002',
    ticketId: 'TKT002',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    mobile: '+1 (555) 987-6543',
    status: 'processing',
    title: 'Payment Failed',
    description: 'Payment transaction failed multiple times during checkout process.',
    priority: 'Medium',
    category: 'Billing',
    createdAt: '2024-01-14 14:45:00',
    lastUpdated: '2024-01-15 09:15:00',
    assignedTo: 'Admin 1',
    replies: [
      {
        id: 1,
        sender: 'Admin',
        message: 'We are looking into this payment issue. Can you share the transaction ID?',
        timestamp: '2024-01-14 15:30:00'
      },
      {
        id: 2,
        sender: 'Jane Smith',
        message: 'Transaction ID: TXN123456',
        timestamp: '2024-01-14 16:45:00'
      },
      {
        id: 3,
        sender: 'Admin',
        message: 'Thank you. We have processed your refund.',
        timestamp: '2024-01-15 09:15:00'
      }
    ]
  },
  {
    id: 3,
    student_id: 'STU003',
    ticketId: 'TKT003',
    name: 'Robert Johnson',
    email: 'robert.j@example.com',
    mobile: '+1 (555) 456-7890',
    status: 'closed',
    title: 'Refund Request',
    description: 'Requesting refund for duplicate transaction.',
    priority: 'High',
    category: 'Refund',
    createdAt: '2024-01-13 11:20:00',
    lastUpdated: '2024-01-15 14:00:00',
    assignedTo: 'Admin 2',
    replies: [
      {
        id: 1,
        sender: 'Admin',
        message: 'Refund has been processed successfully.',
        timestamp: '2024-01-15 14:00:00'
      }
    ]
  },
  {
    id: 4,
    student_id: 'STU004',
    ticketId: 'TKT004',
    name: 'Sarah Williams',
    email: 'sarah.w@example.com',
    mobile: '+1 (555) 789-0123',
    status: 'new',
    title: 'Feature Request',
    description: 'Would like to request dark mode feature in mobile app.',
    priority: 'Low',
    category: 'Feature',
    createdAt: '2024-01-15 16:45:00',
    lastUpdated: '2024-01-15 16:45:00',
    assignedTo: null,
    replies: []
  },
  {
    id: 5,
    student_id: 'STU005',
    ticketId: 'TKT005',
    name: 'Michael Brown',
    email: 'michael.b@example.com',
    mobile: '+1 (555) 234-5678',
    status: 'processing',
    title: 'Bug Report',
    description: 'App crashes when uploading large files (>100MB).',
    priority: 'High',
    category: 'Bug',
    createdAt: '2024-01-14 09:15:00',
    lastUpdated: '2024-01-15 11:30:00',
    assignedTo: 'Admin 1',
    replies: [
      {
        id: 1,
        sender: 'Admin',
        message: 'We have identified the issue and working on a fix.',
        timestamp: '2024-01-15 11:30:00'
      }
    ]
  },
  {
    id: 6,
    student_id: 'STU006',
    ticketId: 'TKT006',
    name: 'Emily Davis',
    email: 'emily.d@example.com',
    mobile: '+1 (555) 345-6789',
    status: 'new',
    title: 'Password Reset',
    description: 'Forgot password, reset link not working.',
    priority: 'Medium',
    category: 'Account',
    createdAt: '2024-01-15 13:20:00',
    lastUpdated: '2024-01-15 13:20:00',
    assignedTo: null,
    replies: []
  },
  {
    id: 7,
    student_id: 'STU007',
    ticketId: 'TKT007',
    name: 'David Wilson',
    email: 'david.w@example.com',
    mobile: '+1 (555) 456-7891',
    status: 'closed',
    title: 'Account Verification',
    description: 'Email verification link expired.',
    priority: 'Medium',
    category: 'Account',
    createdAt: '2024-01-12 08:45:00',
    lastUpdated: '2024-01-15 10:00:00',
    assignedTo: 'Admin 2',
    replies: [
      {
        id: 1,
        sender: 'Admin',
        message: 'New verification link sent to your email.',
        timestamp: '2024-01-15 10:00:00'
      }
    ]
  },
  {
    id: 8,
    student_id: 'STU008',
    ticketId: 'TKT008',
    name: 'Lisa Anderson',
    email: 'lisa.a@example.com',
    mobile: '+1 (555) 567-8901',
    status: 'processing',
    title: 'Subscription Issue',
    description: 'Auto-renewal not working for premium subscription.',
    priority: 'High',
    category: 'Billing',
    createdAt: '2024-01-15 15:30:00',
    lastUpdated: '2024-01-15 16:45:00',
    assignedTo: 'Admin 1',
    replies: [
      {
        id: 1,
        sender: 'Admin',
        message: 'Checking your subscription details.',
        timestamp: '2024-01-15 16:45:00'
      }
    ]
  },
  {
    id: 9,
    student_id: 'STU009',
    ticketId: 'TKT009',
    name: 'Thomas Miller',
    email: 'thomas.m@example.com',
    mobile: '+1 (555) 678-9012',
    status: 'new',
    title: 'API Access',
    description: 'Need API key for integration with our system.',
    priority: 'Medium',
    category: 'Technical',
    createdAt: '2024-01-15 17:00:00',
    lastUpdated: '2024-01-15 17:00:00',
    assignedTo: null,
    replies: []
  },
  {
    id: 10,
    student_id: 'STU010',
    ticketId: 'TKT010',
    name: 'Amanda Taylor',
    email: 'amanda.t@example.com',
    mobile: '+1 (555) 789-0124',
    status: 'processing',
    title: 'Data Export',
    description: 'Unable to export data in CSV format.',
    priority: 'Low',
    category: 'Technical',
    createdAt: '2024-01-14 12:15:00',
    lastUpdated: '2024-01-15 13:45:00',
    assignedTo: 'Admin 2',
    replies: [
      {
        id: 1,
        sender: 'Admin',
        message: 'The CSV export feature is currently under maintenance.',
        timestamp: '2024-01-15 13:45:00'
      }
    ]
  }
];

export const statusCounts = {
  all: ticketsData.length,
  new: ticketsData.filter((ticket) => ticket.status === 'new').length,
  processing: ticketsData.filter((ticket) => ticket.status === 'processing').length,
  closed: ticketsData.filter((ticket) => ticket.status === 'closed').length
};
