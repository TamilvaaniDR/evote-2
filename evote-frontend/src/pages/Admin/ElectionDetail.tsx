import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { Election } from '../../types';
import dayjs from 'dayjs';

const ElectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [election, setElection] = useState<(Election & { voterCount?: number; voteCount?: number }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await adminAPI.getElection(id);
      setElection(res.election);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to load election');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { reload(); }, [reload]);

  const statusColor = useMemo(() => {
    switch (election?.status) {
      case 'draft': return 'default';
      case 'running': return 'success';
      case 'closed': return 'error';
      default: return 'default';
    }
  }, [election?.status]);

  const timeWindow = () => {
    if (!election) return '';
    const start = dayjs(election.startAt).format('MMM DD, YYYY HH:mm');
    const end = dayjs(election.endAt).format('MMM DD, YYYY HH:mm');
    return `${start} → ${end}`;
    };

  const handleStart = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await adminAPI.startElection(id);
      await reload();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to start election');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnd = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await adminAPI.endElection(id);
      await reload();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to end election');
    } finally {
      setActionLoading(false);
    }
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
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      </Container>
    );
  }

  if (!election) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 2 }}>Election not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {election.title}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={election.status} color={statusColor as any} size="small" />
            <Typography variant="body2" color="text.secondary">{timeWindow()}</Typography>
          </Stack>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate('/admin/elections')}>Back to Elections</Button>
          {election.status === 'draft' && (
            <Button variant="contained" color="success" onClick={handleStart} disabled={actionLoading}>Start</Button>
          )}
          {election.status === 'running' && (
            <Button variant="contained" color="error" onClick={handleEnd} disabled={actionLoading}>End & Publish</Button>
          )}
          <Button variant="outlined" onClick={() => navigate(`/results/${election._id}`)}>View Public Results</Button>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Description</Typography>
              <Typography variant="body1" color="text.secondary">{election.description || '—'}</Typography>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Candidates</Typography>
              {election.candidates.map(c => (
                <Box key={c.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #eee' }}>
                  <Typography>{c.name}</Typography>
                  <Typography variant="body2" color="text.secondary">ID: {c.id}</Typography>
                </Box>
              ))}
              {election.candidates.length === 0 && (
                <Alert severity="info">No candidates configured.</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Statistics</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 1 }}>
                <Typography color="text.secondary">Eligible</Typography>
                <Typography>{election.eligibleVoterCount}</Typography>
                <Typography color="text.secondary">Turnout</Typography>
                <Typography>{election.turnoutCount}</Typography>
                {'voteCount' in election && (
                  <>
                    <Typography color="text.secondary">Votes</Typography>
                    <Typography>{(election as any).voteCount}</Typography>
                  </>
                )}
                <Typography color="text.secondary">Results</Typography>
                <Typography>{election.resultsPublished ? 'Published' : 'Not published'}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ElectionDetail;
