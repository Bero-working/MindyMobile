# 3.3 Lớp của tôi — nhóm theo khoá học

## Bước và nguồn

UI, Done (owner duyệt UAT ngày 2026-10-21). Base `section#t2` → `c.subClasses`/`myCourses`, khảo sát2026-10-20; [nguồn](references/DESIGN_SOURCE.md). API production đã tích hợp tại 3.6; fixture/callback chỉ dùng trong development preview/test.

## Đặc tả UI

Điều chỉnh owner2026-10-20: bỏ nút icon đồng hồ mở Lịch sử ở góc phải màn Lớp của tôi. Giữ vùng trống44dp cân với Back để tiêu đề không lệch. Không đổi endpoint/dữ liệu; nếu đang ở lịch sử trước khi đổi UI thì vẫn giữ nút quay về danh sách hiện tại.

### Điều chỉnh theo ảnh owner — 2026-10-20 (ưu tiên)
- Nguồn [my-classes-owner-2026-10-20.png](references/my-classes-owner-2026-10-20.png), snapshot trước tại PROGRESS/evidence/my-classes-redesign/before.png.
- Header canvas: Back tròn44dp viền line, tiêu đề18dp đen/căn giữa. Bỏ hai nút current/history lớn; giữ truy cập lịch sử bằng icon clock44dp bên phải header (bấm lại về hiện tại), nhãn đọc màn hình rõ.
- Các khoá nằm trong một khối soft bo18dp, có line ngăn giữa các folder. Header folder>=64dp: icon34dp nền mint/canvas khi mở, canvas/muted khi đóng; title14.5dp đen Bold, subtitle12dp mã khoá và số lớp đã tải, chevron thay dấu+/−.
- Hàng enrollment gọn, thụt40dp và connector line2dp, nền canvas/bo12dp, min-height52dp, code14dp đen và metadata11.5dp muted. FULL/preview bấm cả row mở detail; bỏ nút Xem lớp học lớn. Quyền NONE không mở detail; pending PAYOS vẫn giữ CTA riêng, review/mismatch vẫn có giải thích/retry, không làm sai quyền để giống ảnh.
- Số lớp folder dùng dữ liệu trong nhóm; khi hasMore/loadingMore/lỗi tải thêm thì ghi “đã tải”, chỉ ghi “N lớp” khi danh sách đã đầy đủ. Preview vào trực tiếp list chọn tab Tài khoản như ảnh; các điểm vào Home/Khoá học vẫn giữ tab nguồn thực tế.
- Không có lịch tuần/progress trong me/classes: dùng deliveryMode và startDate–endDate thật thay “T2,T6 ·19:00–20:30”; không bịa “Buổi4/12”. ClassName/mentor trong accessibilityLabel; trạng thái preview/NONE và hạn đơn khi cần vẫn hiển thị nhỏ. Tabs theo nguồn; nền trống canvas như ảnh, không dựng phone/status giả.

- Header nút Back44dp và tiêu đề giữa18/24 ExtraBold; padding16dp. Hai lựa chọn “Hiện tại”/“Lịch sử” cao≥44dp, selected nền forest/chữ canvas. Default current; không dùng ngày máy tự phân loại.
- Folder khoá học nền soft bo18dp, không bóng. Header cao≥58dp, padding14dp, icon34dp, tên14.5/20 Bold, mã12.5/18 muted; mở: icon nền mint/chữ canvas, chevron quay90°. Hàng enrollment nền canvas bo12dp, min-height64dp, margin trái30dp và đường nối line2dp; gap6dp. Tăng chiều cao cho trạng thái dài.
- Nhóm bằng courseId, tên/mã/ảnh từ response; giữ thứ tự khoá xuất hiện đầu tiên theo kết quả server. Hàng dùng enrollmentId làm key, không gộp enrollment có cùng classId. Các trang tải thêm phải nhập vào đúng nhóm, không nhân đôi enrollment. Số lớp folder ghi theo các mục đã tải, hoặc có nhãn “đã tải”; không coi là tổng server của từng khoá.
- Mặc định mở folder đầu, còn lại đóng; giữ trạng thái mở và vị trí cuộn khi quay lại detail; đổi current/history reset phân trang. Metadata: classCode/className, hình thức, startDate–endDate, mentor nếu có. Không có lịch tuần hoặc tiến độ trong DTO list nên không hardcode chúng.
- Badge và CTA theo bảng quyền dưới; body không bấm mở detail khi NONE. Trạng thái được đọc bằng chữ; expiry chỉ hiển thị khi có order và không tự cấp/thu quyền bằng đồng hồ máy.

| Dữ liệu | UI / callback |
| --- | --- |
| FULL | “Xem lớp học” → classId |
| CASH_PREVIEW | “Xem trước” + hạn nếu có → classId/preview; không link học |
| NONE/PENDING_PAYOS | “Chờ thanh toán”; chỉ “Tiếp tục thanh toán” khi có orderId và không requiresReview; mở đơn cũ, không checkout lại |
| order.requiresReview=true | “Đang đối soát”, không mời thanh toán lại; vẫn tôn trọng quyền xem do server trả |
| HOLD_EXPIRED / ENROLLMENT_CANCELLED | “Hết hạn giữ chỗ” / “Đã huỷ đăng ký”, không mở detail |
| ENROLLMENT_COMPLETED | “Đã hoàn thành”, không coi là được xem lại |
| CLASS_CANCELLED | “Lớp đã huỷ”, không mở detail |
| STATE_MISMATCH / order=null khi cần order | “Thông tin lớp chưa đồng bộ. Vui lòng liên hệ trung tâm.”; cho tải lại, không tạo link hỗ trợ giả |

- Quyền mở lớp phải đồng thời phù hợp accessMode và canViewClass; lịch theo canViewSchedule. Giá trị lạ/mâu thuẫn đóng quyền và cho tải lại. Detail luôn xác minh lại quyền, list chỉ là gợi ý tại asOf.
- Empty current: illustration + “Bạn chưa có lớp trong danh sách hiện tại” + “Khám phá khoá học”; history có copy riêng. Loading skeleton folder; error ScreenState/retry/requestId. Pull-to-refresh; footer loader/lỗi tải thêm, không xoá các trang đang có khi tải thêm lỗi.
- AppTabBar giữ tab gốc (account hoặc courses hoặc home); màn con có Back, không tạo tab thứ6. Mở folder accessibility expanded; Reduced Motion tắt chuyển động chevron/entering.

## API / dữ liệu

[§14.1](../../API_CONTRACT/my-classes.md): GET me/classes?view=current|history&page&pageSize=20. Không thêm filter chưa có UI. Backend sort createdAt DESC, enrollmentId ASC; ngày thuần không parse qua Date. Phân trang incremental; lấy đủ trang trước khi mô tả nhóm là đầy đủ.

## Task

### 3.3.1 Folder và phân trang UI
- Test một khoá nhiều lớp, cùng classId nhưng enrollmentId khác, đổi view, giữ expanded/scroll và load-more lỗi.
- testID `my-classes-view-current`, `my-classes-view-history`, `my-classes-course-{courseId}`, `my-classes-enrollment-{enrollmentId}`.
- i18n `myClasses.title`, `myClasses.view.*`, `myClasses.state.*`.

### 3.3.2 Quyền và hành động
- Bảng test đầy đủ accessMode/accessReason, requiresReview, order null, cờ canView*, CTA không gọi cả detail và payment.
- testID `my-classes-open-{enrollmentId}`, `my-classes-resume-{enrollmentId}`; i18n `myClasses.access.*`.

## Nghiệm thu

- [x] Folder và hàng có dữ liệu đúng; không tiến độ/số lớp giả hoặc quyền suy diễn.
- [x] Mọi nhánh quyền có fixture riêng và callback đúng ID.
- [x] Native/ảnh/độ rộng320dp/font lớn ghi trong PROGRESS.

## Đồng bộ checklist (2026-10-22)

Đối chiếu bằng chứng đã ghi, không chạy lại test trong lượt đồng bộ này. Xem [bảng đối chiếu và giới hạn](../../PROGRESS/ACCEPTANCE_SYNC_2026-10-22.md) và [PROGRESS liên quan](../../PROGRESS/PHASE_03_STUDENT_LEARNING/PHASE_03_03_MY_CLASSES.md). Trạng thái Done của phase giữ theo UAT owner đã có; checkbox chỉ phản ánh phạm vi kiểm chứng, không tự thay xác nhận owner.

Các nhánh FULL/CASH_PREVIEW/NONE, thay đổi quyền và dữ liệu có buổi được ghi theo unit/MSW/fixture khi chưa có dataset backend phù hợp. Có native protected detail bổ sung lúc 18:44 ngày 2026-10-20; Student roster, các dataset còn thiếu và TalkBack/iOS thủ công giữ giới hạn tại API_REVIEW.
