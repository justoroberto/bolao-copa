import { Match } from '../firebase/models';

// Equipes por Grupo - Copa do Mundo FIFA 2026
export const TEAMS = {
  A: ["🇲🇽 México", "🇿🇦 África do Sul", "🇰🇷 Coreia do Sul", "🇨🇿 República Tcheca"],
  B: ["🇨🇦 Canadá", "🇧🇦 Bósnia", "🇶🇦 Catar", "🇨🇭 Suíça"],
  C: ["🇧🇷 Brasil", "🇲🇦 Marrocos", "🇭🇹 Haiti", "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escócia"],
  D: ["🇺🇸 Estados Unidos", "🇵🇾 Paraguai", "🇦🇺 Austrália", "🇹🇷 Turquia"],
  E: ["🇩🇪 Alemanha", "🇨🇼 Curaçao", "🇨🇮 Costa do Marfim", "🇪🇨 Equador"],
  F: ["🇳🇱 Holanda", "🇯🇵 Japão", "🇸🇪 Suécia", "🇹🇳 Tunísia"],
  G: ["🇧🇪 Bélgica", "🇪🇬 Egito", "🇮🇷 Irã", "🇳🇿 Nova Zelândia"],
  H: ["🇪🇸 Espanha", "🇨🇻 Cabo Verde", "🇸🇦 Arábia Saudita", "🇺🇾 Uruguai"],
  I: ["🇫🇷 França", "🇸🇳 Senegal", "🇮🇶 Iraque", "🇳🇴 Noruega"],
  J: ["🇦🇷 Argentina", "🇩🇿 Argélia", "🇦🇹 Áustria", "🇯🇴 Jordânia"],
  K: ["🇵🇹 Portugal", "🇨🇩 RD Congo", "🇺🇿 Uzbequistão", "🇨🇴 Colômbia"],
  L: ["🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra", "🇭🇷 Croácia", "🇬🇭 Gana", "🇵🇦 Panamá"]
};

// Copa do Mundo FIFA 2026 - Fase de Grupos
// Datas baseadas no calendário oficial da FIFA (11 Jun - 27 Jun 2026)
// Todas as datas estão em UTC. Horário de Brasília = UTC-3
export const WORLD_CUP_MATCHES: Match[] = [

  // Grupo A
  { id: 'match_A1', group: 'Grupo A', homeTeam: '🇲🇽 México', awayTeam: '🇿🇦 África do Sul', startTime: new Date('2026-06-11T19:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_A2', group: 'Grupo A', homeTeam: '🇰🇷 Coreia do Sul', awayTeam: '🇨🇿 República Tcheca', startTime: new Date('2026-06-12T02:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_A3', group: 'Grupo A', homeTeam: '🇨🇿 República Tcheca', awayTeam: '🇿🇦 África do Sul', startTime: new Date('2026-06-18T16:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_A4', group: 'Grupo A', homeTeam: '🇲🇽 México', awayTeam: '🇰🇷 Coreia do Sul', startTime: new Date('2026-06-19T01:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_A5', group: 'Grupo A', homeTeam: '🇨🇿 República Tcheca', awayTeam: '🇲🇽 México', startTime: new Date('2026-06-25T01:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_A6', group: 'Grupo A', homeTeam: '🇿🇦 África do Sul', awayTeam: '🇰🇷 Coreia do Sul', startTime: new Date('2026-06-25T01:00:00Z'), stage: 'group', status: 'scheduled' },

  // Grupo B
  { id: 'match_B1', group: 'Grupo B', homeTeam: '🇨🇦 Canadá', awayTeam: '🇧🇦 Bósnia', startTime: new Date('2026-06-12T19:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_B2', group: 'Grupo B', homeTeam: '🇶🇦 Catar', awayTeam: '🇨🇭 Suíça', startTime: new Date('2026-06-13T19:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_B3', group: 'Grupo B', homeTeam: '🇨🇭 Suíça', awayTeam: '🇧🇦 Bósnia', startTime: new Date('2026-06-18T19:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_B4', group: 'Grupo B', homeTeam: '🇨🇦 Canadá', awayTeam: '🇶🇦 Catar', startTime: new Date('2026-06-18T22:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_B5', group: 'Grupo B', homeTeam: '🇨🇭 Suíça', awayTeam: '🇨🇦 Canadá', startTime: new Date('2026-06-24T19:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_B6', group: 'Grupo B', homeTeam: '🇧🇦 Bósnia', awayTeam: '🇶🇦 Catar', startTime: new Date('2026-06-24T19:00:00Z'), stage: 'group', status: 'scheduled' },

  // Grupo C
  { id: 'match_C1', group: 'Grupo C', homeTeam: '🇧🇷 Brasil', awayTeam: '🇲🇦 Marrocos', startTime: new Date('2026-06-13T22:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_C2', group: 'Grupo C', homeTeam: '🇭🇹 Haiti', awayTeam: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escócia', startTime: new Date('2026-06-14T00:30:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_C3', group: 'Grupo C', homeTeam: '🇧🇷 Brasil', awayTeam: '🇭🇹 Haiti', startTime: new Date('2026-06-20T00:30:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_C4', group: 'Grupo C', homeTeam: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escócia', awayTeam: '🇲🇦 Marrocos', startTime: new Date('2026-06-19T22:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_C5', group: 'Grupo C', homeTeam: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escócia', awayTeam: '🇧🇷 Brasil', startTime: new Date('2026-06-24T22:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_C6', group: 'Grupo C', homeTeam: '🇲🇦 Marrocos', awayTeam: '🇭🇹 Haiti', startTime: new Date('2026-06-24T22:00:00Z'), stage: 'group', status: 'scheduled' },

  // Grupo D
  { id: 'match_D1', group: 'Grupo D', homeTeam: '🇺🇸 Estados Unidos', awayTeam: '🇵🇾 Paraguai', startTime: new Date('2026-06-13T01:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_D2', group: 'Grupo D', homeTeam: '🇦🇺 Austrália', awayTeam: '🇹🇷 Turquia', startTime: new Date('2026-06-14T04:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_D3', group: 'Grupo D', homeTeam: '🇹🇷 Turquia', awayTeam: '🇵🇾 Paraguai', startTime: new Date('2026-06-20T04:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_D4', group: 'Grupo D', homeTeam: '🇺🇸 Estados Unidos', awayTeam: '🇦🇺 Austrália', startTime: new Date('2026-06-19T19:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_D5', group: 'Grupo D', homeTeam: '🇹🇷 Turquia', awayTeam: '🇺🇸 Estados Unidos', startTime: new Date('2026-06-26T02:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_D6', group: 'Grupo D', homeTeam: '🇵🇾 Paraguai', awayTeam: '🇦🇺 Austrália', startTime: new Date('2026-06-26T02:00:00Z'), stage: 'group', status: 'scheduled' },

  // Grupo E
  { id: 'match_E1', group: 'Grupo E', homeTeam: '🇩🇪 Alemanha', awayTeam: '🇨🇼 Curaçao', startTime: new Date('2026-06-14T17:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_E2', group: 'Grupo E', homeTeam: '🇨🇮 Costa do Marfim', awayTeam: '🇪🇨 Equador', startTime: new Date('2026-06-14T23:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_E3', group: 'Grupo E', homeTeam: '🇩🇪 Alemanha', awayTeam: '🇨🇮 Costa do Marfim', startTime: new Date('2026-06-20T20:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_E4', group: 'Grupo E', homeTeam: '🇪🇨 Equador', awayTeam: '🇨🇼 Curaçao', startTime: new Date('2026-06-21T00:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_E5', group: 'Grupo E', homeTeam: '🇪🇨 Equador', awayTeam: '🇩🇪 Alemanha', startTime: new Date('2026-06-25T20:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_E6', group: 'Grupo E', homeTeam: '🇨🇼 Curaçao', awayTeam: '🇨🇮 Costa do Marfim', startTime: new Date('2026-06-25T20:00:00Z'), stage: 'group', status: 'scheduled' },

  // Grupo F
  { id: 'match_F1', group: 'Grupo F', homeTeam: '🇳🇱 Holanda', awayTeam: '🇯🇵 Japão', startTime: new Date('2026-06-14T20:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_F2', group: 'Grupo F', homeTeam: '🇸🇪 Suécia', awayTeam: '🇹🇳 Tunísia', startTime: new Date('2026-06-15T02:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_F3', group: 'Grupo F', homeTeam: '🇳🇱 Holanda', awayTeam: '🇸🇪 Suécia', startTime: new Date('2026-06-20T17:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_F4', group: 'Grupo F', homeTeam: '🇹🇳 Tunísia', awayTeam: '🇯🇵 Japão', startTime: new Date('2026-06-21T04:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_F5', group: 'Grupo F', homeTeam: '🇹🇳 Tunísia', awayTeam: '🇳🇱 Holanda', startTime: new Date('2026-06-25T23:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_F6', group: 'Grupo F', homeTeam: '🇯🇵 Japão', awayTeam: '🇸🇪 Suécia', startTime: new Date('2026-06-25T23:00:00Z'), stage: 'group', status: 'scheduled' },

  // Grupo G
  { id: 'match_G1', group: 'Grupo G', homeTeam: '🇧🇪 Bélgica', awayTeam: '🇪🇬 Egito', startTime: new Date('2026-06-15T19:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_G2', group: 'Grupo G', homeTeam: '🇮🇷 Irã', awayTeam: '🇳🇿 Nova Zelândia', startTime: new Date('2026-06-16T01:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_G3', group: 'Grupo G', homeTeam: '🇧🇪 Bélgica', awayTeam: '🇮🇷 Irã', startTime: new Date('2026-06-21T19:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_G4', group: 'Grupo G', homeTeam: '🇳🇿 Nova Zelândia', awayTeam: '🇪🇬 Egito', startTime: new Date('2026-06-22T01:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_G5', group: 'Grupo G', homeTeam: '🇳🇿 Nova Zelândia', awayTeam: '🇧🇪 Bélgica', startTime: new Date('2026-06-27T03:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_G6', group: 'Grupo G', homeTeam: '🇪🇬 Egito', awayTeam: '🇮🇷 Irã', startTime: new Date('2026-06-27T03:00:00Z'), stage: 'group', status: 'scheduled' },

  // Grupo H
  { id: 'match_H1', group: 'Grupo H', homeTeam: '🇪🇸 Espanha', awayTeam: '🇨🇻 Cabo Verde', startTime: new Date('2026-06-15T16:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_H2', group: 'Grupo H', homeTeam: '🇸🇦 Arábia Saudita', awayTeam: '🇺🇾 Uruguai', startTime: new Date('2026-06-15T22:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_H3', group: 'Grupo H', homeTeam: '🇪🇸 Espanha', awayTeam: '🇸🇦 Arábia Saudita', startTime: new Date('2026-06-21T16:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_H4', group: 'Grupo H', homeTeam: '🇺🇾 Uruguai', awayTeam: '🇨🇻 Cabo Verde', startTime: new Date('2026-06-21T22:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_H5', group: 'Grupo H', homeTeam: '🇺🇾 Uruguai', awayTeam: '🇪🇸 Espanha', startTime: new Date('2026-06-27T00:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_H6', group: 'Grupo H', homeTeam: '🇨🇻 Cabo Verde', awayTeam: '🇸🇦 Arábia Saudita', startTime: new Date('2026-06-27T00:00:00Z'), stage: 'group', status: 'scheduled' },

  // Grupo I
  { id: 'match_I1', group: 'Grupo I', homeTeam: '🇫🇷 França', awayTeam: '🇸🇳 Senegal', startTime: new Date('2026-06-16T19:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_I2', group: 'Grupo I', homeTeam: '🇮🇶 Iraque', awayTeam: '🇳🇴 Noruega', startTime: new Date('2026-06-16T22:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_I3', group: 'Grupo I', homeTeam: '🇫🇷 França', awayTeam: '🇮🇶 Iraque', startTime: new Date('2026-06-22T21:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_I4', group: 'Grupo I', homeTeam: '🇳🇴 Noruega', awayTeam: '🇸🇳 Senegal', startTime: new Date('2026-06-23T00:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_I5', group: 'Grupo I', homeTeam: '🇳🇴 Noruega', awayTeam: '🇫🇷 França', startTime: new Date('2026-06-26T19:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_I6', group: 'Grupo I', homeTeam: '🇸🇳 Senegal', awayTeam: '🇮🇶 Iraque', startTime: new Date('2026-06-26T19:00:00Z'), stage: 'group', status: 'scheduled' },

  // Grupo J
  { id: 'match_J1', group: 'Grupo J', homeTeam: '🇦🇷 Argentina', awayTeam: '🇩🇿 Argélia', startTime: new Date('2026-06-17T01:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_J2', group: 'Grupo J', homeTeam: '🇦🇹 Áustria', awayTeam: '🇯🇴 Jordânia', startTime: new Date('2026-06-17T04:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_J3', group: 'Grupo J', homeTeam: '🇦🇷 Argentina', awayTeam: '🇦🇹 Áustria', startTime: new Date('2026-06-22T17:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_J4', group: 'Grupo J', homeTeam: '🇯🇴 Jordânia', awayTeam: '🇩🇿 Argélia', startTime: new Date('2026-06-23T03:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_J5', group: 'Grupo J', homeTeam: '🇯🇴 Jordânia', awayTeam: '🇦🇷 Argentina', startTime: new Date('2026-06-28T02:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_J6', group: 'Grupo J', homeTeam: '🇩🇿 Argélia', awayTeam: '🇦🇹 Áustria', startTime: new Date('2026-06-28T02:00:00Z'), stage: 'group', status: 'scheduled' },

  // Grupo K
  { id: 'match_K1', group: 'Grupo K', homeTeam: '🇵🇹 Portugal', awayTeam: '🇨🇩 RD Congo', startTime: new Date('2026-06-17T17:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_K2', group: 'Grupo K', homeTeam: '🇺🇿 Uzbequistão', awayTeam: '🇨🇴 Colômbia', startTime: new Date('2026-06-18T02:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_K3', group: 'Grupo K', homeTeam: '🇵🇹 Portugal', awayTeam: '🇺🇿 Uzbequistão', startTime: new Date('2026-06-23T17:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_K4', group: 'Grupo K', homeTeam: '🇨🇴 Colômbia', awayTeam: '🇨🇩 RD Congo', startTime: new Date('2026-06-24T02:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_K5', group: 'Grupo K', homeTeam: '🇨🇴 Colômbia', awayTeam: '🇵🇹 Portugal', startTime: new Date('2026-06-27T23:30:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_K6', group: 'Grupo K', homeTeam: '🇨🇩 RD Congo', awayTeam: '🇺🇿 Uzbequistão', startTime: new Date('2026-06-27T23:30:00Z'), stage: 'group', status: 'scheduled' },

  // Grupo L
  { id: 'match_L1', group: 'Grupo L', homeTeam: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra', awayTeam: '🇭🇷 Croácia', startTime: new Date('2026-06-17T20:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_L2', group: 'Grupo L', homeTeam: '🇬🇭 Gana', awayTeam: '🇵🇦 Panamá', startTime: new Date('2026-06-17T23:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_L3', group: 'Grupo L', homeTeam: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra', awayTeam: '🇬🇭 Gana', startTime: new Date('2026-06-23T20:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_L4', group: 'Grupo L', homeTeam: '🇵🇦 Panamá', awayTeam: '🇭🇷 Croácia', startTime: new Date('2026-06-23T23:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_L5', group: 'Grupo L', homeTeam: '🇵🇦 Panamá', awayTeam: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra', startTime: new Date('2026-06-27T21:00:00Z'), stage: 'group', status: 'scheduled' },
  { id: 'match_L6', group: 'Grupo L', homeTeam: '🇭🇷 Croácia', awayTeam: '🇬🇭 Gana', startTime: new Date('2026-06-27T21:00:00Z'), stage: 'group', status: 'scheduled' },

  // 16-Avos de Final (Round 32)
  { id: 'match_75', group: '16-Avos', homeTeam: '🇿🇦 África do Sul', awayTeam: '🇨🇦 Canadá', startTime: new Date('2026-06-28T19:00:00Z'), stage: 'round32', status: 'scheduled' }, // 16h BRT = 19h UTC
  { id: 'match_81', group: '16-Avos', homeTeam: '🇧🇷 Brasil', awayTeam: '🇯🇵 Japão', startTime: new Date('2026-06-29T17:00:00Z'), stage: 'round32', status: 'scheduled' }, // 14h BRT = 17h UTC
  { id: 'match_73', group: '16-Avos', homeTeam: '🇩🇪 Alemanha', awayTeam: '3º Grupo A/B/C/D/F', startTime: new Date('2026-06-29T20:30:00Z'), stage: 'round32', status: 'scheduled' }, // 17h30 BRT = 20h30 UTC
  { id: 'match_76', group: '16-Avos', homeTeam: '🇳🇱 Holanda', awayTeam: '🇲🇦 Marrocos', startTime: new Date('2026-06-30T01:00:00Z'), stage: 'round32', status: 'scheduled' }, // 22h BRT = 01h UTC do dia seguinte
  { id: 'match_82', group: '16-Avos', homeTeam: '🇨🇮 Costa do Marfim', awayTeam: '🇳🇴 Noruega', startTime: new Date('2026-06-30T17:00:00Z'), stage: 'round32', status: 'scheduled' }, // 14h BRT = 17h UTC
  { id: 'match_74', group: '16-Avos', homeTeam: '🇫🇷 França', awayTeam: '3º Grupo C/D/F/G/H', startTime: new Date('2026-06-30T21:00:00Z'), stage: 'round32', status: 'scheduled' }, // 18h BRT = 21h UTC
  { id: 'match_83', group: '16-Avos', homeTeam: '🇲🇽 México', awayTeam: '3º Grupo C/E/F/H/I', startTime: new Date('2026-07-01T01:00:00Z'), stage: 'round32', status: 'scheduled' }, // 22h BRT = 01h UTC
  { id: 'match_84', group: '16-Avos', homeTeam: '1º Grupo L', awayTeam: '3º Grupo E/H/I/J/K', startTime: new Date('2026-07-01T16:00:00Z'), stage: 'round32', status: 'scheduled' }, // 13h BRT = 16h UTC
  { id: 'match_80', group: '16-Avos', homeTeam: '🇧🇪 Bélgica', awayTeam: '3º Grupo A/E/H/I/J', startTime: new Date('2026-07-01T20:00:00Z'), stage: 'round32', status: 'scheduled' }, // 17h BRT = 20h UTC
  { id: 'match_79', group: '16-Avos', homeTeam: '🇺🇸 Estados Unidos', awayTeam: '3º Grupo B/E/F/I/J', startTime: new Date('2026-07-02T00:00:00Z'), stage: 'round32', status: 'scheduled' }, // 21h BRT = 00h UTC
  { id: 'match_78', group: '16-Avos', homeTeam: '🇪🇸 Espanha', awayTeam: '2º Grupo J', startTime: new Date('2026-07-02T19:00:00Z'), stage: 'round32', status: 'scheduled' }, // 16h BRT = 19h UTC
  { id: 'match_77', group: '16-Avos', homeTeam: '2º Grupo K', awayTeam: '2º Grupo L', startTime: new Date('2026-07-02T23:00:00Z'), stage: 'round32', status: 'scheduled' }, // 20h BRT = 23h UTC
  { id: 'match_87', group: '16-Avos', homeTeam: '🇨🇭 Suíça', awayTeam: '3º Grupo E/F/G/I/J', startTime: new Date('2026-07-03T03:00:00Z'), stage: 'round32', status: 'scheduled' }, // 00h BRT = 03h UTC
  { id: 'match_86', group: '16-Avos', homeTeam: '🇦🇺 Austrália', awayTeam: '🇪🇬 Egito', startTime: new Date('2026-07-03T18:00:00Z'), stage: 'round32', status: 'scheduled' }, // 15h BRT = 18h UTC
  { id: 'match_85', group: '16-Avos', homeTeam: '🇦🇷 Argentina', awayTeam: '🇨🇻 Cabo Verde', startTime: new Date('2026-07-03T22:00:00Z'), stage: 'round32', status: 'scheduled' }, // 19h BRT = 22h UTC
  { id: 'match_88', group: '16-Avos', homeTeam: '1º Grupo K', awayTeam: '3º Grupo D/E/I/J/L', startTime: new Date('2026-07-04T01:30:00Z'), stage: 'round32', status: 'scheduled' }, // 22h30 BRT = 01h30 UTC

  // Oitavas de Final (Round 16)
  { id: 'match_90', group: 'Oitavas', homeTeam: 'Venc. 75', awayTeam: 'Venc. 76', startTime: new Date('2026-07-04T17:00:00Z'), stage: 'round16', status: 'scheduled' }, // 14h BRT
  { id: 'match_89', group: 'Oitavas', homeTeam: 'Venc. 73', awayTeam: 'Venc. 74', startTime: new Date('2026-07-04T21:00:00Z'), stage: 'round16', status: 'scheduled' }, // 18h BRT
  { id: 'match_93', group: 'Oitavas', homeTeam: 'Venc. 81', awayTeam: 'Venc. 82', startTime: new Date('2026-07-05T20:00:00Z'), stage: 'round16', status: 'scheduled' }, // 17h BRT
  { id: 'match_94', group: 'Oitavas', homeTeam: 'Venc. 83', awayTeam: 'Venc. 84', startTime: new Date('2026-07-06T00:00:00Z'), stage: 'round16', status: 'scheduled' }, // 21h BRT (00h do dia seguinte)
  { id: 'match_91', group: 'Oitavas', homeTeam: 'Venc. 77', awayTeam: 'Venc. 78', startTime: new Date('2026-07-06T19:00:00Z'), stage: 'round16', status: 'scheduled' }, // 16h BRT
  { id: 'match_92', group: 'Oitavas', homeTeam: 'Venc. 79', awayTeam: 'Venc. 80', startTime: new Date('2026-07-07T00:00:00Z'), stage: 'round16', status: 'scheduled' }, // 21h BRT (00h do dia seguinte)
  { id: 'match_95', group: 'Oitavas', homeTeam: 'Venc. 85', awayTeam: 'Venc. 86', startTime: new Date('2026-07-07T16:00:00Z'), stage: 'round16', status: 'scheduled' }, // 13h BRT
  { id: 'match_96', group: 'Oitavas', homeTeam: 'Venc. 87', awayTeam: 'Venc. 88', startTime: new Date('2026-07-07T20:00:00Z'), stage: 'round16', status: 'scheduled' }, // 17h BRT

  // Quartas de Final (Quarter)
  { id: 'match_97', group: 'Quartas', homeTeam: 'Venc. 89', awayTeam: 'Venc. 90', startTime: new Date('2026-07-09T20:00:00Z'), stage: 'quarter', status: 'scheduled' }, // 17h BRT
  { id: 'match_98', group: 'Quartas', homeTeam: 'Venc. 91', awayTeam: 'Venc. 92', startTime: new Date('2026-07-10T19:00:00Z'), stage: 'quarter', status: 'scheduled' }, // 16h BRT
  { id: 'match_99', group: 'Quartas', homeTeam: 'Venc. 93', awayTeam: 'Venc. 94', startTime: new Date('2026-07-11T21:00:00Z'), stage: 'quarter', status: 'scheduled' }, // 18h BRT
  { id: 'match_100', group: 'Quartas', homeTeam: 'Venc. 95', awayTeam: 'Venc. 96', startTime: new Date('2026-07-12T01:00:00Z'), stage: 'quarter', status: 'scheduled' }, // 22h BRT (01h do dia seguinte)

  // Semifinal (Semi)
  { id: 'match_101', group: 'Semifinal', homeTeam: 'Venc. 97', awayTeam: 'Venc. 98', startTime: new Date('2026-07-14T19:00:00Z'), stage: 'semi', status: 'scheduled' }, // 16h BRT
  { id: 'match_102', group: 'Semifinal', homeTeam: 'Venc. 99', awayTeam: 'Venc. 100', startTime: new Date('2026-07-15T19:00:00Z'), stage: 'semi', status: 'scheduled' }, // 16h BRT

  // Disputa do 3º Lugar (Third Place)
  { id: 'match_103', group: '3º Lugar', homeTeam: 'Perd. 101', awayTeam: 'Perd. 102', startTime: new Date('2026-07-18T21:00:00Z'), stage: 'thirdPlace', status: 'scheduled' }, // 18h BRT

  // Final
  { id: 'match_104', group: 'Final', homeTeam: 'Venc. 101', awayTeam: 'Venc. 102', startTime: new Date('2026-07-19T19:00:00Z'), stage: 'final', status: 'scheduled' } // 16h BRT

].sort((a, b) => a.startTime.getTime() - b.startTime.getTime()) as Match[];
