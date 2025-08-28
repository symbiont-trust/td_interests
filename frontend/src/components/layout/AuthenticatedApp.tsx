import React, { useState } from 'react';
import {
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useAccount } from 'wagmi';
import { Routes, Route } from 'react-router-dom';
import { UserSearch } from '../users/UserSearch';
import { HomePage } from '../home/HomePage';
import { ConnectionsPage } from '../connections/ConnectionsPage';
import { PrivateMessagesPage } from '../messages/PrivateMessagesPage';
import { ThreadView } from '../messages/ThreadView';
import { NewMessagePage } from '../messages/NewMessagePage';
import { PublicThreadsPage } from '../publicThreads/PublicThreadsPage';
import { PublicThreadView } from '../publicThreads/PublicThreadView';
import { NewPublicThreadPage } from '../publicThreads/NewPublicThreadPage';
import { NavigationMenu } from './NavigationMenu';
import { SettingsPage } from '../settings/SettingsPage';

export const AuthenticatedApp: React.FC = () => {
  const theme = useTheme();
  const { isConnected } = useAccount();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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
        width: isConnected && !isSmallScreen ? 'calc(100% - 280px)' : '100%'
      }}>
        <Box sx={{ 
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          backgroundColor: theme.palette.grey[50]
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
      </Box>
    </Box>
  );
};