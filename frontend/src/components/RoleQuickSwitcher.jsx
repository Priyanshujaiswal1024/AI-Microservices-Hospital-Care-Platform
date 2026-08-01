import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, UserCheck, Stethoscope, User, HeartPulse } from 'lucide-react';

export default function RoleQuickSwitcher() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { id: 'ADMIN', label: 'Admin', icon: Shield, path: '/admin/dashboard', color: 'bg-purple-600 hover:bg-purple-700' },
    { id: 'DOCTOR', label: 'Doctor', icon: Stethoscope, path: '/doctor/dashboard', color: 'bg-teal-600 hover:bg-teal-700' },
    { id: 'RECEPTIONIST', label: 'Front Desk', icon: UserCheck, path: '/receptionist/dashboard', color: 'bg-amber-600 hover:bg-amber-700' },
    { id: 'NURSE', label: 'Nurse', icon: HeartPulse, path: '/nurse/dashboard', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { id: 'PATIENT', label: 'Patient', icon: User, path: '/patient/profile', color: 'bg-blue-600 hover:bg-blue-700' },
  ];

  const handleRoleSwitch = (roleObj) => {
    // Mock user login update
    const mockUser = {
      token: 'demo-token-123',
      role: roleObj.id,
      name: roleObj.id === 'DOCTOR' ? 'Dr. Anjali Rajan' : roleObj.id === 'PATIENT' ? 'Rahul Sharma' : roleObj.id === 'NURSE' ? 'Nurse Priya' : roleObj.id === 'RECEPTIONIST' ? 'Vikram Desk' : 'System Admin',
      email: `${roleObj.id.toLowerCase()}@hospitalcare.com`,
    };
    login(mockUser);
    navigate(roleObj.path);
  };

  return (
    <div className="bg-[#12302E] text-white py-2 px-4 border-b border-teal-800/40 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#7FE3B4] animate-ping" />
        <span className="font-mono font-bold tracking-wide text-[#9FC9C4]">DEMO ROLE SWITCHER:</span>
        <span className="text-teal-200">Current Role: <strong className="text-amber-400 uppercase font-mono">{user?.role || 'GUEST'}</strong></span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {roles.map((r) => {
          const Icon = r.icon;
          const isActive = user?.role === r.id;
          return (
            <button
              key={r.id}
              onClick={() => handleRoleSwitch(r)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                isActive ? 'ring-2 ring-amber-400 text-white bg-teal-900' : 'opacity-80 hover:opacity-100 text-teal-100 bg-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
