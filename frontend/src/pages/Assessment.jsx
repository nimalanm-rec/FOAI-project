import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  IndianRupee,
  CreditCard,
  Building,
  Send,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import apiService from '../services/api';

export const DEMO_APPLICANT = {
  age: 28,
  dependents: 1,
  employment_type: 'Salaried',
  monthly_income: 80000,
  monthly_expenses: 25000,
  employment_duration: 5,
  credit_score: 780,
  existing_loans: 1,
  existing_emi: 6000,
  previous_defaults: 0,
  late_payments: 0,
  savings: 450000,
  bank_balance: 200000,
  existing_debt: 80000,
  requested_loan: 600000,
  loan_tenure: 5,
  loan_purpose: 'Home'
};

export const SAMPLE_LOW_RISK = { ...DEMO_APPLICANT };

export const SAMPLE_MEDIUM_RISK = {
  age: 31,
  dependents: 2,
  employment_type: 'Salaried',
  monthly_income: 50000,
  monthly_expenses: 24000,
  employment_duration: 2,
  credit_score: 640,
  existing_loans: 1,
  existing_emi: 11000,
  previous_defaults: 0,
  late_payments: 2,
  savings: 50000,
  bank_balance: 25000,
  existing_debt: 160000,
  requested_loan: 500000,
  loan_tenure: 4,
  loan_purpose: 'Personal'
};

export const SAMPLE_HIGH_RISK = {
  age: 26,
  dependents: 2,
  employment_type: 'Self-Employed',
  monthly_income: 38000,
  monthly_expenses: 24000,
  employment_duration: 1,
  credit_score: 560,
  existing_loans: 2,
  existing_emi: 14000,
  previous_defaults: 1,
  late_payments: 3,
  savings: 15000,
  bank_balance: 8000,
  existing_debt: 250000,
  requested_loan: 700000,
  loan_tenure: 3,
  loan_purpose: 'Personal'
};

export default function Assessment({ onAssessmentComplete }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    age: '',
    dependents: 0,
    employment_type: 'Salaried',
    monthly_income: '',
    monthly_expenses: '',
    employment_duration: '',
    credit_score: '',
    existing_loans: 0,
    existing_emi: 0,
    previous_defaults: 0,
    late_payments: 0,
    savings: 0,
    bank_balance: 0,
    existing_debt: 0,
    requested_loan: '',
    loan_tenure: 5,
    loan_purpose: 'Home'
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));

    // Clear field-specific error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Load realistic Demo Applicant
  const handleLoadDemo = () => {
    setFormData({ ...DEMO_APPLICANT });
    setErrors({});
    setServerError('');
  };

  const handleLoadPreset = (preset) => {
    setFormData({ ...preset });
    setErrors({});
    setServerError('');
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      age: '',
      dependents: 0,
      employment_type: 'Salaried',
      monthly_income: '',
      monthly_expenses: '',
      employment_duration: '',
      credit_score: '',
      existing_loans: 0,
      existing_emi: 0,
      previous_defaults: 0,
      late_payments: 0,
      savings: 0,
      bank_balance: 0,
      existing_debt: 0,
      requested_loan: '',
      loan_tenure: 5,
      loan_purpose: 'Home'
    });
    setErrors({});
    setServerError('');
  };

  // Client Validation
  const validateForm = () => {
    const errs = {};

    if (!formData.age || Number(formData.age) < 18 || Number(formData.age) > 100) {
      errs.age = 'Age must be between 18 and 100.';
    }
    if (Number(formData.dependents) < 0) {
      errs.dependents = 'Dependents cannot be negative.';
    }
    if (!formData.employment_duration || Number(formData.employment_duration) < 0) {
      errs.employment_duration = 'Employment duration must be 0 or greater.';
    }

    if (!formData.monthly_income || Number(formData.monthly_income) <= 0) {
      errs.monthly_income = 'Monthly income must be greater than zero.';
    }
    if (formData.monthly_expenses === '' || Number(formData.monthly_expenses) < 0) {
      errs.monthly_expenses = 'Monthly expenses cannot be negative.';
    }

    if (!formData.credit_score || Number(formData.credit_score) < 300 || Number(formData.credit_score) > 850) {
      errs.credit_score = 'Credit score must be between 300 and 850.';
    }
    if (Number(formData.existing_loans) < 0) {
      errs.existing_loans = 'Existing loans cannot be negative.';
    }
    if (Number(formData.existing_emi) < 0) {
      errs.existing_emi = 'Existing EMI cannot be negative.';
    }
    if (Number(formData.previous_defaults) < 0) {
      errs.previous_defaults = 'Previous defaults cannot be negative.';
    }
    if (Number(formData.late_payments) < 0) {
      errs.late_payments = 'Late payments cannot be negative.';
    }

    if (Number(formData.savings) < 0) {
      errs.savings = 'Savings cannot be negative.';
    }
    if (Number(formData.bank_balance) < 0) {
      errs.bank_balance = 'Bank balance cannot be negative.';
    }
    if (Number(formData.existing_debt) < 0) {
      errs.existing_debt = 'Existing debt cannot be negative.';
    }

    if (!formData.requested_loan || Number(formData.requested_loan) <= 0) {
      errs.requested_loan = 'Requested loan amount must be greater than zero.';
    }
    if (!formData.loan_tenure || Number(formData.loan_tenure) < 0.5 || Number(formData.loan_tenure) > 35) {
      errs.loan_tenure = 'Tenure must be between 0.5 and 35 years.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiService.assessApplicant(formData);
      if (response.success && response.data) {
        if (onAssessmentComplete) {
          onAssessmentComplete(response.data);
        }
        // Save current assessment in sessionStorage for simulator and refresh persistence
        sessionStorage.setItem('last_assessment', JSON.stringify(response.data));
        navigate(`/result?id=${response.data.id || response.data._id}`);
      }
    } catch (err) {
      console.error('Assessment submission error:', err);
      if (err.validationErrors) {
        setErrors(err.validationErrors);
      }
      setServerError(err.message || 'Failed to complete credit assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>Applicant Financial Assessment</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Complete the verified financial inputs below to generate your explainable AI risk score and loan eligibility profile.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginRight: '0.25rem' }}>Sample Presets:</span>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleLoadPreset(SAMPLE_LOW_RISK)}
              title="Load Prime Low Risk Profile (Green)"
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem', borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.1)' }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', marginRight: '6px' }}></span>
              Low Risk
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleLoadPreset(SAMPLE_MEDIUM_RISK)}
              title="Load Moderate Medium Risk Profile (Amber)"
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem', borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.1)' }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block', marginRight: '6px' }}></span>
              Medium Risk
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleLoadPreset(SAMPLE_HIGH_RISK)}
              title="Load Strained High Risk Profile (Red)"
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)' }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', marginRight: '6px' }}></span>
              High Risk
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleReset}
              title="Clear all fields"
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            >
              <RotateCcw size={14} /> Clear
            </button>
          </div>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--risk-high)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={20} color="var(--risk-high)" />
            <span style={{ color: 'var(--risk-high)', fontSize: '0.9rem' }}>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* SECTION 1: PERSONAL INFORMATION */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <User size={19} color="var(--accent-cyan)" /> Personal Information
              </div>
              <span className="card-subtitle">Demographics and Employment category</span>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Age (Years) <span style={{ color: 'var(--accent-cyan)' }}>*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 28"
                  min="18"
                  max="100"
                  className={`form-input ${errors.age ? 'has-error' : ''}`}
                />
                {errors.age && <span className="error-text">{errors.age}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Number of Dependents</label>
                <input
                  type="number"
                  name="dependents"
                  value={formData.dependents}
                  onChange={handleChange}
                  min="0"
                  max="20"
                  className={`form-input ${errors.dependents ? 'has-error' : ''}`}
                />
                {errors.dependents && <span className="error-text">{errors.dependents}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Employment Type</label>
                <select
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Salaried">Salaried</option>
                  <option value="Self-employed">Self-employed</option>
                  <option value="Business owner">Business owner</option>
                  <option value="Student">Student</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: INCOME & EXPENSES */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <IndianRupee size={19} color="#10b981" /> Income & Expenditure
              </div>
              <span className="card-subtitle">Monthly cash flows and stability</span>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Monthly Income (₹) <span style={{ color: 'var(--accent-cyan)' }}>*</span>
                </label>
                <input
                  type="number"
                  name="monthly_income"
                  value={formData.monthly_income}
                  onChange={handleChange}
                  placeholder="e.g. 75000"
                  min="1"
                  className={`form-input ${errors.monthly_income ? 'has-error' : ''}`}
                />
                {errors.monthly_income && <span className="error-text">{errors.monthly_income}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Monthly Living Expenses (₹) <span style={{ color: 'var(--accent-cyan)' }}>*</span>
                </label>
                <input
                  type="number"
                  name="monthly_expenses"
                  value={formData.monthly_expenses}
                  onChange={handleChange}
                  placeholder="e.g. 25000"
                  min="0"
                  className={`form-input ${errors.monthly_expenses ? 'has-error' : ''}`}
                />
                {errors.monthly_expenses && <span className="error-text">{errors.monthly_expenses}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Employment Duration (Years) <span style={{ color: 'var(--accent-cyan)' }}>*</span>
                </label>
                <input
                  type="number"
                  name="employment_duration"
                  value={formData.employment_duration}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  step="0.5"
                  min="0"
                  className={`form-input ${errors.employment_duration ? 'has-error' : ''}`}
                />
                {errors.employment_duration && <span className="error-text">{errors.employment_duration}</span>}
              </div>
            </div>
          </div>

          {/* SECTION 3: CREDIT PROFILE */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <CreditCard size={19} color="#f59e0b" /> Credit Profile & Track Record
              </div>
              <span className="card-subtitle">Credit score and repayment discipline</span>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Credit Score (300 - 850) <span style={{ color: 'var(--accent-cyan)' }}>*</span>
                </label>
                <input
                  type="number"
                  name="credit_score"
                  value={formData.credit_score}
                  onChange={handleChange}
                  placeholder="e.g. 780"
                  min="300"
                  max="850"
                  className={`form-input ${errors.credit_score ? 'has-error' : ''}`}
                />
                {errors.credit_score && <span className="error-text">{errors.credit_score}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Number of Existing Loans</label>
                <input
                  type="number"
                  name="existing_loans"
                  value={formData.existing_loans}
                  onChange={handleChange}
                  min="0"
                  className={`form-input ${errors.existing_loans ? 'has-error' : ''}`}
                />
                {errors.existing_loans && <span className="error-text">{errors.existing_loans}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Existing Monthly EMI (₹)</label>
                <input
                  type="number"
                  name="existing_emi"
                  value={formData.existing_emi}
                  onChange={handleChange}
                  placeholder="e.g. 8000"
                  min="0"
                  className={`form-input ${errors.existing_emi ? 'has-error' : ''}`}
                />
                {errors.existing_emi && <span className="error-text">{errors.existing_emi}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Previous Loan Defaults</label>
                <input
                  type="number"
                  name="previous_defaults"
                  value={formData.previous_defaults}
                  onChange={handleChange}
                  min="0"
                  className={`form-input ${errors.previous_defaults ? 'has-error' : ''}`}
                />
                {errors.previous_defaults && <span className="error-text">{errors.previous_defaults}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Late Payment Count (past 2 yrs)</label>
                <input
                  type="number"
                  name="late_payments"
                  value={formData.late_payments}
                  onChange={handleChange}
                  min="0"
                  className={`form-input ${errors.late_payments ? 'has-error' : ''}`}
                />
                {errors.late_payments && <span className="error-text">{errors.late_payments}</span>}
              </div>
            </div>
          </div>

          {/* SECTION 4: ASSETS AND DEBT */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Building size={19} color="#a855f7" /> Assets & Outstanding Debt
              </div>
              <span className="card-subtitle">Liquid reserves and current leverage</span>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Savings / FDs (₹)</label>
                <input
                  type="number"
                  name="savings"
                  value={formData.savings}
                  onChange={handleChange}
                  placeholder="e.g. 400000"
                  min="0"
                  className={`form-input ${errors.savings ? 'has-error' : ''}`}
                />
                {errors.savings && <span className="error-text">{errors.savings}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Current Bank Balance (₹)</label>
                <input
                  type="number"
                  name="bank_balance"
                  value={formData.bank_balance}
                  onChange={handleChange}
                  placeholder="e.g. 250000"
                  min="0"
                  className={`form-input ${errors.bank_balance ? 'has-error' : ''}`}
                />
                {errors.bank_balance && <span className="error-text">{errors.bank_balance}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Total Outstanding Debt (₹)</label>
                <input
                  type="number"
                  name="existing_debt"
                  value={formData.existing_debt}
                  onChange={handleChange}
                  placeholder="e.g. 150000"
                  min="0"
                  className={`form-input ${errors.existing_debt ? 'has-error' : ''}`}
                />
                {errors.existing_debt && <span className="error-text">{errors.existing_debt}</span>}
              </div>
            </div>
          </div>

          {/* SECTION 5: LOAN REQUEST */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Send size={19} color="#38bdf8" /> Loan Request Details
              </div>
              <span className="card-subtitle">Required financing parameters</span>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Requested Loan Amount (₹) <span style={{ color: 'var(--accent-cyan)' }}>*</span>
                </label>
                <input
                  type="number"
                  name="requested_loan"
                  value={formData.requested_loan}
                  onChange={handleChange}
                  placeholder="e.g. 1000000"
                  min="1"
                  className={`form-input ${errors.requested_loan ? 'has-error' : ''}`}
                />
                {errors.requested_loan && <span className="error-text">{errors.requested_loan}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Loan Tenure (Years) <span style={{ color: 'var(--accent-cyan)' }}>*</span>
                </label>
                <input
                  type="number"
                  name="loan_tenure"
                  value={formData.loan_tenure}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  step="0.5"
                  min="0.5"
                  max="35"
                  className={`form-input ${errors.loan_tenure ? 'has-error' : ''}`}
                />
                {errors.loan_tenure && <span className="error-text">{errors.loan_tenure}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Loan Purpose</label>
                <select
                  name="loan_purpose"
                  value={formData.loan_purpose}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Home">Home</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Education">Education</option>
                  <option value="Personal">Personal</option>
                  <option value="Business">Business</option>
                  <option value="Medical">Medical</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Submission */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ padding: '0.85rem 2.25rem', fontSize: '1.05rem' }}
            >
              {submitting ? (
                <>Evaluating AI Models...</>
              ) : (
                <>
                  Run AI Assessment <Send size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
