import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminSideEffectsPage from '../AdminSideEffectsPage';

// Mock the API calls
vi.mock('../../../api/sideEffectApi', () => ({
  getAllSideEffects: vi.fn().mockResolvedValue({ data: [] })
}));

// Mock formatters
vi.mock('../../../utils/formatters', () => ({
  formatDate: vi.fn((d) => d || 'N/A')
}));

describe('AdminSideEffectsPage Component', () => {
  it('renders monitoring header', () => {
    render(<AdminSideEffectsPage />);
    expect(screen.getByText('Side-Effects Monitoring')).toBeInTheDocument();
  });

  it('displays filter form correctly', () => {
    render(<AdminSideEffectsPage />);
    expect(screen.getByText('Filter Reports')).toBeInTheDocument();
    expect(screen.getByText('Severity')).toBeInTheDocument();
  });

  it('renders filter and clear buttons', () => {
    render(<AdminSideEffectsPage />);
    expect(screen.getByText('Filter')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });
});
