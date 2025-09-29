import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface VoterCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const VoterCard: React.FC<VoterCardProps> = ({ title, description, children }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {description}
          </Typography>
        )}
        <Box mt={1}>{children}</Box>
      </CardContent>
    </Card>
  );
};

export default VoterCard;
