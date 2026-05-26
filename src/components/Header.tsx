'use client';

import React from 'react';
import {Link} from '@/i18n/routing';
import {useAuth} from '@/contexts/AuthContext';
import {useTranslations} from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const t = useTranslations('Navigation');
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="logo">
        <Link href="/">Bolão da Copa</Link>
      </div>
      <nav>
        <Link href="/predictions">{t('predictions')}</Link>
        <Link href="/ranking">{t('ranking')}</Link>
        <Link href="/simulator">Simulador</Link>
      </nav>
      <div className="user-actions">
        <LanguageSwitcher />
        {user ? (
          <div className="user-profile">
            <span className="nickname">{user.nickname || user.email}</span>
            <button onClick={logout} className="btn secondary">{t('logout')}</button>
          </div>
        ) : (
          <>
            <Link href="/login" className="login-btn">{t('login')}</Link>
            <Link href="/register" className="btn primary">{t('register')}</Link>
          </>
        )}
      </div>
    </header>
  );
}
