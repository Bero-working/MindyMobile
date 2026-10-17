# Roadmap triển khai

Bảng tổng quan các phase: phụ thuộc, người phụ trách, trạng thái. Đọc trước khi bắt đầu hoặc nhận một phase. Quy
trình làm phase, trạng thái hợp lệ và cách ghi tiến độ: [docs/README.md](../README.md#quy-trình-làm-việc). Lịch sử chi
tiết nằm trong [PROGRESS/](../PROGRESS/); bảng này được sửa đè khi trạng thái đổi.

Trạng thái hợp lệ: `Todo` · `In progress` · `Blocked` · `In review` · `Done`. AI được tự nghiệm thu task/sub-phase
và ghi đánh giá trong PROGRESS. Mỗi phase lớn kết thúc bằng UAT của owner (@Bero); chỉ owner được đặt phase `Done`
sau khi UAT đạt, theo [ADR-0017](../adr/ADR-0017-ai-self-review-owner-uat.md).
Theo [ADR-0021](../adr/ADR-0021-per-phase-ui-approval-api-uat.md), **mỗi phase** đi qua UI → owner xác nhận UI → gắn API của phase → owner UAT.
Chờ duyệt UI và chờ UAT đều có thể là In review nhưng phải ghi rõ mốc; không gắn API khi UI chưa được owner xác nhận.

| Phase | Thư mục                                                  | Phụ thuộc                                                  | Người phụ trách | Trạng thái | Ghi chú                                                                                                          |
| ----- | -------------------------------------------------------- | ---------------------------------------------------------- | --------------- | ---------- | ---------------------------------------------------------------------------------------------------------------- |
| 0     | [PHASE_00_FOUNDATION](PHASE_00_FOUNDATION/README.md)     | —                                                          | @Bero           | Done       | Owner duyệt đủ UAT và đóng Phase 0 ngày 2026-10-17; dừng chờ refresh theo chỉ đạo, giới hạn bằng chứng ghi trong PROGRESS |
| 1     | [PHASE_01_AUTH_HOME_UI](PHASE_01_AUTH_HOME_UI/README.md) | Ngoại lệ Foundation/navigator theo ADR-0018 Accepted | @Bero | Done | Owner duyệt UAT Phase 1 trong chat ngày 2026-10-17; giới hạn kiểm thử còn ghi trong PROGRESS, Phase 0 giữ trạng thái riêng |
| 3+    | —                                                        | Theo từng phase                                            | —               | —          | Owner sẽ thêm các phase màn hình tiếp theo                                                                       |

## Bàn giao thiết kế UI

Theo [ADR-0019](../adr/ADR-0019-claude-design-handoff-codex-ui.md), Claude Code lấy thiết kế từ Claude Design và
đặc tả chi tiết trước khi Codex triển khai UI tương ứng. README phase ghi nguồn, màn hình/phiên bản/biến thể;
sub-phase ghi bố cục, thông số, asset, trạng thái, tương tác và tiêu chí đối chiếu. Lưu ảnh/asset và bản ghi nguồn
trong `references/` của phase. Mục không áp dụng ghi rõ lý do; đầu vào thiếu phải được đánh dấu và bổ sung.

Codex bám bản bàn giao, kiểm tra UI chạy thật với ảnh/đặc tả, ghi bằng chứng và sai khác vào PROGRESS để owner xác nhận UI; sau đó mới gắn API và bàn giao UAT theo ADR-0021.
Thiết kế thay đổi thì Claude Code cập nhật IMPLEMENT trước khi Codex sửa UI tương ứng.

## Tạo phase mới

1. Tạo thư mục `IMPLEMENT/PHASE_<NN>_<SCREEN>/` và `PROGRESS/PHASE_<NN>_<SCREEN>/`.
2. Copy [\_template/PHASE_README.md](_template/PHASE_README.md) thành `README.md` của phase.
3. Mỗi phần của màn hình copy [\_template/SUBPHASE.md](_template/SUBPHASE.md) thành `PHASE_<NN>_<MM>_<PART>.md`.
4. Tạo `PHASE_<NN>_99_User_Acceptance.md` trong thư mục IMPLEMENT của phase và thêm bước `N.99` ở cuối bảng
   sub-phase. File ghi phạm vi, điều kiện bắt đầu, các bước User kiểm tra, kết quả mong đợi, liên kết bằng chứng AI
   và phần ghi nhận kết quả/xác nhận của owner. Giữ nguyên `User_Acceptance`; `99` dành riêng cho UAT,
   sub-phase triển khai dùng `01`–`98`. Ví dụ: `PHASE_02_99_User_Acceptance.md`.
5. Trong `PROGRESS/PHASE_<NN>_<SCREEN>/` tạo file cùng tên cho các sub-phase triển khai, chỉ có tiêu đề và dòng
   mô tả. Kết quả UAT của bước `N.99` ghi thêm vào `PROGRESS/PHASE_<NN>_<SCREEN>/README.md` theo nhật ký cấp phase.
6. Thêm một dòng vào bảng trên, ghi rõ phụ thuộc.
