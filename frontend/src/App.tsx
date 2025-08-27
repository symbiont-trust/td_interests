import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Container, AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { jwtHelper } from './utils/auth/jwtHelper'
import { RegistrationForm } from './components/auth/RegistrationForm'
import { LoginForm } from './components/auth/LoginForm'
import { AuthenticatedApp } from './components/layout/AuthenticatedApp'
import { Footer } from './components/layout/Footer'
import { TermsPage } from './components/legal/TermsPage'
import { PrivacyPage } from './components/legal/PrivacyPage'
import { ContactPage } from './components/legal/ContactPage'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function WalletConnection() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <Box sx={{ flexGrow: 1 }}>
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
  )
}

function WelcomePage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Interests
          </Typography>
          <WalletConnection />
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to My Interests
          </Typography>
          <Typography variant="h5" component="h2" color="text.secondary">
            Connect based on shared interests, communicate, and build meaningful connections.
          </Typography>
          
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              size="large"
              href="/login"
            >
              Login
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              href="/register"
            >
              Register
            </Button>
          </Box>
        </Box>
      </Container>
      
      <Footer />
    </Box>
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const token = jwtHelper.getJWTToken()
    if (token && !jwtHelper.isTokenExpired(token)) {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleAuthenticationSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Legal pages available to all users */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          {isAuthenticated ? (
            <>
              <Route path="/*" element={<AuthenticatedApp onLogout={handleLogout} />} />
            </>
          ) : (
            <>
              <Route path="/" element={<WelcomePage />} />
              <Route 
                path="/register" 
                element={<RegistrationForm onRegistrationSuccess={handleAuthenticationSuccess} />} 
              />
              <Route 
                path="/login" 
                element={<LoginForm onLoginSuccess={handleAuthenticationSuccess} />} 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App