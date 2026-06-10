'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/i18n/routing';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user && user.emailVerified === false) {
        // Redireciona para verificação, mas apenas se estiver logado
        router.push('/verify-email');
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }
  // Impede renderização dupla se não tiver verificado
  if (user && user.emailVerified === false) {
    return null;
  }

  return <>{children}</>;
}
