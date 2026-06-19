'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { League, Ranking } from '@/lib/firebase/models';
import {
  getUserLeagues,
  createLeague,
  joinLeague,
  leaveLeague,
  deleteLeague,
  getLeagueRankings,
  getAllLeagues,
  removeParticipant
} from '@/lib/services/leagues';
import ProtectedRoute from '@/components/ProtectedRoute';
import LiveMatchBanner from '@/components/LiveMatchBanner';
import { getErrorMessage } from '@/lib/utils/errorHandler';

export default function LeaguesPage() {
  const { user } = useAuth();
  const t = useTranslations('Leagues');
  const tCommon = useTranslations('Common');
  const tRanking = useTranslations('Ranking');
  const tErrors = useTranslations('Errors');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [myLeagues, setMyLeagues] = useState<League[]>([]);
  
  // States for Tabs and Viewing
  const [activeTab, setActiveTab] = useState<'myLeagues' | 'create' | 'search' | 'viewLeague'>('create');
  const [viewingLeague, setViewingLeague] = useState<League | null>(null);
  const [viewingRankings, setViewingRankings] = useState<Ranking[]>([]);
  const [newLeagueName, setNewLeagueName] = useState('');
  const [allLeagues, setAllLeagues] = useState<League[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const leagues = await getUserLeagues(user.id);
      setMyLeagues(leagues);
      const userCanCreate = !leagues.some(l => l.adminId === user.id);

      if (leagues.length > 0) {
        setActiveTab('myLeagues');
      } else {
        setActiveTab(userCanCreate ? 'create' : 'search');
      }
      const all = await getAllLeagues();
      setAllLeagues(all);
    } catch (err: any) {
      setError(getErrorMessage(err, tErrors));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newLeagueName.trim()) return;
    setActionLoading(true);
    setError('');
    try {
      await createLeague(newLeagueName, user.id);
      setNewLeagueName('');
      await loadInitialData();
    } catch (err: any) {
      setError(getErrorMessage(err, tErrors));
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinLeague = async (leagueId: string) => {
    if (!user) return;
    setActionLoading(true);
    setError('');
    try {
      await joinLeague(leagueId, user.id);
      setActiveTab('myLeagues');
      await loadInitialData();
    } catch (err: any) {
      setError(getErrorMessage(err, tErrors));
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveLeague = async (leagueId: string) => {
    if (!user) return;
    if (!window.confirm(t('confirmLeave'))) return;
    
    setActionLoading(true);
    setError('');
    try {
      await leaveLeague(leagueId, user.id);
      setActiveTab('myLeagues');
      await loadInitialData();
    } catch (err: any) {
      setError(getErrorMessage(err, tErrors));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLeague = async (leagueId: string) => {
    if (!user) return;
    if (!window.confirm(t('confirmDelete'))) return;
    
    setActionLoading(true);
    setError('');
    try {
      await deleteLeague(leagueId, user.id);
      setActiveTab('myLeagues');
      await loadInitialData();
    } catch (err: any) {
      setError(getErrorMessage(err, tErrors));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveParticipant = async (leagueId: string, participantId: string) => {
    if (!user) return;
    if (!window.confirm(t('confirmRemove'))) return;

    setActionLoading(true);
    setError('');
    try {
      await removeParticipant(leagueId, user.id, participantId);
      
      // Atualizar ranking se estivermos vendo a mesma liga
      if (viewingLeague?.id === leagueId) {
        const newRanks = await getLeagueRankings(viewingLeague.participantIds.filter(id => id !== participantId));
        setViewingRankings(newRanks);
      }
      
      await loadInitialData();
    } catch (err: any) {
      setError(getErrorMessage(err, tErrors));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ranking-container">
        <header className="page-header">
          <h1>🏆 {t('title')}</h1>
          <p>{t('subtitle')}</p>
        </header>
        <div className="loading-state">{tRanking('loading')}</div>
      </div>
    );
  }

  const handleViewLeague = async (league: League) => {
    setActionLoading(true);
    setError('');
    try {
      const leagueRanks = await getLeagueRankings(league.participantIds);
      setViewingLeague(league);
      setViewingRankings(leagueRanks);
      setActiveTab('viewLeague');
    } catch (err: any) {
      setError(getErrorMessage(err, tErrors));
    } finally {
      setActionLoading(false);
    }
  };

  const renderDashboard = (league: League, leagueRankings: Ranking[], isMyLeague: boolean) => {
    const isAdmin = isMyLeague && league.adminId === user?.id;

    return (
      <div className="ranking-container">
        <header className="page-header" style={{ marginBottom: '2rem' }}>
          <h1>🏆 {t('dashboardTitle', { name: league.name })}</h1>
          <p>{league.participantIds.length} {t('participants')}</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--highlight-green)', marginTop: '0.2rem', fontWeight: 500 }}>
            Admin: {leagueRankings.find(r => r.userId === league.adminId)?.nickname || 'Desconhecido'}
          </p>
          
          {isMyLeague && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {isAdmin ? (
                <button onClick={() => handleDeleteLeague(league.id)} disabled={actionLoading} className="btn secondary" style={{ borderColor: 'var(--highlight-red)', color: 'var(--highlight-red)' }}>
                  {t('deleteBtn')}
                </button>
              ) : (
                <button onClick={() => handleLeaveLeague(league.id)} disabled={actionLoading} className="btn secondary" style={{ borderColor: 'var(--highlight-red)', color: 'var(--highlight-red)' }}>
                  {t('leaveBtn')}
                </button>
              )}
            </div>
          )}
          {!isMyLeague && (
             <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
               <button onClick={() => handleJoinLeague(league.id)} disabled={actionLoading || !canJoinLeague} className="btn primary">
                 {t('joinBtn')}
               </button>
               {!canJoinLeague && <span style={{ fontSize: '0.8rem', color: 'var(--highlight-red)' }}>{t('limitReached')}</span>}
             </div>
          )}
        </header>

        <LiveMatchBanner 
          participants={leagueRankings.map(r => ({ userId: r.userId, nickname: r.nickname }))} 
          type="league" 
        />

        <div className="ranking-board">
          {leagueRankings.length === 0 ? (
            <p className="empty-ranking">{tRanking('empty')}</p>
          ) : (
            <ul className="ranking-list">
              {(() => {
                let currentRank = 1;
                let prevStats = '';
                return leagueRankings.map((rank, index) => {
                  const stats = `${rank.totalPoints}-${rank.exactScores || 0}-${rank.correctWinners || 0}`;
                  if (index === 0) prevStats = stats;
                  else if (stats !== prevStats) {
                    currentRank = index + 1;
                    prevStats = stats;
                  }
                  const position = currentRank;
                  
                  let positionClass = '';
                  if (position === 1) positionClass = 'gold';
                  else if (position === 2) positionClass = 'silver';
                  else if (position === 3) positionClass = 'bronze';

                  return (
                    <li key={rank.userId} className={`ranking-item ${positionClass}`}>
                    <div className="rank-position">{position}°</div>
                    <div className="rank-nickname" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {rank.nickname}
                    </div>
                    <div className="rank-stats">
                      <span title={tRanking('exactScores')}>🎯 {rank.exactScores || 0}</span>
                      <span title={tRanking('correctWinners')}>✔️ {rank.correctWinners || 0}</span>
                    </div>
                    <div className="rank-points" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div>{rank.totalPoints} <span>pts</span></div>
                      {isAdmin && rank.userId !== user?.id && (
                        <button 
                          onClick={() => handleRemoveParticipant(league.id, rank.userId)} 
                          title={t('removeUser')}
                          style={{ background: 'transparent', border: 'none', color: 'var(--highlight-red)', cursor: 'pointer', fontSize: '1.2rem' }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </li>
                );
              });})()}
            </ul>
          )}
        </div>
      </div>
    );
  };
  const filteredLeagues = allLeagues.filter(l => l.nameLower.includes(searchQuery.toLowerCase()));
  const canCreateLeague = !myLeagues.some(l => l.adminId === user?.id);
  const canJoinLeague = myLeagues.length < 3;

  return (
    <ProtectedRoute>
      <div className="ranking-container">
        <header className="page-header" style={{ marginBottom: '1rem' }}>
          <h1>🏆 {t('title')}</h1>
          <p>{t('subtitle')}</p>
        </header>

        {error && <p className="error-message" style={{ textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

        <div className="league-tabs" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {myLeagues.length > 0 && (
            <button 
              className={`btn ${activeTab === 'myLeagues' ? 'primary' : 'secondary'}`} 
              onClick={() => setActiveTab('myLeagues')}
            >
              {t('myLeaguesTab')}
            </button>
          )}
          {canCreateLeague && (
            <button 
              className={`btn ${activeTab === 'create' ? 'primary' : 'secondary'}`} 
              onClick={() => setActiveTab('create')}
            >
              {t('createLeague')}
            </button>
          )}
          <button 
            className={`btn ${activeTab === 'search' ? 'primary' : 'secondary'}`} 
            onClick={() => setActiveTab('search')}
          >
            {t('findLeague')}
          </button>
          {activeTab === 'viewLeague' && viewingLeague && (
            <button className="btn primary">
              Ranking: {viewingLeague.name}
            </button>
          )}
        </div>

        {activeTab === 'myLeagues' && (
          <div className="leagues-list" style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myLeagues.map(league => (
              <div key={league.id} className="league-card">
                <div className="league-card-content">
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary-color)' }}>{league.name}</h3>
                  <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    👥 {league.participantIds.length} {t('participants')}
                  </p>
                </div>
                <div className="league-card-actions">
                  <button 
                    className="btn secondary" 
                    onClick={() => handleViewLeague(league)}
                    disabled={actionLoading}
                    style={{ padding: '0.6rem 1rem' }}
                  >
                    {t('viewRanking')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'viewLeague' && viewingLeague && renderDashboard(viewingLeague, viewingRankings, myLeagues.some(l => l.id === viewingLeague.id))}

        {activeTab === 'create' && canCreateLeague && (
          <div className="auth-card" style={{ margin: '0 auto', maxWidth: '400px' }}>
            <h2>{t('createLeague')}</h2>
            <form onSubmit={handleCreateLeague} className="auth-form" style={{ textAlign: 'left' }}>
              <div className="form-group">
                <label>{t('leagueName')}</label>
                <input 
                  type="text" 
                  value={newLeagueName} 
                  onChange={(e) => setNewLeagueName(e.target.value)} 
                  required 
                  maxLength={30}
                />
              </div>
              <button type="submit" className="btn primary submit-btn" disabled={actionLoading}>
                {actionLoading ? t('creating') : t('createBtn')}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="auth-card" style={{ margin: '0 auto', maxWidth: '600px', width: '100%' }}>
            <h2>{t('findLeague')}</h2>
            <div className="form-group">
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')}
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
            <div className="leagues-list" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredLeagues.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{t('noLeaguesFound')}</p>
              ) : (
                filteredLeagues.map(league => (
                  <div key={league.id} className="league-card">
                    <div className="league-card-content">
                      <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary-color)' }}>{league.name}</h3>
                      <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        👥 {league.participantIds.length} {t('participants')}
                      </p>
                    </div>
                    <div className="league-card-actions">
                      <button 
                        className="btn secondary" 
                        onClick={() => handleViewLeague(league)}
                        disabled={actionLoading}
                        style={{ padding: '0.6rem 1rem' }}
                      >
                        {t('viewRanking')}
                      </button>
                      {!myLeagues.some(l => l.id === league.id) && (
                        <button 
                          className="btn primary" 
                          onClick={() => handleJoinLeague(league.id)}
                          disabled={actionLoading || !canJoinLeague}
                          style={{ padding: '0.6rem 1rem', opacity: canJoinLeague ? 1 : 0.5 }}
                          title={!canJoinLeague ? t('limitReached') : ''}
                        >
                          {t('joinBtn')}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
