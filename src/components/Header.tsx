'use client';

import {useTranslations} from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import {Link} from '@/i18n/routing';
import {useAuth} from '@/contexts/AuthContext';

export default function Header() {
  const t = useTranslations('Navigation');
  const { user, loading, logout } = useAuth();

  return (
    <header className="header">
      <div className="logo">
        <Link href="/">⚽ Bolão 2026</Link>
      </div>
      <nav>
        <Link href="/">{t('home')}</Link>
        {user && <Link href="/predictions">{t('predictions')}</Link>}
        <Link href="/ranking">{t('ranking')}</Link>
        <Link href="/simulator">{t('simulator')}</Link>
      </nav>
      <div className="user-actions">
        <LanguageSwitcher />
        {!loading && (
          user ? (
            <div className="user-profile">
              <span className="nickname">{user.nickname}</span>
              <button className="login-btn" onClick={logout}>{t('logout')}</button>
            </div>
          ) : (
            <Link href="/login" className="login-btn">Login</Link>
          )
        )}
      </div>
    </header>
  );
}
