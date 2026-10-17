# Phase 01: UI Login, Register và Homepage

## Mục tiêu

Xây dựng UI React Native cho đăng nhập, đăng ký và trang chủ học viên từ thiết kế Claude Design do owner cung cấp.
Phase này gồm UI, validation, tương tác và tích hợp API Auth/Home theo1.6; nghiệm thu UI không thay nghiệm thu backend hoặc UAT.

## Phạm vi

- Có: bố cục Welcome của bộ Auth, Login, Register, trạng thái kiểm tra email, Student Home, điều hướng giữa các
  màn thuộc phạm vi, accessibility, i18n và kiểm thử UI bằng dữ liệu kiểm soát được.
- Có: Auth API, bootstrap/role guard/reset phiên và dữ liệu Catalog/lịch Student theo ADR-0022; phạm vi kiểm tra còn lại ở1.6.
- Có: chuyển thiết kế HTML sang component React Native, tái sử dụng hình ảnh/mascot gốc khi lấy được asset.
- Không có: triển khai backend, Google OIDC, nhận link xác thực email trên mobile, quên/đổi mật khẩu, thanh toán,
  giỏ hàng, chi tiết khoá học, dashboard Mentor/Manager/Admin hoặc tiến độ học thật.
- Không nhúng nguyên HTML trong WebView để thay màn hình native. Fixture chỉ ở test/preview riêng, không tạo
  phiên đăng nhập giả hoặc đưa dữ liệu mẫu vào luồng production.

Theo yêu cầu trực tiếp của owner, **Phase 1 gom ba màn hình**. Đây là phạm vi riêng của yêu cầu này; không thay
quy ước chung mỗi phase một màn hình trong [quy trình](../../README.md#b3-cấu-trúc-phase).

## Nguồn thiết kế và mức độ xác nhận

| Nguồn                                                                      | Vai trò                                               | Tình trạng                                           |
| -------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| [Artifact Auth](https://claude.ai/artifact/Us4jQKCMwnxgvieMGTbdaG)         | Welcome, Login, Register                              | Đã mở và kiểm tra chuyển giữa ba màn ngày 2026-10-17 |
| [Artifact Student Home](https://claude.ai/artifact/YMKY9dp3DFE9BQ69Er6rjD) | Homepage; **bản 2, biến thể 2a**                      | Đã xác nhận mục `2` / `2a`; không lấy `1a` hoặc `1b` |
| [Bản ghi đối chiếu thiết kế](references/DESIGN_SOURCE.md)                  | Bố cục, ảnh bằng chứng, dữ liệu và sai khác cần xử lý | Đã khảo sát; chưa phải kết quả triển khai app        |
| [Bản trích mã nguồn](references/source/)                                   | Thông số inline style chính xác, dữ liệu slide/ghi chú | Đọc lại 2026-10-17 16:11, version không đổi          |
| [Ảnh owner cung cấp](references/claude-auth-welcome.png)                   | Welcome                                               | Đối chiếu cùng artifact Auth                         |

Ảnh Welcome có mascot ếch đội mũ tốt nghiệp bên laptop/sách, nền pastel xanh chuyển sang màu ấm, hình tròn trang trí,
khối nội dung trắng bo góc trên, CTA dạng pill và khoảng trắng rộng. Dùng nhận diện này cho bộ Auth; không tự suy
ra bố cục Student Home từ ảnh Welcome. Không dựng viền điện thoại, giờ 9:41 hoặc icon pin giả vào UI app.

Hai link `/design/p/...` ban đầu yêu cầu đăng nhập; các artifact public mới do owner cung cấp đã đọc được,
không còn chặn khảo sát layout. Tiêu đề ngoài của cả hai artifact đều là “Student Home Page Design”; phân biệt
bằng URL và nội dung. Auth không có nhãn bản 2 hiển thị; yêu cầu **bản 2** được xác nhận cho Home.

Home 2a có thứ tự: hero mascot → buổi học tiếp theo → bốn khoá học (lưới 2×2) → CTA khám phá → carousel giới thiệu
ba slide → khối compiler/terminal minh hoạ → carousel ghi chú ba mục → footer; tab bar năm mục cố định ở đáy.
Chi tiết ở [1.4](PHASE_01_04_HOMEPAGE.md). Khi chuyển sang app thật, áp dụng bảng xử lý sau:

| Chi tiết trong thiết kế                      | Quyết định cho Phase 1                                                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Nút Google như ảnh Welcome                   | Ẩn khỏi luồng dùng thật; chưa có thoả thuận deep link/cookie mobile                                                 |
| Quên mật khẩu                                | Có trong Login gốc; ẩn trong app vì API PLANNED                                                                     |
| Ghi nhớ đăng nhập                            | Có trong Login gốc; bỏ trong app vì thời hạn cookie do backend quyết định, không lưu password                       |
| Tên hiển thị và điện thoại Register          | Bản gốc không có; thêm tên bắt buộc và điện thoại tuỳ chọn theo contract                                            |
| Checkbox Điều khoản & Chính sách             | Có trong Register gốc; không tự tạo URL/nội dung pháp lý; ẩn tới khi có tài liệu thật                               |
| Khoá học nổi bật, ngày khai giảng và dấu `+` | Không có API xếp hạng nổi bật; field lịch lấy từ lớp OPEN, không lấy từ CourseDto; `+` không tự thêm course vào giỏ |
| Compiler và terminal kết quả                 | UI minh hoạ, không chạy code/chấm bài thật hoặc dựng API compiler                                                   |
| Footer hỗ trợ và tuyên bố marketing          | Thông tin mẫu chưa xác nhận; không phát hành số hotline/email hoặc cam kết từ fixture                               |
| CTA đi sang màn chưa triển khai              | Callback có kiểu trong preview; trong app ẩn hoặc disabled kèm giải thích                                           |

## Phụ thuộc và điều kiện triển khai

- [Phase 0](../PHASE_00_FOUNDATION/README.md) còn `Blocked`. Viết spec được tiếp tục; không tự coi Phase 0 đã nghiệm thu.
- Owner đã duyệt [ADR-0018](../../adr/ADR-0018-phase-01-ui-foundation-exception.md) ngày 2026-10-17:
  cho phép triển khai UI Phase 1 trước khi Foundation hoàn tất UAT; không coi Phase 0 đã nghiệm thu.
- ADR-0018 cho phép sửa `src/navigation/index.tsx` và bổ sung component nền tảng đúng phạm vi;
  [ARCHITECTURE](../../ARCHITECTURE.md#file-hạ-tầng-bị-khoá) đã cập nhật ngoại lệ. Không thêm thư viện.
- Asset gốc (mascot, ảnh slide) đã lấy từ bundle artifact ngày 2026-10-17, lưu ở
  [references/assets/](references/assets/). Mascot bản đồ/sách có độ phân giải thấp; ảnh học viên chờ owner xác nhận quyền dùng.
- Nguồn nghiệp vụ: [Auth](../../API_CONTRACT/auth.md), [Catalog](../../API_CONTRACT/catalog.md),
  [quy ước API](../../API_CONTRACT/README.md), [Business Rules](../../BUSINESS_RULES.md).
- Quy chuẩn: [styling](../../guides/styling.md), [UX](../../guides/ux.md),
  [hình ảnh/motion](../../guides/visual-and-motion.md), [testing](../../guides/testing.md).

## Các mốc trong Phase 1

Theo [ADR-0021](../../adr/ADR-0021-per-phase-ui-approval-api-uat.md), bốn mốc thực hiện trong **chính Phase 1**:

| Mốc | Trạng thái | Ghi nhận |
| --- | --- | --- |
| Thiết kế và triển khai UI | Done | Owner duyệt UI ngày2026-10-17, gồm các chỉnh sửa trong chat |
| Owner xác nhận UI | Done | Owner: “UI phase 1 đã được approve”; xem PROGRESS |
| Gắn API | Done | Code đã nối; owner duyệt UAT Phase 1 ngày 2026-10-17, giới hạn kiểm thử giữ trong PROGRESS |
| Owner UAT (1.99) | Done | Owner: “Nghiệm thu UAT phase được approve”, xác nhận phạm vi “phase 1” trong chat ngày 2026-10-17 |

Các file1.1–1.5 hiện đặc tả phần UI. Phạm vi UI-only đã viết không đồng nghĩa Phase1 hoàn tất sau duyệt UI:
bước gắn API sẽ được đặc tả và triển khai trong cùng phase theo contract/phụ thuộc, không tách thành phase khác.
Owner đã xác nhận UI đạt trong chat. Chưa đóng blocker Foundation; [ADR-0022](../../adr/ADR-0022-phase-01-api-foundation-exception.md) đã Accepted để mở rộng ngoại lệ UI-only của ADR-0018 cho API.
Bước API được đặc tả tại [1.6](PHASE_01_06_API_INTEGRATION.md); Auth/Home production đã được nối. Owner đã duyệt UAT Phase 1; các giới hạn bằng chứng native/backend được giữ trong PROGRESS.

## Sub-phase

Trạng thái kế hoạch: **Done — owner đã duyệt UAT Phase 1 trong chat ngày 2026-10-17**. Xác nhận này không bổ sung kết quả kiểm thử cho các ca chưa chạy; xem nhật ký cấp phase.
Bản UI 2026-10-17 15:46 lệch thiết kế ở nhiều điểm (gradient/bố cục Auth, hero, thẻ khoá học, ghi chú, footer,
tab bar). Claude Code đã đọc lại mã nguồn hai artifact và bổ sung mục **“Đặc tả UI từ Claude Design”** có thông số
chính xác, ánh xạ token và bảng sai khác vào [1.1](PHASE_01_01_DESIGN_FOUNDATION.md), [1.2](PHASE_01_02_LOGIN.md),
[1.3](PHASE_01_03_REGISTER.md), [1.4](PHASE_01_04_HOMEPAGE.md); bản trích nguồn ở [references/source/](references/source/).
Codex sửa UI theo bàn giao, giữ logic/test đã có (validation, callback, trạng thái) trừ chỗ đặc tả đổi.
Owner đã chốt D1–D4 (xem [1.1](PHASE_01_01_DESIGN_FOUNDATION.md#quyết-định-owner-đã-chốt-2026-10-17-2034-chat)): Home dùng
forest như thiết kế, thêm token màu ([ADR-0020](../../adr/ADR-0020-phase-01-design-tokens-home-region.md), đã sửa
`global.css`), khung ảnh slide trống thay được, copy cam kết và email/hotline được duyệt.
Bằng chứng bản cũ giữ trong [PROGRESS](../../PROGRESS/PHASE_01_AUTH_HOME_UI/README.md) để so sánh.

| #    | File                                                          | Trạng thái |
| ---- | ------------------------------------------------------------- | ---------- |
| 1.1  | [Thiết kế Claude và nền UI](PHASE_01_01_DESIGN_FOUNDATION.md) | Done |
| 1.2  | [Welcome và Login](PHASE_01_02_LOGIN.md)                      | Done |
| 1.3  | [Register và kiểm tra email](PHASE_01_03_REGISTER.md)         | Done |
| 1.4  | [Student Homepage bản 2](PHASE_01_04_HOMEPAGE.md)             | Done |
| 1.5  | [Điều hướng và kiểm thử luồng UI](PHASE_01_05_NAVIGATION.md)  | Done |
| 1.6  | [Tích hợp API](PHASE_01_06_API_INTEGRATION.md) | Done |
| 1.99 | [User Acceptance](PHASE_01_99_User_Acceptance.md)             | Done |

Thực hiện task/sub-phase tuần tự theo TDD: Red → Green → Refactor → AI tự kiểm tra, ghi PROGRESS.
Sau phần UI1.1–1.5: **owner xác nhận UI → đặc tả và gắn API của Phase1 → Dọn dẹp → Kiểm tra → 1.99 User Acceptance**.
Chỉ owner xác nhận UAT đạt mới chuyển phase `Done`.

## Tiêu chí nghiệm thu chung

- [ ] UI bàn giao được đối chiếu với Auth và **Student Home 2a**, dùng nguồn/ảnh đã khảo sát trong references.
- [ ] UI native bám bố cục, mascot, typography, khoảng cách, bo góc và thứ bậc CTA từ Claude; thích nghi safe area/bàn phím.
- [ ] Light mode, Nunito, NativeWind/token hiện có; text qua i18n vi-VN/en-EN, không trộn component UI rn-kit/nativecn.
- [ ] Form có idle/validation/pending/error/success; vùng dữ liệu Home có loading/empty/error/success.
- [ ] Chạm tối thiểu 44×44, label đọc màn hình, chữ hệ thống lớn, Reduce Motion; không che nút bởi bàn phím.
- [ ] Không tự tạo API, session, role hoặc số liệu học tập; dữ liệu mẫu chỉ dùng trong test/preview.
- [ ] Mọi CTA hoạt động có chủ đích, không dẫn tới route chưa tồn tại; Student Home không làm đích mặc định cho staff.
- [ ] Lint, format, type-check, Jest và Maestro Android qua; iOS ghi rõ nếu chưa có môi trường.
- [ ] PROGRESS có bằng chứng AI và giới hạn; owner thực hiện UAT theo file 1.99.


