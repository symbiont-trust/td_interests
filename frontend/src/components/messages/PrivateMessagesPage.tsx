import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Avatar,
  Badge,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Message as MessageIcon, 
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Add as AddIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { MessageService } from '../../services/messageService';
import type { PrivateMessageThread, PaginatedResponse } from '../../services/messageService';
import { axiosHelper } from '../../utils/api/axiosHelper';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`messages-tabpanel-${index}`}
      aria-labelledby={`messages-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export const PrivateMessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [messageService, setMessageService] = useState<MessageService | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Thread data
  const [activeThreads, setActiveThreads] = useState<PaginatedResponse<PrivateMessageThread> | null>(null);
  const [archivedThreads, setArchivedThreads] = useState<PaginatedResponse<PrivateMessageThread> | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const securedAxios = axiosHelper.createSecuredAxiosInstance(navigate);
    const unsecuredAxios = axiosHelper.createUnsecuredAxiosInstance(navigate);
    
    setMessageService(new MessageService(securedAxios, unsecuredAxios));
  }, [navigate]);

  useEffect(() => {
    const loadData = async () => {
      if (!messageService) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const [active, archived, unread] = await Promise.all([
          messageService.getThreads(false, 0, 20),
          messageService.getThreads(true, 0, 20),
          messageService.getUnreadCount()
        ]);
        
        setActiveThreads(active);
        setArchivedThreads(archived);
        setUnreadCount(unread);
      } catch (error) {
        console.error('Failed to load threads:', error);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [messageService]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleThreadClick = (threadId: number) => {
    navigate(`/messages/thread/${threadId}`);
  };

  const handleArchiveThread = async (threadId: number, archive: boolean, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation to thread
    
    if (!messageService) return;

    try {
      await messageService.archiveThread(threadId, archive);
      
      // Refresh threads
      const [active, archived] = await Promise.all([
        messageService.getThreads(false, 0, 20),
        messageService.getThreads(true, 0, 20)
      ]);
      
      setActiveThreads(active);
      setArchivedThreads(archived);
    } catch (error) {
      console.error('Failed to archive thread:', error);
      setError('Failed to update thread');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const renderThreadCard = (thread: PrivateMessageThread, isArchived: boolean) => (
    <Card 
      key={thread.id}
      sx={{ 
        mb: 1, 
        cursor: 'pointer',
        '&:hover': { 
          backgroundColor: 'action.hover' 
        },
        border: thread.unreadCount > 0 ? '2px solid' : '1px solid',
        borderColor: thread.unreadCount > 0 ? 'primary.main' : 'divider'
      }}
      onClick={() => handleThreadClick(thread.id)}
    >
      <CardContent sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Badge badgeContent={thread.unreadCount} color="primary">
            <Avatar>
              {thread.otherUserProfile?.handle?.[0] || '?'}
            </Avatar>
          </Badge>
          
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" component="div" noWrap>
              {thread.otherUserProfile?.handle || 'Unknown User'}
            </Typography>
            {thread.subject && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {thread.subject}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {thread.lastMessageAt ? formatTimeAgo(thread.lastMessageAt) : formatTimeAgo(thread.createdAt)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={isArchived ? "Unarchive" : "Archive"}>
              <IconButton
                size="small"
                onClick={(e) => handleArchiveThread(thread.id, !isArchived, e)}
              >
                {isArchived ? <UnarchiveIcon /> : <ArchiveIcon />}
              </IconButton>
            </Tooltip>
            
            <MessageIcon color="action" />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Messages
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/messages/new')}
        >
          New Message
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="message tabs">
          <Tab 
            label={
              <Badge badgeContent={unreadCount} color="primary">
                <span>Active ({activeThreads?.totalElements || 0})</span>
              </Badge>
            }
            id="messages-tab-0"
            aria-controls="messages-tabpanel-0"
          />
          <Tab 
            label={`Archived (${archivedThreads?.totalElements || 0})`}
            id="messages-tab-1"
            aria-controls="messages-tabpanel-1"
          />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        {activeThreads && activeThreads.content.length > 0 ? (
          <Box>
            {activeThreads.content.map((thread) => renderThreadCard(thread, false))}
            {activeThreads.totalPages > 1 && (
              <Button 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={() => {/* TODO: Load more */}}
              >
                Load More
              </Button>
            )}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <MessageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No active conversations
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Start a conversation with someone from your connections
            </Typography>
            <Button 
              variant="outlined" 
              sx={{ mt: 2 }}
              onClick={() => navigate('/messages/new')}
            >
              Start New Conversation
            </Button>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {archivedThreads && archivedThreads.content.length > 0 ? (
          <Box>
            {archivedThreads.content.map((thread) => renderThreadCard(thread, true))}
            {archivedThreads.totalPages > 1 && (
              <Button 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={() => {/* TODO: Load more */}}
              >
                Load More
              </Button>
            )}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <ArchiveIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No archived conversations
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Archived conversations will appear here
            </Typography>
          </Box>
        )}
      </TabPanel>
    </div>
  );
};