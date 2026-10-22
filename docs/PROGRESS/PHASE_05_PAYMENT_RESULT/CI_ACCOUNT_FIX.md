# Sửa lỗi student-account trên CI PR #5

Ngày 2026-10-22 (+07:00), AI Codex theo báo lỗi của owner. Phase 3/5 giữ Done theo UAT đã có; bản sửa CI cần CI mới xác nhận.

## Bằng chứng và nhận định

- [Run lỗi 39764126307](https://github.com/Bero-working/MindyMobile/actions/runs/39764126307), head `644419d804f6fe89b658e18985511c66beb84317`: typecheck/eslint/unit-tests success, e2e-android failure, hai job build skipped. Chưa đủ điều kiện merge.
- Artifact `e2e-android-39764126307-1`, flow `student-account`: tap `account-logout` hoàn tất; assertion `account-logout-confirm` thất bại. Ảnh có backdrop tối; hierarchy chỉ có `app-sheet-backdrop`, không có nội dung sheet. Log không có lỗi JS tương ứng. Cảnh báo emulator lúc dừng xuất hiện sau flow thất bại.
- Local trước sửa chạy PASS một lần: chưa tái hiện ổn định lỗi CI. Nhận định có vấn đề khởi tạo/đo nội dung sheet ngắn hoặc chuyển sheet; chưa khẳng định nguyên nhân sâu trong thư viện.

## Bản sửa

- Account dùng chế độ nội dung cố định sẵn có của AppSheet cho ngôn ngữ/logout; profile vẫn cuộn. Không sửa component dùng chung/dependency/hạ tầng.
- Flow chờ backdrop đóng sau profile/đổi ngôn ngữ và kiểm tra thêm hủy rồi mở lại logout trước xác nhận. Giữ assertion bắt buộc, không retry hoặc bỏ qua lỗi.
- Cuộn tới nút preview để flow dùng được ở màn hình hẹp. Lượt compact đầu dừng tại nút preview ngoài viewport, chưa chạy tới account; lượt sau bổ sung cuộn đã PASS.

## Kiểm tra mới

| Kiểm tra | Kết quả |
| --- | --- |
| AccountScreen.test.tsx | PASS: 1 suite / 3 test, gồm xác nhận và lỗi/retry logout |
| ESLint file AccountScreen | PASS |
| Prettier AccountScreen và flow account | PASS |
| Type-check toàn app | PASS |
| Maestro account 1080×2400, density420, font1.0 | PASS: profile, đổi en/vi, hủy/mở lại/xác nhận logout |
| Maestro account 840×1866 (~320dp), density420, font1.3 | PASS cùng chuỗi; đã khôi phục kích thước/font emulator |

Log/evidence local: `build-logs/pr5-account-jest.txt`, `build-logs/pr5-account-typecheck.txt`, `build-logs/pr5-account-fixed/`, `build-logs/pr5-account-compact-final/`. Native dùng development preview/fixture, không kiểm tra logout backend thật. Workspace local còn thay đổi đăng nhập có sẵn, flow local vào Login rồi Back tới Welcome; commit giữ startup Welcome của PR, chỉ stage phần sửa account. Vì vậy local PASS không thay kết quả CI trên source commit chính xác.

Không chạy lại toàn bộ Jest/13 flow/native build/backend/iOS; bằng chứng Phase 5 trước đây giữ là lịch sử. Cần sáu job CI của head mới nhất success; owner tự merge sau khi kiểm tra, AI không merge.
