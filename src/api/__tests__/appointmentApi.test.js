import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as appointmentApi from '../appointmentApi';

vi.mock('../axiosInstance', () => ({
  default: {
    post:   vi.fn(),
    get:    vi.fn(),
    put:    vi.fn(),
    patch:  vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../axiosInstance';

describe('appointmentApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('bookAppointment — POSTs to /appointments', () => {
    const payload = { clinicId: 'clinic-1' };
    appointmentApi.bookAppointment(payload);
    expect(api.post).toHaveBeenCalledWith('/appointments', payload);
  });

  it('getMyAppointments — GETs /appointments/my', () => {
    appointmentApi.getMyAppointments();
    expect(api.get).toHaveBeenCalledWith('/appointments/my');
  });

  it('getAppointmentById — GETs /appointments/:id', () => {
    appointmentApi.getAppointmentById('appt-123');
    expect(api.get).toHaveBeenCalledWith('/appointments/appt-123');
  });

  it('cancelAppointment — PATCHes /appointments/:id/cancel', () => {
    appointmentApi.cancelAppointment('appt-123');
    expect(api.patch).toHaveBeenCalledWith('/appointments/appt-123/cancel');
  });

  it('updateAppointmentStatus — PATCHes with status body', () => {
    appointmentApi.updateAppointmentStatus('appt-123', 'Completed');
    expect(api.patch).toHaveBeenCalledWith(
      '/appointments/appt-123/status',
      { status: 'Completed' }
    );
  });

  it('updateAppointment — PUTs to /appointments/:id', () => {
    const data = { status: 'No-Show' };
    appointmentApi.updateAppointment('appt-123', data);
    expect(api.put).toHaveBeenCalledWith('/appointments/appt-123', data);
  });

  it('getAllAppointments — GETs /appointments with params', () => {
    const params = { status: 'Pending', clinicId: 'c1' };
    appointmentApi.getAllAppointments(params);
    expect(api.get).toHaveBeenCalledWith('/appointments', { params });
  });

  it('getClinicQueue — GETs /appointments/clinic/:clinicId', () => {
    appointmentApi.getClinicQueue('clinic-456');
    expect(api.get).toHaveBeenCalledWith('/appointments/clinic/clinic-456');
  });

  it('deleteAppointment — DELETEs /appointments/:id', () => {
    appointmentApi.deleteAppointment('appt-123');
    expect(api.delete).toHaveBeenCalledWith('/appointments/appt-123');
  });
});
