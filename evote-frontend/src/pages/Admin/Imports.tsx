import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { adminAPI } from '../../services/api';
import { Election } from '../../types';

const Imports: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<string>('');
  const [imports, setImports] = useState<Array<{ electionId: string; adminId: string; filename: string; size: number; importedCount: number; uploadedAt: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadElections = async () => {
      try {
        const res = await adminAPI.getElections();
        setElections(res.elections);
        if (res.elections.length > 0) {
          setSelectedElection(res.elections[0]._id);
        }
      } catch (e: any) {
        setError(e.response?.data?.error || 'Failed to load elections');
      }
    };
    loadElections();
  }, []);

  const fetchImports = async (electionId?: string) => {
    try {
      setLoading(true);
      const res = await adminAPI.getVoterImports(electionId || undefined, 50);
      setImports(res.imports);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to load imports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImports(selectedElection || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElection]);

  const electionOptions = useMemo(() => [{ _id: '', title: 'All elections' } as any, ...elections], [elections]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Voter CSV Imports
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Verify that uploaded CSV files are stored and linked to elections
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            select
            label="Election"
            value={selectedElection}
            onChange={(e) => setSelectedElection(e.target.value)}
            size="small"
          >
            {electionOptions.map((e) => (
              <MenuItem key={e._id || 'all'} value={e._id}>{e.title}</MenuItem>
            ))}
          </TextField>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Uploaded At</TableCell>
                  <TableCell>Election</TableCell>
                  <TableCell>Filename</TableCell>
                  <TableCell align="right">Size</TableCell>
                  <TableCell align="right">Imported</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress size={22} />
                    </TableCell>
                  </TableRow>
                ) : imports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No imports</TableCell>
                  </TableRow>
                ) : (
                  imports.map((imp, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{new Date(imp.uploadedAt).toLocaleString()}</TableCell>
                      <TableCell><Chip size="small" label={imp.electionId} /></TableCell>
                      <TableCell>{imp.filename}</TableCell>
                      <TableCell align="right">{Math.round(imp.size / 1024)} KB</TableCell>
                      <TableCell align="right">{imp.importedCount}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Imports;
