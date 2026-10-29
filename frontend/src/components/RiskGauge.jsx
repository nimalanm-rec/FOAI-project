import React from 'react';
import { getRiskLevelMeta } from '../utils/formatters';

export default function RiskGauge({ score = 0, riskLevel = 'LOW RISK', size = 240 }) {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));
  const meta = getRiskLevelMeta(riskLevel);

  // SVG Gauge calculations for a 240-degree arc
  const radius = (size / 2) - 24;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;
  const totalArc = circumference * (240 / 360);
  const activeStrokeOffset = totalArc - (totalArc * normalizedScore) / 100;

  // Segment lengths for the 3 distinct risk zones on the 240-deg arc:
  // Low: 0 - 35%
  // Medium: 35% - 65% (30% length)
  // High: 65% - 100% (35% length)
  const lowZoneLength = totalArc * 0.35;
  const medZoneLength = totalArc * 0.30;
  const highZoneLength = totalArc * 0.35;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: `${size + 40}px` }}>
      <div style={{ position: 'relative', width: size, height: size * 0.85 }}>
        <svg width={size} height={size * 0.85} viewBox={`0 0 ${size} ${size * 0.85}`}>
          {/* ZONE 1 (0 - 35%): Low Risk Green Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(16, 185, 129, 0.25)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${lowZoneLength} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(150 ${size / 2} ${size / 2})`}
          />

          {/* ZONE 2 (35% - 65%): Medium Risk Amber Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(245, 158, 11, 0.25)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${medZoneLength} ${circumference}`}
            strokeDashoffset={-lowZoneLength}
            strokeLinecap="butt"
            transform={`rotate(150 ${size / 2} ${size / 2})`}
          />

          {/* ZONE 3 (65% - 100%): High Risk Red Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(239, 68, 68, 0.25)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${highZoneLength} ${circumference}`}
            strokeDashoffset={-(lowZoneLength + medZoneLength)}
            strokeLinecap="round"
            transform={`rotate(150 ${size / 2} ${size / 2})`}
          />

          {/* DYNAMIC ACTIVE FILL ARC */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={meta.color}
            strokeWidth={strokeWidth + 2}
            strokeDasharray={`${totalArc} ${circumference}`}
            strokeDashoffset={activeStrokeOffset}
            strokeLinecap="round"
            transform={`rotate(150 ${size / 2} ${size / 2})`}
            style={{
              transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease',
              filter: `drop-shadow(0 0 6px ${meta.color}88)`
            }}
          />
        </svg>

        {/* Central Value Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '38%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: meta.color, lineHeight: 1 }}>
            {normalizedScore}
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
            Score / 100
          </div>
        </div>

        {/* Active Badge */}
        <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', width: '100%' }}>
          <span className={`badge ${meta.badgeClass}`} style={{ fontSize: '0.85rem', padding: '0.4rem 1.1rem', fontWeight: 700 }}>
            {meta.label}
          </span>
        </div>
      </div>

      {/* 3-ZONE SPECTRUM BAR & LEGEND */}
      <div style={{ width: '100%', marginTop: '0.75rem', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', gap: '2px', marginBottom: '0.4rem' }}>
          <div style={{ flex: 35, background: '#10b981', opacity: normalizedScore < 35 ? 1 : 0.4, transition: 'opacity 0.3s' }} />
          <div style={{ flex: 30, background: '#f59e0b', opacity: (normalizedScore >= 35 && normalizedScore < 65) ? 1 : 0.4, transition: 'opacity 0.3s' }} />
          <div style={{ flex: 35, background: '#ef4444', opacity: normalizedScore >= 65 ? 1 : 0.4, transition: 'opacity 0.3s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span style={{ color: normalizedScore < 35 ? '#10b981' : 'var(--text-subtle)', fontWeight: normalizedScore < 35 ? 700 : 400 }}>
            🟢 Low (0-34)
          </span>
          <span style={{ color: (normalizedScore >= 35 && normalizedScore < 65) ? '#f59e0b' : 'var(--text-subtle)', fontWeight: (normalizedScore >= 35 && normalizedScore < 65) ? 700 : 400 }}>
            🟡 Medium (35-64)
          </span>
          <span style={{ color: normalizedScore >= 65 ? '#ef4444' : 'var(--text-subtle)', fontWeight: normalizedScore >= 65 ? 700 : 400 }}>
            🔴 High (65-100)
          </span>
        </div>
      </div>
    </div>
  );
}
