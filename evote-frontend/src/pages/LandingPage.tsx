import React from 'react';
import { Box, Button, Container, Typography, Grid, Card, CardContent, Chip, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/Layout/PublicLayout';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <Box sx={{
        backgroundColor: (t) => t.palette.background.default,
        color: (t) => t.palette.text.primary,
        minHeight: '100vh',
        pt: { xs: 10, md: 14 },
        pb: 10,
      }}>
      {/* Hero */}
      <Container maxWidth="lg">
        <Box textAlign="center" sx={{ mb: 8, position: 'relative' }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
            Vote with Confidence
          </Typography>
          <Typography variant="h6" sx={{ color: (t) => t.palette.text.secondary, maxWidth: 820, mx: 'auto' }}>
            A secure, transparent and delightful online voting experience for institutions and organizations.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mt: 4 }}>
            <Button variant="contained" size="large" color="primary" onClick={() => navigate('/login')}>
              Get Started
            </Button>
            <Button variant="outlined" size="large" color="inherit" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
              Learn More
            </Button>
          </Stack>
          {/* Footer already contains Terms and Contact links */}
        </Box>

        {/* Feature highlights */}
        <Grid container spacing={3} sx={{ mb: 10 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', backgroundColor: (t) => t.palette.background.paper, border: (t) => `1px solid ${t.palette.divider}`, transition: 'transform .2s ease', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>End‑to‑End Integrity</Typography>
                <Typography variant="body2" color="text.secondary">
                  Enforced one‑vote policy with cryptographically secure tokens and audit logging.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', backgroundColor: (t) => t.palette.background.paper, border: (t) => `1px solid ${t.palette.divider}`, transition: 'transform .2s ease', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>OTP Verification</Typography>
                <Typography variant="body2" color="text.secondary">
                  Voter identity verified using one‑time passwords to prevent impersonation.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', backgroundColor: (t) => t.palette.background.paper, border: (t) => `1px solid ${t.palette.divider}`, transition: 'transform .2s ease', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Live Analytics</Typography>
                <Typography variant="body2" color="text.secondary">
                  Real‑time turnout and results dashboards for administrators and observers.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tech stack */}
        <Box textAlign="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>Powered by</Typography>
          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
            <Chip label="React 18" variant="outlined" sx={{ borderColor: (t) => t.palette.divider }} />
            <Chip label="TypeScript" variant="outlined" sx={{ borderColor: (t) => t.palette.divider }} />
            <Chip label="Material‑UI" variant="outlined" sx={{ borderColor: (t) => t.palette.divider }} />
            <Chip label="Node.js" variant="outlined" sx={{ borderColor: (t) => t.palette.divider }} />
            <Chip label="Express" variant="outlined" sx={{ borderColor: (t) => t.palette.divider }} />
            <Chip label="MongoDB" variant="outlined" sx={{ borderColor: (t) => t.palette.divider }} />
          </Stack>
        </Box>
      </Container>
    </Box>
    </PublicLayout>
  );
};

export default LandingPage;
