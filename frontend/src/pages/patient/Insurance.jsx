import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Calendar, Award, RefreshCw, CheckCircle2,
  Trash2, Edit3, AlertCircle, CreditCard, Plus, X
} from 'lucide-react';
import api from '../../api/axios';

const TODAY = new Date().toISOString().split('T')[0];

export default function Insurance() {
  const [insurance, setInsurance]     = useState(null);   // loaded card
  const [profile, setProfile]         = useState(null);   // for member name
  const [loading, setLoading]         = useState(true);

  // form fields
  const [provider,        setProvider]        = useState('');
  const [policyNumber,    setPolicyNumber]    = useState('');
  const [validUntil,      setValidUntil]      = useState('');
  const [coverageAmount,  setCoverageAmount]  = useState('');

  // ui
  const [showForm, setShowForm]   = useState(false);
  const [saving,   setSaving]     = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [msg,      setMsg]        = useState('');
  const [msgType,  setMsgType]    = useState('ok'); // 'ok' | 'err'
  const [errors,   setErrors]     = useState({});

  /* ── helpers ──────────────────────────────────────────────────────────── */
  const flashMsg = (text, type = 'ok') => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), 4000);
  };

  const populateForm = (ins) => {
    setProvider(ins.provider || '');
    setPolicyNumber(ins.policyNumber || '');
    setValidUntil(ins.validUntil || ins.expiryDate || '');
    setCoverageAmount(ins.coverageAmount?.toString() || '');
  };

  /* ── data fetching ────────────────────────────────────────────────────── */
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [profileRes, insRes] = await Promise.allSettled([
        api.get('/patients/profile'),
        api.get('/patients/insurance'),
      ]);

      if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);

      if (insRes.status === 'fulfilled' && insRes.value.data?.id) {
        const ins = insRes.value.data;
        setInsurance(ins);
        populateForm(ins);
        setShowForm(false);
      } else {
        setInsurance(null);
        setShowForm(true); // no card — show form immediately
      }
    } catch (err) {
      console.error('Insurance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  /* ── validation ───────────────────────────────────────────────────────── */
  const validate = () => {
    const errs = {};
    if (!provider.trim() || provider.trim().length < 3)
      errs.provider = 'Provider name must be at least 3 characters';
    if (!policyNumber.trim() || policyNumber.trim().length < 5)
      errs.policyNumber = 'Policy ID must be at least 5 characters';
    if (!validUntil)
      errs.validUntil = 'Expiry date is required';
    else if (validUntil <= TODAY)
      errs.validUntil = 'Expiry date must be a future date';
    if (!coverageAmount || isNaN(coverageAmount) || Number(coverageAmount) < 10000)
      errs.coverageAmount = 'Minimum coverage amount is ₹10,000';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clr = (field) => () => setErrors(p => ({ ...p, [field]: '' }));

  /* ── save (POST if no card, PUT if card exists) ───────────────────────── */
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        provider:       provider.trim(),
        policyNumber:   policyNumber.trim(),
        validUntil,
        coverageAmount: Number(coverageAmount),
      };

      if (insurance) {
        // Update existing
        await api.put('/patients/insurance', payload);
      } else {
        // Create new
        await api.post('/patients/insurance', payload);
      }

      flashMsg('✅ Insurance policy saved successfully!', 'ok');
      setShowForm(false);
      fetchAll();
    } catch (err) {
      flashMsg('❌ Failed to save insurance. Please try again.', 'err');
    } finally {
      setSaving(false);
    }
  };

  /* ── delete ───────────────────────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!window.confirm('Remove your insurance policy? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete('/patients/insurance');
      setInsurance(null);
      setProvider(''); setPolicyNumber(''); setValidUntil(''); setCoverageAmount('');
      setShowForm(true);
      flashMsg('🗑️ Insurance policy removed successfully.', 'ok');
    } catch {
      flashMsg('❌ Failed to delete insurance. Please try again.', 'err');
    } finally {
      setDeleting(false);
    }
  };

  /* ── loading ──────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <RefreshCw className="w-7 h-7 text-teal-600 animate-spin" />
      </div>
    );
  }

  /* ── render ───────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6 max-w-lg mx-auto px-4 py-6 font-sans">

      {/* Page header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Health Insurance</h2>
        <p className="text-xs text-slate-500 mt-0.5">Manage policy providers, coverages, and claim limits</p>
      </div>

      {/* Flash message */}
      {msg && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold"
          style={{
            backgroundColor: msgType === 'ok' ? '#E4F2EC' : '#FEE2E2',
            color:           msgType === 'ok' ? '#1F5F5B' : '#B91C1C',
            border:          `1px solid ${msgType === 'ok' ? '#BFDED0' : '#FECACA'}`,
          }}
        >
          {msgType === 'ok'
            ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            : <AlertCircle  className="w-4 h-4 text-red-500 shrink-0" />}
          <span>{msg}</span>
        </div>
      )}

      {/* ── INSURANCE CARD DISPLAY ── */}
      {insurance ? (
        <div className="space-y-4">
          {/* Card */}
          <div
            className="relative overflow-hidden rounded-2xl p-6 text-white shadow-xl transition-all hover:scale-[1.01]"
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
              boxShadow: '0 20px 40px -15px rgba(15,23,42,0.5)',
            }}
          >
            {/* background blobs */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl translate-y-12 -translate-x-12 pointer-events-none" />

            {/* Header row */}
            <div className="flex justify-between items-start relative z-10">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-blue-300 font-extrabold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> HEALTH INSURANCE
                </span>
                <h3 className="text-base font-black tracking-tight text-white mt-1">
                  {insurance.provider}
                </h3>
              </div>
              {/* Chip */}
              <div className="w-10 h-8 rounded bg-gradient-to-br from-amber-400 to-amber-200 opacity-80 flex items-center justify-center shadow-inner" />
            </div>

            {/* Member + Policy */}
            <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
              <div>
                <span className="text-[8px] text-slate-400 uppercase tracking-wider block font-bold">Member Name</span>
                <span className="text-sm font-semibold text-white tracking-wide block mt-0.5">
                  {profile?.name || 'MEMBER'}
                </span>
              </div>
              <div>
                <span className="text-[8px] text-slate-400 uppercase tracking-wider block font-bold">Policy Number</span>
                <span className="text-sm font-mono font-bold text-blue-100 tracking-wider block mt-0.5">
                  {insurance.policyNumber?.replace(/(.{4})/g, '$1 ').trim()}
                </span>
              </div>
            </div>

            {/* Expiry + Coverage */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10 text-[9px] text-slate-400 relative z-10">
              <div>
                <span className="uppercase tracking-wider font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Valid Until
                </span>
                <span className="block font-bold text-slate-100 mt-1 text-xs">
                  {insurance.validUntil
                    ? new Date(insurance.validUntil).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                    : '—'}
                </span>
              </div>
              <div>
                <span className="uppercase tracking-wider font-bold flex items-center gap-1">
                  <Award className="w-3 h-3" /> Coverage Limit
                </span>
                <span className="block font-extrabold text-emerald-400 mt-1 text-xs">
                  ₹{Number(insurance.coverageAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Card action buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => { setShowForm(!showForm); if (!showForm) populateForm(insurance); }}
              className="px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all hover:bg-slate-50"
              style={{ borderColor: '#DCE4DF', color: '#1F5F5B' }}
            >
              <Edit3 className="w-3.5 h-3.5" />
              {showForm ? 'Hide Form' : 'Update Policy'}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-red-200 text-red-600 bg-red-50 flex items-center gap-1.5 transition-all hover:bg-red-100 disabled:opacity-50"
            >
              {deleting
                ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                : <><Trash2 className="w-3.5 h-3.5" /> Delete Coverage</>}
            </button>
          </div>
        </div>
      ) : (
        /* No insurance — empty state */
        !showForm && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <p className="font-bold text-slate-700">No Insurance Policy Linked</p>
              <p className="text-xs text-slate-400 mt-1">Register your health insurance to streamline claims and billing</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{ backgroundColor: '#1F5F5B' }}
            >
              <Plus className="w-4 h-4" /> Register New Policy
            </button>
          </div>
        )
      )}

      {/* ── FORM (create / update) ── */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-teal-600" />
              {insurance ? 'Modify Existing Policy' : 'Register New Health Policy'}
            </h4>
            {insurance && (
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Provider */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">
              Policy Provider
            </label>
            <input
              type="text"
              value={provider}
              onChange={e => { setProvider(e.target.value); clr('provider')(); }}
              placeholder="e.g. Star Health Insurance"
              className="w-full px-4 py-2.5 text-sm rounded-xl border outline-none focus:border-teal-500 transition-all bg-white"
              style={{ borderColor: errors.provider ? '#F87171' : '#DCE4DF' }}
            />
            {errors.provider && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.provider}</p>}
          </div>

          {/* Policy Number */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">
              Policy Code / ID
            </label>
            <input
              type="text"
              value={policyNumber}
              onChange={e => { setPolicyNumber(e.target.value); clr('policyNumber')(); }}
              placeholder="e.g. 895641555"
              className="w-full px-4 py-2.5 text-sm rounded-xl border outline-none focus:border-teal-500 transition-all bg-white"
              style={{ borderColor: errors.policyNumber ? '#F87171' : '#DCE4DF' }}
            />
            {errors.policyNumber && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.policyNumber}</p>}
          </div>

          {/* Expiry + Coverage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">
                Expiry Date
              </label>
              <input
                type="date"
                min={TODAY}
                value={validUntil}
                onChange={e => { setValidUntil(e.target.value); clr('validUntil')(); }}
                className="w-full px-4 py-2.5 text-sm rounded-xl border outline-none focus:border-teal-500 transition-all bg-white"
                style={{ borderColor: errors.validUntil ? '#F87171' : '#DCE4DF' }}
              />
              {errors.validUntil
                ? <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.validUntil}</p>
                : <p className="text-[9px] text-slate-400 mt-1">Must be a future date</p>}
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">
                Coverage Limit (₹)
              </label>
              <input
                type="number"
                value={coverageAmount}
                onChange={e => { setCoverageAmount(e.target.value); clr('coverageAmount')(); }}
                placeholder="e.g. 500000"
                className="w-full px-4 py-2.5 text-sm rounded-xl border outline-none focus:border-teal-500 transition-all bg-white"
                style={{ borderColor: errors.coverageAmount ? '#F87171' : '#DCE4DF' }}
              />
              {errors.coverageAmount && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.coverageAmount}</p>}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ backgroundColor: '#1F5F5B', boxShadow: '0 6px 16px rgba(31,95,91,0.25)' }}
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : (insurance ? 'Update Insurance Card' : 'Save Insurance Card')}
          </button>
        </form>
      )}
    </div>
  );
}
