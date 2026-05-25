'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('Home');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!nickname.trim()) {
      setError('Nickname is required');
      return;
    }

    setLoading(true);
    try {
      // 1. Verificar se o nickname já existe
      const nicknameDocRef = doc(db, 'nicknames', nickname.toLowerCase());
      const nicknameDoc = await getDoc(nicknameDocRef);

      if (nicknameDoc.exists()) {
        setError('Este nickname já está em uso. Escolha outro.');
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

      router.push('/predictions');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{t('register')}</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label>Nickname (único e imutável)</label>
            <input 
              type="text" 
              value={nickname} 
              onChange={(e) => setNickname(e.target.value)} 
              required 
            />
          </div>
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
              minLength={6}
            />
          </div>
          <button type="submit" className="btn primary submit-btn" disabled={loading}>
            {loading ? 'Cadastrando...' : t('register')}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <span onClick={() => router.push('/login')}>Login</span>
        </p>
      </div>
    </div>
  );
}
