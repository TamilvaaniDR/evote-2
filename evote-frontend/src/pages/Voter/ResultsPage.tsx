import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useParams } from 'react-router-dom';
import { voterAPI } from '../../services/api';
import { ElectionResults } from '../../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

const ResultsPage: React.FC = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [endAt, setEndAt] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [tick, setTick] = useState<number>(0);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const response = await voterAPI.getElectionResults(electionId!);
      setResults(response);
      setError('');
    } catch (err: any) {
      const status = err?.response?.status;
      const apiErr = err?.response?.data?.error;
      if (status === 403 && apiErr === 'Results not yet published') {
        // Fetch election details to show countdown
        try {
          const info = await voterAPI.getElection(electionId!);
          // info.election may have id/title/description/startAt/endAt
          setEndAt(info.election.endAt as any);
          setTitle(info.election.title);
          setResults(null);
          setError('');
        } catch (e) {
          setError('Results not yet published');
        }
      } else {
        setError(err.response?.data?.error || 'Failed to load results');
      }
    } finally {
      setLoading(false);
    }
  }, [electionId]);

  useEffect(() => {
    if (electionId) {
      fetchResults();
    }
  }, [electionId, fetchResults]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Ticker to update countdown every second
  useEffect(() => {
    if (!endAt || results) return;
    const iv = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(iv);
  }, [endAt, results]);

  // Auto-refetch when we pass endAt
  useEffect(() => {
    if (!endAt || results) return;
    const now = dayjs();
    if (now.isAfter(dayjs(endAt))) {
      // small delay before retry
      const t = setTimeout(() => {
        fetchResults();
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [tick, endAt, results, fetchResults]);

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

  // If results not yet published, show countdown view (when we have endAt)
  if (!results && endAt) {
    const diff = Math.max(0, dayjs(endAt).diff(dayjs(), 'second'));
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return (
      <Container maxWidth="sm">
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>{title || 'Election'}</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Results will be displayed in
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 600 }}>
                {h}h {m}m {s}s
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Auto-refreshing once available
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (!results) {
    return (
      <Container maxWidth="md">
        <Alert severity="info">No results available</Alert>
      </Container>
    );
  }

  const maxVotes = Math.max(...results.results.map(r => r.votes));

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Election Results
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {results.election}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Total Votes: {results.totalVotes}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Results Overview
              </Typography>
              {results.results.map((result, index) => (
                <Box key={result.candidateId} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {result.candidateName}
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {result.votes} votes
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={maxVotes > 0 ? (result.votes / maxVotes) * 100 : 0}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {results.totalVotes > 0 
                      ? Math.round((result.votes / results.totalVotes) * 100)
                      : 0}%
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vote Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={results.results}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ candidateName, votes, percent }: any) => 
                      `${candidateName}: ${votes} (${((percent as number) * 100).toFixed(1)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="votes"
                  >
                    {results.results.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detailed Results
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={results.results}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="candidateName" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="votes" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ResultsPage;
