import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  TrendingUp,
  Percent,
  IndianRupee,
  CreditCard,
  Building,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sliders,
  BarChart2,
  ArrowRight,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import apiService from '../services/api';
import RiskGauge from '../components/RiskGauge';
import StatCard from '../components/StatCard';
import {
  formatINR,
  formatPercent,
  formatRatio,
  getRiskLevelMeta,
  getEligibilityMeta,
  formatDate
} from '../utils/formatters';

export default function Result() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const assessmentId = searchParams.get('id');

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 1. Try to load from sessionStorage if passed directly
    const cached = sessionStorage.getItem('last_assessment');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (!assessmentId || parsed.id === assessmentId || parsed._id === assessmentId) {
          setAssessment(parsed);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Failed parsing cached assessment', e);
      }
    }

    // 2. Otherwise fetch from API by ID
    if (assessmentId) {
      setLoading(true);
      apiService.getAssessmentById(assessmentId)
        .then((res) => {
          if (res.success && res.data) {
            setAssessment(res.data);
            sessionStorage.setItem('last_assessment', JSON.stringify(res.data));
          } else {
            setError('Could not retrieve assessment record.');
          }
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Failed to load assessment.');
          setLoading(false);
        });
    } else {
      // If neither, fallback to sample assessment or prompt user
      setError('No assessment ID provided. Please submit an assessment first.');
      setLoading(false);
    }
  }, [assessmentId]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <RefreshCw size={36} className="spin-icon" style={{ color: 'var(--accent-cyan)', animation: 'spin 1s linear infinite' }} />
        <h3 style={{ marginTop: '1.25rem' }}>Analyzing Financial Risk Metrics...</h3>
        <p style={{ color: 'var(--text-muted)' }}>Retrieving machine learning predictions and explainability attributions.</p>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 2rem' }}>
          <AlertTriangle size={48} color="var(--risk-high)" style={{ margin: '0 auto 1rem' }} />
          <h2>Assessment Not Found</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.75rem 0 2rem' }}>
            {error || 'Unable to locate this assessment profile. Please run a new assessment.'}
          </p>
          <Link to="/assessment" className="btn btn-primary">
            Start New Assessment
          </Link>
        </div>
      </div>
    );
  }

  const {
    applicant = {},
    financial_metrics = {},
    risk_assessment = {},
    explainability = {},
    recommendations = [],
    created_at
  } = assessment;

  const riskMeta = getRiskLevelMeta(risk_assessment.risk_level);
  const eligibilityMeta = getEligibilityMeta(risk_assessment.eligibility);

  // Prepare chart data for monthly cash flows
  const cashFlowData = [
    { name: 'Monthly Income', amount: financial_metrics.monthly_income, fill: '#38bdf8' },
    { name: 'Living Expenses', amount: financial_metrics.monthly_expenses, fill: '#64748b' },
    { name: 'Existing EMI', amount: financial_metrics.existing_emi, fill: '#f59e0b' },
    { name: 'Estimated New EMI', amount: financial_metrics.estimated_emi, fill: '#a855f7' },
    { name: 'Post-Loan Surplus', amount: Math.max(0, financial_metrics.post_loan_disposable_income), fill: '#10b981' }
  ];

  // Prepare debt breakdown chart data
  const debtBreakdownData = [
    { name: 'Existing Debt', value: financial_metrics.existing_debt || 1, fill: '#f59e0b' },
    { name: 'Requested Loan', value: financial_metrics.requested_loan || 1, fill: '#38bdf8' },
    { name: 'Total Liquid Savings', value: financial_metrics.total_liquid_assets || 1, fill: '#10b981' }
  ];

  return (
    <div style={{ padding: '2rem 0 5rem' }}>
      <div className="container">
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)' }}>
                Assessment Report
              </span>
              {created_at && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} /> {formatDate(created_at)}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>AI Credit Assessment Results</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Comprehensive risk evaluation based on machine learning scoring and financial debt service ratios.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              to="/simulator"
              state={{ baselineAssessment: assessment }}
              className="btn btn-secondary"
            >
              <Sliders size={16} /> Open What-If Simulator
            </Link>
            <Link
              to="/compare"
              state={{ baselineAssessment: assessment }}
              className="btn btn-outline"
            >
              <BarChart2 size={16} /> Compare Loan Scenarios
            </Link>
          </div>
        </div>

        {/* PRIMARY HERO ROW: Risk Gauge & Eligibility Verdict */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Risk Gauge Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              AI Normalized Risk Score
            </h3>
            <RiskGauge score={risk_assessment.risk_score} riskLevel={risk_assessment.risk_level} size={240} />
            <div style={{ marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-subtle)' }}>
              Deterministic score on a scale of 0 (Lowest Risk) to 100 (Highest Risk)
            </div>
          </div>

          {/* Educational Eligibility & Probability Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Educational Eligibility
                </span>
                <span className={`badge ${eligibilityMeta.badgeClass}`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}>
                  {risk_assessment.eligibility}
                </span>
              </div>

              <div style={{ margin: '1.5rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Estimated Approval Probability:</span>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: riskMeta.color }}>
                    {risk_assessment.approval_probability}%
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ width: '100%', height: '10px', background: '#1e293b', borderRadius: '6px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${risk_assessment.approval_probability}%`,
                      height: '100%',
                      background: riskMeta.color,
                      transition: 'width 0.8s ease'
                    }}
                  />
                </div>
              </div>

              <p style={{ fontSize: '0.925rem', color: 'var(--text-main)', lineHeight: 1.6, padding: '1rem', background: 'rgba(30, 41, 59, 0.5)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
                {risk_assessment.eligibility_description}
              </p>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
              <Info size={15} style={{ flexShrink: 0 }} />
              Educational model assessment. Not a bank sanction or credit commitment.
            </div>
          </div>
        </div>

        {/* KEY RATIOS & FINANCIAL STATS GRID */}
        <div className="stats-grid">
          <StatCard
            label="Credit Score"
            value={applicant.credit_score || 'N/A'}
            subtext="Bureau Range: 300 - 850"
            icon={CreditCard}
            highlightColor={applicant.credit_score >= 750 ? '#10b981' : applicant.credit_score >= 680 ? '#38bdf8' : '#f59e0b'}
          />

          <StatCard
            label="Existing DTI Ratio"
            value={formatPercent(financial_metrics.existing_dti_ratio)}
            subtext={`Projected with new loan: ${formatPercent(financial_metrics.projected_dti_ratio)}`}
            icon={Percent}
            badgeText={financial_metrics.existing_dti_ratio <= 35 ? 'Safe' : 'Elevated'}
            badgeClass={financial_metrics.existing_dti_ratio <= 35 ? 'badge-low' : 'badge-high'}
          />

          <StatCard
            label="Estimated Monthly EMI"
            value={formatINR(financial_metrics.estimated_emi)}
            subtext={`@ ${financial_metrics.interest_rate_pct || 9.5}% demo interest rate`}
            icon={IndianRupee}
            highlightColor="#38bdf8"
          />

          <StatCard
            label="Loan-to-Income (LTI)"
            value={formatRatio(financial_metrics.loan_to_income_ratio)}
            subtext={`Requested: ${formatINR(financial_metrics.requested_loan)}`}
            icon={TrendingUp}
          />

          <StatCard
            label="Savings to Loan"
            value={formatPercent(financial_metrics.savings_to_loan_ratio * 100)}
            subtext={`Liquid buffer: ${formatINR(financial_metrics.total_liquid_assets)}`}
            icon={Building}
            highlightColor="#10b981"
          />
        </div>

        {/* CHARTS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {/* Monthly Cash Flow Breakdown */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <BarChart2 size={18} color="var(--accent-cyan)" /> Monthly Cash Flow Distribution
              </div>
              <span className="card-subtitle">Incomes vs Outflows (₹)</span>
            </div>

            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-15} textAnchor="end" />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                    formatter={(value) => [formatINR(value), 'Amount']}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {cashFlowData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Debt vs Savings Cushion Composition */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Layers size={18} color="#a855f7" /> Debt vs Liquidity Breakdown
              </div>
              <span className="card-subtitle">Portfolio assets vs liabilities</span>
            </div>

            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={debtBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {debtBreakdownData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                    formatter={(val) => [formatINR(val), 'Value']}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SECTION 14: EXPLAINABLE AI (XAI) */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                  <ShieldCheck size={18} />
                </div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Why did I receive this result?</h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
                {explainability.summary_statement || 'Dynamic feature attribution computed from your quantitative inputs.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {/* Positive Factors */}
              <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <CheckCircle2 size={18} /> Positive Factors (Strengths)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {explainability.positive_factors?.map((item, idx) => (
                    <div key={idx} style={{ padding: '0.85rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>
                          ✓ {item.factor}
                        </span>
                        <span className="badge badge-low" style={{ fontSize: '0.7rem' }}>
                          {item.importance} Impact
                        </span>
                      </div>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Factors */}
              <div style={{ background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <AlertTriangle size={18} /> Risk Factors (Areas of Concern)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {explainability.risk_factors?.map((item, idx) => (
                    <div key={idx} style={{ padding: '0.85rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>
                          ⚠ {item.factor}
                        </span>
                        <span className="badge badge-high" style={{ fontSize: '0.7rem' }}>
                          {item.importance} Impact
                        </span>
                      </div>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 15: PERSONALIZED RECOMMENDATIONS */}
        <section style={{ marginBottom: '3rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <div className="card-header" style={{ marginBottom: '1.5rem' }}>
              <div className="card-title">
                <Lightbulb size={20} color="#f59e0b" /> Actionable Recommendations to Improve Financial Profile
              </div>
              <span className="card-subtitle">Custom strategies derived from underwriting rules</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1.25rem',
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <span className="badge" style={{ background: '#1e293b', color: 'var(--accent-cyan)', border: '1px solid #334155' }}>
                        {rec.category}
                      </span>
                      <span className={`badge ${rec.priority === 'Critical' ? 'badge-high' : rec.priority === 'High' ? 'badge-medium' : 'badge-low'}`}>
                        {rec.priority} Priority
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
                      {rec.title}
                    </h4>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                      {rec.advice}
                    </p>
                  </div>

                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(51, 65, 85, 0.4)', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                    <strong>Next Action: </strong>
                    <span style={{ color: 'var(--text-muted)' }}>{rec.action_item}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM QUICK ACTIONS */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            to="/simulator"
            state={{ baselineAssessment: assessment }}
            className="btn btn-primary"
            style={{ padding: '0.85rem 1.75rem' }}
          >
            <Sliders size={18} /> Test Adjustments in What-If Simulator
          </Link>
          <Link
            to="/compare"
            state={{ baselineAssessment: assessment }}
            className="btn btn-secondary"
            style={{ padding: '0.85rem 1.75rem' }}
          >
            <BarChart2 size={18} /> Compare Other Loan Amounts & Tenures
          </Link>
        </div>
      </div>
    </div>
  );
}
