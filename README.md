# ♟️ Chess AI Game

## Giới thiệu

Chess AI Game là ứng dụng cờ vua được xây dựng bằng ReactJS, cho phép người chơi đấu với máy tính (AI) ở nhiều mức độ khó khác nhau.

Dự án hỗ trợ đầy đủ các luật cờ vua cơ bản và nâng cao như:

* Di chuyển quân theo luật chuẩn.
* Chiếu (Check).
* Chiếu bí (Checkmate).
* Hòa cờ (Stalemate).
* Nhập thành (Castling).
* Phong cấp Tốt (Pawn Promotion).
* Chơi với AI nhiều mức độ khó.

---

# Chức năng chính

## 1. Thiết lập trò chơi

Người chơi có thể:

* Chọn màu quân:

  * Trắng
  * Đen

* Chọn độ khó AI:

  * ⭐ Easy
  * ⭐⭐ Medium
  * ⭐⭐⭐ Hard

---

## 2. Luật cờ vua

Hệ thống hỗ trợ:

### Di chuyển quân

* Pawn
* Rook
* Knight
* Bishop
* Queen
* King

Theo đúng luật cờ vua quốc tế.

---

### Chiếu vua (Check)

Khi vua bị đối phương tấn công:

* Hiển thị cảnh báo.
* Chỉ cho phép thực hiện các nước đi hợp lệ để thoát chiếu.

---

### Chiếu bí (Checkmate)

Khi:

* Vua đang bị chiếu.
* Không còn nước đi hợp lệ.

Hệ thống kết thúc ván đấu và thông báo người chiến thắng.

---

### Hòa cờ (Stalemate)

Khi:

* Không bị chiếu.
* Không còn nước đi hợp lệ.

Trò chơi được tuyên bố hòa.

---

### Nhập thành (Castling)

Hỗ trợ:

* Nhập thành cánh vua (Kingside Castling)
* Nhập thành cánh hậu (Queenside Castling)

Điều kiện:

* Vua chưa di chuyển.
* Xe chưa di chuyển.
* Không có quân nằm giữa.
* Vua không bị chiếu.
* Vua không đi qua ô bị tấn công.

---

### Phong cấp Tốt (Pawn Promotion)

Khi Tốt đến hàng cuối:

Người chơi có thể lựa chọn:

* Hậu
* Xe
* Tượng
* Mã

AI sẽ tự động phong thành Hậu.

---

# Trí tuệ nhân tạo (AI)

## Easy

AI chọn ngẫu nhiên một nước đi hợp lệ.

---

## Medium

AI đánh giá các nước đi dựa trên:

* Giá trị quân cờ.
* Khả năng ăn quân đối phương.

Ưu tiên các nước đi có lợi về vật chất.

---

## Hard

AI sử dụng:

* Minimax Algorithm
* Alpha-Beta Pruning
* Piece-Square Table

Để:

* Dự đoán nhiều nước đi tương lai.
* Loại bỏ các nhánh không cần thiết.
* Đánh giá vị trí quân cờ.

---

# Hàm đánh giá bàn cờ

Giá trị quân cờ:

| Quân   | Điểm |
| ------ | ---- |
| Pawn   | 1    |
| Knight | 3    |
| Bishop | 3    |
| Rook   | 5    |
| Queen  | 9    |
| King   | 1000 |

Ngoài giá trị quân cờ, AI còn sử dụng:

* Piece Position Values
* Board Evaluation Function

để đánh giá chất lượng vị trí của từng quân trên bàn cờ.

---

# Công nghệ sử dụng

## Frontend

* ReactJS
* JavaScript (ES6)
* CSS3

## Thuật toán AI

* Minimax
* Alpha-Beta Pruning
* Heuristic Evaluation

---

# Cài đặt và chạy chương trình

## Clone project

```bash
git clone <repository-url>
```

## Cài đặt thư viện

```bash
npm install
```

## Chạy chương trình

```bash
npm run dev
```

Sau khi chạy:

```text
http://localhost:5173
```

---

# Kết quả đạt được

* Xây dựng thành công trò chơi cờ vua hoàn chỉnh.
* Áp dụng các thuật toán AI vào việc ra quyết định.
* Hỗ trợ đầy đủ các luật cờ vua cơ bản và nâng cao.
* Giao diện trực quan, dễ sử dụng.
* Có thể mở rộng để phát triển AI mạnh hơn trong tương lai.

---

# Hướng phát triển

* Thêm En Passant.
* Thêm Threefold Repetition.
* Thêm Fifty-Move Rule.
* Lưu lịch sử trận đấu.
* Chế độ PvP Online.
* Kết nối Firebase.
* Huấn luyện AI bằng Machine Learning/Reinforcement Learning.
* Tích hợp Stockfish để so sánh sức mạnh AI.

---

# Tài liệu tham khảo

1. FIDE Chess Rules.
2. Chess Programming Wiki.
3. React Documentation.
4. Minimax Algorithm.
5. Alpha-Beta Pruning Algorithm.
6. Piece-Square Tables.
