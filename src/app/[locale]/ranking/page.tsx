'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Ranking } from '@/lib/firebase/models';
import { useTranslations } from 'next-intl';

export default function RankingPage() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('Ranking');

  useEffect(() => {
    // Escuta em tempo real a coleção 'rankings', ordenando pelos pontos
    const rankingsRef = collection(db, 'rankings');
    const q = query(rankingsRef, orderBy('totalPoints', 'desc'), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const topRankings: Ranking[] = [];
      snapshot.forEach((doc) => {
        topRankings.push(doc.data() as Ranking);
      });
      
      // Client-side tie-breaker sorting
      topRankings.sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        if ((b.exactScores || 0) !== (a.exactScores || 0)) return (b.exactScores || 0) - (a.exactScores || 0);
        return (b.correctWinners || 0) - (a.correctWinners || 0);
      });

      setRankings(topRankings);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar ranking:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="ranking-container">
      <header className="page-header">
        <h1>🏆 {t('title')}</h1>
        <p>{t('subtitle')}</p>
      </header>

      {loading ? (
        <div className="loading-state">{t('loading')}</div>
      ) : (
        <div className="ranking-board">
          {rankings.length === 0 ? (
            <p className="empty-ranking">{t('empty')}</p>
          ) : (
            <ul className="ranking-list">
              {rankings.map((rank, index) => {
                const position = index + 1;
                let positionClass = '';
                if (position === 1) positionClass = 'gold';
                else if (position === 2) positionClass = 'silver';
                else if (position === 3) positionClass = 'bronze';

                return (
                  <li key={rank.userId} className={`ranking-item ${positionClass}`}>
                    <div className="rank-position">
                      {position}°
                    </div>
                    <div className="rank-nickname">
                      {rank.nickname}
                    </div>
                    <div className="rank-stats">
                      <span title={t('exactScores')}>🎯 {rank.exactScores || 0}</span>
                      <span title={t('correctWinners')}>✔️ {rank.correctWinners || 0}</span>
                    </div>
                    <div className="rank-points">
                      {rank.totalPoints} <span>pts</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
