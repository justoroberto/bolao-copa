import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { MatchResult, Prediction } from '@/lib/firebase/models';
import { WORLD_CUP_MATCHES } from '@/lib/data/worldCup2026';
import './LiveMatchBanner.css';
import { useTranslations } from 'next-intl';

interface LiveMatchBannerProps {
  participants: { userId: string; nickname: string }[];
  type: 'global' | 'league';
}

interface LiveUserPoints {
  userId: string;
  nickname: string;
  predHome: number | null;
  predAway: number | null;
  points: number;
}

export default function LiveMatchBanner({ participants, type }: LiveMatchBannerProps) {
  const [dbMatches, setDbMatches] = useState<MatchResult[]>([]);
  const [now, setNow] = useState(new Date());
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [matchPredictions, setMatchPredictions] = useState<Record<string, LiveUserPoints[]>>({});
  const t = useTranslations('Common');

  // Atualiza o horário atual a cada minuto
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Escuta todos os jogos salvos (live ou finished)
  useEffect(() => {
    const q = query(collection(db, 'matchResults'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const matches: MatchResult[] = [];
      snapshot.forEach(doc => matches.push(doc.data() as MatchResult));
      setDbMatches(matches);
    });
    return () => unsubscribe();
  }, []);

  const liveMatches = React.useMemo(() => {
    const dbLiveMap = new Map<string, MatchResult>();
    const finishedSet = new Set<string>();

    dbMatches.forEach(m => {
      if (m.status === 'live') dbLiveMap.set(m.matchId, m);
      if (m.status === 'finished') finishedSet.add(m.matchId);
    });

    const computedLive: MatchResult[] = [];
    dbLiveMap.forEach(m => computedLive.push(m));

    WORLD_CUP_MATCHES.forEach(m => {
      if (m.startTime <= now) {
        if (!finishedSet.has(m.id) && !dbLiveMap.has(m.id)) {
          computedLive.push({
            matchId: m.id,
            homeScore: 0,
            awayScore: 0,
            status: 'live'
          });
        }
      }
    });

    return computedLive;
  }, [dbMatches, now]);

  // Busca as predições sempre que houver jogos ao vivo e participantes mudarem
  useEffect(() => {
    async function fetchPredictions() {
      if (liveMatches.length === 0 || participants.length === 0) {
        setMatchPredictions({});
        return;
      }

      const predsByMatch: Record<string, LiveUserPoints[]> = {};

      for (const live of liveMatches) {
        const q = query(collection(db, 'predictions'), where('matchId', '==', live.matchId));
        const snap = await getDocs(q);
        
        const predsMap = new Map<string, Prediction>();
        snap.forEach(doc => {
          const p = doc.data() as Prediction;
          predsMap.set(p.userId, p);
        });

        const userPoints: LiveUserPoints[] = participants.map(p => {
          const pred = predsMap.get(p.userId);
          let points = 0;
          if (pred) {
            const predOutcome = pred.homeScore > pred.awayScore ? 'home' : pred.homeScore < pred.awayScore ? 'away' : 'tie';
            const resOutcome = live.homeScore > live.awayScore ? 'home' : live.homeScore < live.awayScore ? 'away' : 'tie';

            if (pred.homeScore === live.homeScore && pred.awayScore === live.awayScore) {
              points = 3;
            } else if (predOutcome === resOutcome) {
              points = 1;
            }
          }

          return {
            userId: p.userId,
            nickname: p.nickname,
            predHome: pred ? pred.homeScore : null,
            predAway: pred ? pred.awayScore : null,
            points
          };
        });

        // Ordena por pontos na partida (desc)
        userPoints.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          return a.nickname.localeCompare(b.nickname);
        });

        predsByMatch[live.matchId] = userPoints;
      }

      setMatchPredictions(predsByMatch);
    }

    fetchPredictions();
  }, [liveMatches, participants]);

  if (liveMatches.length === 0) return null;

  const getMatchInfo = (matchId: string) => WORLD_CUP_MATCHES.find(m => m.id === matchId);

  return (
    <div className="live-match-container">
      {liveMatches.map(live => {
        const matchInfo = getMatchInfo(live.matchId);
        if (!matchInfo) return null;
        
        const isExpanded = expandedMatchId === live.matchId;
        const users = matchPredictions[live.matchId] || [];

        return (
          <div key={live.matchId} className="live-match-card">
            <div 
              className="live-match-header" 
              onClick={() => setExpandedMatchId(isExpanded ? null : live.matchId)}
            >
              <div className="live-badge">
                <span className="live-dot"></span>
                AO VIVO
              </div>
              <div className="live-scoreboard">
                <span className="live-team">{matchInfo.homeTeam}</span>
                <span className="live-score">{live.homeScore}</span>
                <span className="live-vs">x</span>
                <span className="live-score">{live.awayScore}</span>
                <span className="live-team">{matchInfo.awayTeam}</span>
              </div>
              <div className="live-toggle">
                {isExpanded ? '▲' : '▼'}
              </div>
            </div>

            {isExpanded && (
              <div className="live-match-details">
                <div className="live-details-title">
                  {type === 'global' ? 'Palpites do Top 100 Geral' : 'Palpites da Liga'}
                </div>
                <div className="live-users-list">
                  {users.length === 0 && <p style={{textAlign:'center', padding:'1rem'}}>Nenhum palpite encontrado.</p>}
                  {(() => {
                    let currentRank = 1;
                    let prevPoints = -1;
                    return users.map((u, idx) => {
                      if (idx === 0) prevPoints = u.points;
                      else if (u.points !== prevPoints) {
                        currentRank = idx + 1;
                        prevPoints = u.points;
                      }
                      
                      return (
                        <div key={u.userId} className={`live-user-row points-${u.points}`}>
                          <span className="live-user-rank">{currentRank}º</span>
                          <span className="live-user-name">{u.nickname}</span>
                          <span className="live-user-pred">
                            {u.predHome !== null ? `[${u.predHome} x ${u.predAway}]` : 'Sem palpite'}
                          </span>
                          <span className="live-user-points">
                            +{u.points} pts
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
