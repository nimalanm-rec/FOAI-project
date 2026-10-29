/**
 * Formatting Utilities for Indian Currency (INR), Ratios, and Dates
 */

// Formats numbers into Indian Rupee representation (e.g. ₹10,00,000 or ₹75,000)
export function formatINR(amount, includeSymbol = true) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return includeSymbol ? '₹0' : '0';
  }
  const numericVal = Math.round(Number(amount));
  const formatted = numericVal.toLocaleString('en-IN');
  return includeSymbol ? `₹${formatted}` : formatted;
}

// Formats percentage with 1 decimal place
export function formatPercent(value) {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.0%';
  }
  return `${Number(value).toFixed(1)}%`;
}

// Formats multiplier / ratio
export function formatRatio(value) {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00x';
  }
  return `${Number(value).toFixed(2)}x`;
}

// Returns badge metadata (color, background, label) for risk levels
export function getRiskLevelMeta(riskLevel) {
  const level = (riskLevel || '').toUpperCase();
  if (level.includes('LOW')) {
    return {
      label: 'LOW RISK',
      tier: 'low',
      badgeClass: 'badge-low',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.4)'
    };
  }
  if (level.includes('MEDIUM')) {
    return {
      label: 'MEDIUM RISK',
      tier: 'medium',
      badgeClass: 'badge-medium',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.4)'
    };
  }
  return {
    label: 'HIGH RISK',
    tier: 'high',
    badgeClass: 'badge-high',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.4)'
  };
}

// Returns badge metadata for loan eligibility status
export function getEligibilityMeta(eligibility) {
  const status = (eligibility || '').toUpperCase();
  if (status.includes('POTENTIALLY ELIGIBLE') || status.includes('ELIGIBLE')) {
    return {
      label: 'Potentially Eligible',
      badgeClass: 'badge-eligible',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)'
    };
  }
  if (status.includes('NEEDS REVIEW') || status.includes('REVIEW')) {
    return {
      label: 'Needs Review',
      badgeClass: 'badge-review',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.15)'
    };
  }
  return {
    label: 'High Risk Profile',
    badgeClass: 'badge-high-risk',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)'
  };
}

// Formats ISO timestamp to local readable date
export function formatDate(isoString) {
  if (!isoString) return 'Recent';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}
