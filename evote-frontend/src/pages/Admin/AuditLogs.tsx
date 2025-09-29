import React, { useEffect, useState } from 'react';
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
  Pagination,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { adminAPI } from '../../services/api';
import { AuditLog } from '../../types';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async (p: number) => {
    try {
      setLoading(true);
      const res = await adminAPI.getAuditLogs(p, 25);
      setLogs(res.logs);
      setPages(res.pagination.pages || 1);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Audit Logs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track administrative actions across the system
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Actor Type</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Metadata</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No logs</TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip label={log.actorType} size="small" />
                      </TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                          {JSON.stringify(log.metadata || {}, null, 2)}
                        </pre>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination count={pages} page={page} onChange={(_, p) => setPage(p)} />
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AuditLogs;
