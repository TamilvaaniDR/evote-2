import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Pagination,
  TextField,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { Election, Voter } from '../../types';

interface VoterWithElections extends Voter {
  electionDetails?: Election[];
}

const AllVoters: React.FC = () => {
  const [voters, setVoters] = useState<VoterWithElections[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVoters, setTotalVoters] = useState(0);

  // Assignment dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<VoterWithElections | null>(null);
  const [selectedElectionsForVoter, setSelectedElectionsForVoter] = useState<string[]>([]);

  useEffect(() => {
    fetchElections();
    fetchVoters();
  }, [page]);

  const fetchElections = async () => {
    try {
      const response = await adminAPI.getElections();
      setElections(response.elections);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load elections');
    }
  };

  const fetchVoters = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllVoters(page, 50);
      setVoters(response.voters);
      setTotalPages(response.pagination.pages);
      setTotalVoters(response.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load voters');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignElections = (voter: VoterWithElections) => {
    setSelectedVoter(voter);
    setSelectedElectionsForVoter(voter.assignedElections || []);
    setAssignDialogOpen(true);
  };

  const handleSaveElectionAssignments = async () => {
    if (!selectedVoter) return;
    try {
      setError('');
      setSuccess('');
      await adminAPI.updateVoterAssignments(selectedVoter.voterId, selectedElectionsForVoter);
      setSuccess(`Election assignments updated for ${selectedVoter.name || selectedVoter.voterId}`);
      setAssignDialogOpen(false);
      fetchVoters();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to update election assignments');
    }
  };

  const filteredVoters = voters.filter(voter => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      voter.name?.toLowerCase().includes(searchLower) ||
      voter.voterId.toLowerCase().includes(searchLower) ||
      voter.rollno?.toLowerCase().includes(searchLower) ||
      voter.email?.toLowerCase().includes(searchLower) ||
      voter.dept?.toLowerCase().includes(searchLower)
    );
  });

  const getElectionStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'success';
      case 'closed': return 'error';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          All Voters
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage voter election assignments across all elections
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Voters ({totalVoters} total)
            </Typography>
            <TextField
              size="small"
              placeholder="Search voters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Voter ID</TableCell>
                    <TableCell>Roll No</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Year</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Elections</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredVoters.map((voter) => (
                    <TableRow key={voter._id}>
                      <TableCell>{voter.name || '-'}</TableCell>
                      <TableCell>{voter.voterId}</TableCell>
                      <TableCell>{voter.rollno || '-'}</TableCell>
                      <TableCell>{voter.dept || '-'}</TableCell>
                      <TableCell>{voter.year || '-'}</TableCell>
                      <TableCell>{voter.email || '-'}</TableCell>
                      <TableCell>{voter.phone || '-'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', maxWidth: 300 }}>
                          {voter.electionDetails?.map((election) => (
                            <Chip
                              key={election._id}
                              label={election.title}
                              size="small"
                              color={getElectionStatusColor(election.status) as any}
                              variant="outlined"
                            />
                          )) || <Typography variant="body2" color="text.secondary">None</Typography>}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleAssignElections(voter)}
                        >
                          Manage Elections
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredVoters.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        {searchTerm ? 'No voters found matching your search.' : 'No voters found.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, newPage) => setPage(newPage)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Election Assignment Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Manage Elections for {selectedVoter?.name || selectedVoter?.voterId}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select which elections this voter can participate in:
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Elections</InputLabel>
            <Select
              multiple
              value={selectedElectionsForVoter}
              onChange={(e) => setSelectedElectionsForVoter(e.target.value as string[])}
              input={<OutlinedInput label="Elections" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const election = elections.find(e => e._id === value);
                    return (
                      <Chip
                        key={value}
                        label={election?.title || value}
                        size="small"
                        color={getElectionStatusColor(election?.status || '') as any}
                      />
                    );
                  })}
                </Box>
              )}
            >
              {elections.map((election) => (
                <MenuItem key={election._id} value={election._id}>
                  <Checkbox checked={selectedElectionsForVoter.indexOf(election._id) > -1} />
                  <ListItemText
                    primary={election.title}
                    secondary={`Status: ${election.status} | Voters: ${election.eligibleVoterCount}`}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveElectionAssignments} variant="contained">
            Save Assignments
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AllVoters;
