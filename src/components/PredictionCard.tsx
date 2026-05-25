'use client';

import React, { useState, useEffect } from 'react';
import { Match, Prediction } from '@/lib/firebase/models';
import { canEditPrediction } from '@/lib/services/score';
import { savePrediction } from '@/lib/services/predictions';
import { useAuth } from '@/contexts/AuthContext';

interface PredictionCardProps {
  match: Match;
  prediction?: Prediction;
}

export default function PredictionCard({ match, prediction }: PredictionCardProps) {
  const { user } = useAuth();
  
  // States para os scores
  const [homeScore, setHomeScore] = useState<string>(prediction?.homeScore?.toString() || '');
  const [awayScore, setAwayScore] = useState<string>(prediction?.awayScore?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle'|'success'|'error'>('idle');

  // Verifica bloqueio de tempo
  const isLocked = !canEditPrediction(match.startTime) || match.status !== 'scheduled';
  
  // Converte data para exibição
  const formattedDate = match.startTime.toLocaleString('pt-BR', { 
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  // Salva apenas se o valor for um número válido
  const handleScoreChange = async (type: 'home' | 'away', value: string) => {
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

  // Efeito para debounce ao salvar, evitando muitos requests seguidos
  useEffect(() => {
    if (homeScore === '' || awayScore === '' || isLocked || !user) return;
    
    // Cancela o Timeout anterior
    const timer = setTimeout(async () => {
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
    }, 1000); // Aguarda 1 segundo após parar de digitar

    return () => clearTimeout(timer);
  }, [homeScore, awayScore, match.id, user, isLocked]);

  return (
    <div className={`prediction-card ${isLocked ? 'locked' : ''}`}>
      <div className="match-header">
        <span className="match-stage">{match.stage.toUpperCase()}</span>
        <span className="match-date">{formattedDate}</span>
      </div>
      
      <div className="match-teams">
        <div className="team home-team">
          <span className="team-name">{match.homeTeam}</span>
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
          <span className="team-name">{match.awayTeam}</span>
        </div>
      </div>

      <div className="match-footer">
        {isLocked ? (
          <span className="lock-message">🔒 Palpite Fechado</span>
        ) : (
          <div className="status-indicator">
            {isSaving && <span className="saving text-blue">Salvando...</span>}
            {saveStatus === 'success' && !isSaving && <span className="saved text-green">✓ Salvo automaticamente</span>}
            {saveStatus === 'error' && !isSaving && <span className="error text-red">Erro ao salvar</span>}
            {saveStatus === 'idle' && !isSaving && <span className="hint">Edição aberta</span>}
          </div>
        )}
      </div>
    </div>
  );
}
