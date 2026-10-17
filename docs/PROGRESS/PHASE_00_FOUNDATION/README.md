# Progress Phase 00: Foundation

Nhật ký cấp phase của [Phase 0](../../IMPLEMENT/PHASE_00_FOUNDATION/README.md): đổi trạng thái phase, Dọn dẹp, Kiểm tra, Nghiệm thu. Chỉ thêm entry vào cuối file theo [ENTRY.md](../_template/ENTRY.md).

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0 In progress
- Trạng thái: In progress
- Đã làm: Bắt đầu triển khai 11 sub-phase; handle Bero được người dùng xác nhận. Không có metadata .git; không thể tính diff so main hay tạo PR/commit trong workspace này.
- Test: Xem kết quả chi tiết trong từng sub-phase; chưa có nghiệm thu native/E2E.
- PR / commit: Chưa có.
- Ghi chú: Codex thực hiện; owner nghiệm thu theo B.5, chưa bắt đầu phase màn hình.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0 Dọn dẹp
- Trạng thái: In progress
- Đã làm: Bỏ token MMKV, logger cũ, bn-BN và import liên quan; chỉ chỉnh type/guard tối thiểu để bật lint mới. Dọn asset link không phải font; giữ giấy phép Nunito. appConfig.ts chỉ format lỗi đã có. Không tự thêm UI kit chưa có spec.
- Test: Xem kết quả chi tiết trong từng sub-phase; chưa có nghiệm thu native/E2E.
- PR / commit: Chưa có.
- Ghi chú: Codex thực hiện; owner nghiệm thu theo B.5, chưa bắt đầu phase màn hình.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0 Kiểm tra
- Trạng thái: Blocked
- Đã làm: Unit/integration, lint, format, type-check đã chạy; Metro production Android bundle thành công. Native assembleDebug lỗi CLI15 không nhận BaseReactPackage/react-native-config; cần ADR-0016. E2E chưa chạy do thiếu Maestro; lệnh khởi động emulator kèm cài CLI bị automatic review chặn: blocked by policy.
- Test: Xem kết quả chi tiết trong từng sub-phase; chưa có nghiệm thu native/E2E.
- PR / commit: Chưa có.
- Ghi chú: Codex thực hiện; owner nghiệm thu theo B.5, chưa bắt đầu phase màn hình.

### 2026-10-17 12:05 (+07:00) · @Bero
- Phase: 0 Blocked
- Trạng thái: Blocked
- Đã làm: Chờ owner duyệt ADR-0015/0016; chờ backend chốt APP_ORIGIN/CORS_ORIGINS; chưa có Login route; chưa kiểm tra màu/font/UUID và flow trên Android. Không tự đánh dấu Done hoặc bật UI CODEOWNERS.
- Test: Xem kết quả chi tiết trong từng sub-phase; chưa có nghiệm thu native/E2E.
- PR / commit: Chưa có.
- Ghi chú: Codex thực hiện; owner nghiệm thu theo B.5, chưa bắt đầu phase màn hình.

### 2026-10-17 12:07 (+07:00) · @Bero
- Phase: 0 Kiểm tra — kết quả cuối phiên
- Trạng thái: Blocked
- Đã làm: Hoàn tất phần code có ADR Accepted; cập nhật ARCHITECTURE/guide/CLAUDE và bảng trạng thái; không bật UI CODEOWNERS. Giữ giao diện mặc định sáng, bỏ thao tác chuyển dark của màn template.
- Test: npm run lint:rules ✓ (0 cảnh báo sau khi bỏ qua coverage) · npm run lint:code-format ✓ · npm run lint:type-check ✓ · npm test -- --runInBand --silent ✓ (12 suite, 35 test).
- Test bổ sung: Metro bundle Android production ✓; PostScript name 4 font và byte asset Android khớp ✓; UIAppFonts iOS đủ 4 tên ✓. Coverage nhóm hạ tầng mới đo riêng: 89,31% dòng; utilities mới 96,77%; HTTP 84%; QueryClient/theme 100%.
- Native/E2E: assembleDebug chưa thành công do CLI15/react-native-config; test:e2e đã gọi nhưng không tìm thấy Maestro. Automatic review chặn thao tác khởi động emulator kèm cài Maestro với lý do “blocked by policy”. Chưa kiểm tra màu/font trên thiết bị, chưa build iOS.
- PR / commit: Không có, workspace không chứa .git.
- Ghi chú: Chờ duyệt ADR-0015 và ADR-0016, xác nhận APP_ORIGIN/CORS từ backend và màn Login cho điều hướng hết phiên. Hai câu hỏi duyệt ADR đang chờ phản hồi; không cài UUID hoặc nâng CLI khi chưa được duyệt. Coverage trên không phải coverage toàn bộ boilerplate.

### 2026-10-17 12:17 (+07:00) · @Bero
- Phase: 0 Tiếp tục triển khai sau duyệt ADR
- Trạng thái: In progress
- Đã làm: Owner duyệt ADR-0015 và ADR-0016 trực tiếp trong chat. Đã cập nhật Accepted trước khi cài; UUID v11 + polyfill v1.11 và CLI major 19 đã cài.
- Test: Red UUID fail vì chưa có module, Green UUID v4 + key khác nhau xanh; MSW retry giữ nguyên key và body xanh. CLI config nhận được cả RNCConfigPackage và RNGetRandomValuesPackage.
- PR / commit: Chưa có.
- Ghi chú: Polyfill v2 yêu cầu RN >=0.81 nên chọn v1.11 tương thích RN0.80. Maestro2.11 cài riêng từ archive chính thức đã kiểm tra SHA256; emulator khởi động riêng headless thành công, không lặp lại lệnh gộp đã bị chặn. Build Android đang chạy.

### 2026-10-17 12:29 (+07:00) · @Bero
- Phase: 0 Kiểm tra và bàn giao sau duyệt ADR-0015/0016
- Trạng thái: Blocked
- Đã làm: Hai ADR đã Accepted và triển khai xong; CLI19.1.2 autolinking đúng RNCConfig/RNG. UUID11.1.1 + polyfill1.11 chạy trên Hermes. Native smoke tạm đã xoá, index.js được khôi phục nguyên bản với polyfill import đầu; kiểm tra app chính riêng.
- Test: lint:rules ✓ · lint:code-format ✓ · lint:type-check ✓ · npm test -- --runInBand --silent ✓ (13 suite, 37 test). Metro production Android bundle ✓. Gradle assembleDebug -PreactNativeArchitectures=x86_64 --max-workers=2 ✓ (BUILD SUCCESSFUL, 543 task). APK cài và chạy trên emulator-5554 API37 ✓. Maestro app-launch ✓ (1/1, 19s).
- Kiểm tra hình ảnh/runtime: RGB mint chính xác (51,138,133,255); bốn Nunito weight và dấu tiếng Việt đúng; hermes=true, uuidV4=true, distinct=true; app chính mở mặc định tiếng Việt.
- Bằng chứng: [Native foundation](evidence/2026-10-17-native-foundation.png), [app chính](evidence/2026-10-17-main-app.png), [kết quả runtime](evidence/2026-10-17-native-foundation.json).
- PR / commit: Không có; workspace không có metadata .git.
- Ghi chú: Còn 0.4.4 chờ backend APP_ORIGIN/CORS_ORIGINS và đích Login cho 0.4.3 (hiện clear cache/reset auth đã có test). Chưa nghiệm thu phase, không tự đánh dấu Done/bật UI CODEOWNERS. Android đã kiểm tra debug x86_64, chưa build release đa ABI hoặc iOS. SDK/NDK/CMake thiếu đã được Gradle cài từ nguồn Android trong lần build đầu.
