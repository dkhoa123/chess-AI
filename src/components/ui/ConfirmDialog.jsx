export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={s.overlay}>
      <div style={s.box}>
        <p style={s.msg}>{message}</p>
        <div style={s.btns}>
          <button onClick={onConfirm} style={btn('#e74c3c', '#fff')}>Xác nhận</button>
          <button onClick={onCancel}  style={btn('#f0f0f0', '#555')}>Hủy</button>
        </div>
      </div>
    </div>
  );
}

function btn(bg, color) {
  return { padding: '9px 22px', borderRadius: '8px', border: 'none', background: bg, color, fontWeight: '600', fontSize: '14px', cursor: 'pointer' };
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  box:     { background: '#fff', borderRadius: '14px', padding: '28px 32px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', minWidth: '300px' },
  msg:     { fontSize: '15px', marginBottom: '24px', lineHeight: 1.6, color: '#333', whiteSpace: 'pre-line' },
  btns:    { display: 'flex', gap: '10px', justifyContent: 'center' },
};