import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import AiChatWidget from '../../components/AiChatWidget';
import {
  User, Calendar, Search, Layers, FileText,
  CreditCard, ShieldAlert, HeartPulse, Pill, LogOut, Activity,
  Menu, X
} from 'lucide-react';

const menuItems = [
  { path: '/patient/profile', label: 'My Profile', icon: User },
  { path: '/patient/appointments', label: 'Appointments', icon: Calendar },
  { path: '/patient/doctors', label: 'Find Doctors', icon: Search },
  { path: '/patient/departments', label: 'Departments', icon: Layers },
  { path: '/patient/prescriptions', label: 'Prescriptions', icon: FileText },
  { path: '/patient/bills', label: 'Billing & Invoices', icon: CreditCard },
  { path: '/patient/medical-records', label: 'Medical History', icon: HeartPulse },
  { path: '/patient/insurance', label: 'Insurance Details', icon: ShieldAlert },
  { path: '/patient/medicines', label: 'Pharmacy', icon: Pill },
];

export default function PatientLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Desktop Sidebar (hidden on mobile, visible on medium screens and up) */}
      <aside className="hidden md:flex w-64 border-r border-slate-200 bg-white flex-col justify-between shrink-0">
        <div>
          {/* Header */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-200/80">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight text-slate-900">
                Priyansh Care Portal
              </h1>
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider block mt-0.5">Patient Suite</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200/80">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50/50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            Sign Out
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
          <aside className="relative flex w-64 max-w-xs flex-1 flex-col justify-between bg-white border-r border-slate-200">
            <div>
              {/* Header with Close Button */}
              <div className="p-6 flex items-center justify-between border-b border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-sm leading-tight text-slate-900">
                      Priyansh Care
                    </h1>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider block mt-0.5">Patient Suite</span>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-650 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-100 text-slate-900 font-semibold'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Footer Sign Out */}
            <div className="p-4 border-t border-slate-200/80">
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50/50 transition-colors"
              >
                <LogOut className="w-4 h-4 text-slate-400" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200 bg-white px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-slate-400 text-xs font-semibold uppercase tracking-wider">Branch:</span>
              <span className="text-slate-750 text-xs md:text-sm font-bold truncate max-w-[150px] sm:max-w-none">New Delhi Main Branch</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-slate-505 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full font-bold">
              ID: #{user?.id}
            </span>
          </div>
        </header>

        {/* Dynamic Nested Routes */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-5xl w-full mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* AI Patient Assistant — floating chat widget */}
      <AiChatWidget
        patientId={user?.id}
        patientName={user?.name}
        authToken={user?.token}
      />
    </div>
  );
}
