'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter, Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const tHome = useTranslations('Home');
  const tAuth = useTranslations('Auth');
  const { user, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/predictions');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <section className="hero">
        <h1>{tHome('title')}</h1>
        <p>{tHome('description')}</p>
        
        {user ? (
          <div className="actions" style={{ marginTop: '2rem' }}>
            <Link href="/predictions" className="btn primary">Ir para Palpites</Link>
            <Link href="/ranking" className="btn secondary">{tHome('ranking')}</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
            <div className="auth-card">
              <h2>{tAuth('loginTitle')}</h2>
              {error && <p className="error-message">{error}</p>}
              <form onSubmit={handleLogin} className="auth-form" style={{ textAlign: 'left' }}>
                <div className="form-group">
                  <label>{tAuth('emailLabel')}</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>{tAuth('passwordLabel')}</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>
                <button type="submit" className="btn primary submit-btn">{tAuth('loginTitle')}</button>
              </form>
              <p className="auth-footer">
                {tAuth('noAccount')} <span onClick={() => router.push('/register')} style={{ cursor: 'pointer', color: 'var(--highlight-green)', textDecoration: 'underline' }}>{tAuth('registerLink')}</span>
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
