import React, { useEffect, useState } from 'react';
import {
  Brain,
  Cpu,
  Layers,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Info,
  Database,
  Sliders,
  Scale
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import apiService from '../services/api';
import StatCard from '../components/StatCard';
import { formatPercent } from '../utils/formatters';

export default function ModelInfo() {
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    apiService.getModelInfo()
      .then((res) => {
        if (res.success && res.data) {
          setModelInfo(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load model info:', err);
        setError(err.message || 'Failed to load model evaluation metrics.');
        setLoading(false);
      });
  }, []);

  // Format feature importances for Recharts
  const featureData = (modelInfo?.feature_importances || []).slice(0, 10).map((f) => ({
    name: f.feature.replace(/_/g, ' ').toUpperCase(),
    importance: Math.round(f.importance * 1000) / 10 // Percentage representation
  }));

  return (
    <div style={{ padding: '2rem 0 5rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)' }}>
              Machine Learning Pipeline
            </span>
          </div>
          <h1 style={{ fontSize: '2.3rem', fontWeight: 800 }}>Explainable AI & Machine Learning Architecture</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '780px', marginTop: '0.4rem', lineHeight: 1.6 }}>
            Comprehensive documentation of the supervised learning algorithms, mathematical risk scoring formulas,
            empirical evaluation metrics, and feature importance distributions.
          </p>
        </div>

        {/* LIVE MODEL EVALUATION METRICS */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={20} color="var(--accent-cyan)" /> Empirical Test Set Performance
          </h3>

          {loading ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <RefreshCw size={28} className="spin-icon" style={{ color: 'var(--accent-cyan)', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-muted)' }}>Retrieving test set evaluation metrics...</p>
            </div>
          ) : error ? (
            <div className="card" style={{ padding: '2rem', borderColor: 'var(--risk-high)' }}>
              <p style={{ color: 'var(--risk-high)' }}>{error}</p>
            </div>
          ) : (
            <div className="stats-grid">
              <StatCard
                label="Model Accuracy"
                value={`${(modelInfo.accuracy * 100).toFixed(1)}%`}
                subtext={`Test samples: ${modelInfo.test_samples}`}
                icon={CheckCircle2}
                highlightColor="#10b981"
              />
              <StatCard
                label="ROC-AUC Score"
                value={(modelInfo.roc_auc).toFixed(3)}
                subtext="Area under ROC curve"
                icon={Scale}
                highlightColor="#38bdf8"
              />
              <StatCard
                label="Recall (Sensitivity)"
                value={`${(modelInfo.recall * 100).toFixed(1)}%`}
                subtext="Default risk detection rate"
                icon={AlertTriangle}
                highlightColor="#a855f7"
              />
              <StatCard
                label="F1-Score"
                value={(modelInfo.f1_score).toFixed(3)}
                subtext="Harmonic mean of prec & rec"
                icon={Sliders}
                highlightColor="#f59e0b"
              />
            </div>
          )}
        </div>

        {/* FEATURE IMPORTANCE BAR CHART */}
        {featureData.length > 0 && (
          <div className="card" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
            <div className="card-header" style={{ marginBottom: '1.5rem' }}>
              <div className="card-title">
                <BarChart3 size={20} color="var(--accent-cyan)" /> Top Predictive Features (Gini Importance)
              </div>
              <span className="card-subtitle">Relative weight in Random Forest decision trees (%)</span>
            </div>

            <div style={{ width: '100%', height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={featureData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 120, bottom: 10 }}
                >
                  <XAxis type="number" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                  <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                    formatter={(val) => [`${val}%`, 'Relative Importance']}
                  />
                  <Bar dataKey="importance" fill="#38bdf8" radius={[0, 6, 6, 0]}>
                    {featureData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? '#10b981' : index < 3 ? '#38bdf8' : '#6366f1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '1rem', textAlign: 'center' }}>
              Credit Score (37%), Previous Defaults (23%), and Late Payments (20%) serve as primary credit gatekeepers, followed by Debt-to-Income (DTI).
            </div>
          </div>
        )}

        {/* DETAILED ARCHITECTURE BREAKDOWN */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--accent-cyan)' }}>
              1. What Model is Used?
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              The system deploys an explainable <strong>Random Forest Classifier</strong> comprising 100 decision trees with a controlled maximum depth of 8.
              Tree ensembles model complex, non-linear financial interactions (e.g. high loan amount paired with short tenure vs. long tenure)
              without suffering from multicollinearity between debt ratios.
            </p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', color: '#10b981' }}>
              2. How the Risk Score is Generated
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              The model calculates the probability of credit delinquency <span style={{ fontFamily: 'monospace', color: '#f8fafc' }}>P(Default) ∈ [0, 1]</span>.
              This probability is calibrated into a standardized 0–100 integer score:
              <br />
              <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', margin: '4px 0' }}>
                Risk Score = round(P(Default) × 100)
              </code>
              <br />
              Lower values denote prime creditworthiness; higher values reflect elevated risk.
            </p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', color: '#f59e0b' }}>
              3. Why Explainability (XAI) Matters
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Modern financial regulations (e.g. Fair Lending, GDPR Article 22, RBI guidelines) require automated decision engines to provide adverse action explanations.
              Black-box deep learning models are opaque; our architecture extracts clear positive strengths and warning factors for every individual applicant.
            </p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', color: '#a855f7' }}>
              4. Features & Engineering
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              18 structured features are selected spanning borrower demographics, verified income, bureau credit history, liquid savings, and engineered financial ratios
              including Debt-to-Income (DTI), EMI-to-Income, Loan-to-Income (LTI), and Savings-to-Loan coverage.
            </p>
          </div>
        </div>

        {/* CONFUSION MATRIX CARD */}
        {modelInfo?.confusion_matrix && (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Evaluation Confusion Matrix (1,000 Test Records)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Cross-tabulation of actual versus model-predicted credit outcomes.
            </p>
            <div style={{ display: 'inline-grid', gridTemplateColumns: '140px 140px', gap: '0.75rem', textAlign: 'center' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{modelInfo.confusion_matrix[0][0]}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>True Negatives (Low Risk)</div>
              </div>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444' }}>{modelInfo.confusion_matrix[0][1]}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>False Positives</div>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>{modelInfo.confusion_matrix[1][0]}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>False Negatives</div>
              </div>
              <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>{modelInfo.confusion_matrix[1][1]}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>True Positives (High Risk)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
