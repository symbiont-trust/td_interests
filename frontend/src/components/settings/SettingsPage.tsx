import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  TextField,
  Button,
  Chip,
  Autocomplete,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { Save as SaveIcon, Person as PersonIcon } from '@mui/icons-material';
import { axiosHelper } from '../../utils/api/axiosHelper';
import { useNavigate } from 'react-router-dom';

interface Country {
  id: number;
  name: string;
}

interface InterestTag {
  id: number;
  name: string;
}

interface UserProfile {
  walletAddress: string;
  handle: string;
  country: Country;
  locationTags: string[];
  interests: InterestTag[];
}

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [allInterests, setAllInterests] = useState<InterestTag[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [axiosInstance, setAxiosInstance] = useState<any>(null);

  useEffect(() => {
    const instance = axiosHelper.createSecuredAxiosInstance(navigate);
    setAxiosInstance(instance);
  }, [navigate]);

  useEffect(() => {
    if (axiosInstance) {
      loadData();
    }
  }, [axiosInstance]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [profileRes, countriesRes, interestsRes] = await Promise.all([
        axiosInstance.get('/api/users/profile'),
        axiosInstance.get('/api/data/countries'),
        axiosInstance.get('/api/data/interests')
      ]);

      setProfile(profileRes.data);
      setCountries(countriesRes.data);
      setAllInterests(interestsRes.data);
    } catch (err: any) {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const updateRequest = {
        handle: profile.handle,
        countryId: profile.country.id,
        locationTags: profile.locationTags,
        interestTagIds: profile.interests.map(i => i.id)
      };

      await axiosInstance.put('/api/users/profile', updateRequest);
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLocationTagsChange = (value: string) => {
    if (!profile) return;
    
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setProfile({
      ...profile,
      locationTags: tags
    });
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <Alert severity="error">Failed to load profile</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <PersonIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h5" component="h1">
              Profile Settings
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom color="text.secondary">
                Wallet Address
              </Typography>
              <TextField
                fullWidth
                value={profile.walletAddress}
                disabled
                variant="outlined"
                size="small"
                helperText="Wallet address cannot be changed"
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom color="text.secondary">
                  Handle
                </Typography>
                <TextField
                  fullWidth
                  value={profile.handle}
                  onChange={(e) => setProfile({ ...profile, handle: e.target.value })}
                  placeholder="Enter your handle"
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom color="text.secondary">
                  Country
                </Typography>
                <Autocomplete
                  size="small"
                  value={profile.country}
                  onChange={(_, newValue) => {
                    if (newValue) {
                      setProfile({ ...profile, country: newValue });
                    }
                  }}
                  options={countries}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Select country" variant="outlined" />
                  )}
                />
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom color="text.secondary">
                Location Tags
              </Typography>
              <TextField
                fullWidth
                value={profile.locationTags.join(', ')}
                onChange={(e) => handleLocationTagsChange(e.target.value)}
                placeholder="Enter location tags separated by commas (e.g., downtown, tech hub, coworking space)"
                variant="outlined"
                size="small"
                helperText="Separate multiple tags with commas"
                multiline
                rows={2}
              />
              {profile.locationTags.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {profile.locationTags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom color="text.secondary">
                Interests
              </Typography>
              <Autocomplete
                multiple
                size="small"
                value={profile.interests}
                onChange={(_, newValue) => setProfile({ ...profile, interests: newValue })}
                options={allInterests}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="filled"
                      label={option.name}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select your interests"
                    variant="outlined"
                  />
                )}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                size="large"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};