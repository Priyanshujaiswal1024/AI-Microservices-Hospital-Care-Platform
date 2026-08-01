import { useEffect, useState } from 'react';
import { downloadPdf } from '../../utils/downloadPdf';
import api from '../../api/axios';
import { FileText, Download, Loader2, Search, CheckCircle2, Clock } from 'lucide-react';

export default function Prescriptions() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [downloading,   setDownloading]   = useState(null);
    const [search,        setSearch]        = useState('');

    useEffect(() => { fetchPrescriptions(); }, []);

    async function fetchPrescriptions() {
        try {
            const res = await api.get('/patient/prescriptions');
            setPrescriptions(res.data || []);
        } catch { setPrescriptions([]); }
        finally  { setLoading(false); }
    }

    async function handleDownload(id) {
        try {
            setDownloading(id);
            await downloadPdf(`/prescriptions/${id}/download`, `prescription-${id}.pdf`);
        } catch (err) { console.log('Download error:', err); }
        finally { setDownloading(null); }
    }

    const filtered = prescriptions.filter(rx =>
        !search ||
        rx.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
        rx.medicines?.some(m => m.medicineName?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f8fafc', fontFamily:"'Inter', system-ui, sans-serif" }}>
            <style>{`
                @keyframes rx-fadein { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
                .rx-table-wrap { display:block; }
                .rx-cards-wrap  { display:none; }
                @media(max-width:768px) {
                    .rx-table-wrap { display:none !important; }
                    .rx-cards-wrap  { display:flex !important; flex-direction:column; gap:12px; }
                }
                @media(max-width:480px) {
                    .rx-hero-pad { padding:16px !important; }
                    .rx-body-pad { padding:14px !important; }
                    .rx-search   { max-width:100% !important; }
                }
                .rx-row { transition:background .15s; }
                .rx-row:hover { background:#f0fdf4 !important; }
                .rx-dl-btn:hover { background:#f0fdf4 !important; border-color:#0d9488 !important; color:#0d9488 !important; }
                .rx-card-item { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:16px; box-shadow:0 1px 6px rgba(0,0,0,.04); animation:rx-fadein .3s ease; transition:box-shadow .2s; }
                .rx-card-item:hover { box-shadow:0 4px 16px rgba(13,148,136,.08); }
            `}</style>

            {/* ── HERO ── */}
            <div className="rx-hero-pad" style={{
                background:'linear-gradient(145deg, #0f172a 0%, #1e293b 60%, #0f766e 100%)',
                padding:'20px 28px 22px', flexShrink:0, position:'relative', overflow:'hidden', color:'#fff',
            }}>
                <div style={{ position:'absolute', top:-50, right:-40, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,.04)', pointerEvents:'none' }}/>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.5)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:5 }}>Patient Portal</div>
                <div style={{ fontSize:20, fontWeight:700, color:'#fff', marginBottom:4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={20} color="#2dd4bf" />
                    <span>My Prescriptions</span>
                </div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.7)' }}>
                    {loading ? 'Loading...' : `${prescriptions.length} prescription${prescriptions.length !== 1 ? 's' : ''} from your doctors`}
                </div>
            </div>

            {/* ── BODY ── */}
            <div className="rx-body-pad" style={{ flex:1, overflowY:'auto', padding:'20px 28px' }}>

                {/* Search */}
                <div style={{ position: 'relative', maxWidth: 400, marginBottom: 16 }}>
                    <Search size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        className="rx-search"
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by doctor or medicine..."
                        style={{ width:'100%', border:'1px solid #cbd5e1', borderRadius:10, padding:'10px 14px 10px 36px', fontSize:12, background:'#fff', outline:'none', fontFamily:"'Inter', system-ui, sans-serif", boxSizing:'border-box', boxShadow:'0 1px 4px rgba(0,0,0,.02)' }}
                    />
                </div>

                {loading ? (
                    <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', padding:'60px 20px', textAlign:'center', color:'#64748b' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                            <Loader2 size={28} className="animate-spin" color="#0d9488" />
                        </div>
                        <div style={{ fontSize:13 }}>Loading prescriptions...</div>
                    </div>

                ) : filtered.length === 0 ? (
                    <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', padding:'70px 20px', textAlign:'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, color: '#94a3b8' }}>
                            <FileText size={44} />
                        </div>
                        <div style={{ fontSize:15, fontWeight:700, color:'#0f172a', marginBottom:6 }}>
                            {search ? `No results for "${search}"` : 'No prescriptions yet'}
                        </div>
                        <div style={{ fontSize:12, color:'#64748b' }}>Your doctor's prescriptions will appear here</div>
                    </div>

                ) : (
                    <>
                        {/* ── DESKTOP TABLE ── */}
                        <div className="rx-table-wrap" style={{ background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', boxShadow:'0 1px 6px rgba(0,0,0,.03)', overflow:'hidden' }}>
                            <div style={{ display:'grid', gridTemplateColumns:'2fr 1.4fr 1.2fr 1fr 1fr 0.8fr 0.9fr', padding:'11px 20px', background:'#f8fafc', borderBottom:'2px solid #f1f5f9' }}>
                                {['Medicine','Doctor','Frequency','Duration','Date','Status','Download'].map(h => (
                                    <div key={h} style={{ fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'.07em' }}>{h}</div>
                                ))}
                            </div>

                            {filtered.map((rx, idx) => {
                                const dateStr = rx.createdAt
                                    ? new Date(rx.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})
                                    : '—';
                                const medNames  = rx.medicines?.map(m => m.medicineName).filter(Boolean) || [];
                                const freqs     = rx.medicines?.map(m => m.frequency || '—')             || [];
                                const durations = rx.medicines?.map(m => m.durationDays ? `${m.durationDays}d` : '—') || [];

                                return (
                                    <div key={rx.id} className="rx-row"
                                         style={{ display:'grid', gridTemplateColumns:'2fr 1.4fr 1.2fr 1fr 1fr 0.8fr 0.9fr', padding:'13px 20px', borderBottom: idx < filtered.length-1 ? '1px solid #f1f5f9' : 'none', alignItems:'center' }}>

                                        <div>
                                            {medNames.length > 0
                                                ? medNames.map((name,i) => (
                                                    <div key={i} style={{ fontSize:12, fontWeight:600, color:'#0f172a', marginBottom:i<medNames.length-1?3:0 }}>
                                                        {name}
                                                    </div>
                                                ))
                                                : <span style={{ color:'#cbd5e1', fontSize:12 }}>—</span>}
                                        </div>

                                        <div style={{ fontSize:12, fontWeight:500, color:'#334155' }}>
                                            {rx.doctorName || '—'}
                                        </div>

                                        <div>
                                            {freqs.length > 0
                                                ? freqs.map((f,i) => <div key={i} style={{ fontSize:11, color:'#64748b', marginBottom:i<freqs.length-1?3:0 }}>{f}</div>)
                                                : <span style={{ color:'#cbd5e1', fontSize:11 }}>—</span>}
                                        </div>

                                        <div>
                                            {durations.length > 0
                                                ? durations.map((d,i) => <div key={i} style={{ fontSize:11, color:'#64748b', marginBottom:i<durations.length-1?3:0 }}>{d}</div>)
                                                : <span style={{ color:'#cbd5e1', fontSize:11 }}>—</span>}
                                        </div>

                                        <div style={{ fontSize:11, color:'#64748b' }}>{dateStr}</div>

                                        <div>
                                            <span style={{
                                                background: rx.active ? '#f0fdf4' : '#f8fafc',
                                                color:      rx.active ? '#0d9488' : '#64748b',
                                                border:     rx.active ? '1px solid #99f6e4' : '1px solid #e2e8f0',
                                                padding:'3px 10px', borderRadius:20,
                                                fontSize:10, fontWeight:700, display: 'inline-flex', alignItems: 'center', gap: 4
                                            }}>
                                                {rx.active ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                                <span>{rx.active ? 'Active' : 'Done'}</span>
                                            </span>
                                        </div>

                                        <button className="rx-dl-btn"
                                                onClick={() => handleDownload(rx.id)}
                                                disabled={downloading === rx.id}
                                                style={{ padding:'6px 12px', borderRadius:8, border:'1px solid #cbd5e1', background:'#fff', color:'#0f172a', fontSize:11, fontWeight:600, cursor:'pointer', transition:'all .15s', whiteSpace:'nowrap', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                            {downloading === rx.id ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                                            <span>PDF</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── MOBILE CARDS ── */}
                        <div className="rx-cards-wrap">
                            {filtered.map((rx) => {
                                const dateStr = rx.createdAt
                                    ? new Date(rx.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})
                                    : '—';

                                return (
                                    <div key={rx.id} className="rx-card-item">
                                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                                            <div>
                                                <div style={{ fontSize:10, color:'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:3 }}>Doctor</div>
                                                <div style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{rx.doctorName || '—'}</div>
                                                <div style={{ fontSize:10, color:'#64748b', marginTop:2 }}>{dateStr}</div>
                                            </div>
                                            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                                                <span style={{
                                                    background: rx.active ? '#f0fdf4' : '#f8fafc',
                                                    color:      rx.active ? '#0d9488' : '#64748b',
                                                    border:     rx.active ? '1px solid #99f6e4' : '1px solid #e2e8f0',
                                                    padding:'3px 10px', borderRadius:20,
                                                    fontSize:10, fontWeight:700, display: 'inline-flex', alignItems: 'center', gap: 4
                                                }}>
                                                    {rx.active ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                                    <span>{rx.active ? 'Active' : 'Done'}</span>
                                                </span>
                                                <button
                                                    onClick={() => handleDownload(rx.id)}
                                                    disabled={downloading === rx.id}
                                                    style={{ padding:'6px 14px', borderRadius:8, border:'1px solid #cbd5e1', background:'#fff', color:'#0d9488', fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                    {downloading === rx.id ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                                                    <span>PDF</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div style={{ borderTop:'1px solid #f1f5f9', marginBottom:12 }}/>

                                        {rx.medicines?.length > 0 ? (
                                            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                                                {rx.medicines.map((m, i) => (
                                                    <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, background:'#f8fafc', borderRadius:10, padding:'10px 12px' }}>
                                                        <div>
                                                            <div style={{ fontSize:9, color:'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:2 }}>Medicine</div>
                                                            <div style={{ fontSize:12, fontWeight:700, color:'#0f172a' }}>{m.medicineName || '—'}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize:9, color:'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:2 }}>Frequency</div>
                                                            <div style={{ fontSize:11, color:'#334155', fontWeight:500 }}>{m.frequency || '—'}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize:9, color:'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:2 }}>Duration</div>
                                                            <div style={{ fontSize:11, color:'#334155', fontWeight:500 }}>{m.durationDays ? `${m.durationDays} days` : '—'}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ fontSize:12, color:'#94a3b8', fontStyle:'italic' }}>No medicines listed</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}