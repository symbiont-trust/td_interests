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

export const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Terms and Conditions
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Last updated: December 2024
        </Typography>

        <Typography variant="h6" gutterBottom>
          1. Acceptance of Terms
        </Typography>
        <Typography variant="body1" paragraph>
          By accessing and using My Interests ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
          If you do not agree to abide by the above, please do not use this service.
        </Typography>

        <Typography variant="h6" gutterBottom>
          2. Description of Service
        </Typography>
        <Typography variant="body1" paragraph>
          My Interests is a blockchain-based social networking platform that connects people based on shared interests and location. 
          The Service allows users to create profiles, connect with others, and communicate through private messages and public discussion threads.
        </Typography>

        <Typography variant="h6" gutterBottom>
          3. User Accounts and Wallet Addresses
        </Typography>
        <Typography variant="body1" paragraph>
          To use the Service, you must connect a cryptocurrency wallet or use our account abstraction feature. 
          Your wallet address serves as your unique identifier on the platform. You are responsible for maintaining the security of your wallet and private keys.
        </Typography>

        <Typography variant="h6" gutterBottom>
          4. User Conduct
        </Typography>
        <Typography variant="body1" paragraph>
          You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
        </Typography>
        <Typography component="div" variant="body1" sx={{ ml: 2, mb: 2 }}>
          • Post content that is illegal, harmful, threatening, abusive, or offensive<br/>
          • Impersonate any person or entity<br/>
          • Spam other users or flood the platform with excessive messages<br/>
          • Attempt to gain unauthorized access to other users' accounts<br/>
          • Use the Service for any commercial purposes without permission
        </Typography>

        <Typography variant="h6" gutterBottom>
          5. Privacy and Data
        </Typography>
        <Typography variant="body1" paragraph>
          Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, 
          to understand our practices regarding the collection and use of your information.
        </Typography>

        <Typography variant="h6" gutterBottom>
          6. Content and Intellectual Property
        </Typography>
        <Typography variant="body1" paragraph>
          You retain ownership of any content you post on the Service. However, by posting content, you grant us a non-exclusive, 
          worldwide, royalty-free license to use, modify, and display your content in connection with the Service.
        </Typography>

        <Typography variant="h6" gutterBottom>
          7. Blockchain Technology
        </Typography>
        <Typography variant="body1" paragraph>
          The Service utilizes blockchain technology and cryptocurrency wallets. You understand and acknowledge that 
          blockchain transactions are irreversible and that we cannot recover lost private keys or reverse transactions.
        </Typography>

        <Typography variant="h6" gutterBottom>
          8. Limitation of Liability
        </Typography>
        <Typography variant="body1" paragraph>
          The Service is provided "as is" without any warranties. We shall not be liable for any indirect, incidental, 
          special, consequential, or punitive damages resulting from your use of the Service.
        </Typography>

        <Typography variant="h6" gutterBottom>
          9. Termination
        </Typography>
        <Typography variant="body1" paragraph>
          We may terminate or suspend your access to the Service immediately, without prior notice, 
          for any breach of these Terms or for any other reason we deem appropriate.
        </Typography>

        <Typography variant="h6" gutterBottom>
          10. Changes to Terms
        </Typography>
        <Typography variant="body1" paragraph>
          We reserve the right to modify these Terms at any time. We will notify users of any material changes by 
          posting the updated Terms on the Service. Your continued use of the Service constitutes acceptance of the modified Terms.
        </Typography>

        <Typography variant="h6" gutterBottom>
          11. Governing Law
        </Typography>
        <Typography variant="body1" paragraph>
          These Terms shall be governed by and construed in accordance with the laws of Kenya, 
          without regard to its conflict of law provisions.
        </Typography>

        <Typography variant="h6" gutterBottom>
          12. Contact Information
        </Typography>
        <Typography variant="body1" paragraph>
          If you have any questions about these Terms, please contact us at john.charles.dickerson@gmail.com.
        </Typography>
      </Paper>
    </Container>
  );
};