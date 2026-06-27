import { useEffect, useRef } from 'react';

export default function MoveHistoryPanel({ history, onUndo, onExitToLobby, onReset, canUndo, gameOver }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Group into pairs [white, black]
  const pairs = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push({ white: history[i], black: history[i + 1] ?? null });
  }

  return (
    <div style={s.panel}>
      {/* Header */}
      <div style={s.header}>
        <span style={s.headerIcon}>📋</span>
        <span style={s.headerTitle}>Lịch sử nước đi</span>
        <span style={s.moveCount}>{history.length} nước</span>
      </div>

      {/* Table */}
      <div style={s.tableWrap}>
        {pairs.length === 0 ? (
          <div style={s.empty}>Chưa có nước đi nào</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={{ ...s.th, width: '28px' }}>#</th>
                <th style={s.th}>⚪ Trắng</th>
                <th style={s.th}>⚫ Đen</th>
              </tr>
            </thead>
            <tbody>
              {pairs.map((pair, i) => (
                <tr key={i} style={i % 2 === 0 ? s.rowA : s.rowB}>
                  <td style={s.tdNum}>{i + 1}</td>
                  <td style={s.td}>{pair.white}</td>
                  <td style={{ ...s.td, color: '#888' }}>{pair.black ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Actions */}
      <div style={s.actions}>
        <button
          style={{ ...s.btn, ...s.undoBtn, opacity: canUndo ? 1 : 0.35, cursor: canUndo ? 'pointer' : 'not-allowed' }}
          onClick={onUndo}
          disabled={!canUndo}
          title="Hoàn tác nước vừa đi (+ nước AI)"
        >
          ↩ Hoàn tác
        </button>
        {gameOver && (
          <button style={{ ...s.btn, ...s.resetBtn }} onClick={onReset}>
            🔄 Ván mới
          </button>
        )}
        <button style={{ ...s.btn, ...s.exitBtn }} onClick={onExitToLobby}>
          🏠 Về sảnh
        </button>
      </div>
    </div>
  );
}

const s = {
  panel: {
    width: '210px',
    background: '#fff',
    borderRadius: '12px',
    border: '0.5px solid rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    // Match board height: 640px board + 4px gap + 20px coords row
    maxHeight: '668px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '12px 14px',
    borderBottom: '0.5px solid rgba(0,0,0,0.08)',
    background: '#fafaf9',
  },
  headerIcon: { fontSize: '14px' },
  headerTitle: { fontSize: '13px', fontWeight: '600', color: '#1a1a2e', flex: 1 },
  moveCount: {
    fontSize: '11px', color: '#999', fontWeight: '500',
    background: '#f0f0f0', borderRadius: '10px', padding: '2px 8px',
  },
  tableWrap: {
    flex: 1,
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: '#ddd #fafaf9',
  },
  empty: {
    padding: '32px 16px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#bbb',
    fontStyle: 'italic',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
  },
  thead: {
    position: 'sticky', top: 0, background: '#fafaf9', zIndex: 1,
  },
  th: {
    padding: '7px 8px',
    textAlign: 'center',
    fontSize: '11px',
    color: '#aaa',
    fontWeight: '500',
    borderBottom: '0.5px solid rgba(0,0,0,0.08)',
  },
  rowA: { background: '#fff' },
  rowB: { background: '#fafaf9' },
  tdNum: {
    padding: '6px 4px 6px 10px',
    fontSize: '11px', color: '#ccc', textAlign: 'center',
  },
  td: {
    padding: '6px 8px',
    textAlign: 'center',
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#333',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '10px',
    borderTop: '0.5px solid rgba(0,0,0,0.08)',
    background: '#fafaf9',
  },
  btn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '9px 12px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'opacity 0.15s',
  },
  undoBtn: {
    background: '#fff3e8',
    color: '#b85a1a',
    border: '0.5px solid #f0a06a',
  },
  resetBtn: {
    background: '#eaf3de',
    color: '#3b6d11',
    border: '0.5px solid #7db853',
    cursor: 'pointer',
  },
  exitBtn: {
    background: '#f5f5f5',
    color: '#555',
    border: '0.5px solid #ddd',
    cursor: 'pointer',
  },
};