import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import toast from 'react-hot-toast';
import {
  FiCamera, FiCheckCircle, FiXCircle,
  FiRefreshCw, FiUser, FiHash, FiCalendar, FiClock
} from 'react-icons/fi';
import { Button, StatusBadge, Spinner } from '../../components/common';
import api from '../../api/axiosInstance';
import { formatDate } from '../../utils/formatters';

// ─── Main Page ────────────────────────────────────────────────────────────────

const QRScannerPage = () => {
  const [scanning,  setScanning]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [updating,  setUpdating]  = useState(false);
  const [appt,      setAppt]      = useState(null);

  // ── handle a decoded QR result ────────────────────────────────────────────
  const handleScan = async (results) => {
    if (!results?.length) return;
    const decodedText = results[0].rawValue;
    setScanning(false);   // stop camera immediately

    let payload;
    try {
      payload = JSON.parse(decodedText);
    } catch {
      toast.error('Invalid QR — not a VaxTrack appointment QR.');
      return;
    }

    if (!payload.appointmentId) {
      toast.error('QR code does not contain a valid appointment ID.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/appointments/${payload.appointmentId}`);
      setAppt(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Appointment not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err) => {
    // Suppress transient per-frame errors; only surface real ones
    if (err?.name !== 'NotFoundException') {
      toast.error('Camera error: ' + (err?.message ?? 'Unknown error'));
      setScanning(false);
    }
  };

  // ── update appointment status ─────────────────────────────────────────────
  const handleUpdateStatus = async (newStatus) => {
    if (!appt) return;
    setUpdating(true);
    try {
      const res = await api.patch(`/appointments/${appt._id}/status`, { status: newStatus });
      setAppt(res.data.data);
      toast.success(`Appointment marked as ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const reset = () => {
    setAppt(null);
    setScanning(true);
  };

  // ─── render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FiCamera className="text-primary-500" />
          QR Appointment Scanner
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Scan a patient's appointment QR code to verify and update their status.
        </p>
      </div>

      {/* ── Camera / Scanner ── */}
      {!appt && !loading && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          {scanning ? (
            <>
              {/* React-managed scanner — no direct DOM manipulation */}
              <div className="rounded-xl overflow-hidden border border-border">
                <Scanner
                  onScan={handleScan}
                  onError={handleError}
                  constraints={{ facingMode: 'environment' }}
                  styles={{
                    container: { width: '100%' },
                    video: { width: '100%', borderRadius: '0.75rem' },
                  }}
                  components={{ audio: false }}
                />
              </div>
              <div className="flex justify-center">
                <Button variant="outline" icon={FiXCircle} onClick={() => setScanning(false)}>
                  Stop Camera
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center gap-4 py-10">
                <div className="w-20 h-20 rounded-2xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
                  <FiCamera className="w-10 h-10 text-primary-500" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">Camera is off</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Press Start Camera and point at a patient's appointment QR
                  </p>
                </div>
                <Button variant="primary" icon={FiCamera} onClick={() => setScanning(true)}>
                  Start Camera
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-slate-500">Looking up appointment…</p>
        </div>
      )}

      {/* ── Appointment result card ── */}
      {appt && !loading && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Appointment Found</h2>
            <StatusBadge status={
              appt.status === 'Completed' ? 'success'
              : appt.status === 'Cancelled' ? 'neutral'
              : appt.status === 'No-Show'  ? 'danger'
              : 'warning'
            }>
              {appt.status}
            </StatusBadge>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoRow icon={FiUser}        label="Patient">
              {appt.dependentId
                ? `${appt.dependentId.name} (Dependent)`
                : appt.userId?.name ?? 'Unknown'}
            </InfoRow>
            <InfoRow icon={FiHash}        label="Queue Number">#{appt.queueNumber}</InfoRow>
            <InfoRow icon={FiCalendar}    label="Date">
              {appt.clinicId?.date ? formatDate(appt.clinicId.date) : '—'}
            </InfoRow>
            <InfoRow icon={FiClock}       label="Session">
              {appt.clinicId?.startTime
                ? `${appt.clinicId.startTime} – ${appt.clinicId.endTime}`
                : '—'}
            </InfoRow>
            <InfoRow icon={FiCheckCircle} label="Vaccine">
              {appt.clinicId?.vaccineType ?? '—'}
            </InfoRow>
          </div>

          {/* Action buttons */}
          {appt.status === 'Pending' ? (
            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
              <Button
                variant="primary"
                className="flex-1"
                icon={FiCheckCircle}
                isLoading={updating}
                onClick={() => handleUpdateStatus('Completed')}
              >
                Mark as Completed
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                icon={FiXCircle}
                isLoading={updating}
                onClick={() => handleUpdateStatus('No-Show')}
              >
                Mark as No-Show
              </Button>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center pt-2 border-t border-border">
              This appointment is already <span className="font-semibold">{appt.status}</span> — no further action needed.
            </p>
          )}

          <div className="flex justify-center">
            <Button variant="ghost" size="sm" icon={FiRefreshCw} onClick={reset}>
              Scan Another QR
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Helper row component ─────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
    <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
    </span>
    <div>
      <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
      <p className="font-semibold text-foreground text-sm mt-0.5">{children}</p>
    </div>
  </div>
);

export default QRScannerPage;
