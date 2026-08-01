import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, ArrowLeft, Pill, CheckCircle2, Info, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

const DEFAULT_MEDICINES = [
  { id: 1, name: 'Paracetamol 500mg', category: 'Analgesics', stock: 120, dosageForm: 'Tablet' },
  { id: 2, name: 'Amoxicillin 250mg', category: 'Antibiotics', stock: 45, dosageForm: 'Capsule' },
  { id: 3, name: 'Metformin 500mg', category: 'Antidiabetic', stock: 200, dosageForm: 'Tablet' },
  { id: 4, name: 'Atorvastatin 10mg', category: 'Cardiovascular', stock: 80, dosageForm: 'Tablet' },
  { id: 5, name: 'Cetirizine 10mg', category: 'Antihistamine', stock: 150, dosageForm: 'Tablet' },
  { id: 6, name: 'Pantoprazole 40mg', category: 'Gastrointestinal', stock: 95, dosageForm: 'Tablet' },
  { id: 7, name: 'Azithromycin 500mg', category: 'Antibiotics', stock: 30, dosageForm: 'Tablet' },
  { id: 8, name: 'Ibuprofen 400mg', category: 'Analgesics', stock: 110, dosageForm: 'Tablet' },
  { id: 9, name: 'Amlodipine 5mg', category: 'Cardiovascular', stock: 65, dosageForm: 'Tablet' },
];

export default function DoctorPrescriptions() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [medicines, setMedicines] = useState(DEFAULT_MEDICINES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Script state
  const [diagnosis, setDiagnosis] = useState('Acute Upper Respiratory Track Check');
  const [notes, setNotes] = useState('Take full rest and consume plenty of warm fluids.');
  const [prescriptionMedicines, setPrescriptionMedicines] = useState([]);

  useEffect(() => {
    const initPage = async () => {
      try {
        if (appointmentId) {
          try {
            const aptRes = await api.get(`/appointments/${appointmentId}`);
            setAppointment(aptRes.data);
          } catch (e) {
            console.log("Using mock appointment context");
            setAppointment({ id: appointmentId, patientName: 'Rahul Sharma', patientEmail: 'rahul@example.com' });
          }

          try {
            const rxRes = await api.get(`/prescriptions/appointment/${appointmentId}`);
            if (rxRes.data) {
              setDiagnosis(rxRes.data.diagnosis || '');
              setNotes(rxRes.data.notes || '');
              setPrescriptionMedicines(rxRes.data.medicines || []);
            }
          } catch (rxErr) {
            // no existing rx
          }
        }

        try {
          const medRes = await api.get('/medicines?page=0&size=100');
          const medData = medRes.data?.content || (Array.isArray(medRes.data) ? medRes.data : []);
          if (medData.length > 0) {
            setMedicines(medData);
          }
        } catch (e) {
          // fallback to DEFAULT_MEDICINES
        }
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, [appointmentId]);

  // Filtering medicines
  const categories = ['ALL', ...new Set(medicines.map((m) => m.category || 'General'))];

  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.category && m.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleAddMedicine = (med) => {
    if (prescriptionMedicines.some((pm) => pm.medicineId === med.id || pm.medicineName === med.name)) {
      return; // Already added
    }
    const newRxItem = {
      medicineId: med.id,
      medicineName: med.name,
      frequency: '1-0-1 (After Meals)',
      durationDays: 5,
      quantity: 10,
      instructions: 'Take after meals with water',
    };
    setPrescriptionMedicines([...prescriptionMedicines, newRxItem]);
  };

  const handleRemoveMedicine = (idx) => {
    setPrescriptionMedicines(prescriptionMedicines.filter((_, i) => i !== idx));
  };

  const handleUpdateItem = (idx, field, value) => {
    setPrescriptionMedicines(
      prescriptionMedicines.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (prescriptionMedicines.length === 0) {
      alert('Please add at least one medicine to the prescription.');
      return;
    }
    setSaving(true);
    try {
      if (appointmentId) {
        await api.post(`/prescriptions/${appointmentId}`, {
          diagnosis,
          notes,
          medicines: prescriptionMedicines,
        });
        await api.patch(`/appointments/${appointmentId}/complete`);
      }
      navigate('/doctor/appointments');
    } catch (err) {
      alert(err.response?.data || 'Prescription saved in demo mode');
      navigate('/doctor/appointments');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-6 h-6 text-teal-600 animate-spin" />
      </div>
    );
  }

  const patientName = appointment?.patientName || appointment?.patientEmail || 'Patient #1';

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Navigation & Patient Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/doctor/appointments')}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#12302E] font-display">Write Digital Prescription</h1>
              <span className="font-mono text-xs bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-md border border-teal-200 font-semibold">
                Apt #{appointmentId || '1'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Prescribing for: <strong className="text-slate-800">{patientName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-3.5 py-2 rounded-xl border border-amber-200 text-xs font-medium">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Only add medicines here. Diagnosis & clinical notes save to Medical Record.</span>
        </div>
      </div>

      {/* Main Workspace Grid (Left: Search & Add, Right: Prescription Basket) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: Search & Medicine Catalog (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 font-mono">
              <Search className="w-4 h-4 text-teal-600" /> Search & Add Medicines
            </h2>
            <span className="text-xs text-slate-400 font-mono">{filteredMedicines.length} available</span>
          </div>

          {/* Search Bar Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type medicine name... e.g. Paracetamol, Amoxicillin"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-medium text-slate-800"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#1F5F5B] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Medicine Cards List */}
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {filteredMedicines.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                No matching medicines found for "{searchTerm}".
              </div>
            ) : (
              filteredMedicines.map((med) => {
                const isAdded = prescriptionMedicines.some(
                  (pm) => pm.medicineId === med.id || pm.medicineName === med.name
                );
                return (
                  <div
                    key={med.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isAdded
                        ? 'bg-teal-50/50 border-teal-200'
                        : 'bg-slate-50/50 border-slate-200/80 hover:border-teal-400 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        <Pill className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{med.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">
                            {med.category || 'General'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Stock: {med.stock || 50}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isAdded}
                      onClick={() => handleAddMedicine(med)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isAdded
                          ? 'bg-emerald-100 text-emerald-800 cursor-default'
                          : 'bg-[#1F5F5B] text-white hover:bg-teal-800 shadow-sm'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Added
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" /> Add
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Selected Medicines & Script Builder (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono">
                Selected Medicines ({prescriptionMedicines.length})
              </h2>
              {prescriptionMedicines.length > 0 && (
                <button
                  onClick={() => setPrescriptionMedicines([])}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Prescribed Items Cards */}
            {prescriptionMedicines.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <Pill className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-700">No medicines added yet</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Search and click "+ Add" from the left panel to build the prescription script.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {prescriptionMedicines.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-mono text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{item.medicineName}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Frequency selector buttons */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Frequency Routine
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {['1-0-1 (After Meals)', '1-0-0 (Morning)', '0-0-1 (Night)', '1-1-1 (TID)'].map(
                          (freq) => (
                            <button
                              key={freq}
                              type="button"
                              onClick={() => handleUpdateItem(idx, 'frequency', freq)}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                                item.frequency === freq
                                  ? 'bg-teal-700 text-white'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {freq}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Duration & Quantity Inputs */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Duration (Days)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.durationDays}
                          onChange={(e) => handleUpdateItem(idx, 'durationDays', Number(e.target.value))}
                          className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Total Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                          className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Special Instructions */}
                    <div>
                      <input
                        type="text"
                        value={item.instructions}
                        onChange={(e) => handleUpdateItem(idx, 'instructions', e.target.value)}
                        placeholder="Instructions (e.g. Take with warm milk)"
                        className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleSubmit}
              disabled={saving || prescriptionMedicines.length === 0}
              className="w-full py-3 bg-[#1F5F5B] hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Save & Complete Prescription
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
