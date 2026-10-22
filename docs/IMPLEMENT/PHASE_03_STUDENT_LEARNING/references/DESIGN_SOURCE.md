# Nguồn thiết kế Phase 3

Khảo sát mã nguồn local 2026-10-20, chưa render hoặc xác minh UI Phase 3 chạy thật. Không truy cập lại link Claude bên ngoài.

Nguồn: [Student Home.dc.html](../../../../assets/Student%20Home%20Page%20Design/Student%20Home.dc.html), `section#t2`/state `c`.

Bổ sung ngày2026-10-20 trong lượt triển khai: owner yêu cầu snapshot lịch hiện tại và sửa theo [ảnh đính kèm](schedule-owner-2026-10-20.png). Ảnh này ưu tiên cho bố cục Lịch: tiêu đề tháng/năm, dải ngày phẳng và timeline cột ngày/giờ/mã lớp. Khung máy/giờ/pin không đưa vào native. Badge Ca/điểm danh chưa có contract được thay bằng sessionNumber/trạng thái session; chi tiết tại3.1. Các màn khác giữ nguồn HTML cũ. Snapshot trước sửa và ảnh sau nằm trong PROGRESS/evidence/schedule-redesign.

Bổ sung tiếp theo cùng ngày: owner gửi [ảnh Profile](profile-owner-2026-10-20.png), ưu tiên cho màn Tài khoản. Dùng hero mint hết chiều ngang, avatar/tên/email căn giữa, ba nhóm row soft có icon tròn, ngôn ngữ một row với giá trị hiện tại. Các mục ngoài API hiển thị disabled theo ảnh mới, không số đơn/lớp hoặc switch push bật giả; quyền và phạm vi API không đổi. Chi tiết trong3.2, ảnh trước/sau tại PROGRESS/evidence/profile-redesign. Nguồn này thay bố cục Account ban đầu, các màn lớp giữ HTML.

Owner gửi tiếp [ảnh list lớp](my-classes-owner-2026-10-20.png): ưu tiên cho My Classes, thay thẻ/nút lớn bằng một khối folder soft liên tục, hàng lớp trắng gọn và header Back tròn/tiêu đề giữa. Không bịa lịch tuần hoặc “Buổi4/12” ngoài DTO list. Lịch sử chuyển vào icon header; giữ NONE/payment/review. Chi tiết3.3, snapshot trước/sau tại PROGRESS/evidence/my-classes-redesign. Detail chưa có ảnh mới nên giữ nguồn trước.

Owner gửi tiếp [ảnh chi tiết lớp](class-detail-owner-2026-10-20.png): ưu tiên cho detail, dùng hero gradient full width/Back icon, cover112×149, sheet trắng chồng, stats, thẻ giảng viên, danh sách buổi phẳng và video CTA dưới. Không bịa tiến độ/roster/mô tả hoặc số người online; stats dùng số buổi/ngày/hình thức từ DTO; CTA theo URL/quyền thật, không mặc định Google Meet. Chi tiết3.4; ảnh tại PROGRESS/evidence/class-detail-redesign.

| Màn | Dấu mốc trong nguồn | Giữ | Điều chỉnh theo contract/phạm vi |
| --- | --- | --- | --- |
| Lịch | `c.isSchedule`, `weekDays`, `dayGroups`, `weekLabel` | Dải 7 ngày, trước/sau tuần, timeline ngày và giờ | Ngày/tuần thật; nút Hôm nay; không số ca giả hoặc điểm danh; bấm buổi lấy lại detail/preview |
| Tài khoản | `showProfile`, `acctGroups`, `c.isAccount` | Hero xanh, avatar chữ, nhóm menu nền soft | Chỉ trường UserDto; hồ sơ chỉ đọc; không lưu giả, không số lớp/đơn hardcode, không toggle push giả |
| Lớp của tôi | `c.subClasses`, `myCourses` | Folder khoá học mở/đóng, hàng lớp thụt vào | Nhóm bằng courseId, key enrollmentId; badge quyền/trạng thái thay “Buổi 4/12”; có hiện tại/lịch sử |
| Chi tiết lớp | `c.roomOpen`, `detailVals`, `cd`, `sd` | Hero gradient, ảnh bìa, khối trắng chồng, chương/buổi, thông tin buổi | Không tiến độ, roster, mô tả/mục tiêu giả, tài liệu hoặc meetingUrl mẫu; preview không có nút tham gia |

## Token và asset

- Dùng `forestDeep`, `forest`, `mint`, `canvas`, `soft`, `line`, `muted`, `action`, `sunshine`, `peach`, `ember`, các token `cover*` trong colors.ts; không đưa màu literal từ HTML vào component.
- Ảnh khoá: URL từ dữ liệu, qua CoverImage/CourseCover hiện có; thiếu/lỗi ảnh dùng fallback hiện có. Không copy chữ “ảnh khoá học” từ prototype vào UI.
- Avatar: initials từ displayName, fallback “?”; không có API avatar, không hiện nút upload.
- Icon dùng Icon hiện có, bổ sung path nếu thiếu; không thêm thư viện. Giữ safe area hệ thống, bỏ khung máy, giờ 9:41/pin trong HTML.
- Native không dùng sticky CSS của cột ngày; lịch dùng danh sách nhóm và tiêu đề ngày rõ ràng. Tuân thủ motion.ts, tắt animation khi Reduce Motion; không đưa timer của prototype vào lịch.

## Thông số quyết định ở spec

Kích thước dưới đây là quyết định thích nghi native, không tuyên bố khớp từng pixel HTML: chạm 44dp thay các nút 28–40px; layout tự tăng chiều cao theo chữ; detail có 2 cột thông tin ở màn hẹp thay 4 cột; dải ngày dùng ô tối thiểu44dp và cuộn ngang nếu bề rộng/font không đủ.

Phần chưa xác minh: ảnh native, độ tương phản ở thiết bị, chữ lớn/TalkBack/iOS. Người triển khai bổ sung bằng chứng trong PROGRESS, không coi bản ghi này là nghiệm thu UI.


## Bổ sung owner: session và nút Meet — 2026-10-20

[Session](session-detail-owner-2026-10-20.png) ưu tiên layout full screen header mint nhạt/bốn ô thông tin/thân trắng; [nút Meet](meet-button-owner-2026-10-20.png) ưu tiên nhãn Vào Google Meet, pill trắng/shadow/vòng video mint và rộng vừa nội dung. Contract chưa có description/objectives/materials nên không tạo dữ liệu mẫu để lấp các vùng này. Màn session dùng state nội bộ, không sửa navigator hoặc thêm API.
