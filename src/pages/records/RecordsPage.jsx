import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import {
  getAllRecords,
  getMyRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
  getDueRecords,
} from '../../api/recordApi';
import { vaccineApi } from '../../api/vaccineApi';
import { batchApi } from '../../api/batchApi';
import { hospitalApi } from '../../api/hospitalApi';
import { formatDate } from '../../utils/formatters';
import { USER_ROLES } from '../../utils/constants';

import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Spinner,
  EmptyState,
  FormInput,
  FormSelect,
  Button,
  Modal,
  ConfirmDialog,
  StatusBadge,
} from '../../components/common';

// ─── Icons (inline SVGs) ────────────────────────────────────────────────────
const PlusIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const EyeIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PencilIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const TrashIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const ClockIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

// ─── Helper: Format date string for <input type="date"> ─────────────────────
const toInputDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

// ─── Detail Field Component ─────────────────────────────────────────────────
const DetailField = ({ label, value }) => (
  <div>
    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
      {label}
    </dt>
    <dd className="text-sm font-medium text-slate-900 dark:text-slate-100">
      {value || <span className="italic text-slate-400">N/A</span>}
    </dd>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// RECORDS PAGE
// ═════════════════════════════════════════════════════════════════════════════
const RecordsPage = () => {
  const user = useAuthStore((state) => state.user);
  const isStaffOrAdmin = user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.STAFF;

  // ── Core state ──────────────────────────────────────────────────────────
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Tab for Public users: 'records' or 'due' ───────────────────────────
  const [activeTab, setActiveTab] = useState('records');

  // ── Due vaccinations (Public users) ────────────────────────────────────
  const [dueData, setDueData] = useState({ upcoming: [], overdue: [] });
  const [dueLoading, setDueLoading] = useState(false);

  // ── Filters (Staff/Admin) ──────────────────────────────────────────────
  const [filters, setFilters] = useState({
    patientId: '',
    vaccineId: '',
    hospitalId: '',
  });

  // ── Lookup data for dropdowns ─────────────────────────────────────────
  const [allVaccines, setAllVaccines] = useState([]);
  const [allHospitals, setAllHospitals] = useState([]);
  const [filterVaccines, setFilterVaccines] = useState([]); // For filter dropdown

  // ── View detail modal ─────────────────────────────────────────────────
  const [detailRecord, setDetailRecord] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // ── Create modal (Staff/Admin) ────────────────────────────────────────
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    patientId: '',
    vaccineId: '',
    batchId: '',
    hospitalId: '',
    dependentName: '',
    dateAdministered: '',
    nextDoseDate: '',
  });
  const [createBatches, setCreateBatches] = useState([]);
  const [createHospitals, setCreateHospitals] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(false);

  // ── Patient search / validation ───────────────────────────────────────
  const [patientInput, setPatientInput] = useState('');         // what the user types (NIC or ID)
  const [patientSearching, setPatientSearching] = useState(false);
  const [patientMatch, setPatientMatch] = useState(null);       // { _id, name, nic } or null
  const [patientError, setPatientError] = useState('');

  // ── Edit modal (Staff/Admin) ──────────────────────────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    _id: '',
    dateAdministered: '',
    nextDoseDate: '',
    dependentName: '',
    batchId: '',
    hospitalId: '',
  });

  // ── Delete confirmation (Staff/Admin) ─────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ═════════════════════════════════════════════════════════════════════════
  // LOAD LOOKUP DATA (vaccines, hospitals) on mount
  // ═════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    const loadLookups = async () => {
      try {
        // Vaccines are public
        const vaccineRes = await vaccineApi.getVaccines();
        const vaccineList = vaccineRes?.data || vaccineRes || [];
        setAllVaccines(Array.isArray(vaccineList) ? vaccineList : []);
        setFilterVaccines(Array.isArray(vaccineList) ? vaccineList : []);
      } catch {
        // silently fail - dropdowns just won't populate
      }

      try {
        // Hospitals are public
        const hospitalRes = await hospitalApi.getHospitals();
        const hospitalList = hospitalRes?.data || hospitalRes || [];
        setAllHospitals(Array.isArray(hospitalList) ? hospitalList : []);
      } catch {
        // silently fail
      }
    };
    loadLookups();
  }, []);

  // ═════════════════════════════════════════════════════════════════════════
  // DATA FETCHING
  // ═════════════════════════════════════════════════════════════════════════

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (isStaffOrAdmin) {
        const activeFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v.trim() !== '')
        );
        data = await getAllRecords(activeFilters);
      } else {
        data = await getMyRecords();
      }

      const normalizedRecords = Array.isArray(data)
        ? data
        : Array.isArray(data?.records)
          ? data.records
          : Array.isArray(data?.data)
            ? data.data
            : [];

      setRecords(normalizedRecords);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch vaccination records.');
    } finally {
      setLoading(false);
    }
  }, [isStaffOrAdmin, filters]);

  const fetchDueRecords = useCallback(async () => {
    setDueLoading(true);
    try {
      const res = await getDueRecords();
      const data = res?.data || res;
      setDueData({
        upcoming: data?.upcoming?.records || [],
        overdue: data?.overdue?.records || [],
      });
    } catch {
      toast.error('Failed to load due vaccinations.');
    } finally {
      setDueLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    if (activeTab === 'due' && !isStaffOrAdmin) {
      fetchDueRecords();
    }
  }, [activeTab, isStaffOrAdmin, fetchDueRecords]);

  // ═════════════════════════════════════════════════════════════════════════
  // PATIENT SEARCH / VALIDATION (debounced)
  // ═════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    // Clear everything when input is empty
    if (!patientInput.trim()) {
      setPatientMatch(null);
      setPatientError('');
      setCreateForm((prev) => ({ ...prev, patientId: '' }));
      return;
    }

    const timer = setTimeout(async () => {
      setPatientSearching(true);
      setPatientError('');
      setPatientMatch(null);

      try {
        // Use the existing getAllRecords filter — it resolves NIC/name/ID
        // to actual users on the backend, and returns populated patientId
        const res = await getAllRecords({ patientId: patientInput.trim() });
        const data = res?.data || res || [];
        const recordList = Array.isArray(data) ? data : [];

        if (recordList.length > 0) {
          // Extract the first unique patient from results
          const patient = recordList[0]?.patientId;
          if (patient && typeof patient === 'object' && patient._id) {
            setPatientMatch({ _id: patient._id, name: patient.name, nic: patient.nic });
            setCreateForm((prev) => ({ ...prev, patientId: patient._id }));
          } else {
            setPatientError('Patient found in records but could not resolve details.');
          }
        } else {
          // No records found — but the patient might still exist (just has no records yet).
          // The backend's createRecord does User.findById, so a valid ObjectId still works.
          // Check if input looks like a valid 24-char hex ObjectId
          const isObjectId = /^[a-fA-F0-9]{24}$/.test(patientInput.trim());
          if (isObjectId) {
            // Trust it — set as patientId, backend will validate existence
            setCreateForm((prev) => ({ ...prev, patientId: patientInput.trim() }));
            setPatientMatch(null);
            setPatientError('');
          } else {
            setPatientError('No patient found with this NIC or ID. Please check and try again.');
            setCreateForm((prev) => ({ ...prev, patientId: '' }));
          }
        }
      } catch {
        // If error, still allow raw ObjectId
        const isObjectId = /^[a-fA-F0-9]{24}$/.test(patientInput.trim());
        if (isObjectId) {
          setCreateForm((prev) => ({ ...prev, patientId: patientInput.trim() }));
          setPatientError('');
        } else {
          setPatientError('Could not verify patient. Enter a valid Patient ID or NIC.');
          setCreateForm((prev) => ({ ...prev, patientId: '' }));
        }
      } finally {
        setPatientSearching(false);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientInput]);

  // ═════════════════════════════════════════════════════════════════════════
  // CASCADING DROPDOWNS: Vaccine → Batches → Hospitals (Create Modal)
  // ═════════════════════════════════════════════════════════════════════════

  // When vaccine changes in create form, fetch batches for that vaccine
  useEffect(() => {
    const fetchBatchesForVaccine = async () => {
      if (!createForm.vaccineId) {
        setCreateBatches([]);
        setCreateHospitals([]);
        setCreateForm((prev) => ({ ...prev, batchId: '', hospitalId: '' }));
        return;
      }

      setBatchesLoading(true);
      try {
        const res = await batchApi.getBatches({ vaccineId: createForm.vaccineId, status: 'Available' });
        const batches = res?.data || res || [];
        const batchList = Array.isArray(batches) ? batches : [];
        setCreateBatches(batchList);

        // Derive unique hospitals from these batches
        const hospitalMap = new Map();
        batchList.forEach((b) => {
          const hId = typeof b.hospitalId === 'object' ? b.hospitalId?._id : b.hospitalId;
          const hName = typeof b.hospitalId === 'object' ? b.hospitalId?.name : null;
          if (hId && !hospitalMap.has(hId)) {
            hospitalMap.set(hId, hName || hId);
          }
        });
        setCreateHospitals(
          Array.from(hospitalMap.entries()).map(([id, name]) => ({ _id: id, name }))
        );
      } catch {
        setCreateBatches([]);
        setCreateHospitals([]);
      } finally {
        setBatchesLoading(false);
      }

      // Reset downstream selections
      setCreateForm((prev) => ({ ...prev, batchId: '', hospitalId: '' }));
    };

    fetchBatchesForVaccine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createForm.vaccineId]);

  // When batch changes, auto-set hospital if the batch only belongs to one hospital
  useEffect(() => {
    if (!createForm.batchId) return;
    const selectedBatch = createBatches.find(
      (b) => b._id === createForm.batchId
    );
    if (selectedBatch) {
      const hId = typeof selectedBatch.hospitalId === 'object'
        ? selectedBatch.hospitalId?._id
        : selectedBatch.hospitalId;
      if (hId) {
        setCreateForm((prev) => ({ ...prev, hospitalId: hId }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createForm.batchId]);

  // ═════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═════════════════════════════════════════════════════════════════════════

  // ── Filters ─────────────────────────────────────────────────────────────
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchRecords();
  };

  const clearFilters = () => {
    setFilters({ patientId: '', vaccineId: '', hospitalId: '' });
    setTimeout(fetchRecords, 0);
  };

  // ── View detail ─────────────────────────────────────────────────────────
  const handleViewRecord = async (id) => {
    setShowDetailModal(true);
    setDetailLoading(true);
    try {
      const res = await getRecordById(id);
      setDetailRecord(res?.data || res);
    } catch {
      toast.error('Failed to load record details.');
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Create ──────────────────────────────────────────────────────────────
  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    // Validate patient is resolved
    if (!createForm.patientId) {
      toast.error('Please enter a valid Patient ID or NIC.');
      return;
    }

    setCreateLoading(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(createForm).filter(([_, v]) => v.trim() !== '')
      );
      await createRecord(payload);
      toast.success('Vaccination record created successfully!');
      setShowCreateModal(false);
      setCreateForm({ patientId: '', vaccineId: '', batchId: '', hospitalId: '', dependentName: '', dateAdministered: '', nextDoseDate: '' });
      setPatientInput('');
      setPatientMatch(null);
      setPatientError('');
      setCreateBatches([]);
      setCreateHospitals([]);
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create record.');
    } finally {
      setCreateLoading(false);
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────────
  const openEditModal = (record) => {
    setEditForm({
      _id: record._id,
      dateAdministered: toInputDate(record.dateAdministered),
      nextDoseDate: toInputDate(record.nextDoseDate),
      dependentName: record.dependentName || '',
      batchId: typeof record.batchId === 'object' ? record.batchId?._id || '' : record.batchId || '',
      hospitalId: typeof record.hospitalId === 'object' ? record.hospitalId?._id || '' : record.hospitalId || '',
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const { _id, ...updates } = editForm;
      const payload = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== '')
      );
      await updateRecord(_id, payload);
      toast.success('Record updated successfully!');
      setShowEditModal(false);
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update record.');
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────
  const openDeleteConfirm = (record) => {
    setDeleteTarget(record);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteRecord(deleteTarget._id);
      toast.success('Record deleted successfully!');
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete record.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  // HELPER: resolve display text from possibly-populated or raw ID fields
  // ═════════════════════════════════════════════════════════════════════════
  const vaccineDisplay = (v) => {
    if (!v) return 'Unknown';
    if (typeof v === 'object') return v.name || v._id;
    return v;
  };

  const hospitalDisplay = (h) => {
    if (!h) return 'Unknown';
    if (typeof h === 'object') return h.name || h._id;
    return h;
  };

  // ═════════════════════════════════════════════════════════════════════════
  // BUILD SELECT OPTIONS
  // ═════════════════════════════════════════════════════════════════════════
  const vaccineOptions = allVaccines.map((v) => ({
    value: v._id,
    label: `${v.name} — ${v.manufacturer}`,
  }));

  const filterVaccineOptions = [
    { value: '', label: 'All Vaccines' },
    ...filterVaccines.map((v) => ({ value: v._id, label: v.name })),
  ];

  const filterHospitalOptions = [
    { value: '', label: 'All Hospitals' },
    ...allHospitals.map((h) => ({ value: h._id, label: h.name })),
  ];

  const batchOptions = createBatches.map((b) => {
    const batchNum = b.batchNumber || b._id;
    const hospName = typeof b.hospitalId === 'object' ? b.hospitalId?.name : '';
    const qty = b.quantity != null ? ` (Qty: ${b.quantity})` : '';
    return {
      value: b._id,
      label: `${batchNum}${hospName ? ` — ${hospName}` : ''}${qty}`,
    };
  });

  const hospitalOptionsFromBatches = createHospitals.map((h) => ({
    value: h._id,
    label: h.name,
  }));

  const editHospitalOptions = allHospitals.map((h) => ({
    value: h._id,
    label: h.name,
  }));

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER: Due Vaccinations (Public users)
  // ═════════════════════════════════════════════════════════════════════════
  const renderDueSection = (title, items, variant) => {
    const isDanger = variant === 'overdue';
    if (!items || items.length === 0) {
      return (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isDanger ? <ExclamationIcon className="w-5 h-5 text-danger-500" /> : <ClockIcon className="w-5 h-5 text-primary-500" />}
              {title}
            </CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-slate-500 italic">No {variant === 'overdue' ? 'overdue' : 'upcoming'} vaccinations.</p>
          </CardBody>
        </Card>
      );
    }

    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {isDanger ? <ExclamationIcon className="w-5 h-5 text-danger-500" /> : <ClockIcon className="w-5 h-5 text-primary-500" />}
              {title}
            </CardTitle>
            <StatusBadge status={isDanger ? 'danger' : 'info'} size="sm">
              {items.length} {items.length === 1 ? 'record' : 'records'}
            </StatusBadge>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {items.map((record) => (
              <div
                key={record._id}
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                onClick={() => handleViewRecord(record._id)}
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {vaccineDisplay(record.vaccineId)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {hospitalDisplay(record.hospitalId)}
                    {record.dependentName && (
                      <span className="ml-2 text-primary-600 dark:text-primary-400">
                        • {record.dependentName}
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={isDanger ? 'danger' : 'warning'} size="sm">
                    {isDanger ? 'Overdue' : 'Due'}: {formatDate(record.nextDoseDate)}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  };

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isStaffOrAdmin ? 'All Vaccination Records' : 'My Vaccination Records'}
          </h1>
          {!loading && activeTab === 'records' && (
            <StatusBadge status="info" size="sm">
              {records.length} {records.length === 1 ? 'record' : 'records'}
            </StatusBadge>
          )}
        </div>

        {isStaffOrAdmin && (
          <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Record
          </Button>
        )}
      </div>

      {/* ── Tabs for Public users ───────────────────────────────────────── */}
      {!isStaffOrAdmin && (
        <div className="flex space-x-1 rounded-xl bg-slate-100 dark:bg-slate-800/50 p-1 max-w-md">
          <button
            onClick={() => setActiveTab('records')}
            className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors focus:outline-none ${
              activeTab === 'records'
                ? 'bg-white dark:bg-slate-700 text-primary-700 dark:text-primary-400 shadow'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            My Records
          </button>
          <button
            onClick={() => setActiveTab('due')}
            className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors focus:outline-none ${
              activeTab === 'due'
                ? 'bg-white dark:bg-slate-700 text-primary-700 dark:text-primary-400 shadow'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Due Vaccinations
          </button>
        </div>
      )}

      {/* ── Due Vaccinations Tab Content ─────────────────────────────────── */}
      {!isStaffOrAdmin && activeTab === 'due' && (
        dueLoading ? (
          <div className="py-12 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div>
            {renderDueSection('Overdue Vaccinations', dueData.overdue, 'overdue')}
            {renderDueSection('Upcoming Vaccinations', dueData.upcoming, 'upcoming')}
          </div>
        )
      )}

      {/* ── Records Tab Content (shared for Staff and Public-"records" tab) */}
      {(isStaffOrAdmin || activeTab === 'records') && (
        <>
          {/* ── Filters (Staff/Admin only) ───────────────────────────────── */}
          {isStaffOrAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Filter Records</CardTitle>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleApplyFilters} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                  <FormInput
                    label="Patient (Name / NIC / ID)"
                    name="patientId"
                    value={filters.patientId}
                    onChange={handleFilterChange}
                    placeholder="e.g. John or 200012345679"
                  />
                  <FormSelect
                    label="Vaccine"
                    name="vaccineId"
                    value={filters.vaccineId}
                    onChange={handleFilterChange}
                    options={filterVaccineOptions}
                  />
                  <FormSelect
                    label="Hospital"
                    name="hospitalId"
                    value={filters.hospitalId}
                    onChange={handleFilterChange}
                    options={filterHospitalOptions}
                  />
                  <div className="flex space-x-2 lg:col-span-2">
                    <Button type="submit" variant="primary" className="w-full">
                      Apply
                    </Button>
                    <Button type="button" variant="outline" onClick={clearFilters} className="w-full">
                      Clear
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}

          {/* ── Records Table / States ──────────────────────────────────── */}
          {loading ? (
            <div className="py-12 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="bg-danger-50 text-danger-700 p-4 rounded-xl border border-danger-200">
              {error}
            </div>
          ) : records.length === 0 ? (
            <EmptyState
              title="No records found"
              description={isStaffOrAdmin ? 'Try adjusting your filters.' : 'You do not have any vaccination records yet.'}
            />
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      {isStaffOrAdmin && (
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Patient
                        </th>
                      )}
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Dependent
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Vaccine
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Hospital
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Date Administered
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Next Dose
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                    {records.map((record) => (
                      <tr key={record._id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        {isStaffOrAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                            {record.patientId?.name || 'Unknown'} <br />
                            <span className="text-xs text-slate-500">{record.patientId?.nic || ''}</span>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                          {record.dependentName && record.dependentName.trim() ? record.dependentName : <span className="text-slate-400 italic">Self</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                          {vaccineDisplay(record.vaccineId)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                          {hospitalDisplay(record.hospitalId)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                          {formatDate(record.dateAdministered)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                          {record.nextDoseDate ? formatDate(record.nextDoseDate) : <span className="text-slate-400 italic">N/A</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              id={`view-record-${record._id}`}
                              onClick={() => handleViewRecord(record._id)}
                              className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 dark:hover:text-primary-400 transition-colors"
                              title="View details"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            {isStaffOrAdmin && (
                              <>
                                <button
                                  id={`edit-record-${record._id}`}
                                  onClick={() => openEditModal(record)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-warning-600 hover:bg-warning-50 dark:hover:bg-warning-500/10 dark:hover:text-warning-400 transition-colors"
                                  title="Edit record"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  id={`delete-record-${record._id}`}
                                  onClick={() => openDeleteConfirm(record)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 dark:hover:text-danger-400 transition-colors"
                                  title="Delete record"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODALS                                                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* ── View Detail Modal ──────────────────────────────────────────── */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setDetailRecord(null); }}
        title="Record Details"
        size="lg"
      >
        {detailLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : detailRecord ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <DetailField
              label="Patient"
              value={
                typeof detailRecord.patientId === 'object'
                  ? `${detailRecord.patientId?.name || 'Unknown'} (${detailRecord.patientId?.nic || ''})`
                  : detailRecord.patientId
              }
            />
            <DetailField label="Dependent" value={detailRecord.dependentName || 'Self'} />
            <DetailField label="Vaccine" value={vaccineDisplay(detailRecord.vaccineId)} />
            <DetailField
              label="Batch ID"
              value={typeof detailRecord.batchId === 'object' ? detailRecord.batchId?._id : detailRecord.batchId}
            />
            <DetailField label="Hospital" value={hospitalDisplay(detailRecord.hospitalId)} />
            <DetailField
              label="Hospital Location"
              value={
                typeof detailRecord.hospitalId === 'object'
                  ? `${detailRecord.hospitalId?.city || ''}, ${detailRecord.hospitalId?.district || ''}`
                  : null
              }
            />
            <DetailField label="Date Administered" value={formatDate(detailRecord.dateAdministered)} />
            <DetailField
              label="Next Dose Due"
              value={detailRecord.nextDoseDate ? formatDate(detailRecord.nextDoseDate) : 'N/A'}
            />
            <DetailField
              label="Administered By"
              value={
                typeof detailRecord.administeredBy === 'object'
                  ? detailRecord.administeredBy?.name
                  : detailRecord.administeredBy
              }
            />
            <DetailField label="Record ID" value={detailRecord._id} />
          </div>
        ) : (
          <p className="text-sm text-slate-500">No record data available.</p>
        )}
      </Modal>

      {/* ── Create Record Modal (Staff/Admin) ─────────────────────────── */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setCreateBatches([]); setCreateHospitals([]); }}
        title="Create Vaccination Record"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreateModal(false)} disabled={createLoading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateSubmit}
              isLoading={createLoading}
            >
              Create Record
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} id="create-record-form" className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* ── Patient Search Field ──────────────────────────────────── */}
          <div className="sm:col-span-2">
            <div className="relative">
              <FormInput
                label="Patient (ID or NIC) *"
                name="patientSearch"
                value={patientInput}
                onChange={(e) => setPatientInput(e.target.value)}
                placeholder="Enter Patient NIC (e.g. 200012345679) or Patient ID"
                error={patientError || undefined}
                helperText={!patientError && !patientMatch && !patientSearching ? 'Type a Patient NIC or ID to search' : undefined}
              />
              {patientSearching && (
                <div className="absolute right-3 top-9">
                  <Spinner size="sm" />
                </div>
              )}
            </div>

            {/* Patient match confirmation */}
            {patientMatch && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20">
                <svg className="w-5 h-5 text-success-600 dark:text-success-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <span className="font-semibold text-success-800 dark:text-success-300">{patientMatch.name}</span>
                  <span className="text-success-600 dark:text-success-400 ml-2">NIC: {patientMatch.nic}</span>
                </div>
              </div>
            )}

            {/* Show resolved ObjectId when input is a raw ObjectId (no match banner needed) */}
            {!patientMatch && !patientError && !patientSearching && createForm.patientId && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20">
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                </svg>
                <span className="text-sm text-primary-700 dark:text-primary-300">Patient ID: {createForm.patientId} (will be verified on submit)</span>
              </div>
            )}
          </div>

          <FormSelect
            label="Vaccine *"
            name="vaccineId"
            value={createForm.vaccineId}
            onChange={handleCreateChange}
            placeholder="Select a vaccine"
            options={vaccineOptions}
            required
          />

          <div className="relative">
            <FormSelect
              label="Batch *"
              name="batchId"
              value={createForm.batchId}
              onChange={handleCreateChange}
              placeholder={
                !createForm.vaccineId
                  ? 'Select a vaccine first'
                  : batchesLoading
                    ? 'Loading batches...'
                    : createBatches.length === 0
                      ? 'No available batches'
                      : 'Select a batch'
              }
              options={batchOptions}
              disabled={!createForm.vaccineId || batchesLoading || createBatches.length === 0}
              required
            />
            {batchesLoading && (
              <div className="absolute right-3 top-9">
                <Spinner size="sm" />
              </div>
            )}
          </div>

          <FormSelect
            label="Hospital *"
            name="hospitalId"
            value={createForm.hospitalId}
            onChange={handleCreateChange}
            placeholder={
              !createForm.vaccineId
                ? 'Select a vaccine first'
                : createHospitals.length === 0
                  ? 'No hospitals for this vaccine'
                  : 'Select a hospital'
            }
            options={hospitalOptionsFromBatches}
            disabled={!createForm.vaccineId || createHospitals.length === 0}
            required
          />

          <FormInput
            label="Date Administered"
            name="dateAdministered"
            type="date"
            value={createForm.dateAdministered}
            onChange={handleCreateChange}
            helperText="Defaults to today if left empty"
          />

          <FormInput
            label="Next Dose Date"
            name="nextDoseDate"
            type="date"
            value={createForm.nextDoseDate}
            onChange={handleCreateChange}
            helperText="Set via Edit after creation if needed"
          />

          <FormInput
            label="Dependent Name"
            name="dependentName"
            value={createForm.dependentName}
            onChange={handleCreateChange}
            placeholder="Leave blank if for the patient"
            helperText="Optional: fill if vaccinating a dependent"
            className="sm:col-span-2"
          />
        </form>
      </Modal>

      {/* ── Edit Record Modal (Staff/Admin) ───────────────────────────── */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Vaccination Record"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowEditModal(false)} disabled={editLoading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleEditSubmit}
              isLoading={editLoading}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit} id="edit-record-form" className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormInput
            label="Date Administered"
            name="dateAdministered"
            type="date"
            value={editForm.dateAdministered}
            onChange={handleEditChange}
          />
          <FormInput
            label="Next Dose Date"
            name="nextDoseDate"
            type="date"
            value={editForm.nextDoseDate}
            onChange={handleEditChange}
          />
          <FormInput
            label="Dependent Name"
            name="dependentName"
            value={editForm.dependentName}
            onChange={handleEditChange}
            placeholder="Leave blank if for the patient"
          />
          <FormInput
            label="Batch ID"
            name="batchId"
            value={editForm.batchId}
            onChange={handleEditChange}
            placeholder="MongoDB ObjectId of the batch"
          />
          <FormSelect
            label="Hospital"
            name="hospitalId"
            value={editForm.hospitalId}
            onChange={handleEditChange}
            placeholder="Select a hospital"
            options={editHospitalOptions}
            className="sm:col-span-2"
          />
        </form>
      </Modal>

      {/* ── Delete Confirmation ──────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Vaccination Record"
        description="Are you sure you want to delete this vaccination record? This will also remove all associated side effect reports. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        intent="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default RecordsPage;
