import React, { useState, useEffect } from 'react';
import { CreditCard, Download, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios';

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBills = async () => {
    try {
      const response = await api.get('/bills/patient');
      setBills(response.data);
    } catch (err) {
      console.error('Error fetching bills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleDownload = async (id) => {
    try {
      const response = await api.get(`/bills/${id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download invoice PDF');
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
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-slate-900">Invoices & Statements</h2>
        <p className="text-xs text-slate-500 mt-0.5">Download official PDF receipts and review medical claims</p>
      </div>

      {bills.length === 0 ? (
        <div className="card-base p-12 text-center">
          <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">No statements logged</h3>
          <p className="text-slate-500 text-xs mt-1">Cleared consultations automatically generate invoice sheets</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {bills.map((bill) => {
            const isPaid = bill.status === 'PAID';
            return (
              <div key={bill.id} className="card-base p-5 flex flex-col justify-between hover:border-slate-350 transition-colors">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                      isPaid
                        ? 'bg-success-light text-success border-green-150'
                        : 'bg-warning-light text-warning border-amber-150'
                    }`}>
                      {bill.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">INV-{String(bill.id).padStart(5, '0')}</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Attending Physician</span>
                      <span className="text-sm font-bold text-slate-800">{bill.doctorName}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                      <div>
                        <span>Fee Rate</span>
                        <span className="block font-bold text-slate-700 mt-0.5">₹{bill.consultationFee}</span>
                      </div>
                      <div>
                        <span>GST (18%)</span>
                        <span className="block font-bold text-slate-700 mt-0.5">₹{bill.gstAmount}</span>
                      </div>
                      <div>
                        <span>Total Paid</span>
                        <span className="block font-bold text-primary mt-0.5">₹{bill.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(bill.id)}
                  className="w-full mt-5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" /> Download PDF Invoice
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
