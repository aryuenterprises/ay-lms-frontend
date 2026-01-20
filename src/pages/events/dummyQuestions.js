// dummyQuestions.js
export const DUMMY_QUESTIONS = [
  {
    id: 1,
    questionTitle: 'Is React a JavaScript library?',
    questionType: 'radio',
    mark: 2,
    questionTime: 15,
    correctAnswer: 'Yes',
    options: ['Yes', 'No'],
    difficulty: 'Easy'
  },
  {
    id: 2,
    questionTitle: 'Which of these is a JavaScript framework?',
    questionType: 'radio',
    mark: 2,
    questionTime: 15,
    correctAnswer: 'React',
    options: ['React', 'Django', 'Laravel', 'Spring'],
    difficulty: 'Medium'
  },
  {
    id: 3,
    questionTitle: 'What does JSX stand for?',
    questionType: 'radio',
    mark: 2,
    questionTime: 15,
    correctAnswer: 'JavaScript XML',
    options: ['JavaScript XML', 'Java Syntax Extension', 'JavaScript Extension', 'JSON XML'],
    difficulty: 'Hard'
  },
  {
    id: 4,
    questionTitle: 'What is the virtual DOM?',
    questionType: 'radio',
    mark: 2,
    questionTime: 15,
    correctAnswer: 'A lightweight copy of the real DOM',
    options: ['A lightweight copy of the real DOM', 'A type of database', 'A browser extension', 'A server-side technology'],
    difficulty: 'Medium'
  },
  {
    id: 5,
    questionTitle: 'Which React hook is used for state management?',
    questionType: 'radio',
    mark: 2,
    questionTime: 15,
    correctAnswer: 'useState',
    options: ['useState', 'useEffect', 'useContext', 'useMemo'],
    difficulty: 'Medium'
  },
  {
    id: 6,
    questionTitle: 'What company developed React?',
    questionType: 'radio',
    mark: 2,
    questionTime: 15,
    correctAnswer: 'Facebook',
    options: ['Facebook', 'Google', 'Microsoft', 'Amazon'],
    difficulty: 'Easy'
  },
  {
    id: 7,
    questionTitle: 'Can React be used for mobile app development?',
    questionType: 'radio',
    mark: 2,
    questionTime: 15,
    correctAnswer: 'Yes, with React Native',
    options: ['Yes, with React Native', 'No, only for web', 'Yes, with Flutter', 'No, only desktop'],
    difficulty: 'Easy'
  },
  {
    id: 8,
    questionTitle: 'Which is NOT a valid lifecycle method in React class components?',
    questionType: 'radio',
    mark: 2,
    questionTime: 15,
    correctAnswer: 'useEffect',
    options: ['componentDidMount', 'componentDidUpdate', 'componentWillUnmount', 'useEffect'],
    difficulty: 'Hard'
  },
  {
    id: 9,
    questionTitle: 'What is the purpose of useEffect hook?',
    questionType: 'radio',
    mark: 2,
    questionTime: 15,
    correctAnswer: 'To perform side effects in function components',
    options: ['To perform side effects in function components', 'To create state variables', 'To optimize performance', 'To handle forms'],
    difficulty: 'Medium'
  },
  {
    id: 10,
    questionTitle: 'What is Redux used for in React?',
    questionType: 'radio',
    mark: 2,
    questionTime: 15,
    correctAnswer: 'State management',
    options: ['State management', 'Routing', 'API calls', 'Styling'],
    difficulty: 'Hard'
  }
];

export const DUMMY_QUIZ_INFO = {
  quizTitle: 'React Fundamentals Quiz',
  totalQuestions: 10,
  totalMarks: 20,
  totalTime: 150, // seconds (sum of all question times)
  passingScore: 10,
  instructions: [
    'Answer all questions',
    'Each question has a time limit',
    'Radio questions: Select one correct option',
    'Checkbox questions: Select one correct option',
    'Score will be calculated automatically',
    'Time will automatically move to next question'
  ]
};

// Combined questions for easy use
export const ALL_DUMMY_QUESTIONS = [...DUMMY_QUESTIONS];
