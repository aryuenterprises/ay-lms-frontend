const initialUsers = [
  { id: 1, name: 'Alex Johnson', points: 1850, previousPosition: 2, avatarColor: '#00bcd4', streak: 5 },
  { id: 2, name: 'Sam Wilson', points: 1920, previousPosition: 1, avatarColor: '#4caf50', streak: 3 },
  { id: 3, name: 'Taylor Swift', points: 1780, previousPosition: 3, avatarColor: '#9c27b0', streak: 7 },
  { id: 4, name: 'Jordan Lee', points: 1680, previousPosition: 5, avatarColor: '#ff9800', streak: 2 },
  { id: 5, name: 'Casey Kim', points: 1750, previousPosition: 4, avatarColor: '#f44336', streak: 4 },
  { id: 6, name: 'Morgan Patel', points: 1590, previousPosition: 6, avatarColor: '#2196f3', streak: 1 },
  { id: 7, name: 'Riley Chen', points: 1520, previousPosition: 8, avatarColor: '#ff5722', streak: 6 },
  { id: 8, name: 'Drew Garcia', points: 1450, previousPosition: 7, avatarColor: '#673ab7', streak: 0 },
  { id: 9, name: 'Jamie Smith', points: 1380, previousPosition: 9, avatarColor: '#009688', streak: 2 },
  { id: 10, name: 'Robin Wang', points: 1310, previousPosition: 10, avatarColor: '#795548', streak: 1 },
  { id: 11, name: 'Kai Martinez', points: 1250, previousPosition: 11, avatarColor: '#3f51b5', streak: 8 },
  { id: 12, name: 'Skylar Brown', points: 1180, previousPosition: 12, avatarColor: '#ff4081', streak: 3 },
  { id: 13, name: 'Blake Miller', points: 1120, previousPosition: 13, avatarColor: '#00bcd4', streak: 5 },
  { id: 14, name: 'Quinn Davis', points: 1080, previousPosition: 14, avatarColor: '#8bc34a', streak: 2 },
  { id: 15, name: 'River Taylor', points: 1020, previousPosition: 15, avatarColor: '#e91e63', streak: 4 },
  { id: 16, name: 'Phoenix Anderson', points: 980, previousPosition: 16, avatarColor: '#ffc107', streak: 7 },
  { id: 17, name: 'Sage Thomas', points: 940, previousPosition: 17, avatarColor: '#9c27b0', streak: 1 },
  { id: 18, name: 'Avery Jackson', points: 890, previousPosition: 18, avatarColor: '#4caf50', streak: 3 },
  { id: 19, name: 'Rowan White', points: 850, previousPosition: 19, avatarColor: '#f44336', streak: 6 },
  { id: 20, name: 'Elliot Harris', points: 810, previousPosition: 20, avatarColor: '#2196f3', streak: 2 },
  { id: 21, name: 'Finley Martin', points: 770, previousPosition: 21, avatarColor: '#ff9800', streak: 4 },
  { id: 22, name: 'Hayden Thompson', points: 730, previousPosition: 22, avatarColor: '#795548', streak: 1 },
  { id: 23, name: 'Remy Garcia', points: 690, previousPosition: 23, avatarColor: '#009688', streak: 5 },
  { id: 24, name: 'Justice Martinez', points: 650, previousPosition: 24, avatarColor: '#673ab7', streak: 3 },
  { id: 25, name: 'Dakota Robinson', points: 610, previousPosition: 25, avatarColor: '#ff5722', streak: 2 },
  { id: 26, name: 'Arden Clark', points: 570, previousPosition: 26, avatarColor: '#3f51b5', streak: 0 },
  { id: 27, name: 'Emerson Lewis', points: 530, previousPosition: 27, avatarColor: '#ff4081', streak: 1 },
  { id: 28, name: 'Shiloh Walker', points: 490, previousPosition: 28, avatarColor: '#00bcd4', streak: 3 },
  { id: 29, name: 'Finch Hall', points: 450, previousPosition: 29, avatarColor: '#8bc34a', streak: 2 },
  { id: 30, name: 'Lennox Allen', points: 410, previousPosition: 30, avatarColor: '#e91e63', streak: 4 }
];

// Helper function to generate mock data
export const fetchUserData = async () => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Add some randomness to points for variation
  return initialUsers.map((user) => ({
    ...user,
    points: user.points + Math.floor(Math.random() * 500) - 50
  }));
};

// Helper function to get leaderboard stats
export const getLeaderboardStats = (users = initialUsers) => {
  if (!users.length) {
    return {
      totalParticipants: 0,
      highestScore: 0,
      averageScore: 0
    };
  }

  const totalPoints = users.reduce((sum, user) => sum + user.points, 0);
  const highestScore = Math.max(...users.map((user) => user.points));
  const averageScore = Math.round(totalPoints / users.length);

  return {
    totalParticipants: users.length,
    highestScore,
    averageScore
  };
};
