import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';

interface VoterProfile {
  voterId: string;
  name?: string;
  email?: string;
  phone?: string;
  dept?: string;
  year?: string;
}

interface VoterContextType {
  isVoterAuthenticated: boolean;
  votingToken: string | null; // per-election voting token (short-lived)
  setVotingToken: (t: string | null) => void;
  voterToken: string | null; // session token for voter account
  setVoterToken: (t: string | null) => void;
  voter: VoterProfile | null;
  setVoter: (v: VoterProfile | null) => void;
  logoutVoter: () => void;
}

const VoterContext = createContext<VoterContextType | undefined>(undefined);

export const useVoter = () => {
  const ctx = useContext(VoterContext);
  if (!ctx) throw new Error('useVoter must be used within VoterProvider');
  return ctx;
};

export const VoterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [votingToken, setVotingToken] = useState<string | null>(null);
  const [voterToken, setVoterToken] = useState<string | null>(() => localStorage.getItem('voterToken'));
  const [voter, setVoter] = useState<VoterProfile | null>(null);

  useEffect(() => {
    if (voterToken) localStorage.setItem('voterToken', voterToken);
    else localStorage.removeItem('voterToken');
  }, [voterToken]);

  const logoutVoter = () => {
    setVoterToken(null);
    setVoter(null);
  };

  const value = useMemo(() => ({
    isVoterAuthenticated: Boolean(voterToken),
    votingToken,
    setVotingToken,
    voterToken,
    setVoterToken,
    voter,
    setVoter,
    logoutVoter,
  }), [voterToken, votingToken, voter]);

  return <VoterContext.Provider value={value}>{children}</VoterContext.Provider>;
};
