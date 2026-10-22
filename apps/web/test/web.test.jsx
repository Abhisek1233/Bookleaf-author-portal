import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Currency } from '../src/components/common/Currency.jsx';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../src/components/common/Badge.jsx';
import { EmptyState } from '../src/components/common/EmptyState.jsx';

describe('Frontend UI Components', () => {
  it('Currency component formats Indian Rupee numbers accurately', () => {
    const { container } = render(<Currency value={11970} />);
    expect(container.textContent).toMatch(/₹\s*11,970/);
  });

  it('Currency handles null or zero figures gracefully', () => {
    const { container: nullContainer } = render(<Currency value={null} />);
    expect(nullContainer.textContent).toBe('—');

    const { container: zeroContainer } = render(<Currency value={0} />);
    expect(zeroContainer.textContent).toMatch(/₹\s*0/);
  });

  it('StatusBadge renders appropriate status label and styles', () => {
    render(<StatusBadge status="In Progress" />);
    expect(screen.getByText('In Progress')).toBeDefined();
  });

  it('PriorityBadge renders Critical priority indicator', () => {
    render(<PriorityBadge priority="Critical" />);
    expect(screen.getByText('Critical')).toBeDefined();
  });

  it('CategoryBadge renders valid BookLeaf category', () => {
    render(<CategoryBadge category="Royalty & Payments" />);
    expect(screen.getByText('Royalty & Payments')).toBeDefined();
  });

  it('EmptyState renders custom message and title', () => {
    render(
      <EmptyState
        title="No Manuscripts Found"
        description="Your author library is currently empty."
      />
    );
    expect(screen.getByText('No Manuscripts Found')).toBeDefined();
    expect(screen.getByText('Your author library is currently empty.')).toBeDefined();
  });
});
