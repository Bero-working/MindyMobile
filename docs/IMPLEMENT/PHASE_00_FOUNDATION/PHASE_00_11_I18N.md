# 0.11 i18n

## Mô tả
Thêm tiếng Việt làm ngôn ngữ mặc định.

## Hạ tầng / ADR
- File khoá bị sửa: `src/config/i18n.config.ts`.
- ADR: [ADR-0006](../../adr/ADR-0006-vietnamese-default.md).

## Task
### 0.11.1 `vi-VN.json` mặc định
- Kết quả mong đợi: `src/translations/vi-VN.json` có đủ key như `en-EN.json`; ngôn ngữ mặc định là `vi-VN` khi chưa
  chọn ngôn ngữ.
- Test cần viết trước: khởi tạo i18n không có ngôn ngữ đã lưu → ngôn ngữ hiện tại là `vi-VN`; tập key của `vi-VN.json`
  bằng tập key của `en-EN.json`.

### 0.11.2 Bỏ `bn-BN.json`
- Kết quả mong đợi: `bn-BN.json` của template bị xoá ở bước Dọn dẹp của Phase 0, cùng các chỗ đăng ký ngôn ngữ này.
- Test cần viết trước: test danh sách ngôn ngữ hỗ trợ chỉ còn `vi-VN`, `en-EN`.

## Tiêu chí nghiệm thu
- [ ] App mở lần đầu hiển thị tiếng Việt.
- [ ] Test key parity giữa các file ngôn ngữ xanh.
