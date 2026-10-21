# 4.2 ESLint và định dạng

## Mô tả

Thêm job eslint độc lập, chạy ESLint và Prettier hiện có. Bước hạ tầng; UI/API không áp dụng. Trạng thái **In progress**. Bắt đầu sau 4.1; task sửa cấu hình cần ADR-0031 Accepted.

## Task

### 4.2.1 Xác nhận phạm vi asset thiết kế

- Tái hiện npm run lint:rules -- --no-cache trên clean checkout; lưu danh sách file/rule lỗi. Đối chiếu [kiểm tra Phase 3](../../PROGRESS/PHASE_03_STUDENT_LEARNING/POST_UAT_CHECK.md), không dùng số lỗi cũ làm kết quả mới.
- [ADR-0031](../../adr/ADR-0031-ci-design-assets-eslint-scope.md) đã Accepted trong chat ngày 2026-10-21: đề xuất bỏ qua đúng `/assets/Student Home Page Design/**` trong .eslintrc.js vì đây là nguồn thiết kế, không phải mã app. Kiểm tra import trước khi áp dụng, không ignore cả assets hoặc src/assets.
- Sau owner Accepted mới sửa ignorePatterns và cập nhật ngoại lệ trong ARCHITECTURE.md cùng thay đổi. Không chỉnh rule, asset gốc hoặc dùng eslint-disable. Nếu lỗi nằm ngoài phạm vi này, ghi rõ và xử lý theo phạm vi/ADR thích hợp.
- Kiểm chứng trước: lint đang lỗi nguồn thiết kế; sau thay đổi chỉ loại các đường dẫn đã được chốt, không che lỗi app/test/config.

### 4.2.2 Job ESLint và Prettier

- Job ID eslint, tên ESLint and formatting; Ubuntu/Node/npm ci như 4.1; timeout 10 phút.
- Chạy npm run lint:rules -- --no-cache và npm run lint:code-format. Không dùng npm run lint vì sẽ lặp TypeScript trong job khác; không chạy --fix hoặc --write trên CI.
- Không biến warning hiện có thành error mới bằng --max-warnings=0 trong phase này; lỗi vẫn phải fail.
- Red → Green: thêm tạm một biến không dùng trong file app và một lỗi định dạng được Prettier kiểm tra; từng ca phải fail đúng bước, hoàn tác phải đạt.

## Tiêu chí nghiệm thu

- [ ] ADR Accepted và ARCHITECTURE cập nhật trước/cùng lần sửa .eslintrc.js.
- [ ] Hai lệnh hiện có dùng chung local và CI, không lỗi; warning được ghi rõ.
- [ ] Asset nguồn giữ nguyên; src, tests, __tests__ và cấu hình đang được lint không bị loại.
- [ ] Ca vi phạm rule/format đều fail; không bỏ qua lỗi hoặc tự format trên runner.
