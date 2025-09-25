## [2.3.1] - 2025-09-25

### UI/UX
- Tools: chuyển sang giao diện tabs với hiệu ứng chuyển mượt, nổi bật tab active.
- DKHP Tool: bổ sung nút mở dkhp-uit.vercel.app bằng trình duyệt mặc định; nút Generate/Copy có animation ripple/pulse; card bố cục gọn và dễ thao tác.

---

## [2.3.0] - 2025-09-25

### Sửa lỗi / Cải tiến
- Thời khóa biểu: chỉ highlight đúng môn đang diễn ra trong cột của ngày hôm nay (khắc phục trường hợp tô nhầm cột/ngày, ví dụ T5 → cs431 thay vì T3 → cs231).
- Cập nhật ứng dụng: khi bấm “Khởi động lại để cập nhật”, ứng dụng sẽ đóng hoàn toàn (tắt cả chạy ngầm/Tray) rồi mới cài đặt, không cần tắt thủ công.
- Tools → Khảo sát tự động (đang test nhưng chưa có cơ hội test :D)

---

## [2.2.3] - 2025-09-24

### Enhancement
- Thêm 2 filter sắp xếp theo ngày giao: "Giao mới nhất" và "Giao cũ nhất"
- Cho phép người dùng thay đổi trạng thái bài tập nhóm (tick/untick) thay vì cố định
- Sắp xếp bài tập đã qua hạn và đã nộp xuống dưới cùng danh sách
- Undo việc click bài tập mở chi tiết để tránh xung đột với checkbox

---

## [2.2.2] - 2025-09-24

### Small Fix
- Sửa lỗi highlight thời khóa biểu: chỉ highlight môn học cụ thể đang diễn ra, không phải cả hàng tiết
- Sửa lỗi overlapping khi hover các môn học trong light mode
- Cải thiện hiển thị tiết cuối không bị che

---

## [2.2.1] - 2025-09-24

### Hotfix
- Chặn mở nhiều instance ứng dụng (single-instance lock). Nếu mở lại khi đang chạy nền, ứng dụng sẽ focus/hiện cửa sổ hiện có.

---

## [2.2.0] - 2025-09-24

### Mới/Thay đổi
- Chi tiết môn: thêm các vùng thu gọn/mở rộng (Bài tập, Thông báo, Tài liệu, Liên kết, Nội dung theo tuần/phần, Trang) kèm animation mượt.
- Stat cards cuộn đến đúng vùng (giữ tiêu đề hiển thị), tự mở vùng mục tiêu.
- Nút “Lên đầu trang” dạng icon tròn, nổi góc phải dưới, chỉ hiện khi cuộn.
- Di chuyển Dark/Light toggle vào phần Cài đặt.
- Quản lý bài tập: click vào card để mở chi tiết bài tập nhanh.

### Sửa lỗi
- Sửa lệch click 1 ngày trên lịch tháng; click đúng ngày mở đúng nội dung.
- Sửa đường kẻ TKB đè lên block môn ở dark mode; tăng z-index và mask.
- Ổn định hệ thống thông báo: chỉ thông báo bài tập mới trong phiên đang chạy; rút ngắn thời lượng toast.

---
# Changelog

Tất cả thay đổi đáng chú ý của dự án sẽ được ghi tại đây.

## [2.1.0] - 2025-09-24

### Mới/Thay đổi
- Tray & chạy nền: đóng cửa sổ sẽ ẩn xuống khay, click biểu tượng để mở lại.
- Thông báo tối giản: chỉ thông báo bài tập mới xuất hiện trong khi app đang chạy; không bắn lại lịch sử khi mở app.
- Thêm cài đặt "Thu nhỏ xuống khay khi đóng" và "Bỏ qua mục cũ quá (ngày)".
- Rút ngắn thời lượng thông báo: in-app toast ~3s; Windows toast 3s.
- Đồng hồ hệ thống trên header: hiển thị HH:MM • Th X, dd/mm/yyyy.
- Sửa hiển thị TKB dark mode: loại đường kẻ/hairlines.

### Sửa lỗi/Ổn định
- Tránh spam thông báo khi mở lại ứng dụng.

---

## [2.0.0] - 2025-09-24

### Thay đổi
- UI: Thay lịch tuần bằng lịch tháng có thứ, thêm legend (Khẩn cấp/Sắp tới/Đã nộp/Nhóm) và đếm số bài tập theo ngày; có điều hướng tháng trước/sau.
- UI: Gỡ bỏ hoàn toàn phần "Thao tác nhanh" và các modal liên quan (Quick Notes/Schedule) để giao diện gọn nhẹ hơn.

### Điểm nổi bật
- Module Thời khóa biểu (TKB) mới hoàn toàn: render bằng CSS Grid, hiển thị ngày theo hàng ngang, các môn học tự gộp nhiều tiết theo đúng chuỗi "Tiết" trong file .ics.
- Trải nghiệm trực quan: highlight tiết hiện tại và môn đang diễn ra theo thời gian thực.

### Tính năng mới / Thay đổi lớn
- Trích xuất thêm: Mã môn (`CODE.Qxx`), Giảng viên, Phòng học, dải tiết; lưu vào cấu trúc `timetableEvents`.
- UI card môn học trong TKB: Mã môn (đậm), Tên rút gọn, Phòng (đậm), Giảng viên; ẩn dòng Tiết nếu không cần thiết (có thể bật lại dễ dàng qua CSS).
- Lưu trữ cục bộ giảm thời gian load danh sách bài tập
- Cải tiến giao diện: bảng danh sách bài tập, chi tiết bài tập, chi tiết môn học
- Cải tiến UI dashboard (dù vẫn như hạch)
- Thêm hệ thống sắp đến dealine, hệ thống ghim bài tập, hệ thống ghi chú thông qua word
- Các thay đổi về UI/UX khác

### Ghi chú nâng cấp
- Người dùng bản 1.x nâng cấp thẳng lên 2.0.0: dữ liệu bài tập và token không bị ảnh hưởng.
- Nếu đã tùy chỉnh file `.ics` cũ: chỉ cần import lại để áp dụng parser mới (không bắt buộc).
---

## [1.2.0] - 2025-09-22

### Mới/Thay đổi
- Đưa action “Mở web/Quay lại” về header của trang chi tiết môn; bỏ khỏi header chung
- Bổ sung loading overlay khi:
  - Mở chi tiết môn học
  - Mở chi tiết bài tập
  - Mở đường dẫn ngoài (course/assignment)
- Tối ưu UI login: nhóm TLS toggle gọn đẹp
- Cập nhật hiển thị phiên bản trong Cài đặt lấy từ app (IPC)
- Đổi installer.
 - Nhận diện bài tập nhóm dựa trên cờ cấu hình từ API (teamsubmission) kèm heuristic fallback; thêm cơ chế cache bài tập theo user/course (bộ nhớ tạm + lưu trữ cục bộ) để tăng tốc tải và hiển thị lịch ngay khi mở app.

### Sửa lỗi
- Lỗi không hiển thị chi tiết do thiếu `ensureUrlWithToken`
- Một số luồng không mở được chi tiết course sau khi dọn UI

---

## [1.1.0] - 2025-09-22

### Điểm nổi bật
- Phát hành chính thức đầu tiên với cơ chế auto-update qua GitHub Releases
- Giao diện dark theme theo màu thương hiệu UIT, responsive
- Hệ thống thông báo thông minh (Windows Toast + in-app)

### Tính năng mới
- Đăng nhập bằng MSSV, lưu token mã hóa cục bộ
- Dashboard tổng quan: thống kê môn học, bài tập, cảnh báo sắp hạn
- Lọc bài tập theo học kỳ, môn học, trạng thái (đã nộp/chưa nộp/nộp muộn)
- Xem chi tiết bài tập, hạn chót, thời điểm nộp
- Lấy thông báo/thảo luận từ diễn đàn môn học (announcements)
- Quản lý nhiều tài khoản trên cùng máy

### Cải tiến
- README mới, cấu trúc chuyên nghiệp, hướng dẫn build/release rõ ràng
- Cấu hình `electron-builder` publish lên GitHub repo `HyIsNoob/uit-manager`
- Đồng bộ icon Windows khi đóng gói (sử dụng `favicon.ico`)

### Sửa lỗi/ổn định
- Khắc phục lỗi encoding cuối file README cũ
- Bổ sung kiểm tra lỗi/fallback khi gọi API Moodle

### Phụ thuộc/chứa năng kỹ thuật
- Electron 38.x, electron-builder 24.x
- Axios, electron-store, electron-updater
- Tự động kiểm tra cập nhật khi khởi động (`checkForUpdatesAndNotify`)

### Nâng cấp từ phiên bản cũ
- Nếu đang dùng 1.0.x: mở ứng dụng 1.0.x, hệ thống sẽ tự tải về 1.1.0 và đề xuất cài đặt khi thoát ứng dụng.

---

## [1.0.x] - Tiền phát hành (internal)
- Khung ứng dụng Electron, tích hợp cơ bản với Moodle API
- Các màn hình cơ bản và lưu trữ tài khoản cục bộ

---

Liên kết dự án: https://github.com/HyIsNoob/uit-manager
