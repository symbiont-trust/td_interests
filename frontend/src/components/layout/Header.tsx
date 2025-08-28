import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

function WalletConnection() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <Box>
      {isConnected ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: 'inherit' }}>
            {address?.substring(0, 6)}...{address?.substring(38)}
          </Typography>
          <Button 
            color="inherit" 
            onClick={() => disconnect()}
            variant="outlined"
            size="small"
          >
            Disconnect
          </Button>
        </Box>
      ) : (
        <Button 
          color="inherit" 
          onClick={() => connect({ connector: injected() })}
          variant="outlined"
        >
          Connect Wallet
        </Button>
      )}
    </Box>
  );
}

export const Header: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          My Interests
        </Typography>
        <WalletConnection />
      </Toolbar>
    </AppBar>
  );
};