import React from 'react';

export default function StatCard({ label, value, subtext, icon: Icon, badgeText, badgeClass = 'badge-low', highlightColor }) {
  return (
    <div className="stat-card" style={highlightColor ? { borderTopColor: highlightColor } : {}}>
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        {Icon && <Icon size={18} className="stat-icon" style={highlightColor ? { color: highlightColor } : {}} />}
      </div>
      <div className="stat-value" style={highlightColor ? { color: highlightColor } : {}}>
        {value}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
        {subtext && <span className="stat-subtext">{subtext}</span>}
        {badgeText && <span className={`badge ${badgeClass}`}>{badgeText}</span>}
      </div>
    </div>
  );
}
