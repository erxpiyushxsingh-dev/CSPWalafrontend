'use client';

import type { OpenAuth } from './types';

interface Props {
  openAuth: OpenAuth;
  onAdminLogin: () => void;
}

export default function LandingFooter({ openAuth, onAdminLogin }: Props) {
  return (
    <footer id="contact">
      <div className="footer-wrap">
        <div style={{ maxWidth: 320 }}>
          <div className="f-logo">BcUnion<span style={{ color: 'var(--gold)' }}>.in</span></div>
          <p>Union Bank of India च्या BC एजंट्स आणि CSP ऑपरेटर्ससाठी फॉर्म व पासबुक प्रिंटिंग प्लॅटफॉर्म.</p>
        </div>
        <div className="f-col">
          <h4>फॉर्म्स</h4>
          <a href="#forms">Account Opening Form</a>
          <a href="#forms">Nomination (DA-1)</a>
          <a href="#forms">FATCA Annexure</a>
          <a href="#forms">Integrity Pledge</a>
          <a href="#forms">Debit Card Request</a>
          <a href="#forms">AEPS Activation</a>
          <a href="#forms">Account Transfer</a>
        </div>
        <div className="f-col">
          <h4>सरकारी योजना</h4>
          <a href="#schemes">APY – अटल पेन्शन</a>
          <a href="#schemes">PMJJBY – जीवन ज्योती</a>
          <a href="#schemes">PMSBY – सुरक्षा विमा</a>
        </div>
        <div className="f-col">
          <h4>सेवा</h4>
          <a href="#passbook">पासबुक प्रिंट</a>
          <a href="#how">कसं चालतं</a>
          <a onClick={() => openAuth('login')} style={{ cursor: 'pointer' }}>लॉगिन</a>
          <a onClick={onAdminLogin} style={{ cursor: 'pointer' }}>Admin Login</a>
        </div>
      </div>
      <div className="footer-bottom">© 2026 BcUnion.in — Shiv Infotech / Alpha Vision Labs</div>
    </footer>
  );
}
