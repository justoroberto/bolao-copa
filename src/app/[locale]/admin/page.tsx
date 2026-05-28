'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminMatchCard from '@/components/AdminMatchCard';
import { Match, MatchResult } from '@/lib/firebase/models';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { WORLD_CUP_MATCHES } from '@/lib/data/worldCup2026';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [matches] = useState<Match[]>(WORLD_CUP_MATCHES);
  const [results, setResults] = useState<Record<string, MatchResult>>({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdminAndFetchResults() {
      if (!user) return;
      
      try {
        // 1. Checa se é admin
        const userDoc = await getDoc(doc(db, 'users', user.id));
        if (!userDoc.exists() || !userDoc.data().isAdmin) {
          router.push('/'); // Redireciona se não for admin
          return;
        }
        setIsAdmin(true);

        // 2. Busca os resultados reais
        const resultsSnap = await getDocs(collection(db, 'matchResults'));
        const resultsMap: Record<string, MatchResult> = {};
        resultsSnap.forEach((doc) => {
          const data = doc.data() as MatchResult;
          resultsMap[data.matchId] = data;
        });
        
        setResults(resultsMap);
      } catch (error) {
        console.error("Erro ao carregar admin: ", error);
      } finally {
        setLoading(false);
      }
    }

    checkAdminAndFetchResults();
  }, [user, router]);

  if (!isAdmin && !loading) {
    return null; // Impede renderização se não for admin
  }

  return (
    <ProtectedRoute>
      <div className="predictions-container">
        <header className="page-header" style={{ borderBottom: '2px solid var(--color-primary)' }}>
          <h1>Painel Administrativo ⚙️</h1>
          <p>Área restrita. Aqui você lança os resultados oficiais das partidas.</p>
          <div style={{ padding: '10px', backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: '4px', marginTop: '10px', fontSize: '0.9em' }}>
            Aviso: Ao salvar o resultado oficial de uma partida, o <strong>Ranking Global de todos os usuários será recalculado instantaneamente.</strong>
          </div>
        </header>

        {loading ? (
          <div className="loading-state">Validando credenciais e carregando painel...</div>
        ) : (
          <div className="matches-grid">
            {matches.map((match) => (
              <AdminMatchCard
                key={match.id}
                match={match}
                matchResult={results[match.id]}
              />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
