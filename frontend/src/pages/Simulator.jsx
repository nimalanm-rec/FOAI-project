import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Sliders,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  Percent,
  RefreshCw,
  CreditCard,
  Building
} from 'lucide-react';
import apiService from '../services/api';
import { DEMO_APPLICANT, SAMPLE_LOW_RISK, SAMPLE_MEDIUM_RISK, SAMPLE_HIGH_RISK } from './Assessment';
import { formatINR, formatPercent, getRiskLevelMeta } from '../utils/formatters';

export default function Simulator() {
  const location = useLocation();

  // Baseline data loaded from navigation state, session storage, or demo applicant
  const [baselineData, setBaselineData] = useState(() => {
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
        const pApp = parsed.applicant;
        const pFin = parsed.financial_metrics;
        return {
          ...pApp,
          monthly_income: pFin.monthly_income,
          monthly_expenses: pFin.monthly_expenses,
          existing_emi: pFin.existing_emi,
          existing_debt: pFin.existing_debt,
          savings: pFin.savings,
          bank_balance: pFin.bank_balance,
          requested_loan: pFin.requested_loan,
          loan_tenure: pFin.loan_tenure_years,
          loan_purpose: pApp.loan_purpose || 'Home'
        };
      } catch (e) {
        console.warn('Failed parsing cached assessment for simulator', e);
      }
    }

    return { ...DEMO_APPLICANT };
  });

  // Current modified scenario values
  const [scenarioData, setScenarioData] = useState({ ...baselineData });
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState('');

  // Run simulation against backend
  const executeSimulation = async (base, scen) => {
    setSimulating(true);
    setError('');
    try {
      const res = await apiService.simulateScenario(base, scen);
      if (res.success && res.data) {
        setSimulationResult(res.data);
      }
    } catch (err) {
      console.error('Simulation error:', err);
      setError(err.message || 'Failed to simulate scenario adjustments.');
    } finally {
      setSimulating(false);
    }
  };

  // Live recalculation whenever scenarioData or baselineData changes
  useEffect(() => {
    const timer = setTimeout(() => {
      executeSimulation(baselineData, scenarioData);
    }, 200);
    return () => clearTimeout(timer);
  }, [scenarioData, baselineData]);

  // Handle variable slider/input changes
  const handleScenarioChange = (field, value) => {
    const nextScenario = {
      ...scenarioData,
      [field]: Number(value)
    };
    setScenarioData(nextScenario);
  };

  // Trigger manual recalculation on button
  const handleRecalculate = () => {
    executeSimulation(baselineData, scenarioData);
  };

  // Reset to original baseline
  const handleResetToBaseline = () => {
    setScenarioData({ ...baselineData });
  };

  // Load standard Demo Profile as baseline
  const handleLoadDemoBaseline = () => {
    setBaselineData({ ...DEMO_APPLICANT });
    setScenarioData({ ...DEMO_APPLICANT });
  };

  const handleLoadPresetBaseline = (preset) => {
    setBaselineData({ ...preset });
    setScenarioData({ ...preset });
  };

  const comp = simulationResult?.comparison;
  const baseResult = simulationResult?.baseline;
  const scenResult = simulationResult?.scenario;

  const baseMeta = getRiskLevelMeta(comp?.risk_level_baseline);
  const scenMeta = getRiskLevelMeta(comp?.risk_level_scenario);

  return (
    <div style={{ padding: '2rem 0 5rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)' }}>
                Interactive Sandbox
              </span>
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>AI What-If Simulator</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Modify financial variables in real-time to analyze how credit scoring, DTI, and estimated EMI respond under the same ML model.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginRight: '0.25rem' }}>Presets:</span>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleLoadPresetBaseline(SAMPLE_LOW_RISK)}
              title="Load Prime Low Risk Profile (Green)"
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem', borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.1)' }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', marginRight: '6px' }}></span>
              Low Risk
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleLoadPresetBaseline(SAMPLE_MEDIUM_RISK)}
              title="Load Moderate Medium Risk Profile (Amber)"
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem', borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.1)' }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block', marginRight: '6px' }}></span>
              Medium Risk
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleLoadPresetBaseline(SAMPLE_HIGH_RISK)}
              title="Load Strained High Risk Profile (Red)"
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)' }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', marginRight: '6px' }}></span>
              High Risk
            </button>
            <button type="button" className="btn btn-outline" onClick={handleResetToBaseline} style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>

        {error && (
          <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--risk-high)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={20} color="var(--risk-high)" />
            <span style={{ color: 'var(--risk-high)', fontSize: '0.9rem' }}>{error}</span>
          </div>
        )}

        {/* MAIN SPLIT VIEW: Interactive Controls & Side-by-Side Comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* LEFT: VARIABLE CONTROLS */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="card-header" style={{ marginBottom: '1.5rem' }}>
              <div className="card-title">
                <Sliders size={20} color="var(--accent-cyan)" /> Adjust Financial Variables
              </div>
              <span className="card-subtitle">Test scenario changes</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Variable 1: Monthly Income */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Monthly Income (₹)</label>
                  <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {formatINR(scenarioData.monthly_income)}
                  </span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="300000"
                  step="5000"
                  value={scenarioData.monthly_income}
                  onChange={(e) => handleScenarioChange('monthly_income', e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                  <span>₹20,000</span>
                  <span>Baseline: {formatINR(baselineData.monthly_income)}</span>
                  <span>₹3,00,000</span>
                </div>
              </div>

              {/* Variable 2: Credit Score */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Credit Score</label>
                  <span style={{ fontWeight: 700, color: scenarioData.credit_score >= 750 ? '#10b981' : '#f59e0b' }}>
                    {scenarioData.credit_score}
                  </span>
                </div>
                <input
                  type="range"
                  min="300"
                  max="850"
                  step="5"
                  value={scenarioData.credit_score}
                  onChange={(e) => handleScenarioChange('credit_score', e.target.value)}
                  style={{ width: '100%', accentColor: '#f59e0b' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                  <span>300 (Poor)</span>
                  <span>Baseline: {baselineData.credit_score}</span>
                  <span>850 (Exceptional)</span>
                </div>
              </div>

              {/* Variable 3: Existing Monthly EMI */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Existing Monthly EMI (₹)</label>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                    {formatINR(scenarioData.existing_emi)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60000"
                  step="1000"
                  value={scenarioData.existing_emi}
                  onChange={(e) => handleScenarioChange('existing_emi', e.target.value)}
                  style={{ width: '100%', accentColor: '#a855f7' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                  <span>₹0 (Debt Free)</span>
                  <span>Baseline: {formatINR(baselineData.existing_emi)}</span>
                  <span>₹60,000</span>
                </div>
              </div>

              {/* Variable 4: Requested Loan Amount */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Requested Loan Amount (₹)</label>
                  <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {formatINR(scenarioData.requested_loan)}
                  </span>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="3500000"
                  step="50000"
                  value={scenarioData.requested_loan}
                  onChange={(e) => handleScenarioChange('requested_loan', e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                  <span>₹1,00,000</span>
                  <span>Baseline: {formatINR(baselineData.requested_loan)}</span>
                  <span>₹35,00,000</span>
                </div>
              </div>

              {/* Variable 5: Loan Tenure */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Loan Tenure (Years)</label>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                    {scenarioData.loan_tenure} Years
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={scenarioData.loan_tenure}
                  onChange={(e) => handleScenarioChange('loan_tenure', e.target.value)}
                  style={{ width: '100%', accentColor: '#6366f1' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                  <span>1 Year</span>
                  <span>Baseline: {baselineData.loan_tenure} Yrs</span>
                  <span>15 Years</span>
                </div>
              </div>

              {/* Variable 6: Savings Buffer */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Savings / Liquid Reserves (₹)</label>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>
                    {formatINR(scenarioData.savings)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1500000"
                  step="25000"
                  value={scenarioData.savings}
                  onChange={(e) => handleScenarioChange('savings', e.target.value)}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                  <span>₹0</span>
                  <span>Baseline: {formatINR(baselineData.savings)}</span>
                  <span>₹15,00,000</span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleRecalculate}
                disabled={simulating}
                style={{ marginTop: '0.5rem', width: '100%' }}
              >
                {simulating ? (
                  <>Recalculating ML Scenarios...</>
                ) : (
                  <>
                    <RefreshCw size={16} /> Recalculate Scenario Assessment
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT: SIDE-BY-SIDE COMPARISON */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Visual Delta Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {/* CURRENT PROFILE */}
              <div className="card" style={{ borderLeft: '4px solid #64748b', padding: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  CURRENT BASELINE
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>Risk Score</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: baseMeta.color, lineHeight: 1.1 }}>
                    {comp?.risk_score_baseline ?? '--'} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 100</span>
                  </div>
                  <span className={`badge ${baseMeta.badgeClass}`} style={{ marginTop: '0.35rem' }}>
                    {comp?.risk_level_baseline ?? 'N/A'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Existing DTI:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{formatPercent(comp?.dti_baseline)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Estimated EMI:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{formatINR(comp?.emi_baseline)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Approval Prob:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{comp?.approval_probability_baseline}%</strong>
                  </div>
                </div>
              </div>

              {/* NEW SCENARIO */}
              <div className="card" style={{ borderLeft: `4px solid ${scenMeta.color}`, padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    SIMULATED SCENARIO
                  </div>
                  {comp && comp.risk_score_diff !== 0 && (
                    <span className={`badge ${comp.risk_score_diff < 0 ? 'badge-low' : 'badge-high'}`} style={{ fontSize: '0.75rem' }}>
                      {comp.risk_score_diff < 0 ? (
                        <TrendingDown size={13} style={{ marginRight: '2px' }} />
                      ) : (
                        <TrendingUp size={13} style={{ marginRight: '2px' }} />
                      )}
                      {comp.risk_score_diff > 0 ? `+${comp.risk_score_diff}` : comp.risk_score_diff} pts
                    </span>
                  )}
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>New Risk Score</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: scenMeta.color, lineHeight: 1.1 }}>
                    {comp?.risk_score_scenario ?? '--'} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 100</span>
                  </div>
                  <span className={`badge ${scenMeta.badgeClass}`} style={{ marginTop: '0.35rem' }}>
                    {comp?.risk_level_scenario ?? 'N/A'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Simulated DTI:</span>
                    <strong style={{ color: 'var(--text-main)' }}>
                      {formatPercent(comp?.dti_scenario)}
                      {comp && comp.dti_diff !== 0 && (
                        <span style={{ fontSize: '0.75rem', color: comp.dti_diff < 0 ? '#10b981' : '#ef4444', marginLeft: '6px' }}>
                          ({comp.dti_diff > 0 ? `+${comp.dti_diff}%` : `${comp.dti_diff}%`})
                        </span>
                      )}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Simulated EMI:</span>
                    <strong style={{ color: 'var(--text-main)' }}>
                      {formatINR(comp?.emi_scenario)}
                      {comp && comp.emi_diff !== 0 && (
                        <span style={{ fontSize: '0.75rem', color: comp.emi_diff < 0 ? '#10b981' : '#ef4444', marginLeft: '6px' }}>
                          ({comp.emi_diff > 0 ? `+${formatINR(comp.emi_diff)}` : formatINR(comp.emi_diff)})
                        </span>
                      )}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Approval Prob:</span>
                    <strong style={{ color: 'var(--text-main)' }}>
                      {comp?.approval_probability_scenario}%
                      {comp && comp.approval_probability_diff !== 0 && (
                        <span style={{ fontSize: '0.75rem', color: comp.approval_probability_diff > 0 ? '#10b981' : '#ef4444', marginLeft: '6px' }}>
                          ({comp.approval_probability_diff > 0 ? `+${comp.approval_probability_diff}%` : `${comp.approval_probability_diff}%`})
                        </span>
                      )}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* WHAT CAUSED THE CHANGE (Narrative Explainer) */}
            <div className="card" style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Info size={18} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>What Caused the Change?</h3>
              </div>

              <p style={{ fontSize: '0.925rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '1rem' }}>
                {comp?.explanation_narrative || 'Adjust any variable on the left to see dynamic AI attribution and sensitivity shifts.'}
              </p>

              {comp?.causes && comp.causes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(51, 65, 85, 0.4)' }}>
                  {comp.causes.map((c, i) => (
                    <div key={i} style={{ fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={14} color="var(--accent-cyan)" /> {c}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* QUICK ACTIONS */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/compare" state={{ baselineAssessment: simulationResult?.baseline }} className="btn btn-secondary" style={{ flex: 1 }}>
                Compare Multi-Tenure Scenarios
              </Link>
              <Link to="/assessment" className="btn btn-outline" style={{ flex: 1 }}>
                New Full Assessment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
