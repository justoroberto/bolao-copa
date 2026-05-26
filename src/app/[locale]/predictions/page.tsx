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
  const t = useTranslations('Navigation');
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

  return (
    <ProtectedRoute>
      <div className="predictions-container">
        <header className="page-header">
          <h1>{t('predictions')}</h1>
          <p>Dê seus palpites nos jogos abaixo. Você tem até 1 dia (24 horas) antes de cada partida para editar.</p>
        </header>

        {loadingPreds ? (
          <div className="loading-state">Carregando seus palpites...</div>
        ) : (
          <div className="matches-grid">
            {matches.map((match) => (
              <PredictionCard
                key={match.id}
                match={match}
                prediction={predictions[match.id]}
              />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
