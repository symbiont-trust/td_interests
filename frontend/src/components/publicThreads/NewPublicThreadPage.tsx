import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Autocomplete,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PublicMessageService } from '../../services/publicMessageService';
import { axiosHelper } from '../../utils/api/axiosHelper';

// Common interest tags for suggestions
const COMMON_INTERESTS = [
  'Technology', 'Programming', 'Web Development', 'Mobile Development',
  'Artificial Intelligence', 'Machine Learning', 'Data Science',
  'Blockchain', 'Cryptocurrency', 'Gaming', 'Design', 'Art',
  'Music', 'Movies', 'Books', 'Travel', 'Food', 'Health',
  'Fitness', 'Sports', 'Photography', 'Nature', 'Science',
  'Education', 'Career', 'Business', 'Startups', 'Marketing',
  'Finance', 'Politics', 'News', 'Philosophy', 'Psychology'
];

export const NewPublicThreadPage: React.FC = () => {
  const navigate = useNavigate();
  const [publicMessageService, setPublicMessageService] = useState<PublicMessageService | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [initialMessage, setInitialMessage] = useState('');
  const [customInterest, setCustomInterest] = useState('');

  useEffect(() => {
    const securedAxios = axiosHelper.createSecuredAxiosInstance(navigate);
    const unsecuredAxios = axiosHelper.createUnsecuredAxiosInstance(navigate);
    
    setPublicMessageService(new PublicMessageService(securedAxios, unsecuredAxios));
  }, [navigate]);

  const handleAddCustomInterest = () => {
    if (customInterest.trim() && !selectedInterests.includes(customInterest.trim())) {
      setSelectedInterests(prev => [...prev, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setSelectedInterests(prev => prev.filter(interest => interest !== interestToRemove));
  };

  const handleSubmit = async () => {
    if (!publicMessageService) return;
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (selectedInterests.length === 0) {
      setError('At least one interest tag is required');
      return;
    }
    
    if (!initialMessage.trim()) {
      setError('Initial message is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const thread = await publicMessageService.createThread({
        title: title.trim(),
        description: description.trim() || undefined,
        interestTags: selectedInterests,
        initialMessage: initialMessage.trim()
      });
      
      // Navigate to the new thread
      navigate(`/public-threads/${thread.id}`);
    } catch (error) {
      console.error('Failed to create thread:', error);
      setError('Failed to create discussion thread');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = title.trim() && selectedInterests.length > 0 && initialMessage.trim();

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/public-threads')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Create New Discussion Thread
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Title */}
            <TextField
              label="Thread Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              placeholder="What would you like to discuss?"
              helperText={`${title.length}/255 characters`}
              inputProps={{ maxLength: 255 }}
            />

            {/* Description */}
            <TextField
              label="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Provide more details about what this thread is about..."
              helperText={`${description.length}/5000 characters`}
              inputProps={{ maxLength: 5000 }}
            />

            {/* Interest Tags */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Interest Tags *
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add tags to help people find your discussion. Choose from common interests or add your own.
              </Typography>

              {/* Selected interests display */}
              {selectedInterests.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedInterests.map((interest) => (
                      <Chip
                        key={interest}
                        label={interest}
                        onDelete={() => handleRemoveInterest(interest)}
                        deleteIcon={<CloseIcon />}
                        color="primary"
                        variant="filled"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Interest selection */}
              <Autocomplete
                multiple
                value={selectedInterests}
                onChange={(_, newValue) => setSelectedInterests(newValue)}
                options={COMMON_INTERESTS}
                freeSolo
                renderTags={() => null} // We render tags above
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Type to search interests or add your own..."
                  />
                )}
                sx={{ mb: 2 }}
              />

              {/* Custom interest input */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="Add custom interest"
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCustomInterest()}
                  size="small"
                  placeholder="Type custom interest tag..."
                />
                <Button
                  variant="outlined"
                  onClick={handleAddCustomInterest}
                  disabled={!customInterest.trim()}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
            </Box>

            {/* Initial Message */}
            <TextField
              label="Start the Discussion"
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              fullWidth
              required
              multiline
              rows={6}
              placeholder="Share your thoughts, ask a question, or start the conversation..."
              helperText={`${initialMessage.length}/10000 characters`}
              inputProps={{ maxLength: 10000 }}
            />

            {/* Submit Button */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/public-threads')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isFormValid || loading}
                startIcon={loading ? <CircularProgress size={20} /> : undefined}
              >
                {loading ? 'Creating...' : 'Create Thread'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Guidelines Card */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Community Guidelines
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Be respectful and constructive in your discussions
            • Choose clear, descriptive titles that help others understand the topic
            • Use relevant interest tags to help people find your thread
            • Start with a thoughtful initial message to encourage participation
            • Stay on topic and contribute meaningfully to the conversation
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};