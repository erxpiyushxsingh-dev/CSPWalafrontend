'use client';

import { useEffect, useState } from 'react';
import './user.css';
import LandingHeader from './components/LandingHeader';
import Hero from './components/Hero';
import FormsSection from './components/FormsSection';
import PassbookSection from './components/PassbookSection';
import HowItWorks from './components/HowItWorks';
import SchemesSection from './components/SchemesSection';
import LandingFooter from './components/LandingFooter';
import AuthPanel from './components/AuthPanel';
import AdminLoginModal from '@/components/auth/AdminLoginModal';
import type { OpenAuth } from './components/types';

export default function UserLandingPage() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [adminOpen, setAdminOpen] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Load the landing-page fonts once (Devanagari serif/sans + JetBrains Mono).
  useEffect(() => {
    if (document.getElementById('bc-landing-fonts')) return;
    const link = document.createElement('link');
    link.id = 'bc-landing-fonts';
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);

  // Enable normal document scrolling for the landing (the global app shell
  // sets html/body to overflow:hidden). Reverts on unmount so the dashboard
  // keeps its fixed-shell layout.
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('bc-scroll');
    return () => html.classList.remove('bc-scroll', 'bc-locked');
  }, []);

  // Freeze background scroll while a dialog is open.
  useEffect(() => {
    document.documentElement.classList.toggle('bc-locked', panelOpen || sessionExpired);
  }, [panelOpen, sessionExpired]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPanelOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Show the "session expired" popup when redirected here with ?session=expired,
  // then strip the flag from the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('session') === 'expired') {
      setSessionExpired(true);
      window.history.replaceState({}, '', '/user');
    }
  }, []);

  const openAuth: OpenAuth = (tab) => {
    setAuthTab(tab);
    setPanelOpen(true);
  };

  const handleRelogin = () => {
    setSessionExpired(false);
    openAuth('login');
  };

  return (
    <div className="bc-landing">
      <LandingHeader openAuth={openAuth} />
      <main>
        <Hero openAuth={openAuth} />
        <FormsSection />
        <PassbookSection openAuth={openAuth} />
        <HowItWorks />
        <SchemesSection openAuth={openAuth} />
      </main>
      <LandingFooter openAuth={openAuth} onAdminLogin={() => setAdminOpen(true)} />

      <AuthPanel
        open={panelOpen}
        tab={authTab}
        onClose={() => setPanelOpen(false)}
        onTab={setAuthTab}
      />

      <AdminLoginModal isOpen={adminOpen} onClose={() => setAdminOpen(false)} />

      {sessionExpired && (
        <div className="session-expired-overlay" onClick={() => setSessionExpired(false)}>
          <div className="session-expired-box" onClick={(e) => e.stopPropagation()}>
            <div className="se-icon">⏰</div>
            <h3>तुमचे सत्र संपले आहे</h3>
            <p>Your session has expired. Please log in again to continue.</p>
            <button className="login-submit" onClick={handleRelogin}>
              पुन्हा लॉगिन करा / Login again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
