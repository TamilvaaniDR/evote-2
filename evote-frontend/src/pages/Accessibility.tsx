import React from 'react';
import { Box, Container, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import PublicLayout from '../components/Layout/PublicLayout';

const Accessibility: React.FC = () => {
  return (
    <PublicLayout>
      <Box sx={{ py: 8, backgroundColor: (t) => t.palette.background.default }}>
        <Container maxWidth="md">
          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>Accessibility</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              This site aims to meet WCAG 2.1 AA guidelines. If you encounter accessibility barriers, please let us know.
            </Typography>
            <List>
              <ListItem><ListItemText primary="Keyboard navigable" /></ListItem>
              <ListItem><ListItemText primary="High contrast and focus indicators" /></ListItem>
              <ListItem><ListItemText primary="ARIA labels on interactive elements" /></ListItem>
            </List>
          </Paper>
        </Container>
      </Box>
    </PublicLayout>
  );
};

export default Accessibility;














