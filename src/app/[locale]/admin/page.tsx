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
  const [isGroupStageFinished, setIsGroupStageFinished] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string>('group');

  const groupMatches = matches.filter(m => m.stage === 'group');
  const round32Matches = matches.filter(m => m.stage === 'round32');

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
        let finishedCount = 0;
        const totalGroupMatches = WORLD_CUP_MATCHES.filter(m => m.stage === 'group').length;

        resultsSnap.forEach((doc) => {
          const data = doc.data() as MatchResult;
          resultsMap[data.matchId] = data;
          
          const match = WORLD_CUP_MATCHES.find(m => m.id === doc.id);
          if (match?.stage === 'group' && data.status === 'finished') {
            finishedCount++;
          }
        });
        
        setResults(resultsMap);
        setIsGroupStageFinished(finishedCount === totalGroupMatches);
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
                    <AdminMatchCard
                      key={match.id}
                      match={match}
                      matchResult={results[match.id]}
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
                      <AdminMatchCard
                        key={match.id}
                        match={match}
                        matchResult={results[match.id]}
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
