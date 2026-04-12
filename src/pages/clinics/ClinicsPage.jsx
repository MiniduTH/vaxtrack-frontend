import React, { useState, useMemo, useEffect } from 'react';
import {
  Button,
  Card,
  CardBody,
  FormInput,
  FormSelect,
  Modal,
  ConfirmDialog,
  StatusBadge,
  EmptyState,
  Spinner,
  Pagination
} from '../../components/common';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiClock, FiActivity, FiUsers } from 'react-icons/fi';
import clinicApi from '../../api/clinicApi';
import hospitalApi from '../../api/hospitalApi';
import vaccineApi from '../../api/vaccineApi';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';

const ClinicsPage = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin';
  const canWrite = isAdmin || user?.role === 'HospitalStaff';

  const [clinics, setClinics] = useState([]);
  const [hospitalsList, setHospitalsList] = useState([]);
  const [vaccinesList, setVaccinesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState('');
  const [filterHospital, setFilterHospital] = useState('');
  const [filterVaccine, setFilterVaccine] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [formData, setFormData] = useState({
    hospital: '',
    date: '',
    startTime: '',
    endTime: '',
    capacity: 0,
    vaccineType: ''
  });

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const response = await clinicApi.getClinics();
      if (response.success) {
        setClinics(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch clinics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const response = await hospitalApi.getHospitals();
      if (response.success) {
        setHospitalsList(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch hospitals list', error);
    }
  };

  const fetchVaccines = async () => {
    try {
      const data = await vaccineApi.getVaccines();
      const list = Array.isArray(data) ? data : data.data || data.vaccines || [];
      setVaccinesList(list);
    } catch (error) {
      console.error('Failed to fetch vaccines list', error);
    }
  };

  useEffect(() => {
    fetchClinics();
    fetchHospitals();
    fetchVaccines();
  }, []);

  const hospitalOptionsForFilter = useMemo(() => {
    const names = [...new Set(clinics.map(c => c.hospital?.name).filter(Boolean))];
    return [{ label: 'All Hospitals', value: '' }, ...names.map(name => ({ label: name, value: name }))];
  }, [clinics]);

  const vaccineOptionsForFilter = useMemo(() => {
    const vaccines = [...new Set(clinics.map(c => c.vaccineType).filter(Boolean))];
    return [{ label: 'All Vaccines', value: '' }, ...vaccines.map(v => ({ label: v, value: v }))];
  }, [clinics]);

  const filteredClinics = useMemo(() => {
    return clinics.filter(c => {
      // Handle the case where c.date might be an ISO string
      const clinicDate = c.date ? c.date.split('T')[0] : '';
      const matchDate = searchDate ? clinicDate === searchDate : true;
      const matchHospital = filterHospital ? c.hospital?.name === filterHospital : true;
      const matchVaccine = filterVaccine ? c.vaccineType === filterVaccine : true;
      return matchDate && matchHospital && matchVaccine;
    });
  }, [clinics, searchDate, filterHospital, filterVaccine]);

  // Reset to first page when filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [searchDate, filterHospital, filterVaccine]);

  const paginatedClinics = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClinics.slice(start, start + itemsPerPage);
  }, [filteredClinics, currentPage, itemsPerPage]);

  const handleOpenForm = (clinic = null) => {
    if (clinic) {
      setFormData({
        hospital: clinic.hospital?._id || clinic.hospital || '',
        date: clinic.date ? clinic.date.split('T')[0] : '',
        startTime: clinic.startTime,
        endTime: clinic.endTime,
        capacity: clinic.capacity,
        vaccineType: clinic.vaccineType
      });
    } else {
      setFormData({ hospital: '', date: '', startTime: '', endTime: '', capacity: 50, vaccineType: vaccinesList[0]?.name || '' });
    }
    setSelectedClinic(clinic);
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (selectedClinic) {
        const response = await clinicApi.updateClinic(selectedClinic._id, formData);
        if (response.success) {
          toast.success('Clinic updated successfully');
          fetchClinics();
        }
      } else {
        const response = await clinicApi.createClinic(formData);
        if (response.success) {
          toast.success('Clinic scheduled successfully');
          fetchClinics();
        }
      }
      setIsFormOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save clinic');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      const response = await clinicApi.deleteClinic(selectedClinic._id);
      if (response.success) {
        toast.success('Clinic deleted successfully');
        fetchClinics();
      }
      setIsDeleteOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete clinic');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for capacity indicator
  const getCapacityColor = (booked, capacity) => {
    const ratio = booked / capacity;
    if (ratio >= 1) return 'bg-danger-500'; // Full
    if (ratio > 0.8) return 'bg-warning-500'; // Almost full
    return 'bg-success-500';
  };

  return (
    <div className="space-y-6">

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Vaccination Clinics</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage scheduled sessions and monitor local capacity.</p>
        </div>
        {canWrite && (
          <Button onClick={() => handleOpenForm(null)} icon={FiPlus} variant="primary">
            Schedule Clinic
          </Button>
        )}
      </div>

      {/* Filters Card */}
      <Card>
        <CardBody className="p-4 sm:p-6 pb-2">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <FormInput
                id="filter-date"
                type="date"
                label="Filter by Date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>
            <div className="w-full md:w-1/3">
              <FormSelect
                id="filter-hospital"
                label="Filter by Hospital"
                value={filterHospital}
                onChange={(e) => setFilterHospital(e.target.value)}
                options={hospitalOptionsForFilter}
              />
            </div>
            <div className="w-full md:w-1/3">
              <FormSelect
                id="filter-vaccine"
                label="Filter by Vaccine"
                value={filterVaccine}
                onChange={(e) => setFilterVaccine(e.target.value)}
                options={vaccineOptionsForFilter}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <Spinner size="xl" />
          <p className="mt-4 text-slate-500 animate-pulse">Loading clinics...</p>
        </div>
      ) : filteredClinics.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedClinics.map(clinic => {
              const isFull = clinic.bookedCount >= clinic.capacity;
              const utilization = Math.min(Math.round((clinic.bookedCount / clinic.capacity) * 100), 100);

              return (
                <Card key={clinic._id} className="hover:shadow-medium transition-all group overflow-visible relative">

                  {/* Absolute status badge overlapping map */}
                  <div className="absolute -top-3 -right-3 z-10 transition-transform group-hover:scale-105">
                    <StatusBadge
                      status={isFull ? 'danger' : utilization > 80 ? 'warning' : 'success'}
                      size="md"
                      className="shadow-md font-bold"
                    >
                      {isFull ? 'SESSION FULL' : 'AVAILABLE'}
                    </StatusBadge>
                  </div>

                  <CardBody className="flex flex-col h-full pt-5">
                    <div className="mb-4">
                      <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                        <FiActivity className="text-primary-500" /> {clinic.vaccineType} VACCINE
                      </p>
                      <h3 className="text-lg font-bold text-foreground line-clamp-1" title={clinic.hospital?.name || 'Unknown Hospital'}>
                        {clinic.hospital?.name || 'Unknown Hospital'}
                      </h3>
                    </div>

                    {/* Schedule Details block */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <div className="flex flex-col">
                        <div className="text-xs text-slate-500 flex items-center gap-1"><FiCalendar /> Date</div>
                        <div className="font-semibold text-foreground mt-0.5">{clinic.date ? clinic.date.split('T')[0] : 'N/A'}</div>
                      </div>
                      <div className="flex flex-col border-l border-border pl-3">
                        <div className="text-xs text-slate-500 flex items-center gap-1"><FiClock /> Schedule</div>
                        <div className="font-semibold text-foreground mt-0.5">{clinic.startTime} - {clinic.endTime}</div>
                      </div>
                      <div className="flex flex-col col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="text-xs text-slate-500 flex items-center gap-1"><FiActivity /> Vaccine Manufacturer</div>
                        <div className="font-semibold text-primary-600 dark:text-primary-400 mt-0.5">{clinic.vaccineType || 'Not Specified'}</div>
                      </div>
                    </div>

                    {/* Capacity Indicator Widget */}
                    <div className="mb-6 flex-1 flex flex-col justify-end">
                      <div className="flex justify-between text-sm mb-1.5 font-medium">
                        <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1"><FiUsers size={14} /> Appointments</span>
                        <span className={isFull ? 'text-danger-600 dark:text-danger-400 font-bold' : 'text-foreground'}>
                          {clinic.bookedCount} / {clinic.capacity}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden shadow-inner">
                        <div
                          className={`h-2.5 rounded-full ${getCapacityColor(clinic.bookedCount, clinic.capacity)} transition-all duration-500`}
                          style={{ width: `${utilization}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border mt-auto flex justify-end gap-2">
                      {canWrite && (
                        <Button variant="outline" size="sm" onClick={() => handleOpenForm(clinic)} icon={FiEdit2}>
                          Edit
                        </Button>
                      )}
                      {isAdmin && (
                        <Button variant="danger" size="sm" onClick={() => { setSelectedClinic(clinic); setIsDeleteOpen(true); }} icon={FiTrash2}>
                          Delete
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredClinics.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <EmptyState
          icon={FiCalendar}
          title="No clinics found"
          description="There are no scheduled clinics matching your criteria."
          actionLabel="Clear Filters"
          onAction={() => { setSearchDate(''); setFilterHospital(''); setFilterVaccine(''); }}
        />
      )}

      {/* --- ADD/EDIT FORM --- */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedClinic ? "Edit Clinic Schedule" : "Schedule New Clinic"}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-5">

          <FormSelect
            id="clinic-hospital"
            label="Hospital"
            value={formData.hospital}
            onChange={e => setFormData({ ...formData, hospital: e.target.value })}
            placeholder="Select Hospital"
            required
            options={hospitalsList.map(h => ({ label: h.name, value: h._id }))}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FormInput id="clinic-date" label="Date" type="date" min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
            <FormInput id="start-time" label="Start Time" type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} required />
            <FormInput id="end-time" label="End Time" type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <FormInput id="capacity" label="Total Capacity" type="number" min="1" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })} required helperText="Max number of slots." />
            <FormSelect id="vaccine" label="Vaccine Type" value={formData.vaccineType} onChange={e => setFormData({ ...formData, vaccineType: e.target.value })} required options={vaccinesList.map(vax => ({
              label: `${vax.name} (${vax.manufacturer})`,
              value: vax.name
            }))} placeholder="Select Manufacturer" />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-4">
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>Confirm Schedule</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Scheduled Clinic"
        description={`Are you sure you want to cancel the ${selectedClinic?.date ? selectedClinic.date.split('T')[0] : ''} clinic at ${selectedClinic?.hospital?.name || ''}? Active bookings may need to be refunded/rescheduled.`}
        confirmLabel="Cancel Clinic"
        intent="danger"
        isLoading={isSubmitting}
      />

    </div>
  );
};

export default ClinicsPage;
