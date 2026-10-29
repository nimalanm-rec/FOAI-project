import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Brain,
  Sliders,
  BarChart3,
  TrendingUp,
  FileCheck2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Cpu,
  Database,
  HelpCircle
} from 'lucide-react';
import apiService from '../services/api';

export default function Home() {
  const [healthInfo, setHealthInfo] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  useEffect(() => {
    apiService.getHealth()
      .then((res) => {
        setHealthInfo(res);
        setLoadingHealth(false);
      })
      .catch((err) => {
        console.warn('Backend health check error:', err);
        setLoadingHealth(false);
      });
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'AI-Based Risk Analysis',
      desc: 'Trained Random Forest machine learning pipeline evaluates debt, liquidity, and credit history deterministically.'
    },
    {
      icon: FileCheck2,
      title: 'Explainable Results',
      desc: 'Transparent XAI engine highlights positive strengths and risk considerations tailored to your actual numbers.'
    },
    {
      icon: TrendingUp,
      title: 'Financial Health Insights',
      desc: 'Dynamic calculation of key ratios: Debt-to-Income (DTI), EMI burden, Loan-to-Income, and emergency savings runway.'
    },
    {
      icon: Sliders,
      title: 'What-If Simulation',
      desc: 'Simulate changes in income, existing EMI, savings, or tenure to visualize instant score improvements.'
    },
    {
      icon: BarChart3,
      title: 'Loan Scenario Comparison',
      desc: 'Compare multiple loan options side-by-side to discover the optimal balance between tenure, EMI, and credit risk.'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Enter Financial Information',
      desc: 'Input monthly income, living expenses, existing obligations, credit score, and desired loan parameters.'
    },
    {
      step: '02',
      title: 'AI Analyzes the Profile',
      desc: 'The scikit-learn model evaluates your debt ratios against underwriting rules and statistical risk benchmarks.'
    },
    {
      step: '03',
      title: 'Review the Risk Assessment',
      desc: 'Receive your normalized 0-100 Risk Score, risk tier (Low, Medium, High), and estimated approval probability.'
    },
    {
      step: '04',
      title: 'Explore Ways to Improve',
      desc: 'Study individualized recommendations, test what-if adjustments, and explore loan alternatives.'
    }
  ];

  return (
    <div className="home-page" style={{ padding: '2rem 0 4rem' }}>
      <div className="container">
        {/* Hero Section */}
        <section style={{ textAlign: 'center', padding: '3.5rem 1rem 4rem', position: 'relative' }}>
          {/* System status pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 1rem', background: 'rgba(30, 41, 59, 0.7)', border: '1px solid var(--border-card)', borderRadius: '9999px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: healthInfo ? '#10b981' : '#f59e0b', boxShadow: healthInfo ? '0 0 8px #10b981' : 'none' }}></span>
            <span>
              {loadingHealth
                ? 'Verifying AI Engine...'
                : healthInfo
                  ? `AI Engine Active (${healthInfo.machine_learning?.algorithm || 'Random Forest'})`
                  : 'Backend Offline (Run python app.py)'}
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.75rem)', fontWeight: 800, lineHeight: 1.15, maxWidth: '900px', margin: '0 auto 1.5rem', letterSpacing: '-0.03em' }}>
            AI Credit Risk & <br />
            <span style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Loan Assessment
            </span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '680px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            Understand your financial profile, estimate credit risk, and explore suitable loan scenarios using explainable AI.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/assessment" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
              <Sparkles size={18} /> Start Assessment
            </Link>
            <a href="#how-it-works" className="btn btn-secondary" style={{ padding: '0.85rem 1.5rem', fontSize: '1rem' }}>
              Explore How It Works <ArrowRight size={16} />
            </a>
          </div>

          {/* Quick Stats Banner */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', maxWidth: '880px', margin: '4rem auto 0' }}>
            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>0 - 100</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Calibrated Risk Score</div>
            </div>
            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>94.9%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Demo Model Accuracy</div>
            </div>
            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a855f7' }}>100%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Transparent Explainability</div>
            </div>
            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>Live</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>What-If Simulation</div>
            </div>
          </div>
        </section>

        {/* Section: WHY USE THIS SYSTEM */}
        <section style={{ margin: '4rem 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', marginBottom: '0.75rem' }}>
              Core Capabilities
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>WHY USE THIS SYSTEM</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '580px', margin: '0.5rem auto 0', fontSize: '0.95rem' }}>
              Designed as a modern decision-support tool that balances algorithmic precision with human interpretability.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.75rem' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>{feat.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: HOW IT WORKS */}
        <section id="how-it-works" style={{ margin: '5rem 0', scrollMarginTop: '100px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', marginBottom: '0.75rem' }}>
              Simple 4-Step Process
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>HOW IT WORKS</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '560px', margin: '0.5rem auto 0', fontSize: '0.95rem' }}>
              Experience the complete underwriting lifecycle from raw financial metrics to actionable XAI guidance.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {steps.map((st, i) => (
              <div key={i} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'rgba(255, 255, 255, 0.05)', position: 'absolute', top: '1rem', right: '1.25rem', lineHeight: 1 }}>
                  {st.step}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                  Step {i + 1}
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.6rem' }}>{st.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{st.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="card" style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '3rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Ready to Evaluate Your Credit Profile?
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 1.75rem', fontSize: '0.95rem' }}>
            Fill in your basic financial numbers or load a realistic demo applicant profile to see instant explainable risk scores and recommendations.
          </p>
          <Link to="/assessment" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            Launch Credit Assessment <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </div>
  );
}
