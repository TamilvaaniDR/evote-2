import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  HowToVote as VoteIcon,
  Assessment as ResultsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { voterAPI } from '../../services/api';
import { Election } from '../../types';
import { format } from 'date-fns';
import dayjs from 'dayjs';

const VoterHome: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [runningElections, setRunningElections] = useState<Election[]>([]);
  const [eligibleElections, setEligibleElections] = useState<Election[]>([]);
  const [resultsFeed, setResultsFeed] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [eligibleLoading, setEligibleLoading] = useState(false);
  const [error, setError] = useState('');
  const [eligibleError, setEligibleError] = useState('');
  const [identifier, setIdentifier] = useState('');
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    fetchElections();
  }, []);

  // Tick every second for countdown updates
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  // Consume tick to satisfy linter and drive countdown updates
  useEffect(() => {
    // no-op; tick triggers rerender every second for countdowns
  }, [tick]);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await voterAPI.getElections();
      const all = response.elections || [];
      setElections(all);
      setRunningElections(all.filter(e => e.status === 'running'));
      // results feed (published results only)
      try {
        const rf = await voterAPI.getResultsFeed();
        setResultsFeed(rf.elections || []);
      } catch {}
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const fetchEligible = async () => {
    if (!identifier) return;
    try {
      setEligibleLoading(true);
      setEligibleError('');
      const res = await voterAPI.eligibleElections(identifier);
      setEligibleElections(res.elections || []);
    } catch (err: any) {
      setEligibleError(err.response?.data?.error || 'Failed to load your eligible elections');
      setEligibleElections([]);
    } finally {
      setEligibleLoading(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const isElectionActive = (election: Election) => {
    const now = new Date();
    const start = new Date(election.startAt);
    const end = new Date(election.endAt);
    return now >= start && now <= end && election.status === 'running';
  };

  const timeUntilResults = (election: Election) => {
    const diff = dayjs(election.endAt).diff(dayjs(), 'second');
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
    <Container maxWidth="lg" className="page-gradient">
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom className="bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent font-extrabold">
          E-Voting System
        </Typography>
        <Typography variant="h6" color="text.secondary" className="text-gray-600">
          Cast your vote securely and view election results
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Section: Currently running elections */}
      <Typography variant="h5" sx={{ mb: 2 }}>Currently Running Elections</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {runningElections.map((election) => (
          <Grid item xs={12} md={6} key={election._id}>
            <Card className="card-hover rounded-xl">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h5" component="h2">
                    {election.title}
                  </Typography>
                  <Chip
                    label={election.status}
                    color={getStatusColor(election.status) as any}
                  />
                </Box>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {election.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Start:</strong> {formatDate(election.startAt)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>End:</strong> {formatDate(election.endAt)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Candidates:</strong> {election.candidates.length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {isElectionActive(election) && (
                    <Button
                      variant="contained"
                      startIcon={<VoteIcon />}
                      onClick={() => navigate(`/vote/${election._id}`)}
                      fullWidth
                    >
                      Vote Now
                    </Button>
                  )}
                  {election.resultsPublished && (
                    <Button
                      variant="outlined"
                      startIcon={<ResultsIcon />}
                      onClick={() => navigate(`/results/${election._id}`)}
                      fullWidth
                    >
                      View Results
                    </Button>
                  )}
                </Box>

                {!isElectionActive(election) && election.status === 'running' && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    This election is not yet active or has ended.
                  </Alert>
                )}

                {!election.resultsPublished && election.status !== 'draft' && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Results will be displayed in {timeUntilResults(election)}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Section: Your eligible elections */}
      <Card sx={{ mb: 4 }} className="card-hover rounded-xl">
        <CardContent>
          <Typography variant="h5" gutterBottom className="font-semibold">Find Your Eligible Elections</Typography>
          <Typography variant="body2" color="text.secondary" className="text-gray-600">Enter your Voter ID, Email, or Phone to see elections you can vote in.</Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Your Identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              size="small"
            />
            <Button variant="contained" onClick={fetchEligible} disabled={!identifier || eligibleLoading}>
              {eligibleLoading ? <CircularProgress size={20} /> : 'Show My Elections'}
            </Button>
          </Box>
          {eligibleError && <Alert severity="error" sx={{ mt: 2 }}>{eligibleError}</Alert>}

          {eligibleElections.length > 0 && (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {eligibleElections.map(election => (
                <Grid item xs={12} md={6} key={election._id}>
                  <Card className="card-hover rounded-xl">
                    <CardContent>
                      <Typography variant="h6" className="font-semibold">{election.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} className="text-gray-600">{election.description}</Typography>
                      <Button variant="contained" startIcon={<VoteIcon />} onClick={() => navigate(`/vote/${election._id}`)} fullWidth className="!bg-brand-600 hover:!bg-brand-700">
                        Vote in this Election
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          {identifier && !eligibleLoading && eligibleElections.length === 0 && !eligibleError && (
            <Alert severity="info" sx={{ mt: 2 }}>No active elections found for your identifier.</Alert>
          )}
        </CardContent>
      </Card>

      {/* Section: Results feed */}
      <Typography variant="h5" sx={{ mb: 2 }} className="font-semibold">Results</Typography>
      <Grid container spacing={3}>
        {resultsFeed.map((election) => (
          <Grid item xs={12} md={6} key={election._id}>
            <Card className="card-hover rounded-xl">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h3" className="font-semibold">{election.title}</Typography>
                  <Chip label="Results Published" color="success" className="!bg-green-600 !text-white" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} className="text-gray-600">{election.description}</Typography>
                <Button variant="outlined" startIcon={<ResultsIcon />} onClick={() => navigate(`/results/${election._id}`)} fullWidth className="!border-brand-600 !text-brand-700 hover:!bg-brand-50">
                  View Results
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {elections.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No elections available at the moment.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default VoterHome;
