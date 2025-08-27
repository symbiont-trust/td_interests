import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  IconButton
} from '@mui/material';
import { 
  PersonRemove as PersonRemoveIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Message as MessageIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../../services/userService';
import type { ConnectionRequest } from '../../services/userService';
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
      id={`connections-tabpanel-${index}`}
      aria-labelledby={`connections-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const ConnectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [userService, setUserService] = useState<UserService | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Connection data
  const [receivedRequests, setReceivedRequests] = useState<ConnectionRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
  const [connections, setConnections] = useState<ConnectionRequest[]>([]);

  useEffect(() => {
    const securedAxios = axiosHelper.createSecuredAxiosInstance(navigate);
    const unsecuredAxios = axiosHelper.createUnsecuredAxiosInstance(navigate);
    
    setUserService(new UserService(securedAxios, unsecuredAxios));
  }, [navigate]);

  useEffect(() => {
    const loadData = async () => {
      if (!userService) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const [received, sent, accepted] = await Promise.all([
          userService.getConnectionRequests('received'),
          userService.getConnectionRequests('sent'),
          userService.getConnections()
        ]);
        
        setReceivedRequests(received);
        setSentRequests(sent);
        setConnections(accepted);
      } catch (error) {
        console.error('Failed to load connections data:', error);
        setError('Failed to load connections data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userService]);

  const handleRespondToRequest = async (requestId: number, action: 'ACCEPT' | 'DISMISS') => {
    if (!userService) return;

    try {
      await userService.respondToConnectionRequest(requestId, action);
      
      // Remove from received requests and add to connections if accepted
      const updatedReceived = receivedRequests.filter(req => req.id !== requestId);
      setReceivedRequests(updatedReceived);
      
      if (action === 'ACCEPT') {
        const acceptedRequest = receivedRequests.find(req => req.id === requestId);
        if (acceptedRequest) {
          setConnections(prev => [...prev, { ...acceptedRequest, status: 'ACCEPTED' }]);
        }
      }
    } catch (error) {
      console.error('Failed to respond to request:', error);
      setError('Failed to respond to connection request');
    }
  };

  const handleRemoveConnection = async (connectionId: number) => {
    if (!userService) return;

    try {
      await userService.removeConnection(connectionId);
      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    } catch (error) {
      console.error('Failed to remove connection:', error);
      setError('Failed to remove connection');
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderConnectionCard = (request: ConnectionRequest, type: 'received' | 'sent' | 'connected') => {
    const isReceived = type === 'received';
    const isSent = type === 'sent';
    const isConnected = type === 'connected';
    
    const displayWallet = isReceived ? request.requesterWallet : 
                         isSent ? request.recipientWallet : 
                         request.requesterWallet;
    
    const displayProfile = isReceived ? request.requesterProfile : request.recipientProfile;

    return (
      <Card key={request.id}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            {displayProfile?.handle || 'Unknown User'}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {displayWallet.substring(0, 6)}...{displayWallet.substring(38)}
          </Typography>
          
          {request.commonInterests && request.commonInterests.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Common interests:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {request.commonInterests.slice(0, 3).map((interest) => (
                  <Chip
                    key={interest.id}
                    label={interest.name}
                    size="small"
                    variant="outlined"
                  />
                ))}
                {request.commonInterests.length > 3 && (
                  <Chip
                    label={`+${request.commonInterests.length - 3} more`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : ''}
          </Typography>
        </CardContent>
        
        <CardActions>
          {isReceived && (
            <>
              <Button
                size="small"
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={() => handleRespondToRequest(request.id, 'ACCEPT')}
                color="primary"
              >
                Accept
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={() => handleRespondToRequest(request.id, 'DISMISS')}
              >
                Dismiss
              </Button>
            </>
          )}
          
          {isSent && (
            <Typography variant="body2" color="text.secondary">
              Status: {request.status}
            </Typography>
          )}
          
          {isConnected && (
            <>
              <Button
                size="small"
                startIcon={<MessageIcon />}
                onClick={() => navigate(`/messages`)}
              >
                Message
              </Button>
              <Button
                size="small"
                onClick={() => navigate(`/profile/${displayWallet}`)}
              >
                View Profile
              </Button>
              <IconButton
                size="small"
                onClick={() => handleRemoveConnection(request.id)}
                color="error"
              >
                <PersonRemoveIcon />
              </IconButton>
            </>
          )}
        </CardActions>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Connections
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="connections tabs">
          <Tab 
            label={`Received (${receivedRequests.length})`} 
            id="connections-tab-0"
            aria-controls="connections-tabpanel-0"
          />
          <Tab 
            label={`Sent (${sentRequests.length})`} 
            id="connections-tab-1"
            aria-controls="connections-tabpanel-1"
          />
          <Tab 
            label={`Connected (${connections.length})`} 
            id="connections-tab-2"
            aria-controls="connections-tabpanel-2"
          />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          {receivedRequests.length > 0 ? (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
              gap: 2 
            }}>
              {receivedRequests.map((request) => renderConnectionCard(request, 'received'))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No pending connection requests
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {sentRequests.length > 0 ? (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
              gap: 2 
            }}>
              {sentRequests.map((request) => renderConnectionCard(request, 'sent'))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No sent connection requests
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Use the search feature to find people and send connection requests
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {connections.length > 0 ? (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
              gap: 2 
            }}>
              {connections.map((connection) => renderConnectionCard(connection, 'connected'))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No connections yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Start connecting with people who share your interests!
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};