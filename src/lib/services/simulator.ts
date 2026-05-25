import { Match } from '../firebase/models';
import { TEAMS } from '../data/worldCup2026';

export interface TeamStats {
  team: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export function calculateGroupStandings(matches: Match[], scores: Record<string, { home: number | null, away: number | null }>): Record<string, TeamStats[]> {
  const standings: Record<string, TeamStats[]> = {};

  // Initialize standings for all groups
  Object.keys(TEAMS).forEach((group) => {
    standings[group] = TEAMS[group as keyof typeof TEAMS].map(team => ({
      team,
      points: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0
    }));
  });

  // Calculate points and stats based on simulated scores
  matches.filter(m => m.stage === 'group').forEach(match => {
    const score = scores[match.id];
    if (score && score.home !== null && score.away !== null && match.group) {
      const groupStandings = standings[match.group];
      const homeStats = groupStandings.find(s => s.team === match.homeTeam);
      const awayStats = groupStandings.find(s => s.team === match.awayTeam);

      if (homeStats && awayStats) {
        homeStats.played += 1;
        awayStats.played += 1;
        homeStats.goalsFor += score.home;
        homeStats.goalsAgainst += score.away;
        awayStats.goalsFor += score.away;
        awayStats.goalsAgainst += score.home;

        homeStats.goalDifference = homeStats.goalsFor - homeStats.goalsAgainst;
        awayStats.goalDifference = awayStats.goalsFor - awayStats.goalsAgainst;

        if (score.home > score.away) {
          homeStats.won += 1;
          homeStats.points += 3;
          awayStats.lost += 1;
        } else if (score.home < score.away) {
          awayStats.won += 1;
          awayStats.points += 3;
          homeStats.lost += 1;
        } else {
          homeStats.drawn += 1;
          awayStats.drawn += 1;
          homeStats.points += 1;
          awayStats.points += 1;
        }
      }
    }
  });

  // Sort each group according to FIFA rules: Points, GD, GF
  Object.keys(standings).forEach(group => {
    standings[group].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  });

  return standings;
}

export interface KnockoutMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  stage: 'round32' | 'round16' | 'quarter' | 'semi' | 'final';
  nextMatchId?: string;
}

export function getQualifiedTeams(standings: Record<string, TeamStats[]>) {
  const firsts: (TeamStats & { group: string })[] = [];
  const seconds: (TeamStats & { group: string })[] = [];
  const thirds: (TeamStats & { group: string })[] = [];

  Object.keys(standings).forEach(group => {
    const groupTeams = standings[group];
    if (groupTeams.length >= 3) {
      firsts.push({ ...groupTeams[0], group });
      seconds.push({ ...groupTeams[1], group });
      thirds.push({ ...groupTeams[2], group });
    }
  });

  // Ordenar terceiros por Pontos -> SG -> GF
  thirds.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  const bestThirds = thirds.slice(0, 8);
  return { firsts, seconds, bestThirds };
}

export function generateKnockoutBracket(
  standings: Record<string, TeamStats[]>,
  knockoutScores: Record<string, { home: number | null, away: number | null }> = {}
): KnockoutMatch[] {
  const { firsts, seconds, bestThirds } = getQualifiedTeams(standings);
  
  if (firsts.length < 12 || seconds.length < 12 || bestThirds.length < 8) {
    return []; // Aguardando dados suficientes (ou todos os jogos simulados)
  }

  const round32: KnockoutMatch[] = [];
  const usedTeams = new Set<string>();

  // Auxiliares para sortear adversários de grupos diferentes
  const getAvailableOpponent = (teamGroup: string, pool: typeof firsts) => {
    const idx = pool.findIndex(t => t.group !== teamGroup && !usedTeams.has(t.team));
    if (idx !== -1) {
      const selected = pool[idx];
      usedTeams.add(selected.team);
      return selected;
    }
    // Fallback caso impossível (algoritmo guloso pode ter cantos cegos)
    const fallbackIdx = pool.findIndex(t => !usedTeams.has(t.team));
    if (fallbackIdx !== -1) {
      const selected = pool[fallbackIdx];
      usedTeams.add(selected.team);
      return selected;
    }
    return null;
  };

  let matchCounter = 1;

  // 1. Os 8 melhores 3ºs enfrentam 8 Líderes
  bestThirds.forEach(third => {
    const leader = getAvailableOpponent(third.group, firsts);
    if (leader) {
      round32.push({
        id: `r32_${matchCounter++}`,
        homeTeam: leader.team,
        awayTeam: third.team,
        stage: 'round32'
      });
      usedTeams.add(third.team);
    }
  });

  // 2. Os 4 Líderes restantes enfrentam 4 Segundos
  firsts.filter(f => !usedTeams.has(f.team)).forEach(leader => {
    const second = getAvailableOpponent(leader.group, seconds);
    if (second) {
      round32.push({
        id: `r32_${matchCounter++}`,
        homeTeam: leader.team,
        awayTeam: second.team,
        stage: 'round32'
      });
      usedTeams.add(leader.team);
    }
  });

  // 3. Os 8 Segundos restantes enfrentam-se entre si (4 jogos)
  const remainingSeconds = seconds.filter(s => !usedTeams.has(s.team));
  for (let i = 0; i < remainingSeconds.length; i += 2) {
    if (i + 1 < remainingSeconds.length) {
      round32.push({
        id: `r32_${matchCounter++}`,
        homeTeam: remainingSeconds[i].team,
        awayTeam: remainingSeconds[i+1].team,
        stage: 'round32'
      });
      usedTeams.add(remainingSeconds[i].team);
      usedTeams.add(remainingSeconds[i+1].team);
    }
  }

  // Helper para determinar vencedor (sem suporte a empate por enquanto)
  const getWinner = (match: KnockoutMatch) => {
    const score = knockoutScores[match.id];
    if (!score || score.home === null || score.away === null || score.home === score.away) {
      return `Venc. ${match.id}`;
    }
    return score.home > score.away ? match.homeTeam : match.awayTeam;
  };

  // Bracket build com propagação
  const round16: KnockoutMatch[] = [];
  const quarters: KnockoutMatch[] = [];
  const semis: KnockoutMatch[] = [];
  const finalMatch: KnockoutMatch = {
    id: `final_1`, homeTeam: 'Venc. semi_1', awayTeam: 'Venc. semi_2', stage: 'final'
  };

  // Build R16 (8 matches)
  for (let i = 0; i < 16; i += 2) {
    const r16Id = `r16_${(i/2)+1}`;
    round32[i].nextMatchId = r16Id;
    round32[i+1].nextMatchId = r16Id;
    round16.push({
      id: r16Id,
      homeTeam: getWinner(round32[i]),
      awayTeam: getWinner(round32[i+1]),
      stage: 'round16'
    });
  }

  // Build Quarters (4 matches)
  for (let i = 0; i < 8; i += 2) {
    const qId = `q_${(i/2)+1}`;
    round16[i].nextMatchId = qId;
    round16[i+1].nextMatchId = qId;
    quarters.push({
      id: qId,
      homeTeam: getWinner(round16[i]),
      awayTeam: getWinner(round16[i+1]),
      stage: 'quarter'
    });
  }

  // Build Semis (2 matches)
  for (let i = 0; i < 4; i += 2) {
    const sId = `semi_${(i/2)+1}`;
    quarters[i].nextMatchId = sId;
    quarters[i+1].nextMatchId = sId;
    semis.push({
      id: sId,
      homeTeam: getWinner(quarters[i]),
      awayTeam: getWinner(quarters[i+1]),
      stage: 'semi',
      nextMatchId: 'final_1'
    });
  }

  finalMatch.homeTeam = getWinner(semis[0]);
  finalMatch.awayTeam = getWinner(semis[1]);

  return [...round32, ...round16, ...quarters, ...semis, finalMatch];
}
