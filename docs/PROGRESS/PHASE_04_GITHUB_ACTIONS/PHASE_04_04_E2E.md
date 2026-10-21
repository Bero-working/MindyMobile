# Tiến độ 4.4 — E2E Android

Nhật ký triển khai chỉ ghi thêm theo ENTRY.md. Chưa bắt đầu; task và tiêu chí tại [IMPLEMENT 4.4](../../IMPLEMENT/PHASE_04_GITHUB_ACTIONS/PHASE_04_04_E2E.md).

### 2026-10-21 15:21 (+07:00) · @Bero-working (Codex)

- Trạng thái: In progress — triển khai xong phần mã, kiểm chứng hosted còn chờ.
- Đã làm / kiểm tra: 4.4.1: Phân loại15flow:14tag ci đúng danh sách spec, api-health tag backend; không thay assertions. Đối chiếu CLI2.11.0 --help và TestCommand upstream cho tags/JUnit/debug/test-output.
- PR / commit: Sẽ bổ sung khi tạo PR nháp.

### 2026-10-21 15:21 (+07:00) · @Bero-working (Codex)

- Trạng thái: In progress — triển khai xong phần mã, kiểm chứng hosted còn chờ.
- Đã làm / kiểm tra: 4.4.2: Helper chuẩn bị env riêng, Android SDK35/NDK27.1.12297006, keystore debug tạm, debug x86_64, KVM/AVD35 RAM4096M; Metro readiness180s, emulator300s, trap cleanup. Maestro zip pin2.11.0 và SHA256. Không sửa native/Metro.
- PR / commit: Sẽ bổ sung khi tạo PR nháp.

### 2026-10-21 15:21 (+07:00) · @Bero-working (Codex)

- Trạng thái: In progress — triển khai xong phần mã, kiểm chứng hosted còn chờ.
- Đã làm / kiểm tra: 4.4.3: Workflow kiểm tra JUnit đủ14case không skipped/failure; sanitise diagnostics. Đang chạy14flow trên emulator5554 với APK/Metro có sẵn, không coi là clean-runner build hay API thật. Kết quả cuối sẽ ghi entry riêng.
- PR / commit: Sẽ bổ sung khi tạo PR nháp.

### 2026-10-21 15:58 (+07:00) · @Bero-working (Codex)

- Task: 4.4.1–4.4.3 — đính chính phụ thuộc bootstrap
- Trạng thái: In progress
- Đã làm: Các flow ci cần phản hồi khách của bootstrap trước preview. Dùng fixtureloopback chỉ whitelist GET /auth/me và POST /auth/refresh trả401 theo contract; mọi API khác fail qua audit. Fixture không tạo user/session, không sửa app hoặc bỏ assertions. Rà native debug manifest đã cho cleartextHTTP; giữ nguyên file native.
- Test: Fixture readiness/401/refresh/500/audit realHTTP PASS; APK debug x86_64 trên runner sạch a1639e4 build thành công; chưa kết luận E2E hosted vì URL cũ chưa có fixture. Chạy lại revision nhúng URL mới.

### 2026-10-21 19:42 (+07:00) · @Bero-working (Codex)

- Task: 4.4.2 Chốt animation scale và xác minh nguyên nhân LogBox
- Trạng thái: In progress
- Đã làm: Run 39580163195 trước sửa có 6/14 flow đạt, 8/14 lỗi; logcat và ảnh chứng minh cảnh báo Reduced Motion che nút. Giữ animation scale 1.0 trong helper và disable-animations=false trong action; không sửa app/native/assertions. PR #2 chuyển đích dev; run mới 39600990649 tại afea99e đã qua TypeScript, ESLint/Prettier và 63 suite/294 test; đang build APK.
- Test local: Emulator Pixel_8/API37, Maestro 2.11.0, APK/Metro có sẵn. Probe transition scale=0 chờ Welcome rồi thấy cảnh báo PASS (28s); probe scale=1.0 chờ Welcome rồi không có cảnh báo PASS (22s). Hai báo cáo tại evidence/ci-reduced-motion/local-warning.xml và local-normal.xml; setting được khôi phục. Probe đầu chờ app-root thay vì Welcome chạy quá sớm trên màn bootstrap nên không thấy cảnh báo; không dùng làm bằng chứng phủ định nguyên nhân. Không thay các flow nghiệm thu.
- Kiểm tra: actionlint 1.7.7 với ShellCheck 0.10.0 PASS; ShellCheck toàn bộ helper bash PASS; 13 file Markdown cấp phase không có liên kết tệp thiếu. Chưa kết luận E2E/build hosted mới đạt.
- Kiểm chứng âm: Đồng bộ baseline afea99e vào worktree riêng, commit 084e159 chỉ khác testID app-launch cố ý sai. PR #3 đích dev, run 39601188597 đang chạy. Không đưa probe vào nhánh bàn giao.

### 2026-10-21 20:20 (+07:00) · @Bero-working (Codex)

- Task: 4.4.3 Đồng bộ thao tác pagination/toast với Maestro
- Trạng thái: In progress
- Hosted: Run 39600990649 tại afea99e đạt 12/14 flow, không còn lỗi do LogBox; report tại evidence/ci-interactions/report-before.xml. courses-browse kẹt centerElement=true ở phần tử cuối ScrollView, cart-checkout-qr chờ settle 12285ms nên bỏ lỡ toast 2500ms. Cả hai Release skipped đúng needs.
- Sửa và test: Tắt yêu cầu center nhưng giữ visibilityPercentage=100. Lượt local đầu payment PASS 56s, courses thất bại ở bước sau: accessibility tree coi pagination bị tab bar che là visible. Thêm swipe trong vùng danh sách 50%,70% → 50%,40% và assertVisible nút trước tap; courses chạy lại PASS 70s (report 71s tính tổng). Report local-initial.xml giữ cả lỗi trung gian và payment PASS; local-pagination.xml ghi bản sửa cuối đạt. Không bỏ 5 assertion cũ của courses hoặc 6 assertion payment; courses thêm 1 assertion. Không sửa app, toast duration hoặc timeout assertion.
- Kiểm tra âm hosted: Run 39601188597 xác nhận app-launch fail đúng `phase04-intentional-missing-control`, giữ diagnostics và chặn hai Release. Còn hai lỗi thao tác giống bản chuẩn ở baseline đó; không mô tả run âm này là chỉ có một lỗi. Mã app và app-launch bản chuẩn không đổi trong sửa hai flow, nên bằng chứng missing-testID vẫn áp dụng; không cần chạy lại probe không thay đổi.
- Nguồn đối chiếu thao tác: https://docs.maestro.dev/reference/commands-available/scrolluntilvisible và https://docs.maestro.dev/reference/commands-available/tapon. YAML parser, kiểm tra giữ assertions và diff --check PASS. Đẩy bản sửa để kiểm chứng đủ 14 flow hosted; 4.4/4.5 chưa đạt.
