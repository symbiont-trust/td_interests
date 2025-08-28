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
  Collapse,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Reply as ReplyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { PublicMessageService } from '../../services/publicMessageService';
import type { PublicMessageThread, PublicMessage } from '../../services/publicMessageService';
import { axiosHelper } from '../../utils/api/axiosHelper';

interface MessageWithReplies extends PublicMessage {
  replies?: PublicMessage[];
  showReplies?: boolean;
  repliesLoaded?: boolean;
}

export const PublicThreadView: React.FC = () => {
  const navigate = useNavigate();
  const { threadId } = useParams<{ threadId: string }>();
  const [publicMessageService, setPublicMessageService] = useState<PublicMessageService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Thread and message data
  const [thread, setThread] = useState<PublicMessageThread | null>(null);
  const [messages, setMessages] = useState<MessageWithReplies[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  
  // Form state
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const securedAxios = axiosHelper.createSecuredAxiosInstance(navigate);
    const unsecuredAxios = axiosHelper.createUnsecuredAxiosInstance(navigate);
    
    setPublicMessageService(new PublicMessageService(securedAxios, unsecuredAxios));
  }, [navigate]);

  useEffect(() => {
    const loadThreadData = async () => {
      if (!publicMessageService || !threadId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const numericThreadId = parseInt(threadId, 10);
        const [threadData, messagesData] = await Promise.all([
          publicMessageService.getThread(numericThreadId),
          publicMessageService.getThreadMessages(numericThreadId, 0, 50)
        ]);
        
        setThread(threadData);
        setMessages(messagesData.content.map(msg => ({ ...msg, showReplies: false, repliesLoaded: false })));
        
        // Scroll to bottom
        setTimeout(() => scrollToBottom(), 100);
      } catch (error) {
        console.error('Failed to load thread:', error);
        setError('Failed to load discussion thread');
      } finally {
        setLoading(false);
      }
    };

    loadThreadData();
  }, [publicMessageService, threadId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!publicMessageService || !threadId || !messageContent.trim()) return;
    
    setSending(true);
    setError(null);
    
    try {
      const newMessage = await publicMessageService.sendMessage(parseInt(threadId, 10), {
        content: messageContent.trim(),
        parentMessageId: replyingTo || undefined
      });
      
      if (replyingTo) {
        // If it's a reply, add to the parent message's replies
        setMessages(prevMessages => 
          prevMessages.map(msg => {
            if (msg.id === replyingTo) {
              return {
                ...msg,
                replies: [...(msg.replies || []), newMessage],
                replyCount: msg.replyCount + 1,
                showReplies: true
              };
            }
            return msg;
          })
        );
      } else {
        // If it's a top-level message, add to the main messages list
        setMessages(prevMessages => [...prevMessages, { ...newMessage, showReplies: false, repliesLoaded: false }]);
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

  const loadReplies = async (messageId: number) => {
    if (!publicMessageService) return;

    try {
      const repliesData = await publicMessageService.getMessageReplies(messageId, 0, 20);
      
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId 
            ? { 
                ...msg, 
                replies: repliesData.content, 
                showReplies: true, 
                repliesLoaded: true 
              }
            : msg
        )
      );
    } catch (error) {
      console.error('Failed to load replies:', error);
    }
  };

  const toggleReplies = async (messageId: number) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;

    if (!message.repliesLoaded && !message.showReplies) {
      await loadReplies(messageId);
    } else {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId 
            ? { ...msg, showReplies: !msg.showReplies }
            : msg
        )
      );
    }
  };

  const handleToggleFeatured = async () => {
    if (!publicMessageService || !threadId) return;

    try {
      await publicMessageService.toggleFeaturedStatus(parseInt(threadId, 10));
      setThread(prev => prev ? { ...prev, isFeatured: !prev.isFeatured } : null);
      handleCloseMenu();
    } catch (error) {
      console.error('Failed to toggle featured status:', error);
      setError('Failed to update thread');
    }
  };

  const handleDeactivateThread = async () => {
    if (!publicMessageService || !threadId) return;

    try {
      await publicMessageService.deactivateThread(parseInt(threadId, 10));
      navigate('/public-threads');
    } catch (error) {
      console.error('Failed to deactivate thread:', error);
      setError('Failed to deactivate thread');
    }
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
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

  const renderMessage = (message: MessageWithReplies, isReply: boolean = false) => (
    <Box key={message.id} sx={{ mb: 2, ml: isReply ? 4 : 0 }}>
      <Card sx={{ 
        backgroundColor: isReply ? 'grey.50' : 'background.paper',
        border: isReply ? '1px solid' : undefined,
        borderColor: isReply ? 'divider' : undefined
      }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Avatar sx={{ width: 36, height: 36 }}>
              {message.senderProfile?.handle?.[0] || '?'}
            </Avatar>
            
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" component="div">
                  {message.senderProfile?.handle || 'Unknown User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatTimestamp(message.createdAt)}
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ mb: 1, wordBreak: 'break-word' }}>
                {message.content}
              </Typography>
              
              {message.tags && (
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  {message.tags.split(',').map((tag, index) => (
                    <Chip key={index} label={tag.trim()} size="small" variant="outlined" />
                  ))}
                </Box>
              )}
              
              {!isReply && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton 
                    size="small" 
                    onClick={() => setReplyingTo(message.id)}
                    sx={{ p: 0.5 }}
                  >
                    <ReplyIcon fontSize="small" />
                  </IconButton>
                  
                  {message.replyCount > 0 && (
                    <Button
                      size="small"
                      startIcon={message.showReplies ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      onClick={() => toggleReplies(message.id)}
                      sx={{ minWidth: 'auto' }}
                    >
                      {message.replyCount} {message.replyCount === 1 ? 'reply' : 'replies'}
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      {!isReply && message.showReplies && message.replies && (
        <Collapse in={message.showReplies}>
          <Box sx={{ mt: 2 }}>
            {message.replies.map(reply => renderMessage(reply, true))}
          </Box>
        </Collapse>
      )}
    </Box>
  );

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
          Discussion thread not found
        </Typography>
        <Button onClick={() => navigate('/public-threads')} sx={{ mt: 2 }}>
          Back to Threads
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '90vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <IconButton onClick={() => navigate('/public-threads')}>
          <ArrowBackIcon />
        </IconButton>
        
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {thread.isFeatured && <StarIcon color="primary" />}
            <Typography variant="h5" component="h1">
              {thread.title}
            </Typography>
          </Box>
          
          {thread.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {thread.description}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                {thread.creatorProfile?.handle?.[0] || '?'}
              </Avatar>
              <Typography variant="caption">
                by {thread.creatorProfile?.handle || 'Unknown'}
              </Typography>
            </Box>
            
            <Typography variant="caption" color="text.secondary">
              {thread.messageCount} messages
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              {thread.interestTags.map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        </Box>

        <IconButton onClick={handleOpenMenu}>
          <MoreVertIcon />
        </IconButton>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={handleToggleFeatured}>
            {thread.isFeatured ? <StarBorderIcon sx={{ mr: 1 }} /> : <StarIcon sx={{ mr: 1 }} />}
            {thread.isFeatured ? 'Remove Featured' : 'Mark as Featured'}
          </MenuItem>
          <MenuItem onClick={handleDeactivateThread} sx={{ color: 'error.main' }}>
            Deactivate Thread
          </MenuItem>
        </Menu>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Messages */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', py: 2 }}>
        {messages.map(message => renderMessage(message))}
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
          placeholder="Join the discussion..."
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