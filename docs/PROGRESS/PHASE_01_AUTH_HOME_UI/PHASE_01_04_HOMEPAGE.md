# Tiến độ 1.4 — Student Homepage bản 2

Chỉ ghi thêm kết quả từng task; hiện chưa có entry triển khai.

### 2026-10-17 15:29 (+07:00) · @LogKoNger
- Phase: 1.4.1 Layout Home 2a
- Trạng thái: In progress
- Đã làm: AI triển khai và tự đánh giá: Hero mascot → lịch → lưới tối đa4 course → khám phá → intro3 → compiler → about3 → footer, tabbar5 cố định. Áp dụng regionVars.home; tên từ view model, không cố định trong component production.
- Test: Test đủ section, tên dài, nullable, giá0 và tối đa4 item xanh. Mascot gốc đã có; ảnh học viên chưa đưa vào app. Tổng Jest hiện tại 20 suite/94 test xanh; lint/format/type-check đã chạy. Báo cáo cuối cập nhật ở evidence/.
- PR / commit: Chưa tạo.
- Ghi chú: Chưa phải UAT; đang chạy lại Android với mascot gốc. Không xác nhận auth/backend hoặc iOS từ test UI.

### 2026-10-17 15:29 (+07:00) · @LogKoNger
- Phase: 1.4.2 Trạng thái dữ liệu/ảnh
- Trạng thái: In progress
- Đã làm: AI triển khai và tự đánh giá: Lịch/course có loading/empty/error/success riêng; giữ stale data khi refetch. CoverImage FastImage với interop/fallback, giá Intl VND; requestId/retry riêng vùng.
- Test: Test trạng thái, data không bị mất khi vùng khác lỗi, retry lịch riêng, image error/newURL xanh. Tổng Jest hiện tại 20 suite/94 test xanh; lint/format/type-check đã chạy. Báo cáo cuối cập nhật ở evidence/.
- PR / commit: Chưa tạo.
- Ghi chú: Chưa phải UAT; đang chạy lại Android với mascot gốc. Không xác nhận auth/backend hoặc iOS từ test UI.

### 2026-10-17 15:29 (+07:00) · @LogKoNger
- Phase: 1.4.3 Callback và refresh
- Trạng thái: In progress
- Đã làm: AI triển khai và tự đánh giá: Course/main và + là hai phần tử bấm độc lập; session callback gồm classId/sessionId/accessMode, CASH_PREVIEW có label riêng. Refresh ref lock và giữ nội dung, lỗi có retry.
- Test: Test đúng ID/accessMode, không gọi đồng thời item/+, khoá refresh lặp và disabled action xanh. Không tạo cart/meeting/compiler service. Tổng Jest hiện tại 20 suite/94 test xanh; lint/format/type-check đã chạy. Báo cáo cuối cập nhật ở evidence/.
- PR / commit: Chưa tạo.
- Ghi chú: Chưa phải UAT; đang chạy lại Android với mascot gốc. Không xác nhận auth/backend hoặc iOS từ test UI.

### 2026-10-17 15:29 (+07:00) · @LogKoNger
- Phase: 1.4.4 Carousel/compiler/about
- Trạng thái: In progress
- Đã làm: AI triển khai và tự đánh giá: Mỗi carousel3 mục, vuốt ngang và dot có label riêng/selected; không timer. Terminal chỉ preview; production dùng copy dự án không cam kết4tuần; không phát hành hotline/email/link#.
- Test: Test dot/swipe/index/callback xanh. Ảnh mentor/dự án chưa có giữ phần nội dung; không dùng ảnh tự sinh. Native Home đang kiểm tra lại flow cuộn qua các vùng lỗi. Tổng Jest hiện tại 20 suite/94 test xanh; lint/format/type-check đã chạy. Báo cáo cuối cập nhật ở evidence/.
- PR / commit: Chưa tạo.
- Ghi chú: Chưa phải UAT; đang chạy lại Android với mascot gốc. Không xác nhận auth/backend hoặc iOS từ test UI.

### 2026-10-17 15:29 (+07:00) · @LogKoNger
- Phase: 1.4.5 Tabbar
- Trạng thái: In progress
- Đã làm: AI triển khai và tự đánh giá: Thứ tự courses/schedule/home/notifications/account, Home giữa/selected; safe area đáy. Đích chưa có disabled+accessibilityHint; preview có callback.
- Test: Test thứ tự, selected và disabled xanh. Kiểm tra chữ lớn/Reduce Motion native còn chờ flow riêng. Tổng Jest hiện tại 20 suite/94 test xanh; lint/format/type-check đã chạy. Báo cáo cuối cập nhật ở evidence/.
- PR / commit: Chưa tạo.
- Ghi chú: Chưa phải UAT; đang chạy lại Android với mascot gốc. Không xác nhận auth/backend hoặc iOS từ test UI.

### 2026-10-17 15:46 (+07:00) · @LogKoNger
- Phase: AI tự kiểm tra sub-phase và bàn giao UAT
- Trạng thái: In review
- Đã làm: Hoàn tất phần UI trong phạm vi; dùng mascot gốc, không dùng ảnh học viên chưa xác nhận quyền. Review độc lập phát hiện focus field lỗi và accessibilityState của Button; đã sửa với test RED→GREEN. Kiểm tra native phát hiện stylesheet cũ và tên course bị lặp trong fallback; đã reset Metro, bỏ tên lặp, giữ vị trí caption. Button dùng đủ chiều ngang cho label; intro giữ vùng ảnh placeholder, about có giấy nghiêng/băng dính/góc gấp. Không thêm dependency hoặc sửa auth/backend Foundation.
- Test: Jest cuối 20 suite/97 test xanh; lint:rules, lint:code-format, lint:type-check xanh. Maestro Android 5/5 flow chính; fontScale1.3 + animator_duration_scale0 1/1, đã khôi phục font1.0 và animator không đặt (null). Kiểm tra riêng Login 1/1 và Home 1/1 sau sửa UI; báo cáo trong evidence/. Native screenshot đối chiếu đã có.
- PR / commit: Chưa tạo.
- Ghi chú: UAT owner chưa thực hiện; sub-phase In review, không Done. iOS, release binary và TalkBack thủ công chưa chạy. UI callback không chứng minh cookie/backend/auth hết phiên.

### 2026-10-17 20:52 (+07:00) · @LogKoNger
- Phase: 1.4.1–1.4.5 · Home 2a và sửa review
- Trạng thái: In progress
- Đã làm: AI thực hiện. Áp dụng forest gốc, hero logo2dòng/mascot tràn đáy, lịch2dòng/ẩn khi rỗng, grid4thẻ sọc có token/gradient/giá trắng, CTA bóng cứng,3slide có mascot/slot HOME_INTRO_IMAGES, terminal minh hoạ,3ghi chú giấy/góc gấp/băng dính, footer forest và tab bar nổi. Nội dung D4 hiển thị cả ngoài preview.
- Test: Test lịch rỗng, copy D4, compact header và preview RED→GREEN. Reviewer độc lập phát hiện callback My classes và vùng chạm +/Home: sửa callback riêng onMyClasses (test RED→GREEN), target+44dp với hình34dp, target Home78dp nằm trọn overlay96dp.
- PR / commit: Chưa tạo.
- Ghi chú: Không dùng ảnh người thật, không tự chuyển carousel. Dấu+ chỉ callback chọn lớp. Tab Home cuộn lên đầu, luôn hiện khi Reduce Motion/screen reader. Sai khác nhỏ để owner xem: vài path icon, khoảng chấm carousel tăng để giữ target44dp, outline Button ExtraBold thay Bold.

### 2026-10-17 21:08 (+07:00) · @LogKoNger
- Phase: 4 Kiểm tra sau chỉnh UI và bàn giao
- Trạng thái: In review
- Đã làm: AI đối chiếu bản chạy với bàn giao, sửa finding quan trọng, giữ UAT cuối cùng cho owner. Home320dp đã sửa mascot che chữ; kích thước vùng chạm dùng dp tường minh.
- Test: Jest20 suite/102 test đạt; lint:rules, lint:code-format, lint:type-check đạt. Maestro main: api-health/app-launch/Login/Register đạt ở lượt2026-10-17_205658; Home đạt sau sửa flow retry ở lượt210136 (1/1). Chữ lớn1.3×/Reduce Motion1/1, visual sections1/1 và compact320dp1/1 đạt. Hệ thống máy ảo đã khôi phục1080×2400, font1.0, animator_duration_scale=null.
- PR / commit: Chưa tạo.
- Ghi chú: Bằng chứng, giới hạn và sai khác nhỏ ở README và evidence/2026-10-17-handoff-review.md. Không xác nhận cookie/backend hoặc UAT thay owner.

### 2026-10-17 21:12 (+07:00) · @LogKoNger
- Phase: 1.4.5 Hạ vị trí tab bar theo phản hồi owner
- Trạng thái: In review
- Đã làm: Owner yêu cầu hạ thanh tabs trong ảnh đính kèm. Bỏ khoảng đệm nổi16dp phía dưới, bottom=insets.bottom; thanh xuống16dp và vẫn chừa safe area hệ thống. Cập nhật thông số IMPLEMENT theo yêu cầu trực tiếp.
- Test: Thay đổi vị trí hiển thị; kiểm tra định dạng và TypeScript, không thêm test hành vi cho thay đổi layout này.
- PR / commit: Chưa tạo.
- Ghi chú: Giữ UAT chờ owner.

### 2026-10-17 21:15 (+07:00) · @LogKoNger
- Phase: 1.4.4 Slide giới thiệu full-width theo phản hồi owner
- Trạng thái: In review
- Đã làm: Bỏ padding ngoài16dp hai bên của cả3slide giới thiệu; nền slide tràn hết chiều ngang, giữ padding nội dung18dp và khoảng trống mascot. Cập nhật IMPLEMENT theo yêu cầu trực tiếp.
- Test: Kiểm tra định dạng và TypeScript; không thêm test hành vi cho thay đổi layout.
- PR / commit: Chưa tạo.
- Ghi chú: Owner UAT chưa xác nhận.

### 2026-10-17 21:16 (+07:00) · @LogKoNger
- Phase: 1.4.4 Thu gọn khoảng cách dot theo phản hồi owner
- Trạng thái: In review
- Đã làm: Bỏ min-width44dp ở từng dot, thêm padding ngang5dp mỗi bên để khoảng cách giữa các hình dot đúng10dp cho cả intro/about. Giữ chiều cao vùng bấm44dp, trạng thái chọn, animation, nhãn accessibility và vuốt carousel.
- Test: Kiểm tra định dạng, TypeScript và test Home/callback carousel.
- PR / commit: Chưa tạo.
- Ghi chú: Vùng bấm ngang thu theo dot để không có các target chồng nhau; đây là thay đổi theo yêu cầu owner, thay quyết định giãn dot trước đó.

### 2026-10-17 21:29 (+07:00) · @LogKoNger
- Phase: 1.4.1 Header chuyển mượt và hạ tiêu đề hero theo owner
- Trạng thái: In review
- Đã làm: Header compact luôn mounted, trượt từ trên xuống kết hợp fade200ms/ease-out cubic khi scrollY>150; cuộn lên qua ngưỡng thì chạy chiều ẩn. Khi ẩn không nhận chạm và không xuất hiện trong accessibility tree. Reduce Motion dùng thời lượng0. Tăng margin-top tiêu đề4→12dp, hạ câu Cứ thử…làm được thêm8dp; giữ vị trí lời chào. Cập nhật đặc tả theo yêu cầu trực tiếp.
- Test: Test header mounted/ẩn controls RED→GREEN. Jest20suite/103test đạt; ESLint, Prettier và TypeScript đạt. Maestro home-header-scroll1/1 thường và1/1 animator_duration_scale0; đã khôi phục settingnull. Ảnh hai trạng thái và báo cáo trong evidence/header-motion-*.png, 2026-10-17-header-motion*.json/txt/xml và 2026-10-17-header-reduced-motion.xml. Ảnh hero dùng screenshot sau quay về đầu trang để tránh ảnh menu trong lúc chuyển route.
- PR / commit: Chưa tạo.
- Ghi chú: Sai khác topbar tức thì trong review cũ đã được xử lý. Vẫn chờ owner xác nhận UI theo ADR-0021; không gắn API hoặc tự xác nhận UAT. iOS chưa kiểm tra.
