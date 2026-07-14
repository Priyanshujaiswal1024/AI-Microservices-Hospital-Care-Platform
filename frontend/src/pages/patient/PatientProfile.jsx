import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Home, MapPin, Droplets, Award, Activity, Heart, Edit, Check, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

export default function PatientProfile() {
  const [profile, setProfile] = useState(null);
  const [insurance, setInsurance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // Edit fields state
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const [profileRes, insRes] = await Promise.allSettled([
        api.get('/patients/profile'),
        api.get('/patients/insurance'),
      ]);
      if (profileRes.status === 'fulfilled') {
        const d = profileRes.value.data;
        setProfile(d);
        setPhone(d.phone || '');
        setAddress(d.address || '');
        setCity(d.city || '');
        setPincode(d.pincode || '');
        setHeight(d.height || '');
        setWeight(d.weight || '');
      }
      if (insRes.status === 'fulfilled' && insRes.value.data?.id) {
        setInsurance(insRes.value.data);
      } else {
        setInsurance(null);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/patients/profile', {
        phone,
        address,
        city,
        pincode,
        height: Number(height),
        weight: Number(weight)
      });
      setEditing(false);
      fetchProfile();
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card-base p-8 text-center max-w-md mx-auto">
        <h3 className="text-lg font-bold text-slate-800">No Patient Record</h3>
        <p className="text-slate-500 text-sm mt-1 mb-4">Please initialize your patient profile card details</p>
        <button onClick={() => window.location.href = '/patient/create-profile'} className="btn-primary">
          Register Patient Card
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Personal Medical Record</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage your clinical vitals and emergency contact card</p>
        </div>
        <button
          onClick={() => { if (editing) handleSave(); else setEditing(true); }}
          className={editing ? "px-4 py-2 bg-success text-white text-xs font-semibold rounded-lg hover:bg-green-700" : "btn-primary"}
        >
          {editing ? (
            <span className="flex items-center gap-1.5">{saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save Card</span>
          ) : (
            <span className="flex items-center gap-1.5"><Edit className="w-3.5 h-3.5" /> Edit Profile</span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Vitals & Blood Group */}
        <div className="space-y-6">
          <div className="card-base p-6 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-700 font-extrabold text-2xl">
              {profile.name?.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight">{profile.name}</h3>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mt-1">EMR Registrant</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-center">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Blood Group</span>
                <span className="text-sm font-bold text-slate-700 mt-1 block">{profile.bloodGroup?.replace('_', ' ')}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Gender</span>
                <span className="text-sm font-bold text-slate-700 mt-1 block">{profile.gender}</span>
              </div>
            </div>
          </div>

          {/* Height & Weight */}
          <div className="card-base p-6 space-y-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Body Mass Records
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1">Height (cm)</label>
                {editing ? (
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="input-field"
                  />
                ) : (
                  <span className="text-md font-bold text-slate-800 block">{profile.height || '—'} <span className="text-xs text-slate-400 font-medium">cm</span></span>
                )}
              </div>
              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1">Weight (kg)</label>
                {editing ? (
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="input-field"
                  />
                ) : (
                  <span className="text-md font-bold text-slate-800 block">{profile.weight || '—'} <span className="text-xs text-slate-400 font-medium">kg</span></span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Registry Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-base p-6 space-y-6">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-primary" /> Clinical Identifiers
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="flex gap-3">
                <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                <div>
                  <span className="text-xs text-slate-400 block">Registered Email</span>
                  <span className="font-semibold text-slate-800">{profile.email}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                <div className="w-full">
                  <span className="text-xs text-slate-400 block">Mobile Phone</span>
                  {editing ? (
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-field mt-1"
                    />
                  ) : (
                    <span className="font-semibold text-slate-800">{profile.phone || '—'}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Home className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                <div className="w-full">
                  <span className="text-xs text-slate-400 block">Address Line</span>
                  {editing ? (
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="input-field mt-1"
                    />
                  ) : (
                    <span className="font-semibold text-slate-800">{profile.address || '—'}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                <div className="grid grid-cols-2 gap-2 w-full">
                  <div>
                    <span className="text-xs text-slate-400 block">City</span>
                    {editing ? (
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="input-field mt-1"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">{profile.city || '—'}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Pincode</span>
                    {editing ? (
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="input-field mt-1"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">{profile.pincode || '—'}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insurance Card */}
          <div className="card-base p-6">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Award className="w-4 h-4 text-primary" /> Active Health Coverage Policy
            </h4>
            {insurance ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-450 block">Provider</span>
                  <span className="font-bold text-slate-800 mt-1 block">{insurance.provider}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-450 block">Policy ID</span>
                  <span className="font-bold text-slate-800 mt-1 block font-mono">{insurance.policyNumber}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-450 block">Valid Until</span>
                  <span className="font-bold text-slate-800 mt-1 block">
                    {insurance.validUntil
                      ? new Date(insurance.validUntil).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                      : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-450 block">Claims Limit</span>
                  <span className="font-bold text-green-600 mt-1 block">₹{Number(insurance.coverageAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-slate-400 text-xs font-semibold">
                No insurance policy card has been linked. Link one in the sidebar.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
