// Dados base puramente para demonstração da engine do Simulador.
// O Formato da COPA 2026 tem 48 Seleções (12 Grupos de 4).

export interface SimMatch {
  id: string;
  groupId?: string; // 'A', 'B', etc.
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'finished' | 'scheduled';
}

export const INITIAL_SIM_MATCHES: SimMatch[] = [
  // Grupo A
  { id: 'sim_1', groupId: 'A', homeTeam: 'Canadá', awayTeam: 'Irlanda', homeScore: 2, awayScore: 1, status: 'finished' },
  { id: 'sim_2', groupId: 'A', homeTeam: 'Espanha', awayTeam: 'Senegal', homeScore: null, awayScore: null, status: 'scheduled' },
  { id: 'sim_3', groupId: 'A', homeTeam: 'Canadá', awayTeam: 'Senegal', homeScore: null, awayScore: null, status: 'scheduled' },
  { id: 'sim_4', groupId: 'A', homeTeam: 'Espanha', awayTeam: 'Irlanda', homeScore: null, awayScore: null, status: 'scheduled' },
  { id: 'sim_5', groupId: 'A', homeTeam: 'Espanha', awayTeam: 'Canadá', homeScore: null, awayScore: null, status: 'scheduled' },
  { id: 'sim_6', groupId: 'A', homeTeam: 'Senegal', awayTeam: 'Irlanda', homeScore: null, awayScore: null, status: 'scheduled' },

  // Grupo B
  { id: 'sim_7', groupId: 'B', homeTeam: 'Brasil', awayTeam: 'Suíça', homeScore: null, awayScore: null, status: 'scheduled' },
  { id: 'sim_8', groupId: 'B', homeTeam: 'Gana', awayTeam: 'Japão', homeScore: null, awayScore: null, status: 'scheduled' },
  { id: 'sim_9', groupId: 'B', homeTeam: 'Brasil', awayTeam: 'Japão', homeScore: null, awayScore: null, status: 'scheduled' },
  { id: 'sim_10', groupId: 'B', homeTeam: 'Gana', awayTeam: 'Suíça', homeScore: null, awayScore: null, status: 'scheduled' },
  { id: 'sim_11', groupId: 'B', homeTeam: 'Gana', awayTeam: 'Brasil', homeScore: null, awayScore: null, status: 'scheduled' },
  { id: 'sim_12', groupId: 'B', homeTeam: 'Japão', awayTeam: 'Suíça', homeScore: null, awayScore: null, status: 'scheduled' },
];

export const GROUPS = ['A', 'B'];
