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

## ✨ Tính Năng

- **Đăng nhập bằng MSSV**: Bind token vào MSSV cho lần đầu tiên, tài khoản được lưu trữ để đăng nhập nhanh hon!
> lưu ý: tick Bỏ qua kiểm tra chứng chỉ TLS nếu không đăng nhập được
- **Lưu trữ an toàn**: Token được mã hóa và lưu cục bộ bằng Electron Store
- **Quản lý nhiều tài khoản**: Dễ dàng chuyển đổi người dùng
- **Dashboard**: Thống kê, cảnh báo bài tập sắp hạn, lịch có thể tương tác.
- **Quản Lý Bài Tập**: Hệ thống lọc đa dạng, loading và lưu trữ cục bộ trong session để giảm thời gian load.
- **Chi tiết Bài Tập**: Đã nộp, chưa nộp, nộp muộn, hạn chót, thời điểm nộp, ghi chú
- **Quản Lý Môn Học**: Danh sách môn học theo học kỳ
- **Chi tiết Môn Học**: Danh sách bài tập, thông báo, file, liên kết, ghi chú
- **Thời Khóa Biểu**: Import từ file .ics, hiển thị dynamic theo giờ và thứ realtime.
- **Hệ Thống Ghi Chú**: Tự tạo và quản lý file word theo từng môn, từng bài tập, thêm xóa sửa.
- **Settings**: Nhiều option settings tùy nhu cầu (mở cùng windows, chạy ngầm, thông báo, dark/light mode)

> Demo hình ảnh các tính năng ở dưới

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

## Demo Chi Tiết Tính Năng

- **Đăng nhập bằng MSSV**: Bind token vào MSSV cho lần đầu tiên, tài khoản được lưu trữ để đăng nhập nhanh hon!
<img width="1919" height="935" alt="image" src="https://github.com/user-attachments/assets/9aefbfaf-8d82-4952-bc7a-f16f49292f9e" />
*lưu ý: tick Bỏ qua kiểm tra chứng chỉ TLS nếu không đăng nhập được*
- **Lưu trữ an toàn**: Token được mã hóa và lưu cục bộ bằng Electron Store
- **Quản lý nhiều tài khoản**: Dễ dàng chuyển đổi người dùng
<img width="1918" height="936" alt="image" src="https://github.com/user-attachments/assets/f332640b-f716-42e3-8121-55ec4156c245" />
- **Dashboard**: Thống kê, cảnh báo bài tập sắp hạn, lịch có thể tương tác.
<img width="1919" height="948" alt="image" src="https://github.com/user-attachments/assets/0b1d8829-f5a7-45f2-b869-58a6de0548c8" />
- **Quản Lý Bài Tập**: Hệ thống lọc đa dạng, loading và lưu trữ cục bộ trong session để giảm thời gian load.
<img width="1910" height="942" alt="image" src="https://github.com/user-attachments/assets/5376aa77-f5fe-4c1e-aabe-a702db9176ff" />
- **Chi tiết Bài Tập**: Đã nộp, chưa nộp, nộp muộn, hạn chót, thời điểm nộp, ghi chú
<img width="1918" height="946" alt="image" src="https://github.com/user-attachments/assets/11378963-82dc-4c01-9f1b-ce09fe032173" />
- **Quản Lý Môn Học**: Danh sách môn học theo học kỳ
<img width="1908" height="946" alt="image" src="https://github.com/user-attachments/assets/67f8742c-aa40-44ef-9a97-b8769e881cef" />
- **Chi tiết Môn Học**: Danh sách bài tập, thông báo, file, liên kết, ghi chú
<img width="1915" height="943" alt="image" src="https://github.com/user-attachments/assets/820ab59e-2d78-42f8-9ce9-e31da8244c9e" />
- **Thời Khóa Biểu**: Import từ file .ics, hiển thị dynamic theo giờ và thứ realtime.
<img width="1919" height="939" alt="image" src="https://github.com/user-attachments/assets/d6a3d293-19fb-4f35-913d-d80b5a193e9b" />
- **Hệ Thống Ghi Chú**: Tự tạo và quản lý file word theo từng môn, từng bài tập, thêm xóa sửa.
<img width="1919" height="1005" alt="image" src="https://github.com/user-attachments/assets/9c36f51a-7239-481b-bfc8-3bb3b694e882" />

## 🔗 Liên kết

- Mã nguồn: `https://github.com/HyIsNoob/uit-manager`
- Moodle UIT: `https://courses.uit.edu.vn`

---
