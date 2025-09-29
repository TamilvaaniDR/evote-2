import React from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const VoteSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        
        <Typography variant="h4" component="h1" gutterBottom>
          Vote Submitted Successfully!
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Thank you for participating in the election. Your vote has been recorded securely.
        </Typography>

        <Card sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
          <CardContent>
            <Alert severity="success" sx={{ mb: 2 }}>
              Your vote has been successfully cast and recorded in the system.
            </Alert>
            <Typography variant="body2" color="text.secondary">
              You can view the election results once they are published by the administrators.
            </Typography>
          </CardContent>
        </Card>

        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          size="large"
        >
          Return to Home
        </Button>
      </Box>
    </Container>
  );
};

export default VoteSuccess;





