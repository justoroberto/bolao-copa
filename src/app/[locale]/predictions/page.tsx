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
          <div className="matches-grid">
            {matches.map((match) => (
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
    </ProtectedRoute>
  );
}
