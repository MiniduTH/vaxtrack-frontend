import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiUsers, FiPlus, FiEdit2, FiTrash2, FiX, FiCalendar, FiUser } from 'react-icons/fi';
import dependentApi from '../../api/dependentApi';

const DependentsPage = () => {
  const [dependents, setDependents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  
  const watchRelationship = watch('relationship');
  const watchDOB = watch('dateOfBirth');

  const calculateAge = (dob) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const isNicRequired = watchRelationship === 'Spouse' || watchRelationship === 'Parent' || calculateAge(watchDOB) >= 18;

  const fetchDependents = async () => {
    try {
      setIsLoading(true);
      const res = await dependentApi.getDependents();
      // Backend returns { success, count, data: [...] }
      setDependents(Array.isArray(res) ? res : res.data || []);
    } catch (error) {
      toast.error('Failed to load family members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDependents();
  }, []);

  const openAddModal = () => {
    reset({ name: '', nic: '', dateOfBirth: '', relationship: 'Child', gender: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (dep) => {
    // Format date specifically for input type="date" (YYYY-MM-DD)
    const formattedDate = dep.dateOfBirth ? new Date(dep.dateOfBirth).toISOString().split('T')[0] : '';
    reset({ ...dep, dateOfBirth: formattedDate });
    setEditingId(dep._id || dep.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      // Basic formatting map if you wanted to sanitize inputs
      const payload = { ...data };

      if (editingId) {
        await dependentApi.updateDependent(editingId, payload);
        toast.success('Dependent updated successfully');
      } else {
        await dependentApi.addDependent(payload);
        toast.success('Dependent added successfully');
      }
      setIsModalOpen(false);
      fetchDependents();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save dependent';
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this family member?')) return;
    
    try {
      await dependentApi.deleteDependent(id);
      toast.success('Dependent removed');
      fetchDependents();
    } catch (error) {
      toast.error('Failed to remove dependent');
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center">
            <FiUsers className="mr-3 text-primary-600 dark:text-primary-400" />
            Family members & Dependents
          </h1>
          <p className="text-secondary-500 dark:text-slate-400 text-sm mt-1">Manage your registered family members for vaccination tracking.</p>
        </div>
        <button
          onClick={openAddModal}
          className="mt-4 sm:mt-0 flex items-center bg-primary-600 dark:bg-primary-500 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-400 transition shadow-sm"
        >
          <FiPlus className="mr-2" /> Add Dependent
        </button>
      </div>

      {/* List / Table */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <svg className="animate-spin h-8 w-8 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : dependents.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
          <FiUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No dependents found</h3>
          <p className="mb-4 text-sm">You haven't added any family members to your account yet.</p>
          <button onClick={openAddModal} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm">
            + Add your first dependent
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Relationship</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">DOB</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">NIC</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dependents.map((dep) => (
                  <tr key={dep._id || dep.id} className="hover:bg-secondary-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold uppercase">
                          {dep.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">{dep.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-primary-700 dark:text-primary-400">
                        {dep.relationship}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(dep.dateOfBirth).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dep.nic || <span className="text-gray-400 italic">Not provided</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => openEditModal(dep)}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mr-4 transition"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(dep._id || dep.id)}
                        className="text-danger-500 dark:text-danger-400 hover:text-danger-700 dark:hover:text-danger-300 transition"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Overlay / Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">
                {editingId ? 'Edit Dependent' : 'Add Dependent'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-secondary-600 dark:hover:text-slate-300 transition">
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-slate-300 mb-1">Full Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-secondary-400 dark:text-slate-500" />
                  </div>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className={`pl-10 w-full p-2.5 bg-card text-foreground border rounded-lg focus:ring-2 focus:ring-primary-500 transition-all outline-none ${errors.name ? 'border-danger-500' : 'border-border'}`}
                    placeholder="Jane Doe"
                  />
                </div>
                {errors.name && <p className="text-danger-500 dark:text-danger-400 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-slate-300 mb-1">Relationship *</label>
                <select
                  {...register('relationship', { required: 'Required' })}
                  className="w-full p-2.5 bg-card text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                >
                  <option value="Child">Child</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-slate-300 mb-1">Gender *</label>
                <select
                  {...register('gender', { required: 'Gender is required' })}
                  className={`w-full p-2.5 bg-card text-foreground border rounded-lg focus:ring-2 focus:ring-primary-500 transition-all outline-none ${errors.gender ? 'border-danger-500' : 'border-border'}`}
                >
                  <option value="">Select gender…</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="text-danger-500 dark:text-danger-400 text-xs mt-1">{errors.gender.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-slate-300 mb-1">Date of Birth *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCalendar className="text-secondary-400 dark:text-slate-500" />
                  </div>
                  <input
                    type="date"
                    {...register('dateOfBirth', { required: 'DOB is required' })}
                    className={`pl-10 w-full p-2.5 bg-card text-foreground border rounded-lg focus:ring-2 focus:ring-primary-500 transition-all outline-none ${errors.dateOfBirth ? 'border-danger-500' : 'border-border'}`}
                  />
                </div>
                {errors.dateOfBirth && <p className="text-danger-500 dark:text-danger-400 text-xs mt-1">{errors.dateOfBirth.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-slate-300 mb-1">
                  NIC {isNicRequired && '*'}
                </label>
                <input
                  type="text"
                  {...register('nic', { 
                    required: isNicRequired ? 'NIC is required for this category' : false,
                    pattern: {
                      value: /^([0-9]{9}[x|X|v|V]|[0-9]{12})$/,
                      message: 'Invalid NIC format'
                    }
                  })}
                  className={`w-full p-2.5 bg-card text-foreground border rounded-lg focus:ring-2 focus:ring-primary-500 transition-all outline-none ${errors.nic ? 'border-danger-500' : 'border-border'}`}
                  placeholder={isNicRequired ? "NIC Number required" : "Only if applicable"}
                />
                {errors.nic && <p className="text-danger-500 dark:text-danger-400 text-xs mt-1">{errors.nic.message}</p>}
                {!isNicRequired && <p className="text-secondary-400 text-xs mt-1">Leave blank if dependent is a minor without an NIC.</p>}
              </div>

              <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-secondary-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-primary-600 dark:bg-primary-500 text-white font-medium hover:bg-primary-700 dark:hover:bg-primary-400 shadow-sm transition"
                >
                  {editingId ? 'Save Changes' : 'Add Dependent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DependentsPage;
