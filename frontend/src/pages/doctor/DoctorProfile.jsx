import React, { useState, useEffect } from 'react';
import { Mail, Phone, Stethoscope, Clock, RefreshCw, User } from 'lucide-react';
import api from '../../api/axios';

export default function DoctorProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/doctors/profile');
        setProfile(response.data);
      } catch (err) {
        console.error('Error fetching doctor profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card-base p-8 text-center max-w-md mx-auto text-slate-550 text-sm">
        No staff profile created. Contact operational administration.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-slate-900">Staff Registry Card</h2>
        <p className="text-xs text-slate-500 mt-0.5">Verify your clinical qualifications and department parameters</p>
      </div>

      <div className="card-base p-6 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center font-black text-slate-700 text-xl">
            {profile.name?.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">{profile.name}</h3>
            <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider block mt-0.5">
              {profile.specialization}
            </span>
            <span className="text-[10px] text-slate-400 font-mono block mt-1">Registry Code: DOC-{profile.id}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm text-slate-600">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Staff Email</span>
              <span className="font-semibold text-slate-800">{profile.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Extension Phone</span>
              <span className="font-semibold text-slate-800">{profile.phoneNumber || '—'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Stethoscope className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Consultation Fee</span>
              <span className="font-semibold text-slate-800">₹{profile.consultationFee} per session</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Hospital Tenure</span>
              <span className="font-semibold text-slate-800">{profile.experienceYears} Years of service</span>
            </div>
          </div>
        </div>

        {profile.bio && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Attending Biography</span>
            {profile.bio}
          </div>
        )}
      </div>
    </div>
  );
}
