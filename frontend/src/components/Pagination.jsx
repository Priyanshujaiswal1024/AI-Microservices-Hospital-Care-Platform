import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    pageSize = 10,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [5, 10, 20, 50],
    itemLabel = "items"
}) {
    if (totalItems === 0) return null;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem   = Math.min(currentPage * pageSize, totalItems);

    function getPageNumbers() {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - 2);
        let end   = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    }

    const pageNumbers = getPageNumbers();

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            flexWrap: 'wrap',
            gap: 12,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '13px',
            color: '#475569'
        }}>
            {/* Left summary & page size selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <span style={{ color: '#64748b' }}>
                    Showing <strong style={{ color: '#0f172a' }}>{startItem}</strong> to <strong style={{ color: '#0f172a' }}>{endItem}</strong> of <strong style={{ color: '#0f172a' }}>{totalItems}</strong> {itemLabel}
                </span>

                {onPageSizeChange && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Per page:</span>
                        <select
                            value={pageSize}
                            onChange={e => onPageSizeChange(Number(e.target.value))}
                            style={{
                                padding: '4px 8px',
                                borderRadius: 6,
                                border: '1px solid #cbd5e1',
                                background: '#f8fafc',
                                color: '#0f172a',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                        >
                            {pageSizeOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Right pagination controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        background: currentPage <= 1 ? '#f1f5f9' : '#ffffff',
                        color: currentPage <= 1 ? '#94a3b8' : '#0f172a',
                        cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease'
                    }}
                    aria-label="Previous Page"
                >
                    <ChevronLeft size={16} />
                </button>

                {/* Page Number Pills */}
                {pageNumbers[0] > 1 && (
                    <>
                        <button
                            onClick={() => onPageChange(1)}
                            style={{
                                width: 32, height: 32, borderRadius: 6,
                                border: '1px solid #cbd5e1', background: '#ffffff',
                                color: '#0f172a', fontWeight: 600, fontSize: '12px', cursor: 'pointer'
                            }}
                        >
                            1
                        </button>
                        {pageNumbers[0] > 2 && <span style={{ padding: '0 4px', color: '#94a3b8' }}>...</span>}
                    </>
                )}

                {pageNumbers.map(page => {
                    const isActive = page === currentPage;
                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                border: isActive ? '1px solid #0d9488' : '1px solid #cbd5e1',
                                background: isActive ? 'linear-gradient(135deg, #0d9488 0%, #0f172a 100%)' : '#ffffff',
                                color: isActive ? '#ffffff' : '#0f172a',
                                fontWeight: isActive ? 700 : 500,
                                fontSize: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                boxShadow: isActive ? '0 2px 6px rgba(13, 148, 136, 0.25)' : 'none'
                            }}
                        >
                            {page}
                        </button>
                    );
                })}

                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <>
                        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span style={{ padding: '0 4px', color: '#94a3b8' }}>...</span>}
                        <button
                            onClick={() => onPageChange(totalPages)}
                            style={{
                                width: 32, height: 32, borderRadius: 6,
                                border: '1px solid #cbd5e1', background: '#ffffff',
                                color: '#0f172a', fontWeight: 600, fontSize: '12px', cursor: 'pointer'
                            }}
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                {/* Next Button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        background: currentPage >= totalPages ? '#f1f5f9' : '#ffffff',
                        color: currentPage >= totalPages ? '#94a3b8' : '#0f172a',
                        cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease'
                    }}
                    aria-label="Next Page"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
