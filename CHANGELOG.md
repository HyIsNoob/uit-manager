# Changelog

Tất cả thay đổi đáng chú ý của dự án sẽ được ghi tại đây.

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
