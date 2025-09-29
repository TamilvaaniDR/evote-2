import React, { useState } from 'react';
import { Box, Container, Tabs, Tab, Typography, Card, CardContent, Button, TextField, Alert } from '@mui/material';
import LoginForm from '../components/Auth/LoginForm';
import { voterAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/Auth/RegisterForm';

const LoginPage: React.FC = () => {
  const [tab, setTab] = useState<'admin' | 'voter'>('admin');
  const [identifier, setIdentifier] = useState('');
  const [voterMessage, setVoterMessage] = useState('');
  const [error, setError] = useState('');
  const [registerOpen, setRegisterOpen] = useState(false);
  const navigate = useNavigate();

  const handleVoterContinue = async () => {
    try {
      setError('');
      setVoterMessage('');
      if (!identifier.trim()) {
        setError('Please enter your Voter ID / Email / Phone');
        return;
      }
      // Minimal flow: send identify request without election to help user proceed
      // In a real flow you might list active elections after identify
      setVoterMessage('Identification received. Redirecting to Home to pick an election...');
      setTimeout(() => navigate('/home'), 800);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to proceed');
    }
  };

  return (
    <Container maxWidth="md" sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background:
        'radial-gradient(1000px 500px at 10% -10%, rgba(99,102,241,0.15), transparent), radial-gradient(700px 400px at 100% 0%, rgba(56,189,248,0.12), transparent)'
    }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Welcome back
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Choose your role to continue. New to the platform? Sign up below.
        </Typography>
      </Box>

      <Card sx={{ width: '100%', backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.9)', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}>
        <CardContent>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            centered
            aria-label="role switcher"
          >
            <Tab label="Admin" value="admin" sx={{ textTransform: 'none', fontWeight: 600 }} />
            <Tab label="Voter" value="voter" sx={{ textTransform: 'none', fontWeight: 600 }} />
          </Tabs>

          <Box sx={{ mt: 3 }}>
            {tab === 'admin' && (
              <Box>
                <LoginForm />
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Don’t have an admin account?
                  </Typography>
                  <Button variant="outlined" onClick={() => setRegisterOpen(true)} sx={{ textTransform: 'none' }}>Sign up as Admin</Button>
                </Box>
              </Box>
            )}

            {tab === 'voter' && (
              <Box>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                )}
                {voterMessage && (
                  <Alert severity="success" sx={{ mb: 2 }}>{voterMessage}</Alert>
                )}
                <Typography variant="subtitle1" gutterBottom>
                  Continue as Voter
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Enter your Voter ID, email, or phone number to proceed.
                </Typography>
                <TextField
                  fullWidth
                  label="Voter ID / Email / Phone"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button variant="contained" onClick={handleVoterContinue} sx={{ textTransform: 'none' }}>Continue</Button>
                </Box>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      <RegisterForm open={registerOpen} onClose={() => setRegisterOpen(false)} />
    </Container>
  );
};

export default LoginPage;
