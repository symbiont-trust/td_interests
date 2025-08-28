import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Container, Box } from '@mui/material'
import { jwtHelper } from './utils/auth/jwtHelper'
import { RegistrationForm } from './components/auth/RegistrationForm'
import { LoginForm } from './components/auth/LoginForm'
import { AuthenticatedApp } from './components/layout/AuthenticatedApp'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { WelcomeContent } from './components/welcome/WelcomeContent'
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
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
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
                  <Route path="/" element={<WelcomeContent />} />
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
          </Container>
          
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  )
}

export default App