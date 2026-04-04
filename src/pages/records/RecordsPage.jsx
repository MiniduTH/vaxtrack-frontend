import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { getAllRecords, getMyRecords } from '../../api/recordApi';
import { formatDate } from '../../utils/formatters';
import { USER_ROLES } from '../../utils/constants';

import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Spinner,
  EmptyState,
  FormInput,
  Button,
} from '../../components/common';

const RecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useAuthStore((state) => state.user);

  // Filters for staff/admin
  const [filters, setFilters] = useState({
    patientId: '',
    vaccineId: '',
    hospitalId: '',
  });

  const isStaffOrAdmin = user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.STAFF;

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;

      if (isStaffOrAdmin) {
        // Only send non-empty filters
        const activeFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v.trim() !== '')
        );
        data = await getAllRecords(activeFilters);
      } else {
        data = await getMyRecords();
      }

      const normalizedRecords = Array.isArray(data)
        ? data
        : Array.isArray(data?.records)
          ? data.records
          : Array.isArray(data?.data)
            ? data.data
            : [];

      setRecords(normalizedRecords);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch vaccination records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [isStaffOrAdmin]); // Re-fetch on initial load

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchRecords();
  };

  const clearFilters = () => {
    setFilters({ patientId: '', vaccineId: '', hospitalId: '' });
    // setTimeout to ensure state clears before fetching (in a real app, useEffect handles this better)
    setTimeout(fetchRecords, 0); 
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {isStaffOrAdmin ? 'All Vaccination Records' : 'My Vaccination Records'}
        </h1>
      </div>

      {isStaffOrAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Filter Records</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleApplyFilters} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <FormInput
                label="Patient ID"
                name="patientId"
                value={filters.patientId}
                onChange={handleFilterChange}
                placeholder="Enter Patient ID"
              />
              <FormInput
                label="Vaccine ID"
                name="vaccineId"
                value={filters.vaccineId}
                onChange={handleFilterChange}
                placeholder="Enter Vaccine ID"
              />
              <FormInput
                label="Hospital ID"
                name="hospitalId"
                value={filters.hospitalId}
                onChange={handleFilterChange}
                placeholder="Enter Hospital ID"
              />
              <div className="flex space-x-2">
                <Button type="submit" variant="primary" className="w-full">
                  Apply
                </Button>
                <Button type="button" variant="outline" onClick={clearFilters} className="w-full">
                  Clear
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {loading ? (
        <div className="py-12 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-danger-50 text-danger-700 p-4 rounded-xl border border-danger-200">
          {error}
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          title="No records found"
          description={isStaffOrAdmin ? "Try adjusting your filters." : "You do not have any vaccination records yet."}
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  {isStaffOrAdmin && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Patient
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Dependent
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Vaccine
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Hospital
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Date Administered
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Next Dose
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                {records.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    {isStaffOrAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                        {record.patientId?.name || 'Unknown'} <br />
                        <span className="text-xs text-slate-500">{record.patientId?.nic || ''}</span>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                      {record.dependentName || <span className="text-slate-400 italic">Self</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                      {record.vaccineId || 'Unknown'} {/* Backend didn't populate vaccineId full obj in records controller? In getting all records, populated: patientId, hospitalId, administeredBy */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                      {record.hospitalId?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                      {formatDate(record.dateAdministered)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                      {record.nextDoseDate ? formatDate(record.nextDoseDate) : <span className="text-slate-400 italic">N/A</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RecordsPage;
