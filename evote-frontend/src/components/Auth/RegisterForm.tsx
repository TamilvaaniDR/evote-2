import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material';
import { authAPI } from '../../services/api';

interface RegisterFormProps {
  open: boolean;
  onClose: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ open, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');
      if (!email || !password || !confirm) {
        setError('Please fill all fields');
        return;
      }
      if (password !== confirm) {
        setError('Passwords do not match');
        return;
      }
      setLoading(true);
      const res = await authAPI.register(email, password);
      setSuccess('Registration successful. You can now log in.');
      setTimeout(() => {
        setLoading(false);
        onClose();
      }, 1000);
    } catch (e: any) {
      setLoading(false);
      setError(e?.response?.data?.error || 'Registration failed');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail('');
      setPassword('');
      setConfirm('');
      setError('');
      setSuccess('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Admin Account</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Confirm Password"
            type="password"
            fullWidth
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={22} /> : 'Sign Up'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterForm;
