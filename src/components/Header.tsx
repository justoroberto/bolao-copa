'use client';

import React, { useState } from 'react';
import {Link, useRouter} from '@/i18n/routing';
import {useAuth} from '@/contexts/AuthContext';
import {useTranslations} from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';

export default function Header() {
  const t = useTranslations('Navigation');
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Adorno Decorativo - Meio Campo */}
        <div className="header-ornament">
          <div className="midfield-line"></div>
          <div className="midfield-circle">
            <div className="midfield-dot"></div>
          </div>
        </div>

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
                <div className="header-controls">
                  <button 
                    onClick={toggleTheme} 
                    aria-label="Toggle Theme"
                    style={{ 
                      background: 'var(--card-bg)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '8px',
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'var(--text-light)', 
                      padding: '0.5rem 1rem',
                      height: '42px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {theme === 'light' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                      </svg>
                    )}
                  </button>
                  <LanguageSwitcher />
                </div>
                {user ? (
                  <div className="user-profile">
                    <span className="nickname">{user.nickname || user.email}</span>
                    <button onClick={async () => { await logout(); closeMenu(); router.push('/'); }} className="btn secondary">{t('logout')}</button>
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
      </div>
    </header>
  );
}
