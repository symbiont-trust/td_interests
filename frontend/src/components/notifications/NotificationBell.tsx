import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Button,
  Divider
} from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: number;
  recipientWallet: string;
  senderWallet: string;
  senderHandle: string;
  type: 'PRIVATE_MESSAGE_REPLY' | 'PUBLIC_MESSAGE_REPLY' | 'NEW_PRIVATE_MESSAGE' | 'CONNECTION_REQUEST' | 'CONNECTION_ACCEPTED';
  content: string;
  messageId?: number;
  threadId?: number;
  threadTitle?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  axiosInstance: any;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ axiosInstance }) => {
  const [hasNotifications, setHasNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for notification events from axios interceptor
    const handleNotificationEvent = (event: any) => {
      setHasNotifications(event.detail);
    };

    window.addEventListener('hasNotifications', handleNotificationEvent);
    
    // Check initial notification status
    checkNotificationStatus();

    return () => {
      window.removeEventListener('hasNotifications', handleNotificationEvent);
    };
  }, []);

  const checkNotificationStatus = async () => {
    try {
      const response = await axiosInstance.get('/api/notifications/status');
      setHasNotifications(response.data.hasNotifications);
    } catch (error) {
      console.error('Failed to check notification status:', error);
    }
  };

  const loadNotifications = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      // For now, we'll use the basic notification status
      // In a full implementation, you'd fetch actual notification details
      const response = await axiosInstance.get('/api/notifications/status');
      
      // Mock notifications for demonstration
      if (response.data.hasNotifications) {
        setNotifications([
          {
            id: 1,
            recipientWallet: response.data.walletAddress,
            senderWallet: '0x1234',
            senderHandle: 'user123',
            type: 'PRIVATE_MESSAGE_REPLY',
            content: 'You have new messages',
            isRead: false,
            createdAt: new Date().toISOString()
          }
        ]);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = async (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    await loadNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClearNotifications = async () => {
    try {
      await axiosInstance.post('/api/notifications/clear');
      setHasNotifications(false);
      setNotifications([]);
      handleClose();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Navigate to relevant page based on notification type
    switch (notification.type) {
      case 'PRIVATE_MESSAGE_REPLY':
      case 'NEW_PRIVATE_MESSAGE':
        if (notification.threadId) {
          navigate(`/messages/thread/${notification.threadId}`);
        } else {
          navigate('/messages');
        }
        break;
      case 'PUBLIC_MESSAGE_REPLY':
        if (notification.threadId) {
          navigate(`/public-threads/${notification.threadId}`);
        } else {
          navigate('/public-threads');
        }
        break;
      case 'CONNECTION_REQUEST':
      case 'CONNECTION_ACCEPTED':
        navigate('/connections');
        break;
      default:
        break;
    }
    handleClose();
  };

  const formatNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'PRIVATE_MESSAGE_REPLY':
        return `${notification.senderHandle} replied to your message`;
      case 'PUBLIC_MESSAGE_REPLY':
        return `${notification.senderHandle} replied to your post in "${notification.threadTitle}"`;
      case 'NEW_PRIVATE_MESSAGE':
        return `New message from ${notification.senderHandle}`;
      case 'CONNECTION_REQUEST':
        return `${notification.senderHandle} wants to connect`;
      case 'CONNECTION_ACCEPTED':
        return `${notification.senderHandle} accepted your connection request`;
      default:
        return notification.content;
    }
  };

  const isOpen = Boolean(anchorEl);

  return (
    <>
      <IconButton
        size="large"
        onClick={handleBellClick}
        color="inherit"
      >
        <Badge 
          variant="dot" 
          color="error" 
          invisible={!hasNotifications}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ width: 350, maxHeight: 400 }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6">
              Notifications
            </Typography>
          </Box>
          
          {loading ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography>Loading...</Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem 
                    onClick={() => handleNotificationClick(notification)}
                    sx={{ 
                      backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                      '&:hover': {
                        backgroundColor: 'action.selected'
                      },
                      cursor: 'pointer'
                    }}
                  >
                    <ListItemText
                      primary={formatNotificationText(notification)}
                      secondary={new Date(notification.createdAt).toLocaleString()}
                      primaryTypographyProps={{
                        fontWeight: notification.isRead ? 'normal' : 'bold'
                      }}
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
          
          {notifications.length > 0 && (
            <>
              <Divider />
              <Box sx={{ p: 1 }}>
                <Button 
                  fullWidth 
                  onClick={handleClearNotifications}
                  size="small"
                >
                  Clear All
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Popover>
    </>
  );
};