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
      } else {
        const REQUIRE_VERIFICATION_AFTER = new Date('2026-06-10T01:40:00Z');
        const isNewUser = !user.createdAt || user.createdAt >= REQUIRE_VERIFICATION_AFTER;
        
        if (isNewUser && user.emailVerified === false) {
          // Redireciona para verificação, mas apenas se estiver logado e for um novo cadastro
          router.push('/verify-email');
        }
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
  // Data a partir da qual o e-mail de verificação se tornou obrigatório
  const REQUIRE_VERIFICATION_AFTER = new Date('2026-06-10T01:40:00Z');
  const isNewUser = !user?.createdAt || user.createdAt >= REQUIRE_VERIFICATION_AFTER;

  // Impede renderização dupla se for usuário novo e não tiver verificado
  if (user && isNewUser && user.emailVerified === false) {
    return null;
  }

  return <>{children}</>;
}
