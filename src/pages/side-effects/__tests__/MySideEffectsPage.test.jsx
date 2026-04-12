import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MySideEffectsPage from '../MySideEffectsPage';

// Mock the API calls 
vi.mock('../../../api/sideEffectApi', () => ({
  getMySideEffects: vi.fn().mockResolvedValue({ data: [] }),
  reportSideEffect: vi.fn()
}));

vi.mock('../../../api/recordApi', () => ({
  getMyRecords: vi.fn().mockResolvedValue({ data: [] })
}));

// Mock formatters
vi.mock('../../../utils/formatters', () => ({
  formatDate: vi.fn((d) => d || 'N/A')
}));

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn(() => ({})),
    handleSubmit: vi.fn((fn) => (e) => { e?.preventDefault(); }),
    reset: vi.fn(),
    formState: { errors: {} }
  })
}));

describe('MySideEffectsPage Component', () => {
  it('renders side effects reporting header', () => {
    render(<MySideEffectsPage />);
    expect(screen.getByText('Side-Effects Reporting')).toBeInTheDocument();
  });

  it('renders the report form card', () => {
    render(<MySideEffectsPage />);
    expect(screen.getByText('Report a Side Effect')).toBeInTheDocument();
  });

  it('renders the previous reports section', () => {
    render(<MySideEffectsPage />);
    expect(screen.getByText('My Previous Reports')).toBeInTheDocument();
  });
});
