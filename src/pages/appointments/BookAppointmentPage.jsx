import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiArrowRight, FiCheck, FiCalendar, FiClock,
  FiMapPin, FiUsers, FiGrid
} from 'react-icons/fi';
import { Button, Spinner, EmptyState, SearchBar } from '../../components/common';
import clinicApi from '../../api/clinicApi';
import dependentApi from '../../api/dependentApi';
import { bookAppointment } from '../../api/appointmentApi';
import { formatDate } from '../../utils/formatters';

// ─── Step indicator ──────────────────────────────────────────────────────────

const steps = [
  { id: 1, label: 'Choose Clinic' },
  { id: 2, label: 'Select Patient' },
  { id: 3, label: 'Confirm' },
  { id: 4, label: 'Done' },
];

const StepIndicator = ({ current }) => (
  <div className="flex items-center justify-center mb-8">
    {steps.map((step, idx) => (
      <React.Fragment key={step.id}>
        <div className="flex flex-col items-center">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-200
              ${current >= step.id
                ? 'bg-primary-600 border-primary-600 text-white'
                : 'border-secondary-300 dark:border-slate-600 text-secondary-400 dark:text-slate-500'
              }`}
          >
            {current > step.id ? <FiCheck className="w-4 h-4" /> : step.id}
          </div>
          <span className={`text-xs mt-1.5 font-medium hidden sm:block
            ${current >= step.id ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-400 dark:text-slate-500'}`}
          >
            {step.label}
          </span>
        </div>
        {idx < steps.length - 1 && (
          <div className={`flex-1 h-0.5 mx-2 transition-all duration-300
            ${current > step.id ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-slate-700'}`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─── Step 1: Browse & select clinic ─────────────────────────────────────────

const ClinicCard = ({ clinic, selected, onSelect }) => {
  const isFull = clinic.bookedCount >= clinic.capacity;
  const slotsLeft = Math.max(0, clinic.capacity - clinic.bookedCount);

  return (
    <button
      onClick={() => !isFull && onSelect(clinic)}
      disabled={isFull}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500
        ${selected
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
          : isFull
          ? 'border-secondary-200 dark:border-slate-700 opacity-50 cursor-not-allowed'
          : 'border-border hover:border-primary-300 hover:shadow-medium'
        }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {clinic.vaccineType}
          </h3>
          <p className="text-sm text-secondary-500 dark:text-slate-400 mt-0.5 truncate">
            {clinic.hospital?.name ?? 'Unknown Hospital'}
          </p>
        </div>
        {selected && (
          <span className="shrink-0 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
            <FiCheck className="w-3.5 h-3.5 text-white" />
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm">
        <span className="flex items-center gap-1.5 text-secondary-500 dark:text-slate-400">
          <FiCalendar className="w-3.5 h-3.5" />
          {formatDate(clinic.date)}
        </span>
        <span className="flex items-center gap-1.5 text-secondary-500 dark:text-slate-400">
          <FiClock className="w-3.5 h-3.5" />
          {clinic.startTime} – {clinic.endTime}
        </span>
        <span className={`flex items-center gap-1.5 font-medium
          ${isFull ? 'text-danger-500' : slotsLeft <= 3 ? 'text-warning-600' : 'text-success-600'}`}
        >
          <FiUsers className="w-3.5 h-3.5" />
          {isFull ? 'Full' : `${slotsLeft} slot${slotsLeft !== 1 ? 's' : ''} left`}
        </span>
      </div>
    </button>
  );
};

const StepChooseClinic = ({ selected, onSelect }) => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await clinicApi.getClinics();
        // Only show upcoming (date >= today) clinics
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = (res.data || []).filter(
          (c) => new Date(c.date) >= today
        );
        setClinics(upcoming);
      } catch {
        toast.error('Failed to load clinics');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = clinics.filter((c) =>
    !search ||
    c.vaccineType.toLowerCase().includes(search.toLowerCase()) ||
    (c.hospital?.name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-4">
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by vaccine or hospital…"
      />
      {filtered.length === 0 ? (
        <EmptyState message="No upcoming clinic sessions available." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
          {filtered.map((clinic) => (
            <ClinicCard
              key={clinic._id}
              clinic={clinic}
              selected={selected?._id === clinic._id}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Step 2: Select patient (self or dependent) ──────────────────────────────

const StepSelectPatient = ({ selectedPatient, onSelect }) => {
  const [dependents, setDependents] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await dependentApi.getDependents();
        setDependents(res.data || []);
      } catch {
        toast.error('Failed to load dependents');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const PatientOption = ({ id, label, sublabel }) => {
    const isSelected = selectedPatient?.id === id;
    return (
      <button
        onClick={() => onSelect({ id, label })}
        className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500
          ${isSelected
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
            : 'border-border hover:border-primary-300 hover:shadow-soft'
          }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">{label}</p>
            {sublabel && <p className="text-sm text-secondary-500 dark:text-slate-400 mt-0.5">{sublabel}</p>}
          </div>
          {isSelected && (
            <span className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
              <FiCheck className="w-3.5 h-3.5 text-white" />
            </span>
          )}
        </div>
      </button>
    );
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-3">
      <PatientOption id="self" label="Myself" sublabel="Book this appointment for yourself" />
      {dependents.map((dep) => (
        <PatientOption
          key={dep._id}
          id={dep._id}
          label={dep.name}
          sublabel={`${dep.relationship} · ${dep.ageDisplay ?? ''}`}
        />
      ))}
      {dependents.length === 0 && (
        <p className="text-sm text-secondary-500 dark:text-slate-400 text-center py-4">
          No dependents added yet. You can book for yourself.
        </p>
      )}
    </div>
  );
};

// ─── Step 3: Confirm booking ─────────────────────────────────────────────────

const StepConfirm = ({ clinic, patient }) => (
  <div className="space-y-4">
    <div className="bg-secondary-50 dark:bg-slate-800/50 rounded-2xl p-5 space-y-3">
      <h3 className="font-semibold text-foreground mb-4">Booking Summary</h3>

      <SummaryRow icon={FiGrid} label="Vaccine">
        {clinic?.vaccineType}
      </SummaryRow>
      <SummaryRow icon={FiMapPin} label="Hospital">
        {clinic?.hospital?.name ?? '—'}
      </SummaryRow>
      <SummaryRow icon={FiCalendar} label="Date">
        {formatDate(clinic?.date)}
      </SummaryRow>
      <SummaryRow icon={FiClock} label="Time">
        {clinic?.startTime} – {clinic?.endTime}
      </SummaryRow>
      <SummaryRow icon={FiUsers} label="Patient">
        {patient?.label}
      </SummaryRow>
    </div>
    <p className="text-sm text-secondary-500 dark:text-slate-400 text-center">
      A queue number and QR code will be generated after confirmation.
    </p>
  </div>
);

const SummaryRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-center gap-3">
    <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
    </span>
    <div>
      <p className="text-xs text-secondary-500 dark:text-slate-400">{label}</p>
      <p className="font-medium text-foreground text-sm">{children}</p>
    </div>
  </div>
);

// ─── Step 4: Success screen ──────────────────────────────────────────────────

const StepSuccess = ({ appointment }) => (
  <div className="text-center space-y-5 py-4">
    <div className="w-16 h-16 bg-success-100 dark:bg-success-500/10 rounded-full flex items-center justify-center mx-auto">
      <FiCheck className="w-8 h-8 text-success-500" />
    </div>
    <div>
      <h3 className="text-xl font-bold text-foreground">Appointment Booked!</h3>
      <p className="text-sm text-secondary-500 dark:text-slate-400 mt-1">
        Queue number <span className="font-bold text-foreground text-lg">#{appointment?.queueNumber}</span> assigned
      </p>
    </div>

    {appointment?.qrCodeUrl && (
      <div className="inline-block p-4 bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-soft">
        <img
          src={appointment.qrCodeUrl}
          alt="Appointment QR Code"
          className="w-40 h-40 mx-auto"
        />
        <p className="text-xs text-secondary-500 dark:text-slate-400 mt-2">
          Show this QR code at the clinic
        </p>
      </div>
    )}

    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
      <Link to="/dashboard/appointments">
        <Button variant="outline" size="md">View All Appointments</Button>
      </Link>
      <Link to="/dashboard/appointments/book">
        <Button variant="primary" size="md">Book Another</Button>
      </Link>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const [step, setStep]                 = useState(1);
  const [selectedClinic, setClinic]     = useState(null);
  const [selectedPatient, setPatient]   = useState(null);
  const [booked, setBooked]             = useState(null);
  const [submitting, setSubmitting]     = useState(false);

  const canGoNext = () => {
    if (step === 1) return !!selectedClinic;
    if (step === 2) return !!selectedPatient;
    return true;
  };

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const payload = {
        clinicId: selectedClinic._id,
        ...(selectedPatient.id !== 'self' && { dependentId: selectedPatient.id }),
      };
      const res = await bookAppointment(payload);
      setBooked(res.data.data);
      toast.success('Appointment booked successfully!');
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back nav */}
      {step < 4 && (
        <Link
          to="/dashboard/appointments"
          className="inline-flex items-center gap-1.5 text-sm text-secondary-500 hover:text-foreground dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          My Appointments
        </Link>
      )}

      {/* Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
        <h1 className="text-2xl font-bold text-foreground mb-6">Book an Appointment</h1>

        <StepIndicator current={step} />

        {/* Step content */}
        <div className="min-h-[300px]">
          {step === 1 && (
            <StepChooseClinic
              selected={selectedClinic}
              onSelect={setClinic}
            />
          )}
          {step === 2 && (
            <StepSelectPatient
              selectedPatient={selectedPatient}
              onSelect={setPatient}
            />
          )}
          {step === 3 && (
            <StepConfirm clinic={selectedClinic} patient={selectedPatient} />
          )}
          {step === 4 && (
            <StepSuccess appointment={booked} />
          )}
        </div>

        {/* Navigation buttons */}
        {step < 4 && (
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-border/60">
            <Button
              variant="outline"
              size="md"
              onClick={step === 1 ? () => navigate('/dashboard/appointments') : handleBack}
              icon={FiArrowLeft}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>

            {step < 3 ? (
              <Button
                variant="primary"
                size="md"
                disabled={!canGoNext()}
                onClick={handleNext}
              >
                Next
                <FiArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                isLoading={submitting}
                disabled={submitting}
                onClick={handleConfirm}
              >
                Confirm Booking
                <FiCheck className="ml-2 w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointmentPage;
