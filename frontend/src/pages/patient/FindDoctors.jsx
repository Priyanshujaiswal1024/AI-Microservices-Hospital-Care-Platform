import { useEffect, useState } from 'react';
import { useNavigate }         from 'react-router-dom';
import api                     from '../../api/axios';
import Pagination              from '../../components/Pagination';
import { Search, Stethoscope, Clock, CreditCard, Calendar, MapPin, Loader2 } from 'lucide-react';

export default function FindDoctors() {
    const navigate = useNavigate();
    const [doctors, setDoctors]           = useState([]);
    const [departments, setDepartments]   = useState([]);
    const [loading, setLoading]           = useState(false);
    const [search, setSearch]             = useState('');
    const [spec, setSpec]                 = useState('');
    const [page, setPage]                 = useState(0);
    const [totalPages, setTotalPages]     = useState(1);
    const [totalDoctors, setTotalDoctors] = useState(0);

    useEffect(() => {
        api.get('/public/departments')
            .then(({ data }) => setDepartments(data))
            .catch(() => setDepartments([]));
    }, []);

    useEffect(() => { fetchDoctors(); }, [page, search, spec]);

    async function fetchDoctors() {
        setLoading(true);
        try {
            const params = { page, size: 9 };
            if (search) params.name           = search;
            if (spec)   params.specialization = spec;
            const { data } = await api.get('/public/doctors', { params });
            setDoctors(data.content || []);
            setTotalPages(data.totalPages || 1);
            setTotalDoctors(data.totalElements || 0);
        } catch {
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    }

    const specializations = [...new Set(departments.map(d => d.name))];

    return (
        <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f8fafc', fontFamily:"'Inter',system-ui,sans-serif" }}>

            {/* Header */}
            <div style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'14px 22px', position:'sticky', top:0, zIndex:10, boxShadow:'0 1px 6px rgba(0,0,0,.04)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#0f172a,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <Search size={16} color="#fff"/>
                        </div>
                        <div>
                            <div style={{ fontSize:15, fontWeight:700, color:'#0f172a', lineHeight:1.1 }}>Find Doctors</div>
                            <div style={{ fontSize:11, color:'#64748b', marginTop:1 }}>Search and book appointments</div>
                        </div>
                    </div>
                    {totalDoctors > 0 && (
                        <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#16a34a', fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:20 }}>
                            {totalDoctors} Doctor{totalDoctors !== 1 ? 's' : ''} Available
                        </div>
                    )}
                </div>
            </div>

            <div style={{ flex:1, overflowY:'auto', padding:'18px 22px' }}>

                {/* Search bar */}
                <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'14px 16px', marginBottom:12, boxShadow:'0 1px 4px rgba(0,0,0,.03)' }}>
                    <div style={{ position:'relative', marginBottom:10 }}>
                        <Search size={14} color="#94a3b8" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }}/>
                        <input
                            style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:9, padding:'9px 12px 9px 34px', fontSize:13, outline:'none', background:'#f8fafc', fontFamily:"'Inter',sans-serif", boxSizing:'border-box', transition:'border-color .15s' }}
                            placeholder="Search by doctor name..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(0); }}
                            onFocus={e => e.target.style.borderColor = '#0d9488'}
                            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>
                    <div style={{ fontSize:11, color:'#94a3b8' }}>
                        {loading ? 'Searching...' : (
                            <>Showing <b style={{ color:'#374151' }}>{totalDoctors}</b> doctor{totalDoctors !== 1 ? 's' : ''}{spec ? <> in <b style={{ color:'#0d9488' }}>{spec}</b></> : ''}{search ? <> matching "<b style={{ color:'#0d9488' }}>{search}</b>"</> : ''}</>
                        )}
                    </div>
                </div>

                {/* Specialty filter chips */}
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
                    {['', ...specializations].map((s, i) => (
                        <button
                            key={i}
                            onClick={() => { setSpec(s); setPage(0); }}
                            style={{ padding:'6px 14px', borderRadius:20, fontSize:11, fontWeight:600, cursor:'pointer', transition:'all .15s',
                                border: spec === s ? 'none' : '1px solid #e2e8f0',
                                background: spec === s ? 'linear-gradient(135deg,#0f172a,#0d9488)' : '#fff',
                                color: spec === s ? '#fff' : '#6b7280',
                                boxShadow: spec === s ? '0 2px 8px rgba(13,148,136,.25)' : 'none',
                            }}
                        >
                            {s === '' ? 'All Specialties' : s}
                        </button>
                    ))}
                </div>

                {/* Doctor cards grid */}
                {loading ? (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:12 }}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} style={{ background:'#f1f5f9', borderRadius:12, height:200, animation:'pulse 1.5s ease-in-out infinite' }} />
                        ))}
                    </div>
                ) : doctors.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'60px', color:'#94a3b8' }}>
                        <Stethoscope size={44} color="#e2e8f0" style={{ marginBottom:14, display:'block', margin:'0 auto 14px' }}/>
                        <div style={{ fontWeight:700, color:'#374151', marginBottom:4, fontSize:14 }}>No doctors found</div>
                        <div style={{ fontSize:12 }}>Try a different name or specialization</div>
                    </div>
                ) : (
                    <>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:12, marginBottom:16 }}>
                            {doctors.map(doc => {
                                const initials = doc.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
                                return (
                                    <div key={doc.id}
                                        style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, padding:'18px', transition:'all .2s', boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor='#0d9488'; e.currentTarget.style.boxShadow='0 6px 24px rgba(13,148,136,.12)'; e.currentTarget.style.transform='translateY(-3px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,.04)'; e.currentTarget.style.transform='none'; }}
                                    >
                                        {/* Doctor header */}
                                        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                                            <div style={{ width:48, height:48, borderRadius:12, background:'linear-gradient(135deg,#0f172a,#0d9488)', color:'#fff', fontSize:16, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 2px 8px rgba(13,148,136,.3)' }}>
                                                {initials}
                                            </div>
                                            <div style={{ flex:1, minWidth:0 }}>
                                                <div style={{ fontSize:13, fontWeight:700, color:'#0f172a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.name}</div>
                                                <div style={{ fontSize:11, color:'#0d9488', fontWeight:600, marginTop:1 }}>{doc.specialization}</div>
                                            </div>
                                        </div>

                                        <div style={{ borderTop:'1px solid #f1f5f9', marginBottom:12 }}/>

                                        {/* Stats */}
                                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                                            <div style={{ background:'#f8fafc', borderRadius:8, padding:'8px 10px', display:'flex', alignItems:'center', gap:6 }}>
                                                <Clock size={13} color="#94a3b8"/>
                                                <div>
                                                    <div style={{ fontSize:12, fontWeight:700, color:'#0f172a' }}>{doc.experienceYears} yrs</div>
                                                    <div style={{ fontSize:9, color:'#94a3b8' }}>Experience</div>
                                                </div>
                                            </div>
                                            <div style={{ background:'#f0fdf4', borderRadius:8, padding:'8px 10px', display:'flex', alignItems:'center', gap:6 }}>
                                                <CreditCard size={13} color="#16a34a"/>
                                                <div>
                                                    <div style={{ fontSize:12, fontWeight:700, color:'#166534' }}>₹{doc.consultationFee}</div>
                                                    <div style={{ fontSize:9, color:'#94a3b8' }}>Consult Fee</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Department badge */}
                                        {doc.departmentName && (
                                            <div style={{ background:'#f0f9ff', color:'#0369a1', fontSize:10, fontWeight:600, padding:'4px 10px', borderRadius:7, display:'inline-flex', alignItems:'center', gap:4, marginBottom:12, border:'1px solid #bae6fd' }}>
                                                <MapPin size={10}/>
                                                {doc.departmentName}
                                            </div>
                                        )}

                                        {/* Book button */}
                                        <button
                                            onClick={() => navigate(`/patient/doctors/${doc.id}/book`)}
                                            style={{ width:'100%', padding:'9px', borderRadius:9, border:'none', background:'linear-gradient(135deg,#0f172a,#0d9488)', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'opacity .15s' }}
                                            onMouseEnter={e => e.target.style.opacity='.9'}
                                            onMouseLeave={e => e.target.style.opacity='1'}
                                        >
                                            <Calendar size={14}/>
                                            View & Book
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.03)' }}>
                            <Pagination
                                currentPage={page + 1}
                                totalPages={totalPages}
                                totalItems={totalDoctors}
                                pageSize={9}
                                onPageChange={p => setPage(p - 1)}
                                itemLabel="doctors"
                            />
                        </div>
                    </>
                )}
            </div>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
        </div>
    );
}