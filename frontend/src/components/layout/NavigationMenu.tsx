import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
  Box,
  Divider,
  Typography
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  Message as MessageIcon,
  Forum as ForumIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';

interface NavigationMenuProps {
  mobileOpen: boolean;
  onMobileToggle: () => void;
}

interface NavItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  dividerAfter?: boolean;
}

const navItems: NavItem[] = [
  { text: 'Home', icon: <HomeIcon />, path: '/' },
  { text: 'Search Users', icon: <SearchIcon />, path: '/search' },
  { text: 'Connections', icon: <PeopleIcon />, path: '/connections' },
  { text: 'Private Messages', icon: <MessageIcon />, path: '/messages', dividerAfter: true },
  { text: 'Public Threads', icon: <ForumIcon />, path: '/public-threads' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' }
];

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ mobileOpen, onMobileToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { address } = useAccount();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleNavClick = (path: string) => {
    navigate(path);
    if (isSmallScreen) {
      onMobileToggle();
    }
  };

  const drawerWidth = 280;

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
          My Interests
        </Typography>
        {address && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {address.substring(0, 6)}...{address.substring(38)}
          </Typography>
        )}
      </Box>
      
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {navItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavClick(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main + '20',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main + '30',
                    },
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: location.pathname === item.path 
                      ? theme.palette.primary.main 
                      : theme.palette.text.secondary,
                    minWidth: 40
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{
                    color: location.pathname === item.path
                      ? theme.palette.primary.main
                      : theme.palette.text.primary
                  }}
                />
              </ListItemButton>
            </ListItem>
            {item.dividerAfter && (
              <Divider sx={{ mx: 2, my: 1 }} />
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  if (isSmallScreen) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          position: 'relative',
          height: '100%',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export const NavigationToggle: React.FC<{ onToggle: () => void }> = ({ onToggle }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  if (!isSmallScreen) {
    return null;
  }

  return (
    <IconButton
      color="inherit"
      edge="start"
      onClick={onToggle}
      sx={{ mr: 2 }}
    >
      <MenuIcon />
    </IconButton>
  );
};