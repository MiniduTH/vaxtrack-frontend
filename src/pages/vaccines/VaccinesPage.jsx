import React, { useState, useEffect, useMemo } from 'react';
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
  SearchBar,
  Pagination,
} from '../../components/common';
import { FiPlus, FiEdit2, FiTrash2, FiLayers, FiInfo, FiClock, FiImage, FiGrid, FiList } from 'react-icons/fi';
import vaccineApi from '../../api/vaccineApi';
import useAuthStore from '../../store/useAuthStore';

const EMPTY_FORM = {
  name: '',
  manufacturer: '',
  description: '',
  dosesRequired: 1,
  daysBetweenDoses: 0,
  image: null,
};

const VaccinesPage = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin';
  
  const [vaccines, setVaccines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [manufacturerFilter, setManufacturerFilter] = useState('all');

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 8 : 6;

  const manufacturerOptions = useMemo(() => {
    const list = [...new Set(vaccines.map(v => v.manufacturer?.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    return ['all', ...list];
  }, [vaccines]);

  const filteredVaccines = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    return vaccines.filter(v => {
      const matchSearch = !normalized || [v.name, v.manufacturer, v.description].filter(Boolean).some(s => s.toLowerCase().includes(normalized));
      const matchMfr = manufacturerFilter === 'all' || v.manufacturer === manufacturerFilter;
      return matchSearch && matchMfr;
    });
  }, [vaccines, searchQuery, manufacturerFilter]);

  const paginatedVaccines = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVaccines.slice(start, start + itemsPerPage);
  }, [filteredVaccines, currentPage, itemsPerPage]);

  useEffect(() => { setCurrentPage(1); }, [viewMode, searchQuery, manufacturerFilter]);

  const fetchVaccines = async () => {
    try {
      setIsLoading(true);
      const data = await vaccineApi.getVaccines();
      setVaccines(Array.isArray(data) ? data : data.data || data.vaccines || []);
    } catch {
      toast.error('Failed to load vaccines catalog');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchVaccines(); }, []);

  const handleOpenForm = (vaccine = null) => {
    if (vaccine) {
      setFormData({
        name: vaccine.name,
        manufacturer: vaccine.manufacturer,
        description: vaccine.description,
        dosesRequired: vaccine.dosesRequired,
        daysBetweenDoses: vaccine.daysBetweenDoses,
        image: null,
      });
      setImagePreview(vaccine.imageUrl || null);
    } else {
      setFormData(EMPTY_FORM);
      setImagePreview(null);
    }
    setSelectedVaccine(vaccine);
    setIsFormOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('manufacturer', formData.manufacturer);
      fd.append('description', formData.description);
      fd.append('dosesRequired', formData.dosesRequired);
      fd.append('daysBetweenDoses', formData.daysBetweenDoses);
      if (formData.image) fd.append('image', formData.image);

      if (selectedVaccine) {
        await vaccineApi.updateVaccine(selectedVaccine._id || selectedVaccine.id, fd);
        toast.success('Vaccine updated successfully');
      } else {
        await vaccineApi.addVaccine(fd);
        toast.success('Vaccine added successfully');
      }
      setIsFormOpen(false);
      fetchVaccines();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save vaccine');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await vaccineApi.deleteVaccine(selectedVaccine._id || selectedVaccine.id);
      toast.success('Vaccine deleted successfully');
      setIsDeleteOpen(false);
      fetchVaccines();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete vaccine');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mfrSelectOptions = manufacturerOptions.map(m => ({ label: m === 'all' ? 'All manufacturers' : m, value: m }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <FiLayers className="text-primary-600 dark:text-primary-400" />
            Vaccine Catalog
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage available vaccines and schedules.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-card border border-border rounded-lg p-1 flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              title="Grid View"
            >
              <FiGrid />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              title="List View"
            >
              <FiList />
            </button>
          </div>
          {isAdmin && (
            <Button onClick={() => handleOpenForm(null)} icon={FiPlus} variant="primary">
              Add Vaccine
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filter */}
      {!isLoading && vaccines.length > 0 && (
        <Card>
          <CardBody className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              <div className="flex-1">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search vaccines by name, manufacturer, or description"
                />
              </div>
              <div className="w-full lg:w-72">
                <FormSelect
                  id="manufacturer-filter"
                  label="Filter by manufacturer"
                  value={manufacturerFilter}
                  onChange={(e) => setManufacturerFilter(e.target.value)}
                  options={mfrSelectOptions}
                />
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Showing {filteredVaccines.length} of {vaccines.length} vaccines
            </p>
          </CardBody>
        </Card>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <Spinner size="xl" />
          <p className="mt-4 text-slate-500 animate-pulse">Loading vaccines...</p>
        </div>
      ) : vaccines.length === 0 ? (
        <EmptyState
          icon={FiLayers}
          title="No vaccines recorded"
          description="The catalog is currently empty. Add your first vaccine to get started."
          actionLabel={isAdmin ? "Add Vaccine" : null}
          onAction={isAdmin ? () => handleOpenForm(null) : null}
        />
      ) : filteredVaccines.length === 0 ? (
        <EmptyState
          icon={FiInfo}
          title="No vaccines match your filters"
          description="Try a different search term or switch the manufacturer filter."
          actionLabel="Clear Filters"
          onAction={() => { setSearchQuery(''); setManufacturerFilter('all'); }}
        />
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedVaccines.map(vax => (
                <Card key={vax._id || vax.id} className="hover:shadow-medium transition-shadow group flex flex-col overflow-hidden">
                  <div className="h-48 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                    {vax.imageUrl ? (
                      <img src={vax.imageUrl} alt={vax.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                        <FiImage size={40} className="mb-2 opacity-50" />
                        <span className="text-sm">No Image</span>
                      </div>
                    )}
                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenForm(vax)}
                          className="p-2 bg-card rounded-full text-primary-600 dark:text-primary-400 shadow hover:bg-primary-50 dark:hover:bg-primary-500/10"
                          aria-label="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => { setSelectedVaccine(vax); setIsDeleteOpen(true); }}
                          className="p-2 bg-card rounded-full text-danger-600 dark:text-danger-400 shadow hover:bg-danger-50 dark:hover:bg-danger-500/10"
                          aria-label="Delete"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <CardBody className="flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-foreground leading-tight">{vax.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{vax.manufacturer}</p>
                    <div className="flex items-center gap-3 mb-4 text-sm font-medium flex-wrap">
                      <div className="flex items-center bg-blue-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-2.5 py-1 rounded-md">
                        <FiLayers className="mr-1.5" size={14} /> {vax.dosesRequired} Doses
                      </div>
                      {vax.dosesRequired > 1 && (
                        <div className="flex items-center bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-md">
                          <FiClock className="mr-1.5" size={14} /> {vax.daysBetweenDoses}d gap
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-auto">{vax.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                      <tr>
                        {['Vaccine', 'Manufacturer', 'Dosage Rules', 'Actions'].map(h => (
                          <th key={h} className={`px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {paginatedVaccines.map(vax => (
                        <tr key={vax._id || vax.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden flex items-center justify-center">
                                {vax.imageUrl ? (
                                  <img src={vax.imageUrl} alt="" className="h-10 w-10 object-cover" />
                                ) : (
                                  <FiImage className="text-slate-400 dark:text-slate-500" />
                                )}
                              </div>
                              <div className="ml-4 text-sm font-bold text-foreground">{vax.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{vax.manufacturer}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-foreground">{vax.dosesRequired} Doses required</div>
                            {vax.dosesRequired > 1 && <div className="text-xs text-slate-500 dark:text-slate-400">{vax.daysBetweenDoses} days apart</div>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => handleOpenForm(vax)}
                                  className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded transition-colors"
                                  aria-label="Edit"
                                >
                                  <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => { setSelectedVaccine(vax); setIsDeleteOpen(true); }}
                                  className="p-1.5 text-slate-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/30 rounded transition-colors ml-1"
                                  aria-label="Delete"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredVaccines.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedVaccine ? 'Edit Vaccine' : 'Add New Vaccine'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Vaccine Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="mb-4">
                    <img src={imagePreview} alt="Preview" className="mx-auto h-32 object-contain rounded-md" />
                  </div>
                ) : (
                  <FiImage className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
                )}
                <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                  <label htmlFor="image-upload" className="relative cursor-pointer bg-card rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 px-2 py-1">
                    <span>Upload a file</span>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="pl-1 py-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 5MB</p>
              </div>
            </div>
          </div>

          <FormInput
            id="vaccine-name"
            label="Vaccine Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Pfizer-BioNTech COVID-19"
            required
          />

          <FormInput
            id="vaccine-manufacturer"
            label="Manufacturer"
            value={formData.manufacturer}
            onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
            placeholder="e.g. Pfizer"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput
              id="vaccine-doses"
              label="Doses Required"
              type="number"
              min="1"
              value={formData.dosesRequired}
              onChange={e => setFormData({ ...formData, dosesRequired: e.target.value })}
              required
            />
            <FormInput
              id="vaccine-days"
              label="Days Between Doses"
              type="number"
              min="0"
              value={formData.daysBetweenDoses}
              onChange={e => setFormData({ ...formData, daysBetweenDoses: e.target.value })}
              helperText="Leave as 0 if only 1 dose is required."
              placeholder="e.g. 21"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 bg-card text-foreground border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              placeholder="Brief description about what this vaccine covers..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-4">
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {selectedVaccine ? 'Save Changes' : 'Add Vaccine to Catalog'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Vaccine"
        description={`Are you sure you want to permanently delete "${selectedVaccine?.name}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        intent="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default VaccinesPage;