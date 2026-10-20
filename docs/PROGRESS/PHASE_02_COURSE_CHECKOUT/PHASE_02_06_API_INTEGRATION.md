# Tiến độ 2.6 — Tích hợp API

Chỉ ghi thêm kết quả từng task; hiện chưa có entry triển khai.


### 2026-10-18 02:00 (+07:00) · @Bero
- Phase: 2 Owner xác nhận UI
- Trạng thái: In progress — UI đã được owner duyệt; chuẩn bị bước API
- Đã làm: Ghi nhận xác nhận trực tiếp của owner trong chat: “UI tôi approve”. Phạm vi duyệt là UI Phase 2 hiện tại, gồm chọn tạm một lớp mỗi khoá, icon thêm giỏ cạnh Mua ngay, modal không cuộn ngoài/hai lớp và cuộn nội bộ, noti trên, modal thu gọn, tab hạ thấp và autoplay 3 giây. UI 2.1–2.5 hoàn tất mốc xác nhận; chưa phải UAT cuối phase.
- Test: Không chạy lại vì chỉ ghi nhận duyệt UI. Bằng chứng gần nhất: 173/173 Jest, lint/format/type-check PASS; Android draft-class-selection 2/2 PASS.
- PR / commit: Chưa tạo.
- Ghi chú: API 2.6 vẫn Todo, cần Claude Code rà lại khung đặc tả sau duyệt UI và trước khi Codex triển khai theo PHASE_02_06_API_INTEGRATION.md §Mô tả. Không còn chờ owner duyệt UI; chưa bắt đầu gọi API Phase 2 hoặc xác nhận UAT. UAT 2.99 Todo.


### 2026-10-18 02:04 (+07:00) · @Bero
- Phase: 2.6 Rà soát đặc tả sau duyệt UI
- Trạng thái: In progress
- Đã làm: Claude Code rà khung 2.6 theo hành vi owner đã duyệt và chốt đặc tả trong PHASE_02_06_API_INTEGRATION.md: POST giỏ chỉ ở icon giỏ/Mua ngay, DELETE lớp cũ chỉ sau POST lớp thay thế thành công; nextClass đọc trang `pageSize=100` và tự chọn ngày sớm nhất (contract không bảo đảm thứ tự); nguồn gợi ý; quy tắc mất response checkout và order không PENDING; file/task cụ thể cho 2.6.1–2.6.3.
- Test: Không chạy (chỉ đặc tả).
- PR / commit: Chưa tạo.
- Ghi chú: Không thấy mâu thuẫn với contract/business rule/ADR; không cần API PLANNED, sửa hạ tầng hay thêm thư viện. Lịch lớp hiển thị theo Asia/Ho_Chi_Minh vì ClassDetailDto không có timeZone — đối chiếu ở 2.6.4.


### 2026-10-18 02:14 (+07:00) · @Bero
- Phase: 2.6.1 Catalog service và query
- Trạng thái: In review
- Đã làm: AI thêm catalog.schema.ts (zod), catalog.service.ts (danh mục lọc isActive, list có page/pageSize/categoryId/deliveryMode và bỏ key rỗng, nextClass đọc pageSize=100 rồi chọn ngày sớm nhất, chi tiết khoá học, lớp, lịch lớp), coursesQueryKeys, useCatalogQuery (gợi ý = 3 khoá đầu trang 1 không lọc, giữ total cũ khi đang tải, đếm total cho bộ lọc nháp, nextClass cache theo courseId), useStudentScope, toRegion. CoursesRoute dùng dữ liệu thật thay trạng thái lỗi cố định.
- Test: Red (module chưa có) → Green: catalog.service 5/5, useCatalogQuery 4/4 (MSW). tsc PASS.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Chưa có test tích hợp cấp route cho CoursesRoute với MSW. Prettier chưa chạy --write cho file mới.


### 2026-10-18 02:14 (+07:00) · @Bero
- Phase: 2.6.2 Cart, chi tiết khoá học và mutation
- Trạng thái: In progress
- Đã làm: AI thêm cart.schema.ts, cart.service.ts (get/add/remove/checkout PAYOS, chỉ gửi classId/paymentType), cartQueryKeys + useCartQuery/useCartActions (add ghi CartDto server vào cache, không optimistic), useCourseDetailQuery (detail + classes + lịch, tối đa 3 request song song, lỗi lịch bỏ qua), useCartController (xoá, checkout, mất response → Kiểm tra lại). ShoppingSheets thành adapter production theo courseId, dùng chung Home và Khoá học; badge giỏ thật ở Home và Khoá học.
- Test: cart.service 10/10 PASS (MSW, gồm 5 mã lỗi 409, CART_ITEM_NOT_FOUND, schema lỗi). Test và code service viết cùng lượt, không quan sát Red riêng.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: **Chưa xong**: chưa có test MSW cho useCartController, useCourseDetailQuery và luồng chọn lớp production (đổi lớp = POST rồi DELETE, POST lỗi không DELETE, badge chỉ đổi sau response). Dừng theo yêu cầu owner.


### 2026-10-18 02:14 (+07:00) · @Bero
- Phase: 2.6.3 Checkout và tạo link PayOS
- Trạng thái: In progress
- Đã làm: AI thêm order.schema.ts, payment.service.ts (order, createPayos, waitForPayosLink backoff 2s→4s→8s tối đa ~30s rồi qrCode null, findPendingPayosOrder khớp đúng tập classId), usePaymentQuery (order không PENDING/không PAYOS → PAYMENT_ORDER_INVALID, không gọi tạo link), PaymentRoute production (loading, lỗi ORDER_NOT_FOUND/ORDER_ACCESS_DENIED, màn QR). Checkout invalidate giỏ và lịch Home.
- Test: payment.service Red (thiếu waitForPayosLink, 5 fail) → Green 7/7 PASS. routes.test thêm mock QR/clipboard, PASS.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: **Chưa xong**: chưa có test MSW cho usePaymentQuery/PaymentRoute và cho checkout → điều hướng/Kiểm tra lại ở cấp sheet. Dừng theo yêu cầu owner.


### 2026-10-18 02:14 (+07:00) · @Bero
- Phase: 2 Tạm dừng 2.6 theo yêu cầu owner
- Trạng thái: In progress
- Đã làm: Owner yêu cầu dừng triển khai và báo tiến độ (“xác nhận chứ không làm, hoàn thành những gì thì báo progress”). 2.6.1 In review; 2.6.2, 2.6.3 In progress (còn test hook/route); 2.6.4 Todo (chưa chạy backend thật).
- Test: Jest toàn bộ 199/199, 43 suite PASS; tsc PASS; ESLint 0 lỗi, 1 cảnh báo (eslint-disable thừa ở useCartController.ts:30); Prettier báo 10 file chưa format. Maestro chưa chạy lại.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Preview __DEV__ vẫn dùng fixture. Chưa sửa cảnh báo lint/format vì đã dừng. UAT 2.99 Todo.


### 2026-10-18 18:11 (+07:00) · @Bero
- Phase: Tiếp tục 2.6.1–2.6.3 sau owner yêu cầu “tiếp tục phase 2”
- Trạng thái: In progress
- Đã làm: Hoàn tất test MSW hook/route còn thiếu cho Catalog, chi tiết lớp/lịch (tối đa 3 đồng thời, lỗi lịch bỏ qua), giỏ/checkout/verify và PaymentRoute. Production chọn tạm không gọi mutation, chỉ icon giỏ/Mua ngay thêm lớp; thay lớp POST trước DELETE, thêm lỗi giữ lớp cũ; badge đổi sau response. Test phát hiện và sửa GET giỏ cũ ghi đè POST server (cancel query trước setQueryData), checkout hoàn tất sau rời sheet vẫn điều hướng (mounted guard), đơn đóng không có QR vẫn hiện loading (hiện expired), chờ PayOS không tính thời gian HTTP/còn gọi sau huỷ (ngân sách 30s tính cả HTTP, timeout theo phần còn lại, AbortController), phiên chưa ready vẫn tạo link (dừng/huỷ theo scope). Giới hạn metadata lớp ở 6 request đồng thời ngay tại service. Format file mới và bỏ eslint-disable thừa.
- Test: Red → Green các regression trên. Toàn bộ 231/231, 48 suite PASS; lint/format/type-check PASS. Chạy detectOpenHandles xác định handle CustomGC của lightningcss được import ở src/config/nativewind.test.tsx (hạ tầng có sẵn), không phải timer PayOS mới; không sửa test config bị khoá. Hai lượt Jest đều 231 PASS, process còn handle native được dừng sau báo cáo.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Catalog thật trả 200; đã tìm lại tài khoản owner đã cung cấp ở Phase 1 và xác nhận login STUDENT, giỏ ban đầu rỗng. Không ghi credential/cookie vào repo hoặc evidence. Đang kiểm tra Android/backend 2.6.4, chưa xác nhận QR hay UAT.


### 2026-10-18 18:13 (+07:00) · @Bero
- Phase: 2.6.4 Android và backend thật
- Trạng thái: In review
- Đã làm: Dùng lại tài khoản STUDENT owner đã cung cấp ở Phase 1. Login thật thành công; giỏ ban đầu trống. Android lấy Catalog/detail/lịch thật, chọn lớp không toast, bấm icon giỏ thêm lớp/hiện toast, Mua ngay mở giỏ, checkout PAYOS và hiển thị QR thật. Không chuyển tiền, không mở checkoutUrl, không poll PAID.
- Test: Maestro e2e/api/course-checkout.yaml PASS (evidence/api-native-final): chọn lớp → thêm giỏ → Mua ngay → giỏ → checkout → QR → Back/Ở lại → Rời đi → giỏ rỗng. Server xác nhận order 714d0579-c069-4db9-8ab3-12756a905b0e, 1.000 VND, PENDING/PAYOS, giỏ 0; expiresAt 2026-10-18T11:26:37.352Z. OpenCV giải mã QR từ screenshot trùng tuyệt đối qrCode backend, EMV currency 704/amount 1000/country VN, CRC đúng. Chi tiết evidence/api-live-summary.json và api-qr-decode.json.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Lượt native đầu đọc bundle cũ từ emulator snapshot, tab Khoá học chưa điều hướng; force-stop/mở lại để tải JS hiện tại từ Metro rồi rerun PASS. Raw lỗi giữ evidence/api-native, final ở api-native-final. Chưa quét bằng app ngân hàng; giải mã OpenCV không thay kết quả quét bank app. Không xác nhận cấu hình sandbox của PayOS phía server; chỉ xác nhận endpoint triển khai trả QR thật. Bảng chuyển khoản trên debug vẫn là mock theo Q3, QR/số tiền/đơn từ backend thật. Đang chạy bộ UI hồi quy đầy đủ; UAT vẫn do owner.


### 2026-10-18 18:23 (+07:00) · @Bero
- Phase: 2 Kiểm tra API cuối và bàn giao owner UAT
- Trạng thái: In review — chờ owner UAT 2.99
- Đã làm: AI hoàn tất 2.6.1–2.6.3 và tự kiểm tra backend/Android 2.6.4. Regression bổ sung tái hiện refresh sau DELETE dùng lại GET cũ → sửa actions.refresh huỷ GET đang chạy trước khi fetch bản mới; Red → Green. Không sửa hạ tầng, không thêm thư viện, không commit, giữ thay đổi ngoài phạm vi có sẵn. Cập nhật roadmap, README, đặc tả API, UAT và API_REVIEW; UI approval trước đó giữ nguyên.
- Test: Jest 232/232, 48 suite PASS (evidence/api-final-jest.json); ESLint, Prettier, TypeScript PASS. detectOpenHandles xác định CustomGC/lightningcss từ test NativeWind có sẵn; process Jest được dừng sau khi JSON success=true và toàn bộ assertion hoàn tất, không tự coi process có handle này đã thoát thành công. npm run test:e2e Android: 9/9 flow PASS trong 7m23s (evidence/api-ui-regression). Sau sửa refresh cuối, MSW cart/query/controller/production route 17/17 PASS, toàn bộ Jest 232/232 PASS và native cart-add-remove với API thật PASS (evidence/api-remove-retest): chọn lớp ở cuối vùng cuộn, Mua ngay → giỏ, DELETE → giỏ rỗng, đóng/mở lại vẫn rỗng. API checkout/PayOS native PASS tại api-native-final; QR screenshot decode trùng backend và CRC đúng.
- PR / commit: Chưa tạo, chưa commit.
- Ghi chú: Lượt add-remove đầu dùng scrollUntilVisible nhận nhầm nút của lớp ngoài vùng clip; ảnh cho thấy lớp thứ ba chưa cuộn vào viewport. Sửa flow vuốt bên trong danh sách trước khi bấm, không sửa UI; rerun PASS. Raw lỗi giữ tại api-remove-final. Hai luồng API cuối không nằm trong bộ fixture mặc định; credentials không lưu vào YAML/source/evidence. Native 1080x2400, density420/font1.0, APK debug hiện có + Metro mới. Không chuyển tiền hoặc poll PAID. Chưa quét app ngân hàng/xác nhận sandbox phía server; chưa chạy iOS/release hoặc kiểm tra lại chữ lớn/TalkBack/Reduce Motion native trong lượt API. Các giới hạn bàn giao owner tại API_REVIEW; không tự chuyển phase Done hoặc xác nhận UAT.


### 2026-10-18 18:24 (+07:00) · @Bero
- Phase: Đối chiếu giỏ sau native DELETE
- Trạng thái: In review — chờ owner UAT
- Đã làm: HTTP probe ngoài app dùng access cookie của lần login đầu trả 401 sau thời gian kiểm thử; đăng nhập lại cùng tài khoản và đọc giỏ để xác minh riêng. Đây là probe không có interceptor refresh, không coi là lỗi phiên native hoặc bằng chứng native refresh. Cookie/credential không lưu vào repo; file cookie tạm đã xoá.
- Test: Kết quả GET sau xác thực mới tại evidence/api-remove-summary.json; native xoá/mở lại giỏ đã PASS.
- PR / commit: Chưa tạo.
- Ghi chú: Giữ nguyên giới hạn ngân hàng/sandbox và UAT chưa được owner xác nhận.
