import React, { useState, useEffect } from 'react';
import { Pill, Plus, Search, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

export default function DoctorMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('TABLET');
  const [dosage, setDosage] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchMedicines = async () => {
    try {
      const response = await api.get('/medicines?page=0&size=100');
      setMedicines(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await api.post('/medicines', {
        name,
        category,
        type,
        dosage,
        manufacturer,
        price: Number(price),
        stock: Number(stock)
      });
      setName('');
      setCategory('');
      setDosage('');
      setManufacturer('');
      setPrice('');
      setStock('');
      setShowAddForm(false);
      fetchMedicines();
    } catch (err) {
      alert('Failed to save medicine profile');
    } finally {
      setAdding(false);
    }
  };

  const filteredMedicines = medicines.filter((med) =>
    med.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hospital Pharmacy Stock</h2>
          <p className="text-xs text-slate-500 mt-0.5">Register medicine batches, track prices, and monitor stock volumes</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          {showAddForm ? 'Hide Form' : 'Register Drug'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddMedicine} className="card-base p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3 border-b border-slate-100 pb-2 mb-1">
            <h3 className="font-bold text-slate-800 text-xs">Register New Drug Batch</h3>
          </div>
          <div>
            <label className="block text-xs text-slate-500 font-semibold mb-1.5">Drug Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ibuprofen" className="input-field" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 font-semibold mb-1.5">Category</label>
            <input type="text" required value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. NSAID" className="input-field" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 font-semibold mb-1.5">Form / Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="input-field">
              <option value="TABLET">Tablet</option>
              <option value="CAPSULE">Capsule</option>
              <option value="SYRUP">Syrup</option>
              <option value="INJECTION">Injection</option>
              <option value="CREAM">Cream</option>
              <option value="DROPS">Drops</option>
              <option value="INHALER">Inhaler</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 font-semibold mb-1.5">Dosage</label>
            <input type="text" required value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g. 400mg" className="input-field" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 font-semibold mb-1.5">Manufacturer</label>
            <input type="text" required value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} placeholder="e.g. Abbott" className="input-field" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 font-semibold mb-1.5">Unit Price (₹)</label>
            <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="12" className="input-field" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs text-slate-500 font-semibold mb-1.5">Initial Stock Size</label>
            <input type="number" required value={stock} onChange={(e) => setStock(e.target.value)} placeholder="150" className="input-field" />
          </div>
          <div className="md:col-span-3 pt-2">
            <button type="submit" disabled={adding} className="w-full btn-primary py-2.5 flex items-center justify-center gap-1.5">
              {adding ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Register Medicine Line'}
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by drug name or class..."
          className="input-field pl-9"
        />
      </div>

      {filteredMedicines.length === 0 ? (
        <div className="card-base p-12 text-center text-slate-400 text-sm">
          No medicines recorded in library
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredMedicines.map((med) => (
            <div key={med.id} className="card-base p-5 flex flex-col justify-between hover:border-slate-350 transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-650">
                  <Pill className="w-5 h-5" />
                </div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900 text-sm leading-tight">{med.name}</h3>
                  {med.lowStock && (
                    <span className="text-[9px] font-bold bg-danger-light border border-red-100 text-danger px-2 py-0.5 rounded-full shrink-0">
                      Low Stock
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-450 block mt-0.5">{med.category}</span>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                  <div>
                    <span>Dosage Form</span>
                    <span className="block font-bold text-slate-800 mt-0.5">{med.dosage}</span>
                  </div>
                  <div>
                    <span>Manufacturer</span>
                    <span className="block font-bold text-slate-800 mt-0.5">{med.manufacturer}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-5 pt-3.5 border-t border-slate-100">
                <span className="text-base font-extrabold text-primary">₹{med.price}</span>
                <span className="text-xs text-slate-400">{med.stock} Units left</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
