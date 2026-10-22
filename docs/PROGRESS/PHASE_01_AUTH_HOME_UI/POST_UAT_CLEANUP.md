# Dọn dẹp Phase 1 sau UAT — 2026-10-22

AI thực hiện theo yêu cầu owner “Dọn dẹp phase 1”. Mốc nguồn: `67cdc9e` cùng working tree hiện tại; các thay đổi tài liệu/.gitignore và việc xoá `e2e/flows/api-health.yaml` đã có trước lượt này được giữ nguyên. GitHub CLI không có trên máy; owner cung cấp handle **@Bero** trong chat cho nhật ký lần này.

## Phạm vi và thay đổi

Đối chiếu `git diff --name-only main...HEAD`, thu hẹp vào Auth/Home và các nơi gọi Home. Không dọn toàn bộ nhánh Phase 4. Không sửa dependency, file hạ tầng bị khoá, hành vi API hoặc thiết kế đã duyệt.

- Bỏ thuộc tính `HomeProps.preview` và `HomeCarousel.preview`: cả hai chỉ còn khai báo, không được component đọc. Xoá đối số dư tại PhaseOnePreview, test Home và duy nhất trường `homeProps.preview` trong PhaseThreePreview để đồng bộ kiểu tại nơi gọi; không sửa luồng học tập Phase 3.
- Xoá 8 key Home không dùng trong **mỗi** file vi-VN/en-EN: `sections.intro`, `actions.select`, `actions.refresh`, `empty.action`, `empty.schedule`, `compiler.description`, `compiler.sample`, `footer.support`. Đã rà toàn bộ src/tests/__tests__ và đối chiếu các lời gọi động của carousel, compiler, tab, delivery và form; giữ nguyên key được gọi động.
- Rà Auth/Home/PhaseOnePreview: không có TODO/FIXME đã xong, console/debugger, logger.debug tạm hay suppression cần xoá. Giữ mascot/ảnh/fixture đang được app hoặc kiểm thử sử dụng, nguồn thiết kế và bằng chứng lịch sử.

## Kiểm tra mới

| Kiểm tra | Kết quả và phạm vi |
| --- | --- |
| Jest toàn repo trước dọn mã | 63 suites / 294 tests PASS, tiến trình tự thoát, không dùng forceExit. Đây là baseline trước thay đổi mã. |
| Jest toàn repo sau dọn mã | Chạy lại trên bản cuối: 63 suites / 294 tests PASS, 91,567 giây, tiến trình tự thoát; kết quả JSON được lưu làm bằng chứng. |
| Jest sau dọn mã | Home, điều hướng/preview Auth và i18n: 3 suites / 24 tests PASS. |
| ESLint toàn repo sau dọn mã | PASS: 0 lỗi, 1 warning no-script-url trong test ClassDetailScreen thuộc Phase 3, URL cố ý kiểm tra từ chối liên kết. |
| Prettier toàn bộ src/tests/__tests__ | PASS sau dọn mã. |
| TypeScript | PASS sau khi bỏ đối số dư tại PhaseThreePreview. Lượt kiểm tra đầu phát hiện đúng nơi gọi còn truyền preview; đã sửa và chạy lại đạt. |
| Android Maestro lượt đầu | 2/5 PASS: auth-ui-login và auth-ui-register. app-launch không thấy app-root trong 30 giây (ảnh còn splash/bundling); student-home-ui dừng trước preview ở màn lỗi kiểm tra phiên; carousel-autoplay đã mở Home nhưng không cuộn tới home-intro-dot-0 trong timeout. |
| Android Maestro chạy lại | Chạy lại đúng 3 flow chưa đạt, không sửa bước hoặc timeout: 0/3 PASS. app-launch vẫn ở splash; student-home-ui qua các trạng thái dữ liệu/retry và mở course sheet, dừng khi cuộn tới home-intro-dot-2; carousel-autoplay dừng ở bước chờ Welcome trước preview. Không kết luận toàn bộ E2E đạt hoặc các lỗi này do dọn mã. |
| Liên kết và diff | Kiểm tra lại liên kết tệp trong Markdown IMPLEMENT/PROGRESS Phase 1 (không duyệt cây evidence/references): 0 đích thiếu; git diff --check PASS. |

Môi trường Android: Pixel_8, emulator-5554, API 37, 1080×2400, density 420, RAM 4096 MB; Maestro 2.11.0/JDK 21. Dùng APK debug đã có trên máy và mã JavaScript hiện tại qua Metro; không thay cấu hình native hoặc build release.

Bằng chứng mới trong [evidence/cleanup-2026-10-22/](evidence/cleanup-2026-10-22/): [Jest sau dọn mã và SHA-256 các file nguồn](evidence/cleanup-2026-10-22/jest-summary.json), [JUnit Android lượt đầu](evidence/cleanup-2026-10-22/android-first-run.xml), [JUnit chạy lại](evidence/cleanup-2026-10-22/android-retry.xml), ảnh Login/Register đã đạt, các trạng thái Home và ảnh lỗi. Raw log Metro/Maestro/Jest giữ tại TEMP của máy, không đưa vào repository.

Maestro ghi lặp lỗi heartbeat không ghi được file sessions vì Windows file lock; vẫn thực thi flow và xuất JUnit. Không kết luận đây là nguyên nhân mọi ca lỗi. Lỗi phiên trước Home chưa có đủ thông tin để xác định nguyên nhân; HTTP auth/me không cookie từ máy host trả 401 khi đối chiếu, không chứng minh đường mạng trong emulator luôn ổn định.

Các cảnh báo Jest baseline có React act và MSW thiếu mock me/cart; các test vẫn PASS. Lượt test Home sau dọn mã còn cảnh báo act ở callback đọc trạng thái screen reader. Không tắt cảnh báo hoặc sửa runtime chung để che kết quả.

## Đối chiếu nghiệm thu và giới hạn

| Tiêu chí liên quan | Đối chiếu |
| --- | --- |
| 1.5: preview kiểm tra được, release không bypass auth | Jest điều hướng/preview kiểm tra menu/trạng thái và không có route/nút preview trong release. Bỏ prop chết không bỏ cơ chế __DEV__. |
| 1.5: không suy fixture thành backend thật | Các flow Auth/Home ở đây dùng fixture/callback sau khi mở preview; không chứng minh login/register/resend/refresh thật. |
| 1.5: ảnh/luồng tương tác | Đạt một phần ở lượt mới: Login/Register PASS; Home lần chạy lại đã qua success/loading/empty/error/retry và mở course sheet, nhưng flow dừng khi cuộn tới home-intro-dot-2. Không ghi toàn bộ E2E đã đạt; bằng chứng lịch sử giữ nguyên. |
| README phase: chất lượng mã | Đạt một phần ở lần hiện tại: lint/format/type-check/294 Jest PASS, Android chưa xanh toàn bộ. Bỏ tick tiêu chí ghép tại README; kết quả lịch sử không đổi. Không dùng tổng số Jest thay kiểm thử native. |
| README phase: accessibility/Reduce Motion | Giữ checkbox ghép chưa tick: chưa kiểm tra lại Reduce Motion native sau thay đổi autoplay, TalkBack/chữ lớn/vùng chạm không được suy từ lượt dọn mã. |
| 1.99: Dọn dẹp/Kiểm tra và chuyển In review trước UAT | Giữ checkbox lịch sử chưa tick. Lượt này bổ sung hồ sơ sau UAT, không tái dựng mốc In review trước xác nhận owner ngày 2026-10-17. |

Phase 1 và 1.1–1.6/1.99 giữ **Done** theo UAT owner đã ghi. Kết quả hiện tại bổ sung bằng chứng kỹ thuật, không phải lượt UAT mới. Không chạy iOS/release, backend có tài khoản thật, gửi email hoặc thanh toán trong lượt này.

Bước **Dọn dẹp: Done**. Bước **Kiểm tra bổ sung: In review**, vì Android chưa đạt đầy đủ. Phần còn lại cần kiểm tra môi trường khởi động/phiên và thao tác cuộn trên Android, xác định nguyên nhân rồi chạy lại 3 flow chưa đạt. Không sửa hạ tầng bị khoá, tăng timeout hoặc thay UI chỉ để làm xanh báo cáo trong lượt dọn mã này.

Ghi chú tài liệu lịch sử: hướng dẫn PREVIEW.md cũ ghi carousel không tự chạy timer và course chỉ gọi callback; bản hiện tại đã có autoplay và mở course sheet từ Phase 2. Dùng các flow hiện tại để kiểm tra; không sửa đè nội dung lịch sử trong PROGRESS.
