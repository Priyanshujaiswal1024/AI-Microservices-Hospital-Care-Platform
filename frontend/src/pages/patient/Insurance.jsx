import { useEffect, useState } from 'react';
import api                     from '../../api/axios';
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2, CalendarCheck, Hash } from 'lucide-react';

export default function Insurance() {
    const [insurance, setInsurance] = useState(null);
    const [loading, setLoading]     = useState(true);
    const [saving, setSaving]       = useState(false);
    const [success, setSuccess]     = useState('');
    const [error, setError]         = useState('');
    const [form, setForm]           = useState({ provider:'', policyNumber:'', validUntil:'' });

    useEffect(() => { fetchInsurance(); }, []);

    async function fetchInsurance() {
        setLoading(true);
        try {
            const { data } = await api.get('/patient/insurance');
            setInsurance(data);
        } catch {
            setInsurance(null);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(e) {
        e.preventDefault();
        if (!form.provider || !form.policyNumber || !form.validUntil) { setError('All fields are required'); return; }
        setSaving(true); setError(''); setSuccess('');
        try {
            await api.post('/patient/insurance', form);
            setSuccess('Insurance saved successfully!');
            setForm({ provider:'', policyNumber:'', validUntil:'' });
            fetchInsurance();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save insurance');
        } finally {
            setSaving(false);
        }
    }

    const set  = key => e => setForm(f => ({ ...f, [key]: e.target.value }));
    const inp  = { width:'100%', border:'1.5px solid #e2e8f0', borderRadius:9, padding:'9px 12px', fontSize:13, outline:'none', background:'#f8fafc', fontFamily:"'Inter',sans-serif", transition:'border-color .15s', boxSizing:'border-box' };
    const lbl  = { fontSize:11, fontWeight:600, color:'#374151', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4, display:'block' };

    const isActive = insurance?.validUntil ? new Date(insurance.validUntil) >= new Date() : false;

    return (
        <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f8fafc', fontFamily:"'Inter',system-ui,sans-serif" }}>

            {/* Header */}
            <div style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'14px 22px', position:'sticky', top:0, zIndex:10, boxShadow:'0 1px 6px rgba(0,0,0,.04)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#0f172a,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <ShieldCheck size={17} color="#fff"/>
                    </div>
                    <div>
                        <div style={{ fontSize:15, fontWeight:700, color:'#0f172a', lineHeight:1.1 }}>Insurance</div>
                        <div style={{ fontSize:11, color:'#64748b', marginTop:1 }}>Your health insurance details</div>
                    </div>
                </div>
            </div>

            <div style={{ flex:1, overflowY:'auto', padding:'18px 22px' }}>
                <div style={{ maxWidth:520 }}>

                    {/* Current insurance card */}
                    {loading ? (
                        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, padding:'28px', textAlign:'center', marginBottom:16, display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                            <Loader2 size={22} color="#94a3b8" style={{ animation:'spin 1s linear infinite' }}/>
                            <span style={{ color:'#94a3b8', fontSize:13 }}>Loading insurance details...</span>
                        </div>
                    ) : insurance ? (
                        <div style={{ background:'linear-gradient(145deg,#0f172a 0%,#1e293b 60%,#0d9488 100%)', borderRadius:16, padding:'24px', color:'#fff', marginBottom:18, position:'relative', overflow:'hidden', boxShadow:'0 8px 32px rgba(15,23,42,.25)' }}>
                            <div style={{ position:'absolute', right:-30, top:-30, width:130, height:130, borderRadius:'50%', background:'rgba(255,255,255,.05)' }}/>
                            <div style={{ position:'absolute', left:-20, bottom:-20, width:100, height:100, borderRadius:'50%', background:'rgba(13,148,136,.15)' }}/>
                            <div style={{ position:'relative', zIndex:1 }}>
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                        <ShieldCheck size={18} color="#2dd4bf"/>
                                        <span style={{ fontSize:10, opacity:.7, textTransform:'uppercase', letterSpacing:'.1em' }}>Health Insurance</span>
                                    </div>
                                    <span style={{ background: isActive ? 'rgba(45,212,191,.2)' : 'rgba(239,68,68,.3)', border: isActive ? '1px solid rgba(45,212,191,.4)' : '1px solid rgba(239,68,68,.5)', padding:'3px 10px', borderRadius:8, fontSize:10, fontWeight:700, color: isActive ? '#2dd4bf' : '#fca5a5' }}>
                                        {isActive ? 'Active' : 'Expired'}
                                    </span>
                                </div>
                                <div style={{ fontSize:20, fontWeight:800, marginBottom:16, letterSpacing:'-0.02em' }}>{insurance.provider}</div>
                                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                                    <div>
                                        <div style={{ fontSize:10, opacity:.55, marginBottom:3 }}>Policy Number</div>
                                        <div style={{ fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:5 }}><Hash size={11} style={{ opacity:.6 }}/>{insurance.policyNumber}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize:10, opacity:.55, marginBottom:3 }}>Valid Until</div>
                                        <div style={{ fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:5 }}><CalendarCheck size={11} style={{ opacity:.6 }}/>{new Date(insurance.validUntil).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:12, padding:'14px 18px', marginBottom:16, display:'flex', alignItems:'center', gap:12 }}>
                            <AlertCircle size={20} color="#d97706"/>
                            <div>
                                <div style={{ fontSize:13, fontWeight:700, color:'#92400e' }}>No insurance found</div>
                                <div style={{ fontSize:11, color:'#92400e', opacity:.8, marginTop:2 }}>Add your insurance details below</div>
                            </div>
                        </div>
                    )}

                    {/* Add / update form */}
                    <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,.03)' }}>
                        <div style={{ fontSize:12, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:16, display:'flex', alignItems:'center', gap:6 }}>
                            <ShieldCheck size={14} color="#0d9488"/>
                            {insurance ? 'Update Insurance' : 'Add Insurance'}
                        </div>

                        {success && (
                            <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#166534', fontSize:12, borderRadius:9, padding:'10px 14px', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
                                <CheckCircle2 size={14}/>{success}
                            </div>
                        )}
                        {error && (
                            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', fontSize:12, borderRadius:9, padding:'10px 14px', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
                                <AlertCircle size={14}/>{error}
                            </div>
                        )}

                        <form onSubmit={handleSave}>
                            <div style={{ marginBottom:12 }}>
                                <label style={lbl}>Provider Name</label>
                                <input style={inp} placeholder="e.g. Star Health, HDFC Ergo" value={form.provider} onChange={set('provider')}
                                    onFocus={e => e.target.style.borderColor='#0d9488'} onBlur={e => e.target.style.borderColor='#e2e8f0'}/>
                            </div>
                            <div style={{ marginBottom:12 }}>
                                <label style={lbl}>Policy Number</label>
                                <input style={inp} placeholder="e.g. SH-20240324-001" value={form.policyNumber} onChange={set('policyNumber')}
                                    onFocus={e => e.target.style.borderColor='#0d9488'} onBlur={e => e.target.style.borderColor='#e2e8f0'}/>
                            </div>
                            <div style={{ marginBottom:16 }}>
                                <label style={lbl}>Valid Until</label>
                                <input type="date" style={inp} value={form.validUntil} onChange={set('validUntil')}
                                    onFocus={e => e.target.style.borderColor='#0d9488'} onBlur={e => e.target.style.borderColor='#e2e8f0'}/>
                            </div>
                            <button type="submit" disabled={saving}
                                style={{ width:'100%', padding:'11px', borderRadius:10, border:'none', background: saving ? '#94a3b8' : 'linear-gradient(135deg,#0f172a,#0d9488)', color:'#fff', fontSize:13, fontWeight:700, cursor: saving ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, boxShadow: saving ? 'none' : '0 2px 10px rgba(13,148,136,.3)' }}>
                                {saving ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }}/>Saving...</> : <><ShieldCheck size={14}/>{insurance ? 'Update Insurance' : 'Add Insurance'}</>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}