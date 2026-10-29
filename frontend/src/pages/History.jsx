import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  Database,
  ExternalLink,
  Calendar,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileText,
  Filter
} from 'lucide-react';
import apiService from '../services/api';
import { formatINR, formatPercent, formatDate, getRiskLevelMeta, getEligibilityMeta } from '../utils/formatters';

export default function History() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [storageStatus, setStorageStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('ALL');

  const fetchHistory = () => {
    setLoading(true);
    apiService.getHistory()
      .then((res) => {
        if (res.success) {
          setAssessments(res.data || []);
          setStorageStatus(res.storage_status);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load history:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleOpenAssessment = (item) => {
    sessionStorage.setItem('last_assessment', JSON.stringify(item));
    navigate(`/result?id=${item.id || item._id}`);
  };

  const handleSimulate = (item) => {
    sessionStorage.setItem('last_assessment', JSON.stringify(item));
    navigate('/simulator', { state: { baselineAssessment: item } });
  };

  // Filter assessments
  const filtered = assessments.filter((item) => {
    const purpose = item.applicant?.loan_purpose || '';
    const risk = item.risk_assessment?.risk_level || '';
    const matchesSearch =
      purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk =
      selectedRiskFilter === 'ALL' || risk.toUpperCase().includes(selectedRiskFilter);
    return matchesSearch && matchesRisk;
  });

  return (
    <div style={{ padding: '2rem 0 5rem' }}>
      <div className="container">
        {/* Header & Database Status */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)' }}>
                Persistent Records
              </span>
              {storageStatus && (
                <span className="badge" style={{ background: storageStatus.connected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: storageStatus.connected ? '#10b981' : '#f59e0b' }}>
                  <Database size={12} style={{ marginRight: '4px' }} />
                  {storageStatus.storage_mode === 'mongodb' ? 'MongoDB Atlas' : 'Local Storage Mode'}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>Assessment History</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Review past credit evaluations stored in MongoDB. Click any entry to inspect the full report or test in the simulator.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={fetchHistory} disabled={loading}>
              <RefreshCw size={16} /> Refresh
            </button>
            <Link to="/assessment" className="btn btn-primary">
              <FileText size={16} /> New Assessment
            </Link>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '240px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by loan purpose (e.g. Home, Education)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ border: 'none', background: 'transparent', padding: '0.4rem 0' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} color="var(--text-muted)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Risk Filter:</span>
            {['ALL', 'LOW', 'MEDIUM', 'HIGH'].map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setSelectedRiskFilter(tier)}
                className="btn btn-outline"
                style={{
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.75rem',
                  background: selectedRiskFilter === tier ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  borderColor: selectedRiskFilter === tier ? 'var(--accent-cyan)' : 'var(--border-card)',
                  color: selectedRiskFilter === tier ? 'var(--accent-cyan)' : 'var(--text-muted)'
                }}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* ASSESSMENTS LIST */}
        {loading ? (
          <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
            <RefreshCw size={30} className="spin-icon" style={{ color: 'var(--accent-cyan)', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading previous assessments from database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <HistoryIcon size={44} color="#64748b" style={{ margin: '0 auto 1rem' }} />
            <h3>No Assessments Found</h3>
            <p style={{ color: 'var(--text-muted)', margin: '0.5rem auto 1.5rem', maxWidth: '400px' }}>
              {searchTerm || selectedRiskFilter !== 'ALL'
                ? 'No assessment records matched your search filters.'
                : 'No assessments have been recorded yet. Start by completing your first credit assessment.'}
            </p>
            <Link to="/assessment" className="btn btn-primary">
              Run First Assessment
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Purpose</th>
                  <th>Requested Loan</th>
                  <th>Credit Score</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>Eligibility</th>
                  <th>Est. Monthly EMI</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const meta = getRiskLevelMeta(item.risk_assessment?.risk_level);
                  const eligMeta = getEligibilityMeta(item.risk_assessment?.eligibility);
                  return (
                    <tr key={item.id || item._id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} /> {formatDate(item.created_at)}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {item.applicant?.loan_purpose || 'General'}
                      </td>
                      <td>
                        {formatINR(item.financial_metrics?.requested_loan)}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: item.applicant?.credit_score >= 700 ? '#10b981' : '#f59e0b' }}>
                          {item.applicant?.credit_score || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: meta.color, fontSize: '0.95rem' }}>
                          {item.risk_assessment?.risk_score ?? '--'} / 100
                        </strong>
                      </td>
                      <td>
                        <span className={`badge ${meta.badgeClass}`} style={{ fontSize: '0.75rem' }}>
                          {item.risk_assessment?.risk_level}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${eligMeta.badgeClass}`} style={{ fontSize: '0.75rem' }}>
                          {item.risk_assessment?.eligibility}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
                        {formatINR(item.financial_metrics?.estimated_emi)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => handleOpenAssessment(item)}
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                            title="Open detailed result report"
                          >
                            <ExternalLink size={13} /> View
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => handleSimulate(item)}
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                            title="Open in What-If Simulator"
                          >
                            <Sliders size={13} /> Simulate
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
