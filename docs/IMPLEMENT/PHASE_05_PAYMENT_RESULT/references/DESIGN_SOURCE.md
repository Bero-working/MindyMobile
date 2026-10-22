# Nguồn thiết kế Phase 5

## Quyết định triển khai ngày 2026-10-22

Owner chọn “Dùng bố cục đề xuất trong đặc tả” trong chat. Dùng thông số 5.1 để triển khai UI; ảnh owner không còn là điều kiện chặn bước này. Đây là chấp thuận nguồn/bố cục triển khai, chưa phải xác nhận UI bản chạy hoặc UAT. Đối chiếu native theo thông số đề xuất; không tuyên bố đối chiếu với ảnh chưa có. SVG trạng thái được vẽ nội bộ bằng primitive hiện có, không thêm asset/thư viện bên ngoài. Modal không dùng animation tự chạy; Reduce Motion được bảo đảm bởi modal không animation và PressableScale hiện có.

- Ngày khảo sát: 2026-10-22 (+07:00); người đặc tả: Codex.
- Owner yêu cầu UI dựa layout ảnh nhưng tin nhắn tạo phase chưa có ảnh truy cập được. **Chưa có ảnh nguồn; chưa đối chiếu pixel/bố cục hoặc xác nhận UI.**
- Khi owner bổ sung, lưu ảnh gốc ở thư mục này, ghi tên file, nguồn/ngày nhận, biến thể success/failure được dùng và khác biệt native. Không tạo ảnh giả thay ảnh owner.
- Base hiện có: [Student Home.dc.html](../../../../assets/Student%20Home%20Page%20Design/Student%20Home.dc.html), `src/modules/payment/PaymentScreen.tsx`; giữ style Nunito/token đang dùng. Base HTML chỉ có checkout toast mẫu; không có modal result đã được xác minh trong lượt khảo sát.
- Thay đổi được yêu cầu: result modal thành công → Home; thất bại → retry. Pending/review và hành vi retry tuân thủ contract. Các thông số ở 5.1 là đề xuất chờ cập nhật theo ảnh.
- Chưa có asset/illustration mới hoặc ảnh native Phase 5. Bằng chứng sau triển khai lưu ở PROGRESS, phân biệt ảnh thiết kế với ảnh bản chạy.

## Thay đổi nguồn theo ảnh owner — 2026-10-22

Owner bổ sung [ảnh ticket](payment-ticket-reference.png) và yêu cầu xác nhận thanh toán trông như ticket bị xé, không như modal/card. Yêu cầu này thay bố cục modal bo tròn trước đó.

- Tham chiếu: tờ biên lai trắng, cạnh trên gần vuông, mép dưới rách dạng sóng/răng cưa; dấu check tròn ở đầu; đường đục lỗ ngang; thông tin in phẳng; tổng tiền ở cuối; CTA chữ nhật nằm ngoài tờ vé. Không sao chép logo, dữ liệu mua hàng, tiền tệ hoặc màu xanh neon từ ảnh.
- Bản Mindy: giữ Nunito và token forest/canvas/line/muted/status-red. Giấy SVG liên tục, không dùng card/bóng/khung bo góc hoặc khối nền cho dữ liệu đơn. Không raster hóa ảnh tham chiếu làm UI.
- Ticket rộng viewport trừ 24dp mỗi bên, tối đa360dp; giấy padding24dp, chừa mép rách14dp. Icon dấu trạng thái56dp, tiêu đề22/28dp; mô tả14/21dp; mã đơn13/19dp; tổng tiền28/34dp. Header và dữ liệu phân cách đường nét đứt. CTA chính cao tối thiểu52dp, gần vuông (radius2dp), cách mép rách20dp. CTA phụ>=44dp.
- Toàn bộ ticket và CTA nằm trong một vùng cuộn safe-area; màn thấp/font1.3× cuộn được tới CTA và thấy mép rách, không cắt nội dung bằng khung modal cố định. Lớp trình bày native vẫn cô lập tương tác nền và giữ hành vi Back/focus; không có animation tự chạy.
- Success/failure/pending/review/loading/empty/error giữ nội dung và hành động đã đặc tả; bố cục ticket áp dụng tất cả trạng thái. Hình chụp modal trước thời điểm này là lịch sử, không phải bằng chứng UI cuối. Owner chưa duyệt UI/API/UAT.

## Thu gọn trạng thái theo owner — 2026-10-22

Owner yêu cầu chỉ giữ ticket kết quả cho `PAID` (SUCCESS), `CANCELLED` (FAIL) và `EXPIRED`, bỏ tất cả ticket còn lại. Giữ hình thức ticket mép xé theo ảnh, không quay về card/dialog bo góc. PAID có CTA Home; CANCELLED và EXPIRED có CTA Thử lại về Courses chọn lại. Không có nút kiểm tra lại, loading/error/empty/pending/review/forbidden/notFound trong ticket hoặc menu preview của ticket. Trạng thái chờ/tạo link/lỗi vẫn thuộc QR và trạng thái inline có sẵn, không thêm ticket mới. Enum API/backend không bị thay đổi; REQUIRES_REVIEW vẫn không được mời thanh toán lại hoặc tự tạo link, nhưng không có ticket riêng. Quyết định phạm vi không thay owner UI approval/API/UAT.
