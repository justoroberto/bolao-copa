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

export default function PredictionsPage() {
  const { user } = useAuth();
  const t = useTranslations('Predictions');
  const [matches] = useState<Match[]>(WORLD_CUP_MATCHES); // já vem ordenado por data
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [loadingPreds, setLoadingPreds] = useState(true);
  const [isGroupStageFinished, setIsGroupStageFinished] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string>('group');

  const groupMatches = matches.filter(m => m.stage === 'group');
  const round32Matches = matches.filter(m => m.stage === 'round32');

  // Busca o status dos jogos para ver se a fase de grupos já acabou
  useEffect(() => {
    async function checkGroupStage() {
      try {
        const resultsSnap = await getDocs(collection(db, 'matchResults'));
        let finishedCount = 0;
        const totalGroupMatches = WORLD_CUP_MATCHES.filter(m => m.stage === 'group').length;

        resultsSnap.forEach(doc => {
           const data = doc.data();
           const match = WORLD_CUP_MATCHES.find(m => m.id === doc.id);
           if (match?.stage === 'group' && data.status === 'finished') {
             finishedCount++;
           }
        });
        setIsGroupStageFinished(finishedCount === totalGroupMatches);
      } catch (e) {
        console.error("Erro ao checar status da fase de grupos", e);
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
                  <span>{t('progress', { made: validPredictionsCount, total: matches.length })}</span>
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
            
            <div className="phase-accordion">
              <button 
                className={`accordion-header ${openAccordion === 'group' ? 'open' : ''}`}
                onClick={() => setOpenAccordion(openAccordion === 'group' ? '' : 'group')}
                style={{ width: '100%', padding: '1rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-color)' }}
              >
                <span>Fase de Grupos ({groupMatches.length} jogos)</span>
                <span>{openAccordion === 'group' ? '▲' : '▼'}</span>
              </button>
              
              {openAccordion === 'group' && (
                <div className="matches-grid" style={{ marginTop: '1rem' }}>
                  {groupMatches.map((match) => (
                    <PredictionCard
                      key={match.id}
                      match={match}
                      prediction={predictions[match.id]}
                      onPredictionChange={handlePredictionChange}
                    />
                  ))}
                </div>
              )}
            </div>

            {round32Matches.length > 0 && (
              <div className="phase-accordion">
                <button 
                  className={`accordion-header ${openAccordion === 'round32' ? 'open' : ''}`}
                  onClick={() => setOpenAccordion(openAccordion === 'round32' ? '' : 'round32')}
                  style={{ width: '100%', padding: '1rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-color)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>16-Avos de Final ({round32Matches.length} jogos)</span>
                    {!isGroupStageFinished && <span style={{ fontSize: '0.9rem', padding: '0.2rem 0.5rem', background: 'var(--highlight-blue)', color: 'white', borderRadius: '4px' }}>Bloqueada 🔒</span>}
                  </div>
                  <span>{openAccordion === 'round32' ? '▲' : '▼'}</span>
                </button>
                
                {openAccordion === 'round32' && (
                  <div className="matches-grid" style={{ marginTop: '1rem' }}>
                    {round32Matches.map((match) => (
                      <PredictionCard
                        key={match.id}
                        match={match}
                        prediction={predictions[match.id]}
                        onPredictionChange={handlePredictionChange}
                        lockedPhase={!isGroupStageFinished}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
