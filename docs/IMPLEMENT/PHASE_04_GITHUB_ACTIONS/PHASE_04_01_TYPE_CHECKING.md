# 4.1 Type checking và khung workflow

## Mô tả

Tạo `.github/workflows/ci.yml` và job typecheck, dùng script TypeScript hiện có. Bước hạ tầng; UI, API, testID và i18n không áp dụng. Trạng thái **In progress**.

## Task

### 4.1.1 Chốt môi trường và sự kiện

- Xác định nhánh mặc định từ remote; kiểm tra npm ci trên clean checkout theo package-lock.json. Không thay lockfile bằng npm install để né lỗi CI.
- Chốt Node 22 patch, runner Ubuntu và các action checkout/setup-node bằng SHA từ upstream; ghi phiên bản và lý do. CI=true, HUSKY=0; cache npm theo lockfile.
- Tạo workflow cho pull_request, push nhánh mặc định và workflow_dispatch, permissions contents: read; concurrency theo PR/ref, huỷ run cũ khi có commit mới.
- Kiểm chứng trước: ghi hiện trạng chưa có workflow; khi thêm phải parse được YAML/expressions, pull_request không cần secret và checkout đúng revision.

### 4.1.2 Thêm job typecheck

- Chạy npm run lint:type-check sau npm ci; giữ noEmit/strict và phạm vi tsconfig hiện tại. Không sửa tsconfig hoặc bỏ qua file đang lỗi.
- Timeout 10 phút. Kết quả riêng tên Type checking với job ID typecheck.
- Kiểm chứng Red → Green: trên nhánh kiểm tra, tạo assignment sai kiểu trong phạm vi tsconfig và xác nhận job lỗi; hoàn tác rồi xác nhận đạt. Không giữ lỗi cố ý trong nhánh bàn giao.

### 4.1.3 Ghi hướng dẫn vận hành ban đầu

- Thêm hướng dẫn đọc kết quả Type checking, chạy lại local/CI, xem lỗi cài dependency; URL run và revision ở PROGRESS cùng tên sub-phase.
- Ghi nhận giới hạn sự kiện nếu workflow_dispatch chưa chạy được do workflow chưa có trên default branch. Không tự đổi settings repository.

## Tiêu chí nghiệm thu

- [ ] npm ci và TypeScript đạt trên clean runner; không tạo output JS.
- [ ] Ca sai kiểu làm job fail, bản đã hoàn tác đạt.
- [ ] Events, permissions, concurrency, cache và timeout đúng README phase.
- [ ] Không thay package.json, tsconfig hoặc dependency; PROGRESS có bằng chứng.
