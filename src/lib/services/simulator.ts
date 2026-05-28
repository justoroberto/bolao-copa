import { Match } from '../firebase/models';
import { TEAMS } from '../data/worldCup2026';
import { THIRD_PLACE_MATCHUPS } from '../data/knockoutRules';

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
  stage: 'round32' | 'round16' | 'quarter' | 'semi' | 'thirdPlace' | 'final';
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

  // Identificar de quais grupos vieram os melhores terceiros (ex: ABCFGHJK)
  const thirdGroups = bestThirds.map(t => t.group.replace('Grupo ', '')).sort().join('');
  const thirdAssignments = THIRD_PLACE_MATCHUPS[thirdGroups];

  // Helpers para buscar equipes
  const getFirst = (groupLetter: string) => firsts.find(t => t.group.replace('Grupo ', '') === groupLetter)?.team || `1${groupLetter}`;
  const getSecond = (groupLetter: string) => seconds.find(t => t.group.replace('Grupo ', '') === groupLetter)?.team || `2${groupLetter}`;
  const getThird = (groupLetter: string) => bestThirds.find(t => t.group.replace('Grupo ', '') === groupLetter)?.team || `3${groupLetter}`;

  // Helper arrays for calculating winners incrementally
  const round32: KnockoutMatch[] = [
    { id: 'match_73', homeTeam: getFirst('E'), awayTeam: getThird(thirdAssignments?.['1E']?.replace('3', '') || 'A'), stage: 'round32', nextMatchId: 'match_89' },
    { id: 'match_74', homeTeam: getFirst('I'), awayTeam: getThird(thirdAssignments?.['1I']?.replace('3', '') || 'C'), stage: 'round32', nextMatchId: 'match_90' },
    { id: 'match_75', homeTeam: getSecond('A'), awayTeam: getSecond('B'), stage: 'round32', nextMatchId: 'match_89' },
    { id: 'match_76', homeTeam: getFirst('F'), awayTeam: getSecond('C'), stage: 'round32', nextMatchId: 'match_90' },
    { id: 'match_77', homeTeam: getSecond('K'), awayTeam: getSecond('L'), stage: 'round32', nextMatchId: 'match_93' },
    { id: 'match_78', homeTeam: getFirst('H'), awayTeam: getSecond('J'), stage: 'round32', nextMatchId: 'match_94' },
    { id: 'match_79', homeTeam: getFirst('D'), awayTeam: getThird(thirdAssignments?.['1D']?.replace('3', '') || 'B'), stage: 'round32', nextMatchId: 'match_93' },
    { id: 'match_80', homeTeam: getFirst('G'), awayTeam: getThird(thirdAssignments?.['1G']?.replace('3', '') || 'A'), stage: 'round32', nextMatchId: 'match_94' },
    { id: 'match_81', homeTeam: getFirst('C'), awayTeam: getSecond('F'), stage: 'round32', nextMatchId: 'match_91' },
    { id: 'match_82', homeTeam: getSecond('E'), awayTeam: getSecond('I'), stage: 'round32', nextMatchId: 'match_92' },
    { id: 'match_83', homeTeam: getFirst('A'), awayTeam: getThird(thirdAssignments?.['1A']?.replace('3', '') || 'C'), stage: 'round32', nextMatchId: 'match_91' },
    { id: 'match_84', homeTeam: getFirst('L'), awayTeam: getThird(thirdAssignments?.['1L']?.replace('3', '') || 'E'), stage: 'round32', nextMatchId: 'match_92' },
    { id: 'match_85', homeTeam: getFirst('J'), awayTeam: getSecond('H'), stage: 'round32', nextMatchId: 'match_95' },
    { id: 'match_86', homeTeam: getSecond('D'), awayTeam: getSecond('G'), stage: 'round32', nextMatchId: 'match_96' },
    { id: 'match_87', homeTeam: getFirst('B'), awayTeam: getThird(thirdAssignments?.['1B']?.replace('3', '') || 'E'), stage: 'round32', nextMatchId: 'match_95' },
    { id: 'match_88', homeTeam: getFirst('K'), awayTeam: getThird(thirdAssignments?.['1K']?.replace('3', '') || 'D'), stage: 'round32', nextMatchId: 'match_96' }
  ];

  const getWinner = (matchId: string, matchesArr: KnockoutMatch[]) => {
    const score = knockoutScores[matchId];
    const match = matchesArr.find(m => m.id === matchId);
    if (!score || score.home === null || score.away === null || score.home === score.away) return `Venc. ${matchId.replace('match_', '')}`;
    return score.home > score.away ? match!.homeTeam : match!.awayTeam;
  };

  const getLoser = (matchId: string, matchesArr: KnockoutMatch[]) => {
    const score = knockoutScores[matchId];
    const match = matchesArr.find(m => m.id === matchId);
    if (!score || score.home === null || score.away === null || score.home === score.away) return `Perd. ${matchId.replace('match_', '')}`;
    return score.home < score.away ? match!.homeTeam : match!.awayTeam;
  };

  const round16: KnockoutMatch[] = [
    { id: 'match_89', homeTeam: getWinner('match_73', round32), awayTeam: getWinner('match_75', round32), stage: 'round16', nextMatchId: 'match_97' },
    { id: 'match_90', homeTeam: getWinner('match_74', round32), awayTeam: getWinner('match_76', round32), stage: 'round16', nextMatchId: 'match_97' },
    { id: 'match_91', homeTeam: getWinner('match_81', round32), awayTeam: getWinner('match_83', round32), stage: 'round16', nextMatchId: 'match_98' },
    { id: 'match_92', homeTeam: getWinner('match_82', round32), awayTeam: getWinner('match_84', round32), stage: 'round16', nextMatchId: 'match_98' },
    { id: 'match_93', homeTeam: getWinner('match_77', round32), awayTeam: getWinner('match_79', round32), stage: 'round16', nextMatchId: 'match_99' },
    { id: 'match_94', homeTeam: getWinner('match_78', round32), awayTeam: getWinner('match_80', round32), stage: 'round16', nextMatchId: 'match_99' },
    { id: 'match_95', homeTeam: getWinner('match_85', round32), awayTeam: getWinner('match_87', round32), stage: 'round16', nextMatchId: 'match_100' },
    { id: 'match_96', homeTeam: getWinner('match_86', round32), awayTeam: getWinner('match_88', round32), stage: 'round16', nextMatchId: 'match_100' }
  ];

  const quarters: KnockoutMatch[] = [
    { id: 'match_97', homeTeam: getWinner('match_89', round16), awayTeam: getWinner('match_90', round16), stage: 'quarter', nextMatchId: 'match_101' },
    { id: 'match_98', homeTeam: getWinner('match_91', round16), awayTeam: getWinner('match_92', round16), stage: 'quarter', nextMatchId: 'match_101' },
    { id: 'match_99', homeTeam: getWinner('match_93', round16), awayTeam: getWinner('match_94', round16), stage: 'quarter', nextMatchId: 'match_102' },
    { id: 'match_100', homeTeam: getWinner('match_95', round16), awayTeam: getWinner('match_96', round16), stage: 'quarter', nextMatchId: 'match_102' }
  ];

  const semis: KnockoutMatch[] = [
    { id: 'match_101', homeTeam: getWinner('match_97', quarters), awayTeam: getWinner('match_98', quarters), stage: 'semi', nextMatchId: 'match_104' },
    { id: 'match_102', homeTeam: getWinner('match_99', quarters), awayTeam: getWinner('match_100', quarters), stage: 'semi', nextMatchId: 'match_104' }
  ];

  const thirdPlace: KnockoutMatch = {
    id: 'match_103', homeTeam: getLoser('match_101', semis), awayTeam: getLoser('match_102', semis), stage: 'thirdPlace'
  };

  const finalMatch: KnockoutMatch = {
    id: 'match_104', homeTeam: getWinner('match_101', semis), awayTeam: getWinner('match_102', semis), stage: 'final'
  };

  return [...round32, ...round16, ...quarters, ...semis, thirdPlace, finalMatch];
}
