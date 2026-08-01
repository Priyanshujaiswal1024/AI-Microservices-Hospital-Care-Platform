import { useEffect, useState } from 'react';
import { downloadPdf }         from '../../utils/downloadPdf';
import api                     from '../../api/axios';
import { ClipboardList, Download, ChevronDown, ChevronUp, Loader2, Activity, Calendar, Stethoscope, FileText } from 'lucide-react';

export default function MedicalRecords() {
    const [records, setRecords]         = useState([]);
    const [loading, setLoading]         = useState(true);
    const [downloading, setDownloading] = useState(null);
    const [expanded, setExpanded]       = useState(null);

    useEffect(() => {
        api.get('/medical-records/my')
            .then(({ data }) => setRecords(data))
            .catch(() => setRecords([]))
            .finally(() => setLoading(false));
    }, []);

    async function handleDownload(id) {
        setDownloading(id);
        await downloadPdf(`/medical-records/${id}/download`, `medical-record-${id}.pdf`);
        setDownloading(null);
    }

    return (
        <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f8fafc', fontFamily:"'Inter',system-ui,sans-serif" }}>

            {/* Header */}
            <div style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'14px 22px', position:'sticky', top:0, zIndex:10, boxShadow:'0 1px 6px rgba(0,0,0,.04)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#0f172a,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <ClipboardList size={17} color="#fff"/>
                        </div>
                        <div>
                            <div style={{ fontSize:15, fontWeight:700, color:'#0f172a', lineHeight:1.1 }}>Medical Records</div>
                            <div style={{ fontSize:11, color:'#64748b', marginTop:1 }}>Your complete health history</div>
                        </div>
                    </div>
                    {!loading && records.length > 0 && (
                        <div style={{ background:'#f0f9ff', border:'1px solid #bae6fd', color:'#0284c7', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>
                            {records.length} Record{records.length !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ flex:1, overflowY:'auto', padding:'18px 22px' }}>
                {loading ? (
                    <div style={{ textAlign:'center', padding:'60px', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                        <Loader2 size={28} color="#94a3b8" style={{ animation:'spin 1s linear infinite' }}/>
                        <span style={{ color:'#94a3b8', fontSize:13 }}>Loading medical records...</span>
                    </div>
                ) : records.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'70px', color:'#94a3b8' }}>
                        <ClipboardList size={44} color="#e2e8f0" style={{ marginBottom:14, display:'block', margin:'0 auto 14px' }}/>
                        <div style={{ fontWeight:700, color:'#374151', marginBottom:4, fontSize:14 }}>No medical records found</div>
                        <div style={{ fontSize:12 }}>Your records will appear here after consultations</div>
                    </div>
                ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                        {records.map((rec, idx) => {
                            const isOpen = expanded === rec.id;
                            return (
                                <div key={rec.id} style={{ background:'#fff', border:`1px solid ${isOpen ? '#bae6fd' : '#e2e8f0'}`, borderRadius:14, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.03)', transition:'all .2s' }}>
                                    {/* Record header */}
                                    <div
                                        onClick={() => setExpanded(isOpen ? null : rec.id)}
                                        style={{ padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', transition:'background .12s' }}
                                        onMouseEnter={e => e.currentTarget.style.background='#fafafa'}
                                        onMouseLeave={e => e.currentTarget.style.background='#fff'}
                                    >
                                        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                                            <div style={{ width:42, height:42, borderRadius:11, background: isOpen ? 'linear-gradient(135deg,#0f172a,#0284c7)' : '#f0f9ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s', border:`1px solid ${isOpen?'#0284c7':'#bae6fd'}` }}>
                                                <Activity size={18} color={isOpen?'#fff':'#0284c7'}/>
                                            </div>
                                            <div>
                                                <div style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>{rec.diagnosis || 'Medical Record'}</div>
                                                <div style={{ fontSize:11, color:'#64748b', marginTop:2, display:'flex', alignItems:'center', gap:8 }}>
                                                    <Calendar size={10}/>
                                                    {rec.visitDate ? new Date(rec.visitDate).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }) : '—'}
                                                    {rec.doctorId && <span style={{ display:'flex', alignItems:'center', gap:3 }}><Stethoscope size={10}/> Doctor #{rec.doctorId}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                            <button
                                                onClick={e => { e.stopPropagation(); handleDownload(rec.id); }}
                                                disabled={downloading === rec.id}
                                                style={{ padding:'6px 11px', borderRadius:8, border:'1px solid #e2e8f0', background:'#fff', color:'#374151', fontSize:11, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}
                                            >
                                                {downloading === rec.id ? <Loader2 size={11} style={{ animation:'spin 1s linear infinite' }}/> : <Download size={11}/>}
                                                PDF
                                            </button>
                                            {isOpen ? <ChevronUp size={16} color="#94a3b8"/> : <ChevronDown size={16} color="#94a3b8"/>}
                                        </div>
                                    </div>

                                    {/* Expanded details */}
                                    {isOpen && (
                                        <div style={{ borderTop:'1px solid #e0f2fe', padding:'16px 18px', background:'#f0f9ff' }}>
                                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                                                {[
                                                    { label:'Diagnosis',         value:rec.diagnosis },
                                                    { label:'Treatment',         value:rec.treatment },
                                                    { label:'Symptoms',          value:rec.symptoms },
                                                    { label:'Medicines',         value:rec.medicines },
                                                    { label:'Tests Recommended', value:rec.testsRecommended },
                                                    { label:'Follow-up Date',    value:rec.followUpDate ? new Date(rec.followUpDate).toLocaleDateString('en-IN') : null },
                                                ].map(f => f.value ? (
                                                    <div key={f.label} style={{ background:'#fff', border:'1px solid #e0f2fe', borderRadius:9, padding:'10px 12px' }}>
                                                        <div style={{ fontSize:9, fontWeight:700, color:'#0284c7', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4, display:'flex', alignItems:'center', gap:4 }}>
                                                            <FileText size={9}/>{f.label}
                                                        </div>
                                                        <div style={{ fontSize:12, color:'#374151', lineHeight:1.6 }}>{f.value}</div>
                                                    </div>
                                                ) : null)}

                                                {rec.notes && (
                                                    <div style={{ gridColumn:'1/-1', background:'#fff', border:'1px solid #e0f2fe', borderRadius:9, padding:'12px' }}>
                                                        <div style={{ fontSize:9, fontWeight:700, color:'#0284c7', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Doctor Notes</div>
                                                        <div style={{ fontSize:12, color:'#374151', lineHeight:1.8 }}>{rec.notes}</div>
                                                    </div>
                                                )}
                                            </div>
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