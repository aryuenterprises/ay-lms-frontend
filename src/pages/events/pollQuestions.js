// pollQuestions.js
export const pollQuestions = [
  {
    id: 'poll1',
    question: "What's your favorite programming language?",
    options: [
      { text: 'JavaScript', votes: 45 },
      { text: 'Python', votes: 35 },
      { text: 'Java', votes: 20 },
      { text: 'C++', votes: 15 }
    ],
    allowMultiple: false,
    theme: 'blue'
  },
  {
    id: 'poll2',
    question: 'Which frameworks do you use for web development?',
    options: [
      { text: 'React', votes: 60 },
      { text: 'Vue', votes: 25 },
      { text: 'Angular', votes: 30 },
      { text: 'Svelte', votes: 10 }
    ],
    allowMultiple: true,
    theme: 'green'
  },
  {
    id: 'poll3',
    question: 'How many years of experience do you have?',
    options: [
      { text: '0-2 years', votes: 30 },
      { text: '2-5 years', votes: 40 },
      { text: '5-10 years', votes: 20 },
      { text: '10+ years', votes: 10 }
    ],
    allowMultiple: false,
    theme: 'purple'
  }
];

// For initial state (no votes)
export const getInitialPollState = () => {
  return pollQuestions.reduce((acc, poll) => {
    acc[poll.id] = {
      question: poll.question,
      options: poll.options.map((opt) => opt.text),
      userVotes: poll.options.reduce((votes, _, index) => {
        votes[index] = 0;
        return votes;
      }, {}),
      allowMultiple: poll.allowMultiple,
      theme: poll.theme
    };
    return acc;
  }, {});
};
