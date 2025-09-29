import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
} from '@mui/material';
import { Election } from '../../types';
import { format } from 'date-fns';

interface RecentElectionsProps {
  elections: Election[];
}

const RecentElections: React.FC<RecentElectionsProps> = ({ elections }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'running':
        return 'success';
      case 'closed':
        return 'error';
      default:
        return 'default';
    }
  };

  const safeFormatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return format(d, 'MMM dd, yyyy HH:mm');
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Elections
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell align="right">Voters</TableCell>
                <TableCell align="right">Turnout</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {elections.map((election) => (
                <TableRow key={election._id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {election.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={election.status}
                      color={getStatusColor(election.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {safeFormatDate(election.startAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {safeFormatDate(election.endAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {election.eligibleVoterCount}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {election.turnoutCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({election.eligibleVoterCount > 0 
                          ? Math.round((election.turnoutCount / election.eligibleVoterCount) * 100)
                          : 0}%)
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default RecentElections;





