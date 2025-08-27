import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Autocomplete,
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MessageService } from '../../services/messageService';
import { UserService } from '../../services/userService';
import type { ConnectionRequest } from '../../services/userService';
import { axiosHelper } from '../../utils/api/axiosHelper';

interface Connection {
  id: number;
  walletAddress: string;
  handle: string;
}

interface NewMessageDialogProps {
  open: boolean;
  onClose: () => void;
}

export const NewMessageDialog: React.FC<NewMessageDialogProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [messageService, setMessageService] = useState<MessageService | null>(null);
  const [userService, setUserService] = useState<UserService | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);

  useEffect(() => {
    const securedAxios = axiosHelper.createSecuredAxiosInstance(navigate);
    const unsecuredAxios = axiosHelper.createUnsecuredAxiosInstance(navigate);
    
    setMessageService(new MessageService(securedAxios, unsecuredAxios));
    setUserService(new UserService(securedAxios, unsecuredAxios));
  }, [navigate]);

  useEffect(() => {
    const loadConnections = async () => {
      if (!userService || !open) return;
      
      setLoadingConnections(true);
      try {
        const connectionsData = await userService.getConnections();
        
        // Transform connection requests to simple connection objects
        const connectionList: Connection[] = connectionsData
          .filter((conn: ConnectionRequest) => conn.status === 'ACCEPTED')
          .map((conn: ConnectionRequest) => ({
            id: conn.id,
            walletAddress: conn.requesterProfile?.walletAddress || conn.recipientProfile?.walletAddress || '',
            handle: conn.requesterProfile?.handle || conn.recipientProfile?.handle || 'Unknown'
          }));
        
        setConnections(connectionList);
      } catch (error) {
        console.error('Failed to load connections:', error);
        setError('Failed to load connections');
      } finally {
        setLoadingConnections(false);
      }
    };

    loadConnections();
  }, [userService, open]);

  const handleClose = () => {
    setSelectedConnection(null);
    setSubject('');
    setMessage('');
    setError(null);
    onClose();
  };

  const handleSend = async () => {
    if (!messageService || !selectedConnection || !message.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const thread = await messageService.createThread({
        recipientWallet: selectedConnection.walletAddress,
        subject: subject.trim() || undefined,
        initialMessage: message.trim()
      });
      
      // Close dialog and navigate to the new thread
      handleClose();
      navigate(`/messages/thread/${thread.id}`);
    } catch (error) {
      console.error('Failed to create thread:', error);
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ sx: { minHeight: '500px' } }}
    >
      <DialogTitle>New Message</DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Autocomplete
            options={connections}
            getOptionLabel={(option) => `${option.handle} (${option.walletAddress.substring(0, 8)}...)`}
            value={selectedConnection}
            onChange={(_, newValue) => setSelectedConnection(newValue)}
            loading={loadingConnections}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id}>
                <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                  {option.handle[0]}
                </Avatar>
                <Box>
                  <Typography variant="body2">{option.handle}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.walletAddress.substring(0, 12)}...
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="To"
                placeholder="Select a connection..."
                required
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingConnections ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Box>

        <TextField
          fullWidth
          label="Subject (optional)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          sx={{ mb: 2 }}
          placeholder="What's this conversation about?"
        />

        <TextField
          fullWidth
          label="Message"
          multiline
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          placeholder="Type your message here..."
          helperText={`${message.length}/10000 characters`}
          inputProps={{ maxLength: 10000 }}
        />

        {connections.length === 0 && !loadingConnections && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" color="text.secondary">
              You don't have any connections yet.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                handleClose();
                navigate('/search');
              }}
              sx={{ mt: 1 }}
            >
              Find People to Connect
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSend}
          variant="contained"
          disabled={!selectedConnection || !message.trim() || loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Send Message'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};