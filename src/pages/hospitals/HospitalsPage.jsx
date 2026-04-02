import React, { useState, useMemo, useEffect } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  FormInput,
  FormSelect,
  Modal,
  ConfirmDialog,
  StatusBadge,
  EmptyState,
  Spinner
} from '../../components/common';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiSearch, FiFilter, FiNavigation } from 'react-icons/fi';
import hospitalApi from '../../api/hospitalApi';
import geocodeApi from '../../api/geocodeApi';
import { toast } from 'react-hot-toast';

const HospitalsPage = () => {
  // State
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');

  // Modals State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected Item Operations
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [formData, setFormData] = useState({ name: '', address: '', city: '', district: '', contactNumber: '', latitude: '', longitude: '' });

  // Fetch Hospitals
  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await hospitalApi.getHospitals();
      if (response.success) {
        setHospitals(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch hospitals');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  // Filter derivations
  const cities = useMemo(() => [...new Set(hospitals.map(h => h.city))], [hospitals]);
  const districts = useMemo(() => [...new Set(hospitals.map(h => h.district))], [hospitals]);

  const filteredHospitals = useMemo(() => {
    return hospitals.filter(h => {
      const matchSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCity = filterCity ? h.city === filterCity : true;
      const matchDistrict = filterDistrict ? h.district === filterDistrict : true;
      return matchSearch && matchCity && matchDistrict;
    });
  }, [hospitals, searchQuery, filterCity, filterDistrict]);

  // Handlers
  const handleOpenForm = (hospital = null) => {
    if (hospital) {
      setFormData({
        name: hospital.name,
        address: hospital.address,
        city: hospital.city,
        district: hospital.district,
        contactNumber: hospital.contactNumber,
        latitude: hospital.latitude || '',
        longitude: hospital.longitude || ''
      });
    } else {
      setFormData({ name: '', address: '', city: '', district: '', contactNumber: '', latitude: '', longitude: '' });
    }
    setSelectedHospital(hospital);
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (selectedHospital) {
        // Edit
        const response = await hospitalApi.updateHospital(selectedHospital._id, formData);
        if (response.success) {
          toast.success('Hospital updated successfully');
          fetchHospitals();
        }
      } else {
        // Add
        const response = await hospitalApi.createHospital(formData);
        if (response.success) {
          toast.success('Hospital added successfully');
          fetchHospitals();
        }
      }
      setIsFormOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save hospital');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      const response = await hospitalApi.deleteHospital(selectedHospital._id);
      if (response.success) {
        toast.success('Hospital deleted successfully');
        fetchHospitals();
      }
      setIsDeleteOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete hospital');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoGeocode = async () => {
    if (!formData.address || !formData.city) {
      toast.error('Please enter address and city first');
      return;
    }
    
    try {
      setIsGeocoding(true);
      const response = await geocodeApi.geocode(formData.address, formData.city);
      if (response.success && response.data) {
        setFormData(prev => ({
          ...prev,
          latitude: response.data.latitude,
          longitude: response.data.longitude
        }));
        toast.success('Coordinates fetched successfully!');
      }
    } catch (error) {
      toast.error('Failed to auto-geocode. Please enter coordinates manually.');
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Hospitals</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage hospital directory, geocoding details, and filters.</p>
        </div>
        <Button onClick={() => handleOpenForm(null)} icon={FiPlus} variant="primary">
          Add Hospital
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <CardBody className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <FormInput
                placeholder="Search hospitals by name or address..."
                leftIcon={FiSearch}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <FormSelect
                id="filter-city"
                placeholder="Filter by City"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                options={[{ label: 'All Cities', value: '' }, ...cities.map(c => ({ label: c, value: c }))]}
              />
            </div>
            <div className="w-full md:w-64">
              <FormSelect
                id="filter-district"
                placeholder="Filter by District"
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                options={[{ label: 'All Districts', value: '' }, ...districts.map(d => ({ label: d, value: d }))]}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Data List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <Spinner size="xl" />
          <p className="mt-4 text-slate-500 animate-pulse">Loading hospitals...</p>
        </div>
      ) : filteredHospitals.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredHospitals.map(hospital => (
            <Card key={hospital._id} className="hover:shadow-medium transition-shadow duration-200">
              <CardBody className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-foreground line-clamp-1" title={hospital.name}>
                    {hospital.name}
                  </h3>
                  <div className="flex gap-1 ml-2 shrink-0">
                    <button
                      onClick={() => handleOpenForm(hospital)}
                      className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded transition-colors"
                      aria-label="Edit"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setSelectedHospital(hospital); setIsDeleteOpen(true); }}
                      className="p-1.5 text-slate-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/30 rounded transition-colors"
                      aria-label="Delete"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-6 flex-1">
                  <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300 text-sm">
                    <FiMapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                    <span>{hospital.address}, {hospital.city} ({hospital.district})</span>
                  </div>
                  <div className="text-sm text-slate-500 font-mono mt-2">
                    Lat: <span className="text-slate-700 dark:text-slate-300">{hospital.latitude}</span> | Lng: <span className="text-slate-700 dark:text-slate-300">{hospital.longitude}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border mt-auto flex justify-between items-center">
                  <StatusBadge status="success" size="sm">Active</StatusBadge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setSelectedHospital(hospital); setIsDetailOpen(true); }}
                  >
                    View Map Details
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FiMapPin}
          title="No hospitals found"
          description={searchQuery || filterCity || filterDistrict ? "No hospitals matched your filters. Try adjusting your search parameters." : "Get started by adding a new hospital to your directory."}
          actionLabel={!searchQuery && !filterCity && !filterDistrict ? "Add Hospital" : "Clear Filters"}
          onAction={() => {
            if (!searchQuery && !filterCity && !filterDistrict) handleOpenForm(null);
            else { setSearchQuery(''); setFilterCity(''); setFilterDistrict(''); }
          }}
        />
      )}

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedHospital ? "Edit Hospital" : "Add New Hospital"}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <FormInput
            id="hospital-name"
            label="Hospital Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput id="city" label="City" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} required />
            <FormInput id="district" label="District" value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} required />
          </div>
          <FormInput id="address" label="Full Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required />
          <FormInput id="contact" label="Contact Number" type="tel" value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} required />
          
          <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Location Coordinates</p>
                <p className="text-xs text-slate-500">Latitude & Longitude</p>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                icon={FiNavigation} 
                onClick={handleAutoGeocode}
                isLoading={isGeocoding}
                disabled={isSubmitting}
              >
                Auto-Geocode
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput id="lat" label="Latitude" type="number" step="any" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })} />
              <FormInput id="lng" label="Longitude" type="number" step="any" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })} />
            </div>
            <p className="text-[10px] text-slate-500 italic px-1">Tip: Click Auto-Geocode to automatically fetch coordinates from the address.</p>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-4">
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>Save Hospital</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Hospital"
        description={`Are you sure you want to delete ${selectedHospital?.name}? This action cannot be undone and will cascade delete nested clinics.`}
        confirmLabel="Yes, Delete"
        intent="danger"
        isLoading={isSubmitting}
      />

      {/* Geocode Display Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Hospital Location Details"
        size="lg"
      >
        {selectedHospital && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-lg">{selectedHospital.name}</h3>
                <p className="text-slate-500 dark:text-slate-400">{selectedHospital.address}</p>
              </div>
              <div className="bg-primary-50 dark:bg-primary-500/10 p-3 rounded-lg border border-primary-100 dark:border-primary-900">
                <p className="text-xs text-primary-600 font-bold uppercase tracking-wider mb-1">Coordinates</p>
                <div className="font-mono text-sm">{selectedHospital.latitude}, {selectedHospital.longitude}</div>
              </div>
            </div>

            {/* Visual Static Map Placeholder*/}
            <div className="w-full h-[300px] bg-slate-200 dark:bg-slate-800 rounded-xl mt-4 relative overflow-hidden flex items-center justify-center group cursor-pointer border border-border">
              <div className="absolute inset-0 bg-blue-100 dark:bg-slate-800 opacity-50" style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              <div className="relative z-10 flex flex-col items-center p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg shadow-soft text-center group-hover:scale-105 transition-transform duration-300">
                <FiMapPin className="w-8 h-8 text-danger-500 mb-2 drop-shadow-md animate-bounce" />
                <p className="font-semibold">{selectedHospital.name}</p>
                <p className="text-xs text-slate-500 mt-1">Map integration active on ({selectedHospital.latitude},{selectedHospital.longitude})</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default HospitalsPage;
