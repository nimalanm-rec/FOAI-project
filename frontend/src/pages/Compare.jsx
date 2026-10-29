import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  BarChart2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  RefreshCw,
  Info,
  IndianRupee,
  Calendar,
  Percent
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import apiService from '../services/api';
import { DEMO_APPLICANT } from './Assessment';
import { formatINR, formatPercent, formatRatio, getRiskLevelMeta } from '../utils/formatters';

const DEFAULT_SCENARIOS = [
  { id: '1', name: 'Scenario A (Short Tenure)', loan_amount: 500000, loan_tenure: 3, loan_purpose: 'Home' },
  { id: '2', name: 'Scenario B (Balanced)', loan_amount: 500000, loan_tenure: 5, loan_purpose: 'Home' },
  { id: '3', name: 'Scenario C (Higher Capital)', loan_amount: 700000, loan_tenure: 5, loan_purpose: 'Home' }
];

export default function Compare() {
  const location = useLocation();

  // Baseline applicant profile
  const [applicant, setApplicant] = useState(() => {
    if (location.state?.baselineAssessment?.applicant) {
      const bApp = location.state.baselineAssessment.applicant;
      const bFin = location.state.baselineAssessment.financial_metrics;
      return {
        ...bApp,
        monthly_income: bFin.monthly_income,
        monthly_expenses: bFin.monthly_expenses,
        existing_emi: bFin.existing_emi,
        existing_debt: bFin.existing_debt,
        savings: bFin.savings,
        bank_balance: bFin.bank_balance,
        requested_loan: bFin.requested_loan,
        loan_tenure: bFin.loan_tenure_years,
        loan_purpose: bApp.loan_purpose || 'Home'
      };
    }
    const cached = sessionStorage.getItem('last_assessment');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return {
          ...parsed.applicant,
          ...parsed.financial_metrics,
          loan_tenure: parsed.financial_metrics.loan_tenure_years
        };
      } catch (e) {
        console.warn('Failed parsing cached applicant', e);
      }
    }
    return { ...DEMO_APPLICANT };
  });

  const [scenarios, setScenarios] = useState(DEFAULT_SCENARIOS);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Run scenario comparison
  const runComparison = async (currentScenarios) => {
    if (currentScenarios.length < 2) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiService.compareScenarios(applicant, currentScenarios);
      if (res.success && res.data) {
        setComparisonData(res.data);
      }
    } catch (err) {
      console.error('Comparison error:', err);
      setError(err.message || 'Failed to compare loan scenarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runComparison(scenarios);
  }, []);

  // Update a scenario property
  const handleScenarioChange = (id, field, value) => {
    const updated = scenarios.map((sc) =>
      sc.id === id ? { ...sc, [field]: field.includes('loan_') ? Number(value) : value } : sc
    );
    setScenarios(updated);
  };

  // Add new scenario
  const handleAddScenario = () => {
    if (scenarios.length >= 5) return;
    const newIdx = scenarios.length + 1;
    const newScenario = {
      id: Date.now().toString(),
      name: `Scenario ${chr(64 + newIdx)}`,
      loan_amount: 800000,
      loan_tenure: 5,
      loan_purpose: 'Home'
    };
    const updated = [...scenarios, newScenario];
    setScenarios(updated);
    runComparison(updated);
  };

  function chr(code) {
    return String.fromCharCode(code);
  }

  // Remove a scenario
  const handleRemoveScenario = (id) => {
    if (scenarios.length <= 2) {
      alert('At least 2 scenarios are required for comparison.');
      return;
    }
    const updated = scenarios.filter((sc) => sc.id !== id);
    setScenarios(updated);
    runComparison(updated);
  };

  // Chart data for EMI and Risk Score
  const chartData = (comparisonData?.scenarios || []).map((sc) => ({
    name: sc.name,
    estimated_emi: sc.estimated_emi,
    risk_score: sc.risk_score,
    loan_amount: sc.loan_amount
  }));

  return (
    <div style={{ padding: '2rem 0 5rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)' }}>
                Multi-Option Assessment
              </span>
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>Loan Scenario Comparison</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Compare multiple loan amounts, repayment tenures, and estimated EMIs to determine the lowest risk structure.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddScenario}
              disabled={scenarios.length >= 5}
            >
              <Plus size={16} /> Add Scenario
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => runComparison(scenarios)}
              disabled={loading}
            >
              <RefreshCw size={16} /> Recalculate
            </button>
          </div>
        </div>

        {error && (
          <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--risk-high)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={20} color="var(--risk-high)" />
            <span style={{ color: 'var(--risk-high)', fontSize: '0.9rem' }}>{error}</span>
          </div>
        )}

        {/* SCENARIO EDITORS ROW */}
        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Configure Comparison Scenarios
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {scenarios.map((sc, i) => (
              <div
                key={sc.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={sc.name}
                    onChange={(e) => handleScenarioChange(sc.id, 'name', e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-cyan)',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      outline: 'none',
                      width: '80%'
                    }}
                  />
                  {scenarios.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveScenario(sc.id)}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                      title="Remove this scenario"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Loan Amount (₹)</label>
                  <input
                    type="number"
                    value={sc.loan_amount}
                    onChange={(e) => handleScenarioChange(sc.id, 'loan_amount', e.target.value)}
                    step="50000"
                    min="50000"
                    className="form-input"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Tenure (Years)</label>
                  <input
                    type="number"
                    value={sc.loan_tenure}
                    onChange={(e) => handleScenarioChange(sc.id, 'loan_tenure', e.target.value)}
                    step="1"
                    min="1"
                    max="30"
                    className="form-input"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BEST SCENARIO RECOMMENDATION CARD */}
        {comparisonData?.summary && (
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
              <Award size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AI Recommendation: Optimal Risk & EMI Balance
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginTop: '0.2rem', lineHeight: 1.5 }}>
                {comparisonData.summary}
              </p>
            </div>
          </div>
        )}

        {/* COMPARISON MATRIX TABLE */}
        <div className="card" style={{ marginBottom: '2.5rem', padding: '1.5rem' }}>
          <div className="card-header">
            <div className="card-title">
              <BarChart2 size={18} color="var(--accent-cyan)" /> Comparative Scenario Matrix
            </div>
            <span className="card-subtitle">Side-by-side risk and repayment terms</span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>Loan Amount</th>
                  <th>Tenure</th>
                  <th>Estimated EMI</th>
                  <th>Total Interest</th>
                  <th>LTI Ratio</th>
                  <th>Projected DTI</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>Eligibility</th>
                </tr>
              </thead>
              <tbody>
                {(comparisonData?.scenarios || []).map((sc, idx) => {
                  const meta = getRiskLevelMeta(sc.risk_level);
                  return (
                    <tr
                      key={sc.id || idx}
                      style={sc.is_recommended ? { background: 'rgba(16, 185, 129, 0.04)' } : {}}
                    >
                      <td style={{ fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {sc.is_recommended && <Award size={14} color="#10b981" title="Recommended Scenario" />}
                          <span style={{ color: sc.is_recommended ? '#10b981' : 'var(--text-main)' }}>
                            {sc.name}
                          </span>
                        </div>
                      </td>
                      <td>{formatINR(sc.loan_amount)}</td>
                      <td>{sc.loan_tenure} Years</td>
                      <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {formatINR(sc.estimated_emi)}
                      </td>
                      <td>{formatINR(sc.total_interest)}</td>
                      <td>{formatRatio(sc.loan_to_income_ratio)}</td>
                      <td>{formatPercent(sc.projected_dti_ratio)}</td>
                      <td style={{ fontWeight: 800, color: meta.color }}>
                        {sc.risk_score} / 100
                      </td>
                      <td>
                        <span className={`badge ${meta.badgeClass}`} style={{ fontSize: '0.75rem' }}>
                          {sc.risk_level}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.825rem' }}>
                        {sc.eligibility}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* COMPARATIVE VISUAL CHART */}
        {chartData.length > 0 && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="card-header">
              <div className="card-title">
                <BarChart2 size={18} color="#a855f7" /> Monthly EMI vs Risk Score Comparison
              </div>
              <span className="card-subtitle">Visual trade-off analysis</span>
            </div>

            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                    formatter={(val, name) => [
                      name === 'Estimated EMI' ? formatINR(val) : `${val}/100`,
                      name
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                  <Bar yAxisId="left" dataKey="estimated_emi" name="Estimated EMI" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="risk_score" name="Risk Score (0-100)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
