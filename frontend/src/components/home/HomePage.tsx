import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { Search as SearchIcon, PersonAdd as PersonAddIcon, Forum as ForumIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../../services/userService';
import type { UserProfile, ConnectionRequest } from '../../services/userService';
import { axiosHelper } from '../../utils/api/axiosHelper';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [userService, setUserService] = useState<UserService | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const securedAxios = axiosHelper.createSecuredAxiosInstance(navigate);
    const unsecuredAxios = axiosHelper.createUnsecuredAxiosInstance(navigate);
    
    setUserService(new UserService(securedAxios, unsecuredAxios));
  }, [navigate]);

  useEffect(() => {
    const loadData = async () => {
      if (!userService) return;
      
      setLoading(true);
      try {
        const [user, requests] = await Promise.all([
          userService.getCurrentUser(),
          userService.getConnectionRequests('received')
        ]);
        
        setCurrentUser(user);
        setConnectionRequests(requests.filter(r => r.status === 'PENDING'));
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load dashboard data');
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
      setConnectionRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Failed to respond to request:', error);
      setError('Failed to respond to connection request');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Typography variant="h5" component="h1" gutterBottom>
        Welcome back, {currentUser?.handle}!
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
        gap: 3 
      }}>
        {/* Quick Actions */}
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={() => navigate('/search')}
              fullWidth
            >
              Find People
            </Button>
            <Button
              variant="contained"
              startIcon={<ForumIcon />}
              onClick={() => navigate('/public-threads')}
              fullWidth
              sx={{ mt: 1 }}
            >
              Discussion Threads
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/connections')}
              fullWidth
            >
              My Connections
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/messages')}
              fullWidth
            >
              Private Messages
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/settings')}
              fullWidth
            >
              Edit Profile
            </Button>
          </Box>
        </Paper>

        {/* Profile Summary */}
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Your Profile
          </Typography>
          {currentUser && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Wallet: {currentUser.walletAddress.substring(0, 6)}...{currentUser.walletAddress.substring(38)}
              </Typography>
              {currentUser.country && (
                <Typography variant="body2" gutterBottom>
                  📍 {currentUser.country.name}
                </Typography>
              )}
              <Typography variant="body2" gutterBottom>
                Interests: {currentUser.interests.length}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Location Tags: {currentUser.locationTags.length}
              </Typography>
            </Box>
          )}
        </Paper>

      </Box>

      {/* Pending Connection Requests */}
      {connectionRequests.length > 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Pending Connection Requests ({connectionRequests.length})
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
            gap: 2 
          }}>
            {connectionRequests.map((request) => (
              <Card key={request.id}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {request.requesterProfile?.handle || 'Unknown User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {request.requesterWallet.substring(0, 6)}...{request.requesterWallet.substring(38)}
                  </Typography>
                  {request.commonInterests.length > 0 && (
                    <Typography variant="body2" gutterBottom>
                      Common interests: {request.commonInterests.map(i => i.name).join(', ')}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<PersonAddIcon />}
                      onClick={() => handleRespondToRequest(request.id, 'ACCEPT')}
                    >
                      Accept
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleRespondToRequest(request.id, 'DISMISS')}
                    >
                      Dismiss
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Paper>
      )}

      {/* No pending requests message */}
      {connectionRequests.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No pending connection requests
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Use the search feature to find people with similar interests
          </Typography>
        </Box>
      )}
    </div>
  );
};