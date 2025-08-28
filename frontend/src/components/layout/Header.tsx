import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  useTheme, 
  useMediaQuery
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useAccount } from 'wagmi';

interface HeaderProps {
  onMobileToggle: () => void;
  mobileOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMobileToggle }) => {
  const theme = useTheme();
  const { isConnected } = useAccount();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Hamburger menu - only show on small screens when authenticated */}
        {isSmallScreen && isConnected && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMobileToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          My Interests
        </Typography>
        
        <w3m-button />
      </Toolbar>
    </AppBar>
  );
};