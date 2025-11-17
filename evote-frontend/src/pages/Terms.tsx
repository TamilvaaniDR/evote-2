import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import PublicLayout from '../components/Layout/PublicLayout';

const Terms: React.FC = () => {
  return (
    <PublicLayout>
      <Box sx={{ py: 8, backgroundColor: (t) => t.palette.background.default }}>
        <Container maxWidth="md">
          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>Terms of Use</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              By using this system, you agree to cast one vote per election and refrain from any attempt to compromise the integrity of the process.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Violations may lead to suspension of access and audit review.
            </Typography>
          </Paper>
        </Container>
      </Box>
    </PublicLayout>
  );
};

export default Terms;















