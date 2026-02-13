// src/api/chatApi.mock.js
// Mock implementation for development
export const chatApiMock = {
  getUsers: async () => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return [
      {
        id: 1,
        name: 'John Tutor',
        role: 'Mathematics Tutor',
        avatar: '/assets/images/users/avatar-1.jpg',
        online: true,
        unreadCount: 3
      },
      {
        id: 2,
        name: 'Sarah Admin',
        role: 'System Administrator',
        avatar: '/assets/images/users/avatar-2.jpg',
        online: false,
        unreadCount: 0
      },
      {
        id: 3,
        name: 'Dr. Smith',
        role: 'Science Tutor',
        avatar: '/assets/images/users/avatar-3.jpg',
        online: true,
        unreadCount: 1
      }
    ];
  },

  getMessages: async (userId) => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const messages = {
      1: [
        {
          id: 1,
          senderId: 1,
          content: 'Hello! How can I help you with your math problems?',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 2,
          senderId: 0, // Current user
          content: "I'm having trouble with calculus problems.",
          timestamp: new Date(Date.now() - 3500000).toISOString()
        },
        {
          id: 3,
          senderId: 1,
          content: 'Which specific concepts are challenging?',
          timestamp: new Date(Date.now() - 3400000).toISOString()
        }
      ],
      2: [
        {
          id: 4,
          senderId: 2,
          content: 'Hello! This is the admin support.',
          timestamp: new Date(Date.now() - 86400000).toISOString()
        }
      ],
      3: [
        {
          id: 5,
          senderId: 3,
          content: 'Hi there! Ready for our science session?',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ]
    };

    return messages[userId] || [];
  },

  sendMessage: async (messageData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      id: Date.now(),
      senderId: 0, // Current user
      content: messageData.content,
      timestamp: new Date().toISOString()
    };
  }
};

// Use mock API in development
export const chatApi = process.env.NODE_ENV === 'development' ? chatApiMock : chatApi;
