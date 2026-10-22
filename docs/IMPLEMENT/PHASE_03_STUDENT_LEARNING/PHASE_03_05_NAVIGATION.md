# 3.5 Điều hướng, preview và kiểm tra UI

## Cập nhật owner — 2026-10-20

Yêu cầu UI tiếp theo: bỏ thanh “Lớp của tôi” dưới header Khoá học; không còn điểm vào MyClasses từ trang Khoá học hoặc callback tương ứng. Giữ các lối vào từ Home và Tài khoản, cùng tab Lịch/Tài khoản trên trang Khoá học. Quyết định này ưu tiên mô tả điểm vào Courses bên dưới.

Owner duyệt ADR-0030 và cho phép gắn API Phase3 trong chat. Lịch học chỉ xem: row buổi là View, không button/onPress/điều hướng session; giữ chọn ngày/đổi tuần/xem nội dung/làm mới. Detail/session mở từ Home hoặc Lớp của tôi. Đây là quyết định UI mới ưu tiên các luồng lịch→session mô tả bên dưới. Tại mốc 2026-10-20, API/route bắt đầu In progress. Cập nhật 2026-10-21: owner đã duyệt UAT, sub-phase Done.

## Bước và nguồn

UI đã được owner cho phép nối API; route production triển khai theo ADR-0030 Accepted. Giữ AppTabBar/BrandBar của Phase 2, mở schedule/account theo opt-in. Base và thay đổi: [DESIGN_SOURCE](references/DESIGN_SOURCE.md). ADR-0030 đã Accepted trong chat ngày2026-10-20; chỉ mở các route đã nêu.

## Route dự kiến

| Route | Params | Quy tắc |
| --- | --- | --- |
| STUDENT_SCHEDULE | không | Tab schedule |
| STUDENT_ACCOUNT | không | Tab account |
| MY_CLASSES | `{ origin: 'home' | 'courses' | 'account' }` | Màn con; selected tab theo origin |
| STUDENT_CLASS_DETAIL | `{ classId: string, sessionId?: string }` | Màn con toàn màn hình; xác minh quyền, không tin route hint |
| PAYMENT (đã có) | `{ orderId: string }` | Dùng đơn cũ từ PENDING_PAYOS, không tạo checkout mới |

Chỉ ID và ngữ cảnh an toàn trong params, không DTO/profile/meetingUrl. Mọi route nghiệp vụ chỉ trong nhánh STUDENT. Guest về auth, staff không thấy route Student. Mở từ schedule hoặc Home session phải xác minh lại quyền của lớp trước hiển thị.

## Hành vi UI

- AppTabBar giữ thứ tự courses/schedule/home/notifications/account, mở schedule/account và mở rộng selected type. Notifications vẫn disabled có hint. Home khi đang ở Home cuộn lên đầu; từ tab khác về Home, không gọi onTop của màn khác.
- Chuyển tab dùng route hiện có nếu đã tồn tại để tránh stack lặp; Back Android từ màn con về nguồn, từ tab cấp cao giữ chính sách Home hiện tại. Không đổi navigator sang thư viện tab mới.
- Home “Lớp của tôi” và footer tương ứng nếu có → My Classes(origin home); buổi học Home → detail(sessionId). Lối vào “Lớp của tôi” dưới BrandBar của Khoá học đã được bỏ theo yêu cầu owner ngày 2026-10-20; giữ điểm vào từ Home và Tài khoản. Không thay hành vi mũi tên/+ chọn lớp của Phase 2.
- Account → My Classes(origin account). Trong My Classes/detail Back khôi phục filter/expanded/scroll. Khi detail mở từ schedule, trở về đúng tuần và ngày đã chọn.
- Preview development bổ sung menu Lịch/Tài khoản/Lớp của tôi, fixture FULL/CASH_PREVIEW/NONE/đối soát/lỗi; không tạo auth session và không gọi HTTP production. Dùng fixture chung để chuyển màn không mất lựa chọn trong lượt xem.
- Detail/sheet có safe area; My Classes giữ tab theo nguồn; detail và PAYMENT ẩn tabs. Không thêm toast/modal vào vùng làm nhảy layout. Reduced Motion theo motion.ts; dùng component common, không sửa component UI bị khoá.

## Task

### 3.5.1 Route và các điểm vào
- File dự kiến: routes.ts, types.ts, modules/index.ts, navigation/index.tsx (sau ADR), AppTabBar, ProductionStudentHome, CoursesRoute, các adapter route mới.
- Test guard, Home/MyClasses đúng callback, ID/sessionId, selected tab, Home từ tab khác và không nhân stack.
- testID `courses-my-classes`, `home-my-classes`, `schedule-tab-schedule`, `account-tab-account`; tận dụng prefix AppTabBar hiện có.

### 3.5.2 Hồi quy và bằng chứng UI
- Test luồng fixture: Home → My Classes → FULL detail → buổi → Back; Schedule → CASH preview; NONE không mở detail; pending PayOS mở QR fixture; logout callback.
- Maestro dự kiến: `student-schedule.yaml`, `student-account.yaml`, `my-classes-detail.yaml` trong e2e/flows; dùng fallback APP_ID theo repo. Không hardcode tài khoản/password.
- Đối chiếu320dp/màn thường, font1.3×, Reduce Motion; lưu ảnh schedule/account/folders/detail/session-sheet/preview/empty/error. Ghi rõ môi trường và kết quả từng flow, không cộng nhiều lượt thành một lượt tất cả đạt.

## Điều kiện bàn giao UI

### Thích nghi sau kiểm tra native (2026-10-20)
- AppTabBar chỉ trong preview/Student Learning, ở màn <=360dp hoặc font >=1.3×: tăng vùng đáy từ68dp lên88dp, khung từ96dp lên116dp và cho nhãn tối đa2dòng. Giữ neo đáy/safe area và hình thức Home nhô lên; không thu nhỏ font hoặc target. Điều chỉnh để tránh nhãn Khoá học/Tài khoản bị cắt ở320dp/font130%.
- Nút công cụ development dùng nhãn ngắn UI và accessibilityLabel đầy đủ, đặt trên vùng tabs; không xuất hiện trong production. Nguồn base và các điều chỉnh khác giữ theo đặc tả.

- [x] 3.1–3.5 qua kiểm tra; đủ fixture và ảnh; không có API nghiệp vụ mới ở production trước duyệt UI.
- [x] Owner xem bản chạy và xác nhận UI riêng trong PROGRESS. Test xanh không tự chuyển sang API.

## Đồng bộ checklist (2026-10-22)

Đối chiếu bằng chứng đã ghi, không chạy lại test trong lượt đồng bộ này. Xem [bảng đối chiếu và giới hạn](../../PROGRESS/ACCEPTANCE_SYNC_2026-10-22.md) và [PROGRESS liên quan](../../PROGRESS/PHASE_03_STUDENT_LEARNING/PHASE_03_05_NAVIGATION.md). Trạng thái Done của phase giữ theo UAT owner đã có; checkbox chỉ phản ánh phạm vi kiểm chứng, không tự thay xác nhận owner.

Các nhánh FULL/CASH_PREVIEW/NONE, thay đổi quyền và dữ liệu có buổi được ghi theo unit/MSW/fixture khi chưa có dataset backend phù hợp. Có native protected detail bổ sung lúc 18:44 ngày 2026-10-20; Student roster, các dataset còn thiếu và TalkBack/iOS thủ công giữ giới hạn tại API_REVIEW.
