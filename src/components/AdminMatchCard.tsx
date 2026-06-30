'use client';

import React, { useState } from 'react';
import { Match, MatchResult } from '@/lib/firebase/models';
import { saveMatchResult, deleteMatchResult, setLiveMatchScore } from '@/lib/services/ranking';
import { useTranslations, useLocale } from 'next-intl';

interface AdminMatchCardProps {
  match: Match;
  matchResult?: MatchResult;
  lockedPhase?: boolean;
}

export default function AdminMatchCard({ match, matchResult, lockedPhase }: AdminMatchCardProps) {
  const tTeams = useTranslations('Teams');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  
  const [homeScore, setHomeScore] = useState<string>(matchResult?.homeScore?.toString() || '');
  const [awayScore, setAwayScore] = useState<string>(matchResult?.awayScore?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle'|'success'|'error'|'live-success'>('idle');

  const [penaltyWinner, setPenaltyWinner] = useState<'home' | 'away' | undefined>(matchResult?.penaltyWinner);

  const formattedDate = match.startTime.toLocaleString(locale, { 
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const renderTeamName = (teamStr: string) => {
    if (!teamStr) return '';
    const parts = teamStr.split(' ');
    const flag = parts[0];
    const name = parts.slice(1).join(' ');
    const translatedName = name && tTeams.has(name) ? tTeams(name) : name;
    return `${flag} ${translatedName}`;
  };

  const groupText = match.group ? match.group.replace('Grupo', tCommon('group')) : match.stage.toUpperCase();

  const isKnockoutDraw = match.stage !== 'group' && homeScore !== '' && awayScore !== '' && homeScore === awayScore;

  const handleScoreChange = (type: 'home' | 'away', value: string) => {
    if (value === '') {
      type === 'home' ? setHomeScore('') : setAwayScore('');
      if (penaltyWinner) setPenaltyWinner(undefined);
      return;
    }
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 99) {
      if (type === 'home') {
        setHomeScore(parsed.toString());
        if (parsed.toString() !== awayScore && penaltyWinner) setPenaltyWinner(undefined);
      } else {
        setAwayScore(parsed.toString());
        if (parsed.toString() !== homeScore && penaltyWinner) setPenaltyWinner(undefined);
      }
    }
  };

  const handleSaveResult = async () => {
    if (homeScore === '' || awayScore === '') return;
    if (isKnockoutDraw && !penaltyWinner) return;
    
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await saveMatchResult(match.id, parseInt(homeScore), parseInt(awayScore), penaltyWinner);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLive = async () => {
    if (homeScore === '' || awayScore === '') return;
    if (isKnockoutDraw && !penaltyWinner) return;
    
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await setLiveMatchScore(match.id, parseInt(homeScore), parseInt(awayScore), penaltyWinner);
      setSaveStatus('live-success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResult = async () => {
    setIsDeleting(true);
    setSaveStatus('idle');
    try {
      await deleteMatchResult(match.id);
      setHomeScore('');
      setAwayScore('');
      setPenaltyWinner(undefined);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`prediction-card ${matchResult?.status === 'finished' ? 'locked' : ''}`} style={{ borderColor: matchResult?.status === 'finished' ? 'var(--color-primary)' : '' }}>
      <div className="match-header">
        <span className="match-stage">{groupText}</span>
        <span className="match-date">{formattedDate}</span>
      </div>
      
      <div className="match-teams">
        <div className="team home-team">
          <span className="team-name">{renderTeamName(match.homeTeam)}</span>
          <input 
            type="number" 
            min="0"
            max="99"
            className="score-input"
            value={homeScore}
            onChange={(e) => handleScoreChange('home', e.target.value)}
            placeholder="-"
          />
        </div>
        
        <span className="versus">x</span>
        
        <div className="team away-team">
          <span className="team-name">{renderTeamName(match.awayTeam)}</span>
          <input 
            type="number" 
            min="0"
            max="99"
            className="score-input"
            value={awayScore}
            onChange={(e) => handleScoreChange('away', e.target.value)}
            placeholder="-"
          />
        </div>
      </div>

      {isKnockoutDraw && (
        <div className="penalty-winner-section" style={{ marginTop: '1rem', padding: '0.5rem', background: 'var(--bg-color)', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Classificado Oficial (Pênaltis):</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="radio" 
                name={`admin-penalty-${match.id}`} 
                checked={penaltyWinner === 'home'} 
                onChange={() => setPenaltyWinner('home')}
              />
              <span style={{ fontSize: '0.9rem' }}>{renderTeamName(match.homeTeam)}</span>
            </label>
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="radio" 
                name={`admin-penalty-${match.id}`} 
                checked={penaltyWinner === 'away'} 
                onChange={() => setPenaltyWinner('away')}
              />
              <span style={{ fontSize: '0.9rem' }}>{renderTeamName(match.awayTeam)}</span>
            </label>
          </div>
        </div>
      )}

      <div className="match-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        {lockedPhase ? (
          <div className="locked-badge" style={{ width: '100%', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: 'var(--highlight-blue)', border: '1px solid var(--highlight-blue)', borderRadius: '4px' }}>
            <span style={{ fontSize: '1.2rem' }}>⏳</span>
            Fase bloqueada aguardando resultados
          </div>
        ) : (
          <>
            <button 
              className="save-button" 
              onClick={handleSaveResult}
              disabled={isSaving || isDeleting || homeScore === '' || awayScore === ''}
              style={{ width: '100%', padding: '0.8rem', fontWeight: 'bold', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: (isSaving || isDeleting || homeScore === '' || awayScore === '') ? 'not-allowed' : 'pointer', opacity: (isSaving || isDeleting || homeScore === '' || awayScore === '') ? 0.5 : 1 }}
            >
              {isSaving ? 'Salvando...' : 'Salvar Resultado Oficial (Fim de Jogo) 🏆'}
            </button>

            <button 
              className="save-button" 
              onClick={handleSaveLive}
              disabled={isSaving || isDeleting || homeScore === '' || awayScore === '' || matchResult?.status === 'finished'}
              style={{ width: '100%', padding: '0.8rem', fontWeight: 'bold', backgroundColor: 'transparent', color: 'var(--color-primary)', border: '2px solid var(--color-primary)', borderRadius: '4px', cursor: (isSaving || isDeleting || homeScore === '' || awayScore === '' || matchResult?.status === 'finished') ? 'not-allowed' : 'pointer', opacity: (isSaving || isDeleting || homeScore === '' || awayScore === '' || matchResult?.status === 'finished') ? 0.5 : 1 }}
            >
              {isSaving ? 'Atualizando...' : 'Atualizar Placar Ao Vivo (Em Andamento) 🔴'}
            </button>

            {matchResult?.status === 'finished' && (
              <button 
                className="save-button" 
                onClick={handleDeleteResult}
                disabled={isSaving || isDeleting}
                style={{ width: '100%', padding: '0.5rem', backgroundColor: 'transparent', color: 'var(--highlight-red)', border: '1px solid var(--highlight-red)', borderRadius: '4px', marginTop: '0.5rem', cursor: (isSaving || isDeleting) ? 'not-allowed' : 'pointer' }}
              >
                {isDeleting ? 'Excluindo...' : 'Desfazer e Limpar Resultado'}
              </button>
            )}
          </>
        )}

        <div className="status-indicator">
          {saveStatus === 'success' && <span className="saved text-green">✓ Oficializado & Ranking Atualizado!</span>}
          {saveStatus === 'live-success' && <span className="saved text-blue" style={{ color: 'var(--highlight-blue)' }}>✓ Placar Ao Vivo Atualizado!</span>}
          {saveStatus === 'error' && <span className="error text-red">Erro (Você é Admin?)</span>}
          {matchResult?.status === 'finished' && saveStatus !== 'success' && <span className="hint">Partida finalizada</span>}
          {matchResult?.status === 'live' && saveStatus !== 'live-success' && <span className="hint" style={{ color: 'var(--highlight-blue)' }}>Ao Vivo</span>}
        </div>
      </div>
    </div>
  );
}
