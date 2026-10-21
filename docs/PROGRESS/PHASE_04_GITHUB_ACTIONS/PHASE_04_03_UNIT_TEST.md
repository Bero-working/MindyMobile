# Tiến độ 4.3 — Unit test

Nhật ký triển khai chỉ ghi thêm theo ENTRY.md. Chưa bắt đầu; task và tiêu chí tại [IMPLEMENT 4.3](../../IMPLEMENT/PHASE_04_GITHUB_ACTIONS/PHASE_04_03_UNIT_TEST.md).

### 2026-10-21 15:21 (+07:00) · @Bero-working (Codex)

- Trạng thái: In progress — triển khai xong phần mã, kiểm chứng hosted còn chờ.
- Đã làm / kiểm tra: 4.3.1: Tái hiện63suites/294tests PASS nhưng process chờ. detectOpenHandles chỉ CustomGC tại LightningCSS (cảnh báo upstream có thể false positive); async_hooks ngoài repo xác minh2Timeout ref=true,300000ms từ Query.removeObserver/scheduleGc. Hai test tích hợp App xoá cache khi observers vẫn mounted; set gcTime0 riêng trong test và await cleanupAsync, khôi phục defaultOptions sau suite. Hai suite6tests PASS và tự thoát7.399s. Không sửa file hạ tầng khoá, không forceExit.
- PR / commit: Sẽ bổ sung khi tạo PR nháp.

### 2026-10-21 15:21 (+07:00) · @Bero-working (Codex)

- Trạng thái: In progress — triển khai xong phần mã, kiểm chứng hosted còn chờ.
- Đã làm / kiểm tra: 4.3.2: Thêm job Unit tests15phút, coverage/log artifact7ngày. Chạy toàn bộ63suites/294tests PASS với coverage41.694s, process exit0 tự nhiên trên Node24.16.0. Probe assertion1=2 fail exit1 rồi xoá. Lượt Node22 coverage đầu bị dừng do không tiến thêm sau preview trong nhiều phút; không coi là đạt; chạy lại Node22 không coverage đang chờ.
- PR / commit: Sẽ bổ sung khi tạo PR nháp.
