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

export default function LeaguesPage() {
  const { user } = useAuth();
  const t = useTranslations('Leagues');
  const tCommon = useTranslations('Common');
  const tRanking = useTranslations('Ranking');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [myLeague, setMyLeague] = useState<League | null>(null);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  
  // States for Tabs and Viewing
  const [activeTab, setActiveTab] = useState<'myLeague' | 'create' | 'search' | 'viewLeague'>('create');
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
      if (leagues.length > 0) {
        const league = leagues[0];
        setMyLeague(league);
        const leagueRanks = await getLeagueRankings(league.participantIds);
        setRankings(leagueRanks);
        setActiveTab('myLeague');
      } else {
        setMyLeague(null);
        setActiveTab('create');
      }
      const all = await getAllLeagues();
      setAllLeagues(all);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
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
      setError(err.message);
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
      setActiveTab('myLeague');
      await loadInitialData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveLeague = async () => {
    if (!user || !myLeague) return;
    if (!window.confirm(t('confirmLeave'))) return;
    
    setActionLoading(true);
    setError('');
    try {
      await leaveLeague(myLeague.id, user.id);
      setActiveTab('search');
      await loadInitialData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLeague = async () => {
    if (!user || !myLeague) return;
    if (!window.confirm(t('confirmDelete'))) return;
    
    setActionLoading(true);
    setError('');
    try {
      await deleteLeague(myLeague.id, user.id);
      setActiveTab('create');
      await loadInitialData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (!user || !myLeague) return;
    if (!window.confirm(t('confirmRemove'))) return;

    setActionLoading(true);
    setError('');
    try {
      await removeParticipant(myLeague.id, user.id, participantId);
      await loadInitialData();
    } catch (err: any) {
      setError(err.message);
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
      setError(err.message);
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
          
          {isMyLeague && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {isAdmin ? (
                <button onClick={handleDeleteLeague} disabled={actionLoading} className="btn secondary" style={{ borderColor: 'var(--highlight-red)', color: 'var(--highlight-red)' }}>
                  {t('deleteBtn')}
                </button>
              ) : (
                <button onClick={handleLeaveLeague} disabled={actionLoading} className="btn secondary" style={{ borderColor: 'var(--highlight-red)', color: 'var(--highlight-red)' }}>
                  {t('leaveBtn')}
                </button>
              )}
            </div>
          )}
          {!isMyLeague && !myLeague && (
             <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
               <button onClick={() => handleJoinLeague(league.id)} disabled={actionLoading} className="btn primary">
                 {t('joinBtn')}
               </button>
             </div>
          )}
        </header>

        <div className="ranking-board">
          {leagueRankings.length === 0 ? (
            <p className="empty-ranking">{tRanking('empty')}</p>
          ) : (
            <ul className="ranking-list">
              {leagueRankings.map((rank, index) => {
                const position = index + 1;
                let positionClass = '';
                if (position === 1) positionClass = 'gold';
                else if (position === 2) positionClass = 'silver';
                else if (position === 3) positionClass = 'bronze';

                return (
                  <li key={rank.userId} className={`ranking-item ${positionClass}`}>
                    <div className="rank-position">{position}°</div>
                    <div className="rank-nickname" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {rank.nickname}
                      {league.adminId === rank.userId && (
                        <span style={{ fontSize: '0.7rem', background: 'var(--highlight-green)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Admin</span>
                      )}
                    </div>
                    <div className="rank-stats">
                      <span title={tRanking('exactScores')}>🎯 {rank.exactScores || 0}</span>
                      <span title={tRanking('correctWinners')}>✔️ {rank.correctWinners || 0}</span>
                    </div>
                    <div className="rank-points" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div>{rank.totalPoints} <span>pts</span></div>
                      {isAdmin && rank.userId !== user?.id && (
                        <button 
                          onClick={() => handleRemoveParticipant(rank.userId)} 
                          title={t('removeUser')}
                          style={{ background: 'transparent', border: 'none', color: 'var(--highlight-red)', cursor: 'pointer', fontSize: '1.2rem' }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  };
  const filteredLeagues = allLeagues.filter(l => l.nameLower.includes(searchQuery.toLowerCase()));

  return (
    <ProtectedRoute>
      <div className="ranking-container">
        <header className="page-header" style={{ marginBottom: '1rem' }}>
          <h1>🏆 {t('title')}</h1>
          <p>{t('subtitle')}</p>
        </header>

        {error && <p className="error-message" style={{ textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

        <div className="league-tabs" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
          {myLeague && (
            <button 
              className={`btn ${activeTab === 'myLeague' ? 'primary' : 'secondary'}`} 
              onClick={() => setActiveTab('myLeague')}
            >
              Minha Liga
            </button>
          )}
          {!myLeague && (
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

        {activeTab === 'myLeague' && myLeague && renderDashboard(myLeague, rankings, true)}
        
        {activeTab === 'viewLeague' && viewingLeague && renderDashboard(viewingLeague, viewingRankings, myLeague?.id === viewingLeague.id)}

        {activeTab === 'create' && !myLeague && (
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
                  <div key={league.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--card-bg)' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{league.name}</h3>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{league.participantIds.length} {t('participants')}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn secondary" 
                        onClick={() => handleViewLeague(league)}
                        disabled={actionLoading}
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        Ver Ranking
                      </button>
                      {!myLeague && (
                        <button 
                          className="btn primary" 
                          onClick={() => handleJoinLeague(league.id)}
                          disabled={actionLoading}
                          style={{ padding: '0.5rem 1rem' }}
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
