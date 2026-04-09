import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiCalendar, FiClock, FiMapPin, FiUser, FiCheckCircle, FiXCircle, FiInfo, FiTrash2 } from 'react-icons/fi';
import appointmentApi from '../../api/appointmentApi';
import useAuthStore from '../../store/useAuthStore';
import { format } from 'date-fns';

const AppointmentsPage = () => {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      let data = [];
      if (user?.role === 'Public') {
        data = await appointmentApi.getMy();
      } else {
        data = await appointmentApi.getAll({});
      }
      setAppointments(data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentApi.cancel(id);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await appointmentApi.updateStatus(id, status);
      toast.success(`Marked as ${status}`);
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">Pending</span>;
      case 'Completed':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">Completed</span>;
      case 'Cancelled':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">Cancelled</span>;
      case 'No-Show':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200">No-Show</span>;
      default:
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your vaccination appointments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.length === 0 ? (
          <div className="col-span-full border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-500 bg-gray-50">
            <FiCalendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-900">No appointments found</p>
            <p>You have no scheduled appointments at the moment.</p>
          </div>
        ) : (
          appointments.map((apt) => (
            <div key={apt._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
              <div className="p-5 border-b border-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold">
                    #{apt.queueNumber}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{apt.patientLabel}</h3>
                    <p className="text-xs text-gray-500">Queue Number</p>
                  </div>
                </div>
                {getStatusBadge(apt.status)}
              </div>
              
              <div className="p-5 flex-1 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <FiMapPin className="text-gray-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{apt.clinicId?.hospital?.name || 'Hospital Not Found'}</p>
                    <p className="text-xs text-gray-500">{apt.clinicId?.vaccineType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiCalendar className="text-gray-400 shrink-0" />
                  <p className="text-sm text-gray-700">{apt.clinicId?.date ? format(new Date(apt.clinicId.date), 'dd MMM yyyy') : 'N/A'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <FiClock className="text-gray-400 shrink-0" />
                  <p className="text-sm text-gray-700">{apt.clinicId?.startTime} - {apt.clinicId?.endTime}</p>
                </div>
              </div>

              {apt.status === 'Pending' && (
                <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex gap-2">
                  {user?.role === 'Public' ? (
                    <button
                      onClick={() => handleCancel(apt._id)}
                      className="flex-1 py-2 text-sm font-medium rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      Cancel Appointment
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(apt._id, 'Completed')}
                        className="flex-1 py-1.5 text-sm font-medium rounded-xl text-green-700 bg-green-50 hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <FiCheckCircle /> Complete
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(apt._id, 'No-Show')}
                        className="flex-1 py-1.5 text-sm font-medium rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                      >
                        <FiXCircle /> No-Show
                      </button>
                      <button
                        onClick={() => handleCancel(apt._id)}
                        className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl"
                        title="Cancel"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
