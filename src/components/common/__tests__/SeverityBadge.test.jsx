// NOTE: This branch does not currently have testing libraries (`vitest`, `react-testing-library` or `jest`) installed.
// This is a prepared unit test ready to run once the testing infrastructure is set up in Sprint 4.

/*
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SeverityBadge from '../SeverityBadge';

describe('SeverityBadge Component', () => {
  it('renders correctly with MILD severity', () => {
    render(<SeverityBadge severity="Mild" />);
    const badge = screen.getByText('Mild');
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement).toHaveClass('text-success-700');
  });

  it('renders correctly with MODERATE severity', () => {
    render(<SeverityBadge severity="Moderate" />);
    const badge = screen.getByText('Moderate');
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement).toHaveClass('text-warning-700');
  });

  it('renders correctly with SEVERE severity', () => {
    render(<SeverityBadge severity="Severe" />);
    const badge = screen.getByText('Severe');
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement).toHaveClass('text-danger-700');
  });

  it('falls back to default styling for unknown severity', () => {
    render(<SeverityBadge severity="Unknown" />);
    const badge = screen.getByText('Unknown');
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement).toHaveClass('text-slate-800');
  });
});
*/
