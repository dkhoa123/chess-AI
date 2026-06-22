import pieceImages from '../../pieceimg.js';

export default function PromotionModal({ isWhite, onSelect }) {
    const color = isWhite ? 'w' : 'b';
    const pieces = ['q', 'r', 'b', 'n'];
    const labels = { q: 'Hậu', r: 'Xe', b: 'Tượng', n: 'Mã' };

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: '#fff',
                borderRadius: 12,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: 18 }}>
                    Chọn quân phong cấp
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                    {pieces.map(p => (
                        <div
                            key={p}
                            onClick={() => onSelect(p)}
                            style={{
                                cursor: 'pointer',
                                padding: 10,
                                borderRadius: 8,
                                border: '2px solid #ccc',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 6,
                                transition: 'background 0.15s, border-color 0.15s'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = '#f0f0f0';
                                e.currentTarget.style.borderColor = '#888';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = '#ccc';
                            }}
                        >
                            <img src={pieceImages[color + p]} width={60} height={60} alt={labels[p]} />
                            <span style={{ fontSize: 13, color: '#555' }}>{labels[p]}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}