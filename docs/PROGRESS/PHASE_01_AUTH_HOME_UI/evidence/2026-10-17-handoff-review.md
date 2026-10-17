# Rà soát Phase 1 — 2026-10-17
Reviewer độc lập đọc source và đặc tả D1–D4, không sửa code.

## Findings đã xử lý
- My classes gọi nhầm Account: thêm callback onMyClasses riêng; thiếu callback thì disabled kèm giải thích. Test hồi quy đã quan sát RED rồi GREEN.
- Vùng chạm dấu +: thay hitSlop bị cắt bởi parent bằng target44dp thật, giữ hình tròn34dp.
- Nút Home nhô lên: target78dp nằm trọn overlay96dp; phần nhô lên nhận chạm.
- Kiểm tra native phát hiện rem mặc định14px khiến min-h-11 chỉ38.5dp. Dùng kích thước dp tường minh trong UI phase thay vì sửa cấu hình NativeWind bị khoá. Dòng link Auth nằm trong target44dp thật.
- Lỗi native khi đổi variant Button ở preview: NativeWind upgrade cảnh báo serialize props đi vào getter React Navigation context. Key theo variant tạo nhánh style ngay từ mount; không sửa navigation/provider hoặc node_modules. Maestro đã xác nhận được sau sửa trước lượt chuẩn hoá dp.

## Sai khác nhỏ chưa xử lý
- Một số path SVG icon khác nét chi tiết của nguồn.
- Khoảng chấm carousel rộng hơn10dp để giữ các target44dp không chồng nhau.
- Outline Button dùng ExtraBold thay Bold.
- Top bar thu gọn hiện tức thì như artifact; chưa có chuyển cảnh200ms của bản quy đổi mobile.

## Giới hạn
Không có kiểm tra iOS, TalkBack thủ công, release binary hoặc cookie/backend auth. Không coi preview callback là phiên đăng nhập thật. Font900 dùng ExtraBold; mascot map/book có độ phân giải nguồn thấp. Android shadow là xấp xỉ theo elevation. UAT cuối cùng thuộc owner.

## Cập nhật 2026-10-17 21:29
Finding nhỏ về top bar tức thì đã được xử lý theo owner: slide/fade200ms ở cả hai chiều, Reduce Motion tức thì, header ẩn không nhận chạm/đọc màn hình. Xem bằng chứng 2026-10-17-header-motion và header-reduced-motion. Khoảng cách dot cũng đã được owner yêu cầu thu về10dp ở lượt trước.
