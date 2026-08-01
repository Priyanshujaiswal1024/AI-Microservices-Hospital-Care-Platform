import React, { useState } from 'react';
import { Calendar, Users, Activity, CheckSquare, Plus, FileText, UserCheck } from 'lucide-react';
import EcgPulseMeter from '../../components/ui/EcgPulseMeter';
import StatusPill from '../../components/ui/StatusPill';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';

export default function DoctorDashboard() {
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [queue, setQueue] = useState([
    { id: 'APT-101', patient: 'Vikas Sharma', age: 34, gender: 'Male', time: '09:30 AM', status: 'IN_CONSULTATION', symptoms: 'Chest tightness, elevated pulse' },
    { id: 'APT-102', patient: 'Sunita Menon', age: 48, gender: 'Female', time: '10:15 AM', status: 'WAITING', symptoms: 'Chronic migraine, dizziness' },
    { id: 'APT-103', patient: 'Karan Malhotra', age: 29, gender: 'Male', time: '11:00 AM', status: 'SCHEDULED', symptoms: 'Routine health checkup' },
  ]);

  const [rxForm, setRxForm] = useState({
    diagnosis: '',
    medicine: 'Paracetamol 500mg',
    dosage: '1 tablet twice daily after meals',
    notes: '',
  });

  const handleCompleteConsultation = (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setQueue(queue.map(q => q.id === selectedPatient.id ? { ...q, status: 'COMPLETED' } : q));
    setIsRxModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#12302E] font-display">Physician Command Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Welcome back, Dr. Anjali Rajan (Cardiology Specialist)</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Cabin 4 — Live Consultation Active
          </span>
        </div>
      </div>

      {/* Grid: Live ECG Telemetry & Patient Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <EcgPulseMeter bpm={82} spo2={98} bp="128/82" />
        </div>

        {/* Today's Queue */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" /> Today's Consultation Queue ({queue.length})
            </h2>
            <span className="text-xs text-slate-500 font-mono">Date: 2026-08-02</span>
          </div>

          <div className="space-y-3">
            {queue.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{item.patient}</h3>
                    <span className="text-xs text-slate-400 font-mono">({item.gender}, {item.age} yrs)</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Symptoms: <strong>{item.symptoms}</strong></p>
                  <p className="text-[11px] text-teal-700 font-mono mt-0.5">Time Slot: {item.time}</p>
                </div>

                <div className="flex items-center gap-3">
                  <StatusPill status={item.status} />
                  {item.status !== 'COMPLETED' && (
                    <button
                      onClick={() => {
                        setSelectedPatient(item);
                        setIsRxModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1F5F5B] hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" /> Write Digital Rx
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prescription Writer Modal */}
      {selectedPatient && (
        <Modal isOpen={isRxModalOpen} onClose={() => setIsRxModalOpen(false)} title={`Digital Prescription — ${selectedPatient.patient}`}>
          <form onSubmit={handleCompleteConsultation} className="space-y-4">
            <FormField label="Clinical Diagnosis" required>
              <input
                type="text"
                required
                value={rxForm.diagnosis}
                onChange={(e) => setRxForm({ ...rxForm, diagnosis: e.target.value })}
                placeholder="e.g. Mild Hypertension, Sinus Tachycardia"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Prescribed Medicine">
                <select
                  value={rxForm.medicine}
                  onChange={(e) => setRxForm({ ...rxForm, medicine: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Paracetamol 500mg">Paracetamol 500mg</option>
                  <option value="Atorvastatin 10mg">Atorvastatin 10mg</option>
                  <option value="Metformin 500mg">Metformin 500mg</option>
                  <option value="Amoxicillin 250mg">Amoxicillin 250mg</option>
                </select>
              </FormField>

              <FormField label="Dosage Frequency">
                <input
                  type="text"
                  value={rxForm.dosage}
                  onChange={(e) => setRxForm({ ...rxForm, dosage: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </FormField>
            </div>

            <FormField label="Dietary & Lifestyle Advice">
              <textarea
                rows={3}
                value={rxForm.notes}
                onChange={(e) => setRxForm({ ...rxForm, notes: e.target.value })}
                placeholder="e.g. Low sodium diet, 30 min morning walk daily"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </FormField>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsRxModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-[#1F5F5B] text-white hover:bg-teal-800 shadow-sm"
              >
                Save & Complete Consult
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
