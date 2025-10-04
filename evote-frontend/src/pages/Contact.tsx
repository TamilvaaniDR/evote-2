import React, { useState } from 'react';
import { Box, Container, Typography, Paper, Button, TextField, Stack, Alert, CircularProgress } from '@mui/material';
import PublicLayout from '../components/Layout/PublicLayout';
import { publicAPI } from '../services/api';

const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const handleMail = () => {
    window.location.href = 'mailto:drtamilvaani2006@gmail.com?subject=Support%20Request';
  };

  const handleSubmit = async () => {
    setSuccess(null);
    setError(null);
    if (!email || !message) {
      setError('Please provide your email and a message.');
      setErrorCode(null);
      return;
    }
    try {
      setLoading(true);
      await publicAPI.contact({ name: name || undefined, email, message });
      setSuccess('Your message has been sent. We will get back to you soon.');
      setName('');
      setEmail('');
      setMessage('');
    } catch (e: any) {
      const code = e?.response?.data?.error || null;
      setErrorCode(code);
      if (code === 'email_not_configured') {
        setError('Email is not configured on the server yet. You can still contact us directly via email or phone below.');
      } else {
        setError(e?.response?.data?.message || 'Failed to send your message. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <PublicLayout>
      <Box sx={{ py: 8, backgroundColor: (t) => t.palette.background.default }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>Contact</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Have a question or need help with OTP or voting? Reach out.
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>Email: drtamilvaani2006@gmail.com</Typography>
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
                {errorCode === 'email_not_configured' && (
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button size="small" variant="outlined" onClick={handleMail}>Open Email App</Button>
                    <Button size="small" variant="outlined" onClick={() => (window.location.href = 'tel:9751062678')}>Call Support</Button>
                  </Box>
                )}
              </Alert>
            )}
            <Stack spacing={2} sx={{ mb: 2 }}>
              <TextField label="Your Name (optional)" size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
              <TextField label="Your Email" size="small" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
              <TextField label="Message" size="small" fullWidth multiline minRows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                {loading ? <CircularProgress size={20} /> : 'Send Message'}
              </Button>
              <Button variant="outlined" onClick={handleMail}>Send Email</Button>
              <Button variant="outlined" onClick={() => (window.location.href = 'tel:9751062678')}>Call Support</Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </PublicLayout>
  );
};

export default Contact;


