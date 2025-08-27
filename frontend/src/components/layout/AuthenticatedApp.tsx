import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Settings as SettingsIcon, AccountCircle } from '@mui/icons-material';
import { useAccount, useDisconnect } from 'wagmi';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { jwtHelper } from '../../utils/auth/jwtHelper';
import { axiosHelper } from '../../utils/api/axiosHelper';
import { UserSearch } from '../users/UserSearch';
import { HomePage } from '../home/HomePage';
import { ConnectionsPage } from '../connections/ConnectionsPage';
import { PrivateMessagesPage } from '../messages/PrivateMessagesPage';
import { ThreadView } from '../messages/ThreadView';
import { NewMessagePage } from '../messages/NewMessagePage';
import { PublicThreadsPage } from '../publicThreads/PublicThreadsPage';
import { PublicThreadView } from '../publicThreads/PublicThreadView';
import { NewPublicThreadPage } from '../publicThreads/NewPublicThreadPage';
import { NotificationBell } from '../notifications/NotificationBell';
import { NavigationMenu, NavigationToggle } from './NavigationMenu';
import { SettingsPage } from '../settings/SettingsPage';
import { Footer } from './Footer';

interface AuthenticatedAppProps {
  onLogout: () => void;
}

export const AuthenticatedApp: React.FC<AuthenticatedAppProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [axiosInstance, setAxiosInstance] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Create axios instance for notifications
    const instance = axiosHelper.createSecuredAxiosInstance(navigate);
    setAxiosInstance(instance);
  }, [navigate]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    jwtHelper.clearAll();
    disconnect();
    onLogout();
    handleClose();
  };

  const handleSettings = () => {
    navigate('/settings');
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {isConnected && (
        <NavigationMenu 
          mobileOpen={mobileOpen} 
          onMobileToggle={handleDrawerToggle} 
        />
      )}
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        flexGrow: 1,
        minHeight: '100vh',
        width: isConnected && !isSmallScreen ? 'calc(100% - 280px)' : '100%'
      }}>
        <AppBar position="static" sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          ...(isConnected && !isSmallScreen && { 
            width: 'calc(100% - 280px)', 
            ml: '280px' 
          })
        }}>
          <Toolbar>
            {isConnected && (
              <NavigationToggle onToggle={handleDrawerToggle} />
            )}
            
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              My Interests
            </Typography>
            
            {isConnected && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {address?.substring(0, 6)}...{address?.substring(38)}
                </Typography>
                {axiosInstance && (
                  <NotificationBell axiosInstance={axiosInstance} />
                )}
                <IconButton
                  size="large"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleSettings}>
                    <SettingsIcon sx={{ mr: 1 }} />
                    Settings
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        <Box sx={{ 
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          backgroundColor: theme.palette.grey[50],
          minHeight: 'calc(100vh - 64px)'
        }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<UserSearch />} />
            <Route path="/connections" element={<ConnectionsPage />} />
            <Route path="/messages" element={<PrivateMessagesPage />} />
            <Route path="/messages/new" element={<NewMessagePage />} />
            <Route path="/messages/thread/:threadId" element={<ThreadView />} />
            <Route path="/public-threads" element={<PublicThreadsPage />} />
            <Route path="/public-threads/new" element={<NewPublicThreadPage />} />
            <Route path="/public-threads/:threadId" element={<PublicThreadView />} />
            <Route path="/profile/:walletAddress" element={<div>User Profile - Coming Soon</div>} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Box>
        
        <Footer />
      </Box>
    </Box>
  );
};