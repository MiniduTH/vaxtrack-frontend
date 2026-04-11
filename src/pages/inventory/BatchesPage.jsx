import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiBox, FiPlus, FiEdit2, FiTrash2, FiX, FiFilter, FiSearch, FiAlertTriangle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import batchApi from '../../api/batchApi';
import vaccineApi from '../../api/vaccineApi';
import hospitalApi from '../../api/hospitalApi';
import useAuthStore from '../../store/useAuthStore';

const BatchesPage = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin';
  const canWrite = isAdmin || user?.role === 'HospitalStaff';

  // State
  const [batches, setBatches] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Filtering State
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVaccine, setFilterVaccine] = useState('');
  const [filterHospital, setFilterHospital] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Load Initial Data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [vaxData, hospData, batchData] = await Promise.all([
          vaccineApi.getVaccines(),
          hospitalApi.getHospitals(),
          batchApi.getBatches()
        ]);
        
        setVaccines(Array.isArray(vaxData) ? vaxData : vaxData.data || vaxData.vaccines || []);
        setHospitals(Array.isArray(hospData) ? hospData : hospData.data || hospData.hospitals || []);
        setBatches(Array.isArray(batchData) ? batchData : batchData.data || batchData.batches || []);
      } catch (error) {
        toast.error('Failed to load inventory data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Soft/Frontend Filtering implementation (can be hooked to backend query params via batchApi.getBatches if preferred)
  const filteredBatches = useMemo(() => {
    return batches.filter(batch => {
      const matchStatus = filterStatus ? batch.status === filterStatus : true;
      // Depending on API populating, check batch.vaccineId._id or batch.vaccineId
      const vId = batch.vaccineId?._id || batch.vaccineId || batch.vaccine?.id;
      const matchVaccine = filterVaccine ? vId === filterVaccine : true;
      
      const hId = batch.hospitalId?._id || batch.hospitalId || batch.hospital?.id;
      const matchHospital = filterHospital ? hId === filterHospital : true;
      
      return matchStatus && matchVaccine && matchHospital;
    });
  }, [batches, filterStatus, filterVaccine, filterHospital]);

  const openAddModal = () => {
    reset({ 
      batchNumber: '', 
      vaccineId: '', 
      hospitalId: '', 
      quantity: 0, 
      arrivalDate: '', 
      expiryDate: '', 
      status: 'Available' 
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (batch) => {
    const formatDt = (dateStr) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';
    
    reset({
      batchNumber: batch.batchNumber,
      vaccineId: batch.vaccineId?._id || batch.vaccineId || '',
      hospitalId: batch.hospitalId?._id || batch.hospitalId || '',
      quantity: batch.quantity,
      arrivalDate: formatDt(batch.arrivalDate),
      expiryDate: formatDt(batch.expiryDate),
      status: batch.status
    });
    setEditingId(batch._id || batch.id);
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, quantity: parseInt(data.quantity, 10) };

      if (editingId) {
        await batchApi.updateBatch(editingId, payload);
        toast.success('Batch updated');
      } else {
        await batchApi.addBatch(payload);
        toast.success('Batch added');
      }
      setIsModalOpen(false);
      
      // Reload batches
      const response = await batchApi.getBatches();
      setBatches(Array.isArray(response) ? response : response.data || response.batches || []);
    } catch (error) {
      toast.error('Failed to save batch details');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this batch permanently?')) return;
    try {
      await batchApi.deleteBatch(id);
      toast.success('Batch deleted');
      const response = await batchApi.getBatches();
      setBatches(Array.isArray(response) ? response : response.data || response.batches || []);
    } catch (error) {
      toast.error('Failed to delete batch');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-success-50 dark:bg-success-500/10 text-success-800 dark:text-success-400 flex items-center w-fit"><FiCheckCircle className="mr-1" /> Available</span>;
      case 'Expired':
        return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-danger-50 dark:bg-danger-500/10 text-danger-800 dark:text-danger-400 flex items-center w-fit"><FiXCircle className="mr-1" /> Expired</span>;
      case 'Depleted':
        return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-secondary-100 dark:bg-slate-800 text-secondary-800 dark:text-slate-200 flex items-center w-fit"><FiAlertTriangle className="mr-1" /> Depleted</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">{status}</span>;
    }
  };

  // Helper to map IDs back to human readable names in table if population is missing
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

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center">
            <FiBox className="mr-3 text-primary-600 dark:text-primary-400" />
            Batch Inventory
          </h1>
          <p className="text-secondary-500 dark:text-slate-400 text-sm mt-1">Manage stock, track expiry dates, and monitor hospital capacities.</p>
        </div>
        {canWrite && (
          <button
            onClick={openAddModal}
            className="flex items-center bg-primary-600 dark:bg-primary-500 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-400 transition shadow-sm font-medium"
          >
            <FiPlus className="mr-2" /> Add New Batch
          </button>
        )}
      </div>

      {/* FILTER BAR */}
      <div className="bg-card p-4 rounded-xl shadow-sm border border-border mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center text-secondary-500 dark:text-slate-400 pr-2 border-r border-border">
          <FiFilter className="mr-2" /> <span className="text-sm font-medium">Filters</span>
        </div>
        
        <select 
          className="w-full sm:w-auto p-2 bg-secondary-50 dark:bg-slate-800/50 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Expired">Expired</option>
          <option value="Depleted">Depleted</option>
        </select>

        <select 
          className="w-full sm:w-auto p-2 bg-secondary-50 dark:bg-slate-800/50 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={filterVaccine}
          onChange={(e) => setFilterVaccine(e.target.value)}
        >
          <option value="">All Vaccines</option>
          {vaccines.map(v => (
            <option key={v._id || v.id} value={v._id || v.id}>{v.name}</option>
          ))}
        </select>

        <select 
          className="w-full sm:w-auto p-2 bg-secondary-50 dark:bg-slate-800/50 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={filterHospital}
          onChange={(e) => setFilterHospital(e.target.value)}
        >
          <option value="">All Hospitals</option>
          {hospitals.map(h => (
            <option key={h._id || h.id} value={h._id || h.id}>{h.name}</option>
          ))}
        </select>
        
        {(filterStatus || filterHospital || filterVaccine) && (
          <button 
            onClick={() => { setFilterStatus(''); setFilterVaccine(''); setFilterHospital(''); }}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-blue-800 ml-auto flex items-center"
          >
            Clear filters
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <svg className="animate-spin h-8 w-8 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center text-secondary-500 dark:text-slate-400">
          <FiSearch className="mx-auto h-12 w-12 text-secondary-400 dark:text-slate-500 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">No batches found</h3>
          <p className="mb-4 text-sm">No inventory records match your current criteria.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-secondary-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 dark:text-slate-400 uppercase tracking-wider">Batch No.</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 dark:text-slate-400 uppercase tracking-wider">Vaccine</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 dark:text-slate-400 uppercase tracking-wider">Hospital</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 dark:text-slate-400 uppercase tracking-wider">Status & Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-500 dark:text-slate-400 uppercase tracking-wider">Dates</th>
                  {canWrite && <th className="px-6 py-4 text-right text-xs font-semibold text-secondary-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredBatches.map((batch) => (
                  <tr key={batch._id || batch.id} className="hover:bg-secondary-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-foreground font-mono">
                      #{batch.batchNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-700 dark:text-slate-300">
                      {getVaccineName(batch.vaccineId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600 dark:text-slate-400">
                      {getHospitalName(batch.hospitalId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(batch.status)}
                      <div className="mt-1.5 text-sm font-medium text-secondary-600 dark:text-slate-400">
                        {batch.quantity.toLocaleString()} units
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-secondary-500 dark:text-slate-400">
                      <div className="mb-1"><span className="font-semibold">Arr:</span> {new Date(batch.arrivalDate).toLocaleDateString()}</div>
                      <div><span className="font-semibold text-danger-400">Exp:</span> {new Date(batch.expiryDate).toLocaleDateString()}</div>
                    </td>
                    {canWrite && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {canWrite && (
                          <button onClick={() => openEditModal(batch)} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mx-3 p-1">
                            <FiEdit2 size={16} />
                          </button>
                        )}
                        {isAdmin && (
                          <button onClick={() => handleDelete(batch._id || batch.id)} className="text-danger-500 dark:text-danger-400 hover:text-danger-700 dark:hover:text-danger-300 p-1">
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 dark:bg-slate-950 bg-opacity-50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-border bg-secondary-50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-foreground flex items-center">
                <FiBox className="mr-2 text-primary-600 dark:text-primary-400" />
                {editingId ? 'Edit Batch Record' : 'Register New Batch'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-secondary-400 dark:text-slate-500 hover:text-danger-500 dark:hover:text-danger-400 transition-colors">
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 dark:text-slate-300 mb-1">Batch Number *</label>
                  <input
                    type="text"
                    {...register('batchNumber', { required: 'Batch number is required' })}
                    className="w-full p-2.5 bg-card text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-mono placeholder:text-secondary-400"
                    placeholder="e.g. BATCH-2026-X1"
                  />
                  {errors.batchNumber && <p className="text-danger-500 dark:text-danger-400 text-xs mt-1">{errors.batchNumber.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-slate-300 mb-1">Vaccine Type *</label>
                  <select
                    {...register('vaccineId', { required: 'Required' })}
                    className="w-full p-2.5 bg-card text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Select Vaccine...</option>
                    {vaccines.map(v => <option key={v._id || v.id} value={v._id || v.id}>{v.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-slate-300 mb-1">Assigned Hospital *</label>
                  <select
                    {...register('hospitalId', { required: 'Required' })}
                    className="w-full p-2.5 bg-card text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Select Hospital...</option>
                    {hospitals.map(h => <option key={h._id || h.id} value={h._id || h.id}>{h.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-slate-300 mb-1">Quantity (Units) *</label>
                  <input
                    type="number"
                    min="1"
                    {...register('quantity', { required: 'Required', min: 1 })}
                    className="w-full p-2.5 bg-card text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="e.g. 5000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    {...register('status', { required: true })}
                    className="w-full p-2.5 bg-card text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Depleted">Depleted</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-slate-300 mb-1">Arrival Date *</label>
                  <input
                    type="date"
                    {...register('arrivalDate', { required: 'Required' })}
                    className="w-full p-2.5 bg-card text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-slate-300 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    {...register('expiryDate', { required: 'Required' })}
                    className="w-full p-2.5 bg-card text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-border flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg text-secondary-700 dark:text-slate-300 font-medium hover:bg-secondary-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-primary-600 dark:bg-primary-500 text-white font-medium hover:bg-primary-700 dark:hover:bg-primary-400 shadow-sm transition"
                >
                  {editingId ? 'Update Record' : 'Save Batch Info'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchesPage;
