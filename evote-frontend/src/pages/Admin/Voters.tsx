import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Stack,
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
} from '@mui/material';
import { adminAPI } from '../../services/api';
import { Election, Voter } from '../../types';

const Voters: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<string>('');
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Single-add form state
  const [name, setName] = useState('');
  const [rollno, setRollno] = useState('');
  const [dept, setDept] = useState('');
  const [year, setYear] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [uploading, setUploading] = useState(false);

  // Multi-election assignment dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);
  const [selectedElectionsForVoter, setSelectedElectionsForVoter] = useState<string[]>([]);

  const selectedElectionObj = useMemo(
    () => elections.find(e => e._id === selectedElection),
    [elections, selectedElection]
  );

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getElections();
        setElections(res.elections);
        if (res.elections.length > 0) {
          setSelectedElection(res.elections[0]._id);
        }
      } catch (e: any) {
        setError(e.response?.data?.error || 'Failed to load elections');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      fetchVoters(selectedElection);
    }
  }, [selectedElection]);

  const fetchVoters = async (electionId: string) => {
    try {
      setLoading(true);
      const data = await adminAPI.getElectionVoters(electionId);
      setVoters(data.voters || []);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to load voters');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVoter = async () => {
    try {
      setError('');
      setSuccess('');
      if (!selectedElection) {
        setError('Please select an election');
        return;
      }
      if (!rollno || !name || !dept || !year) {
        setError('Please fill required fields: name, rollno, dept, year');
        return;
      }
      await adminAPI.addVoters(selectedElection, [{ name, rollno, dept, year, email, phone }]);
      setSuccess('Voter added');
      setName(''); setRollno(''); setDept(''); setYear(''); setEmail(''); setPhone('');
      fetchVoters(selectedElection);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to add voter');
    }
  };

  const handleUploadCsv = async (file: File | null) => {
    if (!file) return;
    try {
      setUploading(true);
      setError('');
      setSuccess('');
      if (!selectedElection) {
        setError('Please select an election');
        return;
      }
      await adminAPI.uploadVoters(file, selectedElection);
      setSuccess('CSV uploaded. Imported voters where valid and linked to the selected election.');
      if (selectedElection) fetchVoters(selectedElection);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to upload CSV');
    } finally {
      setUploading(false);
    }
  };

  const handleAssignElections = (voter: Voter) => {
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
      if (selectedElection) fetchVoters(selectedElection);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to update election assignments');
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manage Voters
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Add individual voters or upload a CSV. Only voters added here can participate in assigned elections.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Election</Typography>
              <TextField
                select
                fullWidth
                label="Select Election"
                value={selectedElection}
                onChange={(e) => setSelectedElection(e.target.value)}
                margin="normal"
              >
                {elections.map((e) => (
                  <MenuItem key={e._id} value={e._id}>{e.title}</MenuItem>
                ))}
              </TextField>
              {selectedElectionObj && (
                <Alert severity={selectedElectionObj.status === 'running' ? 'success' : selectedElectionObj.status === 'draft' ? 'info' : 'warning'} sx={{ mt: 1 }}>
                  Status: {selectedElectionObj.status}
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Add Single Voter</Typography>
              <TextField fullWidth label="Name" value={name} onChange={(e) => setName(e.target.value)} margin="dense" />
              <TextField fullWidth label="Roll No" value={rollno} onChange={(e) => setRollno(e.target.value)} margin="dense" />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField fullWidth label="Department" value={dept} onChange={(e) => setDept(e.target.value)} margin="dense" />
                <TextField fullWidth label="Year" value={year} onChange={(e) => setYear(e.target.value)} margin="dense" />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField fullWidth label="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} margin="dense" />
                <TextField fullWidth label="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} margin="dense" />
              </Stack>
              <Box sx={{ textAlign: 'right', mt: 1 }}>
                <Button variant="contained" onClick={handleAddVoter}>Add Voter</Button>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Upload CSV</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Columns: name, rollno, dept, year, email, phone, electionId
              </Typography>
              <Button component="label" variant="outlined" disabled={uploading}>
                {uploading ? <CircularProgress size={22} /> : 'Choose CSV & Upload'}
                <input hidden type="file" accept=".csv" onChange={(e) => handleUploadCsv(e.target.files?.[0] || null)} />
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Registered Voters</Typography>
              {loading && <CircularProgress size={20} />}
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Roll No</TableCell>
                  <TableCell>Dept</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Elections</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {voters.map(v => (
                  <TableRow key={v._id}>
                    <TableCell>{v.name || '-'}</TableCell>
                    <TableCell>{v.rollno || v.voterId}</TableCell>
                    <TableCell>{v.dept || '-'}</TableCell>
                    <TableCell>{v.year || '-'}</TableCell>
                    <TableCell>{v.email || '-'}</TableCell>
                    <TableCell>{v.phone || '-'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {v.assignedElections?.map(electionId => {
                          const election = elections.find(e => e._id === electionId);
                          return (
                            <Chip
                              key={electionId}
                              label={election?.title || electionId}
                              size="small"
                              color={election?.status === 'running' ? 'success' : election?.status === 'closed' ? 'error' : 'default'}
                            />
                          );
                        }) || <Typography variant="body2" color="text.secondary">None</Typography>}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleAssignElections(v)}
                      >
                        Assign Elections
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {voters.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">No voters added yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>

      {/* Election Assignment Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Assign Elections to {selectedVoter?.name || selectedVoter?.voterId}
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
                        color={election?.status === 'running' ? 'success' : election?.status === 'closed' ? 'error' : 'default'}
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

export default Voters;
