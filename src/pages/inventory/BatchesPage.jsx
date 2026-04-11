import React, { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Card,
  CardBody,
  FormInput,
  FormSelect,
  Modal,
  ConfirmDialog,
  EmptyState,
  Spinner,
  StatusBadge,
} from '../../components/common';
import { FiBox, FiPlus, FiEdit2, FiTrash2, FiFilter, FiSearch, FiAlertTriangle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import batchApi from '../../api/batchApi';
import vaccineApi from '../../api/vaccineApi';
import hospitalApi from '../../api/hospitalApi';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  batchNumber: '',
  vaccineId: '',
  hospitalId: '',
  quantity: '',
  arrivalDate: '',
  expiryDate: '',
  status: 'Available',
};

const BatchesPage = () => {
  // Data
  const [batches, setBatches] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // Filtering State
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVaccine, setFilterVaccine] = useState('');
  const [filterHospital, setFilterHospital] = useState('');

  // Load Initial Data
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [vaxData, hospData, batchData] = await Promise.all([
        vaccineApi.getVaccines(),
        hospitalApi.getHospitals(),
        batchApi.getBatches(),
      ]);
      setVaccines(Array.isArray(vaxData) ? vaxData : vaxData.data || vaxData.vaccines || []);
      setHospitals(Array.isArray(hospData) ? hospData : hospData.data || hospData.hospitals || []);
      setBatches(Array.isArray(batchData) ? batchData : batchData.data || batchData.batches || []);
    } catch {
      toast.error('Failed to load inventory data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredBatches = useMemo(() => {
    return batches.filter(batch => {
      const matchStatus = filterStatus ? batch.status === filterStatus : true;
      const vId = batch.vaccineId?._id || batch.vaccineId || batch.vaccine?.id;
      const matchVaccine = filterVaccine ? vId === filterVaccine : true;
      const hId = batch.hospitalId?._id || batch.hospitalId || batch.hospital?.id;
      const matchHospital = filterHospital ? hId === filterHospital : true;
      return matchStatus && matchVaccine && matchHospital;
    });
  }, [batches, filterStatus, filterVaccine, filterHospital]);

  const handleOpenForm = (batch = null) => {
    if (batch) {
      const fmt = (d) => d ? new Date(d).toISOString().split('T')[0] : '';
      setFormData({
        batchNumber: batch.batchNumber,
        vaccineId: batch.vaccineId?._id || batch.vaccineId || '',
        hospitalId: batch.hospitalId?._id || batch.hospitalId || '',
        quantity: batch.quantity,
        arrivalDate: fmt(batch.arrivalDate),
        expiryDate: fmt(batch.expiryDate),
        status: batch.status,
      });
    } else {
      setFormData(EMPTY_FORM);
    }
    setSelectedBatch(batch);
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = { ...formData, quantity: parseInt(formData.quantity, 10) };
      if (selectedBatch) {
        await batchApi.updateBatch(selectedBatch._id || selectedBatch.id, payload);
        toast.success('Batch updated successfully');
      } else {
        await batchApi.addBatch(payload);
        toast.success('Batch added successfully');
      }
      setIsFormOpen(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save batch');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await batchApi.deleteBatch(selectedBatch._id || selectedBatch.id);
      toast.success('Batch deleted successfully');
      setIsDeleteOpen(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete batch');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVaccineName = (idOrObj) => {
    if (!idOrObj) return 'Unknown';
    if (idOrObj.name) return idOrObj.name;
    const vax = vaccines.find(v => (v._id || v.id) === idOrObj);
    return vax ? vax.name : 'Unknown';
  };

  const getHospitalName = (idOrObj) => {
    if (!idOrObj) return 'Unknown';
    if (idOrObj.name) return idOrObj.name;
    const h = hospitals.find(h => (h._id || h.id) === idOrObj);
    return h ? h.name : 'Unknown';
  };

  const statusBadge = (status) => {
    const map = {
      Available: 'success',
      Expired: 'danger',
      Depleted: 'warning',
    };
    return <StatusBadge status={map[status] || 'default'} size="sm">{status}</StatusBadge>;
  };

  const vaccineOptions = [
    { label: 'All Vaccines', value: '' },
    ...vaccines.map(v => ({ label: v.name, value: v._id || v.id })),
  ];
  const hospitalOptions = [
    { label: 'All Hospitals', value: '' },
    ...hospitals.map(h => ({ label: h.name, value: h._id || h.id })),
  ];
  const vaccineSelectOptions = [
    { label: 'Select Vaccine...', value: '' },
    ...vaccines.map(v => ({ label: v.name, value: v._id || v.id })),
  ];
  const hospitalSelectOptions = [
    { label: 'Select Hospital...', value: '' },
    ...hospitals.map(h => ({ label: h.name, value: h._id || h.id })),
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <FiBox className="text-primary-600 dark:text-primary-400" />
            Batch Inventory
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage stock, track expiry dates, and monitor hospital capacities.</p>
        </div>
        <Button onClick={() => handleOpenForm(null)} icon={FiPlus} variant="primary">
          Add New Batch
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 pr-2 border-r border-border shrink-0">
              <FiFilter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <div className="flex-1">
              <FormSelect
                id="filter-status"
                placeholder="All Statuses"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { label: 'All Statuses', value: '' },
                  { label: 'Available', value: 'Available' },
                  { label: 'Expired', value: 'Expired' },
                  { label: 'Depleted', value: 'Depleted' },
                ]}
              />
            </div>
            <div className="w-full md:w-60">
              <FormSelect
                id="filter-vaccine"
                value={filterVaccine}
                onChange={(e) => setFilterVaccine(e.target.value)}
                options={vaccineOptions}
              />
            </div>
            <div className="w-full md:w-60">
              <FormSelect
                id="filter-hospital"
                value={filterHospital}
                onChange={(e) => setFilterHospital(e.target.value)}
                options={hospitalOptions}
              />
            </div>
            {(filterStatus || filterVaccine || filterHospital) && (
              <button
                onClick={() => { setFilterStatus(''); setFilterVaccine(''); setFilterHospital(''); }}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline shrink-0"
              >
                Clear filters
              </button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <Spinner size="xl" />
          <p className="mt-4 text-slate-500 animate-pulse">Loading inventory...</p>
        </div>
      ) : filteredBatches.length === 0 ? (
        <EmptyState
          icon={FiSearch}
          title="No batches found"
          description={filterStatus || filterVaccine || filterHospital ? 'No batches match your filters.' : 'Get started by adding your first batch.'}
          actionLabel={!filterStatus && !filterVaccine && !filterHospital ? 'Add New Batch' : 'Clear Filters'}
          onAction={() => {
            if (!filterStatus && !filterVaccine && !filterHospital) handleOpenForm(null);
            else { setFilterStatus(''); setFilterVaccine(''); setFilterHospital(''); }
          }}
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-secondary-50 dark:bg-slate-800/50">
                  <tr>
                    {['Batch No.', 'Vaccine', 'Hospital', 'Status & Qty', 'Dates', 'Actions'].map(h => (
                      <th key={h} className={`px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filteredBatches.map(batch => (
                    <tr key={batch._id || batch.id} className="hover:bg-secondary-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-foreground font-mono">
                        #{batch.batchNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                        {getVaccineName(batch.vaccineId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {getHospitalName(batch.hospitalId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {statusBadge(batch.status)}
                        <div className="mt-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                          {batch.quantity.toLocaleString()} units
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                        <div className="mb-1"><span className="font-semibold">Arr:</span> {new Date(batch.arrivalDate).toLocaleDateString()}</div>
                        <div><span className="font-semibold text-danger-400">Exp:</span> {new Date(batch.expiryDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleOpenForm(batch)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded transition-colors"
                          aria-label="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedBatch(batch); setIsDeleteOpen(true); }}
                          className="p-1.5 text-slate-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/30 rounded transition-colors ml-1"
                          aria-label="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedBatch ? 'Edit Batch Record' : 'Register New Batch'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <FormInput
            id="batch-number"
            label="Batch Number"
            value={formData.batchNumber}
            onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
            placeholder="e.g. BATCH-2026-X1"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormSelect
              id="batch-vaccineId"
              label="Vaccine Type"
              value={formData.vaccineId}
              onChange={e => setFormData({ ...formData, vaccineId: e.target.value })}
              options={vaccineSelectOptions}
              required
            />
            <FormSelect
              id="batch-hospitalId"
              label="Assigned Hospital"
              value={formData.hospitalId}
              onChange={e => setFormData({ ...formData, hospitalId: e.target.value })}
              options={hospitalSelectOptions}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput
              id="batch-quantity"
              label="Quantity (Units)"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="e.g. 5000"
              required
            />
            <FormSelect
              id="batch-status"
              label="Status"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              options={[
                { label: 'Available', value: 'Available' },
                { label: 'Depleted', value: 'Depleted' },
                { label: 'Expired', value: 'Expired' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput
              id="batch-arrivalDate"
              label="Arrival Date"
              type="date"
              value={formData.arrivalDate}
              onChange={e => setFormData({ ...formData, arrivalDate: e.target.value })}
              required
            />
            <FormInput
              id="batch-expiryDate"
              label="Expiry Date"
              type="date"
              value={formData.expiryDate}
              onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-4">
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {selectedBatch ? 'Update Record' : 'Save Batch'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Batch"
        description={`Are you sure you want to permanently delete batch #${selectedBatch?.batchNumber}? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        intent="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default BatchesPage;
