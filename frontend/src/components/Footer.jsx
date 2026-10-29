import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Cpu, Database, Code, BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
              <div className="brand-icon" style={{ width: '28px', height: '28px' }}>
                <ShieldCheck size={16} />
              </div>
              <h4 style={{ margin: 0 }}>AI Credit Risk & Loan Assessment</h4>
            </div>
            <p>
              An explainable machine learning decision-support system designed to evaluate applicant creditworthiness,
              calculate key debt ratios, simulate what-if adjustments, and explore loan options responsibly.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
              <span className="badge" style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #334155' }}>
                <Cpu size={12} style={{ marginRight: '4px' }} /> scikit-learn Random Forest
              </span>
              <span className="badge" style={{ background: '#1e293b', color: '#10b981', border: '1px solid #334155' }}>
                <Database size={12} style={{ marginRight: '4px' }} /> MongoDB Atlas
              </span>
              <span className="badge" style={{ background: '#1e293b', color: '#a855f7', border: '1px solid #334155' }}>
                <Code size={12} style={{ marginRight: '4px' }} /> React 19 + Flask
              </span>
            </div>
          </div>

          <div className="footer-col">
            <h5>Navigation</h5>
            <ul className="footer-links">
              <li><Link to="/">Home Overview</Link></li>
              <li><Link to="/assessment">Credit Assessment</Link></li>
              <li><Link to="/simulator">What-If Simulator</Link></li>
              <li><Link to="/compare">Loan Comparison</Link></li>
              <li><Link to="/history">Assessment History</Link></li>
              <li><Link to="/model">AI Model Insights</Link></li>
              <li><Link to="/about">About & Architecture</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Academic Project</h5>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: '1.6' }}>
              <strong>Course:</strong> Foundations of Artificial Intelligence<br />
              <strong>Semester:</strong> 5th Semester B.Tech / B.E.<br />
              <strong>Focus:</strong> Explainable AI (XAI) in Automated Credit Risk Scoring
            </p>
            <div style={{ padding: '0.75rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
              Built strictly as an educational platform. Never constitutes formal financial underwriting or approval advice.
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} AI Credit Risk & Loan Assessment System. For Educational & Demonstration Purposes Only.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Crafted for Foundations of AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
