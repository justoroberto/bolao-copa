'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { WORLD_CUP_MATCHES, TEAMS } from '@/lib/data/worldCup2026';
import { calculateGroupStandings, generateKnockoutBracket, getQualifiedTeams } from '@/lib/services/simulator';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const renderTeam = (teamStr: string, align: 'left' | 'right', tTeams: any) => {
  if (!teamStr) return null;
  if (teamStr.startsWith('Venc')) return <span className={`sim-team ${align}`}>{teamStr}</span>;
  
  const parts = teamStr.split(' ');
  const flag = parts[0];
  const name = parts.slice(1).join(' ');
  
  // Se tiver um nome (e não for algo genérico), tenta traduzir
  const translatedName = name && tTeams.has(name) ? tTeams(name) : (name || teamStr);
  
  return (
    <span className={`sim-team ${align}`}>
      <span className="sim-flag">{flag}</span>
      <span className="sim-name"> {translatedName}</span>
    </span>
  );
};

export default function SimulatorPage() {
  const t = useTranslations('Simulator');
  const tCommon = useTranslations('Common');
  const tTeams = useTranslations('Teams');
  const [scores, setScores] = useState<Record<string, { home: number | null, away: number | null }>>({});
  const [activeGroup, setActiveGroup] = useState<string>('A');
  const [isLoaded, setIsLoaded] = useState(false);
  const [officialResults, setOfficialResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchOfficialResults = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'matchResults'));
        if (!snapshot.empty) {
          const results: Record<string, { home: number | null, away: number | null }> = {};
          const officials: Record<string, boolean> = {};
          
          snapshot.forEach(doc => {
            const data = doc.data();
            // Assuming data has homeScore and awayScore, and is final
            if (data.homeScore !== undefined && data.awayScore !== undefined) {
              results[doc.id] = { home: data.homeScore, away: data.awayScore };
              officials[doc.id] = true;
            }
          });

          setOfficialResults(officials);
          
          // Merge with sessionStorage scores
          const saved = sessionStorage.getItem('bolao_simulator_scores');
          let sessionScores = {};
          if (saved) {
            try {
              sessionScores = JSON.parse(saved);
            } catch (e) {}
          }
          
          // Official results overwrite session ones
          setScores({ ...sessionScores, ...results });
        } else {
          // No official results yet, just load session
          const saved = sessionStorage.getItem('bolao_simulator_scores');
          if (saved) {
            try {
              setScores(JSON.parse(saved));
            } catch (e) {}
          }
        }
        setIsLoaded(true);
      } catch (err) {
        console.error("Erro ao buscar resultados oficiais:", err);
        setIsLoaded(true);
      }
    };

    fetchOfficialResults();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      sessionStorage.setItem('bolao_simulator_scores', JSON.stringify(scores));
    }
  }, [scores, isLoaded]);

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

  const resetSimulator = () => {
    // Only reset non-official scores
    const newScores = { ...scores };
    Object.keys(newScores).forEach(key => {
      if (!officialResults[key]) {
        delete newScores[key];
      }
    });
    setScores(newScores);
    sessionStorage.removeItem('bolao_simulator_scores');
  };

  const standings = useMemo(() => calculateGroupStandings(WORLD_CUP_MATCHES, scores), [scores]);
  const knockoutMatches = useMemo(() => generateKnockoutBracket(standings, scores), [standings, scores]);
  const { allThirds } = useMemo(() => getQualifiedTeams(standings), [standings]);

  const GROUPS = Object.keys(TEAMS);

  return (
    <div className="simulator-container">
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('subtitle')}</p>
        <button onClick={resetSimulator} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'var(--highlight-green)', color: 'white', borderRadius: '4px', cursor: 'pointer', border: 'none', fontWeight: 'bold' }}>{t('reset')}</button>
      </header>

      {/* Fase de Grupos */}
      <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>{t('groupStage')}</h2>
      <div className="group-selector">
        {GROUPS.map((g) => (
          <button 
            key={g} 
            className={`group-btn ${activeGroup === g ? 'active' : ''}`}
            onClick={() => setActiveGroup(g)}
          >
            {tCommon('group')} {g}
          </button>
        ))}
      </div>

      <div className="simulator-layout" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
        {/* Jogos do Grupo Ativo */}
        <div className="matches-column" style={{ flex: '1', minWidth: '300px' }}>
          <div className="simulator-matches" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {WORLD_CUP_MATCHES.filter(m => m.group === `Grupo ${activeGroup}`).map(m => (
              <div key={m.id} className="sim-match-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1rem', borderRadius: '8px' }}>
                {renderTeam(m.homeTeam, 'right', tTeams)}
                <input 
                  type="number" 
                  min="0" max="99" 
                  disabled={officialResults[m.id]}
                  style={{ width: '50px', textAlign: 'center', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: officialResults[m.id] ? 'var(--input-bg)' : 'var(--card-bg)', color: officialResults[m.id] ? 'var(--text-secondary)' : 'var(--text-color)', fontWeight: officialResults[m.id] ? 'bold' : 'normal' }}
                  value={scores[m.id]?.home ?? ''} 
                  onChange={(e) => handleScoreChange(m.id, 'home', e.target.value)}
                />
                <span className="sim-vs" style={{ color: 'var(--text-secondary)' }}>X</span>
                <input 
                  type="number" 
                  min="0" max="99" 
                  disabled={officialResults[m.id]}
                  style={{ width: '50px', textAlign: 'center', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: officialResults[m.id] ? 'var(--input-bg)' : 'var(--card-bg)', color: officialResults[m.id] ? 'var(--text-secondary)' : 'var(--text-color)', fontWeight: officialResults[m.id] ? 'bold' : 'normal' }}
                  value={scores[m.id]?.away ?? ''} 
                  onChange={(e) => handleScoreChange(m.id, 'away', e.target.value)}
                />
                {renderTeam(m.awayTeam, 'left', tTeams)}
              </div>
            ))}
          </div>
        </div>

        {/* Tabela do Grupo Ativo */}
        <div className="standings-column" style={{ flex: '1', minWidth: '350px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{t('standings')} {activeGroup}</h3>
          <table className="standings-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '0.5rem' }}>{tCommon('pos')}</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>{tCommon('team')}</th>
                <th style={{ padding: '0.5rem' }}>{tCommon('pts')}</th>
                <th style={{ padding: '0.5rem' }}>{tCommon('played')}</th>
                <th style={{ padding: '0.5rem' }}>{tCommon('gd')}</th>
              </tr>
            </thead>
            <tbody>
              {standings[activeGroup]?.map((s, index) => {
                const parts = s.team.split(' ');
                const flag = parts.length > 1 && parts[0].length <= 4 ? parts[0] : '';
                const nameStr = flag ? parts.slice(1).join(' ') : s.team;
                const translatedTeamName = tTeams.has(nameStr) ? tTeams(nameStr) : nameStr;
                return (
                  <tr key={s.team} style={{ borderBottom: '1px solid var(--border-color)', background: index < 2 ? 'rgba(34, 197, 94, 0.1)' : 'transparent' }}>
                    <td style={{ padding: '0.5rem' }}>{index + 1}º</td>
                    <td style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold' }}>{flag} {translatedTeamName}</td>
                    <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{s.points}</td>
                    <td style={{ padding: '0.5rem' }}>{s.played}</td>
                    <td style={{ padding: '0.5rem' }}>{s.goalDifference}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela de Terceiros Colocados */}
      <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>Ranking dos 3º Colocados</h2>
      <div style={{ marginBottom: '4rem', overflowX: 'auto' }}>
        <table className="standings-table" style={{ width: '100%', maxWidth: '900px', borderCollapse: 'collapse', textAlign: 'center' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '0.5rem' }}>{tCommon('pos')}</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>{tCommon('team')}</th>
              <th style={{ padding: '0.5rem' }}>{tCommon('group')}</th>
              <th style={{ padding: '0.5rem' }}>{tCommon('pts')}</th>
              <th style={{ padding: '0.5rem' }}>{tCommon('played')}</th>
              <th style={{ padding: '0.5rem' }}>{tCommon('gd')}</th>
              <th style={{ padding: '0.5rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {allThirds?.map((s, index) => {
              const parts = s.team.split(' ');
              const flag = parts.length > 1 && parts[0].length <= 4 ? parts[0] : '';
              const nameStr = flag ? parts.slice(1).join(' ') : s.team;
              const translatedTeamName = tTeams.has(nameStr) ? tTeams(nameStr) : nameStr;
              const isQualified = index < 8;
              return (
                <tr key={s.team} style={{ borderBottom: '1px solid var(--border-color)', background: isQualified ? 'rgba(34, 197, 94, 0.1)' : 'transparent' }}>
                  <td style={{ padding: '0.5rem' }}>{index + 1}º</td>
                  <td style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold' }}>{flag} {translatedTeamName}</td>
                  <td style={{ padding: '0.5rem' }}>{s.group}</td>
                  <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{s.points}</td>
                  <td style={{ padding: '0.5rem' }}>{s.played}</td>
                  <td style={{ padding: '0.5rem' }}>{s.goalDifference}</td>
                  <td style={{ padding: '0.5rem', fontWeight: 'bold', color: isQualified ? 'var(--highlight-green)' : 'var(--highlight-red)' }}>
                    {isQualified ? 'Classificado' : 'Eliminado'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Fase de Mata-Mata */}
      <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>{t('knockout')}</h2>
      {knockoutMatches.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>{t('knockoutEmpty')}</p>
      ) : (
        <div className="bracket-layout" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '2rem' }}>
          {['round32', 'round16', 'quarter', 'semi', 'final'].map((stage, idx) => {
            const matchesForStage = knockoutMatches.filter(m => m.stage === stage);
            if (matchesForStage.length === 0) return null;
            return (
              <div key={stage} className="bracket-column" style={{ minWidth: '220px', flexShrink: 0 }}>
                <h4 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>
                  {tCommon(stage)}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', justifyContent: 'space-around' }}>
                  {matchesForStage.map((km) => {
                    // Translate knockout teams if possible
                    const translateKnockoutTeam = (tm: string) => {
                      if (!tm) return '';
                      if (tm.startsWith('Venc') || tm.includes('º Grupo')) return tm; // generic placeholder
                      const parts = tm.split(' ');
                      const flag = parts[0];
                      const name = parts.slice(1).join(' ');
                      return name && tTeams.has(name) ? `${flag} ${tTeams(name)}` : tm;
                    };
                    
                    return (
                    <div key={km.id} style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden', background: 'var(--card-bg)', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                      <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: !km.homeTeam.startsWith('Venc') ? 'bold' : 'normal' }}>{translateKnockoutTeam(km.homeTeam)}</span>
                        <input 
                          type="number" min="0" max="99" 
                          disabled={officialResults[km.id]}
                          style={{ width: '40px', padding: '0.2rem', textAlign: 'center', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: officialResults[km.id] ? 'var(--input-bg)' : 'var(--card-bg)', color: officialResults[km.id] ? 'var(--text-secondary)' : 'var(--text-color)', fontWeight: officialResults[km.id] ? 'bold' : 'normal' }}
                          value={scores[km.id]?.home ?? ''}
                          onChange={(e) => handleScoreChange(km.id, 'home', e.target.value)}
                        />
                      </div>
                      <div style={{ padding: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: !km.awayTeam.startsWith('Venc') ? 'bold' : 'normal' }}>{translateKnockoutTeam(km.awayTeam)}</span>
                        <input 
                          type="number" min="0" max="99" 
                          disabled={officialResults[km.id]}
                          style={{ width: '40px', padding: '0.2rem', textAlign: 'center', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: officialResults[km.id] ? 'var(--input-bg)' : 'var(--card-bg)', color: officialResults[km.id] ? 'var(--text-secondary)' : 'var(--text-color)', fontWeight: officialResults[km.id] ? 'bold' : 'normal' }}
                          value={scores[km.id]?.away ?? ''}
                          onChange={(e) => handleScoreChange(km.id, 'away', e.target.value)}
                        />
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
