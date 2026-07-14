import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, AlertCircle, RefreshCw, XCircle } from 'lucide-react';
import api from '../../api/axios';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/patient?page=0&size=50');
      setAppointments(response.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Confirm cancellation of this appointment?')) return;
    try {
      await api.patch(`/appointments/${id}/cancel`);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data || 'Failed to cancel appointment');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-slate-900">Appointments Registry</h2>
        <p className="text-xs text-slate-500 mt-0.5">Manage scheduled bookings and consult statuses</p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 bg-danger-light border border-red-100 text-danger p-3.5 rounded-lg text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="card-base p-12 text-center">
          <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">No scheduled slots</h3>
          <p className="text-slate-500 text-xs mt-1 mb-4">Book a consultation with our hospital specialists</p>
          <a href="/patient/doctors" className="btn-primary py-2 text-xs">Find Specialist</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {appointments.map((apt) => {
            const time = new Date(apt.appointmentTime);
            const isPending = apt.status === 'BOOKED' || apt.status === 'CONFIRMED';
            return (
              <div key={apt.id} className="card-base p-5 flex flex-col justify-between hover:border-slate-300 transition-colors">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                      apt.status === 'COMPLETED' ? 'bg-success-light text-success border-green-150' :
                      apt.status === 'CANCELLED' ? 'bg-danger-light text-danger border-red-150' :
                      'bg-blue-55/10 text-primary border-blue-150'
                    }`}>
                      {apt.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">ID: #{apt.id}</span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-800 text-sm">{apt.doctorName}</h3>
                    <div className="text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {apt.reason && (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 text-xs text-slate-600">
                      <span className="text-[10px] text-slate-450 uppercase font-bold block mb-0.5">Symptoms Notes</span>
                      {apt.reason}
                    </div>
                  )}
                </div>

                {isPending && (
                  <button
                    onClick={() => handleCancel(apt.id)}
                    className="w-full mt-4 py-2 bg-white hover:bg-red-50/50 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-danger text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500" />
                    Cancel Appointment
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
