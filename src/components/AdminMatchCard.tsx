'use client';

import React, { useState } from 'react';
import { Match, MatchResult } from '@/lib/firebase/models';
import { saveMatchResult, deleteMatchResult, setLiveMatchScore } from '@/lib/services/ranking';
import { useTranslations, useLocale } from 'next-intl';

interface AdminMatchCardProps {
  match: Match;
  matchResult?: MatchResult;
}

export default function AdminMatchCard({ match, matchResult }: AdminMatchCardProps) {
  const tTeams = useTranslations('Teams');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  
  const [homeScore, setHomeScore] = useState<string>(matchResult?.homeScore?.toString() || '');
  const [awayScore, setAwayScore] = useState<string>(matchResult?.awayScore?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle'|'success'|'error'|'live-success'>('idle');

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

  const handleScoreChange = (type: 'home' | 'away', value: string) => {
    if (value === '') {
      type === 'home' ? setHomeScore('') : setAwayScore('');
      return;
    }
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 99) {
      type === 'home' ? setHomeScore(parsed.toString()) : setAwayScore(parsed.toString());
    }
  };

  const handleSaveResult = async () => {
    if (homeScore === '' || awayScore === '') return;
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await saveMatchResult(match.id, parseInt(homeScore), parseInt(awayScore));
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
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await setLiveMatchScore(match.id, parseInt(homeScore), parseInt(awayScore));
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

      <div className="match-footer" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
        <button 
          onClick={handleSaveResult} 
          disabled={isSaving || isDeleting || homeScore === '' || awayScore === ''}
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: (isSaving || isDeleting || homeScore === '' || awayScore === '') ? 'not-allowed' : 'pointer',
            opacity: (isSaving || isDeleting || homeScore === '' || awayScore === '') ? 0.5 : 1,
            fontWeight: 'bold',
            width: '100%',
            transition: 'opacity 0.2s'
          }}
        >
          {isSaving ? 'Salvando e Calculando...' : 'Salvar Resultado Oficial (Fim de Jogo)'}
        </button>

        <button 
          onClick={handleSaveLive} 
          disabled={isSaving || isDeleting || homeScore === '' || awayScore === ''}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: 'var(--color-primary)',
            border: '2px solid var(--color-primary)',
            borderRadius: '4px',
            cursor: (isSaving || isDeleting || homeScore === '' || awayScore === '') ? 'not-allowed' : 'pointer',
            opacity: (isSaving || isDeleting || homeScore === '' || awayScore === '') ? 0.5 : 1,
            fontWeight: 'bold',
            width: '100%',
            transition: 'opacity 0.2s'
          }}
        >
          {isSaving ? 'Atualizando...' : 'Atualizar Placar Ao Vivo (Em Andamento)'}
        </button>

        {matchResult?.status === 'finished' && (
          <button 
            onClick={handleDeleteResult}
            disabled={isSaving || isDeleting}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-primary)',
              borderRadius: '4px',
              cursor: (isSaving || isDeleting) ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              width: '100%'
            }}
          >
            {isDeleting ? 'Removendo...' : 'Desfazer e Limpar Resultado'}
          </button>
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
