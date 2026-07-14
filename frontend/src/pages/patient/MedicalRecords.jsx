import React, { useState, useEffect } from 'react';
import { HeartPulse, User, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await api.get('/medical-records/my');
        setRecords(response.data);
      } catch (err) {
        console.error('Error fetching records:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
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
        <h2 className="text-xl font-bold text-slate-900">Medical Charts Timeline</h2>
        <p className="text-xs text-slate-500 mt-0.5">Chronological summary of clinical visits and diagnoses logs</p>
      </div>

      {records.length === 0 ? (
        <div className="card-base p-12 text-center">
          <HeartPulse className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">No historical logs</h3>
          <p className="text-slate-500 text-xs mt-1">Diagnostic summaries pop up here after sessions</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
          {records.map((rec) => {
            const date = new Date(rec.visitDate);
            return (
              <div key={rec.id} className="relative">
                {/* Timeline node */}
                <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-primary flex items-center justify-center" />

                <div className="card-base p-5 space-y-3 max-w-xl">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold">{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <h4 className="font-bold text-slate-800 text-sm mt-0.5">Diagnosis: {rec.diagnosis}</h4>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">ID: #{rec.id}</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Specialist: {rec.doctorName}</span>
                    </div>
                    {rec.notes && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 text-slate-650">
                        <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Clinical Log Summary</span>
                        {rec.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
