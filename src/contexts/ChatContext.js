import React, { createContext, useContext, useReducer, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from 'utils/axios';
import { APP_PATH_BASE_URL } from 'config';

const ChatContext = createContext();


const initialState = {
  isChatOpen: false,
  rooms: [],
  users: [],
  messages: [],
  openChats: [],
  loadingUsers: false,
  loadingMessages: false,
  sendingMessage: false,
  searchTerm: '',
  error: null,
  isConnected: false,
  isAddingContactPage: false,
  selectedFiles: [],
  showAudioRecorder: false,
  audioBlob: null,
  showEmojiPicker: false
};

function chatReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_CHAT':
      return { ...state, isChatOpen: !state.isChatOpen };
    case 'OPEN_CHAT':
      return { ...state, isChatOpen: true };
    case 'CLOSE_CHAT':
      return {
        ...state,
        isChatOpen: false,
        selectedUser: null,
        messages: [],
        searchTerm: '',
        isAddingContactPage: false
      };
    case 'OPEN_CHAT_WINDOW':
      return {
        ...state,
        openChats: state.openChats.some((c) => c.id === action.payload.id) ? state.openChats : [...state.openChats, action.payload]
      };

    case 'CLOSE_CHAT_WINDOW':
      return {
        ...state,
        openChats: state.openChats.filter((c) => c.id !== action.payload)
      };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_ROOMS':
      return { ...state, rooms: action.payload };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_LOADING_USERS':
      return { ...state, loadingUsers: action.payload };
    case 'SET_LOADING_MESSAGES':
      return { ...state, loadingMessages: action.payload };
    case 'SET_SENDING_MESSAGE':
      return { ...state, sendingMessage: action.payload };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload };
    case 'SET_ADDING_CONTACT_PAGE':
      return { ...state, isAddingContactPage: action.payload };
    case 'SET_SELECTED_FILES':
      return { ...state, selectedFiles: action.payload };
    case 'ADD_SELECTED_FILES':
      return { ...state, selectedFiles: [...state.selectedFiles, ...action.payload] };
    case 'REMOVE_SELECTED_FILE':
      return {
        ...state,
        selectedFiles: state.selectedFiles.filter((_, i) => i !== action.payload)
      };
    case 'SET_AUDIO_BLOB':
      return { ...state, audioBlob: action.payload };
    case 'SET_SHOW_AUDIO_RECORDER':
      return { ...state, showAudioRecorder: action.payload };
    case 'SET_SHOW_EMOJI_PICKER':
      return { ...state, showEmojiPicker: action.payload };
    case 'SET_NEW_MESSAGE':
      return { ...state, newMessage: action.payload };
    case 'RESET_MESSAGE_STATE':
      return {
        ...state,
        newMessage: '',
        selectedFiles: [],
        audioBlob: null
      };
    default:
      return state;
  }
}

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const ws = useRef(null);
  const hasFetchedUsers = useRef(false);
  const auth = JSON.parse(localStorage.getItem('auth'));
  const senderId = auth?.user?.registration_id || auth?.user?.employee_id || auth?.user?.user_id;
  const senderType = auth?.loginType;
  const RegId = senderId;

  // Setup WebSocket connection
  const setupWebSocket = useCallback((roomId) => {
    if (!roomId) return;

    // Close existing connection if any
    if (ws.current) {
      ws.current.close();
    }

    const socketUrl = `wss://aylms.aryuprojects.com/ws/chat/${roomId}/`;
    ws.current = new WebSocket(socketUrl);

    ws.current.onopen = () => {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat_message') {
          dispatch({ type: 'ADD_MESSAGE', payload: data.message });
        } else if (data.type === 'message_history') {
          dispatch({ type: 'SET_MESSAGES', payload: data.messages || [] });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.current.onerror = () => {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
      dispatch({ type: 'SET_ERROR', payload: 'WebSocket connection error' });
    };

    ws.current.onclose = () => {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
    };
  }, []);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // Load users when chat opens
  const loadUsers = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING_USERS', payload: true });
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/chat/allama`);

      let userList = [];
      let rooms = [];

      if (senderType === 'tutor') {
        userList =
          response.data.assigned_students?.map((user) => ({
            id: user.student_id,
            name: user.student_name,
            type: user.type,
            image: user.profile_pic,
            unreadcount: user.unread_count
          })) || [];

        rooms =
          response.data.chat_rooms?.map((user) => ({
            id: user.id,
            name: user.student_name,
            type: user.type,
            image: user.student_profile_pic,
            unreadcount: user.unread_count,
            lastMessage: user.last_message?.content,
            lastMessageDate: user.last_message?.created_at
          })) || [];
      } else {
        userList =
          response.data.assigned_trainers?.map((user) => ({
            id: user.trainer?.employee_id,
            name: user.trainer?.full_name,
            type: user.type,
            image: user.trainer?.profile_pic,
            unreadcount: user.unread_count
          })) || [];

        rooms =
          response.data.chat_rooms?.map((user) => ({
            id: user.id,
            userId: user.trainer,
            name: user.trainer_name,
            type: user.type,
            image: user.trainer_profile_pic,
            unreadcount: user.unread_count,
            lastMessage: user.last_message?.content
          })) || [];
      }

      dispatch({ type: 'SET_USERS', payload: userList });
      dispatch({ type: 'SET_ROOMS', payload: rooms });
      hasFetchedUsers.current = true;
      dispatch({ type: 'SET_LOADING_USERS', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to load users' });
      dispatch({ type: 'SET_LOADING_USERS', payload: false });
    }
  }, [senderType]);

  const fetchMessages = useCallback(async (roomId) => {
    dispatch({ type: 'SET_LOADING_MESSAGES', payload: true });
    try {
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/chat/rooms/${roomId}/euybfvh`);
      dispatch({ type: 'SET_MESSAGES', payload: response.data.data || [] });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to load messages' });
      dispatch({ type: 'SET_MESSAGES', payload: [] });
    } finally {
      dispatch({ type: 'SET_LOADING_MESSAGES', payload: false });
    }
  }, []);

  const markAsRead = useCallback(
    async (roomId) => {
      try {
        await axiosInstance.post(`${APP_PATH_BASE_URL}api/chat/gcjkhby/${roomId}/ywvdajhb`, {
          reader_type: senderType,
          reader_id: senderId
        });
        await loadUsers(); // Refresh user list to update unread counts
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    },
    [loadUsers, senderType, senderId]
  );

  const selectUser = useCallback(async (user) => {
    dispatch({ type: 'OPEN_CHAT_WINDOW', payload: user });
    setupWebSocket(user.id);
    await fetchMessages(user.id);
    await markAsRead(user.id);
  }, []);

  const sendMessage = useCallback(
    async (message, files = [], audioBlob = null) => {
      if (!state.selectedUser) return;

      dispatch({ type: 'SET_SENDING_MESSAGE', payload: true });

      try {
        const formData = new FormData();

        if (message.trim()) {
          formData.append('content', message.trim());
        }

        files.forEach((file) => {
          formData.append('upload', file);
        });

        if (audioBlob) {
          formData.append('audio_file', audioBlob, 'recording.webm');
        }

        formData.append('room', state.selectedUser.id);
        formData.append('sender_type', senderType === 'tutor' ? 'trainer' : 'student');
        formData.append('sender_id', senderId);

        // Send via HTTP
        await axiosInstance.post(`${APP_PATH_BASE_URL}api/chat/rooms/${state.selectedUser.id}/euybfvh`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // Also send via WebSocket for real-time update
        if (ws.current && ws.current.readyState === WebSocket.OPEN && message.trim()) {
          ws.current.send(
            JSON.stringify({
              type: 'chat_message',
              content: message.trim(),
              room: state.selectedUser.id,
              sender_type: senderType === 'tutor' ? 'trainer' : 'student',
              sender_id: senderId
            })
          );
        }

        // Refresh messages
        await fetchMessages(state.selectedUser.id);

        // Reset message state
        dispatch({ type: 'RESET_MESSAGE_STATE' });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to send message' });
      } finally {
        dispatch({ type: 'SET_SENDING_MESSAGE', payload: false });
      }
    },
    [state.selectedUser, senderType, senderId, fetchMessages]
  );

  const toggleChat = () => {
    dispatch({ type: 'TOGGLE_CHAT' });
    if (!state.isChatOpen && !hasFetchedUsers.current) {
      loadUsers();
    }
  };

  const openChat = () => {
    dispatch({ type: 'OPEN_CHAT' });
    if (!hasFetchedUsers.current) {
      loadUsers();
    }
  };

  const closeChat = () => {
    if (ws.current) {
      ws.current.close();
    }
    dispatch({ type: 'CLOSE_CHAT' });
  };

  const setSearchTerm = (term) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
  };

  const setIsAddingContactPage = (value) => {
    dispatch({ type: 'SET_ADDING_CONTACT_PAGE', payload: value });
  };

  const setSelectedFiles = (files) => {
    dispatch({ type: 'SET_SELECTED_FILES', payload: files });
  };

  const addSelectedFiles = (files) => {
    dispatch({ type: 'ADD_SELECTED_FILES', payload: files });
  };

  const removeSelectedFile = (index) => {
    dispatch({ type: 'REMOVE_SELECTED_FILE', payload: index });
  };

  const setAudioBlob = (blob) => {
    dispatch({ type: 'SET_AUDIO_BLOB', payload: blob });
  };

  const setShowAudioRecorder = (value) => {
    dispatch({ type: 'SET_SHOW_AUDIO_RECORDER', payload: value });
  };

  const setShowEmojiPicker = (value) => {
    dispatch({ type: 'SET_SHOW_EMOJI_PICKER', payload: value });
  };

  const setNewMessage = (message) => {
    dispatch({ type: 'SET_NEW_MESSAGE', payload: message });
  };

  const handleBackClick = () => {
    if (state.isAddingContactPage) {
      dispatch({ type: 'SET_ADDING_CONTACT_PAGE', payload: false });
      dispatch({ type: 'SET_ERROR', payload: '' });
    } else {
      dispatch({ type: 'SET_SELECTED_USER', payload: null });
      dispatch({ type: 'SET_MESSAGES', payload: [] });
      dispatch({ type: 'SET_SEARCH_TERM', payload: '' });
    }
  };

  const saveContact = async (selectedTrainerId) => {
    try {
      let response;
      if (senderType === 'student') {
        response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/chat/allama`, {
          trainer_id: selectedTrainerId,
          student_id: RegId
        });
      } else {
        response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/chat/allama`, {
          trainer_id: RegId,
          student_id: selectedTrainerId
        });
      }

      if (response.data.error) {
        throw new Error(response.data.message);
      }

      await loadUsers();
      dispatch({ type: 'SET_ADDING_CONTACT_PAGE', payload: false });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to save contact' };
    }
  };

  return (
    <ChatContext.Provider
      value={{
        ...state,
        loadUsers,
        selectUser,
        sendMessage,
        toggleChat,
        openChat,
        closeChat,
        setSearchTerm,
        setIsAddingContactPage,
        setSelectedFiles,
        addSelectedFiles,
        removeSelectedFile,
        setAudioBlob,
        setShowAudioRecorder,
        setShowEmojiPicker,
        setNewMessage,
        handleBackClick,
        saveContact,
        senderId,
        senderType,
        wsReadyState: ws.current?.readyState
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

ChatProvider.propTypes = {
  children: PropTypes.node
};

export default ChatProvider;
