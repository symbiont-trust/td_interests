import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
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
    <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Login
      </Typography>

      <Typography variant="body2" color="text.secondary" align="center" paragraph>
        Connect your wallet and sign a message to login to your My Interests account.
      </Typography>

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

      <Box sx={{ textAlign: 'center', mt: 3 }}>
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
    </Paper>
  );
};