import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DependentsPage from '../../../pages/dependents/DependentsPage';
import dependentApi from '../../../api/dependentApi';

vi.mock('../../../api/dependentApi', () => ({
  default: {
    getDependents: vi.fn(),
    addDependent: vi.fn(),
    updateDependent: vi.fn(),
    deleteDependent: vi.fn(),
  },
}));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

const MOCK_DEPENDENTS = [
  {
    _id: 'd1',
    name: 'Alice Smith',
    relationship: 'Child',
    dateOfBirth: '2018-03-15T00:00:00.000Z',
    nic: '',
    gender: 'Female',
  },
  {
    _id: 'd2',
    name: 'Bob Smith',
    relationship: 'Spouse',
    dateOfBirth: '1990-07-22T00:00:00.000Z',
    nic: '900722123V',
    gender: 'Male',
  },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <DependentsPage />
    </MemoryRouter>
  );

describe('DependentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dependentApi.getDependents.mockResolvedValue(MOCK_DEPENDENTS);
    dependentApi.addDependent.mockResolvedValue({ _id: 'd3' });
    dependentApi.updateDependent.mockResolvedValue({});
    dependentApi.deleteDependent.mockResolvedValue({});
  });

  it('shows a spinner while loading', () => {
    dependentApi.getDependents.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(document.querySelector('svg')).toBeTruthy();
  });

  it('renders the page heading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Family Members & Dependents')).toBeInTheDocument();
    });
  });

  it('renders both dependents in the table after load', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    });
  });

  it('shows relationship badge for each dependent', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Child')).toBeInTheDocument();
      expect(screen.getByText('Spouse')).toBeInTheDocument();
    });
  });

  it('shows "Not provided" for dependents without NIC', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Not provided')).toBeInTheDocument();
    });
  });

  it('shows empty state when no dependents returned', async () => {
    dependentApi.getDependents.mockResolvedValue([]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('No dependents found')).toBeInTheDocument();
    });
  });

  it('opens Add Dependent modal when header button clicked', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Alice Smith'));

    fireEvent.click(screen.getByRole('button', { name: /Add Dependent/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Jane Doe')).toBeInTheDocument();
    });
  });

  it('opens Edit Dependent modal with correct title', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Alice Smith'));

    const editBtns = screen.getAllByLabelText('Edit');
    fireEvent.click(editBtns[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit Dependent')).toBeInTheDocument();
    });
  });

  it('shows delete confirmation dialog with dependent name', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Alice Smith'));

    const deleteBtns = screen.getAllByLabelText('Delete');
    fireEvent.click(deleteBtns[0]);

    await waitFor(() => {
      expect(screen.getByText('Remove Dependent')).toBeInTheDocument();
    });
  });

  it('calls deleteDependent with correct id and refreshes on confirm', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Alice Smith'));

    const deleteBtns = screen.getAllByLabelText('Delete');
    fireEvent.click(deleteBtns[0]);
    await waitFor(() => screen.getByText('Yes, Remove'));

    fireEvent.click(screen.getByText('Yes, Remove'));

    await waitFor(() => {
      expect(dependentApi.deleteDependent).toHaveBeenCalledWith('d1');
      expect(dependentApi.getDependents).toHaveBeenCalledTimes(2);
    });
  });

  it('calls addDependent and refreshes after form submit', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Alice Smith'));

    fireEvent.click(screen.getByRole('button', { name: /Add Dependent/i }));
    await waitFor(() => screen.getByPlaceholderText('Jane Doe'));

    fireEvent.change(screen.getByPlaceholderText('Jane Doe'), {
      target: { value: 'New Child' },
    });
    fireEvent.change(document.querySelector('#dep-dob'), {
      target: { value: '2015-06-10' },
    });

    fireEvent.submit(document.querySelector('form'));

    await waitFor(() => {
      expect(dependentApi.addDependent).toHaveBeenCalled();
      expect(dependentApi.getDependents).toHaveBeenCalledTimes(2);
    });
  });

  it('calls updateDependent with correct id on edit form submit', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Alice Smith'));

    const editBtns = screen.getAllByLabelText('Edit');
    fireEvent.click(editBtns[0]);
    await waitFor(() => screen.getByText('Edit Dependent'));

    fireEvent.submit(document.querySelector('form'));

    await waitFor(() => {
      expect(dependentApi.updateDependent).toHaveBeenCalledWith('d1', expect.any(Object));
    });
  });

  it('shows error toast when NIC is required but missing (Spouse relationship)', async () => {
    const toast = await import('react-hot-toast');
    renderPage();
    await waitFor(() => screen.getByText('Alice Smith'));

    fireEvent.click(screen.getByRole('button', { name: /Add Dependent/i }));
    await waitFor(() => screen.getByPlaceholderText('Jane Doe'));

    fireEvent.change(screen.getByPlaceholderText('Jane Doe'), {
      target: { value: 'Test Spouse' },
    });
    fireEvent.change(document.querySelector('#dep-relationship'), {
      target: { value: 'Spouse' },
    });
    fireEvent.change(document.querySelector('#dep-dob'), {
      target: { value: '1990-01-01' },
    });
    // NIC intentionally left empty

    fireEvent.submit(document.querySelector('form'));

    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalledWith(
        'NIC is required for this dependent category'
      );
    });
  });

  it('shows error toast for invalid NIC format', async () => {
    const toast = await import('react-hot-toast');
    renderPage();
    await waitFor(() => screen.getByText('Alice Smith'));

    fireEvent.click(screen.getByRole('button', { name: /Add Dependent/i }));
    await waitFor(() => screen.getByPlaceholderText('Jane Doe'));

    fireEvent.change(screen.getByPlaceholderText('Jane Doe'), {
      target: { value: 'Test Person' },
    });
    fireEvent.change(document.querySelector('#dep-dob'), {
      target: { value: '1990-01-01' },
    });
    fireEvent.change(document.querySelector('#dep-nic'), {
      target: { value: 'BADFORMAT' },
    });

    fireEvent.submit(document.querySelector('form'));

    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalledWith('Invalid NIC format');
    });
  });

  it('shows error toast when fetch fails', async () => {
    const toast = await import('react-hot-toast');
    dependentApi.getDependents.mockRejectedValue(new Error('Network error'));
    renderPage();

    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalledWith('Failed to load family members');
    });
  });

  it('shows success toast after adding a dependent', async () => {
    const toast = await import('react-hot-toast');
    renderPage();
    await waitFor(() => screen.getByText('Alice Smith'));

    fireEvent.click(screen.getByRole('button', { name: /Add Dependent/i }));
    await waitFor(() => screen.getByPlaceholderText('Jane Doe'));

    fireEvent.change(screen.getByPlaceholderText('Jane Doe'), {
      target: { value: 'New Child' },
    });
    fireEvent.change(document.querySelector('#dep-dob'), {
      target: { value: '2015-06-10' },
    });
    fireEvent.submit(document.querySelector('form'));

    await waitFor(() => {
      expect(toast.default.success).toHaveBeenCalledWith('Dependent added successfully');
    });
  });

  it('shows success toast after deleting a dependent', async () => {
    const toast = await import('react-hot-toast');
    renderPage();
    await waitFor(() => screen.getByText('Alice Smith'));

    fireEvent.click(screen.getAllByLabelText('Delete')[0]);
    await waitFor(() => screen.getByText('Yes, Remove'));
    fireEvent.click(screen.getByText('Yes, Remove'));

    await waitFor(() => {
      expect(toast.default.success).toHaveBeenCalledWith('Dependent removed successfully');
    });
  });

  it('calls getDependents on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(dependentApi.getDependents).toHaveBeenCalledTimes(1);
    });
  });
});
