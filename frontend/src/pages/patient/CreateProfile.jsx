import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, RefreshCw, AlertCircle, Heart, User2, CheckCircle2, Lock } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../auth/AuthContext';

// Today's date — no future DOB allowed
const TODAY = new Date().toISOString().split('T')[0];
const MIN_DOB = `${new Date().getFullYear() - 120}-01-01`;

/* ── Reusable components ─────────────────────────────────────────── */
function FieldLabel({ children, required }) {
  return (
    <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1.5"
      style={{ color: '#6B7C75' }}>
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

// Read-only locked field — pre-filled, grayed, shows lock icon
function LockedField({ value, label }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <input
          type="text"
          readOnly
          value={value}
          className="w-full px-4 py-2.5 text-sm rounded-xl border outline-none select-none cursor-not-allowed"
          style={{
            borderColor: '#DCE4DF',
            backgroundColor: '#F5F7F5',
            color: '#4B5D57',
          }}
        />
        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
          style={{ color: '#8A9A94' }} />
      </div>
      <p className="text-[9px] mt-1 font-semibold" style={{ color: '#8A9A94' }}>
        From your registration — cannot be changed here
      </p>
    </div>
  );
}

function InputField({ error, ...props }) {
  return (
    <div>
      <input
        {...props}
        className="w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition-all focus:ring-2 focus:ring-teal-200 bg-white"
        style={{ borderColor: error ? '#F87171' : '#DCE4DF', color: '#12241F' }}
      />
      {error && (
        <p className="text-[10px] font-semibold mt-1 flex items-center gap-1 text-red-500">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

function SelectField({ children, error, ...props }) {
  return (
    <div>
      <select
        {...props}
        className="w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition-all focus:ring-2 focus:ring-teal-200 bg-white"
        style={{ borderColor: error ? '#F87171' : '#DCE4DF', color: '#12241F' }}
      >
        {children}
      </select>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, color = '#1F5F5B' }) {
  return (
    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-5">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}18` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <h3 className="font-bold text-sm" style={{ color: '#12241F' }}>{title}</h3>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────── */
export default function CreateProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Read-only values from AuthContext (set during signup / login) ──
  // Priority: signupEmail/Name/Phone localStorage → user object from JWT
  const lockedEmail = localStorage.getItem('signupEmail') || user?.email || '';
  const lockedName  = localStorage.getItem('signupName')  || user?.name  || '';
  const lockedPhone = localStorage.getItem('signupPhone') || user?.phone || '';

  // ── Editable fields ───────────────────────────────────────────────
  const [fatherName, setFatherName] = useState('');
  const [birthDate,  setBirthDate]  = useState('');
  const [gender,     setGender]     = useState('MALE');
  const [address,    setAddress]    = useState('');
  const [city,       setCity]       = useState('');
  const [state,      setState]      = useState('');
  const [pincode,    setPincode]    = useState('');
  const [bloodGroup, setBloodGroup] = useState('O_POSITIVE');
  const [height,     setHeight]     = useState('');
  const [weight,     setWeight]     = useState('');

  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [serverError, setServerError] = useState('');

  /* ── Validation ──────────────────────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!fatherName.trim())       e.fatherName = 'Father name is required';
    if (!birthDate)               e.birthDate  = 'Date of birth is required';
    else if (birthDate >= TODAY)  e.birthDate  = 'Date of birth must be in the past';
    if (!address.trim())          e.address    = 'Street address is required';
    if (!city.trim())             e.city       = 'City is required';
    if (!state.trim())            e.state      = 'State is required';
    if (!pincode.trim() || !/^\d{6}$/.test(pincode))
                                  e.pincode    = 'Enter a valid 6-digit pincode';
    if (height && (isNaN(height) || Number(height) < 50 || Number(height) > 250))
                                  e.height     = 'Valid height: 50–250 cm';
    if (weight && (isNaN(weight) || Number(weight) < 1 || Number(weight) > 500))
                                  e.weight     = 'Valid weight: 1–500 kg';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit ──────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/patients/profile', {
        name:    lockedName,
        email:   lockedEmail,
        phone:   lockedPhone,
        fatherName, birthDate, gender, address, city, state, pincode, bloodGroup,
        height:  height ? Number(height) : null,
        weight:  weight ? Number(weight) : null,
      });
      // Clear signup cache after successful profile creation
      ['signupName','signupEmail','signupPhone'].forEach(k => localStorage.removeItem(k));
      navigate('/patient/profile');
    } catch (err) {
      setServerError(err.response?.data?.message || err.response?.data || 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clr = (field) => () => setErrors(p => ({ ...p, [field]: '' }));

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: '#F5F7F5', fontFamily: 'Inter, sans-serif' }}>

      {/* Page header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: '#1F5F5B' }}>
          <Heart className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: '#12241F' }}>Electronic Medical Registry</h1>
        <p className="text-sm mt-1.5" style={{ color: '#6B7C75' }}>
          Complete your patient profile to enable appointment bookings
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-5">

        {/* Info banner */}
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold"
          style={{ backgroundColor: '#E4F2EC', color: '#1F5F5B', border: '1px solid #BFDED0' }}>
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Your <strong>name</strong>, <strong>email</strong> and <strong>phone</strong> are auto-filled from
            your registration and <strong>cannot be edited</strong>. Fill in the remaining details below.
          </span>
        </div>

        {serverError && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: '#F5E3D2', color: '#9A5B12', border: '1px solid #E7C696' }}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* ── Card 1: Personal Info ── */}
          <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#fff', border: '1px solid #DCE4DF' }}>
            <SectionHeader icon={User2} title="Personal Information" />

            <div className="space-y-4">

              {/* Full Name — LOCKED */}
              <LockedField label="Full Name" value={lockedName} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Email — LOCKED */}
                <LockedField label="Email Address" value={lockedEmail} />

                {/* Phone — LOCKED */}
                <LockedField label="Mobile Phone" value={lockedPhone} />

                {/* Father Name — editable */}
                <div>
                  <FieldLabel required>Father Name</FieldLabel>
                  <InputField
                    type="text" required value={fatherName}
                    onChange={e => { setFatherName(e.target.value); clr('fatherName')(); }}
                    placeholder="Father's full name"
                    error={errors.fatherName}
                  />
                </div>

                {/* Date of Birth — past dates only */}
                <div>
                  <FieldLabel required>Date of Birth</FieldLabel>
                  <InputField
                    type="date" required
                    value={birthDate}
                    min={MIN_DOB}
                    max={TODAY}
                    onChange={e => { setBirthDate(e.target.value); clr('birthDate')(); }}
                    error={errors.birthDate}
                  />
                  {!errors.birthDate && (
                    <p className="text-[9px] mt-1 font-semibold" style={{ color: '#8A9A94' }}>
                      Only past dates are allowed
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <FieldLabel required>Gender</FieldLabel>
                  <SelectField value={gender} onChange={e => setGender(e.target.value)}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </SelectField>
                </div>

                {/* Blood Group */}
                <div>
                  <FieldLabel required>Blood Group</FieldLabel>
                  <SelectField value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
                    <option value="A_POSITIVE">A Positive (A+)</option>
                    <option value="A_NEGATIVE">A Negative (A-)</option>
                    <option value="B_POSITIVE">B Positive (B+)</option>
                    <option value="B_NEGATIVE">B Negative (B-)</option>
                    <option value="AB_POSITIVE">AB Positive (AB+)</option>
                    <option value="AB_NEGATIVE">AB Negative (AB-)</option>
                    <option value="O_POSITIVE">O Positive (O+)</option>
                    <option value="O_NEGATIVE">O Negative (O-)</option>
                  </SelectField>
                </div>

                {/* Height */}
                <div>
                  <FieldLabel>Height (cm)</FieldLabel>
                  <InputField
                    type="number" min={50} max={250} value={height}
                    onChange={e => { setHeight(e.target.value); clr('height')(); }}
                    placeholder="e.g. 170" error={errors.height}
                  />
                </div>

                {/* Weight */}
                <div>
                  <FieldLabel>Weight (kg)</FieldLabel>
                  <InputField
                    type="number" min={1} max={500} value={weight}
                    onChange={e => { setWeight(e.target.value); clr('weight')(); }}
                    placeholder="e.g. 65" error={errors.weight}
                  />
                </div>

              </div>
            </div>
          </div>

          {/* ── Card 2: Address ── */}
          <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#fff', border: '1px solid #DCE4DF' }}>
            <SectionHeader icon={MapPin} title="Permanent Address" color="#C8862B" />
            <div className="space-y-4">
              <div>
                <FieldLabel required>Street Address</FieldLabel>
                <InputField
                  type="text" required value={address}
                  onChange={e => { setAddress(e.target.value); clr('address')(); }}
                  placeholder="House #, Street name, Locality..."
                  error={errors.address}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <FieldLabel required>City</FieldLabel>
                  <InputField
                    type="text" required value={city}
                    onChange={e => { setCity(e.target.value); clr('city')(); }}
                    placeholder="Delhi" error={errors.city}
                  />
                </div>
                <div>
                  <FieldLabel required>State</FieldLabel>
                  <InputField
                    type="text" required value={state}
                    onChange={e => { setState(e.target.value); clr('state')(); }}
                    placeholder="Delhi" error={errors.state}
                  />
                </div>
                <div>
                  <FieldLabel required>Pincode</FieldLabel>
                  <InputField
                    type="text" required maxLength={6}
                    value={pincode}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setPincode(v);
                      clr('pincode')();
                    }}
                    placeholder="110001" error={errors.pincode}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-px disabled:opacity-60"
            style={{ backgroundColor: '#1F5F5B', boxShadow: '0 8px 20px rgba(31,95,91,0.25)' }}
          >
            {loading
              ? <RefreshCw className="w-4 h-4 animate-spin" />
              : <><CheckCircle2 className="w-4 h-4" /> Register Identity Profile</>
            }
          </button>
        </form>
      </div>
    </div>
  );
}
