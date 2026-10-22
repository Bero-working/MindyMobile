# Dọn dẹp và kiểm tra sau UAT — 2026-10-21 (+07:00)

Phase 3 giữ trạng thái **Done** theo xác nhận UAT của owner. Đối tượng kiểm tra: commit `55a7e12` và thay đổi tài liệu/.gitignore sau commit; không sửa mã nguồn, dependency, API hoặc cấu hình native.

## Dọn dẹp

- Bỏ 75 log Metro/Maestro/device khỏi vùng chờ commit; giữ nguyên các tệp trên máy để tra cứu. Thêm quy tắc .gitignore hẹp cho `/phase1-metro.log` và `docs/PROGRESS/PHASE_03_STUDENT_LEARNING/evidence/**/logs/`.
- Giữ ảnh, manifest, commands, báo cáo kiểm tra và các bằng chứng đã commit. Manifest lịch sử có thể liệt kê raw log chỉ còn trên máy; không coi bản repository là gói runner đầy đủ.
- Đồng bộ mô tả API đã nối tại 3.6 trong các sub-phase 3.1–3.4. Sửa sơ đồ/phạm vi và mục điều hướng 3.5: Lớp của tôi vào từ Home/Tài khoản, điểm vào từ Khoá học đã bỏ theo yêu cầu owner.
- Rà module account/my-classes/schedule: không có console/debugger/TODO/FIXME, suppression TypeScript/ESLint hoặc kiểu any/unknown trong mã mới; kết quả tìm từ “any” chỉ là câu mô tả test.

## Kết quả kiểm tra

| Kiểm tra | Kết quả và phạm vi |
| --- | --- |
| Jest toàn repo | 63 suites / 294 tests PASS ở lượt ngay trước khi dọn dẹp, trên cùng mã nguồn commit 55a7e12. Không chạy lại vì chỉ sửa tài liệu/.gitignore. Có cảnh báo Jest còn handle; lượt chạy dùng forceExit. |
| TypeScript / định dạng mã | PASS ở lượt trước trên cùng mã nguồn; không có thay đổi src/tests/__tests__ sau đó. |
| ESLint src/tests/__tests__ | Chạy lại: 0 lỗi, 1 warning no-script-url trong ClassDetailScreen.test.tsx, URL cố ý dùng kiểm tra từ chối link không hợp lệ. |
| ESLint toàn repo | Chạy lại: 626 lỗi / 44 warnings; lỗi thuộc JavaScript asset thiết kế cũ. Không tự sửa asset nguồn hoặc nới rule để làm xanh báo cáo. |
| Android mở app | Chạy mới Maestro trên emulator-5554/Pixel_8: launchApp và chờ/assert app-root PASS. Không clearState, không đăng nhập lại, không gọi thao tác thanh toán. Đây là smoke mở app, không phải chạy lại toàn bộ flow Phase 3. |
| Liên kết Markdown Phase 3 | 0 liên kết tệp thiếu trong IMPLEMENT và PROGRESS Phase 3. |
| Diff | git diff --check PASS; vùng chờ commit không còn log tạm. |

Báo cáo lint và output Maestro của lượt này được giữ tại thư mục TEMP của máy (`mindy-post-uat-eslint.log`, `mindy-post-uat-repo-lint.log`, `mindy-post-uat-native.log`, `mindy-post-uat-smoke/`); không đưa raw log vào repository.

## Giới hạn giữ nguyên

Student roster chờ API. Chưa iOS/TalkBack thủ công cho Phase 3. Không bổ sung bằng chứng backend cho CASH_PREVIEW/PAYOS/đối soát hoặc lịch có buổi; không tạo giao dịch/enrollment để dựng kết quả. Bộ flow Android chức năng và responsive trước UAT giữ nguyên bằng chứng tại [API_REVIEW](API_REVIEW.md) và [nhật ký](README.md).
