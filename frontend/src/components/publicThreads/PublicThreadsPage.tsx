import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Avatar
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Forum as ForumIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PublicMessageService } from '../../services/publicMessageService';
import type { PublicMessageThread, PaginatedResponse } from '../../services/publicMessageService';
import { axiosHelper } from '../../utils/api/axiosHelper';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`threads-tabpanel-${index}`}
      aria-labelledby={`threads-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export const PublicThreadsPage: React.FC = () => {
  const navigate = useNavigate();
  const [publicMessageService, setPublicMessageService] = useState<PublicMessageService | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Thread data
  const [allThreads, setAllThreads] = useState<PaginatedResponse<PublicMessageThread> | null>(null);
  const [featuredThreads, setFeaturedThreads] = useState<PaginatedResponse<PublicMessageThread> | null>(null);
  const [popularThreads, setPopularThreads] = useState<PaginatedResponse<PublicMessageThread> | null>(null);
  const [searchResults, setSearchResults] = useState<PaginatedResponse<PublicMessageThread> | null>(null);

  useEffect(() => {
    const securedAxios = axiosHelper.createSecuredAxiosInstance(navigate);
    const unsecuredAxios = axiosHelper.createUnsecuredAxiosInstance(navigate);
    
    setPublicMessageService(new PublicMessageService(securedAxios, unsecuredAxios));
  }, [navigate]);

  useEffect(() => {
    const loadData = async () => {
      if (!publicMessageService) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const [all, featured, popular] = await Promise.all([
          publicMessageService.getThreads(0, 20),
          publicMessageService.getFeaturedThreads(0, 10),
          publicMessageService.getPopularThreads(0, 10)
        ]);
        
        setAllThreads(all);
        setFeaturedThreads(featured);
        setPopularThreads(popular);
      } catch (error) {
        console.error('Failed to load threads:', error);
        setError('Failed to load discussion threads');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [publicMessageService]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSearchQuery('');
    setSearchResults(null);
  };

  const handleSearch = async () => {
    if (!publicMessageService || !searchQuery.trim()) return;

    try {
      const results = await publicMessageService.searchThreads(searchQuery, 0, 20);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search failed');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  const handleThreadClick = (threadId: number) => {
    navigate(`/public-threads/${threadId}`);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const renderThreadCard = (thread: PublicMessageThread) => (
    <Card 
      key={thread.id}
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        '&:hover': { 
          backgroundColor: 'action.hover' 
        },
        border: thread.isFeatured ? '2px solid' : '1px solid',
        borderColor: thread.isFeatured ? 'primary.main' : 'divider'
      }}
      onClick={() => handleThreadClick(thread.id)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {thread.isFeatured && (
            <StarIcon color="primary" sx={{ mt: 0.5 }} />
          )}
          
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" component="div" noWrap sx={{ mb: 1 }}>
              {thread.title}
            </Typography>
            
            {thread.description && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {thread.description}
              </Typography>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {thread.interestTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                  {thread.creatorProfile?.handle?.[0] || '?'}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  {thread.creatorProfile?.handle || 'Unknown'}
                </Typography>
              </Box>
              
              <Typography variant="caption" color="text.secondary">
                {thread.messageCount} messages
              </Typography>
              
              <Typography variant="caption" color="text.secondary">
                {thread.lastMessageAt ? formatTimeAgo(thread.lastMessageAt) : formatTimeAgo(thread.createdAt)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Discussion Threads
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/public-threads/new')}
        >
          New Thread
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search discussion threads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />
        
        {searchQuery && (
          <Button 
            variant="outlined" 
            onClick={handleSearch}
            sx={{ mr: 1 }}
          >
            Search
          </Button>
        )}
      </Box>

      {searchResults ? (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Search Results for "{searchQuery}" ({searchResults.totalElements} results)
          </Typography>
          {searchResults.content.length > 0 ? (
            searchResults.content.map(renderThreadCard)
          ) : (
            <Typography variant="body2" color="text.secondary">
              No threads found matching your search.
            </Typography>
          )}
        </Box>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="thread tabs">
              <Tab 
                icon={<ForumIcon />}
                label={`All Threads (${allThreads?.totalElements || 0})`}
                iconPosition="start"
              />
              <Tab 
                icon={<StarIcon />}
                label={`Featured (${featuredThreads?.totalElements || 0})`}
                iconPosition="start"
              />
              <Tab 
                icon={<TrendingUpIcon />}
                label={`Popular (${popularThreads?.totalElements || 0})`}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            {allThreads && allThreads.content.length > 0 ? (
              <Box>
                {allThreads.content.map(renderThreadCard)}
                {allThreads.totalPages > 1 && (
                  <Button 
                    fullWidth 
                    sx={{ mt: 2 }}
                    onClick={() => {/* TODO: Load more */}}
                  >
                    Load More
                  </Button>
                )}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <ForumIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No discussion threads yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Be the first to start a discussion on a topic you're interested in
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/public-threads/new')}
                >
                  Create First Thread
                </Button>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            {featuredThreads && featuredThreads.content.length > 0 ? (
              featuredThreads.content.map(renderThreadCard)
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <StarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No featured threads
                </Typography>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            {popularThreads && popularThreads.content.length > 0 ? (
              popularThreads.content.map(renderThreadCard)
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <TrendingUpIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No popular threads yet
                </Typography>
              </Box>
            )}
          </TabPanel>
        </>
      )}
    </Box>
  );
};