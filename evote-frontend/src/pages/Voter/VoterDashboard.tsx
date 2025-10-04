import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, TextField, Button, Alert, CircularProgress, Chip, Divider, Menu, MenuItem, ListItemIcon, IconButton, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import { voterAPI } from '../../services/api';
import { Election } from '../../types';
import { useVoter } from '../../contexts/VoterContext';
import { HowToVote as VoteIcon, Logout as LogoutIcon, AccountCircle as AccountIcon, Assessment as ResultsIcon, Home as HomeIcon, ExpandMore as ExpandMoreIcon, ContentCopy as CopyIcon, DeleteOutline as ClearIcon } from '@mui/icons-material';

const VoterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { voterToken, setVoterToken, voter, setVoter, logoutVoter } = useVoter();

  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'identify' | 'verify' | 'ready'>(voterToken ? 'ready' : 'identify');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<string>('console');

  const [running, setRunning] = useState<Election[]>([]);
  const [upcoming, setUpcoming] = useState<Election[]>([]);
  const [closed, setClosed] = useState<Election[]>([]);

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const closeMenu = () => setMenuAnchorEl(null);

  // Persist and display OTPs per identifier for easy access when switching voters
  type OtpEntry = { otp: string; deliveryMethod?: string; savedAt: number };
  const [otpHistory, setOtpHistory] = useState<Record<string, OtpEntry>>(() => {
    try {
      const raw = localStorage.getItem('voterOtpHistory');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const saveOtpToHistory = (id: string, otpValue: string | null, method?: string) => {
    if (!otpValue) return;
    const next = { ...otpHistory, [id]: { otp: otpValue, deliveryMethod: method, savedAt: Date.now() } };
    setOtpHistory(next);
    try { localStorage.setItem('voterOtpHistory', JSON.stringify(next)); } catch {}
  };

  const clearOtpHistory = () => {
    setOtpHistory({});
    localStorage.removeItem('voterOtpHistory');
  };

  const fetchMe = async (token: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await voterAPI.getMe(token);
      setVoter({
        voterId: data.voter.voterId,
        name: data.voter.name,
        email: data.voter.email,
        phone: data.voter.phone,
        dept: data.voter.dept,
        year: data.voter.year,
      });
      setRunning(data.elections.running || []);
      setUpcoming(data.elections.upcoming || []);
      setClosed(data.elections.closed || []);
      setStep('ready');
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load account');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (voterToken) {
      fetchMe(voterToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voterToken]);

  const startLogin = async () => {
    try {
      setLoading(true);
      setError('');
      console.log(`[DEBUG] Starting login for identifier: ${identifier}`);
      const res = await voterAPI.loginStart(identifier);
      console.log(`[DEBUG] Login start response:`, res);
      setDevOtp(res.devOtp || null);
      setDeliveryMethod(res.deliveryMethod || 'console');
      saveOtpToHistory(identifier, res.devOtp || null, res.deliveryMethod);
      setStep('verify');
    } catch (e: any) {
      console.error(`[DEBUG] Login start error:`, e);
      setError(e?.response?.data?.error || 'Failed to start login');
    } finally {
      setLoading(false);
    }
  };

  const verifyLogin = async () => {
    try {
      setLoading(true);
      setError('');
      console.log(`[DEBUG] Verifying OTP for identifier: ${identifier}, OTP: ${otp}`);
      const res = await voterAPI.loginVerify(identifier, otp);
      console.log(`[DEBUG] Login verify response:`, res);
      setVoterToken(res.token);
      setStep('ready');
    } catch (e: any) {
      console.error(`[DEBUG] Login verify error:`, e);
      setError(e?.response?.data?.error || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const regenerateOtp = async () => {
    try {
      setLoading(true);
      setError('');
      console.log(`[DEBUG] Regenerating OTP for identifier: ${identifier}`);
      const res = await voterAPI.regenerateOtp(identifier);
      console.log(`[DEBUG] Regenerate OTP response:`, res);
      setDevOtp(res.devOtp || null);
      setDeliveryMethod(res.deliveryMethod || 'console');
      saveOtpToHistory(identifier, res.devOtp || null, res.deliveryMethod);
    } catch (e: any) {
      console.error(`[DEBUG] Regenerate OTP error:`, e);
      setError(e?.response?.data?.error || 'Failed to regenerate OTP');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutVoter();
    setIdentifier('');
    setOtp('');
    setDevOtp(null);
    setDeliveryMethod('console');
    setStep('identify');
  };

  const Section: React.FC<{ title: string; items: Election[]; showVote?: boolean; showResults?: boolean }>= ({ title, items, showVote, showResults }) => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>{title} ({items.length})</Typography>
      {items.length === 0 ? (
        <Alert severity="info">No elections assigned to you</Alert>
      ) : (
        <Grid container spacing={2}>
          {items.map((e) => {
            const now = new Date();
            const startDate = e.startAt ? new Date(e.startAt) : null;
            const endDate = e.endAt ? new Date(e.endAt) : null;
            const isActive = e.status === 'running' && startDate && endDate && now >= startDate && now <= endDate;
            const isUpcoming = startDate && now < startDate;
            const isClosed = e.status === 'closed' || (endDate && now > endDate);
            
            return (
              <Grid key={e._id} item xs={12} md={6}>
                <Card sx={{ 
                  border: isActive ? '2px solid' : '1px solid',
                  borderColor: isActive ? 'success.main' : 'divider',
                  bgcolor: isActive ? 'success.50' : 'background.paper'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>{e.title}</Typography>
                      <Chip 
                        size="small" 
                        label={e.status} 
                        color={e.status === 'running' ? 'success' : e.status === 'closed' ? 'error' : 'default'} 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{e.description}</Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Candidates:</strong> {e.candidates?.length || 0}
                      </Typography>
                      {startDate && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Start:</strong> {startDate.toLocaleString()}
                        </Typography>
                      )}
                      {endDate && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>End:</strong> {endDate.toLocaleString()}
                        </Typography>
                      )}
                    </Box>

                    {isActive && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        Election is currently active! You can vote now.
                      </Alert>
                    )}
                    
                    {isUpcoming && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Election starts soon. Check back when voting begins.
                      </Alert>
                    )}
                    
                    {isClosed && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        Election has ended. Results may be available.
                      </Alert>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {showVote && isActive && (
                        <Button variant="contained" startIcon={<VoteIcon />} onClick={() => navigate(`/vote/${e._id}`)}>
                          Vote Now
                        </Button>
                      )}
                      {showResults && (isClosed || e.resultsPublished) && (
                        <Button variant="outlined" startIcon={<ResultsIcon />} onClick={() => navigate(`/results/${e._id}`)}>
                          View Results
                        </Button>
                      )}
                      {!isActive && !isClosed && (
                        <Button variant="outlined" disabled>
                          Voting Not Available
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Account</Typography>
        <>
          <Button
            variant="outlined"
            color="primary"
            endIcon={<ExpandMoreIcon />}
            onClick={openMenu}
          >
            Pages
          </Button>
          <Button
            variant="text"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={logout}
            sx={{ ml: 1 }}
          >
            Logout
          </Button>
          <Menu
            anchorEl={menuAnchorEl}
            open={isMenuOpen}
            onClose={closeMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => { closeMenu(); navigate('/home'); }}>
              <ListItemIcon>
                <HomeIcon fontSize="small" />
              </ListItemIcon>
              Home
            </MenuItem>
            <MenuItem onClick={() => { closeMenu(); navigate('/account'); }}>
              <ListItemIcon>
                <AccountIcon fontSize="small" />
              </ListItemIcon>
              My Account
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { closeMenu(); navigate('/logout'); }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </>
      </Box>

      {Object.keys(otpHistory).length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1">Developer OTPs</Typography>
              <Tooltip title="Clear OTP list">
                <IconButton size="small" onClick={clearOtpHistory}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Grid container spacing={1}>
              {Object.entries(otpHistory)
                .sort((a, b) => b[1].savedAt - a[1].savedAt)
                .map(([id, entry]) => (
                  <Grid item xs={12} md={6} key={id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{id}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          OTP: {entry.otp} {entry.deliveryMethod ? `(via ${entry.deliveryMethod})` : ''}
                        </Typography>
                      </Box>
                      <Tooltip title="Copy OTP">
                        <IconButton size="small" onClick={() => navigator.clipboard.writeText(entry.otp)}>
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Quick Actions - non-invasive enhancements */}
      {step === 'ready' && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>Quick Actions</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button variant="outlined" onClick={() => navigate('/home')}>Browse Elections</Button>
              <Button variant="outlined" onClick={() => navigate('/account')}>View Profile</Button>
              <Button variant="outlined" color="error" onClick={() => navigate('/logout')}>Logout</Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {step !== 'ready' && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Login to your account</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField label="Voter ID / Email / Phone" value={identifier} onChange={(e) => setIdentifier(e.target.value)} size="small" />
              {step === 'identify' && (
                <Button variant="contained" onClick={startLogin} disabled={!identifier || loading}>
                  {loading ? <CircularProgress size={20} /> : 'Send OTP'}
                </Button>
              )}
              {step === 'verify' && (
                <>
                  <TextField label="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} size="small" inputProps={{ maxLength: 6 }} />
                  <Button variant="contained" onClick={verifyLogin} disabled={otp.length !== 6 || loading}>
                    {loading ? <CircularProgress size={20} /> : 'Verify OTP'}
                  </Button>
                  {devOtp && (
                    <Chip 
                      label={`Dev OTP: ${devOtp}`} 
                      color="info" 
                      variant="outlined" 
                    />
                  )}
                  {deliveryMethod !== 'console' && (
                    <Chip 
                      label={`Sent via ${deliveryMethod}`} 
                      color="success" 
                      variant="outlined" 
                    />
                  )}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={regenerateOtp}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={16} /> : 'Resend OTP'}
                  </Button>
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {step === 'ready' && voter && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <AccountIcon color="primary" />
                <Typography variant="h6">{voter.name || voter.voterId}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">ID: {voter.voterId}</Typography>
              {voter.email && <Typography variant="body2" color="text.secondary">Email: {voter.email}</Typography>}
              {voter.phone && <Typography variant="body2" color="text.secondary">Phone: {voter.phone}</Typography>}
              {(voter.dept || voter.year) && (
                <Typography variant="body2" color="text.secondary">{voter.dept || ''} {voter.year ? `(Year ${voter.year})` : ''}</Typography>
              )}
            </CardContent>
          </Card>

          <Section title="Running Elections" items={running} showVote showResults={false} />
          <Section title="Upcoming Elections" items={upcoming} showVote={false} showResults={false} />
          <Section title="Closed Elections" items={closed} showVote={false} showResults={true} />
        </>
      )}
    </Container>
  );
};

export default VoterDashboard;
