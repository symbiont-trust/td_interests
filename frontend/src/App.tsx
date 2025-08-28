import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Container, Box, useTheme, useMediaQuery } from '@mui/material'
import { useAccount } from 'wagmi'
import { jwtHelper } from './utils/auth/jwtHelper'
import { RegistrationForm } from './components/auth/RegistrationForm'
import { LoginForm } from './components/auth/LoginForm'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { NavigationMenu } from './components/layout/NavigationMenu'
import { WelcomeContent } from './components/welcome/WelcomeContent'
import { TermsPage } from './components/legal/TermsPage'
import { PrivacyPage } from './components/legal/PrivacyPage'
import { ContactPage } from './components/legal/ContactPage'
// Authenticated page imports
import { UserSearch } from './components/users/UserSearch'
import { HomePage } from './components/home/HomePage'
import { ConnectionsPage } from './components/connections/ConnectionsPage'
import { PrivateMessagesPage } from './components/messages/PrivateMessagesPage'
import { ThreadView } from './components/messages/ThreadView'
import { NewMessagePage } from './components/messages/NewMessagePage'
import { PublicThreadsPage } from './components/publicThreads/PublicThreadsPage'
import { PublicThreadView } from './components/publicThreads/PublicThreadView'
import { NewPublicThreadPage } from './components/publicThreads/NewPublicThreadPage'
import { SettingsPage } from './components/settings/SettingsPage'

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


function AppContent() {
  const theme = useTheme();
  const { isConnected } = useAccount();
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    // Check if user is already authenticated AND wallet is connected
    const token = jwtHelper.getJWTToken()
    if (token && !jwtHelper.isTokenExpired(token) && isConnected) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
    setLoading(false)
  }, [isConnected])

  // Clear authentication when wallet disconnects
  useEffect(() => {
    if (!isConnected && isAuthenticated) {
      setIsAuthenticated(false)
      // Optionally clear stored tokens
      // jwtHelper.clearTokens()
    }
  }, [isConnected, isAuthenticated])

  const handleAuthenticationSuccess = () => {
    setIsAuthenticated(true)
  }


  if (loading) {
    return <div>Loading...</div>
  }

  // Protected route wrapper
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', maxWidth: '1100px', border: '1px solid black' }}>
      <Header 
        onMobileToggle={handleDrawerToggle}
        mobileOpen={mobileOpen}
      />
      
      {/* Main layout with sidebar placeholder */}
      <Box sx={{ display: 'flex', flexGrow: 1, minHeight: 0 }}>
        {/* Sidebar placeholder - only on large screens when authenticated */}
        {isAuthenticated && !isSmallScreen && isConnected && (
          <NavigationMenu 
            mobileOpen={false} 
            onMobileToggle={() => {}}
            isDesktop={true}
          />
        )}
        
        {/* Mobile drawer - only on small screens when authenticated */}
        {isAuthenticated && isSmallScreen && isConnected && (
          <NavigationMenu 
            mobileOpen={mobileOpen} 
            onMobileToggle={handleDrawerToggle}
            isDesktop={false}
          />
        )}
        
        {/* Main content area */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          flexGrow: 1,
          minWidth: 0 // Prevent flex item from overflowing
        }}>
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
            <Routes>
              {/* Public routes */}
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/register" element={<RegistrationForm onRegistrationSuccess={handleAuthenticationSuccess} />} />
              <Route path="/login" element={<LoginForm onLoginSuccess={handleAuthenticationSuccess} />} />
              
              {/* Home route - conditional */}
              <Route path="/" element={isAuthenticated ? <HomePage /> : <WelcomeContent />} />
              
              {/* Protected routes */}
              <Route path="/search" element={<ProtectedRoute><UserSearch /></ProtectedRoute>} />
              <Route path="/connections" element={<ProtectedRoute><ConnectionsPage /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><PrivateMessagesPage /></ProtectedRoute>} />
              <Route path="/messages/new" element={<ProtectedRoute><NewMessagePage /></ProtectedRoute>} />
              <Route path="/messages/thread/:threadId" element={<ProtectedRoute><ThreadView /></ProtectedRoute>} />
              <Route path="/public-threads" element={<ProtectedRoute><PublicThreadsPage /></ProtectedRoute>} />
              <Route path="/public-threads/new" element={<ProtectedRoute><NewPublicThreadPage /></ProtectedRoute>} />
              <Route path="/public-threads/:threadId" element={<ProtectedRoute><PublicThreadView /></ProtectedRoute>} />
              <Route path="/profile/:walletAddress" element={<ProtectedRoute><div>User Profile - Coming Soon</div></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Container>
        </Box>
      </Box>
      
      {/* Footer - spans full width */}
      <Footer />
    </Box>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  )
}

export default App