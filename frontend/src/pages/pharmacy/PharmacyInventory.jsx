import React, { useState } from 'react';
import { Pill, AlertTriangle, Plus, RefreshCw, CheckCircle2 } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusPill from '../../components/ui/StatusPill';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';

export default function PharmacyInventory() {
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [restockQty, setRestockQty] = useState(50);

  const [medicines, setMedicines] = useState([
    { id: 'MED-01', name: 'Paracetamol 500mg', category: 'Analgesics', stock: 120, unit: 'Tablets', status: 'IN_STOCK', price: 15 },
    { id: 'MED-02', name: 'Amoxicillin 250mg', category: 'Antibiotics', stock: 8, unit: 'Strip', status: 'LOW_STOCK', price: 85 },
    { id: 'MED-03', name: 'Metformin 500mg', category: 'Antidiabetic', stock: 240, unit: 'Tablets', status: 'IN_STOCK', price: 32 },
    { id: 'MED-04', name: 'Atorvastatin 10mg', category: 'Cardiovascular', stock: 4, unit: 'Strip', status: 'LOW_STOCK', price: 110 },
    { id: 'MED-05', name: 'Cetirizine 10mg', category: 'Antihistamine', stock: 0, unit: 'Strip', status: 'OUT_OF_STOCK', price: 20 },
  ]);

  const handleRestockSubmit = (e) => {
    e.preventDefault();
    if (!selectedMed) return;
    const added = Number(restockQty);
    setMedicines(medicines.map(m => {
      if (m.id === selectedMed.id) {
        const newStock = m.stock + added;
        const newStatus = newStock > 15 ? 'IN_STOCK' : newStock > 0 ? 'LOW_STOCK' : 'OUT_OF_STOCK';
        return { ...m, stock: newStock, status: newStatus };
      }
      return m;
    }));
    setIsStockModalOpen(false);
  };

  const columns = [
    { header: 'Medicine ID', key: 'id', sortable: true, render: (val) => <span className="font-mono font-bold text-slate-800">{val}</span> },
    { header: 'Medicine Name', key: 'name', sortable: true, render: (val) => <span className="font-bold text-slate-900">{val}</span> },
    { header: 'Category', key: 'category', sortable: true },
    { header: 'Unit Price', key: 'price', sortable: true, render: (val) => <span className="font-mono">₹{val}</span> },
    {
      header: 'Available Stock',
      key: 'stock',
      sortable: true,
      render: (val, row) => (
        <span className={`font-mono font-bold ${val < 10 ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
          {val} {row.unit}
        </span>
      ),
    },
    { header: 'Status', key: 'status', render: (val) => <StatusPill status={val} /> },
    {
      header: 'Stock Action',
      key: 'id',
      render: (_, row) => (
        <button
          onClick={() => {
            setSelectedMed(row);
            setRestockQty(50);
            setIsStockModalOpen(true);
          }}
          className="flex items-center gap-1 px-3 py-1 bg-[#1F5F5B] hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Restock Stock
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#12302E] font-display">Pharmacy & Inventory Management</h1>
          <p className="text-xs text-slate-500 mt-1">Medicine stock level tracking & automated low-stock warnings</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-3.5 py-2 rounded-xl border border-amber-200 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
            {medicines.filter(m => m.status === 'LOW_STOCK' || m.status === 'OUT_OF_STOCK').length} Low Stock Alerts
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-800">Pharmacy Medicine Catalog</h2>
        <DataTable
          columns={columns}
          data={medicines}
          searchPlaceholder="Search medicine name or category..."
        />
      </div>

      {/* Restock Modal */}
      {selectedMed && (
        <Modal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)} title={`Restock Inventory — ${selectedMed.name}`}>
          <form onSubmit={handleRestockSubmit} className="space-y-4">
            <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 text-xs text-teal-900">
              Current Stock Level: <strong className="font-mono text-sm">{selectedMed.stock} {selectedMed.unit}</strong>
            </div>

            <FormField label="Quantity to Add" required>
              <input
                type="number"
                required
                min="1"
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </FormField>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsStockModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-[#1F5F5B] text-white hover:bg-teal-800 shadow-sm"
              >
                Confirm Restock
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
