import { APP_PATH_BASE_URL } from 'config';
import axiosInstance from 'utils/axios';

export const chatApi = {
  // Get list of chat users (tutors and admins)
  getUsers: async () => {
    try {
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/chat/allama`);
      // console.log('response :', response.data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  // Get messages with a specific user
  getMessages: async (userId) => {
    try {
      const response = await axiosInstance.get(`/messages/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch messages');
    }
  },

  // Send a message to a user
  sendMessage: async (messageData) => {
    try {
      const response = await axiosInstance.post('/send', messageData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  },

  // Mark messages as read (optional)
  markAsRead: async (messageIds) => {
    try {
      const response = await axiosInstance.post('/read', { messageIds });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark messages as read');
    }
  }
};
