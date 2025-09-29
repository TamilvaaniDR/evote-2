import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { voterAPI, voteAPI } from '../../services/api';
import { Election } from '../../types';

const VotePage: React.FC = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [votingToken, setVotingToken] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (electionId) {
      fetchElection();
    }
  }, [electionId]);

  const fetchElection = async () => {
    try {
      setLoading(true);
      const response = await voterAPI.getElection(electionId!);
      setElection(response.election);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load election');
    } finally {
      setLoading(false);
    }
  };

  const handleIdentify = async () => {
    try {
      setError('');
      await voterAPI.identify(identifier, electionId!);
      setStep(1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Identification failed');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setError('');
      const response = await voterAPI.verifyOtp(identifier, electionId!, otp);
      setVotingToken(response.token);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || 'OTP verification failed');
    }
  };

  const handleSubmitVote = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await voteAPI.castVote(electionId!, votingToken, selectedCandidate);
      navigate('/vote/success');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit vote');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = ['Identify Yourself', 'Verify OTP', 'Cast Your Vote'];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!election) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">Election not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {election.title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {election.description}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Stepper activeStep={step} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {step === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Step 1: Identify Yourself
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter your voter ID, email, or phone number
              </Typography>
              <TextField
                fullWidth
                label="Voter ID, Email, or Phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                margin="normal"
              />
              <Button
                variant="contained"
                onClick={handleIdentify}
                disabled={!identifier}
                sx={{ mt: 2 }}
              >
                Continue
              </Button>
            </Box>
          )}

          {step === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Step 2: Verify OTP
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter the 6-digit OTP sent to your registered contact
              </Typography>
              <TextField
                fullWidth
                label="OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                margin="normal"
                inputProps={{ maxLength: 6 }}
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setStep(0)}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleVerifyOtp}
                  disabled={otp.length !== 6}
                >
                  Verify OTP
                </Button>
              </Box>
            </Box>
          )}

          {step === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Step 3: Cast Your Vote
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select your preferred candidate
              </Typography>
              
              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <FormLabel component="legend">Candidates</FormLabel>
                <RadioGroup
                  value={selectedCandidate}
                  onChange={(e) => setSelectedCandidate(e.target.value)}
                >
                  {election.candidates.map((candidate) => (
                    <FormControlLabel
                      key={candidate.id}
                      value={candidate.id}
                      control={<Radio />}
                      label={candidate.name}
                    />
                  ))}
                </RadioGroup>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmitVote}
                  disabled={!selectedCandidate || submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Submit Vote'}
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default VotePage;





