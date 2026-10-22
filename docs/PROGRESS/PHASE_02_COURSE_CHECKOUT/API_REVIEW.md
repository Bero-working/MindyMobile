# Bàn giao API Phase 2

UI đã được @Bero duyệt trong chat (“UI tôi approve”), đặc tả 2.6 đã được Claude Code chốt. Production dùng API thật; preview development giữ fixture để đối chiếu UI.

## Hành vi đã nối

- Catalog: danh mục active, lọc Online/Offline, 6 khoá/trang, gợi ý 3 khoá, đếm bộ lọc nháp, ngày lớp sớm nhất và lịch lớp theo Asia/Ho_Chi_Minh. Metadata giới hạn 6 request đồng thời, lịch chi tiết giới hạn 3.
- Chọn/bỏ lớp chỉ đổi draft, tối đa một lớp mỗi khoá. Icon giỏ lưu lớp và giữ modal; Mua ngay lưu rồi mở giỏ. Thay lớp POST thành công trước DELETE lớp cũ. Không gửi giá, không optimistic update.
- Giỏ lấy giá/chỗ/trạng thái từ server, refetch khi mở và sau thao tác. Mất response checkout khoá checkout và cho Kiểm tra lại bằng tập classId của đơn PENDING/PAYOS, không tự gửi checkout lần nữa.
- Thanh toán lấy order và tạo/tái sử dụng link PayOS. CREATING gọi lại 2s/4s/8s với giới hạn khoảng 30s gồm thời gian HTTP; dừng/huỷ khi rời màn hoặc phiên chưa ready. Đơn đóng hiện hết hạn. Không poll PAID hoặc mở checkoutUrl.
- Cache có userId và generation của phiên; Home và Khoá học dùng chung giỏ và sheet production.

## Bằng chứng Android/backend

Tài khoản STUDENT do owner cung cấp được dùng lại; không lưu credential vào code, flow hoặc bằng chứng. API: [backend hiện tại](https://api.quanh123.id.vn/api/v1).

[Chọn tạm](evidence/api-course-draft.png) · [Thêm giỏ](evidence/api-course-added.png) · [Giỏ thật](evidence/api-cart.png) · [QR PayOS thật](evidence/api-payos-qr.png) · [Giỏ đã xoá sau checkout](evidence/api-cart-cleared.png).

Maestro API: e2e/api/course-checkout.yaml PASS. Server trả đơn PAYOS/PENDING 1.000 VND, giỏ trở về 0; chi tiết [api-live-summary.json](evidence/api-live-summary.json). Android Back → Ở lại → Rời đi hoạt động.

QR giải mã từ screenshot bằng OpenCV khớp tuyệt đối chuỗi qrCode của backend, EMV amount=1000, currency=704, country=VN, CRC hợp lệ: [api-qr-decode.json](evidence/api-qr-decode.json). Không thực hiện chuyển tiền.

## Môi trường và kiểm thử

Android Pixel_8_2 / API 37, 1080×2400, density 420, font_scale 1.0. Dùng APK debug hiện có và Metro tải JS mới, không thay native/build/package. Kiểm thử service/hook/route dùng MSW; Android API dùng endpoint triển khai.

## Giới hạn cần owner kiểm tra

- Chưa quét QR bằng app ngân hàng; OpenCV chỉ xác nhận ảnh đọc được và đúng payload backend. Owner thực hiện bước 8 của UAT với đơn mới còn hạn.
- Chưa xác nhận cấu hình sandbox phía PayOS/server; chỉ xác minh endpoint triển khai tạo QR thật. Không suy ra đã thanh toán hoặc đã có quyền học.
- Bốn hàng ngân hàng trong build development vẫn là mock theo Q3; QR, tên khoá và số tiền là dữ liệu thật. Build production ẩn hàng mock theo Q12; không chuyển khoản dựa vào thông tin mock.
- iOS, release, TalkBack thủ công và màn chữ lớn sau các điều chỉnh modal/nút mới chưa kiểm tra lại trong lượt API này.
- Jest detectOpenHandles chỉ ra CustomGC ở lightningcss được import bởi test NativeWind có sẵn. Tất cả assertion PASS; process có thể không tự thoát. Không sửa hạ tầng/test config bị khoá để che handle.

## Kiểm tra cuối

- Jest **232/232**, 48 suite PASS: [báo cáo JSON](evidence/api-final-jest.json). Lint, định dạng và TypeScript PASS. Giới hạn process CustomGC như đã ghi ở trên.
- Bộ hồi quy Android mặc định **9/9 PASS**, 7m23s: evidence/api-ui-regression.
- API checkout → PayOS QR → Back/Ở lại/Rời đi → giỏ rỗng PASS: evidence/api-native-final.
- API thêm lớp ở cuối danh sách → giỏ → xoá → đóng/mở lại giỏ vẫn rỗng PASS sau thay đổi refresh cuối: evidence/api-remove-retest. [Server kiểm tra lại giỏ](evidence/api-remove-summary.json).
- Đã sửa thêm race refresh sau DELETE dùng lại GET cũ, có kiểm thử Red → Green; kiểm tra toàn bộ lại 232 PASS.

## Owner UAT

Theo [hướng dẫn UAT 2.99](../../IMPLEMENT/PHASE_02_COURSE_CHECKOUT/PHASE_02_99_User_Acceptance.md). Xác nhận UI trước đó không thay xác nhận UAT. Nhật ký cập nhật và kết quả cuối ở [README](README.md).


## UI mới sau bàn giao API

Theo ảnh owner ngày 18/10, [modal detail hiện tại](evidence/course-detail-redesign.png) đã đưa mã khoá/tiêu đề vào ảnh có gradient và thu gọn thẻ lớp. Không đổi API; Jest liên quan13/13 và Android chọn lớp/giỏ/checkout2/2 PASS. Nhật ký và đặc tả đã cập nhật.


UI mới nhất: [hero sát hai mép và không bo ảnh](evidence/course-hero-edge-to-edge.png), theo yêu cầu owner. Android cuộn/chọn/thêm giỏ PASS; không thay API.

## Khối trắng và mô tả dưới hero, danh sách 2,5 lớp — 2026-10-18

Theo ảnh owner mới nhất: khối trắng full width bo góc trên chồng đáy ảnh, mô tả đứng đầu trước Lớp đang mở và không co mất; danh sách hiển thị hai thẻ cộng nửa thẻ thứ ba, cuộn nội bộ. Giữ icon giỏ/Mua ngay và ảnh không bo sát hai mép. [Ảnh Android hiện tại](evidence/course-detail-description.png). Android class-scroll/chọn/thêm giỏ PASS, Jest13/13 và lint/format/type-check PASS. Bản hai lớp trong các mục cũ được thay bằng yêu cầu2,5 lớp này. API không đổi; phase vẫn chờ owner UAT.

### 2026-10-18 18:59 (+07:00) · @Bero
- Phase: Bàn giao UI mới với API thật cho owner kiểm tra
- Trạng thái: In review — chờ owner UAT
- Đã làm: Owner xác nhận UI mới bằng “Được rồi gắn API vào để tôi kiểm tra”. Kiểm tra production Home/Courses/ShoppingSheets đã nối catalog/course detail/classes/cart/checkout/PayOS thật; UI mới dùng chung CourseSheet, không cần đổi service hay thay fixture preview. Đăng nhập STUDENT bằng tài khoản owner đã cung cấp, chuyển máy ảo từ preview sang luồng production. Không lưu credential vào repo/bằng chứng; flow và output đăng nhập tạm được xoá sau chạy.
- Test: Native đăng nhập thật → Home → tab Khoá học → có thẻ khoá server PASS. Backend danh mục HTTP200. Ảnh evidence/api-owner-ready.png xác nhận modal HTML & CSS từ con số0 có ảnh, mô tả,3lớp/lịch/mentor/chỗ/giá1000VND thật và bố cục mới. Không tạo mutation giỏ hay checkout mới trong lượt bàn giao này. Kế thừa kiểm tra API/QR và hồi quy trước đó.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Máy ảo hiện ở phiên STUDENT thật để owner kiểm tra. Giữ giới hạn PayOS/ngân hàng đã ghi tại API_REVIEW; chưa có xác nhận UAT/Done.

### 2026-10-18 19:11 (+07:00) · @Bero
- Phase: Điều tra API thêm giỏ theo ảnh lỗi owner
- Trạng thái: In review — cần owner duyệt ngoại lệ hạ tầng nếu sửa bộ đọc lỗi
- Đã làm: Gọi thật bằng tài khoản owner; GET giỏ200 rỗng; POST me/cart/items cho lớp25449860-d1cb-4949-852a-90d6b42dc2d3 trả409 CLASS_ALREADY_ENROLLED, message đã giữ chỗ hoặc enrolled; GET sau vẫn rỗng. Không checkout/huỷorder/xoágiỏ. Backend trả details=[{classId}], khác kiểu chuỗi/mảng chuỗi của contract. errorSchema trong HTTP từ chối toàn envelope vì details nên code bị mất thành HTTP_ERROR, UI hiện generic. Bằng chứng evidence/add-cart-investigation.json.
- Test: Tái hiện schema bằng đúng envelope backend: parser hiện tại reject; phương án bỏ qua metadata optional không đúng dạng giữ CLASS_ALREADY_ENROLLED, vẫn reject envelope thiếu code. Chuẩn bị ADR-0028 Proposed và patch review được, chưa áp dụng vào src/config bị khoá. git apply --check xác nhận patch áp dụng được. Một số probe auth/read riêng gặp response non-JSON tạm thời; không dùng để kết luận enrollment hay thời hạn giữ chỗ cụ thể.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Đã xác định lý do add bị chặn, chưa xác nhận đang giữ chỗ hay đã enrolled vì cần dữ liệu khác. Đề xuất thông báo bao phủ cả hai trường hợp. docs/README.md B.8 và ARCHITECTURE khoá HTTP yêu cầu ADR Accepted; chưa có quyền sửa. Phase/UAT không Done.

### 2026-10-18 19:17 (+07:00) · @Bero
- Phase: Áp dụng ADR-0028 sau owner duyệt
- Trạng thái: In review
- Đã làm: Owner chốt “Duyệt ADR-28”; ADR chuyển Accepted, index và ARCHITECTURE ghi ngoại lệ giới hạn HTTP/test. Optional details sai dạng được bỏ qua, code/status/message/requestId hợp lệ được giữ. Không đổi kiểu ApiError/cookie/refresh/retry/Origin. Bản dịch vi/en CLASS_ALREADY_ENROLLED bao phủ đã đăng ký hoặc giữ chỗ. Thêm hồi quy HTTP, hook chọn lớp và integration ShoppingSheets thật qua MSW.
- Test: Red→Green tái hiện code bị đổi thành HTTP_ERROR/mất requestId và bản dịch cũ. Bộ HTTP/cart/selection/productionCommerce62/62 PASS; sau thêm integration lỗi structured, productionCommerce7/7 PASS (tổng các test liên quan63). Giữ details chuỗi/mảng chuỗi, vẫn từ chối envelope thiếu code/message; POST lỗi không toast/không mở giỏ. ESLint/TypeScript/Prettier PASS.
- Native: Mở lớp HTML thật và thêm giỏ. Lần này server cho phép thêm, app toast thành công và badge1; ảnh evidence/adr28-native-add-success.png. Flow dự kiến409 vì thế fail ở assert thông báo409, raw evidence/adr28-native; không coi đây là PASS cho nhánh lỗi thật. Không tạo checkout hay huỷ order để tái tạo seat hold. Nhánh409 cùng payload đã xác nhận qua integration MSW. Lớp thêm mới giữ trong giỏ cho owner kiểm tra, không tự xoá.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Chưa tái hiện409 trên native sau thay đổi do trạng thái server đã cho thêm; không suy đoán đã thanh toán/enrolled. Phase vẫn chờ owner UAT, không tự Done.

### 2026-10-18 19:21 (+07:00) · @Bero
- Phase: Owner UAT2.99 và đóng Phase2
- Trạng thái: Done
- Đã làm: Owner xác nhận trực tiếp trong chat: “UAT phase 2 được approve”. Ghi nhận đây là duyệt UAT cuối phase, tách biệt với UI approval và ADR approval trước đó. Chuyển Phase2, API2.6 và UAT2.99 sang Done trong roadmap/README phase/hướng dẫn UAT. UI2.1–2.5 đã Done. Không triển khai phase mới hoặc tạo commit/PR khi chưa được yêu cầu.
- Test: Chỉ cập nhật tài liệu, không chạy lại test. Kế thừa bằng chứng API thật, Android, UI và hồi quy ADR-0028 đã ghi ở các entry trước. Không ghi thêm kết quả quét bank app/sandbox/iOS khi owner chỉ xác nhận UAT chung.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Các entry In review/chờ UAT trước thời điểm này là lịch sử, được thay bằng xác nhận Done này. Giới hạn kiểm thử và dữ liệu mock ngân hàng development vẫn giữ tại API_REVIEW; xác nhận owner không biến chúng thành bằng chứng kiểm thử mới. Phase2 hoàn tất theo owner.

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
