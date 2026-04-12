import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getAllSideEffects, deleteSideEffect } from '../../api/sideEffectApi';
import { vaccineApi } from '../../api/vaccineApi';
import { formatDate } from '../../utils/formatters';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Spinner,
  EmptyState,
  FormInput,
  FormSelect,
  Button,
  ConfirmDialog,
  SeverityBadge,
  StatusBadge,
} from '../../components/common';

// ─── Icons ──────────────────────────────────────────────────────────────────
const TrashIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);



// ─── Severity colour map for row highlight ───────────────────────────────────
const severityRowClass = {
  Severe:   'border-l-4 border-l-red-500',
  Moderate: 'border-l-4 border-l-amber-400',
  Mild:     'border-l-4 border-l-emerald-400',
};

// ════════════════════════════════════════════════════════════════════════════
// ADMIN SIDE EFFECTS PAGE
// ════════════════════════════════════════════════════════════════════════════
const AdminSideEffectsPage = () => {
  const [reports, setReports]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [vaccines, setVaccines]   = useState([]);

  // ── Filters ──────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({ nic: '', severity: '', vaccineId: '' });

  // ── Delete state ─────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Load vaccines for dropdown on mount ──────────────────────────────────
  useEffect(() => {
    vaccineApi.getVaccines()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setVaccines(list);
      })
      .catch(() => {/* silently fail — dropdown just won't pre-populate */});
  }, []);

  // ── Fetch reports ─────────────────────────────────────────────────────────
  const fetchReports = useCallback(async (filtersToUse = filters) => {
    setLoading(true);
    setError(null);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filtersToUse).filter(([, v]) => v.trim() !== '')
      );
      const data = await getAllSideEffects(activeFilters);
      setReports(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load side-effect reports.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchReports(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filter handlers ──────────────────────────────────────────────────────
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchReports(filters);
  };

  const clearFilters = () => {
    const empty = { nic: '', severity: '', vaccineId: '' };
    setFilters(empty);
    fetchReports(empty);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v.trim() !== '');

  // ── Delete handlers ───────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteSideEffect(deleteTarget._id);
      toast.success('Side-effect report deleted.');
      setReports((prev) => prev.filter((r) => r._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete report.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Vaccine options for select ────────────────────────────────────────────
  const vaccineOptions = [
    { value: '', label: 'All Vaccines' },
    ...vaccines.map((v) => ({ value: v._id, label: v.name })),
  ];

  const severityOptions = [
    { value: '',         label: 'All Severities' },
    { value: 'Mild',     label: 'Mild' },
    { value: 'Moderate', label: 'Moderate' },
    { value: 'Severe',   label: 'Severe' },
  ];

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getVaccineName = (report) =>
    report.recordId?.vaccineId?.name || '—';

  const getHospitalName = (report) =>
    report.recordId?.hospitalId?.name || '—';

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Side-Effects Monitoring
          </h1>
          {!loading && (
            <StatusBadge status="info" size="sm">
              {reports.length} {reports.length === 1 ? 'report' : 'reports'}
            </StatusBadge>
          )}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          All side-effect reports submitted by patients
        </p>
      </div>

      {/* ── Filter Panel ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Reports</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">

            {/* NIC search */}
            <FormInput
              label="Patient NIC"
              name="nic"
              value={filters.nic}
              onChange={handleFilterChange}
              placeholder="e.g. 200012345678"
            />

            {/* Severity dropdown */}
            <FormSelect
              label="Severity"
              name="severity"
              value={filters.severity}
              onChange={handleFilterChange}
              options={severityOptions}
            />

            {/* Vaccine dropdown */}
            <FormSelect
              label="Vaccine"
              name="vaccineId"
              value={filters.vaccineId}
              onChange={handleFilterChange}
              options={vaccineOptions}
            />

            {/* Action buttons — match RecordsPage layout */}
            <div className="flex space-x-2 lg:col-span-2">
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

      {/* ── Table / States ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-danger-50 dark:bg-danger-500/10 text-danger-700 dark:text-danger-400 p-4 rounded-xl border border-danger-200 dark:border-danger-800">
          {error}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          title="No reports found"
          description={
            hasActiveFilters
              ? 'No side-effect reports match the current filters. Try adjusting your search.'
              : 'No side-effect reports have been submitted yet.'
          }
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/60">
                <tr>
                  {[
                    'Patient',
                    'NIC',
                    'Vaccine',
                    'Symptoms',
                    'Severity',
                    'Date Reported',
                    'Hospital',
                    'For',
                    'Actions',
                  ].map((col) => (
                    <th
                      key={col}
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                {reports.map((report) => (
                  <tr
                    key={report._id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      severityRowClass[report.severity] || ''
                    }`}
                  >
                    {/* Patient name */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {report.userId?.name || '—'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {report.userId?.email || ''}
                      </div>
                    </td>

                    {/* NIC */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-mono">
                      {report.userId?.nic || '—'}
                    </td>

                    {/* Vaccine */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                      {getVaccineName(report)}
                    </td>

                    {/* Symptoms */}
                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300 max-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {(report.symptoms || []).map((s, i) => (
                          <span
                            key={i}
                            className="inline-block px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Severity */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <SeverityBadge severity={report.severity} />
                    </td>

                    {/* Date reported */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {formatDate(report.dateReported)}
                    </td>

                    {/* Hospital */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {getHospitalName(report)}
                    </td>

                    {/* For (self / dependent) */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {report.recordId?.dependentName
                        ? <span className="text-primary-600 dark:text-primary-400">{report.recordId.dependentName}</span>
                        : 'Self'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setDeleteTarget(report)}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors"
                        title="Delete report"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Delete Confirmation ───────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteLoading}
        title="Delete Side-Effect Report"
        description={
          deleteTarget
            ? `Are you sure you want to delete the report by ${deleteTarget.userId?.name || 'this patient'}? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        intent="danger"
      />
    </div>
  );
};

export default AdminSideEffectsPage;
