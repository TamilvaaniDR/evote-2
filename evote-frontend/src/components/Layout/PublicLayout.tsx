import React from 'react';
import { AppBar, Toolbar, Container, Typography, Box, Button, Stack, Link as MuiLink } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

type PublicLayoutProps = {
  children: React.ReactNode;
};

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0b1021' }}>
      <AppBar position="sticky" elevation={0} sx={{ background: 'rgba(10, 15, 30, 0.8)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Toolbar sx={{ py: 1.5 }}>
          <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ cursor: 'pointer' }} onClick={() => navigate('/') }>
              <Box component="img" src="/logo192.png" alt="E-Vote" sx={{ width: 32, height: 32 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>E‑Voting</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5}>
              <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
              <Button variant="contained" color="primary" onClick={() => navigate('/login')}>Get Started</Button>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flex: 1 }}>{children}</Box>

      <Box component="footer" sx={{ borderTop: '1px solid rgba(255,255,255,0.08)', py: 4, background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', color: 'rgba(255,255,255,0.85)' }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
            <Typography variant="body2">© {new Date().getFullYear()} E‑Voting. All rights reserved.</Typography>
            <Stack direction="row" spacing={2}>
              <MuiLink component={RouterLink} to="/privacy" underline="hover" color="inherit" sx={{ opacity: 0.9 }}>Privacy</MuiLink>
              <MuiLink component={RouterLink} to="/terms" underline="hover" color="inherit" sx={{ opacity: 0.9 }}>Terms</MuiLink>
              <MuiLink component={RouterLink} to="/contact" underline="hover" color="inherit" sx={{ opacity: 0.9 }}>Contact</MuiLink>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default PublicLayout;


