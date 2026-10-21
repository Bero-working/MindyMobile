# 4.3 Unit test

## Mô tả

Thêm job unit-tests chạy toàn bộ Jest suite hiện có, gồm unit/component/integration và MSW. Bước hạ tầng; UI/API mới không áp dụng. Trạng thái **Done**, sau 4.2.

## Task

### 4.3.1 Kiểm tra vòng đời Jest

- Chạy npm test -- --ci --runInBand --watch=false trên clean runner; ghi số suite/test, thời gian và việc process tự kết thúc.
- Nếu Jest còn open handles, dùng --detectOpenHandles để tìm nguồn; dọn timer/subscription/server trong test sở hữu tài nguyên. Không mặc định thêm --forceExit hoặc tăng timeout để che lỗi.
- Nếu cần sửa jest.config.js, jest.setup.js, tests/mocks/server.ts hoặc tests/utils thì phải có ADR Accepted riêng và cập nhật ARCHITECTURE trước khi sửa. ADR-0031 không cấp quyền cho các file này.
- Kiểm chứng trước khi sửa lifecycle: tái hiện handle còn mở và chỉ ra tài nguyên; kiểm chứng sau sửa bằng việc Jest tự thoát và suite liên quan vẫn đạt.

### 4.3.2 Thêm job và coverage

- Job ID unit-tests, tên Unit tests; Ubuntu/Node/npm ci theo 4.1; timeout 15 phút.
- Chạy npm test -- --ci --runInBand --watch=false --coverage; không dùng test:report vì jest-junit chưa được cài, không thêm dependency chỉ để xuất JUnit.
- Upload coverage mặc định và log phù hợp cả khi test lỗi; ghi rõ khi test chết trước khi tạo coverage. Chưa áp mức coverage mới nếu repo chưa quy định threshold.
- Red → Green: đổi tạm một assertion hiện có để job fail; hoàn tác rồi chạy lại toàn bộ suite. Không dùng --passWithNoTests; không thay test thật bằng test workflow hình thức.

## Tiêu chí nghiệm thu

- [x] Toàn bộ suite được phát hiện và chạy, số test/suite được ghi vào PROGRESS.
- [x] Jest tự kết thúc, không forceExit; không phụ thuộc backend thật.
- [x] Assertion sai làm job fail; bản bàn giao đạt, có artifact coverage.
- [x] Không tham chiếu reporter chưa cài; thay đổi file khoá nếu phát sinh có ADR riêng.
