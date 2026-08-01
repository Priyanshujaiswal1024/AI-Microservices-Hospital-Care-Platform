import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
    Pill, 
    FlaskConical, 
    Syringe, 
    Droplet, 
    Sparkles, 
    Stethoscope, 
    Search, 
    X, 
    CheckCircle2, 
    AlertCircle, 
    Loader2 
} from 'lucide-react';

const typeConfig = {
    TABLET:    { icon: Pill,         color: '#0284c7', bg: '#f0f9ff' },
    CAPSULE:   { icon: FlaskConical, color: '#7c3aed', bg: '#f5f3ff' },
    SYRUP:     { icon: Droplet,      color: '#d97706', bg: '#fffbeb' },
    INJECTION: { icon: Syringe,      color: '#dc2626', bg: '#fef2f2' },
    OINTMENT:  { icon: Sparkles,     color: '#0d9488', bg: '#f0fdf4' },
    DROPS:     { icon: Stethoscope,  color: '#0891b2', bg: '#ecfeff' },
};

export default function Medicines() {
    const [query, setQuery]         = useState('');
    const [results, setResults]     = useState([]);
    const [loading, setLoading]     = useState(false);
    const [searched, setSearched]   = useState(false);
    const [selected, setSelected]   = useState(null);

    useEffect(() => {
        if (!query.trim()) { setResults([]); setSearched(false); return; }
        const timer = setTimeout(() => searchMedicines(query), 400);
        return () => clearTimeout(timer);
    }, [query]);

    async function searchMedicines(name) {
        setLoading(true);
        setSearched(true);
        try {
            const { data } = await api.get('/medicines/search', {
                params: { name },
            });
            setResults(data || []);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* topbar */}
            <div style={{
                background: '#fff', borderBottom: '1px solid #e2e8f0',
                padding: '12px 20px', position: 'sticky', top: 0, zIndex: 10,
            }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                    Medicines
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                    Search medicines by name or type
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>

                {/* search box */}
                <div style={{
                    background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 60%, #0f766e 100%)',
                    borderRadius: '14px', padding: '24px',
                    marginBottom: '20px', position: 'relative', overflow: 'hidden', color: '#fff'
                }}>
                    <div style={{
                        position: 'absolute', right: '-20px', top: '-20px',
                        width: '100px', height: '100px', borderRadius: '50%',
                        background: 'rgba(255,255,255,.05)',
                    }}/>

                    <div style={{
                        fontSize: '18px', fontWeight: 700, color: '#fff',
                        marginBottom: '4px', display: 'flex', alignItems: 'center', gap: 8
                    }}>
                        <Search size={20} color="#2dd4bf" />
                        <span>Medicine Search</span>
                    </div>
                    <div style={{
                        fontSize: '11px', color: 'rgba(255,255,255,.7)',
                        marginBottom: '16px',
                    }}>
                        Search by medicine name to view details, price & dosage
                    </div>

                    {/* search input */}
                    <div style={{ position: 'relative' }}>
                        <Search size={16} color="#64748b" style={{
                            position: 'absolute', left: '14px', top: '50%',
                            transform: 'translateY(-50%)',
                        }} />
                        <input
                            style={{
                                width: '100%', borderRadius: '10px', border: 'none',
                                padding: '12px 16px 12px 40px', fontSize: '13px',
                                outline: 'none', fontFamily: 'Inter, system-ui, sans-serif',
                                background: '#ffffff', color: '#0f172a',
                                boxSizing: 'border-box',
                            }}
                            placeholder="Type medicine name... e.g. Paracetamol, Amoxicillin"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            autoFocus
                        />
                        {query && (
                            <button
                                onClick={() => { setQuery(''); setResults([]); setSearched(false); }}
                                style={{
                                    position: 'absolute', right: '12px', top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: '#f1f5f9', border: 'none',
                                    borderRadius: '50%', width: '22px', height: '22px',
                                    cursor: 'pointer', color: '#64748b',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* result count */}
                    {searched && !loading && (
                        <div style={{
                            fontSize: '11px', color: 'rgba(255,255,255,.8)',
                            marginTop: '10px', display: 'flex', alignItems: 'center', gap: 6
                        }}>
                            {results.length > 0
                                ? <><CheckCircle2 size={14} color="#2dd4bf" /> <span>{results.length} medicine{results.length > 1 ? 's' : ''} found for "{query}"</span></>
                                : <><AlertCircle size={14} color="#fca5a5" /> <span>No medicines found for "{query}"</span></>
                            }
                        </div>
                    )}
                </div>

                {/* loading skeletons */}
                {loading && (
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px',
                    }}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} style={{
                                background: '#e2e8f0', borderRadius: '12px',
                                height: '120px', animation: 'pulse 1.5s infinite',
                            }}/>
                        ))}
                    </div>
                )}

                {/* empty state — before search */}
                {!loading && !searched && (
                    <div style={{
                        textAlign: 'center', padding: '50px 20px',
                        color: '#64748b', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: '#0d9488' }}>
                            <Pill size={48} />
                        </div>
                        <div style={{
                            fontWeight: 700, color: '#0f172a',
                            fontSize: '15px', marginBottom: '6px',
                        }}>
                            Search for Medicines
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                            Type a medicine name above or select a category below
                        </div>

                        {/* medicine type chips - fully interactive */}
                        <div style={{
                            display: 'flex', gap: '8px', flexWrap: 'wrap',
                            justifyContent: 'center', marginTop: '20px',
                        }}>
                            {Object.entries(typeConfig).map(([type, cfg]) => {
                                const TypeIcon = cfg.icon;
                                return (
                                    <button
                                        key={type}
                                        onClick={() => setQuery(type.toLowerCase())}
                                        style={{
                                            padding: '8px 16px', borderRadius: '20px',
                                            border: `1px solid ${cfg.color}40`,
                                            background: cfg.bg, color: cfg.color,
                                            fontSize: '12px', fontWeight: 600,
                                            cursor: 'pointer', transition: 'all 0.15s ease',
                                            display: 'inline-flex', alignItems: 'center', gap: 6
                                        }}
                                    >
                                        <TypeIcon size={14} />
                                        <span>{type.charAt(0) + type.slice(1).toLowerCase()}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* no results */}
                {!loading && searched && results.length === 0 && (
                    <div style={{
                        textAlign: 'center', padding: '50px',
                        background: '#fff', borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: '#94a3b8' }}>
                            <Search size={40} />
                        </div>
                        <div style={{
                            fontWeight: 700, color: '#0f172a',
                            marginBottom: '6px',
                        }}>
                            No medicines found
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                            Try searching for Paracetamol, Amoxicillin, or click a category above
                        </div>
                    </div>
                )}

                {/* results grid */}
                {!loading && results.length > 0 && (
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px',
                    }}>
                        {results.map(med => {
                            const cfg = typeConfig[med.type] || typeConfig.TABLET;
                            const TypeIcon = cfg.icon;
                            return (
                                <div
                                    key={med.id}
                                    onClick={() => setSelected(med)}
                                    style={{
                                        background: '#fff', border: '1px solid #e2e8f0',
                                        borderRadius: '12px', padding: '16px',
                                        cursor: 'pointer', transition: 'all .15s',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = '#0d9488';
                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(13,148,136,.1)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.transform = 'none';
                                    }}
                                >
                                    <div style={{
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'space-between', marginBottom: '10px',
                                    }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '10px',
                                            background: cfg.bg, color: cfg.color,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <TypeIcon size={20} />
                                        </div>
                                        <span style={{
                                            background: cfg.bg, color: cfg.color,
                                            fontSize: '10px', fontWeight: 700,
                                            padding: '3px 8px', borderRadius: '6px',
                                            border: `1px solid ${cfg.color}33`,
                                        }}>
                                            {med.type}
                                        </span>
                                    </div>

                                    <div style={{
                                        fontSize: '13px', fontWeight: 700,
                                        color: '#0f172a', marginBottom: '3px',
                                    }}>
                                        {med.name}
                                    </div>

                                    <div style={{
                                        fontSize: '11px', color: '#64748b',
                                        marginBottom: '10px',
                                    }}>
                                        {med.category || 'General'}
                                    </div>

                                    <div style={{
                                        borderTop: '1px solid #f1f5f9',
                                        paddingTop: '10px',
                                        display: 'grid', gridTemplateColumns: '1fr 1fr',
                                        gap: '8px',
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                                                Price
                                            </div>
                                            <div style={{
                                                fontSize: '13px', fontWeight: 700,
                                                color: '#0d9488',
                                            }}>
                                                ₹{med.price}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                                                Stock
                                            </div>
                                            <div style={{
                                                fontSize: '13px', fontWeight: 700,
                                                color: med.stock > 10 ? '#059669' : '#dc2626',
                                            }}>
                                                {med.stock > 0 ? `${med.stock} left` : 'Out of stock'}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        marginTop: '8px', fontSize: '11px',
                                        color: '#0d9488', fontWeight: 600, textAlign: 'center',
                                    }}>
                                        View Details →
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selected && (
                <div
                    onClick={() => setSelected(null)}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(15,23,42,.4)',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', zIndex: 100,
                        padding: '20px', backdropFilter: 'blur(4px)'
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#fff', borderRadius: '16px',
                            padding: '24px', width: '100%', maxWidth: '420px',
                            boxShadow: '0 20px 60px rgba(15,23,42,.2)', border: '1px solid #e2e8f0'
                        }}
                    >
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', marginBottom: '20px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '12px',
                                    background: typeConfig[selected.type]?.bg || '#f8fafc',
                                    color: typeConfig[selected.type]?.color || '#0d9488',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {typeConfig[selected.type] ? (
                                        (() => {
                                            const ModalIcon = typeConfig[selected.type].icon;
                                            return <ModalIcon size={24} />;
                                        })()
                                    ) : <Pill size={24} />}
                                </div>
                                <div>
                                    <div style={{
                                        fontSize: '16px', fontWeight: 700, color: '#0f172a',
                                    }}>
                                        {selected.name}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                                        {selected.category}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelected(null)}
                                style={{
                                    background: '#f1f5f9', border: 'none',
                                    borderRadius: '50%', width: '32px', height: '32px',
                                    cursor: 'pointer', color: '#64748b',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr',
                            gap: '12px', marginBottom: '16px',
                        }}>
                            {[
                                { label: 'Type',         value: selected.type },
                                { label: 'Dosage',       value: selected.dosage || '—' },
                                { label: 'Manufacturer', value: selected.manufacturer || '—' },
                                { label: 'Price',        value: `₹${selected.price}` },
                            ].map(item => (
                                <div key={item.label} style={{
                                    background: '#f8fafc', borderRadius: '10px',
                                    padding: '10px 12px', border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{
                                        fontSize: '10px', color: '#64748b',
                                        textTransform: 'uppercase', marginBottom: '3px', fontWeight: 600
                                    }}>
                                        {item.label}
                                    </div>
                                    <div style={{
                                        fontSize: '13px', fontWeight: 600, color: '#0f172a',
                                    }}>
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{
                            background: '#f8fafc', borderRadius: '10px',
                            padding: '12px', marginBottom: '16px', border: '1px solid #e2e8f0'
                        }}>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                marginBottom: '6px',
                            }}>
                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                                    Stock Availability
                                </span>
                                <span style={{
                                    fontSize: '11px', fontWeight: 700,
                                    color: selected.stock > 10 ? '#059669' : '#dc2626',
                                }}>
                                    {selected.stock} units
                                </span>
                            </div>
                            <div style={{
                                height: '6px', background: '#e2e8f0',
                                borderRadius: '3px', overflow: 'hidden',
                            }}>
                                <div style={{
                                    height: '100%', borderRadius: '3px',
                                    width: `${Math.min((selected.stock / 100) * 100, 100)}%`,
                                    background: selected.stock > 10
                                        ? 'linear-gradient(90deg, #0d9488, #0f172a)'
                                        : '#ef4444',
                                    transition: 'width .5s',
                                }}/>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelected(null)}
                            style={{
                                width: '100%', padding: '11px', borderRadius: '10px',
                                border: 'none', background: 'linear-gradient(135deg, #0d9488 0%, #0f172a 100%)', color: '#fff',
                                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0%,100% { opacity:1; } 50% { opacity:.5; }
                }
            `}</style>
        </div>
    );
}