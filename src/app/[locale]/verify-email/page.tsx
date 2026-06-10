'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase/config';
import { sendEmailVerification } from 'firebase/auth';
import { useRouter } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';

export default function VerifyEmailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations('Auth');
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResend = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await sendEmailVerification(auth.currentUser);
      setMessage(t('verificationSent'));
    } catch (err: any) {
      if (err.code === 'auth/too-many-requests') {
        setError(t('tooManyRequests'));
      } else {
        setError(err.message || 'Error sending email');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReload = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        // Força recarregamento completo mantendo o idioma
        window.location.href = `/${locale}/predictions`;
      } else {
        setError(t('emailNotVerifiedYet'));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Se já verificou, nem deveria estar aqui, mas previne que fique preso
  if (user?.emailVerified) {
    if (typeof window !== 'undefined') router.push('/predictions');
    return null;
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>{t('verifyEmailTitle')}</h2>
        
        <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
          {t('verifyEmailText')}
          <br />
          <strong style={{ color: 'var(--highlight-blue)' }}>{user?.email || auth.currentUser?.email}</strong>
        </p>
        
        {message && <p className="success-message" style={{ color: 'var(--highlight-green)', marginBottom: '1rem' }}>{message}</p>}
        {error && <p className="error-message" style={{ marginBottom: '1rem' }}>{error}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button onClick={handleReload} className="btn primary" disabled={loading}>
            {t('alreadyVerifiedBtn')}
          </button>
          <button onClick={handleResend} className="btn secondary" disabled={loading}>
            {loading ? t('loading') : t('resendEmailBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
