import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete
} from '@mui/material';
import { Search as SearchIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../../services/userService';
import { DataService } from '../../services/authService';
import type { SearchFilters, SearchResult, Country, InterestTag } from '../../services/userService';
import { axiosHelper } from '../../utils/api/axiosHelper';

export const UserSearch: React.FC = () => {
  const navigate = useNavigate();
  const [userService, setUserService] = useState<UserService | null>(null);
  const [dataService, setDataService] = useState<DataService | null>(null);
  
  // Search state
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter state
  const [selectedInterests, setSelectedInterests] = useState<InterestTag[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [locationTag, setLocationTag] = useState('');
  
  // Data
  const [allInterests, setAllInterests] = useState<InterestTag[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    const securedAxios = axiosHelper.createSecuredAxiosInstance(navigate);
    const unsecuredAxios = axiosHelper.createUnsecuredAxiosInstance(navigate);
    
    setUserService(new UserService(securedAxios, unsecuredAxios));
    setDataService(new DataService(unsecuredAxios));
  }, [navigate]);

  useEffect(() => {
    const loadData = async () => {
      if (!dataService) return;
      
      try {
        const [interestsData, countriesData] = await Promise.all([
          dataService.getInterestTags(),
          dataService.getCountries()
        ]);
        
        setAllInterests(interestsData);
        setCountries(countriesData);
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load search data');
      }
    };

    loadData();
  }, [dataService]);

  const handleSearch = async (page: number = 1) => {
    if (!userService) return;

    setLoading(true);
    setError(null);

    try {
      const filters: SearchFilters = {
        interests: selectedInterests.map(i => i.id),
        locationTags: locationTag ? [locationTag] : undefined,
        country: selectedCountry?.id
      };

      const result = await userService.searchUsers(filters, page - 1, 10);
      setSearchResult(result);
      setCurrentPage(page);
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendConnectionRequest = async (recipientWallet: string) => {
    if (!userService) return;

    try {
      await userService.sendConnectionRequest(recipientWallet);
      // Refresh search results
      handleSearch(currentPage);
    } catch (error) {
      console.error('Connection request failed:', error);
      setError('Failed to send connection request');
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    handleSearch(page);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Find People
      </Typography>

      {/* Search Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Search Filters
        </Typography>
        
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '2fr 1fr 1fr'
            },
            gap: 3
          }}
        >
          <Box>
            <Autocomplete
              multiple
              options={allInterests}
              getOptionLabel={(option) => option.name}
              value={selectedInterests}
              onChange={(_, newValue) => setSelectedInterests(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Interests"
                  placeholder="Select interests..."
                />
              )}
              renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    variant="outlined"
                    label={option.name}
                    size="small"
                    key={option.id}
                  />
                ))
              }
            />
          </Box>

          <Box>
            <FormControl fullWidth>
              <InputLabel>Country</InputLabel>
              <Select
                value={selectedCountry?.id || ''}
                onChange={(e) => {
                  const country = countries.find(c => c.id === e.target.value);
                  setSelectedCountry(country || null);
                }}
                label="Country"
              >
                <MenuItem value="">
                  <em>Any</em>
                </MenuItem>
                {countries.map((country) => (
                  <MenuItem key={country.id} value={country.id}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <TextField
              fullWidth
              label="Location Tag"
              value={locationTag}
              onChange={(e) => setLocationTag(e.target.value)}
              placeholder="e.g., Nairobi CBD"
            />
          </Box>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={() => handleSearch(1)}
            disabled={loading}
            size="large"
          >
            {loading ? <CircularProgress size={24} /> : 'Search'}
          </Button>
        </Box>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search Results */}
      {searchResult && (
        <>
          <Typography variant="h6" gutterBottom>
            Found {searchResult.totalElements} users
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)'
              },
              gap: 3
            }}
          >
            {searchResult.users.map((user) => (
              <Card key={user.walletAddress}>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {user.handle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {user.walletAddress.substring(0, 6)}...{user.walletAddress.substring(38)}
                  </Typography>
                  
                  {user.country && (
                    <Typography variant="body2" gutterBottom>
                      📍 {user.country.name}
                    </Typography>
                  )}

                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Interests:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {user.interests.slice(0, 3).map((interest) => (
                        <Chip
                          key={interest.id}
                          label={interest.name}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {user.interests.length > 3 && (
                        <Chip
                          label={`+${user.interests.length - 3} more`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<PersonAddIcon />}
                    onClick={() => handleSendConnectionRequest(user.walletAddress)}
                  >
                    Connect
                  </Button>
                  <Button 
                    size="small"
                    onClick={() => navigate(`/profile/${user.walletAddress}`)}
                  >
                    View Profile
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>

          {/* Pagination */}
          {searchResult.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={searchResult.totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Initial state message */}
      {!searchResult && !loading && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.secondary">
            Use the search filters above to find people with similar interests
          </Typography>
        </Box>
      )}
    </Box>
  );
};