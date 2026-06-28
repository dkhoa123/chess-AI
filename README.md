# ♟️ Chess AI Game

## Giới thiệu

Chess AI Game là ứng dụng cờ vua được xây dựng bằng ReactJS + Vite, cho phép người chơi đấu với máy tính (AI) ở nhiều mức độ khó khác nhau.

Dự án hỗ trợ **đầy đủ các luật cờ vua** cả cơ bản và nâng cao, kết hợp với **AI thông minh sử dụng các thuật toán tiên tiến**.

---

## ✨ Tính Năng Chính

### 🎮 Thiết Lập Trò Chơi

- **Chọn màu quân**: Trắng hoặc Đen
- **Chọn độ khó AI**: 
  - ⭐ Easy (random move)
  - ⭐⭐ Medium (material evaluation)
  - ⭐⭐⭐ Hard (advanced algorithms)

---

### ♛ Các Luật Cờ Vua

#### Di Chuyển Quân

Hỗ trợ đầy đủ di chuyển chuẩn cho tất cả quân:
- **Pawn (Tốt)**: 1 ô, 2 ô từ vị trí ban đầu, bắt chéo
- **Rook (Xe)**: Hàng, cột không giới hạn
- **Knight (Mã)**: Hình chữ L (2+1 hoặc 1+2)
- **Bishop (Tượng)**: Đường chéo không giới hạn
- **Queen (Hậu)**: Hàng, cột, đường chéo không giới hạn
- **King (Vua)**: 1 ô theo mọi hướng

#### 🔔 Chiếu (Check) & Chiếu Bí (Checkmate)

- Phát hiện khi vua bị tấn công
- Chỉ cho phép nước đi hợp lệ thoát chiếu
- Kết thúc trò chơi khi bị chiếu bí

#### 🏳️ Hòa Cờ (Stalemate)

Trò chơi kết thúc hòa khi:
- Quân không bị chiếu nhưng **không có nước đi hợp lệ**

#### ♛↔️ Nhập Thành (Castling)

- **Kingside Castling**: Vua đi qua 2 ô sang phải, Xe về canh vua
- **Queenside Castling**: Vua đi qua 2 ô sang trái, Xe về canh vua

Điều kiện:
- Vua chưa di chuyển
- Xe chưa di chuyển
- Không có quân nằm giữa
- Vua không bị chiếu, không đi qua ô bị tấn công

#### 🐴 Bắt Tốt Qua Đường (En Passant)

- Khi tốt đối phương vừa đi 2 ô
- Tốt của bạn ở cột bên cạnh hàng thích hợp
- Có thể bắt tốt đó trên ô đó đi qua

#### 👑 Phong Cấp Tốt (Pawn Promotion)

Khi tốt đến hàng cuối, người chơi có thể chọn phong thành:
- Hậu (Queen) ⭐ được lựa chọn
- Xe (Rook)
- Tượng (Bishop)
- Mã (Knight)

AI tự động phong thành Hậu.

#### 🎲 Thiếu Vật Liệu (Insufficient Material)

Hòa cờ tự động nếu bên nào cũng không có khả năng chiếu bí:
- Vua vs Vua
- Vua + Mã vs Vua
- Vua + Tượng vs Vua
- Vua + Tượng vs Vua + Tượng (cùng màu ô)

#### ↩️ Luật 50 Nước (Fifty-Move Rule)

Hòa cộng khi **50 nước đầy đủ** (100 nửa-nước) không có:
- Bắt quân
- Đi tốt

#### 🔄 Lặp Lại Vị Trí 3 Lần (Threefold Repetition)

Hòa tự động khi cùng vị trí bàn cờ lặp lại **3 lần**.

---

## 🤖 Trí Tuệ Nhân Tạo (AI)

### Easy Mode - Random Selection
AI chọn ngẫu nhiên một nước đi hợp lệ.

---

### Medium Mode - Material Evaluation

AI đánh giá dựa trên:
- **Giá trị quân cờ** (Pawn=1, Knight=3, Bishop=3, Rook=5, Queen=9)
- **Khả năng ăn quân** đối phương
- **Vị trí quân trên bàn cờ** (Piece-Square Tables)

Ưu tiên nước đi có lợi về vật chất.

---

### Hard Mode - Advanced Engine

#### Thuật Toán Chính:
1. **Alpha-Beta Pruning** (cải tiến từ Minimax)
   - Cắt tỉa nhánh không cần thiết
   - Tăng độ sâu tìm kiếm gấp 4-6 lần

2. **Iterative Deepening**
   - Tìm kiếm sâu dần (depth 1, 2, 3...)
   - Sử dụng kết quả lần trước để tối ưu move ordering

3. **Transposition Table** (Bộ nhớ cache)
   - Lưu các vị trí bàn cờ đã đánh giá
   - Tránh tính toán lặp lại

4. **Move Ordering**
   - Thứ tự ưu tiên nước đi:
     - Những nước đi từ Transposition Table
     - Killer Moves (nước đi gây cắt tỉa)
     - Nước bắt quân
     - Nước di chuyển bình thường
   - Cắt tỉa beta sớm hơn

5. **Killer Moves Heuristic**
   - Ghi nhớ nước đi gây beta cutoff
   - Thử nước tương tự ở nhánh khác

6. **History Heuristic**
   - Ghi nhớ nước đi yên tĩnh có kết quả tốt
   - Ưu tiên nước tương tự ở tìm kiếm kế tiếp

7. **Quiescence Search**
   - Tìm kiếm sâu hơn khi bàn cờ "không yên tĩnh"
   - Tránh horizon effect

8. **Opening Book**
   - Database các nước đi mở trò chơi cổ điển
   - Những mở cửa nổi tiếng:
     - Ruy Lopez (1. e4 e5 2. Nf3 Nc6 3. Bb5)
     - Italian Game (1. e4 e5 2. Nf3 Nc6 3. Bc4)
     - Queen's Gambit (1. d4 d5 2. c4)
     - Sicilian Defense (1. e4 c5)
     - French Defense (1. e4 e6)
     - Caro-Kann (1. e4 c6)

---

### Hàm Đánh Giá Bàn Cờ (Evaluation)

| Quân | Điểm |
|------|------|
| Pawn | 1 |
| Knight | 3 |
| Bishop | 3 |
| Rook | 5 |
| Queen | 9 |
| King | ∞ (1000) |

**Ngoài giá trị quân cờ**, AI còn xem xét:
- **Piece Position Values**: Vị trí tối ưu của từng quân
- **Board Evaluation Function**: Toàn bộ cấu hình bàn cờ
- **Pawn Structure**: Cấu trúc pion
- **King Safety**: An toàn của vua
- **Piece Activity**: Hoạt động của quân

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **ReactJS 19.2.6**
- **Vite** (build tool, phát triển nhanh)
- **JavaScript ES6+**
- **CSS3**

### Chess Engine
- **Alpha-Beta Pruning**
- **Iterative Deepening**
- **Transposition Table**
- **Killer Moves & History Heuristic**
- **Quiescence Search**
- **Opening Book**
- **Piece-Square Tables**

---

## 📦 Cài Đặt & Chạy Chương Trình

### Clone Repository
```bash
git clone https://github.com/dkhoa123/chess-AI.git
cd chess-AI
```

### Cài Đặt Dependencies
```bash
npm install
```

### Chạy Development Server
```bash
npm run dev
```

Truy cập: **http://localhost:5173**

### Build cho Production
```bash
npm run build
```

### Lint Code
```bash
npm run lint
```

---

## 📁 Cấu Trúc Dự Án

```
src/
├── components/
│   ├── Board/              # Hiển thị bàn cờ
│   │   ├── Board.jsx
│   │   ├── board.js
│   │   └── board.css
│   ├── ai/                 # AI Engine
│   │   ├── AI.js           # Lựa chọn độ khó
│   │   ├── AlphabetaPrunding.js    # Alpha-Beta + Iterative Deepening
│   │   ├── MinimaxAI.js    # Minimax cơ bản
│   │   ├── MaterialAI.js   # Medium AI
│   │   ├── EvaluateBoard.js        # Hàm đánh giá
│   │   ├── TranspositionTable.js   # Cache bàn cờ
│   │   ├── MoveOrdering.js         # Sắp xếp thứ tự nước đi
│   │   ├── QuiescenceSearch.js     # Tìm kiếm yên tĩnh
│   │   ├── OpeningBook.js          # Sách mở trò chơi
│   │   └── aiMoveHelpers.js
│   ├── gameLogic/          # Logic cờ vua
│   │   ├── movement.js     # Di chuyển quân + en passant
│   │   ├── check.js        # Kiểm tra chiếu
│   │   ├── castling.js     # Nhập thành
│   │   ├── gameStatus.js   # Trạng thái game (checkmate, draw, etc)
│   │   ├── turn.js         # Quản lý lượt chơi
│   │   ├── moveHistory.js  # Lịch sử nước đi
│   │   └── PromotionModal.jsx      # Modal phong cấp
│   ├── gameSetup/          # Thiết lập trò chơi
│   ├── hooks/              # Custom React hooks
│   └── ui/                 # UI components
├── data/
│   ├── Piecevalue.js       # Giá trị quân cờ
│   └── PiecePositionValue.js       # Bảng vị trí quân
└── App.jsx

```

---

## 🎯 Kết Quả Đạt Được

✅ Xây dựng engine cờ vua hoàn chỉnh với đầy đủ luật tài chính quốc tế

✅ AI thông minh với 3 độ khó rõ rệt:
  - Easy: Phù hợp với người mới
  - Medium: Thách thức vừa phải
  - Hard: Sử dụng các thuật toán tiên tiến

✅ Hỗ trợ **tất cả các luật cơ bản & nâng cao**:
  - Checkmate, Stalemate, Castling, En Passant, Pawn Promotion
  - Insufficient Material, Fifty-Move Rule, Threefold Repetition

✅ Giao diện trực quan, dễ sử dụng

✅ Performance tốt nhờ các tối ưu hóa AI

✅ Code modular, dễ bảo trì & mở rộng

---

## 🚀 Hướng Phát Triển

- [ ] **Opening Book** mở rộng (thêm các khai mở hiện đại)
- [ ] **Endgame Tablebase** (cơ sở dữ liệu kết cuối)
- [ ] **Zobrist Hashing** (hashing nhanh hơn cho Transposition Table)
- [ ] **Web Worker** (tính toán AI không chặn UI)
- [ ] **Lưu & load game** (persist trận đấu)
- [ ] **PvP Online** (chơi với người khác)
- [ ] **Replay & Analysis** (phân tích trận đấu)
- [ ] **Integrate Stockfish** (so sánh với engine huyền thoại)
- [ ] **Machine Learning** (huấn luyện AI với dữ liệu)
- [ ] **Mobile App** (React Native)

---

## 📚 Tài Liệu Tham Khảo

1. [FIDE Chess Rules](https://www.fide.com/FIDE/handbook.html)
2. [Chess Programming Wiki](https://www.chessprogramming.org/)
3. [React Documentation](https://react.dev)
4. [Minimax Algorithm](https://www.chessprogramming.org/Minimax)
5. [Alpha-Beta Pruning](https://www.chessprogramming.org/Alpha-Beta)
6. [Piece-Square Tables](https://www.chessprogramming.org/Piece-Square-Tables)
7. [Transposition Table](https://www.chessprogramming.org/Transposition-Table)
8. [Move Ordering](https://www.chessprogramming.org/Move-Ordering)
9. [Killer Heuristic](https://www.chessprogramming.org/Killer-Move)
10. [Quiescence Search](https://www.chessprogramming.org/Quiescence-Search)