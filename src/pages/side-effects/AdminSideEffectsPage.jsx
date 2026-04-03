import { useState, useEffect } from 'react';
import { getAllSideEffects } from '../../api/sideEffectApi';
import { Card, CardHeader, CardTitle, CardBody, Spinner, EmptyState, FormInput, Button, SeverityBadge } from '../../components/common';
import { SEVERITY_LEVELS } from '../../utils/constants';

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString();
};

const AdminSideEffectsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    severity: '',
    userId: '',
  });

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v.trim() !== ''));
      const response = await getAllSideEffects(activeFilters);
      setReports(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load side effects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const clearFilters = () => {
    setFilters({ severity: '', userId: '' });
    setTimeout(fetchReports, 0);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Side-Effects Monitoring
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Filter Reports</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Severity
              </label>
              <select
                name="severity"
                value={filters.severity}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="">All</option>
                <option value={SEVERITY_LEVELS?.MILD || 'Mild'}>Mild</option>
                <option value={SEVERITY_LEVELS?.MODERATE || 'Moderate'}>Moderate</option>
                <option value={SEVERITY_LEVELS?.SEVERE || 'Severe'}>Severe</option>
              </select>
            </div>
            
            <FormInput
              label="User ID"
              name="userId"
              value={filters.userId}
              onChange={handleFilterChange}
              placeholder="e.g. 64b8a2c..."
            />
            
            <div className="flex space-x-2">
              <Button type="submit" variant="primary" className="w-full">Filter</Button>
              <Button type="button" variant="outline" onClick={clearFilters} className="w-full">Clear</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {loading ? (
        <div className="py-12 flex justify-center"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="bg-danger-50 text-danger-700 p-4 rounded-xl border border-danger-200">{error}</div>
      ) : reports.length === 0 ? (
        <EmptyState title="No reports found" description="Adjust your filters or there are no side effects reported." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Reporter</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Symptoms</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Severity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date Reported</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Record Context</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                {reports.map(report => (
                  <tr key={report._id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                      {report.userId?.name || 'Unknown User'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100 max-w-xs truncate">
                      {report.symptoms.join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <SeverityBadge severity={report.severity} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                      {formatDate(report.dateReported)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                      Date Administered: {report.recordId?.dateAdministered ? formatDate(report.recordId.dateAdministered) : 'N/A'}<br/>
                      <span className="text-xs text-slate-500">Dependent: {report.recordId?.dependentName || 'Self'}</span>
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

export default AdminSideEffectsPage;
