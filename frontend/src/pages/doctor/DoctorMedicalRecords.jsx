import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import api from '../../api/axios';

export default function DoctorMedicalRecords() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchApt = async () => {
      try {
        if (appointmentId) {
          const res = await api.get(`/appointments/${appointmentId}`);
          setAppointment(res.data);

          try {
            const recRes = await api.get(`/medical-records/appointment/${appointmentId}`);
            if (recRes.data) {
              setDiagnosis(recRes.data.diagnosis || '');
              setNotes(recRes.data.notes || '');
            }
          } catch (recErr) {
            console.log("No existing medical record for this appointment:", recErr);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApt();
  }, [appointmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/medical-records', {
        appointmentId: Number(appointmentId),
        diagnosis,
        notes
      });
      await api.patch(`/appointments/${appointmentId}/complete`);
      navigate('/doctor/appointments');
    } catch (err) {
      alert('Failed to log medical record');
    } finally {
      setSaving(false);
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
    <div className="space-y-6 max-w-md mx-auto">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-slate-900">Patient Diagnostic Summary</h2>
        <p className="text-xs text-slate-500 mt-0.5">Log clinical observation notes directly into patient electronic charts</p>
      </div>

      {appointment && (() => {
        const patientDisplayName = appointment.patientName?.trim() || appointment.patientEmail || `Patient #${appointment.patientId}`;
        return (
          <div className="card-base p-4 flex items-center gap-3 text-sm text-slate-650 bg-slate-50/50">
            <div className="w-8 h-8 bg-slate-200 border border-slate-350 rounded-lg flex items-center justify-center font-bold text-slate-750">
              {patientDisplayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase leading-none">Checkout Patient</span>
              <span className="font-bold text-slate-800 block mt-1">{patientDisplayName}</span>
            </div>
          </div>
        );
      })()}

      <form onSubmit={handleSubmit} className="card-base p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Clinical Diagnosis
          </label>
          <input
            type="text"
            required
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g. Acute Gastritis / Hypertension"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Clinical Summary Logs
          </label>
          <textarea
            required
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Log detailed symptoms observations or laboratory referrals..."
            className="input-field resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full btn-primary py-2.5 flex items-center justify-center gap-1.5"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Log Diagnosis & Complete Session'}
        </button>
      </form>
    </div>
  );
}
