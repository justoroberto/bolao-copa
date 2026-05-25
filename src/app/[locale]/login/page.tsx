'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const t = useTranslations('Home');

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

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{t('login')}</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn primary submit-btn">{t('login')}</button>
        </form>
        <p className="auth-footer">
          Don't have an account? <span onClick={() => router.push('/register')}>Register</span>
        </p>
      </div>
    </div>
  );
}
