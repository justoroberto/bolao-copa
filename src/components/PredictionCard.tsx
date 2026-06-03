'use client';

import React, { useState, useEffect } from 'react';
import { Match, Prediction } from '@/lib/firebase/models';
import { canEditPrediction } from '@/lib/services/score';
import { savePrediction, deletePrediction } from '@/lib/services/predictions';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations, useLocale } from 'next-intl';

interface PredictionCardProps {
  match: Match;
  prediction?: Prediction;
  onPredictionChange?: (matchId: string, homeScore: string, awayScore: string) => void;
}

export default function PredictionCard({ match, prediction, onPredictionChange }: PredictionCardProps) {
  const { user } = useAuth();
  const t = useTranslations('Predictions');
  const tTeams = useTranslations('Teams');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  
  // States para os scores
  const [homeScore, setHomeScore] = useState<string>(prediction?.homeScore?.toString() || '');
  const [awayScore, setAwayScore] = useState<string>(prediction?.awayScore?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle'|'success'|'error'>('idle');
  const [hasEdited, setHasEdited] = useState(false);

  // Verifica bloqueio de tempo
  const isLocked = !canEditPrediction(match.startTime) || match.status !== 'scheduled';
  
  // Converte data para exibição respeitando o locale, com hora e sem dia da semana
  const formattedDate = match.startTime.toLocaleString(locale, { 
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
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

  // Salva apenas se o valor for um número válido
  const handleScoreChange = async (type: 'home' | 'away', value: string) => {
    setHasEdited(true);
    
    // Permite vazio
    if (value === '') {
      type === 'home' ? setHomeScore('') : setAwayScore('');
      return;
    }
    
    const parsed = parseInt(value, 10);
    // Limita entre 0 e 99 gols e previne NaN
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 99) {
      type === 'home' ? setHomeScore(parsed.toString()) : setAwayScore(parsed.toString());
    }
  };

  // Efeito para sincronizar as mudanças de input para o componente pai em tempo real
  useEffect(() => {
    if (onPredictionChange) {
      onPredictionChange(match.id, homeScore, awayScore);
    }
  }, [homeScore, awayScore, match.id]);

  // Efeito para debounce ao salvar, evitando muitos requests seguidos
  useEffect(() => {
    if (isLocked || !user || !hasEdited) return;
    
    const timer = setTimeout(async () => {
      // Se ambos os valores estão preenchidos, salva no banco
      if (homeScore !== '' && awayScore !== '') {
        setIsSaving(true);
        setSaveStatus('idle');
        try {
          await savePrediction(user.id, match.id, parseInt(homeScore), parseInt(awayScore));
          setSaveStatus('success');
        } catch (err) {
          setSaveStatus('error');
        } finally {
          setIsSaving(false);
        }
      } 
      // Se um dos valores está vazio, remove o palpite incompleto do banco
      else if (prediction && (prediction.homeScore !== undefined || prediction.awayScore !== undefined)) {
        setIsSaving(true);
        setSaveStatus('idle');
        try {
          await deletePrediction(user.id, match.id);
          setSaveStatus('idle'); // Retorna ao estado inicial visual
        } catch (err) {
          setSaveStatus('error');
        } finally {
          setIsSaving(false);
        }
      }
    }, 1000); // Aguarda 1 segundo após parar de digitar

    return () => clearTimeout(timer);
  }, [homeScore, awayScore, match.id, user, isLocked, prediction]);

  return (
    <div className={`prediction-card ${isLocked ? 'locked' : ''}`}>
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
            disabled={isLocked}
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
            disabled={isLocked}
            value={awayScore}
            onChange={(e) => handleScoreChange('away', e.target.value)}
            placeholder="-"
          />
        </div>
      </div>

      <div className="match-footer">
        {isLocked ? (
          <span className="lock-message">{t('locked')}</span>
        ) : (
          <div className="status-indicator">
            {isSaving && <span className="saving text-blue">{t('saving')}</span>}
            {saveStatus === 'success' && !isSaving && <span className="saved text-green">{t('saved')}</span>}
            {saveStatus === 'error' && !isSaving && <span className="error text-red">{t('error')}</span>}
            {saveStatus === 'idle' && !isSaving && <span className="hint">{t('hint')}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
