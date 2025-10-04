import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, Chip, Button, Alert, CircularProgress } from '@mui/material';
import { HowToVote as VoteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { voterAPI } from '../../services/api';
import { Election } from '../../types';

const VoterElections: React.FC = () => {
  const navigate = useNavigate();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await voterAPI.getElections();
        setElections(res.elections || []);
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Failed to load elections');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 2 }}>Elections</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={3}>
        {elections.map((e) => (
          <Grid key={e._id} item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6">{e.title}</Typography>
                  <Chip label={e.status} color={e.status === 'running' ? 'success' : e.status === 'closed' ? 'error' : 'default'} size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{e.description}</Typography>
                {e.status === 'running' ? (
                  <Button variant="contained" startIcon={<VoteIcon />} onClick={() => navigate(`/vote/${e._id}`)}>Vote Now</Button>
                ) : (
                  <Button variant="outlined" disabled>Voting Not Available</Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {elections.length === 0 && !error && (
        <Alert severity="info" sx={{ mt: 2 }}>No elections available.</Alert>
      )}
    </Container>
  );
};

export default VoterElections;







