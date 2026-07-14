import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserCheck, Star, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

export default function FindDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get('/doctors');
        const docsList = response.data?.content || (Array.isArray(response.data) ? response.data : []);
        setDoctors(docsList);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doc) =>
    doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h2 className="text-xl font-bold text-slate-900">Hospital Specialists</h2>
        <p className="text-xs text-slate-500 mt-0.5">Explore medical staff profiles, availability rates, and booking links</p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by name or specialty..."
          className="input-field pl-9"
        />
      </div>

      {filteredDoctors.length === 0 ? (
        <div className="card-base p-12 text-center text-slate-400 text-sm">
          No medical specialists found matching details.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div key={doc.id} className="card-base p-5 flex flex-col justify-between hover:border-slate-350 transition-colors">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 font-bold text-lg">
                  {doc.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{doc.name}</h3>
                  <span className="text-[10px] uppercase font-bold text-primary block mt-0.5">
                    {doc.specialization}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                  <div>
                    <span>Consultation Fee</span>
                    <span className="block font-bold text-slate-800 mt-0.5">₹{doc.consultationFee}</span>
                  </div>
                  <div>
                    <span>Experience</span>
                    <span className="block font-bold text-slate-800 mt-0.5">{doc.experienceYears} Years</span>
                  </div>
                </div>
              </div>

              <Link
                to={`/patient/doctors/${doc.id}/book`}
                className="w-full mt-5 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg text-center text-xs transition-colors shadow-sm block"
              >
                Schedule Session
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
