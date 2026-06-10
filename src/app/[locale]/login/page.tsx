'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { getErrorMessage } from '@/lib/utils/errorHandler';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const tAuth = useTranslations('Auth');
  const tHome = useTranslations('Home');
  const tErrors = useTranslations('Errors');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/predictions');
    } catch (err: any) {
      setError(getErrorMessage(err, tErrors));
    }
  };

  return (
    <div className="home-container">
      <section className="hero">
        <h1>{tHome('title')}</h1>
        <p>{tHome('description')}</p>
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
      </section>
    </div>
  );
}
