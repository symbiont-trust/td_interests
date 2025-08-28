import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  IconButton
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 500 }}>
          Privacy Policy
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Last updated: December 2024
        </Typography>

        <Typography variant="h6" gutterBottom>
          1. Information We Collect
        </Typography>
        <Typography variant="body1" paragraph>
          We collect information you provide directly to us, including:
        </Typography>
        <Typography component="div" variant="body1" sx={{ ml: 2, mb: 2 }}>
          • Wallet address (serves as your unique identifier)<br/>
          • Profile information (handle, interests, location tags)<br/>
          • Country of residence<br/>
          • Messages and content you post on the platform<br/>
          • Connection and interaction data
        </Typography>

        <Typography variant="h6" gutterBottom>
          2. How We Use Your Information
        </Typography>
        <Typography variant="body1" paragraph>
          We use the information we collect to:
        </Typography>
        <Typography component="div" variant="body1" sx={{ ml: 2, mb: 2 }}>
          • Provide and maintain the Service<br/>
          • Connect you with users who share similar interests<br/>
          • Generate your public profile for API access<br/>
          • Communicate with you about the Service<br/>
          • Improve and personalize your experience<br/>
          • Detect and prevent fraud and abuse
        </Typography>

        <Typography variant="h6" gutterBottom>
          3. Information Sharing
        </Typography>
        <Typography variant="body1" paragraph>
          We may share your information in the following situations:
        </Typography>
        <Typography component="div" variant="body1" sx={{ ml: 2, mb: 2 }}>
          • <strong>Public Profile API:</strong> Your profile information (handle, interests, connections) 
          may be shared through our Profile API with authorized clients<br/>
          • <strong>With Other Users:</strong> Your profile information is visible to other users 
          when they search for connections<br/>
          • <strong>Legal Requirements:</strong> When required by law or to protect our rights<br/>
          • <strong>Business Transfers:</strong> In connection with any merger, sale, or acquisition
        </Typography>

        <Typography variant="h6" gutterBottom>
          4. Blockchain and Wallet Data
        </Typography>
        <Typography variant="body1" paragraph>
          Your wallet address is publicly visible on the blockchain and serves as your identifier on our platform. 
          Blockchain transactions are permanent and cannot be modified or deleted. We do not have access to your private keys 
          and cannot control or reverse blockchain transactions.
        </Typography>

        <Typography variant="h6" gutterBottom>
          5. Data Security
        </Typography>
        <Typography variant="body1" paragraph>
          We implement appropriate technical and organizational security measures to protect your information. 
          However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
        </Typography>

        <Typography variant="h6" gutterBottom>
          6. Data Retention
        </Typography>
        <Typography variant="body1" paragraph>
          We retain your information for as long as your account is active or as needed to provide the Service. 
          You may request deletion of your account, but some information may remain on the blockchain permanently.
        </Typography>

        <Typography variant="h6" gutterBottom>
          7. Your Rights and Choices
        </Typography>
        <Typography variant="body1" paragraph>
          You have the right to:
        </Typography>
        <Typography component="div" variant="body1" sx={{ ml: 2, mb: 2 }}>
          • Access and update your profile information<br/>
          • Control who can see your information through privacy settings<br/>
          • Delete your account (subject to blockchain limitations)<br/>
          • Opt out of certain communications<br/>
          • Request information about how your data is used
        </Typography>

        <Typography variant="h6" gutterBottom>
          8. Cookies and Tracking
        </Typography>
        <Typography variant="body1" paragraph>
          We use cookies and similar technologies to improve your experience, remember your preferences, 
          and analyze how you use our Service. You can control cookies through your browser settings.
        </Typography>

        <Typography variant="h6" gutterBottom>
          9. Third-Party Services
        </Typography>
        <Typography variant="body1" paragraph>
          Our Service integrates with third-party services including Reown's App Kit for wallet functionality. 
          These services have their own privacy policies, and we encourage you to review them.
        </Typography>

        <Typography variant="h6" gutterBottom>
          10. International Data Transfers
        </Typography>
        <Typography variant="body1" paragraph>
          Your information may be processed in countries other than your own. We ensure appropriate safeguards 
          are in place when transferring your personal information internationally.
        </Typography>

        <Typography variant="h6" gutterBottom>
          11. Children's Privacy
        </Typography>
        <Typography variant="body1" paragraph>
          Our Service is not intended for children under 13 years of age. We do not knowingly collect 
          personal information from children under 13.
        </Typography>

        <Typography variant="h6" gutterBottom>
          12. Changes to This Policy
        </Typography>
        <Typography variant="body1" paragraph>
          We may update this Privacy Policy from time to time. We will notify you of any material changes 
          by posting the updated policy on our Service and updating the "Last updated" date.
        </Typography>

        <Typography variant="h6" gutterBottom>
          13. Contact Us
        </Typography>
        <Typography variant="body1" paragraph>
          If you have any questions about this Privacy Policy, please contact us at:
        </Typography>
        <Typography component="div" variant="body1" sx={{ ml: 2, mb: 2 }}>
          <strong>Email:</strong> john.charles.dickerson@gmail.com<br/>
          <strong>Location:</strong> Nairobi, Kenya
        </Typography>
      </Paper>
    </Container>
  );
};