# Bàn giao duyệt giao diện Phase 2

Phạm vi: UI 2.1–2.5 theo artifact `1792255829-893f`. Đây là mốc xác nhận UI theo ADR-0021; API 2.6 và UAT 2.99 chưa bắt đầu.

## Mở bản xem thử

Trên app Android debug: **Xem thử UI (development) → Khoá học · Giỏ · QR**.

1. Xem gợi ý, chọn danh mục, mở Bộ lọc, đổi Online/Offline và đặt lại.
2. Cuộn cuối lưới, chuyển trang và chạm khoá học/mũi tên.
3. Chọn lớp A, đổi sang B, bấm lại để bỏ chọn: giỏ/badge không đổi. Chọn B rồi bấm icon giỏ cạnh Mua ngay: toast, badge 1, modal còn mở. Chọn A rồi Mua ngay: giỏ chỉ còn A của khoá này. Lớp hết chỗ không chọn được.
4. Bấm Mua ngay: đã có lớp thì mở giỏ; chưa có thì thêm lớp còn chỗ khởi giảng sớm nhất rồi mở giỏ.
5. Xoá lớp hoặc bấm Thanh toán; chờ QR mẫu, thử sao chép và Back → Ở lại/Rời đi.
6. Từ tab Home, thử mũi tên khoá học, giỏ và Khám phá khoá học. Các điểm này mở cùng luồng sheet.
7. Nút UI mở công cụ xem thử loading/empty/error/success cho Home hoặc catalog. Công cụ được ẩn trên màn QR.

QR trong preview mã hoá chuỗi `MINDY-PREVIEW-ONLY-NOT-A-BANK-PAYMENT`, không phải lệnh chuyển khoản. Dữ liệu giỏ/đơn chỉ nằm trong bộ nhớ preview, không gọi API nghiệp vụ hay tạo phiên học viên. Route production đã đăng ký và bảo vệ theo STUDENT; adapter Phase 2 chờ duyệt UI, hiện chưa tải catalog/giỏ/order thật.

## Ảnh đối chiếu

Nguồn chuẩn: [bàn giao thiết kế](../../IMPLEMENT/PHASE_02_COURSE_CHECKOUT/references/DESIGN_SOURCE.md). Các ảnh được lưu ở thư mục [evidence](evidence/).

- [Catalog](evidence/catalog.png), [Bộ lọc](evidence/filter.png), [Sheet khoá học](evidence/course-sheet.png).
- [Giỏ rỗng](evidence/cart-empty.png), [Giỏ có lớp](evidence/cart-filled.png), [Thanh toán QR](evidence/payment-qr.png).
- [Loading](evidence/catalog-loading.png), [Empty](evidence/catalog-empty.png), [Error](evidence/catalog-error.png).
- [QR ở 320dp / chữ 140%](evidence/compact-payment-qr.png), [Giỏ ở 320dp / chữ 140%](evidence/compact-cart-filled.png).
- [Home: mũi tên](evidence/home-course-arrow.png), [Home: carousel](evidence/home-carousel.png).

## Sai khác có chủ đích và giới hạn

- Ảnh owner dùng khung điện thoại 390px; Android kiểm tra Pixel 8 khoảng 411dp. Không dựng viền máy hoặc giờ/pin giả. Font 900 dùng Nunito ExtraBold đã cài; bóng trên Android chỉ xấp xỉ CSS.
- Mũi tên thẻ thay nút “+” theo nguồn mới; tiền dùng `1.500.000 VND` theo Q10. Hình khoá học null dùng sọc, không có chữ placeholder “ảnh khoá học”.
- Theo yêu cầu owner ngày 18/10: danh sách lớp có thẻ bọc chung, viewport bằng hai lớp đầu; lớp thứ ba trở đi cuộn bên trong. Giá/Mua ngay nằm ngoài vùng cuộn lớp. Chiều cao dựa trên đo layout thật.
- Giỏ có dòng lớp/hình thức/ngày, giá cũ và cảnh báo không mua được theo contract, dù ảnh thiết kế không có các trường hợp này.
- QR là mã được mã hoá thật từ chuỗi mẫu, thay hoạ tiết minh hoạ của thiết kế. Tab bar ẩn theo Q6. Không có poll thanh toán, xác nhận đã trả tiền hoặc mở trình duyệt PayOS.
- Thông tin ngân hàng mẫu nằm trong một file và một import; chỉ gán ngoài production. Unit test xác nhận production nhận `bankInfo=null`, UI chỉ giữ Khoá học/Số tiền.
- Kiểm thử API thật, giá/chỗ ngồi từ backend, quét QR PayOS qua app ngân hàng và UAT cuối phase vẫn thuộc 2.6/2.99.
- Kiểm tra bổ sung 320dp / chữ 140%: chọn lớp → giỏ → QR → Back/Ở lại → sao chép/toast → Rời đi → giỏ rỗng đã PASS. Đã sửa skeleton co nhỏ, scroll bị reset khi pending, mô tả cắt thiếu Xem thêm và toast nằm ngoài viewport; các ca Red được giữ trong raw evidence.
- CTA Mua ngay dùng chữ 16 của Button dùng chung (nguồn 15); cần owner đối chiếu ở mốc duyệt UI. Màu chữ CTA đã chỉnh canvas và disabled opacity 0.6 tại nơi dùng, không sửa UI kit bị khoá.
- iOS chưa chạy vì môi trường Windows. TalkBack đọc thực tế và cài đặt Reduce Motion trên thiết bị chưa có bằng chứng kiểm tra thủ công; component đã có nhãn/trạng thái accessibility, vùng chạm và nhánh Reduce Motion. Đồng hồ dựa vào giờ máy, có thể lệch so với server.

Kết quả kiểm tra cuối, giới hạn còn lại và xác nhận của owner được ghi thêm trong [nhật ký phase](README.md).

## Cập nhật carousel 2026-10-18

Theo yêu cầu trực tiếp của owner, cả ba carousel (Home giới thiệu, Home về Mindy, gợi ý khoá học) tự chuyển mục kế tiếp theo thứ tự trái → phải mỗi 3 giây, lặp lại sau mục cuối. Chạm chấm/vuốt đặt lại thời gian chờ. App ở nền hoặc đang kéo thì tạm dừng; Reduce Motion vẫn tự chuyển nhưng bỏ hiệu ứng trượt. Đã kiểm tra Android bằng flow carousel-autoplay.yaml.


## Điều chỉnh danh sách lớp theo owner — 18/10

Thẻ chung bo góc 20dp, viền line, nền soft, padding 10dp. Vùng cuộn riêng hiển thị hai lớp; tối đa hai lớp không bật cuộn nội bộ. [Ảnh chạy thật hai lớp](evidence/class-list-two-visible.png). Không thay đổi chọn/bỏ lớp và Mua ngay.


Đã kiểm tra cuối: 168 tests và lint/format/type-check PASS; Android class-scroll + checkout 2/2 PASS. [Ảnh cuộn tới lớp thứ ba](evidence/class-list-third-scrolled.png).


## Cố định modal theo owner — 18/10

Modal khoá học cố định 94% màn hình, tắt cuộn toàn modal và kéo tay nắm/nội dung. Chỉ vùng danh sách lớp còn cuộn. Giá/Mua ngay căn đáy; đóng bằng nền mờ hoặc Back. [Ảnh sau vuốt vùng tiêu đề](evidence/course-modal-fixed.png). Android đã kiểm tra cuộn lớp và checkout; chưa kiểm tra lại chữ lớn/320dp ở chế độ cố định này.


## Hạ tab, noti trên và thu gọn theo owner — 18/10

Bản mới thay khung cố định 94% bằng khung vừa nội dung (tối đa 94%), vẫn không cuộn tổng hoặc kéo modal. Bỏ khoảng trắng giữa danh sách và giá. Noti tạm overlay đầu modal; owner sẽ tạo component chung sau. Thanh tab Home/Khoá học hạ 12dp (bottom=max(safeAreaBottom−12,0)); catalog giảm đệm cuối 20dp. Các entry/ảnh cố định 94% phía trên là lịch sử, bản mới theo mục này.


[Ảnh noti ở đầu modal, bỏ khoảng trắng dư](evidence/course-modal-top-notice.png). Tổng Jest 168/168 PASS, lint/format/type-check PASS; Android chọn lớp/noti/cuộn nội bộ PASS.


[Ảnh thanh tab hạ thấp và phân trang bấm được](evidence/courses-lowered-tabs.png); Android courses-browse rerun PASS.


Điều chỉnh mới nhất: giảm đệm dưới modal khoá học 32→8dp cộng safe area, giảm chiều cao 24dp. [Ảnh modal gọn hơn](evidence/compact-modal-bottom.png); Android cuộn/chọn lớp/noti/CTA PASS.


## Chọn tạm và icon giỏ riêng theo owner — 18/10

Chọn/bỏ/đổi lớp chỉ đổi lựa chọn tạm. Icon giỏ 50dp cạnh Mua ngay xác nhận thêm và giữ modal; Mua ngay xác nhận thêm rồi mở giỏ. Cả hai cần chọn lớp còn chỗ. Giỏ giữ một lớp mỗi khoá; đổi lớp chỉ được lưu khi bấm một trong hai nút. Mở lại modal lấy lựa chọn từ giỏ, không giữ bản nháp đã đóng. Các mô tả tự thêm giỏ khi Chọn lớp phía trên đã được thay bởi hành vi này.


[Ảnh nút icon giỏ cạnh Mua ngay](evidence/course-modal-add-to-cart.png). Red → Green 7 test hook và integration phân biệt chọn tạm/giỏ, thay lớp cùng khoá, giữ lớp cũ khi thêm lỗi; tổng Jest 173/173 PASS. ESLint, Prettier và TypeScript PASS. Android class-scroll + chọn tạm + thêm giỏ PASS.


Android kiểm tra cuối hai flow chọn/thêm giỏ và Mua ngay/checkout: 2/2 PASS (evidence/draft-class-selection).


## Owner đã duyệt UI — 2026-10-18 02:00 (+07:00)

@Bero xác nhận trong chat: **“UI tôi approve”**. Phạm vi là bản UI hiện tại, gồm các điều chỉnh trực tiếp đã ghi ở trên. Các dòng “chờ owner xác nhận UI” ở phần trước là lịch sử và đã được thay bởi xác nhận này. API 2.6/UAT 2.99 chưa hoàn tất; chuẩn bị rà đặc tả bước API.


## API đã được tích hợp — 2026-10-18

Production đã dùng Catalog/Cart/Checkout/PayOS thật; các mô tả production placeholder/API Todo trước đó là lịch sử. Preview vẫn fixture. Bằng chứng và giới hạn hiện tại tại [API_REVIEW](API_REVIEW.md). Phase In review — chờ owner UAT 2.99; không cần duyệt UI lại.


## Modal detail theo ảnh owner — 2026-10-18

Hero 8:5 với gradient tối, mã/danh mục vàng và tiêu đề trắng trong ảnh; mô tả dưới ảnh; các thẻ lớp gọn, bỏ phần viền/nền ngoài. Giữ icon giỏ, VND, chọn tạm và cuộn hai lớp như hành vi đã chốt. [Ảnh Android mới](evidence/course-detail-redesign.png). Ảnh UI trước mục này là phiên bản cũ; API không đổi.


## Ảnh sát hai mép, không bo — 2026-10-18

Theo owner bổ sung, ảnh hero đã full width cả trái/phải và bỏ bo góc ảnh. [Ảnh Android hiện tại](evidence/course-hero-edge-to-edge.png). Dùng width cửa sổ tường minh để gradient/SVG render đúng; không dùng margin âm hai bên với width auto. Nội dung dưới và chức năng giữ nguyên.

## Khối trắng và mô tả dưới hero, danh sách 2,5 lớp — 2026-10-18

Theo ảnh owner mới nhất: khối trắng full width bo góc trên chồng đáy ảnh, mô tả đứng đầu trước Lớp đang mở và không co mất; danh sách hiển thị hai thẻ cộng nửa thẻ thứ ba, cuộn nội bộ. Giữ icon giỏ/Mua ngay và ảnh không bo sát hai mép. [Ảnh Android hiện tại](evidence/course-detail-description.png). Android class-scroll/chọn/thêm giỏ PASS, Jest13/13 và lint/format/type-check PASS. Bản hai lớp trong các mục cũ được thay bằng yêu cầu2,5 lớp này. API không đổi; phase vẫn chờ owner UAT.

Android checkout kiểm tra cuối PASS (evidence/course-detail-description-checkout); hai flow riêng đều đạt.


## Giữ layout khi chọn lớp — 2026-10-18

Tên lớp/badge có hàng riêng rộng toàn thẻ; nút104dp không co giữa Chọn lớp/Đã chọn/loading/hết chỗ. Font lớn giữ bố cục dọc, nút toàn hàng. Nhãn trạng thái không còn chiếm thêm chỗ của title. Jest13/13, lint/type/format PASS; chưa xác nhận native geometry trước/sau vì máy đang được đổi modal trong lúc kiểm tra. Phase tiếp tục In review.

## Owner duyệt UAT và đóng Phase 2 — 2026-10-18 19:21 (+07:00)

@Bero xác nhận trong chat: **“UAT phase 2 được approve”**. Phase 2 và 2.99 **Done**; các mục chờ UAT trước đây là lịch sử. Chi tiết và giới hạn bằng chứng giữ tại README/API_REVIEW.

### 2026-10-18 19:26 (+07:00) · @Bero
- Phase: Mở lại Phase2/UAT2.99 và sửa E2E thiếu APP_ID
- Trạng thái: In review — chờ owner UAT
- Đã làm: Owner rút xác nhận trước: “Test e2e đã fail (tôi chưa check kĩ, chuyển trạng thái phase 2 tiếp tục chờ UAT, đồng thời fix e2e)”. Phase2 và2.99 trở lại In review trong roadmap/README/UAT. Giữ xác nhận UI và code API, không tự coi test xanh là UAT. Lệnh package hiện chỉ maestro test e2e/flows, cả9flow dùng APP_ID chưa có default nên launch package undefined. Thêm fallback APP_ID || com.mindymobile trong17flow (mặc định9flow,API/accessibility/visual), vẫn cho CLI -e override. Cập nhật spec2.5 và CONTRIBUTING, giữ script package và hạ tầng không đổi.
- Test: Đang chạy npm run test:e2e không truyền APP_ID trên Android, output tại evidence/e2e-default-app-id. Kiểm tra định dạng phát hiện cần quote biểu thức YAML theo Prettier, sẽ chuẩn hoá sau lượt chạy.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Entry Done19:21 là lịch sử và không còn trạng thái hiện tại. UAT mới chưa được owner xác nhận. Bộ mặc định dùng preview và clearState; không checkout API thật trong lượt hồi quy này.

### 2026-10-18 19:34 (+07:00) · @Bero
- Phase: Hoàn tất sửa E2E default APP_ID, tiếp tục chờ UAT
- Trạng thái: In review — chờ owner UAT
- Đã làm: Cả17flow dùng appId: APP_ID || com.mindymobile; lệnh npm run test:e2e không cần -e nữa. Giá trị CLI vẫn được ưu tiên. Giữ package script, không sửa hạ tầng/thêm dependency; CONTRIBUTING đã hướng dẫn lệnh mặc định và cách ghi đè. Roadmap/README/UAT đều thể hiện Phase2 chưa được duyệt lại.
- Test: Chạy npm run test:e2e không truyền APP_ID (chỉ thêm thư mục lưu bằng chứng): 9/9 Flows Passed trong7m12s. Bao gồm api-health, app-launch, auth-ui-login/register, carousel-autoplay, cart-checkout-qr, course-class-scroll (cả kéo handle đóng), courses-browse, student-home-ui. Raw evidence/e2e-default-app-id; summary.json ghi từng flow. Smoke app-launch với -e APP_ID=com.mindymobile cũng PASS, evidence/e2e-explicit-app-id. Prettier17YAML và git diff --check PASS. Không đổi TypeScript/runtime nên không chạy lại Jest/lint/type-check trong lượt chỉ sửa YAML/docs này.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Đính chính entry19:26: Prettier chỉ chuẩn hoá line endings/định dạng, không cần quote biểu thức appId thêm. Mọi kiểm tra trên Android, chưa iOS. API/accessibility/visual ngoài9flow chỉ được cập nhật fallback, chưa chạy lại. Test đạt không thay owner UAT; Phase2/2.99 giữ In review.

### 2026-10-18 21:34 (+07:00) · @Bero
- Phase: Owner duyệt lại UAT2.99 và đóng Phase2 sau sửa E2E
- Trạng thái: Done
- Đã làm: Owner xác nhận trực tiếp “UAT phase 2 approve”. Đây là xác nhận mới sau lần mở lại19:25 và sửa APP_ID. Chuyển Phase2 và2.99 sang Done ở roadmap, README phase và tài liệu UAT. Lịch sử PROGRESS giữ nguyên, các entry chờ UAT trước đây được thay bởi trạng thái hiện tại này.
- Test: Chỉ cập nhật tài liệu, không chạy lại test. Kế thừa E2E mặc định9/9 PASS7m12s, smoke APP_ID thủ công PASS, kiểm tra API/QR thật và hồi quy ADR-0028 đã ghi. Không suy ra bằng chứng mới cho iOS/quét ngân hàng/sandbox từ xác nhận UAT chung.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Phase2 hoàn tất theo owner, không phải AI tự duyệt. Giữ giới hạn bằng chứng tại API_REVIEW. Không bắt đầu phase mới khi chưa có yêu cầu.
