import React, { useEffect, useRef } from 'react';
import { Container, Box, Typography, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useVoter } from '../../contexts/VoterContext';

const VoterLogout: React.FC = () => {
  const navigate = useNavigate();
  const { logoutVoter } = useVoter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    logoutVoter();
    const t = setTimeout(() => navigate('/'), 2000);
    return () => clearTimeout(t);
  }, [logoutVoter, navigate]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>Signed out</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              You have been logged out. Redirecting to Home...
            </Typography>
            <Button variant="contained" onClick={() => navigate('/')}>Go to Home</Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default VoterLogout;


