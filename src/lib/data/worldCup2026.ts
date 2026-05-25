import { Match } from '../firebase/models';

// Lista fictícia baseada no formato de 48 seleções aprovado pela FIFA.
// 12 Grupos de 4 seleções (Grupos de A a L).
export const TEAMS = {
  A: ["México", "África do Sul", "Coreia do Sul", "República Tcheca"],
  B: ["Canadá", "Bósnia e Herzegovina", "Catar", "Suíça"],
  C: ["Brasil", "Marrocos", "Haiti", "Escócia"],
  D: ["Estados Unidos", "Paraguai", "Austrália", "Turquia"],
  E: ["Alemanha", "Curaçao", "Costa do Marfim", "Equador"],
  F: ["Holanda", "Japão", "Suécia", "Tunísia"],
  G: ["Bélgica", "Egito", "Irã", "Nova Zelândia"],
  H: ["Espanha", "Cabo Verde", "Arábia Saudita", "Uruguai"],
  I: ["França", "Senegal", "Iraque", "Noruega"],
  J: ["Argentina", "Argélia", "Áustria", "Jordânia"],
  K: ["Portugal", "República Democrática do Congo", "Uzbequistão", "Colômbia"],
  L: ["Inglaterra", "Croácia", "Gana", "Panamá"]
};

// Gera jogos mockados para a fase de grupos
export function generateGroupMatches(): Match[] {
  const matches: Match[] = [];
  const groups = Object.keys(TEAMS) as Array<keyof typeof TEAMS>;
  
  let matchCounter = 1;
  const startDate = new Date("2026-06-11T12:00:00Z"); // Data de início fictícia

  for (const group of groups) {
    const teams = TEAMS[group];
    
    // Todos contra todos no grupo (3 rodadas, 6 jogos por grupo)
    // Rodada 1
    matches.push({
      id: `match_${matchCounter++}`,
      group,
      homeTeam: teams[0],
      awayTeam: teams[1],
      startTime: new Date(startDate.getTime() + (matchCounter * 1000 * 60 * 60 * 24)),
      stage: 'group',
      status: 'scheduled'
    });
    matches.push({
      id: `match_${matchCounter++}`,
      group,
      homeTeam: teams[2],
      awayTeam: teams[3],
      startTime: new Date(startDate.getTime() + (matchCounter * 1000 * 60 * 60 * 24)),
      stage: 'group',
      status: 'scheduled'
    });

    // Rodada 2
    matches.push({
      id: `match_${matchCounter++}`,
      group,
      homeTeam: teams[0],
      awayTeam: teams[2],
      startTime: new Date(startDate.getTime() + (matchCounter * 1000 * 60 * 60 * 24 * 4)),
      stage: 'group',
      status: 'scheduled'
    });
    matches.push({
      id: `match_${matchCounter++}`,
      group,
      homeTeam: teams[3],
      awayTeam: teams[1],
      startTime: new Date(startDate.getTime() + (matchCounter * 1000 * 60 * 60 * 24 * 4)),
      stage: 'group',
      status: 'scheduled'
    });

    // Rodada 3
    matches.push({
      id: `match_${matchCounter++}`,
      group,
      homeTeam: teams[3],
      awayTeam: teams[0],
      startTime: new Date(startDate.getTime() + (matchCounter * 1000 * 60 * 60 * 24 * 8)),
      stage: 'group',
      status: 'scheduled'
    });
    matches.push({
      id: `match_${matchCounter++}`,
      group,
      homeTeam: teams[1],
      awayTeam: teams[2],
      startTime: new Date(startDate.getTime() + (matchCounter * 1000 * 60 * 60 * 24 * 8)),
      stage: 'group',
      status: 'scheduled'
    });
  }

  return matches;
}

export const WORLD_CUP_MATCHES = generateGroupMatches();
