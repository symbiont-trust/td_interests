import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Button,
    Box,
    Alert,
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Error as ErrorIcon,
    Home as HomeIcon,
    ContentCopy as CopyIcon,
    Email as EmailIcon
} from '@mui/icons-material';
import { axiosHelper } from '../../utils/api/axiosHelper';

const ErrorPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [adminEmail, setAdminEmail] = useState<string>('');
    const [copySuccess, setCopySuccess] = useState(false);

    const errorMessage = searchParams.get('message') || 'An unexpected error occurred';
    const errorCode = searchParams.get('code') || 'UNKNOWN_ERROR';
    const errorUrl = searchParams.get('url') || '';

    useEffect(() => {
        const fetchAdminEmail = async () => {
            try {
                const unsecuredAxios = axiosHelper.createUnsecuredAxiosInstance(navigate);
                const response = await unsecuredAxios.get('/api/config/admin-email');
                setAdminEmail(response.data.adminEmail);
            } catch (error) {
                console.error('Failed to fetch admin email:', error);
                setAdminEmail('admin@myinterests.com'); // Fallback
            }
        };

        fetchAdminEmail();
    }, [navigate]);

    const handleCopyError = async () => {
        const errorDetails = `Error Code: ${errorCode}
Error Message: ${errorMessage}
${errorUrl ? `Error URL: ${errorUrl}` : ''}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}`;

        try {
            await navigator.clipboard.writeText(errorDetails);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);
        } catch (err) {
            console.error('Failed to copy error details:', err);
        }
    };

    const handleEmailAdmin = () => {
        const subject = encodeURIComponent(`My Interests Error Report - ${errorCode}`);
        const body = encodeURIComponent(`Hello,

I encountered an error while using My Interests:

Error Code: ${errorCode}
Error Message: ${errorMessage}
${errorUrl ? `Error URL: ${errorUrl}` : ''}
Timestamp: ${new Date().toISOString()}

Please let me know if you need any additional information.

Best regards`);
        
        window.open(`mailto:${adminEmail}?subject=${subject}&body=${body}`);
    };

    const getErrorTitle = (code: string) => {
        switch (code) {
            case 'USER_ALREADY_EXISTS':
                return 'Account Already Exists';
            case 'USER_NOT_FOUND':
                return 'Account Not Found';
            case 'INVALID_SIGNATURE':
                return 'Authentication Failed';
            case 'NETWORK_ERROR':
                return 'Connection Problem';
            default:
                return 'Error Occurred';
        }
    };

    const getErrorIcon = (code: string) => {
        return <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />;
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    {getErrorIcon(errorCode)}
                    <Typography variant="h4" component="h1" gutterBottom color="error">
                        {getErrorTitle(errorCode)}
                    </Typography>
                </Box>

                <Alert severity="error" sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Error:</strong> {errorMessage}
                    </Typography>
                    {errorCode !== 'UNKNOWN_ERROR' && (
                        <Typography variant="body2" color="text.secondary">
                            Error Code: {errorCode}
                        </Typography>
                    )}
                </Alert>

                <Typography variant="body1" paragraph>
                    We apologize for this inconvenience. Here are some steps you can try:
                </Typography>

                <Box component="ul" sx={{ mb: 3 }}>
                    <li>Refresh the page and try again</li>
                    <li>Clear your browser cache and cookies</li>
                    <li>Try using a different browser</li>
                    <li>Check your internet connection</li>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                    Need Further Help?
                </Typography>
                
                <Typography variant="body2" paragraph color="text.secondary">
                    If the error persists, please contact our administrator with the error details below:
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <Button
                        variant="outlined"
                        startIcon={<EmailIcon />}
                        onClick={handleEmailAdmin}
                        disabled={!adminEmail}
                    >
                        Email Admin
                    </Button>
                    
                    <Button
                        variant="outlined"
                        startIcon={<CopyIcon />}
                        onClick={handleCopyError}
                        color={copySuccess ? 'success' : 'primary'}
                    >
                        {copySuccess ? 'Copied!' : 'Copy Error Details'}
                    </Button>
                </Box>

                {adminEmail && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Admin Email: {adminEmail}
                    </Typography>
                )}

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<HomeIcon />}
                        onClick={() => navigate('/')}
                    >
                        Go Home
                    </Button>
                    
                    <Button
                        variant="outlined"
                        onClick={() => navigate(-1)}
                    >
                        Go Back
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default ErrorPage;