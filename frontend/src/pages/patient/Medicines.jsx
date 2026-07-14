import React, { useState, useEffect } from 'react';
import { Pill, Search, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await api.get('/medicines?page=0&size=100');
        setMedicines(response.data);
      } catch (err) {
        console.error('Error fetching medicines:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, []);

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
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-slate-900">Hospital Pharmacy Catalog</h2>
        <p className="text-xs text-slate-500 mt-0.5">Explore available medicine batches, forms, and unit pricing</p>
      </div>

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
          No medicine stocks match the filter terms
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
