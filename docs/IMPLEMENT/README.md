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
| 2 | [PHASE_02_COURSE_CHECKOUT](PHASE_02_COURSE_CHECKOUT/README.md) | Phase 1; ADR-0024, ADR-0025, ADR-0027, ADR-0028 Accepted | @Bero | Done | Owner duyệt lại “UAT phase 2 approve” ngày2026-10-18 21:34 (+07:00), sau sửa E2E9/9 PASS; chi tiết tại PROGRESS |
| 3 | [PHASE_03_STUDENT_LEARNING](PHASE_03_STUDENT_LEARNING/README.md) | Phase 0/1/2 Done; ADR-0030 Accepted | @Bero | Done | Owner xác nhận “Tôi duyệt UAT phase 3” trong chat ngày 2026-10-21 (+07:00); giới hạn kiểm thử và Student roster chờ API giữ trong PROGRESS |
| 4 | [PHASE_04_GITHUB_ACTIONS](PHASE_04_GITHUB_ACTIONS/README.md) | Phase 0/1/2/3 Done; ADR-0031 Accepted | @Bero | In progress | GitHub Actions: TypeScript, ESLint, Jest, Maestro Android và build Android/iOS; bỏ Expo Doctor và Image Optimization theo yêu cầu owner ngày 2026-10-21 |
| 5+ | — | Theo từng phase | — | — | Owner sẽ thêm các phase tiếp theo |

## Bàn giao thiết kế UI

Theo [ADR-0029](../adr/ADR-0029-local-ui-base-codex-spec-implementation.md), Codex mặc định đặc tả trong
`IMPLEMENT/<phase>/` và có thể triển khai; Claude có thể đặc tả nếu owner yêu cầu. Khi cần thiết kế hoặc truy cập
Claude Design, owner sẽ giao Claude hỗ trợ. Base hiện tại là `assets/Student Home Page Design/`
(`Student Home.dc.html`, `Auth.dc.html` và asset đi kèm), có thể điều chỉnh theo yêu cầu owner.

README phase ghi nguồn, màn hình/section/phiên bản/biến thể; sub-phase ghi bố cục, thông số, asset, trạng thái,
tương tác, tiêu chí đối chiếu và thay đổi so với base. Lưu ảnh/bản ghi tham chiếu bổ sung trong `references/`
của phase, liên kết asset nguồn cụ thể. Mục không áp dụng ghi lý do; đầu vào thiếu phải được đánh dấu và bổ sung.

Codex kiểm tra UI chạy thật với base cộng các thay đổi đã đặc tả, ghi bằng chứng và sai khác vào PROGRESS để
owner xác nhận UI; sau đó mới gắn API và bàn giao UAT theo ADR-0021. Khi có thay đổi, người đặc tả cập nhật
IMPLEMENT trước khi sửa UI tương ứng; không bắt buộc cập nhật HTML base hoặc chờ Claude nếu đã đủ đầu vào.

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
