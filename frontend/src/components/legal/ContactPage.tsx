import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  IconButton,
  Card,
  CardContent
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const ContactPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Contact Us
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 3 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Get in Touch
          </Typography>
          <Typography variant="body1" paragraph>
            We'd love to hear from you! Whether you have questions about My Interests, 
            need technical support, or want to provide feedback, don't hesitate to reach out.
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EmailIcon color="primary" />
                  <Box>
                    <Typography variant="h6" component="div">
                      Email
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      john.charles.dickerson@gmail.com
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationIcon color="primary" />
                  <Box>
                    <Typography variant="h6" component="div">
                      Location
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Nairobi, Kenya
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Paper>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Support Topics
          </Typography>
          <Typography variant="body1" paragraph>
            We can help you with:
          </Typography>
          <Typography component="div" variant="body1">
            • <strong>Account Issues:</strong> Problems with wallet connection or profile setup<br/>
            • <strong>Technical Support:</strong> App functionality or performance issues<br/>
            • <strong>Privacy Concerns:</strong> Questions about data handling and privacy<br/>
            • <strong>Feature Requests:</strong> Suggestions for new features or improvements<br/>
            • <strong>Bug Reports:</strong> Issues you've encountered while using the platform<br/>
            • <strong>Partnership Inquiries:</strong> Business or collaboration opportunities
          </Typography>
        </Paper>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Response Time
          </Typography>
          <Typography variant="body1" paragraph>
            We strive to respond to all inquiries within 24-48 hours during business days. 
            For urgent technical issues, please include "URGENT" in your email subject line.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Before You Contact Us
          </Typography>
          <Typography variant="body1" paragraph>
            To help us assist you more effectively, please:
          </Typography>
          <Typography component="div" variant="body1">
            • Check our Terms and Conditions and Privacy Policy for common questions<br/>
            • Include relevant details about your issue (wallet address, error messages, screenshots)<br/>
            • Describe the steps you took before encountering the problem<br/>
            • Let us know what browser and device you're using
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};