# Tiến độ 4.2 — ESLint và định dạng

Nhật ký triển khai chỉ ghi thêm theo ENTRY.md. Chưa bắt đầu; task và tiêu chí tại [IMPLEMENT 4.2](../../IMPLEMENT/PHASE_04_GITHUB_ACTIONS/PHASE_04_02_LINTING.md).

### 2026-10-21 15:21 (+07:00) · @Bero-working (Codex)

- Trạng thái: In progress — triển khai xong phần mã, kiểm chứng hosted còn chờ.
- Đã làm / kiểm tra: 4.2.1: Owner duyệt “Duyệt ADR-0031” trong chat. Rà src/tests/__tests__ không có import nguồn thiết kế. ESLint trước sửa có626 lỗi trong image-slot.js(15) và support.js(611); sau ngoại lệ hẹp exit0,0errors/1warning URL trong ClassDetailScreen.test.tsx. Asset gốc giữ nguyên; cập nhật ARCHITECTURE và ADR.
- PR / commit: Sẽ bổ sung khi tạo PR nháp.

### 2026-10-21 15:21 (+07:00) · @Bero-working (Codex)

- Trạng thái: In progress — triển khai xong phần mã, kiểm chứng hosted còn chờ.
- Đã làm / kiểm tra: 4.2.2: Job ESLint and formatting chạy hai script gốc. Probe biến không dùng fail exit1; probe sai format fail exit1; đã xoá probe. Prettier toàn phạm vi PASS; không --fix trên CI.
- PR / commit: Sẽ bổ sung khi tạo PR nháp.
