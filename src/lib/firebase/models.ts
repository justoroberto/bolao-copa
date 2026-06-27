export interface User {
  id: string;
  email: string;
  nickname: string;
  emailVerified?: boolean;
  createdAt: Date;
  isAdmin?: boolean;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  stage: 'group' | 'round32' | 'round16' | 'quarter' | 'semi' | 'thirdPlace' | 'final';
  group?: string; // e.g., "A", "B", ..., "L"
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'live' | 'finished';
}

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  points?: number;
}

export interface Ranking {
  userId: string;
  nickname: string;
  totalPoints: number;
  exactScores: number;
  correctWinners: number;
}

export interface MatchResult {
  matchId: string;
  homeScore: number;
  awayScore: number;
  status: 'live' | 'finished';
}

export interface League {
  id: string;
  name: string;
  nameLower: string;
  adminId: string;
  participantIds: string[];
  createdAt: Date;
}
