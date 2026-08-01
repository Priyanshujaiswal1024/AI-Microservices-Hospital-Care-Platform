import React, { useState } from 'react';
import { HeartPulse, Activity, Bed, Plus, CheckCircle, Clock } from 'lucide-react';
import EcgPulseMeter from '../../components/ui/EcgPulseMeter';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';

export default function NurseDashboard() {
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [wardBeds, setWardBeds] = useState([
    { bedId: 'Bed-101', patient: 'Rahul Sharma', age: 34, gender: 'Male', status: 'Occupied', vitals: { bp: '120/80', spo2: '98%', bpm: 74 } },
    { bedId: 'Bed-102', patient: 'Priya Patel', age: 28, gender: 'Female', status: 'Occupied', vitals: { bp: '115/75', spo2: '99%', bpm: 72 } },
    { bedId: 'Bed-103', patient: 'Vacant', age: '-', gender: '-', status: 'Available', vitals: null },
    { bedId: 'Bed-104', patient: 'Suresh Kumar', age: 54, gender: 'Male', status: 'Occupied', vitals: { bp: '135/90', spo2: '96%', bpm: 82 } },
    { bedId: 'Bed-105', patient: 'Vacant', age: '-', gender: '-', status: 'Available', vitals: null },
    { bedId: 'Bed-106', patient: 'Ananya Roy', age: 41, gender: 'Female', status: 'Occupied', vitals: { bp: '122/82', spo2: '97%', bpm: 76 } },
  ]);

  const [vitalsForm, setVitalsForm] = useState({
    bp: '120/80',
    bpm: '75',
    spo2: '98',
    temp: '98.6°F',
  });

  const handleSaveVitals = (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setWardBeds(wardBeds.map(b => b.bedId === selectedPatient.bedId ? {
      ...b,
      vitals: { bp: vitalsForm.bp, bpm: Number(vitalsForm.bpm), spo2: `${vitalsForm.spo2}%` }
    } : b));
    setIsVitalsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#12302E] font-display">Nursing Station & Ward Care</h1>
          <p className="text-xs text-slate-500 mt-1">In-patient telemetry, bed allocation & patient vitals entry</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3.5 py-2 rounded-xl border border-emerald-200 text-xs font-semibold">
          <HeartPulse className="w-4 h-4 text-emerald-600 animate-pulse" /> Station Active — ICU Ward 3
        </div>
      </div>

      {/* Grid: ECG Vitals & Bed Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <EcgPulseMeter bpm={76} spo2={98} bp="120/80" />
        </div>

        {/* Ward Bed Matrix */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Bed className="w-4 h-4 text-teal-600" /> In-Patient Ward Matrix (ICU)
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Available: {wardBeds.filter(b => b.status === 'Available').length} / {wardBeds.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wardBeds.map((bed) => (
              <div
                key={bed.bedId}
                className={`p-4 rounded-xl border transition-all ${
                  bed.status === 'Occupied'
                    ? 'bg-teal-50/40 border-teal-200'
                    : 'bg-slate-50 border-slate-200 border-dashed'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                    {bed.bedId}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    bed.status === 'Occupied' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {bed.status}
                  </span>
                </div>

                {bed.status === 'Occupied' ? (
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{bed.patient}</h4>
                      <p className="text-[11px] text-slate-500">{bed.gender}, {bed.age} yrs</p>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-[10px] bg-white p-2 rounded-lg border border-slate-200 font-mono">
                      <div><span className="text-slate-400">BP:</span> <strong>{bed.vitals.bp}</strong></div>
                      <div><span className="text-slate-400">HR:</span> <strong>{bed.vitals.bpm}</strong></div>
                      <div><span className="text-slate-400">SpO2:</span> <strong>{bed.vitals.spo2}</strong></div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedPatient(bed);
                        setIsVitalsModalOpen(true);
                      }}
                      className="w-full mt-1 py-1.5 bg-[#1F5F5B] hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Activity className="w-3.5 h-3.5" /> Log Vitals
                    </button>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400">Bed Vacant — Ready for admission</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vitals Entry Modal */}
      <Modal isOpen={isVitalsModalOpen} onClose={() => setIsVitalsModalOpen(false)} title={`Record Patient Vitals — ${selectedPatient?.patient || ''}`}>
        <form onSubmit={handleSaveVitals} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Blood Pressure (mmHg)" required>
              <input
                type="text"
                required
                value={vitalsForm.bp}
                onChange={(e) => setVitalsForm({ ...vitalsForm, bp: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </FormField>

            <FormField label="Heart Rate (BPM)" required>
              <input
                type="number"
                required
                value={vitalsForm.bpm}
                onChange={(e) => setVitalsForm({ ...vitalsForm, bpm: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="SpO2 Saturation (%)" required>
              <input
                type="number"
                required
                value={vitalsForm.spo2}
                onChange={(e) => setVitalsForm({ ...vitalsForm, spo2: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </FormField>

            <FormField label="Body Temperature">
              <input
                type="text"
                value={vitalsForm.temp}
                onChange={(e) => setVitalsForm({ ...vitalsForm, temp: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </FormField>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsVitalsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-[#1F5F5B] text-white hover:bg-teal-800 shadow-sm"
            >
              Update Telemetry
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
