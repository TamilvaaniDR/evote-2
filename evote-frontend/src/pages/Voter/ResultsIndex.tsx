import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { voterAPI } from '../../services/api';
import { Election } from '../../types';
import dayjs from 'dayjs';

const ResultsIndex: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElections = async () => {
      try {
        setLoading(true);
        // Fetch only elections with published/ended results
        const response = await voterAPI.getResultsFeed();
        setElections(response.elections || []);
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load elections');
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  const handleViewResults = (electionId: string) => {
    navigate(`/results/${electionId}`);
  };

  const getElectionStatus = (election: Election) => {
    const now = dayjs();
    const startAt = dayjs(election.startAt);
    const endAt = dayjs(election.endAt);

    if (now.isBefore(startAt)) {
      return { status: 'upcoming', color: 'default' as const };
    } else if (now.isAfter(endAt)) {
      return { status: 'completed', color: 'success' as const };
    } else {
      return { status: 'active', color: 'primary' as const };
    }
  };

  const formatDate = (date: string) => {
    return dayjs(date).format('MMM DD, YYYY HH:mm');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Result
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View results for completed elections
        </Typography>
      </Box>

      {elections.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center">
              No elections available
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {elections.map((election) => {
            const { status, color } = getElectionStatus(election);
            // Results feed already returns ended/published elections; allow viewing by default
            const canViewResults = true;

            return (
              <Grid item xs={12} md={6} lg={4} key={election._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {election.title}
                      </Typography>
                      <Chip 
                        label={status.charAt(0).toUpperCase() + status.slice(1)} 
                        color={color} 
                        size="small" 
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {election.description}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Start: {formatDate(election.startAt)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        End: {formatDate(election.endAt)}
                      </Typography>
                    </Box>

                    {!canViewResults && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        {status === 'upcoming' 
                          ? 'Results will be available after the election ends'
                          : 'Results will be available after the election ends'
                        }
                      </Alert>
                    )}
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      onClick={() => handleViewResults(election._id)}
                      disabled={!canViewResults}
                      fullWidth
                    >
                      {canViewResults ? 'View Results' : 'Results Not Available'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default ResultsIndex;


