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

### 2026-10-17 13:35 (+07:00) · @Bero
- Phase: 0.1.1–0.1.4 Triển khai lại / AI tự kiểm tra
- Trạng thái: In review
- Đã làm: AI rà soát cấu hình NativeWind/Babel/Metro/Jest, SVG transformer và import global.css. Không cài lại thư viện đang đúng phiên bản.
- Test: Smoke biên dịch CSS thật và áp bg-mint xanh; type-check xanh; assembleDebug x86_64 thành công.
- PR / commit: Chưa tạo; kiểm tra trên working tree từ 5087fbf (main).
- Ghi chú: Đã xem lại ảnh native-foundation của lần 12:29; không ghi đó là ảnh mới trong lần triển khai lại. Codex thực hiện; handle dùng lại xác nhận trực tiếp đã ghi trong nhật ký trước, vì máy không có gh CLI.

### 2026-10-17 14:24 (+07:00) · @Bero
- Phase: Đồng bộ nghiệm thu sub-phase theo UAT 1–4a
- Trạng thái: Done
- Đã làm: Tick checklist nghiệm thu và đồng bộ bảng sub-phase theo xác nhận trực tiếp của owner về UAT bước 1–4a. NativeWind, Nunito, theme và i18n tương ứng phạm vi đã chấp nhận.
- Test: Chỉ cập nhật tài liệu, không đổi code; dùng bằng chứng test/native đã ghi trong nhật ký trước, không chạy lại test.
- PR / commit: Chưa tạo.
- Ghi chú: Done chỉ cho sub-phase này; Phase 0/0.99 chưa Done. Bằng chứng native/font của lần kiểm tra trước; không ghi đã xem lại màn kiểm tra tạm trên emulator, chưa chạy iOS trên Windows. Codex ghi nhận quyết định owner, không tự nghiệm thu thay owner.
