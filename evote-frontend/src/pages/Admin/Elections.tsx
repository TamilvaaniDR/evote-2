import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add as AddIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { Election } from '../../types';
import { format } from 'date-fns';

const Elections: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    startAt: '',
    endAt: '',
    candidates: [{ id: '', name: '' }],
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getElections();
      setElections(response.elections);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateElection = async () => {
    try {
      await adminAPI.createElection(newElection);
      setCreateDialogOpen(false);
      setNewElection({
        title: '',
        description: '',
        startAt: '',
        endAt: '',
        candidates: [{ id: '', name: '' }],
      });
      fetchElections();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create election');
    }
  };

  const handleStartElection = async (electionId: string) => {
    try {
      await adminAPI.startElection(electionId);
      fetchElections();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start election');
    }
  };

  const handleEndElection = async (electionId: string) => {
    try {
      await adminAPI.endElection(electionId);
      fetchElections();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to end election');
    }
  };

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Elections
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your elections and monitor voting progress
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/voters')}
          >
            Manage Voters
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Election
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {elections.map((election) => (
          <Grid item xs={12} md={6} lg={4} key={election._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2">
                    {election.title}
                  </Typography>
                  <Chip
                    label={election.status}
                    color={getStatusColor(election.status) as any}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {election.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Start:</strong> {safeFormatDate(election.startAt)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>End:</strong> {safeFormatDate(election.endAt)}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Candidates:</strong> {election.candidates.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Voters:</strong> {election.eligibleVoterCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Turnout:</strong> {election.turnoutCount} ({election.eligibleVoterCount > 0 
                      ? Math.round((election.turnoutCount / election.eligibleVoterCount) * 100)
                      : 0}%)
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/admin/elections/${election._id}`)}
                  >
                    <ViewIcon />
                  </IconButton>
                  
                  {election.status === 'draft' && (
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => handleStartElection(election._id)}
                    >
                      <StartIcon />
                    </IconButton>
                  )}
                  
                  {election.status === 'running' && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleEndElection(election._id)}
                    >
                      <StopIcon />
                    </IconButton>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Election Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Election</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={newElection.title}
            onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={newElection.description}
            onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Start Date & Time"
            type="datetime-local"
            value={newElection.startAt}
            onChange={(e) => setNewElection({ ...newElection, startAt: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="End Date & Time"
            type="datetime-local"
            value={newElection.endAt}
            onChange={(e) => setNewElection({ ...newElection, endAt: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Candidates
          </Typography>
          {newElection.candidates.map((candidate, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                label="Candidate ID"
                value={candidate.id}
                onChange={(e) => {
                  const candidates = [...newElection.candidates];
                  candidates[index].id = e.target.value;
                  setNewElection({ ...newElection, candidates });
                }}
                size="small"
              />
              <TextField
                label="Candidate Name"
                value={candidate.name}
                onChange={(e) => {
                  const candidates = [...newElection.candidates];
                  candidates[index].name = e.target.value;
                  setNewElection({ ...newElection, candidates });
                }}
                size="small"
                fullWidth
              />
            </Box>
          ))}
          <Button
            variant="outlined"
            onClick={() => setNewElection({
              ...newElection,
              candidates: [...newElection.candidates, { id: '', name: '' }]
            })}
            sx={{ mt: 1 }}
          >
            Add Candidate
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateElection} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Elections;
