import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { adminAPI } from '../../services/api';
import { DashboardStats as DashboardStatsType, Election } from '../../types';
import DashboardStats from '../../components/Dashboard/DashboardStats';
import RecentElections from '../../components/Dashboard/RecentElections';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [recentElections, setRecentElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getDashboard();
        setStats(response.stats);
        setRecentElections(response.recentElections);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to the E-Voting System Administration Panel
        </Typography>
      </Box>

      {stats && <DashboardStats stats={stats} />}

      <Box sx={{ mt: 4 }}>
        <RecentElections elections={recentElections} />
      </Box>
    </Container>
  );
};

export default Dashboard;





