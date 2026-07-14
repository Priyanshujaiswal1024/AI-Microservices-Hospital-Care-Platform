import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
  TrendingUp, Users, Calendar, Pill, CreditCard,
  RefreshCw, LogOut, HeartPulse, AlertTriangle, ShieldCheck,
  Plus, CheckCircle, Trash2, Download, Building, ShieldAlert,
  Menu, X, ChevronRight, Activity
} from 'lucide-react';
import api from '../../api/axios';

// ─── Validation Helpers ───────────────────────────────────────────────────────
const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const validatePhone = (v) => /^[6-9]\d{9}$/.test(v.replace(/\s/g, ''));
const validatePassword = (v) => v.length >= 8;

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="text-red-500 text-[10px] font-semibold mt-0.5">{msg}</p>;
}

function Alert({ type, msg }) {
  if (!msg) return null;
  const styles = {
    error: 'bg-red-50 border border-red-200 text-red-700',
    success: 'bg-emerald-50 border border-emerald-200 text-emerald-700',
  };
  const icons = { error: <AlertTriangle className="w-3.5 h-3.5 shrink-0" />, success: <CheckCircle className="w-3.5 h-3.5 shrink-0" /> };
  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg text-xs font-semibold ${styles[type]}`}>
      {icons[type]} {msg}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [bills, setBills] = useState([]);

  // Doctor form
  const [doc, setDoc] = useState({ name: '', email: '', password: '', specialization: '', fee: '', exp: '', phone: '', bio: '', deptId: '' });
  const [docErrs, setDocErrs] = useState({});
  const [docMsg, setDocMsg] = useState({ type: '', text: '' });
  const [docSaving, setDocSaving] = useState(false);

  // Department form
  const [dept, setDept] = useState({ name: '', headId: '' });
  const [deptMsg, setDeptMsg] = useState({ type: '', text: '' });
  const [deptSaving, setDeptSaving] = useState(false);

  // Medicine form
  const [med, setMed] = useState({ name: '', category: '', type: 'TABLET', dosage: '', manufacturer: '', price: '', stock: '' });
  const [medErrs, setMedErrs] = useState({});
  const [medMsg, setMedMsg] = useState({ type: '', text: '' });
  const [medSaving, setMedSaving] = useState(false);

  // Admin form
  const [adm, setAdm] = useState({ username: '', password: '' });
  const [admErrs, setAdmErrs] = useState({});
  const [admMsg, setAdmMsg] = useState({ type: '', text: '' });
  const [admSaving, setAdmSaving] = useState(false);

  // ─── Fetch helpers ───────────────────────────────────────────────────────────
  const fetchDashboard = async () => {
    try { const r = await api.get('/admin/dashboard'); setData(r.data); } catch {}
  };
  const fetchDoctors = async () => {
    try {
      const r = await api.get('/doctors');
      setDoctors(r.data?.content || (Array.isArray(r.data) ? r.data : []));
    } catch {}
  };
  const fetchDepartments = async () => {
    try { const r = await api.get('/departments'); setDepartments(r.data || []); } catch {}
  };
  const fetchMedicines = async () => {
    try { const r = await api.get('/medicines'); setMedicines(r.data || []); } catch {}
  };
  const fetchBills = async () => {
    try { const r = await api.get('/bills'); setBills(r.data || []); } catch {}
  };
  const fetchPatients = async () => {
    try { const r = await api.get('/patients?page=0&size=100'); setPatients(r.data || []); } catch {}
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchDashboard(), fetchDoctors(), fetchDepartments(), fetchMedicines(), fetchBills(), fetchPatients()]);
      setLoading(false);
    };
    init();
  }, []);

  // ─── Doctor validation ───────────────────────────────────────────────────────
  const validateDoc = () => {
    const e = {};
    if (!doc.name.trim()) e.name = 'Full name is required';
    if (!validateEmail(doc.email)) e.email = 'Enter a valid email address';
    if (!validatePassword(doc.password)) e.password = 'Password must be at least 8 characters';
    if (!doc.specialization.trim()) e.specialization = 'Specialization is required';
    if (!doc.fee || isNaN(doc.fee) || Number(doc.fee) <= 0) e.fee = 'Enter a valid consultation fee';
    if (!doc.exp || isNaN(doc.exp) || Number(doc.exp) < 0) e.exp = 'Enter valid experience years';
    if (!validatePhone(doc.phone)) e.phone = 'Enter a valid 10-digit Indian mobile number';
    setDocErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleOnboardDoctor = async (e) => {
    e.preventDefault();
    if (!validateDoc()) return;
    setDocSaving(true);
    setDocMsg({ type: '', text: '' });
    try {
      await api.post('/doctors', {
        username: doc.email, password: doc.password, name: doc.name,
        email: doc.email, consultationFee: Number(doc.fee),
        specialization: doc.specialization, experienceYears: Number(doc.exp),
        phoneNumber: doc.phone, bio: doc.bio,
        departmentId: doc.deptId ? Number(doc.deptId) : null, profileImageUrl: ''
      });
      setDocMsg({ type: 'success', text: `Dr. ${doc.name} successfully onboarded!` });
      setDoc({ name: '', email: '', password: '', specialization: '', fee: '', exp: '', phone: '', bio: '', deptId: '' });
      setDocErrs({});
      fetchDoctors(); fetchDashboard();
    } catch (err) {
      setDocMsg({ type: 'error', text: err.response?.data?.message || 'Failed to onboard doctor.' });
    } finally {
      setDocSaving(false);
    }
  };

  // ─── Department submit ────────────────────────────────────────────────────────
  const handleCreateDept = async (e) => {
    e.preventDefault();
    if (!dept.name.trim()) { setDeptMsg({ type: 'error', text: 'Department name is required.' }); return; }
    setDeptSaving(true);
    setDeptMsg({ type: '', text: '' });
    try {
      await api.post('/departments', { name: dept.name, headDoctorId: dept.headId ? Number(dept.headId) : null });
      setDeptMsg({ type: 'success', text: `Department "${dept.name}" created successfully!` });
      setDept({ name: '', headId: '' });
      fetchDepartments();
    } catch (err) {
      setDeptMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create department.' });
    } finally {
      setDeptSaving(false);
    }
  };

  // ─── Medicine validation ──────────────────────────────────────────────────────
  const validateMed = () => {
    const e = {};
    if (!med.name.trim()) e.name = 'Drug name is required';
    if (!med.category.trim()) e.category = 'Category is required';
    if (!med.dosage.trim()) e.dosage = 'Dosage is required';
    if (!med.manufacturer.trim()) e.manufacturer = 'Manufacturer is required';
    if (!med.price || isNaN(med.price) || Number(med.price) <= 0) e.price = 'Enter a valid price';
    if (!med.stock || isNaN(med.stock) || Number(med.stock) < 0) e.stock = 'Enter valid stock quantity';
    setMedErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    if (!validateMed()) return;
    setMedSaving(true);
    setMedMsg({ type: '', text: '' });
    try {
      await api.post('/medicines', { ...med, price: Number(med.price), stock: Number(med.stock) });
      setMedMsg({ type: 'success', text: `Medicine "${med.name}" added successfully!` });
      setMed({ name: '', category: '', type: 'TABLET', dosage: '', manufacturer: '', price: '', stock: '' });
      setMedErrs({});
      fetchMedicines(); fetchDashboard();
    } catch (err) {
      setMedMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add medicine.' });
    } finally {
      setMedSaving(false);
    }
  };

  // ─── Admin validation ─────────────────────────────────────────────────────────
  const validateAdm = () => {
    const e = {};
    if (!validateEmail(adm.username)) e.username = 'Enter a valid email address';
    if (!validatePassword(adm.password)) e.password = 'Password must be at least 8 characters';
    setAdmErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!validateAdm()) return;
    setAdmSaving(true);
    setAdmMsg({ type: '', text: '' });
    try {
      await api.post('/admin/create-admin', { username: adm.username, password: adm.password });
      setAdmMsg({ type: 'success', text: 'Admin account provisioned successfully!' });
      setAdm({ username: '', password: '' });
      setAdmErrs({});
    } catch (err) {
      setAdmMsg({ type: 'error', text: err.response?.data?.message || 'Failed to provision admin.' });
    } finally {
      setAdmSaving(false);
    }
  };

  const handleMarkPaid = async (billId) => {
    try { await api.patch(`/bills/${billId}/mark-paid`); fetchBills(); fetchDashboard(); }
    catch { alert('Failed to mark bill as paid.'); }
  };

  const handleDownloadInvoice = async (billId) => {
    try {
      const r = await api.get(`/bills/${billId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.setAttribute('download', `invoice-${billId}.pdf`);
      document.body.appendChild(a); a.click(); a.remove();
    } catch { alert('Failed to download invoice.'); }
  };

  const handleDeleteDoctor = async (id) => {
    if (!confirm('Remove this specialist from the hospital roster?')) return;
    try { await api.delete(`/doctors/${id}`); fetchDoctors(); fetchDashboard(); }
    catch { alert('Failed to remove doctor.'); }
  };

  // ─── Sidebar navigation config ────────────────────────────────────────────────
  const tabs = [
    { id: 'overview', label: 'Dashboard Overview', icon: TrendingUp },
    { id: 'patients', label: 'Registered Patients', icon: Users },
    { id: 'doctors', label: 'Manage Specialists', icon: HeartPulse },
    { id: 'departments', label: 'Departments', icon: Building },
    { id: 'pharmacy', label: 'Pharmacy Registers', icon: Pill },
    { id: 'billing', label: 'Billing & Invoices', icon: CreditCard },
    { id: 'security', label: 'Security & Admins', icon: ShieldAlert },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-10 h-10 text-primary animate-spin" />
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Loading Admin Portal…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">

      {/* Desktop Sidebar (hidden on mobile, visible on desktop) */}
      <aside
        className={`hidden md:flex ${sidebarOpen ? 'w-60' : 'w-16'} bg-white border-r border-slate-200 flex-col justify-between transition-all duration-300 shrink-0 shadow-sm`}
        style={{ minHeight: '100vh' }}
      >
        {/* Logo area */}
        <div>
          <div className={`flex items-center ${sidebarOpen ? 'gap-3 px-5 py-5' : 'justify-center px-2 py-5'} border-b border-slate-100`}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shrink-0 shadow shadow-primary/25">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-[9px] text-primary uppercase font-bold tracking-widest leading-none">Administration</p>
                <h2 className="text-sm font-extrabold text-slate-900 mt-0.5 leading-none whitespace-nowrap">Priyansh Care Portal</h2>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="px-2 pt-4 space-y-0.5">
            {tabs.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  title={!sidebarOpen ? label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group
                    ${active
                      ? 'bg-primary text-white shadow shadow-primary/20'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    } ${!sidebarOpen ? 'justify-center' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`} />
                  {sidebarOpen && <span className="truncate">{label}</span>}
                  {sidebarOpen && active && <ChevronRight className="w-3 h-3 ml-auto opacity-70" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: collapse toggle + sign out */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            {sidebarOpen && <span>Collapse</span>}
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (visible only on mobile, managed by state) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer content */}
          <aside className="relative flex w-60 max-w-xs flex-1 flex-col justify-between bg-white border-r border-slate-200">
            <div>
              {/* Header with Close Button */}
              <div className="p-5 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shrink-0 shadow shadow-primary/25">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[9px] text-primary uppercase font-bold tracking-widest leading-none">Administration</p>
                    <h2 className="text-xs font-extrabold text-slate-900 mt-0.5 leading-none">Priyansh Care</h2>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-650 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="px-2 pt-4 space-y-0.5 overflow-y-auto max-h-[calc(100vh-140px)]">
                {tabs.map(({ id, label, icon: Icon }) => {
                  const active = activeTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group
                        ${active
                          ? 'bg-primary text-white shadow shadow-primary/20'
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Footer Sign Out */}
            <div className="p-3 border-t border-slate-100">
              <button
                onClick={() => { setMobileMenuOpen(false); logout(); navigate('/login'); }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-red-650 hover:bg-red-50/50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-7">

        {/* Page Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-extrabold text-slate-900 truncate">
                {tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-[10px] md:text-xs text-slate-450 mt-0.5">Priyansh Care Hospital — Secured Administrative Portal</p>
            </div>
          </div>
          <button
            onClick={() => { fetchDashboard(); fetchDoctors(); fetchDepartments(); fetchMedicines(); fetchBills(); }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
          </button>
        </div>

        {/* ── OVERVIEW ─────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {[
                { label: 'Registered Patients', val: data?.totalPatients ?? 0, icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-100', tab: 'patients' },
                { label: 'Active Specialists', val: data?.totalDoctors ?? 0, icon: HeartPulse, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', tab: 'doctors' },
                { label: 'Total Appointments', val: data?.totalAppointments ?? 0, icon: Calendar, color: 'text-purple-600 bg-purple-50 border-purple-100', tab: 'overview' }, // keeps on dashboard
                { label: 'Gross Revenue', val: `₹${(data?.totalRevenue ?? 0).toLocaleString()}`, icon: TrendingUp, color: 'text-amber-600 bg-amber-50 border-amber-100', tab: 'billing' },
              ].map(({ label, val, icon: Icon, color, tab }) => (
                <div key={label} onClick={() => setActiveTab(tab)} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-455">{label}</p>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">{val}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Line Chart */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Weekly Booking Trend</p>
                <svg viewBox="0 0 500 180" className="w-full">
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15"/>
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  {[30, 80, 130].map(y => (
                    <line key={y} x1="30" x2="480" y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1"/>
                  ))}
                  <path d="M 50 140 C 110 100, 140 60, 190 90 S 280 30, 330 50 S 420 70, 460 60 L 460 155 L 50 155 Z" fill="url(#lineGrad)"/>
                  <path d="M 50 140 C 110 100, 140 60, 190 90 S 280 30, 330 50 S 420 70, 460 60" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  {[[50,140],[190,90],[330,50],[460,60]].map(([cx,cy]) => (
                    <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill="white" stroke="#2563eb" strokeWidth="2"/>
                  ))}
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i) => (
                    <text key={d} x={50 + i*65} y="172" fontSize="10" fill="#94a3b8" textAnchor="middle" fontWeight="600">{d}</text>
                  ))}
                </svg>
              </div>

              {/* Bar Chart */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Department Distribution</p>
                <div className="flex items-end justify-around h-40 pb-2">
                  {[
                    { name: 'Cardio', val: 78, color: 'bg-red-400' },
                    { name: 'Neuro', val: 45, color: 'bg-purple-400' },
                    { name: 'Ophthal', val: 63, color: 'bg-blue-400' },
                    { name: 'Pediatrics', val: 90, color: 'bg-emerald-400' },
                    { name: 'General', val: 72, color: 'bg-amber-400' },
                  ].map((b) => (
                    <div key={b.name} className="flex flex-col items-center gap-1.5 w-14">
                      <span className="text-[10px] font-bold text-slate-600">{b.val}%</span>
                      <div className="w-full bg-slate-100 rounded-lg" style={{ height: '120px' }}>
                        <div className={`w-full ${b.color} rounded-lg transition-all duration-700`} style={{ height: `${b.val}%`, marginTop: `${100 - b.val}%` }}/>
                      </div>
                      <span className="text-[9px] font-semibold text-slate-400 truncate max-w-full">{b.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pharmacy + Billing row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-500" /> Pharmacy Inventory
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Registered Drugs</p>
                    <p className="text-xl font-black text-slate-900 mt-1">{data?.totalMedicines ?? 0}</p>
                  </div>
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                    <p className="text-[10px] text-red-600 font-bold uppercase">Low Stock Alerts</p>
                    <p className="text-xl font-black text-red-500 mt-1">{data?.lowStockCount ?? 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-500" /> Billing Status
                </p>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-700">Awaiting Payment</p>
                    <p className="text-[10px] text-amber-600 mt-0.5">Visits completed but not cleared</p>
                  </div>
                  <span className="text-xl font-black text-amber-600">{data?.unpaidBillCount ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── DOCTORS ──────────────────────────────────────── */}
        {activeTab === 'doctors' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">
            {/* List */}
            <div className="xl:col-span-2 space-y-4">
              {doctors.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-400">No active specialists registered.</p>
                  <p className="text-xs text-slate-350 mt-1">Use the form on the right to onboard your first doctor.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctors.map((d) => (
                    <div key={d.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-11 h-11 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center font-black text-primary text-lg">
                          {d.name?.charAt(0)}
                        </div>
                        <button onClick={() => handleDeleteDoctor(d.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{d.name}</h3>
                      <span className="text-[10px] uppercase font-extrabold text-primary tracking-wide">{d.specialization}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{d.email}</p>
                      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                        <div><span className="block">Consultation Fee</span><span className="font-bold text-slate-800">₹{d.consultationFee}</span></div>
                        <div><span className="block">Experience</span><span className="font-bold text-slate-800">{d.experienceYears} yrs</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-fit space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">Onboard Specialist</h3>
              </div>

              <Alert type={docMsg.type} msg={docMsg.text} />

              <form onSubmit={handleOnboardDoctor} className="space-y-3" noValidate>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name *</label>
                  <input type="text" value={doc.name} onChange={e => setDoc(p=>({...p, name:e.target.value}))} placeholder="Dr. Priya Sharma" className="input-field text-xs py-2" />
                  <FieldError msg={docErrs.name} />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Email Address *</label>
                  <input type="email" value={doc.email} onChange={e => setDoc(p=>({...p, email:e.target.value}))} placeholder="doctor@example.com" className="input-field text-xs py-2" />
                  <FieldError msg={docErrs.email} />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Login Password *</label>
                  <input type="password" value={doc.password} onChange={e => setDoc(p=>({...p, password:e.target.value}))} placeholder="Min. 8 characters" className="input-field text-xs py-2" />
                  <FieldError msg={docErrs.password} />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Specialization *</label>
                  <input type="text" value={doc.specialization} onChange={e => setDoc(p=>({...p, specialization:e.target.value}))} placeholder="e.g. Cardiology, Neurology..." className="input-field text-xs py-2" />
                  <FieldError msg={docErrs.specialization} />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Assign Department</label>
                  <select value={doc.deptId} onChange={e => setDoc(p=>({...p, deptId:e.target.value}))} className="input-field text-xs py-2">
                    <option value="">None / Unassigned</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Consult Fee ₹ *</label>
                    <input type="number" min="1" value={doc.fee} onChange={e => setDoc(p=>({...p, fee:e.target.value}))} placeholder="e.g. 800" className="input-field text-xs py-2" />
                    <FieldError msg={docErrs.fee} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Experience (yrs) *</label>
                    <input type="number" min="0" value={doc.exp} onChange={e => setDoc(p=>({...p, exp:e.target.value}))} placeholder="e.g. 5" className="input-field text-xs py-2" />
                    <FieldError msg={docErrs.exp} />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Mobile Phone *</label>
                  <input type="tel" value={doc.phone} onChange={e => setDoc(p=>({...p, phone:e.target.value}))} placeholder="10-digit Indian number" className="input-field text-xs py-2" maxLength={10} />
                  <FieldError msg={docErrs.phone} />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Bio Description</label>
                  <textarea rows={2} value={doc.bio} onChange={e => setDoc(p=>({...p, bio:e.target.value}))} placeholder="Brief professional summary…" className="input-field text-xs py-2 resize-none" />
                </div>

                <button type="submit" disabled={docSaving} className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-2 shadow shadow-primary/20">
                  {docSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Register Doctor Account</>}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── PATIENTS ─────────────────────────────────────── */}
        {activeTab === 'patients' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Registered Patients</h2>
                  <p className="text-xs text-slate-400 mt-0.5">List of all patients registered in the hospital database</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Total Patients:</span>
                  <span className="bg-primary/10 text-primary border border-primary/20 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {patients.length}
                  </span>
                </div>
              </div>
            </div>

            {patients.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-400">No registered patients found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {patients.map((p) => {
                  // Calculate age
                  let ageStr = "N/A";
                  if (p.birthDate) {
                    try {
                      const dob = new Date(p.birthDate);
                      const diffMs = Date.now() - dob.getTime();
                      const ageDate = new Date(diffMs);
                      ageStr = Math.abs(ageDate.getUTCFullYear() - 1970) + " yrs";
                    } catch {}
                  }

                  // Format blood group enums (e.g. O_POSITIVE -> O+, AB_NEGATIVE -> AB-)
                  const getShortBloodGroup = (bg) => {
                    if (!bg) return 'N/A';
                    return bg.toString()
                      .replace('_POSITIVE', '+')
                      .replace('_NEGATIVE', '-')
                      .replace('POSITIVE', '+')
                      .replace('NEGATIVE', '-');
                  };

                  return (
                    <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0 px-1">
                          <span className="font-extrabold text-blue-600 text-xs text-center leading-none uppercase">
                            {getShortBloodGroup(p.bloodGroup)}
                          </span>
                        </div>
                        <div className="overflow-hidden flex-1">
                          <h3 className="font-bold text-slate-900 text-sm truncate">{p.name}</h3>
                          <p className="text-[10px] text-slate-450 truncate mt-0.5">{p.email || 'No email'}</p>
                          <p className="text-[10px] text-slate-500 font-medium mt-1">📞 {p.phone || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-150 grid grid-cols-3 gap-1.5 text-center text-[10px] text-slate-500">
                        <div className="border-r border-slate-150">
                          <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-semibold">Gender</span>
                          <span className="font-bold text-slate-800">{p.gender || 'N/A'}</span>
                        </div>
                        <div className="border-r border-slate-150">
                          <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-semibold">Age</span>
                          <span className="font-bold text-slate-800">{ageStr}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-semibold">City</span>
                          <span className="font-bold text-slate-800 truncate block max-w-full">{p.city || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Expandable Emergency contact info */}
                      <details className="mt-3 group border border-slate-100 rounded-lg p-2 bg-slate-50/50">
                        <summary className="text-[9px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer list-none flex items-center justify-between">
                          <span>Emergency Contact & Address</span>
                          <ChevronRight className="w-3 h-3 text-slate-400 group-open:rotate-90 transition-transform" />
                        </summary>
                        <div className="mt-2 text-[10px] text-slate-600 space-y-1">
                          <p><span className="font-semibold">Father:</span> {p.fatherName || 'N/A'}</p>
                          <p><span className="font-semibold">Contact:</span> {p.emergencyContactName || 'N/A'} ({p.emergencyContactPhone || 'N/A'})</p>
                          <p><span className="font-semibold">Address:</span> {p.address || ''}, {p.city || ''}, {p.state || ''} {p.pincode ? `-${p.pincode}` : ''}</p>
                          {p.height && p.weight && (
                            <p><span className="font-semibold">Height/Weight:</span> {p.height}cm / {p.weight}kg</p>
                          )}
                        </div>
                      </details>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── DEPARTMENTS ───────────────────────────────────── */}
        {activeTab === 'departments' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">
            <div className="xl:col-span-2 space-y-4">
              {departments.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                  <Building className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-400">No departments have been created yet.</p>
                  <p className="text-xs text-slate-350 mt-1">Use the form on the right to create your first department.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {departments.map(d => (
                    <div key={d.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-slate-900 text-sm">{d.name}</h3>
                        <span className="text-[9px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-md font-extrabold">#{d.id}</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Department Head</p>
                        <p className="font-semibold text-slate-700 text-xs mt-1">{d.headDoctorName && d.headDoctorName !== '—' ? d.headDoctorName : 'Not Assigned'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dept Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-fit space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center"><Plus className="w-4 h-4 text-primary" /></div>
                <h3 className="font-extrabold text-slate-900 text-sm">Create Department</h3>
              </div>

              <Alert type={deptMsg.type} msg={deptMsg.text} />

              <form onSubmit={handleCreateDept} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Department Name *</label>
                  <input type="text" required value={dept.name} onChange={e => setDept(p=>({...p,name:e.target.value}))} placeholder="e.g. Cardiology" className="input-field text-xs py-2" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Head Doctor (Optional)</label>
                  <select value={dept.headId} onChange={e => setDept(p=>({...p,headId:e.target.value}))} className="input-field text-xs py-2">
                    <option value="">None / Unassigned</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
                  </select>
                </div>
                <button type="submit" disabled={deptSaving} className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-2 shadow shadow-primary/20">
                  {deptSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Save Department</>}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── PHARMACY ─────────────────────────────────────── */}
        {activeTab === 'pharmacy' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">
            <div className="xl:col-span-2">
              {medicines.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                  <Pill className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-400">No medicines in inventory yet.</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        {['Name / Dosage','Type','Category','Price','Stock'].map(h => (
                          <th key={h} className="p-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {medicines.map(m => (
                        <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-bold text-slate-800">{m.name} <span className="text-slate-400 font-normal">({m.dosage})</span></td>
                          <td className="p-4 text-slate-500">{m.type}</td>
                          <td className="p-4 text-slate-500">{m.category}</td>
                          <td className="p-4 text-slate-700">₹{m.price}</td>
                          <td className="p-4">
                            <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${m.stock <= 10 ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'}`}>
                              {m.stock} units
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Medicine Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-fit space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center"><Plus className="w-4 h-4 text-primary" /></div>
                <h3 className="font-extrabold text-slate-900 text-sm">Add New Medicine</h3>
              </div>

              <Alert type={medMsg.type} msg={medMsg.text} />

              <form onSubmit={handleAddMedicine} className="space-y-3" noValidate>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Drug Name *</label>
                  <input type="text" value={med.name} onChange={e=>setMed(p=>({...p,name:e.target.value}))} placeholder="e.g. Paracetamol" className="input-field text-xs py-2" />
                  <FieldError msg={medErrs.name} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Category *</label>
                    <input type="text" value={med.category} onChange={e=>setMed(p=>({...p,category:e.target.value}))} placeholder="e.g. Analgesic" className="input-field text-xs py-2" />
                    <FieldError msg={medErrs.category} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Form Type *</label>
                    <select value={med.type} onChange={e=>setMed(p=>({...p,type:e.target.value}))} className="input-field text-xs py-2">
                      {['TABLET','CAPSULE','SYRUP','INJECTION','CREAM','DROPS','INHALER','OTHER'].map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Dosage *</label>
                    <input type="text" value={med.dosage} onChange={e=>setMed(p=>({...p,dosage:e.target.value}))} placeholder="e.g. 500mg" className="input-field text-xs py-2" />
                    <FieldError msg={medErrs.dosage} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Manufacturer *</label>
                    <input type="text" value={med.manufacturer} onChange={e=>setMed(p=>({...p,manufacturer:e.target.value}))} placeholder="e.g. GSK" className="input-field text-xs py-2" />
                    <FieldError msg={medErrs.manufacturer} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Price ₹ *</label>
                    <input type="number" min="0" value={med.price} onChange={e=>setMed(p=>({...p,price:e.target.value}))} placeholder="e.g. 50" className="input-field text-xs py-2" />
                    <FieldError msg={medErrs.price} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Stock Units *</label>
                    <input type="number" min="0" value={med.stock} onChange={e=>setMed(p=>({...p,stock:e.target.value}))} placeholder="e.g. 200" className="input-field text-xs py-2" />
                    <FieldError msg={medErrs.stock} />
                  </div>
                </div>
                <button type="submit" disabled={medSaving} className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-2 shadow shadow-primary/20">
                  {medSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" />Add to Inventory</>}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── BILLING ───────────────────────────────────────── */}
        {activeTab === 'billing' && (
          <div className="space-y-5">
            {bills.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-400">No billing statements generated yet.</p>
                <p className="text-xs text-slate-350 mt-1">Bills are auto-generated when an appointment is completed.</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      {['Invoice #','Patient','Doctor','Fee','Total (GST incl.)','Status','Actions'].map(h => (
                        <th key={h} className={`p-4 ${h === 'Actions' ? 'text-center' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bills.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-500">INV-{String(b.id).padStart(5,'0')}</td>
                        <td className="p-4 font-bold text-slate-800">{b.patientName}</td>
                        <td className="p-4 text-slate-500">Dr. {b.doctorName}</td>
                        <td className="p-4 text-slate-700">₹{b.consultationFee}</td>
                        <td className="p-4 font-bold text-slate-900">₹{b.totalAmount}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full font-extrabold text-[9px] uppercase tracking-wider ${b.status === 'PAID' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            {b.status === 'UNPAID' && (
                              <button onClick={() => handleMarkPaid(b.id)} className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] transition-colors shadow-sm">
                                <CheckCircle className="w-3 h-3" /> Confirm
                              </button>
                            )}
                            <button onClick={() => handleDownloadInvoice(b.id)} className="flex items-center gap-1 border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-lg text-[10px] transition-colors">
                              <Download className="w-3 h-3" /> PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── SECURITY ─────────────────────────────────────── */}
        {activeTab === 'security' && (
          <div className="max-w-lg mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Provision Admin Account</h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">Create a new system-level administrator credential</p>
                </div>
              </div>

              <Alert type={admMsg.type} msg={admMsg.text} />

              <form onSubmit={handleCreateAdmin} className="space-y-4" noValidate>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Admin Email / Username *</label>
                  <input type="text" value={adm.username} onChange={e=>setAdm(p=>({...p,username:e.target.value}))} placeholder="admin@priyanshcare.com" className="input-field text-xs py-2" />
                  <FieldError msg={admErrs.username} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Secure Password *</label>
                  <input type="password" value={adm.password} onChange={e=>setAdm(p=>({...p,password:e.target.value}))} placeholder="Minimum 8 characters" className="input-field text-xs py-2" />
                  <FieldError msg={admErrs.password} />
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[10px] text-amber-700 font-semibold flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  Admin accounts have full system access. Only provision credentials for authorized personnel.
                </div>
                <button type="submit" disabled={admSaving} className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-2 shadow shadow-primary/20">
                  {admSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4" />Provision Admin Account</>}
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
