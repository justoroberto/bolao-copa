import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import '../globals.css';
import Header from '@/components/Header';
import { Metadata } from 'next';
import {AuthProvider} from '@/contexts/AuthContext';
import {ThemeProvider} from '@/contexts/ThemeContext';
import RecaptchaWrapper from '@/components/RecaptchaWrapper';

export const metadata: Metadata = {
  title: 'Bolão da Copa',
  description: 'Bolão Oficial da Copa do Mundo 2026',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const { locale } = await params;
  
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} data-theme="dark">
      <body>
        <NextIntlClientProvider messages={messages}>
          <RecaptchaWrapper>
            <ThemeProvider>
              <AuthProvider>
                <Header />
                <main>
                  {children}
                </main>
              </AuthProvider>
            </ThemeProvider>
          </RecaptchaWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
