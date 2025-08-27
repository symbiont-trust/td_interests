import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Tooltip
} from '@mui/material';
import { 
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Reply as ReplyIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageService } from '../../services/messageService';
import type { PrivateMessageThread, Message, PaginatedResponse } from '../../services/messageService';
import { axiosHelper } from '../../utils/api/axiosHelper';

export const ThreadView: React.FC = () => {
  const navigate = useNavigate();
  const { threadId } = useParams<{ threadId: string }>();
  const [messageService, setMessageService] = useState<MessageService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Thread and message data
  const [thread, setThread] = useState<PrivateMessageThread | null>(null);
  const [messages, setMessages] = useState<PaginatedResponse<Message> | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  
  // Form state
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const securedAxios = axiosHelper.createSecuredAxiosInstance(navigate);
    const unsecuredAxios = axiosHelper.createUnsecuredAxiosInstance(navigate);
    
    setMessageService(new MessageService(securedAxios, unsecuredAxios));
  }, [navigate]);

  useEffect(() => {
    const loadThreadData = async () => {
      if (!messageService || !threadId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const numericThreadId = parseInt(threadId, 10);
        const [threadData, messagesData] = await Promise.all([
          messageService.getThread(numericThreadId),
          messageService.getThreadMessages(numericThreadId, 0, 50)
        ]);
        
        setThread(threadData);
        setMessages(messagesData);
        
        // Mark thread as read
        await messageService.markThreadAsRead(numericThreadId);
        
        // Scroll to bottom
        setTimeout(() => scrollToBottom(), 100);
      } catch (error) {
        console.error('Failed to load thread:', error);
        setError('Failed to load conversation');
      } finally {
        setLoading(false);
      }
    };

    loadThreadData();
  }, [messageService, threadId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageService || !threadId || !messageContent.trim()) return;
    
    setSending(true);
    setError(null);
    
    try {
      const newMessage = await messageService.sendMessage({
        threadId: parseInt(threadId, 10),
        content: messageContent.trim(),
        parentMessageId: replyingTo || undefined
      });
      
      // Add new message to the list
      if (messages) {
        setMessages({
          ...messages,
          content: [...messages.content, newMessage]
        });
      }
      
      setMessageContent('');
      setReplyingTo(null);
      
      // Scroll to bottom
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleArchiveThread = async () => {
    if (!messageService || !threadId || !thread) return;

    try {
      await messageService.archiveThread(parseInt(threadId, 10), !thread.isArchived);
      setThread({ ...thread, isArchived: !thread.isArchived });
    } catch (error) {
      console.error('Failed to archive thread:', error);
      setError('Failed to update thread');
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!thread) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" color="text.secondary">
          Conversation not found
        </Typography>
        <Button onClick={() => navigate('/messages')} sx={{ mt: 2 }}>
          Back to Messages
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2, height: '80vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <IconButton onClick={() => navigate('/messages')}>
          <ArrowBackIcon />
        </IconButton>
        
        <Avatar sx={{ width: 40, height: 40 }}>
          {thread.otherUserProfile?.handle?.[0] || '?'}
        </Avatar>
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6">
            {thread.otherUserProfile?.handle || 'Unknown User'}
          </Typography>
          {thread.subject && (
            <Typography variant="body2" color="text.secondary">
              {thread.subject}
            </Typography>
          )}
        </Box>

        <Tooltip title={thread.isArchived ? "Unarchive" : "Archive"}>
          <IconButton onClick={handleArchiveThread}>
            {thread.isArchived ? <UnarchiveIcon /> : <ArchiveIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Messages */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', py: 2 }}>
        {messages?.content.map((message) => (
          <Box key={message.id} sx={{ mb: 2 }}>
            <Card sx={{ 
              maxWidth: '70%',
              ml: message.senderProfile?.walletAddress === thread.otherUserProfile?.walletAddress ? 0 : 'auto',
              mr: message.senderProfile?.walletAddress === thread.otherUserProfile?.walletAddress ? 'auto' : 0,
              backgroundColor: message.senderProfile?.walletAddress === thread.otherUserProfile?.walletAddress ? 'grey.100' : 'primary.light'
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {message.parentMessageId && (
                  <Box sx={{ mb: 1, p: 1, backgroundColor: 'action.hover', borderRadius: 1, fontSize: '0.875rem' }}>
                    <Typography variant="caption" color="text.secondary">
                      Replying to a previous message
                    </Typography>
                  </Box>
                )}
                
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {message.content}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatTimestamp(message.createdAt)}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {message.replyCount > 0 && (
                      <Chip 
                        size="small" 
                        label={`${message.replyCount} replies`}
                        variant="outlined"
                      />
                    )}
                    <IconButton 
                      size="small" 
                      onClick={() => setReplyingTo(message.id)}
                      sx={{ p: 0.5 }}
                    >
                      <ReplyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Reply indicator */}
      {replyingTo && (
        <Box sx={{ p: 1, backgroundColor: 'action.hover', borderRadius: 1, mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Replying to message
            <Button size="small" onClick={() => setReplyingTo(null)} sx={{ ml: 1 }}>
              Cancel
            </Button>
          </Typography>
        </Box>
      )}

      {/* Message input */}
      <Box sx={{ display: 'flex', gap: 1, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Type your message..."
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={sending}
        />
        <Button
          variant="contained"
          onClick={handleSendMessage}
          disabled={!messageContent.trim() || sending}
          sx={{ minWidth: 'auto', px: 2 }}
        >
          {sending ? <CircularProgress size={20} /> : <SendIcon />}
        </Button>
      </Box>
    </Box>
  );
};