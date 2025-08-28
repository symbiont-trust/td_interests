import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/authService';
import { axiosHelper } from '../../utils/api/axiosHelper';
import { signMessage, WalletSignatureError } from '../../utils/wallet/signatureUtils';
import { jwtHelper } from '../../utils/auth/jwtHelper';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const { address: walletAddress, isConnected } = useAccount();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authService, setAuthService] = useState<AuthService | null>(null);

  useEffect(() => {
    const unsecuredAxios = axiosHelper.createUnsecuredAxiosInstance(navigate);
    const securedAxios = axiosHelper.createSecuredAxiosInstance(navigate);
    
    setAuthService(new AuthService(securedAxios, unsecuredAxios));
  }, [navigate]);

  const handleLogin = async () => {
    if (!authService || !walletAddress || !isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get challenge message
      const challenge = await authService.getChallenge(walletAddress);
      
      // Sign the message
      const signature = await signMessage(challenge.message, walletAddress);

      // Submit login
      const response = await authService.login(walletAddress, signature, challenge.message);

      if (response.success && response.accessToken && response.refreshToken) {
        // Store tokens
        jwtHelper.setJWTToken(response.accessToken);
        jwtHelper.setRefreshToken(response.refreshToken);
        jwtHelper.setWalletAddress(walletAddress);

        onLoginSuccess();
      } else {
        setError(response.message || 'Login failed');
      }

    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof WalletSignatureError) {
        if (error.code === 'USER_REJECTED') {
          setError('Please sign the message to login');
        } else {
          setError(error.message);
        }
      } else if (error instanceof Error) {
        if (error.message.includes('User not found')) {
          setError('Account not found. Please register first.');
        } else {
          setError(error.message);
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', minWidth: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 500 }}>
          Login
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" align="center" paragraph>
        Connect your wallet and sign a message to login to your My Interests account.
      </Typography>
      
      {/* Force width to match WelcomeContent */}
      <Box sx={{ height: 0, overflow: 'hidden' }}>
        <Typography variant="h2" component="div">
          Welcome to My Interests
        </Typography>
        <Typography variant="h5" component="div">
          Connect based on shared interests, communicate, and build meaningful connections.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!isConnected ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please connect your wallet using the button in the header.
        </Alert>
      ) : (
        <Alert severity="success" sx={{ mb: 2 }}>
          Wallet connected: {walletAddress?.substring(0, 6)}...{walletAddress?.substring(38)}
        </Alert>
      )}

      <Box sx={{ textAlign: 'center', mt: 3, maxWidth: 600, mx: 'auto' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleLogin}
          disabled={loading || !isConnected}
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : 'Sign Message & Login'}
        </Button>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{' '}
          <Button 
            variant="text" 
            onClick={() => navigate('/register')}
            sx={{ textTransform: 'none' }}
          >
            Register here
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};