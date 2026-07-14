import React, { useState, useEffect } from 'react';
import { Heart, Brain, Eye, Activity, Stethoscope, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

const staticDepsMeta = [
  { name: 'Cardiology', desc: 'Heart diagnostics, pulse monitors, and stroke care pipelines', icon: Heart, color: 'text-red-500 bg-red-50 border-red-100' },
  { name: 'Neurology', desc: 'Brain, nervous system, and motor coordination checkups', icon: Brain, color: 'text-purple-500 bg-purple-50 border-purple-100' },
  { name: 'Ophthalmology', desc: 'Eye health diagnostics, spectacle checks, and laser surgery operations', icon: Eye, color: 'text-blue-500 bg-blue-50 border-blue-100' },
  { name: 'Pediatrics', desc: 'Child health care, vaccinations, and growth stats tracking', icon: Activity, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
  { name: 'General Medicine', desc: 'General healthcare checkups, viral fever, and health reports management', icon: Stethoscope, color: 'text-amber-500 bg-amber-50 border-amber-100' },
];

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/departments');
        setDepartments(response.data);
      } catch (err) {
        console.error('Error fetching departments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  const getDepDetails = (depName) => {
    const meta = staticDepsMeta.find(d => d.name.toLowerCase() === depName.toLowerCase());
    if (meta) return meta;
    return {
      name: depName,
      desc: 'General clinical services and specialist consultations',
      icon: Stethoscope,
      color: 'text-primary bg-slate-50 border-slate-200'
    };
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
        <h2 className="text-xl font-bold text-slate-900">Hospital Departments</h2>
        <p className="text-xs text-slate-500 mt-0.5">Explore medical specialties and clinical hubs</p>
      </div>

      {departments.length === 0 ? (
        <div className="card-base p-12 text-center text-slate-400 text-sm">
          No hospital departments found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {departments.map((dep, idx) => {
            const details = getDepDetails(dep.name);
            const Icon = details.icon;
            return (
              <div key={dep.id || idx} className="card-base p-6 space-y-4 hover:border-slate-350 transition-colors">
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${details.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-sm leading-none">{dep.name}</h3>
                  {dep.headDoctorName && dep.headDoctorName !== '—' && (
                    <span className="text-[10px] text-slate-400 font-semibold block pt-1">
                      Head: {dep.headDoctorName}
                    </span>
                  )}
                  <p className="text-xs text-slate-550 leading-relaxed pt-1.5">{details.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
