'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function PwaInstallPrompt() {
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const t = useTranslations('Navigation'); // Or 'Home' depending on available translations

  useEffect(() => {
    // 1. Register the Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
        });
    }

    // 2. Listen for the install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPromptEvent(e);
      
      // Check if user has already dismissed it in the past (optional logic)
      const hasDismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!hasDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPromptEvent) return;

    setShowPrompt(false);
    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setInstallPromptEvent(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="pwa-prompt-overlay">
      <div className="pwa-prompt-card">
        <div className="pwa-prompt-icon">
          <img src="/fav-icon.png" alt="Bolão da Copa" />
        </div>
        <div className="pwa-prompt-content">
          <h3>Instale o App do Bolão!</h3>
          <p>Acesse mais rápido direto da sua tela inicial.</p>
          <div className="pwa-prompt-actions">
            <button className="btn secondary" onClick={handleDismiss}>Agora não</button>
            <button className="btn primary" onClick={handleInstallClick}>Instalar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
