'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export default function RulesPage() {
  const t = useTranslations('Rules');

  return (
    <div className="ranking-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <header className="page-header" style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1>📖 {t('title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('subtitle')}</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <section className="rule-section" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.3rem' }}>
            🎯 {t('scoringTitle')}
          </h2>
          <p style={{ marginBottom: '1rem', lineHeight: '1.6', color: 'var(--text-light)' }}>{t('scoringDesc')}</p>
          <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
            <li style={{ padding: '0.8rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)' }}>
              ✅ {t('scoreExact')}
            </li>
            <li style={{ padding: '0.8rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)' }}>
              ⚠️ {t('scoreWinner')}
            </li>
            <li style={{ padding: '0.8rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)' }}>
              ❌ {t('scoreWrong')}
            </li>
          </ul>
        </section>

        <section className="rule-section" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.3rem' }}>
            ⏳ {t('deadlineTitle')}
          </h2>
          <p style={{ lineHeight: '1.6', color: 'var(--text-light)' }}>{t('deadlineDesc')}</p>
        </section>

        <section className="rule-section" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.3rem' }}>
            🏆 {t('mechanicsTitle')}
          </h2>
          <p style={{ lineHeight: '1.6', color: 'var(--text-light)' }}>{t('mechanicsDesc')}</p>
        </section>

        <section className="rule-section" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.3rem' }}>
            🤝 {t('leaguesTitle')}
          </h2>
          <p style={{ lineHeight: '1.6', color: 'var(--text-light)' }}>{t('leaguesDesc')}</p>
        </section>

        <section className="rule-section" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.3rem' }}>
            🎮 {t('simulatorTitle')}
          </h2>
          <p style={{ lineHeight: '1.6', color: 'var(--text-light)' }}>{t('simulatorDesc')}</p>
        </section>

      </div>
    </div>
  );
}
