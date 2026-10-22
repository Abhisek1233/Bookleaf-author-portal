import React from 'react';

export function Currency({ value, className = '' }) {
  if (value === null || value === undefined) {
    return <span className={`font-mono ${className}`}>—</span>;
  }

  const num = Number(value);
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);

  return <span className={`font-mono ${className}`}>{formatted}</span>;
}
