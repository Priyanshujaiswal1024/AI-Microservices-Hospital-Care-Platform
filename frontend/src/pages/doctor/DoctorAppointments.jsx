import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Clipboard, RefreshCw, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../../api/axios';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [fetchingPatient, setFetchingPatient] = useState(false);
  const navigate = useNavigate();

  const fetchPatientDetails = async (patientId) => {
    setFetchingPatient(true);
    setPatientDetails(null);
    try {
      const response = await api.get(`/patients/${patientId}`);
      setPatientDetails(response.data);
    } catch (err) {
      console.error("Error fetching patient details:", err);
      alert("Failed to load patient profile details.");
    } finally {
      setFetchingPatient(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/doctor');
      setAppointments(response.data || []);
    } catch (err) {
      console.error("Error fetching doctor appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDownloadRx = async (aptId) => {
    try {
      const rxRes = await api.get(`/prescriptions/appointment/${aptId}`);
      if (!rxRes.data) {
        alert("Prescription not found for this appointment.");
        return;
      }
      const pdfRes = await api.get(`/prescriptions/${rxRes.data.id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([pdfRes.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription-${rxRes.data.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert('Failed to download prescription PDF.');
    }
  };

  const handleDownloadRecord = async (aptId) => {
    try {
      const recRes = await api.get(`/medical-records/appointment/${aptId}`);
      if (!recRes.data) {
        alert("Medical record not found for this appointment.");
        return;
      }
      const pdfRes = await api.get(`/medical-records/${recRes.data.id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([pdfRes.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `medical-record-${recRes.data.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert('Failed to download medical record PDF.');
    }
  };

  const handleComplete = async (id) => {
    if (!window.confirm("Mark this appointment visit as completed?")) return;
    try {
      await api.patch(`/appointments/${id}/complete`);
      fetchAppointments();
    } catch (err) {
      alert('Failed to complete appointment');
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
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-6 font-sans">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-slate-900">Clinical Booking Calendar</h2>
        <p className="text-xs text-slate-500 mt-0.5">Process patient queues, verify symptoms, and checkout sessions</p>
      </div>

      {appointments.length === 0 ? (
        <div className="card-base p-12 text-center bg-white border border-slate-200 rounded-xl">
          <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">No scheduled visits</h3>
          <p className="text-slate-500 text-xs mt-1">Booked appointment sheets populate here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {appointments.map((apt) => {
            const time = new Date(apt.appointmentTime);
            const isCompleted = apt.status === 'COMPLETED';
            const isCancelled = apt.status === 'CANCELLED';
            
            // Fallback for empty patientName (important for Google OAuth or older records)
            const patientDisplayName = apt.patientName?.trim() || apt.patientEmail || `Patient #${apt.patientId}`;

            return (
              <div key={apt.id} className="card-base p-5 flex flex-col justify-between hover:border-slate-350 transition-all bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full border ${
                      isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-250' :
                      isCancelled ? 'bg-red-50 text-red-700 border-red-250' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {apt.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono font-bold">ID: #{apt.id}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setSelectedPatientId(apt.patientId); fetchPatientDetails(apt.patientId); }}
                        className="flex items-center gap-2 text-left hover:text-blue-600 group/name transition-colors"
                        title="Click to view patient profile & address info"
                      >
                        <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-650 group-hover/name:bg-blue-50 group-hover/name:text-blue-600 transition-colors">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm hover:underline">{patientDisplayName}</h3>
                      </button>
                    </div>
                    
                    <div className="text-xs text-slate-500 space-y-1 pl-8">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{time.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {apt.reason && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-650 mt-2">
                      <span className="text-[10px] text-slate-450 uppercase font-bold block mb-1">Reported Symptoms</span>
                      {apt.reason}
                    </div>
                  )}
                </div>

                {/* Actions Grid (Available for Completed and Booked appointments) */}
                {!isCancelled && (
                  <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-2">
                    {/* Primary clinical actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={() => isCompleted ? handleDownloadRx(apt.id) : navigate(`/doctor/appointments/${apt.id}/prescribe`)}
                        className="py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Clipboard className="w-3.5 h-3.5 text-teal-600" /> 
                        {isCompleted ? "View Rx (PDF)" : "Prescribe"}
                      </button>
                      <button
                        onClick={() => isCompleted ? handleDownloadRecord(apt.id) : navigate(`/doctor/appointments/${apt.id}/record`)}
                        className="py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" /> 
                        {isCompleted ? "View Record (PDF)" : "Add Record"}
                      </button>
                    </div>

                    {/* Checkout option only shown for non-completed bookings */}
                    {!isCompleted && (
                      <button
                        onClick={() => handleComplete(apt.id)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Checkout Visit (Mark Completed)
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatientId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white border-2 border-blue-600 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-scale-up">
            {/* Header */}
            <div className="bg-blue-600 px-5 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-800 flex items-center justify-center font-black text-xs uppercase border border-blue-400/40">
                  {patientDetails?.bloodGroup ? patientDetails.bloodGroup.replace('_POSITIVE','+').replace('_NEGATIVE','-') : 'BG'}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm leading-none">{patientDetails?.name || 'Loading Profile...'}</h3>
                  <span className="text-[9px] text-blue-200 font-bold mt-1 block">Patient File Card</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPatientId(null)} 
                className="text-white hover:text-slate-200 text-sm font-bold p-1 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4 text-xs text-slate-700 overflow-y-auto max-h-[350px]">
              {fetchingPatient ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <RefreshCw className="w-7 h-7 text-blue-600 animate-spin" />
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Fetching Clinical Record...</span>
                </div>
              ) : patientDetails ? (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider font-extrabold text-slate-400">Gender</span>
                      <span className="font-bold text-slate-800 text-xs">{patientDetails.gender || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider font-extrabold text-slate-400">Birth Date</span>
                      <span className="font-bold text-slate-800 text-xs">{patientDetails.birthDate || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider font-extrabold text-slate-400">Father's Name</span>
                      <span className="font-bold text-slate-800 text-xs">{patientDetails.fatherName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider font-extrabold text-slate-400">Blood Group</span>
                      <span className="font-bold text-slate-800 text-xs">{patientDetails.bloodGroup ? patientDetails.bloodGroup.replace('_POSITIVE','+').replace('_NEGATIVE','-') : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider font-extrabold text-slate-400">Height</span>
                      <span className="font-bold text-slate-800 text-xs">{patientDetails.height ? `${patientDetails.height} cm` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider font-extrabold text-slate-400">Weight</span>
                      <span className="font-bold text-slate-800 text-xs">{patientDetails.weight ? `${patientDetails.weight} kg` : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 border-b border-slate-100 pb-3">
                    <span className="block text-[8px] uppercase tracking-wider font-extrabold text-slate-400">Contact Details</span>
                    <p className="font-bold text-slate-800">✉️ {patientDetails.email || 'N/A'}</p>
                    <p className="font-bold text-slate-800">📞 {patientDetails.phone || 'N/A'}</p>
                  </div>

                  <div className="space-y-1.5 border-b border-slate-100 pb-3">
                    <span className="block text-[8px] uppercase tracking-wider font-extrabold text-slate-400">Residential Address</span>
                    <p className="font-bold text-slate-800">{patientDetails.address || 'N/A'}</p>
                    <p className="text-[10px] text-slate-450 font-semibold">{patientDetails.city || 'N/A'}, {patientDetails.state || 'N/A'} {patientDetails.pincode ? `-${patientDetails.pincode}` : ''}</p>
                  </div>

                  <div className="space-y-1.5 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                    <span className="block text-[8px] uppercase tracking-wider font-extrabold text-blue-700">Emergency Contact Contact</span>
                    <p className="font-extrabold text-slate-800">{patientDetails.emergencyContactName || 'N/A'}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">Contact relationship: {patientDetails.emergencyContactPhone || 'N/A'}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-red-500 font-bold">Failed to load medical history details.</div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-150 flex justify-end">
              <button 
                onClick={() => setSelectedPatientId(null)} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Close Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
