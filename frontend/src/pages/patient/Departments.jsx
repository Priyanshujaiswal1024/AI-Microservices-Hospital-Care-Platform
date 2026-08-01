import { useEffect, useState } from 'react';
import { useNavigate }         from 'react-router-dom';
import api                     from '../../api/axios';
import { Building2, ChevronDown, ChevronUp, Stethoscope, Clock, CreditCard, Calendar, Loader2 } from 'lucide-react';

const deptColors = [
    { bg:'#eff6ff', color:'#2563eb', border:'#bfdbfe' },
    { bg:'#f0fdf4', color:'#16a34a', border:'#bbf7d0' },
    { bg:'#fff7ed', color:'#c2410c', border:'#fed7aa' },
    { bg:'#fdf4ff', color:'#9333ea', border:'#e9d5ff' },
    { bg:'#f0f9ff', color:'#0284c7', border:'#bae6fd' },
    { bg:'#fef2f2', color:'#dc2626', border:'#fecaca' },
];

export default function Departments() {
    const navigate = useNavigate();
    const [departments, setDepartments]   = useState([]);
    const [loading, setLoading]           = useState(true);
    const [openDept, setOpenDept]         = useState(null);
    const [deptDoctors, setDeptDoctors]   = useState({});
    const [loadingDept, setLoadingDept]   = useState(null);

    useEffect(() => {
        api.get('/public/departments')
            .then(({ data }) => setDepartments(data))
            .finally(() => setLoading(false));
    }, []);

    async function toggleDept(deptId) {
        if (openDept === deptId) { setOpenDept(null); return; }
        setOpenDept(deptId);
        if (!deptDoctors[deptId]) {
            setLoadingDept(deptId);
            try {
                const { data } = await api.get(`/public/departments/${deptId}/doctors`);
                setDeptDoctors(prev => ({ ...prev, [deptId]: data }));
            } finally {
                setLoadingDept(null);
            }
        }
    }

    return (
        <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f8fafc', fontFamily:"'Inter',system-ui,sans-serif" }}>

            {/* Header */}
            <div style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'14px 22px', position:'sticky', top:0, zIndex:10, boxShadow:'0 1px 6px rgba(0,0,0,.04)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#0f172a,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Building2 size={17} color="#fff"/>
                    </div>
                    <div>
                        <div style={{ fontSize:15, fontWeight:700, color:'#0f172a', lineHeight:1.1 }}>Departments</div>
                        <div style={{ fontSize:11, color:'#64748b', marginTop:1 }}>Browse our medical specialties</div>
                    </div>
                    {!loading && (
                        <div style={{ marginLeft:'auto', background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#16a34a', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>
                            {departments.length} Departments
                        </div>
                    )}
                </div>
            </div>

            <div style={{ flex:1, overflowY:'auto', padding:'18px 22px' }}>
                {loading ? (
                    <div style={{ textAlign:'center', padding:'60px', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                        <Loader2 size={28} color="#94a3b8" style={{ animation:'spin 1s linear infinite' }}/>
                        <span style={{ color:'#94a3b8', fontSize:13 }}>Loading departments...</span>
                    </div>
                ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                        {departments.map((dept, idx) => {
                            const clr    = deptColors[idx % deptColors.length];
                            const isOpen = openDept === dept.id;
                            const doctors = deptDoctors[dept.id] || [];
                            return (
                                <div key={dept.id} style={{ background:'#fff', border:`1px solid ${isOpen ? clr.border : '#e2e8f0'}`, borderRadius:14, overflow:'hidden', boxShadow: isOpen ? `0 4px 16px ${clr.bg}` : '0 1px 4px rgba(0,0,0,.03)', transition:'all .2s' }}>

                                    {/* Department header row */}
                                    <div
                                        onClick={() => toggleDept(dept.id)}
                                        style={{ padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', transition:'background .12s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                    >
                                        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                                            <div style={{ width:42, height:42, borderRadius:11, background:clr.bg, color:clr.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:`1px solid ${clr.border}` }}>
                                                <Building2 size={20}/>
                                            </div>
                                            <div>
                                                <div style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>{dept.name}</div>
                                                <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>
                                                    Head: <span style={{ color: dept.headDoctorName ? clr.color : '#cbd5e1', fontWeight:600 }}>{dept.headDoctorName || 'Not assigned'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                            <span style={{ background:clr.bg, color:clr.color, border:`1px solid ${clr.border}`, padding:'4px 12px', borderRadius:20, fontSize:10, fontWeight:700 }}>
                                                {isOpen && doctors.length > 0 ? `${doctors.length} doctor${doctors.length !== 1 ? 's' : ''}` : 'View doctors'}
                                            </span>
                                            {isOpen ? <ChevronUp size={16} color="#94a3b8"/> : <ChevronDown size={16} color="#94a3b8"/>}
                                        </div>
                                    </div>

                                    {/* Expanded doctors */}
                                    {isOpen && (
                                        <div style={{ borderTop:`1px solid ${clr.border}`, padding:'14px 18px', background:clr.bg }}>
                                            {loadingDept === dept.id ? (
                                                <div style={{ textAlign:'center', padding:'20px', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                                                    <Loader2 size={16} color={clr.color} style={{ animation:'spin 1s linear infinite' }}/>
                                                    <span style={{ color:clr.color, fontSize:12, fontWeight:600 }}>Loading doctors...</span>
                                                </div>
                                            ) : doctors.length === 0 ? (
                                                <div style={{ textAlign:'center', padding:'16px', color:'#94a3b8', fontSize:12 }}>
                                                    <Stethoscope size={28} color="#e2e8f0" style={{ marginBottom:6, display:'block', margin:'0 auto 6px' }}/>
                                                    No doctors assigned yet.
                                                </div>
                                            ) : (
                                                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:10 }}>
                                                    {doctors.map(doc => {
                                                        const initials = doc.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
                                                        return (
                                                            <div
                                                                key={doc.id}
                                                                style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:11, padding:'14px', cursor:'pointer', transition:'all .15s' }}
                                                                onMouseEnter={e => { e.currentTarget.style.borderColor = clr.color; e.currentTarget.style.boxShadow = `0 4px 16px ${clr.bg}`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                                                            >
                                                                <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:10 }}>
                                                                    <div style={{ width:34, height:34, borderRadius:9, background:clr.bg, color:clr.color, fontSize:12, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:`1px solid ${clr.border}` }}>{initials}</div>
                                                                    <div>
                                                                        <div style={{ fontSize:12, fontWeight:700, color:'#0f172a', lineHeight:1.2 }}>{doc.name}</div>
                                                                        <div style={{ fontSize:10, color:clr.color, fontWeight:600 }}>{doc.specialization}</div>
                                                                    </div>
                                                                </div>
                                                                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:10 }}>
                                                                    <div style={{ background:'#f8fafc', borderRadius:7, padding:'5px 8px', display:'flex', alignItems:'center', gap:4 }}>
                                                                        <Clock size={10} color="#94a3b8"/>
                                                                        <span style={{ fontSize:10, color:'#374151', fontWeight:600 }}>{doc.experienceYears} yrs</span>
                                                                    </div>
                                                                    <div style={{ background:'#f0fdf4', borderRadius:7, padding:'5px 8px', display:'flex', alignItems:'center', gap:4 }}>
                                                                        <CreditCard size={10} color="#16a34a"/>
                                                                        <span style={{ fontSize:10, color:'#166534', fontWeight:700 }}>₹{doc.consultationFee}</span>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => navigate(`/patient/doctors/${doc.id}/book`)}
                                                                    style={{ width:'100%', padding:'7px', borderRadius:8, border:'none', background:`linear-gradient(135deg,${clr.color},${clr.color}cc)`, color:'#fff', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}
                                                                >
                                                                    <Calendar size={12}/>
                                                                    Book Appointment
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}