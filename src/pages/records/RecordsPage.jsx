import { useState, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import { getAllRecords, getMyRecords, createRecord } from '../../api/recordApi';
import toast from 'react-hot-toast';
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
  Modal,
} from '../../components/common';

const RecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useAuthStore((state) => state.user);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    dependentName: '',
    vaccineId: '',
    batchId: '',
    hospitalId: '',
    dateAdministered: new Date().toISOString().split('T')[0],
    nextDoseDate: '',
  });

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

  const handleOpenForm = () => {
    setFormData({
      patientId: '',
      dependentName: '',
      vaccineId: '',
      batchId: '',
      hospitalId: '',
      dateAdministered: new Date().toISOString().split('T')[0],
      nextDoseDate: '',
    });
    setIsModalOpen(true);
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = { ...formData };
      if (!payload.dependentName) delete payload.dependentName;
      if (!payload.nextDoseDate) delete payload.nextDoseDate;

      await createRecord(payload);
      toast.success('Vaccination record created successfully');
      setIsModalOpen(false);
      fetchRecords();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {isStaffOrAdmin ? 'All Vaccination Records' : 'My Vaccination Records'}
        </h1>
        {isStaffOrAdmin && (
          <Button onClick={handleOpenForm} variant="primary">
            Add Record
          </Button>
        )}
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
                      {(record.vaccineId && typeof record.vaccineId === 'object'
                        ? record.vaccineId?.name || record.vaccineId?._id
                        : record.vaccineId) || 'Unknown'}
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

      {/* Add Record Modal */}
      {isStaffOrAdmin && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Vaccination Record"
          size="lg"
        >
          <form onSubmit={handleSaveRecord} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Patient ID *"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                required
                placeholder="MongoDB User ID"
              />
              <FormInput
                label="Dependent Name"
                value={formData.dependentName}
                onChange={(e) => setFormData({ ...formData, dependentName: e.target.value })}
                placeholder="Leave blank for self"
              />
              <FormInput
                label="Vaccine ID *"
                value={formData.vaccineId}
                onChange={(e) => setFormData({ ...formData, vaccineId: e.target.value })}
                required
              />
              <FormInput
                label="Batch ID *"
                value={formData.batchId}
                onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                required
              />
              <FormInput
                label="Hospital ID *"
                value={formData.hospitalId}
                onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Date Administered *"
                type="date"
                value={formData.dateAdministered}
                onChange={(e) => setFormData({ ...formData, dateAdministered: e.target.value })}
                required
              />
              <FormInput
                label="Next Dose Due Date"
                type="date"
                value={formData.nextDoseDate}
                onChange={(e) => setFormData({ ...formData, nextDoseDate: e.target.value })}
              />
            </div>
            
            <div className="pt-4 flex justify-end gap-3 border-t border-border mt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>Save Record</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default RecordsPage;
