import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HistoryPage from '../HistoryPage';

// Mock the recordApi
vi.mock('../../../api/recordApi', () => ({
  getHistory: vi.fn().mockResolvedValue({
    data: { self: { name: 'Test User', count: 0, records: [] }, dependents: [] }
  })
}));

// Mock formatters
vi.mock('../../../utils/formatters', () => ({
  formatDate: vi.fn((d) => d || 'N/A')
}));

describe('HistoryPage Component', () => {
  it('renders page header correctly', async () => {
    render(<HistoryPage />);
    await waitFor(() => {
      expect(screen.getByText('Vaccination History')).toBeInTheDocument();
    });
  });

  it('renders the Self tab', async () => {
    render(<HistoryPage />);
    await waitFor(() => {
      expect(screen.getByText('My History')).toBeInTheDocument();
    });
  });
});
