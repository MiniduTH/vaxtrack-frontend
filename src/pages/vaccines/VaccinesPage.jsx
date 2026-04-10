import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiLayers, FiInfo, FiClock, FiImage, FiGrid, FiList } from 'react-icons/fi';
import vaccineApi from '../../api/vaccineApi';

const VaccinesPage = () => {
  const [vaccines, setVaccines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
  // Custom state just for displaying the selected image preview during upload
  const [imagePreview, setImagePreview] = useState(null);

  const fetchVaccines = async () => {
    try {
      setIsLoading(true);
      const data = await vaccineApi.getVaccines();
      setVaccines(Array.isArray(data) ? data : data.data || data.vaccines || []);
    } catch (error) {
      toast.error('Failed to load vaccines catalog');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccines();
  }, []);

  const openAddModal = () => {
    reset({ name: '', manufacturer: '', description: '', dosesRequired: 1, daysBetweenDoses: 0 });
    setEditingId(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (vaccine) => {
    reset({ 
      name: vaccine.name, 
      manufacturer: vaccine.manufacturer, 
      description: vaccine.description, 
      dosesRequired: vaccine.dosesRequired, 
      daysBetweenDoses: vaccine.daysBetweenDoses 
    });
    setEditingId(vaccine._id || vaccine.id);
    setImagePreview(vaccine.imageUrl || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('manufacturer', data.manufacturer);
      formData.append('description', data.description);
      formData.append('dosesRequired', data.dosesRequired);
      formData.append('daysBetweenDoses', data.daysBetweenDoses);
      
      // If an image file is selected, append it
      if (data.image && data.image[0]) {
        formData.append('image', data.image[0]);
      }

      if (editingId) {
        await vaccineApi.updateVaccine(editingId, formData);
        toast.success('Vaccine updated successfully');
      } else {
        await vaccineApi.addVaccine(formData);
        toast.success('Vaccine added successfully');
      }
      setIsModalOpen(false);
      fetchVaccines();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save vaccine';
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this vaccine?')) return;
    
    try {
      await vaccineApi.deleteVaccine(id);
      toast.success('Vaccine deleted');
      fetchVaccines();
    } catch (error) {
      toast.error('Failed to delete vaccine');
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiLayers className="mr-3 text-blue-600" />
            Vaccine Catalog
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage the master list of available vaccines and their schedules.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="bg-white border rounded-lg p-1 flex">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Grid View"
            >
              <FiGrid />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="List View"
            >
              <FiList />
            </button>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
          >
            <FiPlus className="mr-2" /> Add Vaccine
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : vaccines.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
          <FiLayers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No vaccines recorded</h3>
          <p className="mb-4 text-sm">The catalog is currently empty.</p>
          <button onClick={openAddModal} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            + Add to catalog
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vaccines.map((vax) => (
            <div key={vax._id || vax.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                {vax.imageUrl ? (
                  <img src={vax.imageUrl} alt={vax.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <FiImage size={40} className="mb-2 opacity-50" />
                    <span className="text-sm">No Image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(vax)} className="p-2 bg-white rounded-full text-indigo-600 shadow hover:bg-indigo-50">
                    <FiEdit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(vax._id || vax.id)} className="p-2 bg-white rounded-full text-red-600 shadow hover:bg-red-50">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 leading-tight">{vax.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{vax.manufacturer}</p>
                <div className="flex items-center space-x-4 mb-4 text-sm font-medium text-gray-700">
                  <div className="flex items-center bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md">
                    <FiLayers className="mr-1.5" size={14} /> {vax.dosesRequired} Doses
                  </div>
                  {vax.dosesRequired > 1 && (
                    <div className="flex items-center bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md">
                      <FiClock className="mr-1.5" size={14} /> {vax.daysBetweenDoses} Days gap
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mt-auto">
                  {vax.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vaccine</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Manufacturer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dosage Rules</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vaccines.map((vax) => (
                <tr key={vax._id || vax.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                         {vax.imageUrl ? (
                           <img src={vax.imageUrl} alt="" className="h-10 w-10 object-cover" />
                         ) : (
                           <FiImage className="text-gray-400" />
                         )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{vax.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {vax.manufacturer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{vax.dosesRequired} Doses required</div>
                    {vax.dosesRequired > 1 && (
                      <div className="text-xs text-gray-500">{vax.daysBetweenDoses} days apart</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openEditModal(vax)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      <FiEdit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(vax._id || vax.id)} className="text-red-500 hover:text-red-700">
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Setup for ADD / EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Vaccine' : 'Add New Vaccine'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="vaccine-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Image Upload Area */}
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vaccine Image</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl bg-gray-50 hover:bg-gray-100 transition relative">
                    <div className="space-y-1 text-center">
                      {imagePreview ? (
                        <div className="mb-4">
                          <img src={imagePreview} alt="Preview" className="mx-auto h-32 object-contain rounded-md" />
                        </div>
                      ) : (
                        <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                      )}
                      
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-2 py-1">
                          <span>Upload a file</span>
                          <input 
                            id="image-upload" 
                            type="file" 
                            accept="image/*" 
                            className="sr-only" 
                            {...register('image', {
                              onChange: handleImageChange
                            })} 
                          />
                        </label>
                        <p className="pl-1 py-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vaccine Name *</label>
                    <input
                      type="text"
                      {...register('name', { required: 'Name is required' })}
                      className={`w-full p-2.5 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="e.g. Pfizer-BioNTech COVID-19"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer *</label>
                    <input
                      type="text"
                      {...register('manufacturer', { required: 'Manufacturer is required' })}
                      className={`w-full p-2.5 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${errors.manufacturer ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="e.g. Pfizer"
                    />
                    {errors.manufacturer && <p className="text-red-500 text-xs mt-1">{errors.manufacturer.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Doses Required *</label>
                    <input
                      type="number"
                      min="1"
                      {...register('dosesRequired', { required: true, min: 1 })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Days Between Doses</label>
                    <input
                      type="number"
                      min="0"
                      {...register('daysBetweenDoses')}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 21"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave as 0 if only 1 dose is required.</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      rows={4}
                      {...register('description')}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description about what this vaccine covers and side effects..."
                    />
                  </div>
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="vaccine-form"
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-sm transition"
              >
                {editingId ? 'Save Changes' : 'Add Vaccine to Catalog'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccinesPage;
