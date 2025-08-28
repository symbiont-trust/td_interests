import React from 'react';
import { Box, Typography, Button } from '@mui/material';

export const WelcomeContent: React.FC = () => {
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Welcome to My Interests
      </Typography>
      <Typography variant="h5" component="h2" color="text.secondary">
        Connect based on shared interests, communicate, and build meaningful connections.
      </Typography>
      
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          size="large"
          href="/login"
        >
          Login
        </Button>
        <Button 
          variant="outlined" 
          size="large"
          href="/register"
        >
          Register
        </Button>
      </Box>
    </Box>
  );
};