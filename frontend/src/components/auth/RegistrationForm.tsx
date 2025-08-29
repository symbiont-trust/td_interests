import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  IconButton
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { AuthService, DataService } from '../../services/authService';
import type { Country, InterestTag, RegisterData } from '../../services/authService';
import { axiosHelper } from '../../utils/api/axiosHelper';
import { signMessage, WalletSignatureError } from '../../utils/wallet/signatureUtils';
import { jwtHelper } from '../../utils/auth/jwtHelper';

const steps = ['Connect Wallet', 'Personal Info', 'Interests & Location'];

interface RegistrationFormProps {
  onRegistrationSuccess: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegistrationSuccess }) => {
  const navigate = useNavigate();
  const { address: walletAddress, isConnected } = useAccount();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginOption, setShowLoginOption] = useState(false);
  
  // Form data
  const [handle, setHandle] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [locationTags, setLocationTags] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<InterestTag[]>([]);
  const [newLocationTag, setNewLocationTag] = useState('');
  
  // Data
  const [countries, setCountries] = useState<Country[]>([]);
  const [allInterestTags, setAllInterestTags] = useState<InterestTag[]>([]);
  
  // Services
  const [authService, setAuthService] = useState<AuthService | null>(null);
  const [dataService, setDataService] = useState<DataService | null>(null);

  useEffect(() => {
    const unsecuredAxios = axiosHelper.createUnsecuredAxiosInstance(navigate);
    const securedAxios = axiosHelper.createSecuredAxiosInstance(navigate);
    
    setAuthService(new AuthService(securedAxios, unsecuredAxios));
    setDataService(new DataService(unsecuredAxios));
  }, [navigate]);

  useEffect(() => {
    if (isConnected && walletAddress) {
      setActiveStep(1);
    }
  }, [isConnected, walletAddress]);

  useEffect(() => {
    const loadData = async () => {
      if (!dataService) return;
      
      try {
        const [countriesData, interestTagsData] = await Promise.all([
          dataService.getCountries(),
          dataService.getInterestTags()
        ]);
        
        setCountries(countriesData);
        setAllInterestTags(interestTagsData);
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load registration data. Please refresh the page.');
      }
    };

    loadData();
  }, [dataService]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
    setError(null);
    setShowLoginOption(false);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
    setShowLoginOption(false);
  };

  const addLocationTag = () => {
    if (newLocationTag.trim() && !locationTags.includes(newLocationTag.trim())) {
      setLocationTags([...locationTags, newLocationTag.trim()]);
      setNewLocationTag('');
    }
  };

  const removeLocationTag = (tagToRemove: string) => {
    setLocationTags(locationTags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!authService || !walletAddress || !isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!handle.trim()) {
      setError('Please enter a handle');
      return;
    }

    if (selectedInterests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get challenge message
      const challenge = await authService.getChallenge(walletAddress);
      
      // Sign the message
      const signature = await signMessage(challenge.message, walletAddress);

      // Prepare registration data
      const registrationData: RegisterData = {
        walletAddress,
        handle: handle.trim(),
        signature,
        message: challenge.message,
        countryId: selectedCountry?.id,
        locationTags: locationTags.length > 0 ? locationTags : undefined,
        interestIds: selectedInterests.map(interest => interest.id)
      };

      // Submit registration
      const response = await authService.register(registrationData);

      if (response.success && response.accessToken && response.refreshToken) {
        // Store tokens
        jwtHelper.setJWTToken(response.accessToken);
        jwtHelper.setRefreshToken(response.refreshToken);
        jwtHelper.setWalletAddress(walletAddress);

        // Call the callback to update parent state
        onRegistrationSuccess();
        
        // Navigate to home page
        navigate('/');
      } else {
        setError(response.message || 'Registration failed');
      }

    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error instanceof WalletSignatureError) {
        if (error.code === 'USER_REJECTED') {
          setError('Please sign the message to complete registration');
        } else {
          setError(error.message);
        }
      } else if (error.response?.status === 409) {
        // User already exists - redirect to error page
        const message = error.response.data?.message || 'This wallet address is already registered.';
        const errorUrl = `/error?code=USER_ALREADY_EXISTS&message=${encodeURIComponent(message)}`;
        navigate(errorUrl);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Connect Your Wallet
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              To register for My Interests, you need to connect your wallet first.
            </Typography>
            {isConnected ? (
              <Alert severity="success" sx={{ mt: 2 }}>
                Wallet connected: {walletAddress?.substring(0, 6)}...{walletAddress?.substring(38)}
              </Alert>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                Please use the "Connect Wallet" button in the header to connect your wallet.
              </Alert>
            )}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            
            <TextField
              fullWidth
              label="Handle/Username"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              margin="normal"
              required
              helperText="This will be your display name (not unique)"
            />

            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel>Country (Optional)</InputLabel>
              <Select
                value={selectedCountry?.id || ''}
                onChange={(e) => {
                  const country = countries.find(c => c.id === e.target.value);
                  setSelectedCountry(country || null);
                }}
                label="Country (Optional)"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {countries.map((country) => (
                  <MenuItem key={country.id} value={country.id}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Interests & Location
            </Typography>

            <Autocomplete
              multiple
              options={allInterestTags}
              getOptionLabel={(option) => option.name}
              value={selectedInterests}
              onChange={(_, newValue) => setSelectedInterests(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select your interests"
                  placeholder="Search interests..."
                  margin="normal"
                  required
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option.name}
                    size="small"
                    {...getTagProps({ index })}
                    key={option.id}
                  />
                ))
              }
            />

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Location Tags (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Add tags to describe your location, like "Nairobi CBD" or "Near University"
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  value={newLocationTag}
                  onChange={(e) => setNewLocationTag(e.target.value)}
                  placeholder="Add location tag"
                  size="small"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addLocationTag();
                    }
                  }}
                />
                <Button onClick={addLocationTag} variant="outlined" size="small">
                  Add
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {locationTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => removeLocationTag(tag)}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%', minWidth: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 500 }}>
          Register for My Interests
        </Typography>
      </Box>
      
      {/* Force width to match WelcomeContent */}
      <Box sx={{ height: 0, overflow: 'hidden' }}>
        <Typography variant="h2" component="div">
          Welcome to My Interests
        </Typography>
        <Typography variant="h5" component="div">
          Connect based on shared interests, communicate, and build meaningful connections.
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          {showLoginOption && (
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/login')}
                size="small"
              >
                Go to Login Page
              </Button>
            </Box>
          )}
        </Alert>
      )}

      {renderStepContent()}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>

        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !isConnected}
          >
            {loading ? <CircularProgress size={24} /> : 'Register'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!isConnected}
          >
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
};