# Progress 0.1 NativeWind

Nhật ký thực hiện task của [0.1 NativeWind](../../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_01_NATIVEWIND.md). Chỉ thêm entry vào cuối file theo [ENTRY.md](../_template/ENTRY.md), không sửa entry cũ.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.1.1
- Trạng thái: In review
- Đã làm: Cài NativeWind v4, cva, clsx, tailwind-merge v2 và Tailwind v3/Prettier plugin.
- Test: Type-check trước cấu hình fail vì View chưa có className; smoke test ban đầu chỉ render chưa chứng minh style, đã thay bằng test CSS thật.
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.1.2
- Trạng thái: In review
- Đã làm: Tạo global.css, Tailwind token/font mapping, nativewind-env.d.ts; include tests/types.
- Test: Đối chiếu token màu và type-check xanh.
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.1.3
- Trạng thái: In review
- Đã làm: Nối NativeWind Babel/Metro/entry, giữ SVG transformer và Reanimated plugin cuối.
- Test: Metro bundle Android production thành công, copy 20 asset.
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0.1.4
- Trạng thái: In review
- Đã làm: Jest transform NativeWind/css-interop; smoke test biên dịch CSS của dự án và áp màu mint thật lên View.
- Test: NativeWind smoke xanh; màu thực tế rgba(51, 138, 133, 1).
- PR / commit: Chưa có; workspace không có metadata .git.
- Ghi chú: Codex triển khai theo yêu cầu owner; handle Bero được người dùng xác nhận trực tiếp.

### 2026-10-17 12:29 (+07:00) · @Bero
- Phase: 0.1 Kiểm tra Android
- Trạng thái: In review
- Đã làm: View bg-mint hiển thị trên Android, pixel screenshot đúng RGB(51,138,133).
- Test: Native smoke trên Hermes xanh; Metro production bundle xanh.
- PR / commit: Chưa có, workspace không có .git.
- Ghi chú: Entry tạm đã khôi phục, source kiểm tra tạm đã xoá. Bằng chứng trong evidence/2026-10-17-native-foundation.png, evidence/2026-10-17-main-app.png và JSON cùng tên.
