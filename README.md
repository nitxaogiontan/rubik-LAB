# RUBIK LAB — CFOP + Finger Trick Edition

Một website học Rubik 3×3 chạy trực tiếp trên trình duyệt. Bản này giữ cấu trúc và tính năng của dự án ban đầu, đồng thời bổ sung hướng dẫn finger-trick, chia nhịp công thức, mẹo theo case và một số biến thể thuật toán có ghi rõ ưu / nhược điểm.

## Mở nhanh

1. Tải và giải nén file ZIP.
2. Mở thư mục `rubik-lab-upgraded` bằng Visual Studio Code hoặc trình quản lý file.
3. Mở `index.html` bằng Chrome / Edge.
4. Nếu muốn chạy ổn định như một local site, mở thư mục bằng VS Code Live Server.

Không cần Node.js, npm install, framework hay thư viện 3D bên ngoài. Google Fonts là tùy chọn; nếu mất mạng, website vẫn dùng font hệ thống.

## Có gì trong bản này?

- 41 F2L, 57 OLL, 21 PLL — tổng 119 case.
- 7 bước Beginner Method.
- Bộ 2-look OLL / PLL để bắt đầu trước khi học full CFOP.
- Mô hình cube 3D đủ 6 mặt, kéo để xoay và chọn góc nhìn U / D / F / B / L / R.
- Move-by-move: bấm từng move để xem cube thay đổi theo thuật toán.
- Formula breakdown: chia công thức thành các block nhỏ để luyện từng nhịp. Đây là block luyện tập, không có nghĩa mỗi block là một thuật toán độc lập.
- Finger-trick coach: gợi ý ngón cho move kế tiếp và mẹo theo từng case. Finger trick là gợi ý khởi đầu; grip phù hợp có thể khác tùy bàn tay và cube.
- Formula variants: Ua / Ub có lựa chọn M-slice ít move hơn; OLL 21 được chia thành ba block để dễ học theo nhịp. Bản chuẩn vẫn là mặc định.
- Timer, flashcard, bộ lọc, tìm kiếm cả biến thể, chế độ bảng và lưu tiến độ trong localStorage.
- Preview cube trên thẻ được dựng khi gần cuộn tới, giúp trang đỡ phải tính cả 119 mô hình cùng lúc lúc mới mở.

## Các file

- `index.html` — cấu trúc trang, nội dung học và modal case.
- `styles.css` — giao diện responsive.
- `data.js` — 119 case, 2-look, Beginner Method và các biến thể công thức.
- `cube.js` — mô phỏng sticker, parser thuật toán và bộ dựng cube 3D.
- `app.js` — tìm kiếm, modal, finger-trick coach, move player, timer, flashcard và tiến độ.

## Quy ước cube

- U: vàng; D: trắng; F: xanh lá; B: xanh dương; R: đỏ; L: cam.
- F2L: cross trắng ở D, vàng ở U, slot mục tiêu trước-phải (FR).
- OLL / PLL: vàng ở U, hai tầng dưới đã giải.
- Các sơ đồ case được tạo bằng cách áp dụng nghịch đảo của thuật toán lên cube đã giải; move player chạy thuật toán để đưa trạng thái đó trở lại solved. Khi đổi sang một biến thể, mô hình được dựng lại từ chính biến thể đang chọn.

## Về các biến thể công thức

Không phải thuật toán ít move hơn cũng dễ finger-trick hơn. Vì vậy, mỗi biến thể đều ghi rõ trade-off: Ra / Rb tránh D để giữ grip R/U/F; Ua / Ub ngắn hơn nhưng cần flick M; Z tránh M-slice nhưng dài hơn. Không tự động đổi công thức mặc định của 119 case.

## Tiến độ học

Danh sách case đã đánh dấu thuộc được lưu trong trình duyệt hiện tại bằng `localStorage` với key `rubikLabProLearned`. Dữ liệu không được gửi lên server. Xóa dữ liệu website trong trình duyệt có thể làm mất tiến độ.

## Nguồn tham khảo thuật toán / finger trick

- Speedcubing.org — [Full PLL](https://speedcubing.org/pages/full-pll) và [4-look last layer](https://speedcubing.org/pages/4-look-last-layer-tutorial).
- Cubeathon — [2-look OLL / PLL](https://www.cubeathon.com/algorithms/2-look).
- Finger-trick introduction — [Finger Tricks](https://amitse.github.io/learn/rubiks-cube/lessons/0010-finger-tricks.html).

Các nguồn này dùng để đối chiếu công thức / kỹ thuật tham khảo; lựa chọn ngón là gợi ý tập luyện, không phải cách duy nhất.
