# Phase 02: Khoá học → Giỏ hàng → Thanh toán QR

## Mục tiêu

Học viên duyệt khoá học theo gợi ý/danh mục, mở sheet khoá học để chọn lớp OPEN, thêm vào giỏ, xem giỏ hàng và bấm
Thanh toán để nhận mã QR PayOS của đơn hàng. Phase **dừng ở bước hiển thị mã QR**: không theo dõi kết quả thanh toán.

## Phạm vi

- Có: màn **Khoá học** (tab “Khoá học”): top bar Mindy + giỏ có badge, carousel “Gợi ý cho bạn”, “Danh mục” với chip
  và nút bộ lọc, lưới thẻ khoá học 6 thẻ/trang có phân trang, tab bar nổi chọn tab Khoá học.
- Có: sheet **Bộ lọc** (Hình thức; nhóm Sắp xếp ẩn theo Q11).
- Có: sheet **khoá học** (ảnh, mã · danh mục, mô tả, “Lớp đang mở” với nút “Chọn lớp”, giá, “Mua ngay”).
- Có: sheet **Giỏ hàng** (rỗng/có lớp, đổi giá, lớp không còn mua được, Xoá, tổng cộng, CTA Thanh toán).
- Có: màn **Thanh toán**: số tiền, đếm ngược hết hạn, mã QR, bảng thông tin chuyển khoản, ghi chú giữ nội dung.
- Có: nối điểm vào từ Phase 1 (tab Khoá học, nút giỏ, CTA “Khám phá khoá học”, `+` của Home) sang luồng mới.
- Có (sau owner duyệt UI): gắn API Catalog, Cart, Checkout `PAYOS`, tạo link PayOS ([2.6](PHASE_02_06_API_INTEGRATION.md)).
- Không có: poll trạng thái order/`PAID`, nút “Tôi đã thanh toán”, trang kết quả PayOS (§11.8), mở trang PayOS bằng
  trình duyệt/deep link ([ADR-0013](../../adr/ADR-0013-defer-google-oidc-payos-deeplink.md) còn Proposed), thanh toán
  `CASH`, “Đơn hàng của tôi”, tiếp tục đơn PENDING cũ, tìm kiếm, đánh giá, huỷ đơn/hoàn tiền.
- Không có: tab Lịch học, Thông báo, Tài khoản (giữ hành vi Phase 1: disabled kèm giải thích).

## Bàn giao thiết kế (Claude Code → Codex)

Theo [ADR-0019](../../adr/ADR-0019-claude-design-handoff-codex-ui.md). Khảo sát lại 2026-10-17 23:45 theo yêu cầu Q1.

| Nguồn | Vai trò | Tình trạng |
| --- | --- | --- |
| [Artifact Student Home](https://claude.ai/artifact/YMKY9dp3DFE9BQ69Er6rjD), version **`1792255829-893f`**, mục **2** (`section#t2`) | Màn Khoá học, bộ lọc, sheet khoá học “Lớp đang mở”, giỏ hàng, Thanh toán, top bar, tab bar — thông số chính xác | Owner publish lại; đọc và giải nén 2026-10-17 23:53. Thay version `1792222488-748f` |
| [Bản trích mã nguồn](references/source/courses-cart-payment-design.html) | Markup + script (dữ liệu, trạng thái, định dạng) của các màn trên | Trích lại 2026-10-17 23:53 từ version mới |
| [Ảnh màn Khoá học](references/claude-courses-catalog.png) | Đối chiếu trạng thái tab Khoá học | Owner gửi 2026-10-17 |
| [Ảnh sheet Giỏ hàng rỗng](references/claude-cart-sheet-empty.png) | Đối chiếu trạng thái giỏ rỗng | Owner gửi 2026-10-17 |
| [Ảnh màn Thanh toán QR](references/claude-payment-qr.png) | Đối chiếu Thanh toán | Owner gửi 2026-10-17 |
| [Ảnh sheet khoá học “Lớp đang mở”](references/claude-course-sheet-classes.png) | Đối chiếu sheet khoá học (Q2) | Owner gửi 2026-10-17; khớp trạng thái chưa chọn của version mới |
| [Bản ghi đối chiếu](references/DESIGN_SOURCE.md) | Ánh xạ token, sai khác, thay đổi giữa hai version | Cập nhật 2026-10-17 23:53 |

- Link `claude.ai/design/p/...` trả 403 (cần đăng nhập); owner publish lại artifact và Claude Code đọc bản đó.
  Toàn bộ thông số, kể cả sheet khoá học, lấy từ mã nguồn; không còn phần ước lượng.
- Không dựng viền máy, giờ 9:41, icon pin. Chữ trong artifact là “Nunito” cỡ gốc 15.

## Quyết định của owner (chat 2026-10-17)

Tất cả câu hỏi đã chốt; không còn câu hỏi mở.

| # | Vấn đề | Quyết định | Áp dụng |
| --- | --- | --- | --- |
| Q1 | Nguồn thiết kế | Lấy từ Claude Design → dùng artifact mục 2 + ảnh 4 như bảng trên | Toàn phase |
| Q2 | Thêm giỏ theo lớp | Như ảnh 4: sheet khoá học liệt kê “Lớp đang mở”, mỗi lớp có “Chọn lớp”; “Mua ngay” | [2.2](PHASE_02_02_CLASS_PICKER.md) |
| Q3 | Thông tin ngân hàng không có trong `PaymentDto` | Dùng **dữ liệu mock** của thiết kế, gom một chỗ, **dễ xoá** khi backend trả dữ liệu thật | [2.4](PHASE_02_04_PAYMENT_QR.md#dữ-liệu-mock-chuyển-khoản-q3) |
| Q4 | Thư viện QR | Duyệt [ADR-0025](../../adr/ADR-0025-qr-code-rendering.md) | 2.4 |
| Q5 | Sửa navigator | Duyệt [ADR-0024](../../adr/ADR-0024-phase-02-navigation-routes.md) | 2.5 |
| Q6 | Tab bar ở màn Thanh toán | Ẩn | 2.4 |
| Q7 | Back khi đơn còn hạn | Hộp thoại xác nhận | 2.4 |
| Q8 | `qrCode = null` | Trạng thái “Chưa có mã QR” + Thử lại, không mở trình duyệt | 2.4 |
| Q9 | Giỏ sau checkout | Theo contract BE cập nhật ([cart.md §11.1, §11.4](../../API_CONTRACT/cart.md), [ADR-0026](../../adr/ADR-0026-be-api-contract-source.md)): server xoá giỏ trong cùng transaction; refetch | 2.3, 2.6 |
| Q10 | Định dạng tiền | `1.500.000 VND` — thay quy tắc `Intl` currency ở [BUSINESS_RULES §7](../../BUSINESS_RULES.md#7-định-dạng-tiền-và-ngày-giờ) | Toàn app, kể cả Home Phase 1 |
| Q11 | Sắp xếp theo giá (API không hỗ trợ) | Ẩn nhóm “Sắp xếp” trong Bộ lọc tới khi backend có tham số; chỉ lọc “Hình thức” | 2.1 |
| Q12 | Mock ngân hàng ở bản phát hành | Chỉ gán mock khi `env.APP_ENV !== 'production'`; production ẩn 4 hàng mock, vẫn hiện QR thật, Khoá học, Số tiền | 2.4 |
| Q13 | Màu chưa có token | Duyệt [ADR-0027](../../adr/ADR-0027-phase-02-design-tokens.md): thêm `ember`, `ribbon`, `ribbon-deep`, `ribbon-fold` | 2.1, 2.4 |
| Q14 | Thay đổi Home trong artifact mới (mũi tên trên thẻ, carousel giới thiệu tràn mép) | Áp dụng cho UI Phase 2 (mũi tên qua `CourseTile` ở 2.1.1; carousel đã tràn mép từ Phase 1, đối chiếu ở 2.5) | 2.1, 2.5 |
| Q15 | Sheet danh sách lớp dạng gọn (`sheet = 'classes'`) | Bỏ, không triển khai | 2.2 |

## Các mốc trong phase

Theo [ADR-0021](../../adr/ADR-0021-per-phase-ui-approval-api-uat.md):

| Mốc | Phạm vi / bằng chứng | Trạng thái |
| --- | --- | --- |
| Thiết kế và triển khai UI | 2.1–2.5, fixture/callback, ảnh đối chiếu | Done |
| Owner xác nhận UI | @Bero: “UI tôi approve”, 2026-10-18 02:00 (+07:00); [PROGRESS](../../PROGRESS/PHASE_02_COURSE_CHECKOUT/README.md) | Done |
| Gắn API | [2.6](PHASE_02_06_API_INTEGRATION.md): code/test/API thật đã có; giới hạn kiểm thử tại API_REVIEW | Done |
| Owner UAT | [2.99](PHASE_02_99_User_Acceptance.md): @Bero duyệt lại “UAT phase 2 approve”, 2026-10-18 21:34 (+07:00) | Done |

Phase **Done**. Sau khi sửa E2E thiếu APP_ID và chạy9/9flow PASS, owner duyệt lại trực tiếp: “UAT phase 2 approve”, ghi nhận2026-10-18 21:34 (+07:00).
Code/test API và Android/backend có bằng chứng tại [API_REVIEW](../../PROGRESS/PHASE_02_COURSE_CHECKOUT/API_REVIEW.md).
Các giới hạn kiểm thử đã ghi được giữ nguyên; xác nhận UAT không bổ sung bằng chứng riêng cho quét ngân hàng/sandbox hoặc iOS.

## Phụ thuộc

- Phase: [PHASE_00_FOUNDATION](../PHASE_00_FOUNDATION/README.md) (Done), [PHASE_01_AUTH_HOME_UI](../PHASE_01_AUTH_HOME_UI/README.md)
  (Done: phiên STUDENT, Home, `CourseTile`, `HomeTabBar`, header logo).
- ADR: [ADR-0024](../../adr/ADR-0024-phase-02-navigation-routes.md) Accepted, [ADR-0025](../../adr/ADR-0025-qr-code-rendering.md)
  Accepted, [ADR-0027](../../adr/ADR-0027-phase-02-design-tokens.md) Accepted.
- API: [catalog.md §8](../../API_CONTRACT/catalog.md#8-catalog-public), [cart.md §11.1–11.4](../../API_CONTRACT/cart.md),
  [orders-payment.md §11.6–11.7](../../API_CONTRACT/orders-payment.md). Nguồn contract: [ADR-0026](../../adr/ADR-0026-be-api-contract-source.md).
- Business rule: [BUSINESS_RULES.md §3](../../BUSINESS_RULES.md#3-catalog-giỏ-hàng-thanh-toán-student), §7,
  [ADR-0011](../../adr/ADR-0011-no-optimistic-update.md) (không optimistic cho giỏ/thanh toán).
- Thư viện đã có: `@gorhom/bottom-sheet`, `@react-native-clipboard/clipboard`, `react-native-svg`, `react-native-reanimated`.

## Sub-phase

| # | File | Bước | Trạng thái |
| --- | --- | --- | --- |
| 2.1 | [Màn Khoá học](PHASE_02_01_COURSE_CATALOG.md) | UI | Done |
| 2.2 | [Sheet khoá học và chọn lớp](PHASE_02_02_CLASS_PICKER.md) | UI | Done |
| 2.3 | [Sheet Giỏ hàng](PHASE_02_03_CART_SHEET.md) | UI | Done |
| 2.4 | [Màn Thanh toán QR](PHASE_02_04_PAYMENT_QR.md) | UI | Done |
| 2.5 | [Điều hướng và kiểm thử luồng UI](PHASE_02_05_NAVIGATION.md) | UI | Done |
| 2.6 | [Tích hợp API](PHASE_02_06_API_INTEGRATION.md) | API | Done |
| 2.99 | [User Acceptance](PHASE_02_99_User_Acceptance.md) | UAT | Done — owner duyệt lại2026-10-18 21:34 (+07:00) |

Thứ tự: 2.1 → 2.2 → 2.3 → 2.4 → 2.5 → **owner xác nhận UI** → 2.6 → Dọn dẹp → Kiểm tra → 2.99.
Token ADR-0027 thêm ở task 2.1.1 (trước khi dùng ở 2.1.2 và 2.4.1); không viết hex trong component.

## Tiêu chí nghiệm thu màn hình

- [ ] Bám thông số artifact mục 2 và ảnh 4; sai khác có lý do trong PROGRESS.
- [x] UI chạy thật đã đối chiếu với ảnh/đặc tả; PROGRESS có bằng chứng, sai khác và phần chưa kiểm tra.
- [x] Owner đã xác nhận UI, có bằng chứng trong PROGRESS.
- [x] API Catalog/Cart/Checkout/PayOS link tích hợp và kiểm thử theo contract; không gọi API PLANNED. Quét app ngân hàng/sandbox chưa xác minh, ghi tại API_REVIEW.
- [x] Màn Khoá học, sheet khoá học, sheet giỏ, màn Thanh toán đủ loading / empty / error / success.
- [x] Không optimistic update giỏ/thanh toán; giá luôn từ server; không gửi giá lên server.
- [x] Tiền hiển thị dạng `1.500.000 VND` qua một hàm dùng chung.
- [x] Mock chuyển khoản nằm trong đúng một file, xoá file + một import là gỡ hết; không mock nào khác lọt vào production.
- [x] Maestro: `e2e/flows/courses-browse.yaml`, `e2e/flows/cart-checkout-qr.yaml`.
- [x] Lint, format, type-check, Jest 232/232, Maestro Android 9/9 và API thật PASS; iOS chưa có môi trường.

## Bàn giao UI 2026-10-18

UI 2.1–2.5 **Done — owner đã xác nhận “UI tôi approve” trong chat 2026-10-18**. Xem [ảnh, hướng dẫn và sai khác](../../PROGRESS/PHASE_02_COURSE_CHECKOUT/UI_REVIEW.md), [kiểm tra cuối và xác nhận UAT](../../PROGRESS/PHASE_02_COURSE_CHECKOUT/README.md). API2.6 đã tích hợp; Phase2 và UAT2.99 Done theo owner duyệt lại lúc21:34 ngày2026-10-18, sau sửa E2E. Giới hạn bằng chứng giữ tại API_REVIEW.
