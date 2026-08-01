import { useEffect, useState } from 'react';
import { downloadPdf }         from '../../utils/downloadPdf';
import api                     from '../../api/axios';
import { Receipt, Download, CreditCard, CheckCircle2, Clock, Loader2 } from 'lucide-react';

export default function Bills() {
    const [bills, setBills]         = useState([]);
    const [loading, setLoading]     = useState(true);
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        api.get('/bills/patient')
            .then(({ data }) => setBills(data))
            .catch(() => setBills([]))
            .finally(() => setLoading(false));
    }, []);

    async function handleDownload(id) {
        setDownloading(id);
        await downloadPdf(`/bills/${id}/download`, `invoice-${id}.pdf`);
        setDownloading(null);
    }

    const totalBilled  = bills.reduce((s, b) => s + (b.totalAmount || 0), 0);
    const totalPaid    = bills.filter(b => b.status === 'PAID').reduce((s, b) => s + (b.totalAmount || 0), 0);
    const totalPending = bills.filter(b => b.status !== 'PAID').reduce((s, b) => s + (b.totalAmount || 0), 0);

    const th = { textAlign:'left', fontSize:'10px', fontWeight:700, color:'#94a3b8', padding:'8px 12px', borderBottom:'1.5px solid #f1f5f9', textTransform:'uppercase', letterSpacing:'.06em' };
    const td = { padding:'11px 12px', borderBottom:'1px solid #f8fafc', fontSize:'12px', color:'#374151', verticalAlign:'middle' };

    return (
        <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f8fafc', fontFamily:"'Inter',system-ui,sans-serif" }}>

            {/* Header */}
            <div style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'14px 22px', position:'sticky', top:0, zIndex:10, boxShadow:'0 1px 6px rgba(0,0,0,.04)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#0f172a,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Receipt size={17} color="#fff"/>
                    </div>
                    <div>
                        <div style={{ fontSize:15, fontWeight:700, color:'#0f172a', lineHeight:1.1 }}>My Bills</div>
                        <div style={{ fontSize:11, color:'#64748b', marginTop:1 }}>Payment history & pending dues</div>
                    </div>
                </div>
            </div>

            <div style={{ flex:1, overflowY:'auto', padding:'18px 22px' }}>

                {/* Stat cards */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
                    {[
                        { label:'Total Billed', value:`₹${totalBilled.toLocaleString('en-IN')}`, color:'#0f172a', bg:'linear-gradient(135deg,#f8fafc,#f1f5f9)', border:'#e2e8f0', icon:CreditCard, iconColor:'#475569' },
                        { label:'Pending',      value:`₹${totalPending.toLocaleString('en-IN')}`, color:'#92400e', bg:'linear-gradient(135deg,#fffbeb,#fef3c7)', border:'#fde68a', icon:Clock, iconColor:'#d97706' },
                        { label:'Paid',         value:`₹${totalPaid.toLocaleString('en-IN')}`,    color:'#166534', bg:'linear-gradient(135deg,#f0fdf4,#dcfce7)', border:'#bbf7d0', icon:CheckCircle2, iconColor:'#16a34a' },
                    ].map(c => {
                        const IconC = c.icon;
                        return (
                            <div key={c.label} style={{ background:c.bg, border:`1px solid ${c.border}`, borderRadius:12, padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
                                <div style={{ width:38, height:38, borderRadius:10, background:'rgba(255,255,255,.7)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                    <IconC size={18} color={c.iconColor}/>
                                </div>
                                <div>
                                    <div style={{ fontSize:18, fontWeight:800, color:c.color, lineHeight:1 }}>{c.value}</div>
                                    <div style={{ fontSize:10, color:'#94a3b8', marginTop:3, fontWeight:600 }}>{c.label}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bills table */}
                <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.03)' }}>
                    {loading ? (
                        <div style={{ textAlign:'center', padding:'50px', color:'#94a3b8', display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                            <Loader2 size={24} color="#94a3b8" style={{ animation:'spin 1s linear infinite' }}/>
                            <span style={{ fontSize:13 }}>Loading bills...</span>
                        </div>
                    ) : bills.length === 0 ? (
                        <div style={{ textAlign:'center', padding:'60px', color:'#94a3b8' }}>
                            <Receipt size={40} color="#cbd5e1" style={{ marginBottom:12 }}/>
                            <div style={{ fontWeight:600, color:'#374151', marginBottom:4 }}>No bills yet</div>
                            <div style={{ fontSize:12 }}>Your invoices will appear here after consultations</div>
                        </div>
                    ) : (
                        <table style={{ width:'100%', borderCollapse:'collapse' }}>
                            <thead>
                            <tr style={{ background:'#f8fafc' }}>
                                {['Bill ID','Doctor','Consult Fee','GST 18%','Total','Date','Status','Invoice'].map(h => (
                                    <th key={h} style={th}>{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {bills.map(bill => (
                                <tr key={bill.id} onMouseEnter={e => e.currentTarget.style.background='#f8fafc'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                                    <td style={td}><span style={{ fontWeight:600, color:'#0f172a' }}>#{bill.id}</span></td>
                                    <td style={td}>{bill.doctorName || '—'}</td>
                                    <td style={td}>₹{bill.consultationFee?.toLocaleString('en-IN')}</td>
                                    <td style={td}>₹{bill.gstAmount?.toLocaleString('en-IN')}</td>
                                    <td style={{ ...td, fontWeight:700, color:'#0f172a' }}>₹{bill.totalAmount?.toLocaleString('en-IN')}</td>
                                    <td style={td}>{bill.createdAt ? new Date(bill.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                                    <td style={td}>
                                        <span style={{ background:bill.status==='PAID'?'#f0fdf4':'#fef2f2', color:bill.status==='PAID'?'#166534':'#dc2626', padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:700, display:'inline-flex', alignItems:'center', gap:4 }}>
                                            <span style={{ width:5, height:5, borderRadius:'50%', background:bill.status==='PAID'?'#22c55e':'#ef4444', display:'inline-block' }}/>
                                            {bill.status === 'PAID' ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </td>
                                    <td style={td}>
                                        <button onClick={() => handleDownload(bill.id)} disabled={downloading === bill.id}
                                            style={{ padding:'5px 10px', borderRadius:7, border:'1px solid #e2e8f0', background:downloading===bill.id?'#f8fafc':'#fff', color:'#374151', fontSize:11, fontWeight:600, cursor:downloading===bill.id?'wait':'pointer', display:'flex', alignItems:'center', gap:4 }}>
                                            {downloading === bill.id ? <Loader2 size={12} style={{ animation:'spin 1s linear infinite' }}/> : <Download size={12}/>}
                                            PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}