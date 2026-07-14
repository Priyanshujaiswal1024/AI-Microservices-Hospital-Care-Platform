import React, { useState, useEffect } from 'react';
import { Calendar, Users, Activity, CheckSquare, RefreshCw, User } from 'lucide-react';
import api from '../../api/axios';

export default function DoctorDashboard() {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const aptRes = await api.get('/appointments/doctor');
        setAppointments((aptRes.data || []).slice(0, 5));

        const booked = (aptRes.data || []).filter(a => a.status === 'BOOKED').length;
        const completed = (aptRes.data || []).filter(a => a.status === 'COMPLETED').length;
        setStats({
          totalPatients: new Set((aptRes.data || []).map(a => a.patientId)).size,
          bookedAppointments: booked,
          completedAppointments: completed,
        });
      } catch (err) {
        console.error('Error fetching doctor dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

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
        <h2 className="text-xl font-bold text-slate-900">Physician Overview</h2>
        <p className="text-xs text-slate-500 mt-0.5">Quick summary of patient metrics and session queues</p>
      </div>

      {/* Grid Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-base p-5 flex items-center gap-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="w-10 h-10 bg-slate-100 border border-slate-200 text-slate-650 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider block">Total Patients</span>
              <span className="text-xl font-black text-slate-800 mt-0.5 block">{stats.totalPatients}</span>
            </div>
          </div>

          <div className="card-base p-5 flex items-center gap-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="w-10 h-10 bg-slate-100 border border-slate-200 text-slate-650 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider block">Booked Slots</span>
              <span className="text-xl font-black text-slate-800 mt-0.5 block">{stats.bookedAppointments}</span>
            </div>
          </div>

          <div className="card-base p-5 flex items-center gap-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="w-10 h-10 bg-slate-100 border border-slate-200 text-slate-650 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider block">Completed Consults</span>
              <span className="text-xl font-black text-slate-800 mt-0.5 block">{stats.completedAppointments}</span>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Snapshot */}
      <div className="card-base p-6 space-y-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        <h3 className="font-bold text-slate-850 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <Calendar className="w-4 h-4 text-emerald-600" /> Consultations Schedule
        </h3>

        {appointments.length === 0 ? (
          <div className="text-center py-4 text-slate-400 text-xs">No active sessions mapped for today</div>
        ) : (
          <div className="space-y-2">
            {appointments.map((apt) => {
              const time = new Date(apt.appointmentTime);
              
              // Fallback for empty/null patient name (e.g. older Google OAuth accounts)
              const patientDisplayName = apt.patientName?.trim() || apt.patientEmail || `Patient #${apt.patientId}`;
              const firstLetter = patientDisplayName.charAt(0).toUpperCase();

              return (
                <div key={apt.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200/60 hover:border-slate-350 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-200/60 border border-slate-300 rounded-lg flex items-center justify-center font-bold text-slate-700 text-sm">
                      {firstLetter || <User className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{patientDisplayName}</h4>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                    apt.status === 'COMPLETED' ? 'bg-success-light text-success border-green-150' :
                    apt.status === 'CANCELLED' ? 'bg-danger-light text-danger border-red-150' :
                    'bg-blue-50 text-primary border-blue-100'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
