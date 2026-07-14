import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Download } from 'lucide-react';
import api from '../../api/axios';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleDownloadPdf = async (id) => {
    try {
      const response = await api.get(`/prescriptions/${id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert('Failed to download prescription PDF');
    }
  };

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await api.get('/prescriptions/my');
        setPrescriptions(response.data);
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

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
        <h2 className="text-xl font-bold text-slate-900">Active Prescriptions</h2>
        <p className="text-xs text-slate-500 mt-0.5">View medical prescription sheets issued during clinical checkouts</p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="card-base p-12 text-center">
          <FileText className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">No prescriptions logged</h3>
          <p className="text-slate-500 text-xs mt-1">Once a doctor checks you out, medical scripts will show here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="card-base overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-850 text-sm">{rx.doctorName}</h3>
                  <span className="text-[10px] uppercase font-bold text-primary block mt-0.5">
                    Diagnosis: {rx.diagnosis}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDownloadPdf(rx.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded hover:bg-primary-dark transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </button>
                  <span className="text-xs text-slate-400 font-mono">ID: #{rx.id}</span>
                </div>
              </div>

              {/* Medicines Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-6">Medicine</th>
                      <th className="py-3 px-6">Frequency</th>
                      <th className="py-3 px-6">Duration</th>
                      <th className="py-3 px-6">Quantity</th>
                      <th className="py-3 px-6">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {rx.medicines?.map((med, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3 px-6 font-semibold text-slate-800">{med.medicineName}</td>
                        <td className="py-3 px-6">{med.frequency}</td>
                        <td className="py-3 px-6">{med.durationDays} Days</td>
                        <td className="py-3 px-6">{med.quantity}</td>
                        <td className="py-3 px-6 text-slate-400">{med.instructions || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rx.notes && (
                <div className="bg-slate-50/50 p-4 border-t border-slate-200 text-xs text-slate-600">
                  <span className="text-[10px] text-slate-450 uppercase font-bold block mb-1">Doctor Remarks</span>
                  {rx.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
