import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Badge,
  Chip,
  CircularProgress,
  InputAdornment,
  Fab,
  Button,
  Stack
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Add as AddIcon,
  AttachFile as AttachFileIcon,
  DragIndicator as DragIndicatorIcon,
  Download,
  InsertEmoticon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import MicIcon from '@mui/icons-material/Mic';
import EmojiPicker from 'emoji-picker-react';
import { AudioRecorder } from 'react-audio-voice-recorder';
import { useChat } from 'contexts/ChatContext'; // Adjust path as needed
import 'assets/css/commonStyle.css';


const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 380,
    maxWidth: '100vw',
    height: '60vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '4px 0px 24px rgba(0, 0, 0, 0.1)',
    borderRadius: '30px 0 30px 0',
    position: 'fixed',
    top: '35vh',
    right: '3vw',
    marginTop: 0,
    marginBottom: 0,
    [theme.breakpoints.down('sm')]: {
      width: '100vw',
      borderRadius: 0,
      boxShadow: 'none',
      top: 0,
      right: 0
    }
  }
}));

const DragHandle = styled(Box)({
  position: 'absolute',
  top: 8,
  left: '50%',
  transform: 'translateX(-50%)',
  cursor: 'move',
  zIndex: 10,
  color: '#666',
  '&:hover': {
    color: '#000'
  }
});

const MessageBubble = styled(Box)(({ isOwnMessage }) => ({
  padding: '12px 16px',
  borderRadius: isOwnMessage ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
  maxWidth: '75%',
  backgroundColor: isOwnMessage ? '#007AFF' : '#F2F2F7',
  color: isOwnMessage ? 'white' : 'black',
  marginBottom: '8px',
  wordWrap: 'break-word',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
}));

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '24px',
    backgroundColor: '#F2F2F7',
    '& fieldset': {
      border: 'none'
    }
  }
});

const ChatPopup = () => {
  const {
    openChats,
    closeChat,
    selectedUser,
    rooms,
    users,
    messages,
    loadingUsers,
    loadingMessages,
    sendingMessage,
    searchTerm,
    isAddingContactPage,
    selectedFiles,
    showAudioRecorder,
    audioBlob,
    showEmojiPicker,
    wsReadyState,
    selectUser,
    sendMessage,
    setSearchTerm,
    setIsAddingContactPage,
    addSelectedFiles,
    removeSelectedFile,
    setAudioBlob,
    setShowAudioRecorder,
    setShowEmojiPicker,
    handleBackClick,
    saveContact,
    senderType
  } = useChat();

  const [position, setPosition] = useState({ top: 200, right: 30 });
  const [selectedTrainerId, setSelectedTrainerId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [newMessage, setLocalNewMessage] = useState('');
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const positionStart = useRef({ top: 0, right: 0 });
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const onMouseDown = (e) => {
    if (!e.target.closest('.drag-handle')) return;

    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    positionStart.current = { ...position };
    e.preventDefault();
    e.stopPropagation();
  };

  const onMouseMove = (e) => {
    if (!dragging.current) return;
    const dx = dragStart.current.x - e.clientX;
    const dy = dragStart.current.y - e.clientY;
    let newTop = positionStart.current.top - dy;
    let newRight = positionStart.current.right + dx;
    newTop = Math.max(0, Math.min(window.innerHeight - 300, newTop));
    newRight = Math.max(0, Math.min(window.innerWidth - 380, newRight));
    setPosition({ top: newTop, right: newRight });
  };

  const onMouseUp = () => {
    dragging.current = false;
  };

  useEffect(() => {
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredUsers = rooms.filter((user) => user?.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSendMessage = async () => {
    await sendMessage(newMessage, selectedFiles, audioBlob);
    setLocalNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddContactClick = () => {
    setIsAddingContactPage(true);
    setSaveError('');
  };

  const handleSaveContact = async () => {
    if (!selectedTrainerId) return;
    if (isSaving) return;

    setIsSaving(true);
    setSaveError('');

    const result = await saveContact(selectedTrainerId);

    if (result.success) {
      setSelectedTrainerId('');
    } else {
      setSaveError(result.error);
    }

    setIsSaving(false);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      addSelectedFiles(files);
    }
    event.target.value = '';
  };

  const handleRemoveFile = (index) => {
    removeSelectedFile(index);
  };

  const getFileNameFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.substring(pathname.lastIndexOf('/') + 1);
    } catch (e) {
      return url.substring(url.lastIndexOf('/') + 1);
    }
  };

  function formatMessageDateTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
  
  if (senderType !== 'tutor') return null;
  if (!openChats) return null;

  return (
    <>
    {openChats.map((user, index) => (
        <StyledDrawer
          key={user.id}
          anchor="right"
          open
          PaperProps={{
            style: {
              position: 'fixed',
              bottom: 20,
              right: 20 + index * 400, // Facebook-style stacking
              height: '60vh',
              width: 380,
              borderRadius: '12px'
            }
          }}
        >
      {/* Drag Handle */}
      <DragHandle className="drag-handle" onMouseDown={onMouseDown}>
        <DragIndicatorIcon />
      </DragHandle>

      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #f85752ff 0%, #070707ff 100%)',
          color: 'white',
          flexShrink: 0
        }}
      >
        {isAddingContactPage ? (
          <>
            <IconButton onClick={handleBackClick} sx={{ mr: 1, color: 'white' }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="600">
              Add Contact
            </Typography>
          </>
        ) : selectedUser ? (
          <>
            <IconButton onClick={handleBackClick} sx={{ mr: 1, color: 'white' }}>
              <ArrowBackIcon />
            </IconButton>
            <Badge
              color="success"
              variant="dot"
              invisible={!selectedUser.online}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Avatar src={selectedUser.image} sx={{ mr: 2, border: '2px solid white' }} />
            </Badge>
            <Box>
              <Typography variant="h6" fontWeight="600">
                {selectedUser.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {wsReadyState === WebSocket.OPEN ? 'Online' : 'Connecting...'}
              </Typography>
            </Box>
          </>
        ) : (
          <Typography variant="h6" fontWeight="600">
            Messages
          </Typography>
        )}
        <IconButton onClick={closeChat} sx={{ ml: 'auto', color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#f8f9fa', flexGrow: 1 }}>
        {/* Search Input Fixed Height */}
        {!isAddingContactPage && !selectedUser && (
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
            <StyledTextField
              fullWidth
              placeholder="Search name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                )
              }}
              inputProps={{ spellCheck: 'false', autoComplete: 'off' }}
              autoComplete="off"
            />
          </Box>
        )}

        {/* Scrollable User List or Messages */}
        <Box
          sx={{
            flexGrow: 1,
            height: '200px',
            overflowY: 'auto'
          }}
          className="auto-hide-scrollbar"
        >
          {isAddingContactPage && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {senderType === 'student' ? 'Select Trainer' : 'Select Student'}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {users.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1,
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: selectedTrainerId === item.id ? '2px solid' : '1px solid',
                      borderColor: selectedTrainerId === item.id ? 'primary.main' : 'grey.300',
                      bgcolor: selectedTrainerId === item.id ? 'action.selected' : 'background.paper',
                      transition: 'background-color 0.2s, border-color 0.2s'
                    }}
                    onClick={() => setSelectedTrainerId(item.id)}
                  >
                    <Avatar src={item.image} alt={item.name} sx={{ width: 48, height: 48, mr: 2 }} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {item.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
              {saveError && (
                <Typography color="error" sx={{ mt: 1 }}>
                  {saveError}
                </Typography>
              )}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="outlined" onClick={handleBackClick} disabled={isSaving}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleSaveContact} disabled={isSaving || !selectedTrainerId}>
                  {isSaving ? <CircularProgress size={24} /> : 'Save'}
                </Button>
              </Box>
            </Box>
          )}

          {!isAddingContactPage && !selectedUser && (
            <>
              {loadingUsers ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : filteredUsers.length === 0 ? (
                <Typography sx={{ p: 2 }} color="textSecondary" align="center">
                  No users found.
                </Typography>
              ) : (
                <List disablePadding>
                  {filteredUsers.map((user) => (
                    <ListItem key={user.id} disablePadding>
                      <ListItemButton
                        onClick={() => selectUser(user)}
                        sx={{
                          py: 1,
                          mb: 1,
                          mx: 1,
                          borderRadius: 3,
                          backgroundColor: 'background.paper',
                          '&:hover': {
                            backgroundColor: '#E3F2FD',
                            transform: 'scale(1.02)',
                            transition: 'all 0.25s ease-in-out'
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            color="success"
                            variant="dot"
                            invisible={!user.online}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            sx={{
                              '& .MuiBadge-badge': {
                                boxShadow: '0 0 6px 2px rgba(76, 175, 80, 0.6)',
                                background: 'linear-gradient(45deg, #43a047, #66bb6a)',
                                width: 14,
                                height: 14,
                                borderRadius: '50%'
                              }
                            }}
                          >
                            <Avatar src={user?.image} sx={{ width: 46, height: 46, boxShadow: 1 }} />
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1" fontWeight="700">
                              {user.name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="textSecondary" noWrap sx={{ maxWidth: '220px' }}>
                              {user.lastMessage || '-'}
                            </Typography>
                          }
                        />
                        {user?.unreadcount > 0 && (
                          <Chip
                            label={user.unreadcount}
                            color="secondary"
                            size="medium"
                            sx={{
                              borderRadius: '50%',
                              fontWeight: '700',
                              background: 'red',
                              color: '#fff'
                            }}
                          />
                        )}
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          )}

          {!isAddingContactPage && selectedUser && (
            <>
              {loadingMessages ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ p: 2 }}>
                  {messages?.length === 0 ? (
                    <Box textAlign="center" py={4}>
                      <Typography variant="body2" color="textSecondary">
                        No messages yet. Start the conversation!
                      </Typography>
                    </Box>
                  ) : (
                    messages?.map((message) => (
                      <Box
                        key={message?.id}
                        sx={{
                          display: 'flex',
                          justifyContent:
                            message?.sender_type === (senderType === 'tutor' ? 'trainer' : 'student') ? 'flex-end' : 'flex-start',
                          mb: 2
                        }}
                      >
                        <MessageBubble isOwnMessage={message?.sender_type === (senderType === 'tutor' ? 'trainer' : 'student')}>
                          {message?.content && (
                            <Typography
                              variant="body1"
                              sx={{
                                lineHeight: 1.4,
                                mb: message?.upload_url ? 1 : 0,
                                wordBreak: 'break-word'
                              }}
                            >
                              {message?.content}
                            </Typography>
                          )}

                          {message?.upload_url && (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                borderRadius: 1,
                                p: 1,
                                mt: message?.content ? 1 : 0,
                                cursor: 'pointer',
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.08)'
                                }
                              }}
                              onClick={() => window.open(message?.upload_url, '_blank')}
                            >
                              <Box sx={{ ml: 1, flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 500,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {getFileNameFromUrl(message?.upload_url)}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: 'block',
                                    opacity: 0.7,
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  Click to download
                                </Typography>
                              </Box>

                              <IconButton
                                size="small"
                                sx={{ ml: 1 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(message?.upload_url, '_blank');
                                }}
                              >
                                <Download fontSize="small" />
                              </IconButton>
                            </Box>
                          )}

                          {message?.audio_file_url && (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                width: 220,
                                mt: message?.content ? 1 : 0
                              }}
                            >
                              <audio controls src={message?.audio_file_url} style={{ width: '100%' }}>
                                <track kind="captions" />
                                Your browser does not support the audio element.
                              </audio>
                            </Box>
                          )}

                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              textAlign: 'right',
                              mt: 0.5,
                              opacity: 0.7,
                              fontSize: '0.6rem'
                            }}
                          >
                            {formatMessageDateTime(message?.created_at)}
                          </Typography>
                        </MessageBubble>
                      </Box>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </Box>
              )}
            </>
          )}
        </Box>

        {/* Bottom FAB for user list page */}
        {!isAddingContactPage && !selectedUser && (
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'flex-end',
              flexShrink: 0
            }}
          >
            <Fab size="small" color="primary" aria-label="add" onClick={handleAddContactClick}>
              <AddIcon />
            </Fab>
          </Box>
        )}

        {/* Bottom message input for message page */}
        {!isAddingContactPage && selectedUser && (
          <Box sx={{ p: 2, flexShrink: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <StyledTextField
                  fullWidth
                  multiline
                  maxRows={3}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setLocalNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  size="small"
                  disabled={sendingMessage}
                />
              </Stack>

              <input type="file" id="file-upload" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} multiple />
              <label htmlFor="file-upload">
                <IconButton component="span" size="small">
                  <AttachFileIcon fontSize="small" />
                </IconButton>
              </label>

              <IconButton size="small" onClick={() => setShowEmojiPicker((v) => !v)}>
                <InsertEmoticon fontSize="small" />
              </IconButton>

              <IconButton size="small" onClick={() => setShowAudioRecorder((v) => !v)}>
                <MicIcon fontSize="small" />
              </IconButton>

              <Fab
                color="primary"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() && selectedFiles.length === 0 && !audioBlob}
                size="small"
                sx={{
                  boxShadow: 'none',
                  width: 36,
                  height: 36,
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0, 122, 255, 0.3)'
                  }
                }}
              >
                <SendIcon fontSize="small" />
              </Fab>
            </Box>

            {showEmojiPicker && (
              <Box sx={{ position: 'absolute', zIndex: 20 }}>
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    setLocalNewMessage((msg) => msg + emojiData.emoji);
                    setShowEmojiPicker(false);
                  }}
                />
              </Box>
            )}

            {showAudioRecorder && (
              <Box sx={{ mt: 1 }}>
                <AudioRecorder
                  onRecordingComplete={(blob) => {
                    setAudioBlob(blob);
                    setShowAudioRecorder(false);
                  }}
                  audioTrackConstraints={{
                    noiseSuppression: true,
                    echoCancellation: true
                  }}
                  showVisualizer={true}
                  onNotAllowedOrFound={() => {
                    alert('Microphone access is required to record audio.');
                    setShowAudioRecorder(false);
                  }}
                />
              </Box>
            )}

            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {selectedFiles.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => handleRemoveFile(index)}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}

            {audioBlob && (
              <Box sx={{ mt: 1 }}>
                <audio controls src={URL.createObjectURL(audioBlob)}>
                  <track kind="captions" />
                </audio>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </StyledDrawer>
      ))}
    </>
  );
};

ChatPopup.propTypes = {
  openChats: PropTypes.bool,
  closeChat: PropTypes.func,
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default ChatPopup;
