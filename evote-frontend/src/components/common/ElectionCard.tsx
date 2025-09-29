import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Button } from '@mui/material';

export interface ElectionSummary {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'running' | 'closed';
  startAt?: string;
  endAt?: string;
  resultsPublished?: boolean;
}

interface ElectionCardProps {
  election: ElectionSummary;
  onPrimary?: () => void;
  primaryText?: string;
  onSecondary?: () => void;
  secondaryText?: string;
}

const ElectionCard: React.FC<ElectionCardProps> = ({ election, onPrimary, primaryText, onSecondary, secondaryText }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'success';
      case 'closed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6">{election.title}</Typography>
          <Chip size="small" label={election.status} color={getStatusColor(election.status) as any} />
        </Box>
        {election.description && (
          <Typography variant="body2" color="text.secondary" mb={2}>{election.description}</Typography>
        )}
        <Box display="flex" gap={1} flexWrap="wrap">
          {onPrimary && (
            <Button variant="contained" onClick={onPrimary}>{primaryText || 'Open'}</Button>
          )}
          {onSecondary && (
            <Button variant="outlined" onClick={onSecondary}>{secondaryText || 'View'}</Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ElectionCard;
