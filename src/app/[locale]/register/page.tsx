'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('Auth');
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!nickname.trim()) {
      setError(t('nicknameRequired'));
      return;
    }

    setLoading(true);
    try {
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      if (siteKey) {
        if (!executeRecaptcha) {
          setError(t('recaptchaNotReady'));
          setLoading(false);
          return;
        }

        // 0. Executar reCAPTCHA
        const token = await executeRecaptcha('register');
        
        const captchaRes = await fetch('/api/verify-captcha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        
        const captchaData = await captchaRes.json();
        
        if (!captchaData.success) {
          setError(t('botDetected'));
          setLoading(false);
          return;
        }
      }

      // 1. Verificar se o nickname já existe
      const nicknameDocRef = doc(db, 'nicknames', nickname.toLowerCase());
      const nicknameDoc = await getDoc(nicknameDocRef);

      if (nicknameDoc.exists()) {
        setError(t('nicknameInUse'));
        setLoading(false);
        return;
      }

      // 2. Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 3. Salvar referência do nickname
      await setDoc(nicknameDocRef, { uid: user.uid });

      // 4. Salvar dados do usuário
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        nickname: nickname,
        createdAt: new Date()
      });

      // 5. Enviar e-mail de verificação
      await sendEmailVerification(user);

      router.push('/verify-email');
    } catch (err: any) {
      setError(err.message || t('registerError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{t('registerTitle')}</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label>{t('nicknameLabel')}</label>
            <input 
              type="text" 
              value={nickname} 
              onChange={(e) => setNickname(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>{t('emailLabel')}</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>{t('passwordLabel')}</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength={6}
            />
          </div>
          <button type="submit" className="btn primary submit-btn" disabled={loading}>
            {loading ? t('registering') : t('registerTitle')}
          </button>
        </form>
        <p className="auth-footer">
          {t('haveAccount')} <span onClick={() => router.push('/login')}>{t('loginLink')}</span>
        </p>
      </div>
    </div>
  );
}
