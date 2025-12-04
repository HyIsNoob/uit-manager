# Hướng dẫn Release Version 3.0.0

## Chuẩn bị

1. **Kiểm tra version trong `package.json`**
   - Đã được cập nhật lên `3.0.0` ✅

2. **Kiểm tra CHANGELOG.md**
   - Đã thêm entry cho version 3.0.0 ✅

3. **Kiểm tra GitHub Token**
   - Cần có GitHub Personal Access Token với quyền `repo`
   - Token cần được set trong environment variable `GH_TOKEN` hoặc `.env`

## Các bước Release

### Bước 1: Commit và Push code

```powershell
git add .
git commit -m "chore: bump version to 3.0.0"
git push origin main
```

### Bước 2: Tạo Git Tag

```powershell
git tag -a v3.0.0 -m "Release version 3.0.0"
git push origin v3.0.0
```

### Bước 3: Build và Publish

**Option 1: Build và publish tự động lên GitHub Releases**

```powershell
npm run release
```

Lệnh này sẽ:
- Build ứng dụng cho Windows (và các platform khác nếu cấu hình)
- Tự động tạo GitHub Release với tag v3.0.0
- Upload các file installer lên GitHub Releases
- Kích hoạt auto-update cho người dùng

**Option 2: Build local trước, publish sau**

```powershell
# Build local
npm run dist

# Sau đó publish thủ công
npm run release
```

### Bước 4: Kiểm tra GitHub Releases

1. Vào https://github.com/HyIsNoob/uit-manager/releases
2. Kiểm tra release v3.0.0 đã được tạo
3. Kiểm tra các file đã được upload:
   - `UIT-Assignment-Manager-Setup-3.0.0.exe` (Windows installer)
   - `latest.yml` (update metadata)
   - Các file khác nếu có

### Bước 5: Test Auto Update

1. Mở ứng dụng version cũ (2.4.1)
2. Ứng dụng sẽ tự động kiểm tra update khi khởi động
3. Hoặc vào Settings → Kiểm tra cập nhật
4. Nếu có update, sẽ hiện thông báo và tải về
5. Sau khi tải xong, sẽ có nút "Khởi động lại để cập nhật"

## Cấu hình Auto Update

Auto update đã được cấu hình sẵn trong:

- **`package.json`**: 
  ```json
  "publish": [{
    "provider": "github",
    "owner": "HyIsNoob",
    "repo": "uit-manager"
  }]
  ```

- **`src/main.js`**: 
  - Tự động kiểm tra update khi khởi động: `autoUpdater.checkForUpdatesAndNotify()`
  - IPC handlers: `check-for-updates`, `quit-and-install`

## Lưu ý

1. **GitHub Token**: 
   - Nếu chưa có, tạo tại: https://github.com/settings/tokens
   - Cần quyền `repo` (full control of private repositories)
   - Set environment variable: `$env:GH_TOKEN="your_token_here"` (PowerShell)

2. **Version Numbering**:
   - Phải tuân theo Semantic Versioning (MAJOR.MINOR.PATCH)
   - Version trong `package.json` phải khớp với Git tag

3. **Release Notes**:
   - GitHub Release sẽ tự động lấy từ CHANGELOG.md
   - Hoặc có thể chỉnh sửa trên GitHub sau khi tạo release

4. **Rollback**:
   - Nếu có lỗi, có thể xóa release và tag trên GitHub
   - Người dùng sẽ không nhận được update nếu release bị xóa

## Troubleshooting

**Lỗi: "GitHub token not found"**
- Kiểm tra `GH_TOKEN` environment variable
- Hoặc tạo file `.env` với `GH_TOKEN=your_token`

**Lỗi: "Repository not found"**
- Kiểm tra `owner` và `repo` trong `package.json` đúng chưa
- Kiểm tra token có quyền truy cập repo không

**Lỗi: "Version already exists"**
- Xóa tag cũ: `git tag -d v3.0.0` và `git push origin :refs/tags/v3.0.0`
- Hoặc tăng version lên 3.0.1

**Auto update không hoạt động**:
- Kiểm tra file `latest.yml` đã được tạo trong release chưa
- Kiểm tra version trong `package.json` có khớp với release tag không
- Kiểm tra console log trong ứng dụng để xem lỗi chi tiết

