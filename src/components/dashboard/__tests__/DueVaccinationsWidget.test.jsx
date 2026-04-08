import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DueVaccinationsWidget from '../DueVaccinationsWidget';

// Mock the recordApi module - path relative to DueVaccinationsWidget.jsx (not __tests__)
vi.mock('../../../api/recordApi', () => ({
  getDueRecords: vi.fn().mockResolvedValue({
    data: { upcoming: { count: 0, records: [] }, overdue: { count: 0, records: [] } }
  })
}));

// Mock formatters
vi.mock('../../../utils/formatters', () => ({
  formatDate: vi.fn((d) => d || 'N/A')
}));

describe('DueVaccinationsWidget Component', () => {
  it('renders widget title after loading', async () => {
    render(<DueVaccinationsWidget />);
    await waitFor(() => {
      expect(screen.getByText('Due Vaccinations')).toBeInTheDocument();
    });
  });

  it('shows "all caught up" message when no records', async () => {
    render(<DueVaccinationsWidget />);
    await waitFor(() => {
      expect(screen.getByText(/all caught up/i)).toBeInTheDocument();
    });
  });
});
