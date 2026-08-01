import React, { useState } from 'react';
import { CreditCard, Printer, Plus, Download, FileText, CheckCircle2 } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import StatusPill from '../../components/ui/StatusPill';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';

export default function BillingModule() {
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [invoices, setInvoices] = useState([
    { id: 'INV-2026-001', patient: 'Rahul Sharma', date: '2026-08-01', doctor: 'Dr. Anjali Rajan', items: [{ desc: 'Cardiology Consultation', amount: 800 }, { desc: 'ECG Telemetry Test', amount: 1200 }], tax: 360, total: 2360, status: 'PAID' },
    { id: 'INV-2026-002', patient: 'Priya Patel', date: '2026-08-01', doctor: 'Dr. Amit Verma', items: [{ desc: 'Neurology Consultation', amount: 1000 }, { desc: 'MRI Scan', amount: 4500 }], tax: 990, total: 6490, status: 'PENDING' },
    { id: 'INV-2026-003', patient: 'Suresh Kumar', date: '2026-07-28', doctor: 'Dr. Neha Sharma', items: [{ desc: 'Pediatric Checkup', amount: 600 }], tax: 108, total: 708, status: 'OVERDUE' },
  ]);

  const [newInvoice, setNewInvoice] = useState({
    patient: '',
    doctor: 'Dr. Anjali Rajan',
    consultFee: 800,
    labFee: 500,
  });

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    if (!newInvoice.patient) return;
    const subtotal = Number(newInvoice.consultFee) + Number(newInvoice.labFee);
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;

    const invoiceObj = {
      id: `INV-2026-00${invoices.length + 1}`,
      patient: newInvoice.patient,
      date: new Date().toISOString().split('T')[0],
      doctor: newInvoice.doctor,
      items: [
        { desc: 'Doctor Consultation Fee', amount: Number(newInvoice.consultFee) },
        { desc: 'Lab & Diagnostics', amount: Number(newInvoice.labFee) },
      ],
      tax,
      total,
      status: 'PENDING',
    };

    setInvoices([invoiceObj, ...invoices]);
    setIsInvoiceModalOpen(false);
    setNewInvoice({ patient: '', doctor: 'Dr. Anjali Rajan', consultFee: 800, labFee: 500 });
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    { header: 'Invoice ID', key: 'id', sortable: true, render: (val) => <span className="font-mono font-bold text-slate-800">{val}</span> },
    { header: 'Patient Name', key: 'patient', sortable: true, render: (val) => <span className="font-bold text-slate-800">{val}</span> },
    { header: 'Doctor', key: 'doctor', sortable: true },
    { header: 'Date', key: 'date', sortable: true },
    { header: 'Amount (₹)', key: 'total', sortable: true, render: (val) => <span className="font-mono font-bold text-teal-800">₹{val.toLocaleString()}</span> },
    { header: 'Status', key: 'status', render: (val) => <StatusPill status={val} /> },
    {
      header: 'Actions',
      key: 'id',
      render: (_, row) => (
        <button
          onClick={() => setSelectedInvoice(row)}
          className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
        >
          <FileText className="w-3.5 h-3.5" /> View Invoice
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Printable Invoice Overlay Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-invoice, #printable-invoice * { visibility: visible; }
          #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#12302E] font-display">Billing & Financial Accounts</h1>
          <p className="text-xs text-slate-500 mt-1">Generate hospital invoices, payment receipts & financial ledger</p>
        </div>

        <button
          onClick={() => setIsInvoiceModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1F5F5B] hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Create New Invoice
        </button>
      </div>

      {/* Invoice Table */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-800">All Hospital Invoices</h2>
        <DataTable
          columns={columns}
          data={invoices}
          searchPlaceholder="Search invoice ID, patient or doctor..."
        />
      </div>

      {/* Create Invoice Modal */}
      <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="Generate Patient Invoice">
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <FormField label="Patient Name" required>
            <input
              type="text"
              required
              value={newInvoice.patient}
              onChange={(e) => setNewInvoice({ ...newInvoice, patient: e.target.value })}
              placeholder="e.g. Ananya Roy"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </FormField>

          <FormField label="Attending Doctor">
            <select
              value={newInvoice.doctor}
              onChange={(e) => setNewInvoice({ ...newInvoice, doctor: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="Dr. Anjali Rajan">Dr. Anjali Rajan (Cardio)</option>
              <option value="Dr. Amit Verma">Dr. Amit Verma (Neuro)</option>
              <option value="Dr. Neha Sharma">Dr. Neha Sharma (Pedia)</option>
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Consultation Fee (₹)" required>
              <input
                type="number"
                required
                value={newInvoice.consultFee}
                onChange={(e) => setNewInvoice({ ...newInvoice, consultFee: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </FormField>

            <FormField label="Lab / Diagnostics Fee (₹)">
              <input
                type="number"
                value={newInvoice.labFee}
                onChange={(e) => setNewInvoice({ ...newInvoice, labFee: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </FormField>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-[#1F5F5B] text-white hover:bg-teal-800 shadow-sm"
            >
              Generate Bill
            </button>
          </div>
        </form>
      </Modal>

      {/* Invoice Detail / Printable View Modal */}
      {selectedInvoice && (
        <Modal isOpen={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} title="Official Medical Invoice" maxWidth="max-w-2xl">
          <div id="printable-invoice" className="p-6 bg-white space-y-6">
            {/* Header / Logo */}
            <div className="flex justify-between items-start border-b pb-4 border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-[#12302E] font-display">Priyansh Care Multispecialty</h2>
                <p className="text-xs text-slate-500">100 Healthcare Boulevard, Cyber City</p>
                <p className="text-xs text-slate-500">GSTIN: 07AAAAA0000A1Z5</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-base font-bold text-slate-800">{selectedInvoice.id}</span>
                <p className="text-xs text-slate-500">Date: {selectedInvoice.date}</p>
                <div className="mt-1"><StatusPill status={selectedInvoice.status} /></div>
              </div>
            </div>

            {/* Billed To */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-mono uppercase">Billed Patient:</span>
                <h4 className="font-bold text-sm text-slate-900 mt-0.5">{selectedInvoice.patient}</h4>
              </div>
              <div>
                <span className="text-slate-400 font-mono uppercase">Attending Specialist:</span>
                <h4 className="font-bold text-sm text-slate-900 mt-0.5">{selectedInvoice.doctor}</h4>
              </div>
            </div>

            {/* Line Items */}
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 font-bold border-y border-slate-200">
                <tr>
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedInvoice.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2.5 px-3 font-medium text-slate-700">{item.desc}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">₹{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Summary */}
            <div className="border-t border-slate-200 pt-4 text-xs space-y-1.5 max-w-xs ml-auto text-right">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">₹{(selectedInvoice.total - selectedInvoice.tax).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Tax (18%):</span>
                <span className="font-mono font-semibold">₹{selectedInvoice.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 border-t pt-2">
                <span>Grand Total:</span>
                <span className="font-mono text-teal-800 text-base">₹{selectedInvoice.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-white hover:bg-slate-900"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
