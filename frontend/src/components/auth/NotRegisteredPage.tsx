import React from 'react';
import {
    Container,
    Paper,
    Typography,
    Button,
    Box,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import InfoIcon from '@mui/icons-material/Info';

const NotRegisteredPage: React.FC = () => {
    const navigate = useNavigate();

    const handleRegister = () => {
        navigate('/register');
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ mb: 3 }}>
                    <InfoIcon sx={{ fontSize: 64, color: 'info.main', mb: 2 }} />
                </Box>
                
                <Typography variant="h4" component="h1" gutterBottom>
                    Account Not Found
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Your wallet is connected, but we couldn't find your account in our system.
                </Typography>
                
                <Alert severity="info" sx={{ mb: 3 }}>
                    To access the application, you'll need to complete the registration process.
                </Alert>
                
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<PersonAddIcon />}
                    onClick={handleRegister}
                    sx={{ mt: 2 }}
                >
                    Complete Registration
                </Button>
            </Paper>
        </Container>
    );
};

export default NotRegisteredPage;