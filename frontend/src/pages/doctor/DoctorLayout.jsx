import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import api from '../../api/axios';
import {
    LayoutDashboard,
    Calendar,
    Clock,
    FileText,
    ClipboardList,
    User,
    Pill,
    LogOut,
    Menu,
    Stethoscope
} from 'lucide-react';

const navItems = [
    {
        section: 'Work',
        items: [
            { to: '/doctor/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/doctor/appointments', icon: Calendar, label: 'Appointments' },
            { to: '/doctor/availability', icon: Clock, label: 'Set Availability' },
        ],
    },
    {
        section: 'Patient Care',
        items: [
            { to: '/doctor/prescriptions', icon: FileText, label: 'Prescriptions' },
            { to: '/doctor/records',       icon: ClipboardList, label: 'Medical Records' },
        ],
    },
    {
        section: 'My Account',
        items: [
            { to: '/doctor/profile',   icon: User, label: 'My Profile' },
            { to: '/doctor/medicines', icon: Pill, label: 'Medicines' },
        ],
    },
];

function SidebarContent({ user, initials, savedAvatar, onLogout, onClose }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* Brand */}
            <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <div style={{ 
                    width: 36, height: 36, 
                    background: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)', 
                    borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: '#fff', fontSize: 18, fontWeight: 800, flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)' 
                }}>
                    P
                </div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>Priyansh Care</div>
                    <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.09em', marginTop: 2, fontWeight: 600 }}>Doctor Portal</div>
                </div>
            </div>

            {/* User row */}
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', flexShrink: 0 }}>
                {savedAvatar ? (
                    <img src={savedAvatar} alt="av" style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover', border: '1.5px solid #0284c7', flexShrink: 0 }} />
                ) : (
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: '#e0f2fe', color: '#0369a1', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #bae6fd' }}>
                        {initials}
                    </div>
                )}
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user?.sub || 'Doctor'}
                    </div>
                    <div style={{ fontSize: 10, color: '#0284c7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                        Online · Medical Specialist
                    </div>
                </div>
            </div>

            {/* Nav */}
            <div style={{ padding: '10px 8px', flex: 1, overflowY: 'auto' }}>
                {navItems.map(group => (
                    <div key={group.section} style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '.12em', textTransform: 'uppercase', padding: '8px 8px 4px' }}>
                            {group.section}
                        </div>
                        {group.items.map(item => {
                            const IconComp = item.icon;
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={onClose}
                                    style={({ isActive }) => ({
                                        display: 'flex', alignItems: 'center', gap: 9,
                                        padding: '8px 10px', borderRadius: 9,
                                        fontSize: 12, fontWeight: isActive ? 700 : 500,
                                        color: isActive ? '#0284c7' : '#475569',
                                        background: isActive ? '#f0f9ff' : 'transparent',
                                        textDecoration: 'none', marginBottom: 2,
                                        borderLeft: isActive ? '3px solid #0284c7' : '3px solid transparent',
                                        transition: 'all .15s',
                                    })}
                                >
                                    <IconComp size={16} style={{ flexShrink: 0 }} />
                                    <span style={{ flex: 1 }}>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Logout */}
            <div style={{ padding: '10px 8px 12px', borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
                <button
                    onClick={onLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 9, fontSize: 12, fontWeight: 600, color: '#ef4444', cursor: 'pointer', border: 'none', background: 'none', width: '100%', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}

export default function DoctorLayout() {
    const { user, logout } = useAuth();
    const navigate         = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isMobile,   setIsMobile]   = useState(() => window.innerWidth <= 768);

    useEffect(() => {
        const fn = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', fn);
        return () => window.removeEventListener('resize', fn);
    }, []);

    const initials    = user?.sub ? user.sub.slice(0, 2).toUpperCase() : 'DR';
    const savedAvatar = localStorage.getItem(`avatar_${user?.sub}`);

    async function handleLogout() {
        try {
            const token = localStorage.getItem('token');
            await api.post('/auth/logout', null, { headers: { Authorization: `Bearer ${token}` } });
        } catch {}
        logout();
        navigate('/login');
    }

    const sidebarProps = {
        user,
        initials,
        savedAvatar,
        onLogout: handleLogout,
        onClose: () => setDrawerOpen(false),
    };

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* Desktop sidebar */}
            {!isMobile && (
                <div style={{ width: 220, background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0, boxShadow: '2px 0 12px rgba(0,0,0,.03)', height: '100vh', overflowY: 'auto' }}>
                    <SidebarContent {...sidebarProps} />
                </div>
            )}

            {/* Mobile backdrop */}
            {isMobile && drawerOpen && (
                <div
                    onClick={() => setDrawerOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(2px)', zIndex: 200 }}
                />
            )}

            {/* Mobile drawer */}
            {isMobile && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, bottom: 0, width: 240,
                    background: '#fff', zIndex: 201,
                    transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform .25s ease',
                    boxShadow: '4px 0 24px rgba(0,0,0,.15)',
                    overflowY: 'auto',
                }}>
                    <SidebarContent {...sidebarProps} />
                </div>
            )}

            {/* Main content */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* Mobile topbar */}
                {isMobile && (
                    <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', background: '#fff', borderBottom: '1px solid #e2e8f0', gap: 12, flexShrink: 0, boxShadow: '0 1px 6px rgba(0,0,0,.04)' }}>
                        <button
                            onClick={() => setDrawerOpen(true)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#334155', flexShrink: 0 }}
                        >
                            <Menu size={22} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 800, flexShrink: 0 }}>P</div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Priyansh Care</span>
                        </div>
                        {savedAvatar ? (
                            <img src={savedAvatar} alt="av" style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover', border: '1.5px solid #0284c7' }} />
                        ) : (
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#e0f2fe', color: '#0369a1', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bae6fd' }}>
                                {initials}
                            </div>
                        )}
                    </div>
                )}

                {/* Page outlet */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}