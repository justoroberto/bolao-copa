'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { WORLD_CUP_MATCHES, TEAMS } from '@/lib/data/worldCup2026';
import { calculateGroupStandings, generateKnockoutBracket } from '@/lib/services/simulator';

export default function SimulatorPage() {
  const t = useTranslations('Navigation');
  const [scores, setScores] = useState<Record<string, { home: number | null, away: number | null }>>({});
  const [activeGroup, setActiveGroup] = useState<string>('A');

  const handleScoreChange = (matchId: string, type: 'home' | 'away', value: string) => {
    const numValue = value === '' ? null : parseInt(value, 10);
    setScores(prev => ({
      ...prev,
      [matchId]: {
        home: type === 'home' ? numValue : (prev[matchId]?.home ?? null),
        away: type === 'away' ? numValue : (prev[matchId]?.away ?? null)
      }
    }));
  };

  const resetSimulator = () => setScores({});

  const standings = useMemo(() => calculateGroupStandings(WORLD_CUP_MATCHES, scores), [scores]);
  const knockoutMatches = useMemo(() => generateKnockoutBracket(standings, scores), [standings, scores]);

  const GROUPS = Object.keys(TEAMS);

  return (
    <div className="simulator-container">
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>🎮 Simulador Copa 2026</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Simule os resultados e veja como a tabela reage. Isso NÃO afeta seus palpites reais.</p>
        <button onClick={resetSimulator} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#dc2626', color: 'white', borderRadius: '4px', cursor: 'pointer', border: 'none' }}>Resetar Simulação</button>
      </header>

      {/* Fase de Grupos */}
      <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>Fase de Grupos</h2>
      <div className="group-selector" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {GROUPS.map((g) => (
          <button 
            key={g} 
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '4px', 
              cursor: 'pointer',
              background: activeGroup === g ? '#2563eb' : '#e5e7eb',
              color: activeGroup === g ? 'white' : '#374151',
              border: 'none',
              fontWeight: activeGroup === g ? 'bold' : 'normal'
            }}
            onClick={() => setActiveGroup(g)}
          >
            Grupo {g}
          </button>
        ))}
      </div>

      <div className="simulator-layout" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
        {/* Jogos do Grupo Ativo */}
        <div className="matches-column" style={{ flex: '1', minWidth: '300px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Partidas</h3>
          <div className="simulator-matches" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {WORLD_CUP_MATCHES.filter(m => m.group === activeGroup).map(m => (
              <div key={m.id} className="sim-match-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                <span className="sim-team right" style={{ flex: 1, textAlign: 'right', fontWeight: 'bold' }}>{m.homeTeam}</span>
                <input 
                  type="number" 
                  min="0" max="99" 
                  style={{ width: '50px', textAlign: 'center', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                  value={scores[m.id]?.home ?? ''} 
                  onChange={(e) => handleScoreChange(m.id, 'home', e.target.value)}
                />
                <span className="sim-vs" style={{ color: 'var(--text-secondary)' }}>X</span>
                <input 
                  type="number" 
                  min="0" max="99" 
                  style={{ width: '50px', textAlign: 'center', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                  value={scores[m.id]?.away ?? ''} 
                  onChange={(e) => handleScoreChange(m.id, 'away', e.target.value)}
                />
                <span className="sim-team left" style={{ flex: 1, textAlign: 'left', fontWeight: 'bold' }}>{m.awayTeam}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabela do Grupo Ativo */}
        <div className="standings-column" style={{ flex: '1', minWidth: '350px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Classificação do Grupo {activeGroup}</h3>
          <table className="standings-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '0.5rem' }}>Pos</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Seleção</th>
                <th style={{ padding: '0.5rem' }}>Pts</th>
                <th style={{ padding: '0.5rem' }}>J</th>
                <th style={{ padding: '0.5rem' }}>SG</th>
              </tr>
            </thead>
            <tbody>
              {standings[activeGroup]?.map((s, index) => (
                <tr key={s.team} style={{ borderBottom: '1px solid var(--border-color)', background: index < 2 ? 'rgba(34, 197, 94, 0.1)' : 'transparent' }}>
                  <td style={{ padding: '0.5rem' }}>{index + 1}º</td>
                  <td style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold' }}>{s.team}</td>
                  <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{s.points}</td>
                  <td style={{ padding: '0.5rem' }}>{s.played}</td>
                  <td style={{ padding: '0.5rem' }}>{s.goalDifference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fase de Mata-Mata */}
      <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>Chaveamento - Mata-Mata</h2>
      {knockoutMatches.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>Preencha mais resultados na fase de grupos para gerar os classificados e o chaveamento.</p>
      ) : (
        <div className="bracket-layout" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '2rem' }}>
          {['round32', 'round16', 'quarter', 'semi', 'final'].map((stage, idx) => {
            const matchesForStage = knockoutMatches.filter(m => m.stage === stage);
            if (matchesForStage.length === 0) return null;
            const stageNames = { round32: '16-Avos', round16: 'Oitavas', quarter: 'Quartas', semi: 'Semi', final: 'Final' };
            return (
              <div key={stage} className="bracket-column" style={{ minWidth: '220px', flexShrink: 0 }}>
                <h4 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>
                  {stageNames[stage as keyof typeof stageNames]}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', justifyContent: 'space-around' }}>
                  {matchesForStage.map((km) => (
                    <div key={km.id} style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden', background: 'var(--bg-secondary)', fontSize: '0.9rem' }}>
                      <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: !km.homeTeam.startsWith('Venc') ? 'bold' : 'normal' }}>{km.homeTeam}</span>
                        <input 
                          type="number" min="0" max="99" 
                          style={{ width: '40px', padding: '0.2rem', textAlign: 'center', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                          value={scores[km.id]?.home ?? ''}
                          onChange={(e) => handleScoreChange(km.id, 'home', e.target.value)}
                        />
                      </div>
                      <div style={{ padding: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: !km.awayTeam.startsWith('Venc') ? 'bold' : 'normal' }}>{km.awayTeam}</span>
                        <input 
                          type="number" min="0" max="99" 
                          style={{ width: '40px', padding: '0.2rem', textAlign: 'center', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                          value={scores[km.id]?.away ?? ''}
                          onChange={(e) => handleScoreChange(km.id, 'away', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
