const FILES_W = ['a','b','c','d','e','f','g','h'];
const FILES_B = ['h','g','f','e','d','c','b','a'];
const RANKS_W = [8,7,6,5,4,3,2,1];
const RANKS_B = [1,2,3,4,5,6,7,8];

const COORD = { fontSize: '11px', color: 'rgba(26,26,46,0.45)', fontWeight: '500' };

export default function BoardWithCoords({ playerIsWhite, children }) {
  const ranks = playerIsWhite ? RANKS_W : RANKS_B;
  const files = playerIsWhite ? FILES_W : FILES_B;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'flex' }}>
        {/* Số hàng */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '20px', height: '640px' }}>
          {ranks.map(n => (
            <div key={n} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', ...COORD }}>{n}</div>
          ))}
        </div>
        {/* Bàn cờ */}
        {children}
      </div>
      {/* Chữ cột */}
      <div style={{ display: 'flex', marginLeft: '20px', width: '640px' }}>
        {files.map(l => (
          <div key={l} style={{ flex: 1, textAlign: 'center', ...COORD }}>{l}</div>
        ))}
      </div>
    </div>
  );
}