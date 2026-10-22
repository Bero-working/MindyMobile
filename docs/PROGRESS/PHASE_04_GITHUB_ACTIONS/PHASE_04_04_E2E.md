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

### 2026-10-21 20:22 (+07:00) · @Bero-working (Codex)

- Task: 4.4.3 Lưu bằng chứng âm và dọn nhánh kiểm tra
- Trạng thái: In progress
- Đã làm: Lưu e2e-negative-report.xml và e2e-negative-jobs.json tại evidence/ từ run 39601188597, artifact 12347034442. Đóng PR #3 sau kiểm chứng, không merge. Đồng bộ c1371b5 vào nhánh kiểm tra, hoàn tác testID sai bằng commit 84adcb7 và push; nội dung cây nhánh kiểm tra bằng c1371b5. Worktree kiểm tra được lưu snapshot rồi archive sau khi hoàn tất.
- Ghi chú: Run chuẩn mới 39607209695 tại c1371b5 đang kiểm chứng hai sửa flow; không mở lại probe không thay đổi. Nhánh bàn giao không chứa testID sai hoặc workflow thử lỗi. Push nhánh kiểm tra sau khi đóng PR không thuộc bộ lọc push dev.

### 2026-10-21 21:35 (+07:00) · @Bero-working (Codex)

- Phase: 4.4 Điều chỉnh phạm vi theo owner, tiếp tục 4.5
- Trạng thái: In progress
- Yêu cầu owner: “Luồng thanh toán tôi chưa làm, hãy ignore phần đó”. Loại cart-checkout-qr khỏi bộ CI bắt buộc bằng tag payment-pending; giữ nguyên assertions/file để chạy riêng khi hoàn thiện. Không coi thanh toán đã đạt hoặc tiếp tục sửa luồng này.
- Triển khai: Bộ tag ci còn đúng 13 flow; config-ci.yaml cố định thứ tự và dừng khi lỗi, guard JUnit yêu cầu 13 testcase thành công trước hai job Release. Đồng bộ IMPLEMENT, hướng dẫn/UAT và tên bước workflow. Push/PR vẫn chỉ tự kích hoạt cho dev.
- Test: js-yaml/assert kiểm tra đúng 13 flow duy nhất, executionOrder khớp inventory, payment không thuộc ci và triggers dev PASS; actionlint 1.7.7, ShellCheck 0.10.0 và diff --check PASS. Không sửa app/native/dependency. Run c1371b5 trước đã có 13 flow còn lại đạt nhưng cả pipeline vẫn failure; cần run mới để xác nhận suite 13 và mở hai build.
- Dọn dẹp: Dừng Metro/AVD API35 do Phase 4 tạo; avdmanager xoá Mindy_CI_API35 và Mindy_CI_API35_D, sdkmanager gỡ riêng system image API35 vừa cài. Emulator Pixel_8 của owner vẫn chạy. Giữ thay đổi Phase 3/.gitignore/api-health của owner ngoài commit.
- Ghi chú: Chưa có kết quả Release/UAT; chuẩn bị push PR #2 để kiểm chứng hosted.

### 2026-10-22 06:47 (+07:00) · @Bero-working (Codex)

- Task: 4.4.1–4.4.3 Tự nghiệm thu E2E hosted
- Trạng thái: Done — AI tự nghiệm thu sub-phase; không thay UAT Phase 4.
- Run: https://github.com/Bero-working/MindyMobile/actions/runs/39618310147, PR head 5b3fe3ad06027a1f39ee160f44bf608c663204d8; checkout PR merge revision ad3d48c0a991d1985682f3497417d59d0ae8ebe5. E2E job 119285557001 success trên runner sạch, JUnit 13 testcase thành công, 0 failure/error/skipped, thời gian suite 944.866 giây. Báo cáo và snapshot job tại evidence/hosted-5b3fe3a/; audit 26 request bootstrap, 0 unexpected. Thanh toán payment-pending/API thật giữ ngoài phạm vi.
- Kiểm chứng âm: Run 39601188597 và evidence/e2e-negative-report.xml xác nhận testID cố ý sai làm job fail, artifact chẩn đoán có và hai Release bị chặn. Probe đã hoàn tác/PR #3 đóng; không đưa mã thử lỗi vào PR #2.
- Giới hạn: Pipeline 39618310147 còn lỗi Android Release dù iOS Simulator success; Phase 4/4.5 vẫn In progress. Bản sửa Android commit 4ff221a đang kiểm chứng tại run 39695570257.

### 2026-10-22 07:27 (+07:00) · @Bero-working (Codex)

- Task: 4.4.3 Mở lại sau lỗi thao tác course-class-scroll trên hosted
- Trạng thái: In progress. Entry tự nghiệm thu 4.4 trước vẫn phản ánh run 39618310147 đã đạt, nhưng run tiếp theo cho thấy flow chưa ổn định; không dùng lần pass cũ để bỏ qua lỗi mới.
- Run: https://github.com/Bero-working/MindyMobile/actions/runs/39695570257 tại 4ff221a. Ba quality job success; E2E đạt 5 flow đầu rồi course-class-scroll fail, suite dừng theo continueOnFailure=false. Hai Release skipped đúng needs; bước Codegen mới chưa được chạy nên chưa thể kết luận sửa Android Release đạt.
- Chẩn đoán: Log boot có adb offline tạm thời nhưng emulator sau đó boot_completed=1, cài APK/bundle đạt và chạy 5 flow. Lỗi cuối là không thấy course-sheet-pick-demo-0-a. Lệnh chạm courses-course-demo-0 tại (283,1671) báo COMPLETED; ảnh và hierarchy cuối chỉ có catalog, không có course-sheet. Flow đã cuộn catalog trong 20 giây vì chưa kiểm tra bảng mở. Chưa đủ bằng chứng để kết luận nguyên nhân sâu khiến lần chạm không mở bảng; không khẳng định do CPU/GPU hoặc sửa Release.
- Sửa theo đặc tả cập nhật trước: dùng nút mũi tên courses-open-demo-0 có sẵn, chờ animation và xác nhận course-sheet trong 10 giây trước cuộn lớp. Giữ toàn bộ assertions cũ, không retry/optional, không sửa app/native và không tăng timeout cuộn. Kiểm tra YAML và so sánh assertions PASS; đang chạy local để kiểm chứng, chưa ghi kết quả đạt.
- Bằng chứng: evidence/ci-course-open/report-before.xml, catalog-instead-of-sheet.png và commands-summary.json từ artifact 12392281119. Giữ sub-phase 4.4/4.5 và Phase 4 In progress, UAT Todo.

### 2026-10-22 07:31 (+07:00) · @Bero-working (Codex)

- Task: 4.4.3 Kiểm chứng sửa thao tác mở bảng khoá học
- Trạng thái: In progress — local đạt, chờ suite hosted.
- Test local: Maestro 2.11.0 trên Pixel_8/API37.2, viewport 1080×2400/density420, font 1.0, animation scales 1.0; app debug đã cài và Metro Node24.16.0. Flow sửa chạy ba lượt độc lập clearState, cả 3/3 PASS (111s, 40s, 42s), giữ tất cả assertions chức năng và thêm điều kiện bảng đã mở. JUnit tại evidence/ci-course-open/local-1.xml đến local-3.xml. Đây là kiểm chứng local flow thay đổi, không thay toàn bộ suite CI/API35 hoặc build Release.
- Kiểm tra: YAML inventory/executionOrder đúng 13 flow; so sánh assertion trước/sau không mất assertion; actionlint1.7.7/ShellCheck0.10.0 và diff --check PASS. Không retry flow lỗi, không optional/assertion suppression hoặc sửa app/native/dependency. Các ca âm cũ vẫn giữ; flow mới có thêm xác nhận course-sheet trước khi cuộn.
- Dọn dẹp: Bằng chứng chỉ giữ ảnh/report/tóm tắt, không thêm raw log hoặc binary vào repo. Commit chỉ phạm vi Phase4; giữ các thay đổi Phase3/.gitignore/api-health của owner. Sẽ push PR #2 chạy đủ quality/E2E và hai Release; chưa đủ điều kiện UAT.

### 2026-10-22 09:14 (+07:00) · @Bero-working (Codex)

- Task: 4.4.3 Tự nghiệm thu bản sửa course sheet trên hosted
- Trạng thái: Done — sub-phase 4.4; không thay UAT Phase 4.
- Run: https://github.com/Bero-working/MindyMobile/actions/runs/39700197090 tại head 6a887c588a63278924661c1c8580aa63c7b107ef, checkout merge 6ee3eda91cb2853ee3e2cd4bd2d039d1d9c0c95f. JUnit đủ 13/13 success, 0 failure/error/skipped, suite 1272.090s; course-class-scroll đạt 63.835s. Không retry, không bỏ assertions. Audit 26 bootstrap request, 0 unexpected. Snapshot/report tại evidence/hosted-6a887c5/.
- Kết quả: Cả 6 job cùng run đều success; hai Release chỉ bắt đầu sau E2E đạt. Bản sửa dùng nút mở khoá học và xác nhận sheet trước cuộn đã được kiểm chứng local 3 lượt và CI API35. Không suy ra nguyên nhân sâu của lần chạm card lỗi trước đó; giữ bằng chứng và diễn biến trung gian.
- Giới hạn: Thanh toán/API thật vẫn ngoài CI đã chốt; UAT owner chưa có. Đã dừng emulator/Metro local do lượt kiểm tra tạo.
