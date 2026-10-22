# ADR-0031: Phạm vi ESLint cho nguồn thiết kế trong CI

- Status: Accepted
- Date: 2026-10-21
- Created at: 2026-10-21T14:53:00+07:00
- Author: @Bero (Codex soạn theo yêu cầu tạo Phase 4; handle được owner cung cấp trong chat)
- Approved by: @Bero — “Duyệt ADR-0031” trong chat ngày 2026-10-21 (+07:00)

## Context

Phase 4 đưa npm run lint:rules lên GitHub Actions. Lệnh hiện tại là eslint . --cache; cấu hình bỏ qua HTML nhưng còn quét JavaScript trong assets/Student Home Page Design. Đây là bộ nguồn thiết kế để đối chiếu UI, không phải mã React Native của app. Kiểm tra sau UAT Phase 3 ghi lỗi ESLint toàn repo ở asset JavaScript thiết kế cũ.

.eslintrc.js là file hạ tầng bị khoá. Yêu cầu tạo phase và chốt 5 nhóm CI không được coi là đã duyệt sửa file này. ADR này cấp ngoại lệ hẹp cho task 4.2.1 sau xác nhận “Duyệt ADR-0031” của owner trong chat ngày 2026-10-21.

## Decision

Sau khi owner Accepted, thêm đúng `/assets/Student Home Page Design/**` vào ignorePatterns của .eslintrc.js và cập nhật ngoại lệ/bản đồ CI trong ARCHITECTURE.md cùng thay đổi. Trước khi áp dụng phải rà import để xác nhận app không thực thi JavaScript thuộc cây nguồn thiết kế này.

Giữ nguyên npm run lint:rules cho local và CI, CI thêm --no-cache. Không ignore toàn bộ assets, src/assets, mã app/test hoặc cấu hình root; không sửa rule, eslint-disable hoặc sửa asset nguồn để làm CI xanh. Các lỗi ngoài phạm vi phải được báo và xử lý riêng.

Ngoại lệ này không cấp quyền sửa package.json, Jest, native, Metro, CODEOWNERS hoặc file hạ tầng khác; không thêm dependency.

## Alternatives

- Chỉ lint src/tests/__tests__ trên CI: bỏ sót cấu hình và làm local khác CI.
- Truyền ignore pattern riêng trên CI: tránh sửa cấu hình nhưng lệnh local tiếp tục lỗi nguồn thiết kế, khó nghiệm thu cùng chuẩn.
- Sửa JavaScript thiết kế để theo rule React Native: làm lệch nguồn tham chiếu và vượt phạm vi CI.

## Consequences

- App/test/config tiếp tục được lint theo cùng lệnh giữa local và CI; nguồn thiết kế gốc giữ nguyên.
- JavaScript thuộc bộ thiết kế không được lint theo quy tắc React Native; cần rà lại phạm vi nếu app sau này import trực tiếp từ cây này.
- Task sửa .eslintrc.js chỉ bắt đầu sau Accepted; soạn đặc tả Phase 4 vẫn thực hiện được khi ADR còn Proposed.
