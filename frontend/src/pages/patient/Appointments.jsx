import { useEffect, useState } from 'react';
import { useNavigate }         from 'react-router-dom';
import api                     from '../../api/axios';
import Pagination              from '../../components/Pagination';
import { Clock, CheckCircle2, Check, XCircle, Plus, Calendar } from 'lucide-react';

const statusConfig = {
    BOOKED:    { bg:'#fffbeb', color:'#92400e', border:'#fde68a', label:'Booked',    icon: Clock },
    CONFIRMED: { bg:'#f0fdf4', color:'#166534', border:'#bbf7d0', label:'Confirmed', icon: CheckCircle2 },
    COMPLETED: { bg:'#f8fafc', color:'#334155', border:'#e2e8f0', label:'Completed', icon: Check },
    CANCELLED: { bg:'#fef2f2', color:'#dc2626', border:'#fecaca', label:'Cancelled', icon: XCircle },
};

export default function Appointments() {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading]           = useState(true);
    const [filter, setFilter]             = useState('ALL');
    const [cancelling, setCancelling]     = useState(null);
    const [error, setError]               = useState('');
    const [currentPage, setCurrentPage]   = useState(1);
    const [pageSize, setPageSize]         = useState(10);

    useEffect(() => { fetchAppointments(); }, []);

    async function fetchAppointments() {
        setLoading(true);
        try {
            const { data } = await api.get('/patient/appointments', {
                params: { page: 0, size: 50 },
            });
            setAppointments(data);
        } catch {
            setError('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel(id) {
        if (!window.confirm('Cancel this appointment?')) return;
        setCancelling(id);
        try {
            await api.patch(`/patient/appointments/${id}/cancel`);
            setAppointments(prev =>
                prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a)
            );
        } catch {
            setError('Failed to cancel appointment');
        } finally {
            setCancelling(null);
        }
    }

    const filtered = filter === 'ALL'
        ? appointments
        : filter === 'UPCOMING'
            ? appointments.filter(a => ['BOOKED','CONFIRMED'].includes(a.status))
            : appointments.filter(a => a.status === filter);

    const counts = {
        total:     appointments.length,
        upcoming:  appointments.filter(a => ['BOOKED','CONFIRMED'].includes(a.status)).length,
        completed: appointments.filter(a => a.status === 'COMPLETED').length,
        cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
    };

    // next upcoming appointment
    const nextAppt = appointments
        .filter(a => ['BOOKED','CONFIRMED'].includes(a.status))
        .sort((a,b) => new Date(a.appointmentTime) - new Date(b.appointmentTime))[0];

    return (
        <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>

            {/* topbar */}
            <div style={{
                background:'#fff', borderBottom:'1px solid #f0f0f0', padding:'12px 20px',
                display:'flex', alignItems:'center', justifyContent:'space-between',
                position:'sticky', top:0, zIndex:10,
            }}>
                <div>
                    <div style={{ fontSize:'15px', fontWeight:700, color:'#111' }}>My Appointments</div>
                    <div style={{ fontSize:'11px', color:'#9ca3af', marginTop:'1px' }}>All past & upcoming visits</div>
                </div>
                <button
                    onClick={() => navigate('/patient/doctors')}
                    style={{
                        padding:'7px 16px', borderRadius:'8px', border:'none',
                        background:'#0a4f3a', color:'#fff', fontSize:'12px',
                        fontWeight:600, cursor:'pointer',
                        display:'flex', alignItems:'center', gap:'6px',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1D9E75'}
                    onMouseLeave={e => e.currentTarget.style.background = '#0a4f3a'}
                >
                    📅 + Book New
                </button>
            </div>

            <div style={{ flex:1, overflowY:'auto', padding:'18px 20px' }}>

                {error && (
                    <div style={{
                        background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626',
                        fontSize:'12px', borderRadius:'9px', padding:'10px 14px', marginBottom:'14px',
                    }}>⚠️ {error}</div>
                )}

                {/* ✅ Next appointment banner */}
                {nextAppt && (
                    <div style={{
                        background:'linear-gradient(120deg,#0a4f3a,#1D9E75)',
                        borderRadius:'12px', padding:'16px 20px', color:'#fff',
                        marginBottom:'14px', position:'relative', overflow:'hidden',
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                    }}>
                        {/* decorative */}
                        <div style={{
                            position:'absolute', right:'-20px', top:'-20px',
                            width:'100px', height:'100px', borderRadius:'50%',
                            background:'rgba(255,255,255,.07)',
                        }}/>
                        <div style={{
                            position:'absolute', right:'60px', bottom:'-30px',
                            width:'80px', height:'80px', borderRadius:'50%',
                            background:'rgba(255,255,255,.05)',
                        }}/>

                        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                            {/* pulse dot */}
                            <div style={{ position:'relative', flexShrink:0 }}>
                                <div style={{
                                    width:'44px', height:'44px', borderRadius:'12px',
                                    background:'rgba(255,255,255,.2)',
                                    display:'flex', alignItems:'center',
                                    justifyContent:'center', fontSize:'22px',
                                }}>📅</div>
                                <div style={{
                                    position:'absolute', top:'-3px', right:'-3px',
                                    width:'12px', height:'12px', borderRadius:'50%',
                                    background:'#4ade80',
                                    border:'2px solid #0a4f3a',
                                    animation:'pulse 2s infinite',
                                }}/>
                            </div>
                            <div>
                                <div style={{
                                    fontSize:'10px', opacity:.7,
                                    textTransform:'uppercase', letterSpacing:'.07em',
                                    marginBottom:'3px',
                                }}>
                                    🔔 Next Appointment
                                </div>
                                <div style={{ fontSize:'15px', fontWeight:700 }}>
                                    {nextAppt.doctorName}
                                </div>
                                <div style={{ fontSize:'11px', opacity:.8, marginTop:'2px' }}>
                                    {new Date(nextAppt.appointmentTime).toLocaleString('en-IN', {
                                        weekday:'long', day:'numeric', month:'long',
                                        hour:'2-digit', minute:'2-digit',
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* status badge */}
                        <div style={{
                            background:'rgba(255,255,255,.2)',
                            border:'1px solid rgba(255,255,255,.3)',
                            padding:'6px 14px', borderRadius:'20px',
                            fontSize:'11px', fontWeight:700, flexShrink:0,
                        }}>
                            {statusConfig[nextAppt.status]?.icon} {statusConfig[nextAppt.status]?.label}
                        </div>
                    </div>
                )}

                {/* ✅ Colorful stat cards */}
                <div style={{
                    display:'grid', gridTemplateColumns:'repeat(4,1fr)',
                    gap:'10px', marginBottom:'14px',
                }}>
                    {[
                        {
                            label:'Total Visits', value: counts.total,
                            Icon: Calendar, bg:'linear-gradient(135deg, #0d9488 0%, #0f172a 100%)',
                            color:'#fff', sub:'All time',
                        },
                        {
                            label:'Upcoming', value: counts.upcoming,
                            Icon: Clock, bg:'linear-gradient(135deg, #0284c7 0%, #1e3a8a 100%)',
                            color:'#fff', sub:'Scheduled',
                        },
                        {
                            label:'Completed', value: counts.completed,
                            Icon: CheckCircle2, bg:'linear-gradient(135deg, #059669 0%, #064e3b 100%)',
                            color:'#fff', sub:'Done',
                        },
                        {
                            label:'Cancelled', value: counts.cancelled,
                            Icon: XCircle, bg:'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)',
                            color:'#fff', sub:'Cancelled',
                        },
                    ].map(card => {
                        const CardIcon = card.Icon;
                        return (
                            <div key={card.label} style={{
                                background: card.bg, borderRadius:'12px',
                                padding:'14px 16px', position:'relative', overflow:'hidden',
                            }}>
                                <div style={{
                                    position:'absolute', right:'-10px', top:'-10px',
                                    width:'60px', height:'60px', borderRadius:'50%',
                                    background:'rgba(255,255,255,.1)',
                                }}/>
                                <div style={{
                                    marginBottom:'8px', color: '#fff'
                                }}>
                                    <CardIcon size={22} />
                                </div>
                                <div style={{
                                    fontSize:'26px', fontWeight:800, color:card.color,
                                    lineHeight:1,
                                }}>{card.value}</div>
                                <div style={{
                                    fontSize:'11px', fontWeight:600,
                                    color:'rgba(255,255,255,.9)', marginTop:'4px',
                                }}>{card.label}</div>
                                <div style={{
                                    fontSize:'10px',
                                    color:'rgba(255,255,255,.6)', marginTop:'1px',
                                }}>{card.sub}</div>
                            </div>
                        );
                    })}
                </div>

                {/* ✅ Filter tabs */}
                <div style={{
                    display:'flex', gap:'6px', marginBottom:'12px', flexWrap:'wrap',
                }}>
                    {[
                        { key:'ALL',       label:`All (${counts.total})` },
                        { key:'UPCOMING',  label:`Upcoming (${counts.upcoming})` },
                        { key:'BOOKED',    label:'Booked' },
                        { key:'CONFIRMED', label:'Confirmed' },
                        { key:'COMPLETED', label:'Completed' },
                        { key:'CANCELLED', label:'Cancelled' },
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            style={{
                                padding:'6px 14px', borderRadius:'16px', fontSize:'11px',
                                fontWeight:600, cursor:'pointer', transition:'all .12s',
                                border: filter === f.key ? 'none' : '1px solid #cbd5e1',
                                background: filter === f.key ? 'linear-gradient(135deg, #0d9488 0%, #0f172a 100%)' : '#fff',
                                color: filter === f.key ? '#fff' : '#475569',
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* ✅ Appointments list */}
                {loading ? (
                    <div style={{
                        display:'flex', flexDirection:'column', gap:'10px',
                    }}>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} style={{
                                background:'#f8fafc', borderRadius:'12px',
                                height:'70px', animation:'pulse 1.5s infinite',
                            }}/>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{
                        background:'#fff', border:'1px solid #e2e8f0',
                        borderRadius:'12px', padding:'50px',
                        textAlign:'center', color:'#64748b',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom:'12px', color: '#94a3b8' }}>
                            <Calendar size={40} />
                        </div>
                        <div style={{ fontWeight:600, color:'#0f172a', marginBottom:'4px' }}>
                            No appointments found
                        </div>
                        <div style={{ fontSize:'12px', marginBottom:'14px' }}>
                            Book your first appointment today
                        </div>
                        <button
                            onClick={() => navigate('/patient/doctors')}
                            style={{
                                padding:'8px 18px', borderRadius:'8px', border:'none',
                                background:'linear-gradient(135deg, #0d9488 0%, #0f172a 100%)', color:'#fff',
                                fontSize:'12px', fontWeight:600, cursor:'pointer',
                            }}
                        >
                            Find Doctors →
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                            {filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(appt => {
                                const sc = statusConfig[appt.status] || statusConfig.BOOKED;
                                const StatusIcon = sc.icon;
                                const initials = appt.doctorName
                                    ?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
                                const isUpcoming = ['BOOKED','CONFIRMED'].includes(appt.status);
                                const apptDate = new Date(appt.appointmentTime);
                                const isToday = new Date().toDateString() === apptDate.toDateString();

                                return (
                                    <div key={appt.id} style={{
                                        background:'#fff',
                                        border: isUpcoming ? '1px solid #99f6e4' : '1px solid #e2e8f0',
                                        borderRadius:'12px', padding:'14px 16px',
                                        display:'flex', alignItems:'center',
                                        gap:'14px', transition:'all .15s',
                                        boxShadow: isUpcoming ? '0 2px 8px rgba(13,148,136,.06)' : 'none',
                                    }}
                                         onMouseEnter={e => {
                                             e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.06)';
                                             e.currentTarget.style.transform = 'translateY(-1px)';
                                         }}
                                         onMouseLeave={e => {
                                             e.currentTarget.style.boxShadow = isUpcoming ? '0 2px 8px rgba(13,148,136,.06)' : 'none';
                                             e.currentTarget.style.transform = 'none';
                                         }}
                                    >
                                        {/* avatar */}
                                        <div style={{
                                            width:'44px', height:'44px', borderRadius:'11px',
                                            background:'linear-gradient(135deg, #0d9488 0%, #0f172a 100%)',
                                            color:'#fff', fontSize:'14px', fontWeight:700,
                                            display:'flex', alignItems:'center',
                                            justifyContent:'center', flexShrink:0,
                                        }}>
                                            {initials}
                                        </div>

                                        {/* doctor + date */}
                                        <div style={{ flex:1, minWidth:0 }}>
                                            <div style={{
                                                display:'flex', alignItems:'center', gap:'8px',
                                                marginBottom:'3px',
                                            }}>
                                                <div style={{
                                                    fontSize:'13px', fontWeight:700, color:'#0f172a',
                                                }}>
                                                    {appt.doctorName}
                                                </div>
                                                {/* TODAY badge */}
                                                {isToday && (
                                                    <span style={{
                                                        background:'#fef3c7', color:'#92400e',
                                                        fontSize:'9px', fontWeight:700,
                                                        padding:'2px 7px', borderRadius:'6px',
                                                        border:'1px solid #fde68a',
                                                    }}>
                                                        TODAY
                                                    </span>
                                                )}
                                                {/* UPCOMING badge */}
                                                {isUpcoming && !isToday && (
                                                    <span style={{
                                                        background:'#f0fdf4', color:'#0d9488',
                                                        fontSize:'9px', fontWeight:700,
                                                        padding:'2px 7px', borderRadius:'6px',
                                                        border:'1px solid #99f6e4',
                                                    }}>
                                                        UPCOMING
                                                    </span>
                                                )}
                                            </div>

                                            <div style={{
                                                fontSize:'11px', color:'#0d9488', fontWeight:600,
                                                marginBottom:'4px',
                                            }}>
                                                {appt.departmentName}
                                            </div>

                                            <div style={{
                                                fontSize:'11px', color:'#64748b',
                                                display:'flex', alignItems:'center', gap:'12px',
                                                flexWrap:'wrap',
                                            }}>
                                                <span>📅 {appt.appointmentTime ? new Date(appt.appointmentTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                                                <span>⏰ {appt.appointmentTime ? new Date(appt.appointmentTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                                                {appt.reason && <span>📝 {appt.reason}</span>}
                                            </div>
                                        </div>

                                        {/* status pill */}
                                        <div style={{
                                            display:'flex', alignItems:'center', gap:'4px',
                                            background:sc.bg, color:sc.color,
                                            border:`1px solid ${sc.border}`,
                                            padding:'3px 10px', borderRadius:'20px',
                                            fontSize:'11px', fontWeight:600, flexShrink:0,
                                        }}>
                                            <StatusIcon size={12} />
                                            <span>{sc.label}</span>
                                        </div>

                                        {/* cancel button */}
                                        {isUpcoming && (
                                            <button
                                                onClick={() => handleCancel(appt.id)}
                                                disabled={cancelling === appt.id}
                                                style={{
                                                    padding:'5px 12px', borderRadius:'7px',
                                                    border:'1px solid #fecaca',
                                                    background:'#fef2f2', color:'#dc2626',
                                                    fontSize:'11px', fontWeight:600,
                                                    cursor:'pointer', flexShrink:0,
                                                    transition:'all .12s',
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.background = '#dc2626';
                                                    e.currentTarget.style.color = '#fff';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.background = '#fef2f2';
                                                    e.currentTarget.style.color = '#dc2626';
                                                }}
                                            >
                                                {cancelling === appt.id ? '...' : 'Cancel'}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ marginTop: 16, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={Math.ceil(filtered.length / pageSize) || 1}
                                totalItems={filtered.length}
                                pageSize={pageSize}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={(sz) => { setPageSize(sz); setCurrentPage(1); }}
                                itemLabel="appointments"
                            />
                        </div>
                    </>
                )}
            </div>

            <style>{`
                @keyframes pulse {
                    0%,100% { opacity:1; } 50% { opacity:.5; }
                }
            `}</style>
        </div>
    );
}