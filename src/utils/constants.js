// USER ROLES
export const USER_ROLES = {
  ADMIN: 'Admin',
  STAFF: 'HospitalStaff',
  USER: 'User',
};

// SIDE EFFECT SEVERITY LEVELS
export const SEVERITY_LEVELS = {
  MILD: 'Mild',
  MODERATE: 'Moderate',
  SEVERE: 'Severe',
};

// APPOINTMENT STATUSES
export const APPOINTMENT_STATUSES = {
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No_Show',
};

// HTTP METHODS
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

// NAVIGATION CONFIGURATION
export const NAV_CONFIG = [
  { name: 'Dashboard', path: '/dashboard', roles: ['Admin', 'HospitalStaff', 'User'] },
  { name: 'My Records', path: '/records/my', roles: ['User'] },
  { name: 'Vaccination History', path: '/history', roles: ['User'] },
  { name: 'Report Side Effect', path: '/side-effects/report', roles: ['User'] },
  { name: 'Dependents', path: '/dependents', roles: ['User'] },
  { name: 'Appointments', path: '/appointments', roles: ['User'] },
  
  { name: 'All Records', path: '/records', roles: ['Admin', 'HospitalStaff'] },
  { name: 'Monitor Side Effects', path: '/side-effects/admin', roles: ['Admin', 'HospitalStaff'] },
  { name: 'Queue Board', path: '/queue', roles: ['HospitalStaff'] },
  
  { name: 'Hospitals', path: '/admin/hospitals', roles: ['Admin'] },
  { name: 'Clinics', path: '/admin/clinics', roles: ['Admin'] },
  { name: 'Vaccines', path: '/admin/vaccines', roles: ['Admin'] },
  { name: 'Batches', path: '/admin/batches', roles: ['Admin'] },
];
