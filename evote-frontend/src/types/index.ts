export interface Election {
  _id: string;
  title: string;
  description: string;
  candidates: Candidate[];
  startAt: string;
  endAt: string;
  status: 'draft' | 'running' | 'closed';
  eligibleVoterCount: number;
  turnoutCount: number;
  resultsPublished: boolean;
  tally?: { [key: string]: number };
  createdAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  meta?: any;
}

export interface Voter {
  _id: string;
  voterId: string;
  name?: string;
  rollno?: string;
  dept?: string;
  year?: string;
  email?: string;
  phone?: string;
  eligible: boolean;
  hashedRef: string;
  assignedElections: string[];
  createdAt: string;
}

export interface Vote {
  _id: string;
  electionId: string;
  candidateId: string;
  castAt: string;
  ballotHash: string;
}

export interface Admin {
  _id: string;
  email: string;
  roles: string[];
  createdAt: string;
}

export interface AuthResponse {
  token: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardStats {
  totalElections: number;
  activeElections: number;
  totalVoters: number;
  totalVotes: number;
}

export interface ElectionResults {
  election: string;
  totalVotes: number;
  results: {
    candidateId: string;
    candidateName: string;
    votes: number;
  }[];
}

export interface AuditLog {
  _id: string;
  actorType: string;
  actorId: string;
  action: string;
  metadata: any;
  timestamp: string;
}





