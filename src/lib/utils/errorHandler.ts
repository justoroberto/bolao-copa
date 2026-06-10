export function getErrorMessage(err: any, t: any) {
  if (!err) return t('unknown');
  
  const code = err.code || '';
  const message = err.message || '';

  // Auth
  if (code === 'auth/invalid-email') return t('invalidEmail');
  if (code === 'auth/user-not-found') return t('userNotFound');
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') return t('wrongPassword');
  if (code === 'auth/email-already-in-use') return t('emailInUse');
  if (code === 'auth/weak-password') return t('weakPassword');
  if (code === 'auth/too-many-requests') return t('tooManyRequests');

  // Custom (Ligas / Registro)
  if (message.includes('nickname') || code === 'nickname-taken') return t('nicknameTaken');
  if (message.includes('não encontrada') || code === 'league-not-found') return t('leagueNotFound');
  if (message.includes('já participa') || code === 'already-member') return t('alreadyMember');
  if (message.includes('limite máximo') || code === 'max-leagues') return t('maxLeagues');

  // Fallback para mensagens conhecidas do Firebase caso não tenha code
  if (message.includes('email-already-in-use')) return t('emailInUse');
  if (message.includes('wrong-password')) return t('wrongPassword');

  return message || t('unknown');
}
