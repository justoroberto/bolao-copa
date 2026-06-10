'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '@/lib/firebase/models';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Marca carregamento ao iniciar o fetch assíncrono para evitar redirects prematuros
          setLoading(true);
          
          // Busca os metadados do usuário no Firestore (com retry para race conditions durante o cadastro)
          let userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          let attempts = 0;
          
          while (!userDoc.exists() && attempts < 5) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            attempts++;
          }

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const creationTimeStr = firebaseUser.metadata.creationTime;
            const userCreatedAt = creationTimeStr 
              ? new Date(creationTimeStr) 
              : (userData.createdAt?.toDate() || new Date());

            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              nickname: userData.nickname || '',
              emailVerified: firebaseUser.emailVerified,
              createdAt: userCreatedAt,
            });
          } else {
            console.error("Documento de usuário não encontrado após o cadastro.");
            setUser(null);
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário: ", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
