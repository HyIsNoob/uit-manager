<div align="center">
  <img src="assets/uit_logo.png" alt="UIT Logo" width="96" />

  <h1>UIT Assignment Manager</h1>
  <p>Quản lý bài tập thông minh cho sinh viên UIT — xây dựng với Electron, tích hợp Moodle API.</p>

  <p>
    <a href="https://github.com/HyIsNoob/uit-manager"><img alt="Repo" src="https://img.shields.io/badge/GitHub-uit--manager-000?logo=github" /></a>
    <img alt="Version" src="https://img.shields.io/badge/version-2.0.0-blue" />
    <img alt="License" src="https://img.shields.io/badge/license-MIT-green" />
    <img alt="Electron" src="https://img.shields.io/badge/Electron-38.x-47848F?logo=electron" />
  </p>
</div>

---

## ✨ Điểm nổi bật

- **Đăng nhập bằng MSSV**: Không phải nhập token nhiều lần
- **Lưu trữ an toàn**: Token được mã hóa và lưu cục bộ bằng Electron Store
- **Quản lý nhiều tài khoản**: Dễ dàng chuyển đổi người dùng
- **Dashboard trực quan**: Thống kê, cảnh báo bài tập sắp hạn, làm mới dữ liệu
- **Lọc thông minh**: Theo học kỳ, môn học, trạng thái nộp
- **Trạng thái chi tiết**: Đã nộp, chưa nộp, nộp muộn, hạn chót, thời điểm nộp

## 🖥️ Giao diện & Trải nghiệm

- Dark theme theo màu trường UIT (UIT Blue `#1e3a8a`, Accent Cyan `#06b6d4`)
- Hiệu ứng mượt mà: loading, transition, hover
- Responsive cho nhiều độ phân giải màn hình

## 📦 Tải xuống

- Tự build bằng npm run dist
- Hoặc theo dõi mục Releases trên repo.

> Lưu ý: Ứng dụng hỗ trợ Windows 10/11. macOS/Linux có thể build từ source.

## 🔧 Cài đặt từ mã nguồn

### Yêu cầu

- Node.js 16+ (khuyến nghị 18+)
- Git

### Bắt đầu

```bash
git clone https://github.com/HyIsNoob/uit-manager.git
cd uit-manager
npm install

# Chạy dev
npm start

# Build sản phẩm (đầu ra tại thư mục dist/)
npm run build
```

Các script có sẵn (trích từ `package.json`):

```bash
npm start     # Chạy Electron app
npm run dev   # Chạy Electron ở chế độ dev
npm run build # Đóng gói theo cấu hình electron-builder
npm run dist  # Đóng gói, không publish
npm run release # Đóng gói và publish lên GitHub (nếu cấu hình)
```

## 🚪 Hướng dẫn sử dụng nhanh

1. Mở ứng dụng → chờ màn hình loading
2. Đăng ký tài khoản lần đầu:
   - Nhập MSSV
   - Nhập token API Moodle (xem cách lấy bên dưới)
   - Bấm “Đăng ký tài khoản”
3. Đăng nhập bằng MSSV đã lưu
4. Xem danh sách môn học, bài tập; theo dõi deadline và trạng thái nộp

### Lấy token API Moodle

1. Đăng nhập `https://courses.uit.edu.vn`
2. Vào **Tài khoản** → **Tùy Chọn** → **Khóa bảo mật**
3. Tạo token cho dịch vụ “Moodle mobile web service” (Tái lập)
4. Sao chép token và dán vào ứng dụng

## 🧩 Kiến trúc & Công nghệ

- Electron (Desktop framework)
- Renderer: HTML5, CSS3, JavaScript (ES6+)
- Dữ liệu cục bộ: Electron Store
- HTTP client: Axios
- Cập nhật ứng dụng: electron-updater
- Tích hợp: Moodle REST API

Các endpoint Moodle sử dụng:

- `core_webservice_get_site_info`
- `core_course_get_categories`
- `core_enrol_get_users_courses`
- `mod_assign_get_assignments`
- `mod_assign_get_submission_status`

## 🔐 Bảo mật

- Token được mã hóa và lưu trữ cục bộ
- Tất cả request sử dụng HTTPS
- Không gửi dữ liệu người dùng lên máy chủ bên thứ ba

## ❓ Câu hỏi thường gặp (FAQ)

- Không thấy bài tập sau khi đăng nhập?
  - Kiểm tra token còn hạn và có quyền “Moodle mobile web service”
  - Bấm làm mới dữ liệu hoặc đăng nhập lại
- Lỗi cài đặt trên Windows?
  - Tải đúng phiên bản `.exe` phù hợp và đóng các phiên bản đang chạy trước khi cài

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón!

1. Fork repo
2. Tạo nhánh tính năng: `feat/ten-tinh-nang`
3. Commit theo chuẩn ngắn gọn, rõ ràng
4. Tạo Pull Request mô tả thay đổi

## 📄 Giấy phép

Phát hành dưới giấy phép MIT.

## 🔗 Liên kết

- Mã nguồn: `https://github.com/HyIsNoob/uit-manager`
- Moodle UIT: `https://courses.uit.edu.vn`

---

UIT Assignment Manager — trợ thủ đắc lực quản lý bài tập cho sinh viên UIT 🎓✨
