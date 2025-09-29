import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { Election } from '../../types';
import dayjs from 'dayjs';

const Results: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getElections();
        setElections(res.elections);
      } catch (e: any) {
        setError(e.response?.data?.error || 'Failed to load elections');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const published = useMemo(() => elections.filter(e => e.resultsPublished), [elections]);
  const awaiting = useMemo(() => elections.filter(e => !e.resultsPublished), [elections]);

  const timeLeft = (endAt: string) => {
    const diff = dayjs(endAt).diff(dayjs(), 'second');
    if (diff <= 0) return 'any moment now';
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return `${h}h ${m}m ${s}s`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Election Results
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View published results and track elections awaiting result publication
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography variant="h6" sx={{ mb: 2 }}>Published</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {published.map(e => (
          <Grid item xs={12} md={6} lg={4} key={e._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6">{e.title}</Typography>
                  <Chip label="Published" color="success" size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {e.description}
                </Typography>
                <Button variant="outlined" onClick={() => navigate(`/results/${e._id}`)}>View Results</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {published.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">No published results yet.</Alert>
          </Grid>
        )}
      </Grid>

      <Typography variant="h6" sx={{ mb: 2 }}>Awaiting Publication</Typography>
      <Grid container spacing={3}>
        {awaiting.map(e => (
          <Grid item xs={12} md={6} lg={4} key={e._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6">{e.title}</Typography>
                  <Chip label={e.status} color={e.status === 'running' ? 'warning' : 'default'} size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {e.description}
                </Typography>
                <Alert severity="info" sx={{ mb: 1 }}>
                  Results will be displayed in {timeLeft(e.endAt)}
                </Alert>
                <Button variant="text" onClick={() => navigate(`/admin/elections/${e._id}`)}>View Election</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {awaiting.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="success">All results are published.</Alert>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Results;
