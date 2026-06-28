const DIFF_LABEL = { easy: '⭐ Dễ', medium: '⭐⭐ Trung bình', hard: '⭐⭐⭐ Khó' };

const STATUS_COLOR = {
  checkmate: '#e74c3c',
  check:     '#e67e22',
  stalemate: '#3498db',
  insufficient_material: '#3498db',
  fifty_move: '#3498db',
  threefold_repetition: '#3498db',
};

export default function TopBar({ gameSettings, gameStatus, isAIThinking, gameOver, onReset, onExit }) {
  return (
    <div style={s.wrap}>
      {/* Trái */}
      <div style={s.left}>
        <span style={s.title}>♟ Cờ vua</span>
        <span style={s.badge}>{DIFF_LABEL[gameSettings.difficulty]}</span>
      </div>

      {/* Giữa */}
      <div style={s.center}>
        {isAIThinking && (
          <span style={s.aiChip}>
            <span style={s.spinner} />
            AI đang suy nghĩ…
          </span>
        )}
        <span style={{ ...s.status, color: STATUS_COLOR[gameStatus.status] ?? '#444' }}>
          {gameStatus.message}
        </span>
      </div>

      {/* Phải */}
      <div style={s.right}>
        {gameOver && <button onClick={onReset} style={btn('#27ae60', '#fff')}>🔄 Ván mới</button>}
        <button onClick={onExit} style={btn('#f0f0f0', '#555')}>🏠 Về sảnh</button>
      </div>
    </div>
  );
}

function btn(bg, color) {
  return { padding: '8px 16px', borderRadius: '8px', border: 'none', background: bg, color, fontWeight: '600', fontSize: '13px', cursor: 'pointer' };
}

const s = {
  wrap: {
    width: '100%', maxWidth: '1060px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'rgba(255,255,255,0.75)',
    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    borderRadius: '12px', padding: '12px 20px',
    border: '0.5px solid rgba(255,255,255,0.6)', boxSizing: 'border-box',
  },
  left:   { display: 'flex', alignItems: 'center', gap: '12px' },
  center: { display: 'flex', alignItems: 'center', gap: '10px' },
  right:  { display: 'flex', gap: '8px' },
  title:  { fontSize: '20px', fontWeight: '600', color: '#1a1a2e', letterSpacing: '0.3px' },
  badge:  { background: 'rgba(26,26,46,0.08)', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: '#1a1a2e', fontWeight: '500' },
  aiChip: { display: 'flex', alignItems: 'center', gap: '6px', background: '#eeedfe', border: '0.5px solid #afa9ec', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: '#534ab7', fontWeight: '500' },
  spinner: { display: 'inline-block', width: '10px', height: '10px', border: '2px solid #afa9ec', borderTopColor: '#534ab7', borderRadius: '50%', animation: 'chessSpin 0.8s linear infinite' },
  status: { fontSize: '14px', fontWeight: '500' },
};