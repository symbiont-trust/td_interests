import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleLinkClick = (path: string) => {
    navigate(path);
  };

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 3,
        px: 2,
        backgroundColor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center',
            alignItems: 'center',
            gap: { xs: 2, sm: 4 }
          }}
        >
          <Link
            component="button"
            variant="body2"
            onClick={() => handleLinkClick('/terms')}
            sx={{
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            Terms and Conditions
          </Link>
          
          <Divider 
            orientation="vertical" 
            flexItem 
            sx={{ display: { xs: 'none', sm: 'block' } }}
          />
          
          <Link
            component="button"
            variant="body2"
            onClick={() => handleLinkClick('/privacy')}
            sx={{
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            Privacy Policy
          </Link>
          
          <Divider 
            orientation="vertical" 
            flexItem 
            sx={{ display: { xs: 'none', sm: 'block' } }}
          />
          
          <Link
            component="button"
            variant="body2"
            onClick={() => handleLinkClick('/contact')}
            sx={{
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            Contact Us
          </Link>
        </Box>
        
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            © 2024 My Interests. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};