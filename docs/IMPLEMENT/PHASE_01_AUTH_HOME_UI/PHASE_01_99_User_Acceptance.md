# 1.99 User Acceptance — Auth và Homepage UI

- Người nghiệm thu: **@Bero**.
- Trạng thái: **Done** — owner duyệt UAT Phase 1 trong chat ngày 2026-10-17: “Nghiệm thu UAT phase được approve”, sau đó xác nhận “phase 1”.
- Phạm vi: UI native Welcome/Login/Register/Check email và Student Home **bản 2**, cùng luồng nghiệp vụ sau khi gắn API trong Phase1.
- Quy trình: [ADR-0017](../../adr/ADR-0017-ai-self-review-owner-uat.md); chỉ owner xác nhận UAT đạt. Thứ tự các mốc theo [ADR-0021](../../adr/ADR-0021-per-phase-ui-approval-api-uat.md).

## Điều kiện bắt đầu

Ghi nhận sau nghiệm thu: owner đã xác nhận UAT Phase 1 đạt. Các checkbox và ca kiểm thử dưới đây giữ mức
bằng chứng đã ghi nhận, không tự đánh dấu các ca chưa chạy là đạt. Xem entry nghiệm thu ngày 2026-10-17
trong [PROGRESS cấp phase](../../PROGRESS/PHASE_01_AUTH_HOME_UI/README.md).

Cập nhật owner ngày 2026-10-20: phiên đăng nhập/refresh được xác nhận Done; đăng ký/gửi lại email đã test
thành công; TalkBack OK. Đây là kết quả do owner xác nhận, không phải lượt kiểm thử mới của AI.
Theo yêu cầu mới cùng ngày, Admin/Mentor/Manager đăng nhập từ form nhận lỗi “Email hoặc mật khẩu không đúng.”
trong khối lỗi Login như ảnh owner cung cấp; không chuyển sang màn riêng có nút Đăng xuất.
Owner đã duyệt phản hồi mới bằng xác nhận “Được duyệt” trong chat ngày 2026-10-20 15:04 (+07:00).

- [x] Nguồn Claude Auth/Home2a, bản trích và asset đã được bàn giao; phiên bản ghi trong IMPLEMENT1.1.
- [x] Phụ thuộc Foundation/navigator/shared UI có ngoại lệ ADR-0018 Accepted; không coi Foundation đã nghiệm thu.
- [x] Owner đã xác nhận UI trong chat: “UI phase 1 đã được approve”, ngày2026-10-17; xem PROGRESS cấp phase.
- [x] Task API của Phase1 đã được đặc tả, tích hợp theo contract và kiểm thử với backend.
- [x] Phụ thuộc Foundation/auth có ngoại lệ ADR-0022 Accepted đúng phạm vi; không đóng Foundation/UAT.
- [ ] Sau tích hợp đã Dọn dẹp/Kiểm tra đạt; phase và bước1.99 chuyển In review, ghi rõ chờ UAT.
- [x] Đã chạy UI trên APK debug Android qua Metro; hướng dẫn preview/fixture và kết quả kiểm thử đã có.
- [x] [Tổng hợp PROGRESS](../../PROGRESS/PHASE_01_AUTH_HOME_UI/README.md) có bằng chứng AI và giới hạn kiểm thử.

## Owner kiểm tra

Bảng dưới là kiểm tra UI đã có. Trước khi chuyển bước1.99 sang In review, phải bổ sung các ca nghiệp vụ/API
theo task tích hợp của Phase1 và liên kết bằng chứng backend; chỉ chạy bảng fixture này không đủ đạt UAT.

| Bước | Thao tác                                                                    | Kết quả mong đợi                                                                                           |
| ---- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1    | Mở Claude Auth và Student Home bản 2 cạnh app                               | Nhận diện, asset, thứ bậc CTA và thứ tự section đúng nguồn; sai khác được ghi rõ                           |
| 2    | Mở Welcome; bấm Tạo tài khoản/Đăng nhập và Back                             | Đúng màn, mascot rõ, không có viền điện thoại/status bar giả, không có Google hoạt động giả                |
| 3    | Nhập Login sai/rỗng, toggle password; thử password 1 và 128 ký tự           | Validation đúng contract, field lỗi dễ thấy, toggle giữ nội dung, dữ liệu hợp lệ gọi callback              |
| 4    | Chuyển Login sang pending/INVALID_CREDENTIALS/422/mất mạng bằng fixture     | Không gửi lặp, lỗi dễ hiểu, giữ dữ liệu, không tiết lộ email có tồn tại                                    |
| 5    | Nhập Register với tên trắng, password 5/6 ký tự, confirm lệch, phone rỗng   | Hiện lỗi đúng; password 6 hợp lệ, phone rỗng được bỏ khỏi payload; không gửi role/status/confirmPassword   |
| 6    | Mô phỏng register 202, resend pending/success/error và register 503         | Luôn Kiểm tra email, không tự login/Home, gửi lại có phản hồi riêng, không nhận deep link giả              |
| 7    | Mở Home bản 2 với success/loading/empty/error, ảnh null/lỗi và nội dung dài | Đúng layout, fallback đầy đủ, retry đúng vùng, không hiển thị số liệu fixture như dữ liệu thật             |
| 8    | Thử CTA, refresh, 3 slide giới thiệu, 3 ghi chú và 5 tab                    | Callback/ID đúng, Home ở giữa; màn chưa có ẩn/disabled với giải thích; không thêm tải tiếp/search từ bản 1 |
| 9    | Mở bàn phím, tăng cỡ chữ, bật đọc màn hình và Reduce Motion                 | Không che field/CTA, cuộn được, label đúng, vùng chạm ít nhất 44×44, motion phù hợp                        |
| 10   | Xem kết quả lint/type-check/Jest/Maestro, ảnh và giới hạn                   | Tất cả kiểm tra bắt buộc có bằng chứng; không coi UI fixture là xác thực cookie/backend thật               |

## Bằng chứng AI

UI đã được triển khai; bằng chứng hiện có là kiểm tra bước UI, chưa phải bằng chứng gắn API hoặc UAT.
Mapping/task API đã có trong [1.6](PHASE_01_06_API_INTEGRATION.md); ADR-0022 đã Accepted. Auth/Home production đã được nối; bằng chứng native/backend đang được bổ sung trước bàn giao UAT.
Các bước fixture bên dưới bảng dùng để đối chiếu UI; khi UAT cuối phase phải kiểm tra thêm Login theo role,
Register/resend và dữ liệu Home với API thật theo phạm vi task đã được đặc tả, kể cả lỗi/quyền và phiên.
Cách mở, fixture, ranh giới production và lệnh kiểm tra có trong
[hướng dẫn preview](../../PROGRESS/PHASE_01_AUTH_HOME_UI/PREVIEW.md). Kết quả và bằng chứng cuối cùng nằm trong
[PROGRESS](../../PROGRESS/PHASE_01_AUTH_HOME_UI/README.md) và thư mục `evidence/` cùng cấp.
Android kiểm tra trên Pixel_8_2, API 37, 1080×2400, density 420; JS/asset chạy qua Metro trên APK debug Foundation đã cài.
Không đổi native config/dependency nên không build native lại. iOS/release binary chưa chạy trong môi trường Windows.

Khác biệt cần owner xem khi UAT: ảnh học viên chưa dùng vì quyền sử dụng chưa được xác nhận, course/mentor/project
chưa có ảnh thật; không tự tạo hình thay thế. Font lớn được ưu tiên đọc đủ nội dung và vùng chạm so với kích thước
mockup. Màn production đã nối adapter backend; nghiệm thu UI qua preview không thay bằng chứng cookie/backend thật.

## Ca nghiệp vụ/API phải nghiệm thu

| Ca | Thao tác với tài khoản/dữ liệu test được cấp | Kết quả cần xác nhận |
| --- | --- | --- |
| API1 | Login Student ACTIVE, tắt/mở lại app | Home hiện tên/dữ liệu thật; auth/me phục hồi phiên bằng cookie, không chớp dữ liệu cũ |
| API2 | Đăng xuất ở cuối Home, bấm Android Back và mở lại app | Không quay lại Home/dữ liệu riêng; Login sau logout và Welcome ở lần khởi động guest mới |
| API3 | Login Admin/Mentor/Manager; bootstrap chậm hoặc lỗi mạng | Login giữ nguyên form và hiện “Email hoặc mật khẩu không đúng.”, không nhận phiên staff hoặc gọi lịch Student; pending/error có thử lại, không giả guest khi lỗi mạng |
| API4 | Register/resend trên email test được phép gửi thư | 202 trung lập, màn kiểm tra email; không tạo phiên, không gửi lặp tự động, lỗi gửi lại riêng |
| API5 | Lịch nhiều trang, buổi huỷ/past/in-progress, FULL/CASH_PREVIEW | Chọn buổi SCHEDULED sắp tới theo asOf/timeZone máy chủ; không có buổi trong7ngày thì rỗng, không thay fixture |
| API6 | Catalog lỗi/lịch thành công và ngược lại; pull refresh/retry | Hai vùng độc lập, retry đúng vùng, không gọi API featured hoặc mở màn chưa triển khai |
| API7 | Access cookie hết hạn còn refresh hợp lệ; sau đó refresh hết hạn/thu hồi | Refresh một lần/single-flight; thành công tiếp tục phiên, thất bại clear cache và reset Login, Back không mở Home |

Không gửi register/resend thật khi chưa có phạm vi email test phù hợp. Chưa có bằng chứng native của một ca thì ghi rõ chưa kiểm tra; không dùng MSW để thay xác nhận backend.

## Ghi nhận kết quả owner

Kết quả thực tế ghi **thêm** vào `PROGRESS/PHASE_01_AUTH_HOME_UI/README.md` theo template nhật ký, gồm thời gian
+07:00, GitHub handle, môi trường/build, bước đạt/chưa đạt và xác nhận của owner. UAT UI không đóng các blocker
Foundation hoặc xác nhận auth/backend nếu chưa có bằng chứng kiểm thử tương ứng.

Bản đối chiếu sau bàn giao D1–D4: xem mục “Bàn giao sau chỉnh thiết kế” ở PROGRESS. Lượt này bổ sung kiểm tra320dp và sửa vùng chạm theo số đo native. Báo cáo review nêu bốn sai khác nhỏ để owner xem khi UAT.

## Đồng bộ checklist (2026-10-22)

Đối chiếu bằng chứng đã ghi, không chạy lại test trong lượt đồng bộ này. Xem [bảng đối chiếu và giới hạn](../../PROGRESS/ACCEPTANCE_SYNC_2026-10-22.md) và [PROGRESS liên quan](../../PROGRESS/PHASE_01_AUTH_HOME_UI/README.md). Trạng thái Done của phase giữ theo UAT owner đã có; checkbox chỉ phản ánh phạm vi kiểm chứng, không tự thay xác nhận owner.

Kiểm tra chất lượng hiện tại có thêm CI Phase 4 run 39700197090: 63 suites/294 tests và 13 flow CI đạt; iOS là build Simulator. Đây là bằng chứng bổ sung ngày 2026-10-22, không thay số liệu/môi trường của các lượt lịch sử và không chứng minh API/thanh toán thật.

- Tiêu chí checkbox thứ 6: **Chưa đủ hồ sơ tại mốc Phase 1: nhật ký 2026-10-20 14:58 ghi rõ không tự tick điều kiện Dọn dẹp/chuyển In review vì thiếu bản ghi đầy đủ. Giữ UAT Done theo owner, không tái dựng mốc lịch sử từ CI mới.**

## Bổ sung dọn dẹp sau UAT (2026-10-22)

Owner yêu cầu thực hiện dọn dẹp Phase 1; AI đã rà mã, bỏ phần dư và chạy kiểm tra mới. Xem [báo cáo dọn dẹp và đối chiếu](../../PROGRESS/PHASE_01_AUTH_HOME_UI/POST_UAT_CLEANUP.md). Đây là bằng chứng tại thời điểm hiện tại, không xác nhận lại UAT hoặc bổ sung mốc chuyển In review trước UAT ngày 2026-10-17; checkbox thứ 6 giữ nguyên vì còn vế lịch sử chưa đủ hồ sơ.
