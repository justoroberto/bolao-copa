'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

export default function RecaptchaWrapper({ children }: { children: React.ReactNode }) {
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!recaptchaKey) {
    // Se a chave não existir (ainda não configurada no env), renderiza sem proteção
    // para não quebrar a aplicação enquanto o usuário não a coloca.
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider 
      reCaptchaKey={recaptchaKey}
      scriptProps={{
        async: false,
        defer: false,
        appendTo: "head",
        nonce: undefined,
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
