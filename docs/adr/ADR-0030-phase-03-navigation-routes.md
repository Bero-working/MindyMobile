# ADR-0030: Đăng ký route Student Learning cho Phase 3

- Status: Accepted
- Date: 2026-10-20
- Author: Codex (soạn theo yêu cầu Phase 3 của owner)
- Approved by: @Bero — xác nhận trong chat ngày 2026-10-20: “tôi duyệt ADR30 và được phép gắn API vào”

## Context

[Phase 3](../IMPLEMENT/PHASE_03_STUDENT_LEARNING/README.md) cần tab Lịch/Tài khoản và màn Lớp của tôi/Chi tiết lớp. `src/navigation/index.tsx` bị khoá; ADR-0024 chỉ mở quyền cho route Phase 2. Yêu cầu soạn phase chưa phải phê duyệt ngoại lệ hạ tầng.

## Decision

Cho sửa `src/navigation/index.tsx` để đăng ký STUDENT_SCHEDULE, STUDENT_ACCOUNT, MY_CLASSES và STUDENT_CLASS_DETAIL chỉ trong nhánh STUDENT hiện có, cùng routes/types/module exports và test điều hướng. Params chỉ classId/sessionId và origin; không chứa DTO/meetingUrl. Tái sử dụng PAYMENT của Phase 2 cho orderId cũ.

Giữ Stack và auth guard/provider/screenOptions chung; không thêm thư viện tab hoặc thay bootstrap/HTTP/theme/UI kit. AppTabBar common được mở selected schedule/account, Notifications vẫn disabled. Sau khi owner duyệt, cập nhật ngoại lệ trong ARCHITECTURE cùng thay đổi triển khai.

## Alternatives và hệ quả

- Nhúng tất cả màn bằng local state: Back/guard/khôi phục màn khó kiểm soát.
- Thêm tab navigator mới: tăng thay đổi hạ tầng và dependency ngoài phạm vi.
- Ngoại lệ giới hạn theo phase giữ mô hình hiện có; cần owner Accepted trước sửa file navigator. Soạn spec và xây UI độc lập vẫn tiếp tục được.


Owner đồng thời chốt Lịch học chỉ xem, không bấm event để mở session. Điểm vào detail/session giữ từ Home và Lớp của tôi. Cho phép triển khai API Phase3 sau điều chỉnh này; UAT vẫn là mốc riêng.
