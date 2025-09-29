import axios from 'axios';
import { Election, Voter, AuthResponse, DashboardStats, ElectionResults, AuditLog } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Do not set a default Content-Type header here. Axios will automatically
// set 'application/json' for plain objects and the correct multipart boundary
// for FormData (e.g., CSV uploads). Setting it globally to JSON breaks uploads.
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    } as any;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string): Promise<AuthResponse> =>
    api.post('/auth/admin/login', { email, password }).then(res => res.data),
  
  register: (email: string, password: string): Promise<AuthResponse> =>
    api.post('/auth/admin/register', { email, password }).then(res => res.data),
};

// Admin API
export const adminAPI = {
  // Elections
  getElections: (): Promise<{ elections: Election[] }> =>
    api.get('/admin/elections').then(res => res.data),
  
  getElection: (id: string): Promise<{ election: Election }> =>
    api.get(`/admin/elections/${id}`).then(res => res.data),
  
  createElection: (election: Partial<Election>): Promise<{ election: Election }> =>
    api.post('/admin/elections', election).then(res => res.data),
  
  updateElection: (id: string, election: Partial<Election>): Promise<{ election: Election }> =>
    api.put(`/admin/elections/${id}`, election).then(res => res.data),
  
  startElection: (id: string): Promise<{ election: Election }> =>
    api.post(`/admin/elections/${id}/start`).then(res => res.data),
  
  endElection: (id: string): Promise<{ election: Election }> =>
    api.post(`/admin/elections/${id}/end`).then(res => res.data),
  
  getElectionResults: (id: string): Promise<ElectionResults> =>
    api.get(`/admin/elections/${id}/results`).then(res => res.data),
  
  // Voters
  getElectionVoters: (electionId: string): Promise<{ voters: Voter[] }> =>
    api.get(`/admin/elections/${electionId}/voters`).then(res => res.data),
  
  uploadVoters: (file: File, electionId?: string): Promise<{ ok: boolean; imported: number; electionId?: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    if (electionId) formData.append('electionId', electionId);
    // Do NOT set Content-Type manually; let the browser set the multipart boundary
    return api.post('/admin/voters/upload', formData).then(res => res.data);
  },
  
  addVoters: (electionId: string, voters: Partial<Voter>[]): Promise<{ ok: boolean; count: number }> =>
    api.post('/admin/voters/add', { electionId, voters }).then(res => res.data),
  
  updateVoterAssignments: (voterId: string, assignedElections: string[]): Promise<{ ok: boolean; message: string; voter: any }> =>
    api.put(`/admin/voters/${voterId}/assignments`, { assignedElections }).then(res => res.data),
  
  getAllVoters: (page = 1, limit = 50): Promise<{ voters: any[]; pagination: any }> =>
    api.get(`/admin/voters?page=${page}&limit=${limit}`).then(res => res.data),
  
  // Dashboard
  getDashboard: (): Promise<{ stats: DashboardStats; recentElections: Election[] }> =>
    api.get('/admin/dashboard').then(res => res.data),
  
  // Audit logs
  getAuditLogs: (page = 1, limit = 50): Promise<{ logs: AuditLog[]; pagination: any }> =>
    api.get(`/admin/audit-logs?page=${page}&limit=${limit}`).then(res => res.data),

  // Voter CSV imports
  getVoterImports: (electionId?: string, limit = 20): Promise<{ imports: Array<{ electionId: string; adminId: string; filename: string; size: number; importedCount: number; uploadedAt: string }>; }> =>
    api.get(`/admin/voters/imports${electionId ? `?electionId=${electionId}&limit=${limit}` : `?limit=${limit}`}`).then(res => res.data),
};

// Voter API (public)
export const voterAPI = {
  getElections: (): Promise<{ elections: Election[] }> =>
    api.get('/voter/elections').then(res => res.data),
  
  getElection: (id: string): Promise<{ election: Election }> =>
    api.get(`/voter/elections/${id}`).then(res => res.data),
  
  getElectionResults: (id: string): Promise<ElectionResults> =>
    api.get(`/voter/elections/${id}/results`).then(res => res.data),
  
  identify: (identifier: string, electionId: string): Promise<{ ok: boolean; message: string }> =>
    api.post('/voter/identify', { identifier, electionId }).then(res => res.data),
  
  verifyOtp: (identifier: string, electionId: string, otp: string): Promise<{ token: string }> =>
    api.post('/voter/verify-otp', { identifier, electionId, otp }).then(res => res.data),

  // New: list elections this identifier is eligible to vote in (currently active)
  eligibleElections: (identifier: string): Promise<{ elections: Election[] }> =>
    api.post('/voter/eligible-elections', { identifier }).then(res => res.data),

  // New: list elections with published results
  getResultsFeed: (): Promise<{ elections: Election[] }> =>
    api.get('/voter/results-feed').then(res => res.data),

  // Voter account session: start login (OTP) and verify
  loginStart: (identifier: string): Promise<{ ok: boolean; message: string; devOtp?: string; deliveryMethod?: string }> =>
    api.post('/voter/login-start', { identifier }).then(res => res.data),
  loginVerify: (identifier: string, otp: string): Promise<{ token: string }> =>
    api.post('/voter/login-verify', { identifier, otp }).then(res => res.data),
  
  // Regenerate OTP for multiple voters
  regenerateOtp: (identifier: string): Promise<{ ok: boolean; message: string; devOtp?: string; deliveryMethod?: string }> =>
    api.post('/voter/regenerate-otp', { identifier }).then(res => res.data),

  // Voter account: fetch profile + assigned elections using X-Voter-Token
  getMe: (voterToken: string): Promise<{ voter: any; elections: { running: Election[]; upcoming: Election[]; closed: Election[] } }> =>
    api.get('/voter/me', { headers: { 'X-Voter-Token': voterToken } }).then(res => res.data),
};

// Vote API
export const voteAPI = {
  castVote: (electionId: string, token: string, candidateId: string): Promise<{ ok: boolean }> =>
    api.post(`/vote/${electionId}/cast`, { token, candidateId }).then(res => res.data),
};

export default api;



