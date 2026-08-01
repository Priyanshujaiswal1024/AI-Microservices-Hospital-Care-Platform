import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import api from '../../api/axios';
import { useState, useEffect, useRef } from 'react';
import {
    LayoutDashboard,
    Stethoscope,
    Users,
    Calendar,
    Building2,
    Pill,
    CreditCard,
    User,
    LogOut,
    Menu,
    X,
    Shield
} from 'lucide-react';

const navItems = [
    {
        section: 'Management',
        items: [
            { to: '/admin/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
            { to: '/admin/doctors',      icon: Stethoscope,     label: 'Doctors'      },
            { to: '/admin/patients',     icon: Users,           label: 'Patients'     },
            { to: '/admin/appointments', icon: Calendar,        label: 'Appointments' },
            { to: '/admin/departments',  icon: Building2,       label: 'Departments'  },
            { to: '/admin/medicines',    icon: Pill,            label: 'Medicines'    },
            { to: '/admin/bills',        icon: CreditCard,      label: 'Bills'        },
        ],
    },
    {
        section: 'System',
        items: [
            { to: '/admin/profile', icon: User, label: 'Admin Profile' },
        ],
    },
];

function getPageLabel(pathname) {
    for (const group of navItems) {
        for (const item of group.items) {
            if (pathname.startsWith(item.to)) return { icon: item.icon, label: item.label };
        }
    }
    return { icon: Shield, label: 'Admin' };
}

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate  = useNavigate();
    const location  = useLocation();
    const [open, setOpen] = useState(false);
    const sidebarRef = useRef();

    useEffect(() => { setOpen(false); }, [location.pathname]);

    useEffect(() => {
        function handler(e) {
            if (open && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handler);
        document.addEventListener('touchstart', handler);
        return () => {
            document.removeEventListener('mousedown', handler);
            document.removeEventListener('touchstart', handler);
        };
    }, [open]);

    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    async function handleLogout() {
        try {
            const token = localStorage.getItem('token');
            await api.post('/auth/logout', null, { headers: { Authorization: `Bearer ${token}` } });
        } catch {}
        logout();
        navigate('/login');
    }

    const initials = user?.sub?.slice(0, 2).toUpperCase() || 'AD';
    const page = getPageLabel(location.pathname);
    const PageIcon = page.icon;

    return (
        <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'#f8fafc', fontFamily:"'Inter', system-ui, sans-serif" }}>
            <style>{`
                .anl:hover { background:#f1f5f9!important; color:#0f172a!important; }
                .alo:hover { background:#fef2f2!important; }

                .mob-topbar {
                    display:none;
                    position:fixed; top:0; left:0; right:0; z-index:200;
                    height:56px; background:#fff; border-bottom:1px solid #e2e8f0;
                    align-items:center; justify-content:space-between;
                    padding:0 16px; box-shadow:0 1px 8px rgba(0,0,0,.04);
                }

                .sidebar-overlay {
                    display:none; position:fixed; inset:0; z-index:299;
                    background:rgba(15,23,42,.45); backdrop-filter:blur(2px);
                }

                .admin-sidebar {
                    width:220px; background:#fff; border-right:1px solid #e2e8f0;
                    display:flex; flex-direction:column; flex-shrink:0;
                    box-shadow:2px 0 12px rgba(0,0,0,.03);
                    transition:transform .25s cubic-bezier(.4,0,.2,1);
                    z-index:300;
                }

                .admin-content {
                    flex:1; overflow-y:auto; display:flex;
                    flex-direction:column; min-width:0;
                }

                @media (max-width:768px) {
                    .mob-topbar { display:flex!important; }
                    .admin-sidebar {
                        position:fixed; top:0; left:0; bottom:0;
                        transform:translateX(-100%);
                        box-shadow:4px 0 24px rgba(0,0,0,.15);
                    }
                    .admin-sidebar.open { transform:translateX(0); }
                    .sidebar-overlay.open { display:block!important; }
                    .admin-content { padding-top:56px; }
                }
            `}</style>

            {/* ── Mobile Top Bar ── */}
            <div className="mob-topbar">
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <button
                        onClick={() => setOpen(v => !v)}
                        style={{ background:'none', border:'none', cursor:'pointer', padding:'4px', color:'#334155' }}
                        aria-label="Toggle menu"
                    >
                        <Menu size={22} />
                    </button>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <div style={{ width:'28px', height:'28px', background:'linear-gradient(135deg,#0f172a,#0284c7)', borderRadius:'7px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'14px', fontWeight:800 }}>P</div>
                        <div>
                            <div style={{ fontSize:'14px', fontWeight:700, color:'#0f172a', lineHeight:1 }}>Priyansh Care</div>
                        </div>
                    </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <PageIcon size={16} color="#0f172a" />
                    <span style={{ fontSize:'12px', fontWeight:600, color:'#334155' }}>{page.label}</span>
                </div>
            </div>

            {/* ── Overlay ── */}
            <div className={`sidebar-overlay${open ? ' open' : ''}`} onClick={() => setOpen(false)}/>

            {/* ── Sidebar ── */}
            <div ref={sidebarRef} className={`admin-sidebar${open ? ' open' : ''}`}>
                {/* Logo */}
                <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'36px', height:'36px', background:'linear-gradient(135deg,#0f172a,#0284c7)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'18px', fontWeight:800, flexShrink:0, boxShadow:'0 2px 8px rgba(15,23,42,.25)' }}>P</div>
                    <div>
                        <div style={{ fontSize:'14px', fontWeight:700, color:'#0f172a', lineHeight:1.1 }}>Priyansh Care</div>
                        <div style={{ fontSize:'9px', color:'#64748b', textTransform:'uppercase', letterSpacing:'.09em', marginTop:'2px', fontWeight:600 }}>Admin Portal</div>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        style={{ marginLeft:'auto', display:'none', width:'28px', height:'28px', borderRadius:'7px', border:'none', background:'#f1f5f9', color:'#64748b', cursor:'pointer', alignItems:'center', justifyContent:'center', flexShrink:0 }}
                        className="mob-close-btn"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* User info */}
                <div style={{ padding:'12px 14px', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'10px', background:'#f8fafc' }}>
                    <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:'#e2e8f0', color:'#0f172a', fontSize:'12px', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'1px solid #cbd5e1' }}>{initials}</div>
                    <div style={{ minWidth:0 }}>
                        <div style={{ fontSize:'12px', fontWeight:600, color:'#0f172a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.sub || 'Admin'}</div>
                        <div style={{ fontSize:'10px', color:'#0284c7', fontWeight:600, display:'flex', alignItems:'center', gap:'4px', marginTop:'1px' }}>
                            <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#10b981', display:'inline-block' }}/>
                            Online · System Admin
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <div style={{ padding:'10px 8px', flex:1, overflowY:'auto' }}>
                    {navItems.map(group => (
                        <div key={group.section} style={{ marginBottom:'6px' }}>
                            <div style={{ fontSize:'9px', fontWeight:700, color:'#94a3b8', letterSpacing:'.12em', textTransform:'uppercase', padding:'8px 8px 4px' }}>{group.section}</div>
                            {group.items.map(item => {
                                const ItemIcon = item.icon;
                                return (
                                    <NavLink key={item.to} to={item.to} className="anl"
                                             style={({ isActive }) => ({
                                                 display:'flex', alignItems:'center', gap:'9px',
                                                 padding:'8px 10px', borderRadius:'9px',
                                                 fontSize:'12px', fontWeight: isActive ? 700 : 500,
                                                 color: isActive ? '#0f172a' : '#475569',
                                                 background: isActive ? '#f1f5f9' : 'transparent',
                                                 textDecoration:'none', marginBottom:'2px',
                                                 transition:'all .15s',
                                                 borderLeft: isActive ? '3px solid #0f172a' : '3px solid transparent',
                                             })}>
                                        <ItemIcon size={16} style={{ flexShrink: 0 }} />
                                        <span style={{ flex:1 }}>{item.label}</span>
                                        {item.label === 'Dashboard' && (
                                            <span style={{ fontSize:'9px', background:'#e2e8f0', color:'#0f172a', padding:'1px 5px', borderRadius:'4px', fontWeight:700 }}>Home</span>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Logout */}
                <div style={{ padding:'10px 8px 16px', borderTop:'1px solid #e2e8f0' }}>
                    <button className="alo" onClick={handleLogout}
                            style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 10px', borderRadius:'9px', fontSize:'12px', fontWeight:600, color:'#ef4444', cursor:'pointer', border:'none', background:'none', width:'100%', transition:'background .15s' }}>
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="admin-content">
                <Outlet />
            </div>

            <style>{`
                @media (max-width:768px) {
                    .mob-close-btn { display:flex!important; }
                }
            `}</style>
        </div>
    );
}