// dummyData.js
export const dummyStudentsMap = [
  { student_id: 'STU001', student_name: 'rajesh kumar' },
  { student_id: 'STU002', student_name: 'priya sharma' },
  { student_id: 'STU003', student_name: 'amit patel' },
  { student_id: 'STU004', student_name: 'sneha verma' },
  { student_id: 'STU005', student_name: 'vivek singh' },
  { student_id: 'STU006', student_name: 'neha gupta' },
  { student_id: 'STU007', student_name: 'rohan mehta' },
  { student_id: 'STU008', student_name: 'anjali desai' },
  { student_id: 'STU009', student_name: 'sanjay jain' },
  { student_id: 'STU010', student_name: 'pooja reddy' }
];

export const dummyStudentsData = [
  {
    student_id: 'STU001',
    student_name: 'rajesh kumar',
    course_name: 'Full Stack Development',
    total_amount: 50000,
    total_paid: 35000,
    registration_date: '2024-01-15',
    email: 'rajesh.kumar@email.com',
    phone: '9876543210',
    address: '123 MG Road, Bangalore'
  },
  {
    student_id: 'STU002',
    student_name: 'priya sharma',
    course_name: 'Data Science',
    total_amount: 75000,
    total_paid: 75000,
    registration_date: '2024-02-20',
    email: 'priya.sharma@email.com',
    phone: '9876543211',
    address: '456 Koramangala, Bangalore'
  },
  {
    student_id: 'STU003',
    student_name: 'amit patel',
    course_name: 'Android Development',
    total_amount: 45000,
    total_paid: 20000,
    registration_date: '2024-03-10',
    email: 'amit.patel@email.com',
    phone: '9876543212',
    address: '789 Indiranagar, Bangalore'
  },
  {
    student_id: 'STU004',
    student_name: 'sneha verma',
    course_name: 'UI/UX Design',
    total_amount: 40000,
    total_paid: 40000,
    registration_date: '2024-01-25',
    email: 'sneha.verma@email.com',
    phone: '9876543213',
    address: '321 Jayanagar, Bangalore'
  },
  {
    student_id: 'STU005',
    student_name: 'vivek singh',
    course_name: 'Cloud Computing',
    total_amount: 60000,
    total_paid: 30000,
    registration_date: '2024-02-15',
    email: 'vivek.singh@email.com',
    phone: '9876543214',
    address: '654 Whitefield, Bangalore'
  }
];

export const dummyPaymentDetails = {
  STU001: [
    {
      payment_id: 'PAY001',
      payment_date: '2024-01-15',
      amount: 20000,
      payment_type: 'Initial Payment',
      status: 'completed',
      transaction_id: 'TXN001234'
    },
    {
      payment_id: 'PAY002',
      payment_date: '2024-02-15',
      amount: 15000,
      payment_type: 'Installment',
      status: 'completed',
      transaction_id: 'TXN001235'
    },
    {
      payment_id: 'PAY003',
      payment_date: '2024-03-15',
      amount: 10000,
      payment_type: 'Installment',
      status: 'pending',
      transaction_id: 'TXN001236'
    }
  ],
  STU002: [
    {
      payment_id: 'PAY004',
      payment_date: '2024-02-20',
      amount: 30000,
      payment_type: 'Initial Payment',
      status: 'completed',
      transaction_id: 'TXN001237'
    },
    {
      payment_id: 'PAY005',
      payment_date: '2024-03-20',
      amount: 25000,
      payment_type: 'Installment',
      status: 'completed',
      transaction_id: 'TXN001238'
    },
    {
      payment_id: 'PAY006',
      payment_date: '2024-04-20',
      amount: 20000,
      payment_type: 'Installment',
      status: 'completed',
      transaction_id: 'TXN001239'
    }
  ],
  STU003: [
    {
      payment_id: 'PAY007',
      payment_date: '2024-03-10',
      amount: 20000,
      payment_type: 'Initial Payment',
      status: 'completed',
      transaction_id: 'TXN001240'
    },
    {
      payment_id: 'PAY008',
      payment_date: '2024-04-10',
      amount: 15000,
      payment_type: 'Installment',
      status: 'pending',
      transaction_id: 'TXN001241'
    }
  ],
  STU004: [
    {
      payment_id: 'PAY009',
      payment_date: '2024-01-25',
      amount: 20000,
      payment_type: 'Initial Payment',
      status: 'completed',
      transaction_id: 'TXN001242'
    },
    {
      payment_id: 'PAY010',
      payment_date: '2024-02-25',
      amount: 20000,
      payment_type: 'Final Payment',
      status: 'completed',
      transaction_id: 'TXN001243'
    }
  ],
  STU005: [
    {
      payment_id: 'PAY011',
      payment_date: '2024-02-15',
      amount: 30000,
      payment_type: 'Initial Payment',
      status: 'completed',
      transaction_id: 'TXN001244'
    },
    {
      payment_id: 'PAY012',
      payment_date: '2024-03-15',
      amount: 20000,
      payment_type: 'Installment',
      status: 'pending',
      transaction_id: 'TXN001245'
    }
  ]
};

// Additional courses data
export const dummyCourses = [
  { course_id: 'COURSE001', course_name: 'Full Stack Development', duration: '6 months', fee: 50000 },
  { course_id: 'COURSE002', course_name: 'Data Science', duration: '8 months', fee: 75000 },
  { course_id: 'COURSE003', course_name: 'Android Development', duration: '5 months', fee: 45000 },
  { course_id: 'COURSE004', course_name: 'UI/UX Design', duration: '4 months', fee: 40000 },
  { course_id: 'COURSE005', course_name: 'Cloud Computing', duration: '6 months', fee: 60000 },
  { course_id: 'COURSE006', course_name: 'Cyber Security', duration: '7 months', fee: 55000 },
  { course_id: 'COURSE007', course_name: 'Digital Marketing', duration: '3 months', fee: 35000 }
];
