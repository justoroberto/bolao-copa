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
  const [isRound32Finished, setIsRound32Finished] = useState(false);
  const [isRound16Finished, setIsRound16Finished] = useState(false);
  const [isQuarterFinished, setIsQuarterFinished] = useState(false);
  const [isSemiFinished, setIsSemiFinished] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string>('group');

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
        let groupFinished = 0, round32Finished = 0, round16Finished = 0, quarterFinished = 0, semiFinished = 0;
        const totalGroup = WORLD_CUP_MATCHES.filter(m => m.stage === 'group').length;
        const totalRound32 = WORLD_CUP_MATCHES.filter(m => m.stage === 'round32').length;
        const totalRound16 = WORLD_CUP_MATCHES.filter(m => m.stage === 'round16').length;
        const totalQuarter = WORLD_CUP_MATCHES.filter(m => m.stage === 'quarter').length;
        const totalSemi = WORLD_CUP_MATCHES.filter(m => m.stage === 'semi').length;

        resultsSnap.forEach((doc) => {
          const data = doc.data() as MatchResult;
          resultsMap[data.matchId] = data;
          
          const match = WORLD_CUP_MATCHES.find(m => m.id === doc.id);
          if (data.status === 'finished') {
            if (match?.stage === 'group') groupFinished++;
            if (match?.stage === 'round32') round32Finished++;
            if (match?.stage === 'round16') round16Finished++;
            if (match?.stage === 'quarter') quarterFinished++;
            if (match?.stage === 'semi') semiFinished++;
          }
        });
        
        setResults(resultsMap);
        setIsGroupStageFinished(groupFinished === totalGroup && totalGroup > 0);
        setIsRound32Finished(round32Finished === totalRound32 && totalRound32 > 0);
        setIsRound16Finished(round16Finished === totalRound16 && totalRound16 > 0);
        setIsQuarterFinished(quarterFinished === totalQuarter && totalQuarter > 0);
        setIsSemiFinished(semiFinished === totalSemi && totalSemi > 0);
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
            {[
              { id: 'group', title: 'Fase de Grupos', matches: matches.filter(m => m.stage === 'group'), locked: false },
              { id: 'round32', title: '16-Avos', matches: matches.filter(m => m.stage === 'round32'), locked: !isGroupStageFinished },
              { id: 'round16', title: 'Oitavas', matches: matches.filter(m => m.stage === 'round16'), locked: !isRound32Finished },
              { id: 'quarter', title: 'Quartas', matches: matches.filter(m => m.stage === 'quarter'), locked: !isRound16Finished },
              { id: 'semi', title: 'Semis', matches: matches.filter(m => m.stage === 'semi'), locked: !isQuarterFinished },
              { id: 'finals', title: 'Finais', matches: matches.filter(m => m.stage === 'thirdPlace' || m.stage === 'final'), locked: !isSemiFinished }
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
                        <AdminMatchCard
                          key={match.id}
                          match={match}
                          matchResult={results[match.id]}
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
