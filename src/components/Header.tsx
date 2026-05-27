'use client';

import React, { useState } from 'react';
import {Link} from '@/i18n/routing';
import {useAuth} from '@/contexts/AuthContext';
import {useTranslations} from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import Image from 'next/image';

export default function Header() {
  const t = useTranslations('Navigation');
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <Link href="/" className="logo-link" onClick={closeMenu}>
            <Image
              src="/bc_logo.png"
              alt="Bolão da Copa"
              width={180}
              height={90}
              className="logo-img"
              style={{ width: 'auto', height: '90px' }}
              priority
            />
          </Link>
        </div>

        {/* Hamburger Icon */}
        <button className={`hamburger ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu} aria-label="Toggle menu">
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* Navigation Wrapper */}
        <div className={`nav-wrapper ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-overlay" onClick={closeMenu}></div>
          <div className="nav-panel">
            <nav>
              <Link href="/predictions" onClick={closeMenu}>{t('predictions')}</Link>
              <Link href="/ranking" onClick={closeMenu}>{t('ranking')}</Link>
              <Link href="/simulator" onClick={closeMenu}>Simulador</Link>
            </nav>
            <div className="user-actions">
              <LanguageSwitcher />
              {user ? (
                <div className="user-profile">
                  <span className="nickname">{user.nickname || user.email}</span>
                  <button onClick={() => { logout(); closeMenu(); }} className="btn secondary">{t('logout')}</button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="login-btn" onClick={closeMenu}>{t('login')}</Link>
                  <Link href="/register" className="btn primary" onClick={closeMenu}>{t('register')}</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
