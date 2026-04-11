import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
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
} from '../../components/common';
import { FiUsers, FiPlus, FiEdit2, FiTrash2, FiCalendar, FiUser } from 'react-icons/fi';
import dependentApi from '../../api/dependentApi';

const EMPTY_FORM = {
  name: '',
  nic: '',
  dateOfBirth: '',
  relationship: 'Child',
  gender: '',
};

const calculateAge = (dob) => {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const DependentsPage = () => {
  const [dependents, setDependents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDependent, setSelectedDependent] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // Computed NIC requirement from live formData
  const isNicRequired = formData.relationship === 'Spouse' || formData.relationship === 'Parent' || calculateAge(formData.dateOfBirth) >= 18;

  const fetchDependents = async () => {
    try {
      setIsLoading(true);
      const res = await dependentApi.getDependents();
      setDependents(Array.isArray(res) ? res : res.data || []);
    } catch {
      toast.error('Failed to load family members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDependents(); }, []);

  const handleOpenForm = (dep = null) => {
    if (dep) {
      const formattedDate = dep.dateOfBirth ? new Date(dep.dateOfBirth).toISOString().split('T')[0] : '';
      setFormData({ ...EMPTY_FORM, ...dep, dateOfBirth: formattedDate });
    } else {
      setFormData(EMPTY_FORM);
    }
    setSelectedDependent(dep);
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    // Validate NIC if required
    if (isNicRequired && !formData.nic) {
      toast.error('NIC is required for this dependent category');
      return;
    }
    if (formData.nic) {
      const nicPattern = /^([0-9]{9}[xXvV]|[0-9]{12})$/;
      if (!nicPattern.test(formData.nic)) {
        toast.error('Invalid NIC format');
        return;
      }
    }
    try {
      setIsSubmitting(true);
      if (selectedDependent) {
        await dependentApi.updateDependent(selectedDependent._id || selectedDependent.id, formData);
        toast.success('Dependent updated successfully');
      } else {
        await dependentApi.addDependent(formData);
        toast.success('Dependent added successfully');
      }
      setIsFormOpen(false);
      fetchDependents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save dependent');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await dependentApi.deleteDependent(selectedDependent._id || selectedDependent.id);
      toast.success('Dependent removed successfully');
      setIsDeleteOpen(false);
      fetchDependents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove dependent');
    } finally {
      setIsSubmitting(false);
    }
  };

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <FiUsers className="text-primary-600 dark:text-primary-400" />
            Family Members &amp; Dependents
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your registered family members for vaccination tracking.</p>
        </div>
        <Button onClick={() => handleOpenForm(null)} icon={FiPlus} variant="primary">
          Add Dependent
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <Spinner size="xl" />
          <p className="mt-4 text-slate-500 animate-pulse">Loading dependents...</p>
        </div>
      ) : dependents.length === 0 ? (
        <EmptyState
          icon={FiUsers}
          title="No dependents found"
          description="You haven't added any family members to your account yet."
          actionLabel="Add your first dependent"
          onAction={() => handleOpenForm(null)}
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    {['Name', 'Relationship', 'Date of Birth', 'NIC', 'Actions'].map(h => (
                      <th key={h} className={`px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {dependents.map(dep => (
                    <tr key={dep._id || dep.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold uppercase">
                            {dep.name.charAt(0)}
                          </div>
                          <div className="ml-4 text-sm font-medium text-foreground">{dep.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
                          {dep.relationship}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {new Date(dep.dateOfBirth).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {dep.nic || <span className="text-slate-400 dark:text-slate-600 italic">Not provided</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleOpenForm(dep)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded transition-colors"
                          aria-label="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedDependent(dep); setIsDeleteOpen(true); }}
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
        title={selectedDependent ? 'Edit Dependent' : 'Add Dependent'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <FormInput
            id="dep-name"
            label="Full Name"
            leftIcon={FiUser}
            value={formData.name}
            onChange={set('name')}
            placeholder="Jane Doe"
            required
          />

          <FormSelect
            id="dep-relationship"
            label="Relationship"
            value={formData.relationship}
            onChange={set('relationship')}
            options={[
              { label: 'Child', value: 'Child' },
              { label: 'Spouse', value: 'Spouse' },
              { label: 'Parent', value: 'Parent' },
              { label: 'Sibling', value: 'Sibling' },
            ]}
          />

          <FormSelect
            id="dep-gender"
            label="Gender"
            value={formData.gender}
            onChange={set('gender')}
            options={[
              { label: 'Select gender…', value: '' },
              { label: 'Male', value: 'Male' },
              { label: 'Female', value: 'Female' },
              { label: 'Other', value: 'Other' },
            ]}
          />

          <FormInput
            id="dep-dob"
            label="Date of Birth"
            type="date"
            leftIcon={FiCalendar}
            value={formData.dateOfBirth}
            onChange={set('dateOfBirth')}
            required
          />

          <FormInput
            id="dep-nic"
            label={`NIC${isNicRequired ? ' *' : ''}`}
            value={formData.nic}
            onChange={set('nic')}
            placeholder={isNicRequired ? 'NIC Number required' : 'Only if applicable'}
            helperText={isNicRequired ? undefined : 'Leave blank if dependent is a minor without an NIC.'}
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-4">
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {selectedDependent ? 'Save Changes' : 'Add Dependent'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Remove Dependent"
        description={`Are you sure you want to remove ${selectedDependent?.name} from your family members? This action cannot be undone.`}
        confirmLabel="Yes, Remove"
        intent="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default DependentsPage;
