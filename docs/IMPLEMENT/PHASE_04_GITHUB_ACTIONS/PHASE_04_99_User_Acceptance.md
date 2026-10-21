# 4.99 User Acceptance — GitHub Actions

- Owner: @Bero. Trạng thái **Todo**; chưa có xác nhận UAT Phase 4.
- Phạm vi: TypeScript, ESLint/Prettier, Jest, Maestro Android và build Android/iOS Simulator. Không có Expo Doctor hoặc Image Optimization.
- Đây là nghiệm thu hạ tầng CI; UI approval và API integration không áp dụng vì không có UI/API mới. Thực hiện sau 4.1–4.5 → Dọn dẹp → Kiểm tra, theo ADR-0017.

## Điều kiện bắt đầu

- [ ] 4.1–4.5 đã triển khai, ADR cho file khoá có Accepted và ARCHITECTURE cập nhật.
- [ ] Có workflow run trên GitHub cùng revision với các job bắt buộc đạt, không job bắt buộc skipped/continue-on-error.
- [ ] Có kết quả thử lỗi có kiểm soát, đã hoàn tác; nhánh bàn giao không chứa lỗi cố ý.
- [ ] PROGRESS có URL run, revision, số test/flow, artifact, runtime/action versions và guide chạy lại.
- [ ] Mọi giới hạn backend/signing/Simulator/lockfile được nêu rõ, không thay bằng kết quả suy đoán.

## Owner kiểm tra

| # | Thao tác | Kết quả mong đợi |
| --- | --- | --- |
| 1 | Mở workflow và phạm vi job | Có đủ 5 nhóm đã chốt; không có Expo Doctor/Image Optimization |
| 2 | Mở run pull_request tới `dev`, push vào `dev`, workflow_dispatch; kiểm tra push vào `main` và PR tới nhánh khác `dev` | Chỉ `dev` tự kích hoạt CI qua push/PR; revision đúng sự kiện, run mới huỷ run cũ cùng PR/ref |
| 3 | Xem job Type checking và bằng chứng ca sai kiểu | Bản chuẩn đạt; lỗi kiểu làm failure, không thay tsconfig để bỏ kiểm tra |
| 4 | Xem ESLint/Prettier, ADR và diff cấu hình | Mã app/test/config được kiểm tra; chỉ nguồn thiết kế đã duyệt được bỏ qua; ca vi phạm fail |
| 5 | Xem job Jest và coverage | Toàn bộ suite chạy, process tự thoát, assertion sai fail; không dùng reporter chưa cài |
| 6 | Xem E2E Android và artifact | 13 flow tag ci chạy thực; cart-checkout-qr hoãn vì thanh toán chưa hoàn thiện, có screenshot/report; phân biệt preview với API thật; testID sai fail |
| 7 | Xem run quality/E2E lỗi | Hai job build cuối không chạy; pipeline không báo xanh giả |
| 8 | Tải artifact Android | Có APK/AAB không rỗng cùng revision/checksum; ghi rõ CI/debug signing |
| 9 | Tải artifact iOS | Có app Simulator Release từ macOS; không ghi thành IPA hoặc production archive |
| 10 | Xem run build lỗi và hướng dẫn chạy lại | Job fail đúng bước, lưu log phù hợp, không upload rỗng/báo đạt |
| 11 | Xem cấu hình môi trường/quyền | contents: read; không cần secret production; env cá nhân/keystore không có trong artifact |

## Bằng chứng và xác nhận

Bàn giao tại [PROGRESS cấp phase](../../PROGRESS/PHASE_04_GITHUB_ACTIONS/README.md) và các file cùng tên sub-phase. Khi triển khai, bổ sung URL run/revision, đường dẫn artifact và kết quả đối chiếu thực tế vào nhật ký; không điền trước kết quả đạt.

Kết quả/xác nhận của owner: **Chưa có**. Ghi thêm entry cấp phase sau khi owner thực hiện. Chỉ chuyển Phase 4 và 4.99 sang Done sau xác nhận UAT đạt; việc chốt phạm vi hoặc duyệt ADR không thay UAT.
