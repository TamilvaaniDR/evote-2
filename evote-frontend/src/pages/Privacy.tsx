import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import PublicLayout from '../components/Layout/PublicLayout';

const Privacy: React.FC = () => {
  return (
    <PublicLayout>
      <Box sx={{ py: 8, backgroundColor: (t) => t.palette.background.default }}>
        <Container maxWidth="md">
          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>Privacy Policy</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              We respect your privacy. This application only collects the minimum required information to verify voter identity and run elections. Personal data is never shared with third parties and is stored securely.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              For any concerns, please contact our support team.
            </Typography>
          </Paper>
        </Container>
      </Box>
    </PublicLayout>
  );
};

export default Privacy;















