'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import PredictionCard from '@/components/PredictionCard';
import { Match, Prediction } from '@/lib/firebase/models';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { WORLD_CUP_MATCHES } from '@/lib/data/worldCup2026';
import { calculateGroupStandings, generateKnockoutBracket } from '@/lib/services/simulator';

export default function PredictionsPage() {
  const { user } = useAuth();
  const t = useTranslations('Predictions');
  const [matches] = useState<Match[]>(WORLD_CUP_MATCHES); // já vem ordenado por data
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [loadingPreds, setLoadingPreds] = useState(true);
  const [isGroupStageFinished, setIsGroupStageFinished] = useState(false);
  const [isRound32Finished, setIsRound32Finished] = useState(false);
  const [isRound16Finished, setIsRound16Finished] = useState(false);
  const [isQuarterFinished, setIsQuarterFinished] = useState(false);
  const [isSemiFinished, setIsSemiFinished] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string>('group');
  const [displayMatches, setDisplayMatches] = useState<Match[]>(WORLD_CUP_MATCHES);

  // Busca o status dos jogos para ver se as fases já acabaram
  useEffect(() => {
    async function checkGroupStage() {
      try {
        const resultsSnap = await getDocs(collection(db, 'matchResults'));
        let groupFinished = 0, round32Finished = 0, round16Finished = 0, quarterFinished = 0, semiFinished = 0;
        const totalGroup = WORLD_CUP_MATCHES.filter(m => m.stage === 'group').length;
        const totalRound32 = WORLD_CUP_MATCHES.filter(m => m.stage === 'round32').length;
        const totalRound16 = WORLD_CUP_MATCHES.filter(m => m.stage === 'round16').length;
        const totalQuarter = WORLD_CUP_MATCHES.filter(m => m.stage === 'quarter').length;
        const totalSemi = WORLD_CUP_MATCHES.filter(m => m.stage === 'semi').length;

        const dbScores: Record<string, { home: number | null, away: number | null, penaltyWinner?: 'home' | 'away' }> = {};

        resultsSnap.forEach(doc => {
           const data = doc.data();
           const match = WORLD_CUP_MATCHES.find(m => m.id === doc.id);
           
           if (data.homeScore !== undefined && data.awayScore !== undefined) {
             dbScores[doc.id] = { home: data.homeScore, away: data.awayScore, penaltyWinner: data.penaltyWinner };
           }

           if (data.status === 'finished') {
             if (match?.stage === 'group') groupFinished++;
             if (match?.stage === 'round32') round32Finished++;
             if (match?.stage === 'round16') round16Finished++;
             if (match?.stage === 'quarter') quarterFinished++;
             if (match?.stage === 'semi') semiFinished++;
           }
        });
        
        const isGF = groupFinished === totalGroup && totalGroup > 0;
        const isR32 = round32Finished === totalRound32 && totalRound32 > 0;
        const isR16 = round16Finished === totalRound16 && totalRound16 > 0;
        const isQF = quarterFinished === totalQuarter && totalQuarter > 0;
        const isSF = semiFinished === totalSemi && totalSemi > 0;

        setIsGroupStageFinished(isGF);
        setIsRound32Finished(isR32);
        setIsRound16Finished(isR16);
        setIsQuarterFinished(isQF);
        setIsSemiFinished(isSF);

        if (!isGF) setOpenAccordion('group');
        else if (!isR32) setOpenAccordion('round32');
        else if (!isR16) setOpenAccordion('round16');
        else if (!isQF) setOpenAccordion('quarter');
        else if (!isSF) setOpenAccordion('semi');
        else setOpenAccordion('finals');

        // Resolve os nomes das equipes baseando-se nos resultados oficiais
        const standings = calculateGroupStandings(WORLD_CUP_MATCHES, dbScores);
        const knockouts = generateKnockoutBracket(standings, dbScores);
        
        if (knockouts.length > 0) {
          const updatedMatches = WORLD_CUP_MATCHES.map(m => {
            const ko = knockouts.find(k => k.id === m.id);
            if (ko) {
              return { ...m, homeTeam: ko.homeTeam, awayTeam: ko.awayTeam };
            }
            return m;
          });
          setDisplayMatches(updatedMatches);
        }
      } catch (e) {
        console.error("Erro ao checar status das fases", e);
      }
    }
    checkGroupStage();
  }, []);

  // Busca os palpites que o usuário já fez no Firestore
  useEffect(() => {
    async function fetchPredictions() {
      if (!user) return;
      
      try {
        const q = query(collection(db, 'predictions'), where('userId', '==', user.id));
        const snapshot = await getDocs(q);
        
        const predsMap: Record<string, Prediction> = {};
        snapshot.forEach((doc) => {
          const data = doc.data() as Prediction;
          predsMap[data.matchId] = data;
        });
        
        setPredictions(predsMap);
      } catch (error) {
        console.error("Erro ao carregar previsões: ", error);
      } finally {
        setLoadingPreds(false);
      }
    }

    fetchPredictions();
  }, [user]);

  const handlePredictionChange = React.useCallback((matchId: string, homeScoreStr: string, awayScoreStr: string) => {
    setPredictions(prev => {
      const existing = prev[matchId] || { matchId, userId: user?.id || '', id: matchId } as Prediction;
      const homeScore = homeScoreStr === '' ? NaN : parseInt(homeScoreStr, 10);
      const awayScore = awayScoreStr === '' ? NaN : parseInt(awayScoreStr, 10);
      
      return {
        ...prev,
        [matchId]: {
          ...existing,
          homeScore: homeScore as number,
          awayScore: awayScore as number
        }
      };
    });
  }, [user?.id]);

  return (
    <ProtectedRoute>
      <div className="predictions-container">
        <header className="page-header">
          <h1>{t('title')}</h1>
          <p>{t('subtitle')}</p>
          {!loadingPreds && (() => {
            const validPredictionsCount = Object.values(predictions).filter(
              (p) => typeof p.homeScore === 'number' && !isNaN(p.homeScore) &&
                     typeof p.awayScore === 'number' && !isNaN(p.awayScore)
            ).length;
            const progressPercent = Math.round((validPredictionsCount / matches.length) * 100);
            
            return (
              <div className="predictions-progress" style={{ marginTop: '1.5rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <span>{t('progress', { made: validPredictionsCount, total: displayMatches.length })}</span>
                  <span>{progressPercent}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--card-bg)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--highlight-green)', transition: 'width 0.3s ease' }}></div>
                </div>
              </div>
            );
          })()}
        </header>

        {loadingPreds ? (
          <div className="loading-state">{t('loading')}</div>
        ) : (
          <div className="phases-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { id: 'group', title: 'Fase de Grupos', matches: displayMatches.filter(m => m.stage === 'group'), locked: false },
              { id: 'round32', title: '16-Avos', matches: displayMatches.filter(m => m.stage === 'round32'), locked: !isGroupStageFinished },
              { id: 'round16', title: 'Oitavas', matches: displayMatches.filter(m => m.stage === 'round16'), locked: !isRound32Finished },
              { id: 'quarter', title: 'Quartas', matches: displayMatches.filter(m => m.stage === 'quarter'), locked: !isRound16Finished },
              { id: 'semi', title: 'Semis', matches: displayMatches.filter(m => m.stage === 'semi'), locked: !isQuarterFinished },
              { id: 'finals', title: 'Finais', matches: displayMatches.filter(m => m.stage === 'thirdPlace' || m.stage === 'final'), locked: !isSemiFinished }
            ].map(phase => {
              if (phase.matches.length === 0) return null;
              const isOpen = openAccordion === phase.id;
              
              return (
                <div key={phase.id} className="phase-accordion">
                  <button 
                    className={`accordion-header ${isOpen ? 'open' : ''}`}
                    onClick={() => setOpenAccordion(isOpen ? '' : phase.id)}
                    style={{ width: '100%', padding: '1rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 'bold', color: 'var(--text-color)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', textAlign: 'left' }}>
                      <span style={{ fontSize: 'clamp(1rem, 4vw, 1.2rem)' }}>{phase.title} <span style={{ opacity: 0.7, fontSize: '0.85em', fontWeight: 'normal' }}>({phase.matches.length})</span></span>
                      {phase.locked && <span style={{ fontSize: '1.2rem', marginLeft: '0.25rem' }}>🔒</span>}
                    </div>
                    <span>{isOpen ? '▲' : '▼'}</span>
                  </button>
                  
                  {isOpen && (
                    <div className="matches-grid" style={{ marginTop: '1rem' }}>
                      {phase.matches.map((match) => (
                        <PredictionCard
                          key={match.id}
                          match={match}
                          prediction={predictions[match.id]}
                          onPredictionChange={handlePredictionChange}
                          lockedPhase={phase.locked}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}


          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
