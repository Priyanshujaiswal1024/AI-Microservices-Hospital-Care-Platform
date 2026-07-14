import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2, RefreshCw, Plus } from 'lucide-react';
import api from '../../api/axios';

export default function DoctorPrescriptions() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Script states
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [prescriptionMedicines, setPrescriptionMedicines] = useState([]);
  const [saving, setSaving] = useState(false);

  // Selector form row states
  const [selMedId, setSelMedId] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [duration, setDuration] = useState('5');
  const [quantity, setQuantity] = useState('5');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    const initPage = async () => {
      try {
        if (appointmentId) {
          const aptRes = await api.get(`/appointments/${appointmentId}`);
          setAppointment(aptRes.data);

          try {
            const rxRes = await api.get(`/prescriptions/appointment/${appointmentId}`);
            if (rxRes.data) {
              setDiagnosis(rxRes.data.diagnosis || '');
              setNotes(rxRes.data.notes || '');
              setPrescriptionMedicines(rxRes.data.medicines || []);
            }
          } catch (rxErr) {
            console.log("No existing prescription for this appointment:", rxErr);
          }
        }
        const medRes = await api.get('/medicines?page=0&size=100');
        // Handle both paginated {content:[]} and plain array response
        const medData = medRes.data?.content || (Array.isArray(medRes.data) ? medRes.data : []);
        setMedicines(medData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, [appointmentId]);

  const addMedicineRow = () => {
    if (!selMedId) return;
    const selected = medicines.find(m => m.id === Number(selMedId));
    if (!selected) return;

    if (prescriptionMedicines.some(m => m.medicineId === selected.id)) {
      alert('This medicine is already added to the prescription');
      return;
    }

    setPrescriptionMedicines([...prescriptionMedicines, {
      medicineId: selected.id,
      medicineName: selected.name,
      frequency,
      durationDays: Number(duration),
      quantity: Number(quantity),
      instructions
    }]);

    setSelMedId('');
    setInstructions('');
  };

  const removeMedicineRow = (idx) => {
    setPrescriptionMedicines(prescriptionMedicines.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (prescriptionMedicines.length === 0) {
      alert('Please add at least one medicine to the prescription');
      return;
    }
    setSaving(true);
    try {
      // Backend: POST /prescriptions/{appointmentId}  (appointmentId in URL path)
      await api.post(`/prescriptions/${appointmentId}`, {
        diagnosis,
        notes,
        medicines: prescriptionMedicines
      });
      await api.patch(`/appointments/${appointmentId}/complete`);
      navigate('/doctor/appointments');
    } catch (err) {
      alert(err.response?.data || 'Failed to submit prescription');
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
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-slate-900">Record Session Prescription</h2>
        <p className="text-xs text-slate-500 mt-0.5">Write patient script guidelines, dosages, and finish checkouts</p>
      </div>

      {appointment && (() => {
        const patientDisplayName = appointment.patientName?.trim() || appointment.patientEmail || `Patient #${appointment.patientId}`;
        return (
          <div className="card-base p-4 flex items-center gap-3 text-sm text-slate-650 bg-slate-50/50">
            <div className="w-8 h-8 bg-slate-200 border border-slate-350 rounded-lg flex items-center justify-center font-bold text-slate-700">
              {patientDisplayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase leading-none">Checkout Patient</span>
              <span className="font-bold text-slate-800 block mt-1">{patientDisplayName}</span>
            </div>
          </div>
        );
      })()}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-base p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Diagnosis Notes
            </label>
            <input
              type="text"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Viral Fever / Acute Bronchitis"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Clinical Advice Remarks
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="General rest or diet advice..."
              className="input-field resize-none"
            />
          </div>
        </div>

        {/* Medicines Selector Panel */}
        <div className="card-base p-5 space-y-4">
          <h3 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-3">Prescribe Medicine Lines</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 font-semibold mb-1.5">Choose Medicine</label>
              <select
                value={selMedId}
                onChange={(e) => setSelMedId(e.target.value)}
                className="input-field"
              >
                <option value="">Choose drug...</option>
                {medicines.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.dosage}) - {m.stock} left</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-500 font-semibold mb-1.5">Dosage Frequency</label>
              <input
                type="text"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="e.g. Twice daily after meals"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 font-semibold mb-1.5">Duration (Days)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 font-semibold mb-1.5">Total Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-slate-500 font-semibold mb-1.5">Special Instructions</label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Consume with plenty of water"
                className="input-field"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={addMedicineRow}
            className="btn-secondary py-1.5 text-xs flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 text-slate-400" /> Add Medicine Row
          </button>
        </div>

        {/* Medicines Table */}
        {prescriptionMedicines.length > 0 && (
          <div className="card-base overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-5">Medicine</th>
                  <th className="py-2.5 px-5">Frequency</th>
                  <th className="py-2.5 px-5">Duration</th>
                  <th className="py-2.5 px-5">Qty</th>
                  <th className="py-2.5 px-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-650">
                {prescriptionMedicines.map((med, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-5 font-bold text-slate-800">{med.medicineName}</td>
                    <td className="py-2.5 px-5">{med.frequency}</td>
                    <td className="py-2.5 px-5">{med.durationDays} Days</td>
                    <td className="py-2.5 px-5">{med.quantity}</td>
                    <td className="py-2.5 px-5">
                      <button
                        type="button"
                        onClick={() => removeMedicineRow(idx)}
                        className="text-danger hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full btn-primary py-2.5 flex items-center justify-center gap-1.5"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Save Prescription & Close Visit'}
        </button>
      </form>
    </div>
  );
}
