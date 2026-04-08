import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SeverityBadge from '../SeverityBadge';

describe('SeverityBadge Component', () => {
  it('renders correctly with Mild severity', () => {
    render(<SeverityBadge severity="Mild" />);
    expect(screen.getByText('Mild')).toBeInTheDocument();
  });

  it('renders correctly with Moderate severity', () => {
    render(<SeverityBadge severity="Moderate" />);
    expect(screen.getByText('Moderate')).toBeInTheDocument();
  });

  it('renders correctly with Severe severity', () => {
    render(<SeverityBadge severity="Severe" />);
    expect(screen.getByText('Severe')).toBeInTheDocument();
  });

  it('falls back to "Unknown" for null/undefined severity', () => {
    render(<SeverityBadge />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('renders the provided severity text for unknown values', () => {
    render(<SeverityBadge severity="CustomValue" />);
    expect(screen.getByText('CustomValue')).toBeInTheDocument();
  });
});
