# Tiến độ 4.1 — Type checking và khung workflow

Nhật ký triển khai chỉ ghi thêm theo ENTRY.md. Chưa bắt đầu; task và tiêu chí tại [IMPLEMENT 4.1](../../IMPLEMENT/PHASE_04_GITHUB_ACTIONS/PHASE_04_01_TYPE_CHECKING.md).

### 2026-10-21 15:21 (+07:00) · @Bero-working (Codex)

- Trạng thái: In progress — triển khai xong phần mã, kiểm chứng hosted còn chờ.
- Đã làm / kiểm tra: 4.1.1: Xác minh origin HEAD là main; checkout v4.2.2 và setup-node v4.4.0 pin SHA upstream, Node22.22.0 có trong danh sách phát hành Node. npm ci trên archive sạch HEAD55a7e12 exit0 (1230 packages); không sửa lockfile.
- PR / commit: Sẽ bổ sung khi tạo PR nháp.

### 2026-10-21 15:21 (+07:00) · @Bero-working (Codex)

- Trạng thái: In progress — triển khai xong phần mã, kiểm chứng hosted còn chờ.
- Đã làm / kiểm tra: 4.1.2: Khung workflow đủ events/permissions/concurrency/cache, job Type checking 10 phút. tsc local PASS, probe string=123 fail exit2; xoá probe rồi tsc PASS. Archive sạch tsc cũng exit0. Chưa có kết quả hosted ở entry này.
- PR / commit: Sẽ bổ sung khi tạo PR nháp.

### 2026-10-21 15:21 (+07:00) · @Bero-working (Codex)

- Trạng thái: In progress — triển khai xong phần mã, kiểm chứng hosted còn chờ.
- Đã làm / kiểm tra: 4.1.3: Thêm guides/ci.md và liên kết CONTRIBUTING; ghi rõ dispatch cần default branch, không sửa branch protection.
- PR / commit: Sẽ bổ sung khi tạo PR nháp.

### 2026-10-21 15:48 (+07:00) · @Bero-working (Codex)

- Trạng thái: Done — AI tự nghiệm thu sub-phase; không thay UAT cấp Phase 4.
- Kiểm tra: Bản sạch a1639e4, run https://github.com/Bero-working/MindyMobile/actions/runs/39571171627, cả Type checking / ESLint and formatting / Unit tests hosted success. Jest 63 suite/294 test, tự thoát, có coverage artifact. Ca âm type/lint/assertion trên run 39569983962 fail đúng và chặn các job sau; probe đã xoá, bản khôi phục xanh. Format âm local exit1; bản chuẩn format xanh. Không thay file khoá ngoài ADR-0031, không thêm dependency.
- Giới hạn sự kiện: Mới thử pull_request. Push default/workflow_dispatch chưa thử vì workflow chưa merge vào main; ghi rõ trong guide, không tự merge hoặc đổi settings.

### 2026-10-21 20:24 (+07:00) · @Bero-working (Codex)

- Task: 4.1.1 Đổi trigger sang dev theo yêu cầu owner và xác minh PR
- Trạng thái: Done — tự kiểm tra phần cấu hình; giới hạn sự kiện nêu riêng.
- Đã làm: Push và pull_request đều lọc branches=[dev]. PR #2 đã đổi base sang dev; run 39600990649 tại afea99e và 39607209695 tại c1371b5 đều được tạo bằng sự kiện pull_request tới dev; cả ba quality jobs đạt. Không đổi default branch hoặc branch protection.
- Kiểm tra: js-yaml xác nhận hai bộ lọc chỉ có dev, workflow_dispatch còn giữ; actionlint 1.7.7/ShellCheck 0.10.0 đạt. Sau đóng PR #3 và hoàn tác probe, push nhánh kiểm tra không thuộc filter dev; không coi thao tác đó là kiểm thử push dev.
- Giới hạn: Chưa chạy push dev vì workflow chưa được merge vào dev; chưa workflow_dispatch vì default branch main chưa có workflow. Không push main hoặc merge PR chỉ để tạo bằng chứng trigger. Các entry cũ về push nhánh mặc định là lịch sử trước yêu cầu đổi sang dev.
