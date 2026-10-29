import React from 'react';
import {
  BookOpen,
  Cpu,
  Lock,
  Code,
  CheckCircle2,
  AlertTriangle,
  Database,
  Layers,
  Scale
} from 'lucide-react';

export default function About() {
  return (
    <div style={{ padding: '2rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)' }}>
              Academic & Architectural Overview
            </span>
          </div>
          <h1 style={{ fontSize: '2.3rem', fontWeight: 800 }}>About the AI Credit Risk System</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.4rem', lineHeight: 1.6 }}>
            A 5th-semester engineering project for the subject <strong>Foundations of Artificial Intelligence</strong>.
          </p>
        </div>

        {/* SECTION 1: PROJECT OBJECTIVE */}
        <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} color="var(--accent-cyan)" /> 1. Project Objective
          </h2>
          <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
            Automated credit decisioning is one of the most critical applications of artificial intelligence in modern fintech.
            Traditional bank underwriting relies on manual documentation review, while simplistic automated systems often function as
            unforgiving "black boxes."
            <br /><br />
            The objective of this project is to implement a transparent, full-stack decision-support system that combines
            <strong> supervised machine learning (Random Forest Classification)</strong> with <strong>explainable AI (XAI)</strong>
            and interactive counterfactual simulation, empowering both loan officers and consumers to understand the exact mathematical
            factors governing creditworthiness.
          </p>
        </div>

        {/* SECTION 2: HOW AI IS USED */}
        <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={20} color="#10b981" /> 2. How AI and Risk Assessment Work
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.925rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <div>
              <strong style={{ color: 'var(--text-main)' }}>Multi-Dimensional Profiling: </strong>
              The system collects demographic data, income verification, living expenses, existing debt obligations, and credit history.
            </div>
            <div>
              <strong style={{ color: 'var(--text-main)' }}>Dynamic Financial Ratios: </strong>
              Crucial underwriting metrics are computed: Debt-to-Income (DTI), EMI-to-Income, Loan-to-Income (LTI), and liquid reserve runway.
            </div>
            <div>
              <strong style={{ color: 'var(--text-main)' }}>Probabilistic Inference: </strong>
              Standardized features are evaluated through a trained scikit-learn Random Forest model to compute default probability <span style={{ fontFamily: 'monospace' }}>P(Default)</span>.
            </div>
            <div>
              <strong style={{ color: 'var(--text-main)' }}>Deterministic 0–100 Risk Score: </strong>
              Calibrated into a standard scale: Low Risk (0–34), Medium Risk (35–64), and High Risk (65–100).
            </div>
            <div>
              <strong style={{ color: 'var(--text-main)' }}>Explainability & Counterfactuals: </strong>
              Individualized positive factors and risk considerations are generated dynamically, complemented by an interactive What-If sandbox.
            </div>
          </div>
        </div>

        {/* SECTION 3: TECHNOLOGY STACK */}
        <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code size={20} color="#6366f1" /> 3. Technology Stack
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
              <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.35rem' }}>Frontend</div>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <li>React 19</li>
                <li>Vite 8</li>
                <li>React Router v7</li>
                <li>Recharts</li>
                <li>Vanilla CSS Design System</li>
              </ul>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
              <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '0.35rem' }}>Backend</div>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <li>Python 3.14</li>
                <li>Flask & Flask-CORS</li>
                <li>PyMongo & dnspython</li>
                <li>Modular Blueprint Architecture</li>
              </ul>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
              <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: '0.35rem' }}>Machine Learning</div>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <li>scikit-learn</li>
                <li>RandomForestClassifier</li>
                <li>StandardScaler</li>
                <li>numpy & pandas</li>
              </ul>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
              <div style={{ fontWeight: 700, color: '#a855f7', marginBottom: '0.35rem' }}>Database & Storage</div>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <li>MongoDB Atlas Compatible</li>
                <li>PyMongo Integration</li>
                <li>Resilient Local JSON Fallback</li>
              </ul>
            </div>
          </div>
        </div>

        {/* SECTION 4: ETHICAL CONSIDERATIONS & PRIVACY */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
              <Scale size={18} /> Ethical AI & Fairness
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              The feature space strictly omits sensitive protected attributes such as gender, race, religion, or postal code
              to eliminate algorithmic proxy bias. Decisions rely strictly on demonstrated financial repayment capability and debt ratios.
            </p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)' }}>
              <Lock size={18} /> Privacy & Data Protection
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              No Aadhaar, PAN card, or personal contact numbers are requested or stored. The database stores anonymized numerical financial assessments
              strictly for the user's historical reference during their academic session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
