# Roadmap triển khai

Bảng tổng quan các phase: phụ thuộc, người phụ trách, trạng thái. Đọc trước khi bắt đầu hoặc nhận một phase. Quy
trình làm phase, trạng thái hợp lệ và cách ghi tiến độ: [docs/README.md](../README.md#quy-trình-làm-việc). Lịch sử chi
tiết nằm trong [PROGRESS/](../PROGRESS/); bảng này được sửa đè khi trạng thái đổi.

Trạng thái hợp lệ: `Todo` · `In progress` · `Blocked` · `In review` · `Done`. Chỉ owner (@Bero) được đặt `Done`.

| Phase | Thư mục | Phụ thuộc | Người phụ trách | Trạng thái | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 0 | [PHASE_00_FOUNDATION](PHASE_00_FOUNDATION/README.md) | — | @Bero | Blocked | Native Android/E2E và 37 test đã qua; chờ backend Origin, route Login và owner nghiệm thu |
| 1+ | — | PHASE_00_FOUNDATION | — | — | Owner sẽ thêm các phase màn hình |

## Tạo phase mới

1. Tạo thư mục `IMPLEMENT/PHASE_<NN>_<SCREEN>/` và `PROGRESS/PHASE_<NN>_<SCREEN>/`.
2. Copy [_template/PHASE_README.md](_template/PHASE_README.md) thành `README.md` của phase.
3. Mỗi phần của màn hình copy [_template/SUBPHASE.md](_template/SUBPHASE.md) thành `PHASE_<NN>_<MM>_<PART>.md`.
4. Trong `PROGRESS/PHASE_<NN>_<SCREEN>/` tạo file cùng tên, chỉ có tiêu đề và dòng mô tả.
5. Thêm một dòng vào bảng trên, ghi rõ phụ thuộc.
