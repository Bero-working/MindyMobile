# 3.4 Chi tiết lớp học và thông tin buổi

## Bước và nguồn

UI, Done (owner duyệt UAT ngày 2026-10-21). Base `section#t2` → `c.roomOpen`, `detailVals`, `cd`, `sd`; khảo sát2026-10-20, [nguồn và sai khác](references/DESIGN_SOURCE.md). Đã nối protected API tại 3.6; fixture/callback chỉ dùng trong development preview/test.

## Đặc tả UI

### Điều chỉnh theo ảnh owner — 2026-10-20 (ưu tiên)
- Avatar footer dùng kích thước44×44dp/rounded-full và viền trắng2dp đồng nhất với avatar mentor đã có; vùng bấm đạt44dp, shadow ở View ngoài. Quyết định này thay kích thước56dp thử trước đó khi kiểm tra Android còn bị dẹt.
- Avatar footer chốt rounded-full ở cả View ngoài (shadow) và View56dp bên trong (clip/viền/nền), thay radius28dp; lớp ngoài không clip để giữ bóng.
- Sửa avatar footer bị dẹt: kích thước56×56dp đặt trên View con trực tiếp của PressableScale, số liệu/shape không phụ thuộc chiều cao của wrapper Pressable. Theo owner bỏ nút Đóng trong modal; chỉ backdrop/kéo xuống/Back để đóng.
- Footer class detail nổi trên danh sách: nền thanh trong suốt, avatar56dp bên trái có viền trắng3dp/shadow, Meet trắng/shadow bên phải. Reserve khoảng110dp cuối ScrollView để không che row cuối, safe area giữ nguyên. Bấm avatar mở AppSheet danh sách: Giảng viên từ protected detail, Học viên ở trạng thái chờ API (không đếm từ availableSeats hoặc hiển thị danh sách giả). Owner đã xác nhận chưa có endpoint Student, đồng ý modal chờ API. Không gọi roster Mentor/Admin/Attendance. Đóng bằng backdrop/Back/kéo xuống hoặc nút Đóng. Modal chỉ render khi detail đang verified, không giữ thông tin sau denial/refetch/logout.
- Cập nhật vòng số theo ảnh owner: cố định32×32dp, min-width32dp, shrink-0, radius16dp và overflow-hidden để không co/mất hình tròn. Buổi active dùng coral cam sáng/số trắng14dp, tương lai nền soft/số forest; completed vẫn vòng mint/tick trắng. Nguồn: session-number-active-owner-2026-10-20.png và session-number-upcoming-owner-2026-10-20.png.
- Mẫu row mới [session-rows-owner-2026-10-20.png](references/session-rows-owner-2026-10-20.png): vòng trạng thái30dp, gap10dp, title13dp/metadata11dp; active nền peach, vòng ember có số thứ tự trên toàn danh sách, title Bold, nhãn Hôm nay nếu buổi diễn ra hôm nay/đang diễn ra, còn lại Sắp học. Buổi tương lai có vòng soft/số thứ tự; buổi kết thúc tick mint. Cột nhãn gọn80dp/compact90dp, một dòng/sát chevron4dp/canh cuối. Giữ nhãn Đã kết thúc vì API chưa chứng minh điểm danh cá nhân; không đổi thành Đã học chỉ từ thời gian. Không icon đồng hồ, không thay sessionNumber của metadata/backend.
- Luôn tô nền peach cho đúng một buổi đang học/sắp học gần nhất, tự tính theo startsAt/endsAt trên toàn bộ chương (không theo sessionNumber vì có thể lặp). Bỏ qua CANCELLED/COMPLETED và buổi đã qua endsAt; khi tất cả kết thúc thì không active buổi nào. Không lấy sessionId điều hướng làm active row cũ. Đồng hồ UI cập nhật tại mốc kết thúc buổi và khi app trở lại foreground, không poll API hoặc đổi status server. Giữ thao tác mở session và quyền/link hiện có.
- Hàng thống kê Buổi học/Bắt đầu/Kết thúc/Hình thức: bốn cột bằng nhau, nội dung căn giữa, padding ngang4dp đối xứng và gap giá trị/nhãn5dp. Compact giữ2×2 cột bằng nhau/căn giữa để chữ lớn không tràn; bỏ padding phải lệch giữa các cột.
- Tăng nhẹ margin trái nhãn tổng số buổi học thêm4dp theo yêu cầu owner, giữ số buổi lấy từ dữ liệu.
- Cụm trạng thái + chevron canh cuối mỗi row theo ảnh owner mới nhất: justify-end trong cột trạng thái, chữ một dòng và sát chevron4dp; chevron nằm cùng mép phải của các row.
- Nhãn trạng thái sát chevron4dp: bỏ flex-1 trên Text để không đẩy chevron ra xa; giữ cột cố định để các nhãn có cùng điểm bắt đầu và nhãn một dòng.
- Bỏ icon đồng hồ bên trái row buổi SCHEDULED/CANCELLED theo ảnh owner, giữ khoảng icon để tên buổi thẳng hàng với row có tick/video. Cột nhãn trạng thái có bề rộng cố định104dp (compact112dp), nhãn một dòng, canh trái chung cho “Đã kết thúc”/“Đã lên lịch”; chevron giữ bên phải. Không đổi hành vi mở session.
- Owner yêu cầu đánh dấu buổi đã học: nếu không CANCELLED và endsAt đã qua, UI hiển thị dấu tick mint và nhãn “Đã kết thúc” thay “Đã lên lịch”, kể cả server còn SCHEDULED/IN_PROGRESS. COMPLETED từ server luôn giữ dấu tick. Đồng bộ badge màn session. Đây là trạng thái hiển thị theo thời gian, không sửa DTO/cache/status backend, không ghi điểm danh hoặc tự tính tiến độ học viên; quyền/link vẫn theo trạng thái và xác minh server hiện có.
- Footer tại width≤360dp hoặc fontScale≥1.3: icon28dp/padding8dp/gap6dp/chữ13dp, target vẫn≥54dp. Nhãn một dòng, cho fit tối đa15% khi cần để tránh tách “Tài liệu” thành ba dòng; hai nút vẫn hai phía.
- Áp dụng bố trí đối diện cho class detail: avatar mentor sát trái, Meet trắng có viền sát phải; nút không giãn hết chiều ngang.
- Thêm viền1dp token line quanh nút Meet trắng theo yêu cầu cuối.
- Bố trí footer chốt: hai nút đối diện hai đầu hàng (justify-between): Tài liệu sát trái, Meet sát phải, đều có khoảng an toàn16dp với cạnh màn. Nút Meet nền trắng, chữ forest, icon video trong vòng mint.
- Owner chốt màu tiếp theo: Meet nền trắng/chữ forest, vòng icon mint; Tài liệu vẫn nền forest. Giữ cùng hàng, Meet bên phải Tài liệu.
- Điều chỉnh cuối: trong session, chuyển Meet xuống footer cùng hàng với Tài liệu, bên phải Tài liệu. Meet có nền forest/chữ trắng/icon tròn mint như Tài liệu; trạng thái disabled vẫn chỉ áp dụng Tài liệu khi chưa có dữ liệu. Text được xuống dòng trên màn hẹp, không kéo rộng nút để lấp hàng.
- Owner yêu cầu mới nhất: đổi nhãn sang “Vào Google Meet” và dùng pill trắng/shadow, không viền, vòng tròn mint40dp chứa video trắng; chữ forest14dp ExtraBold, chiều ngang vừa nội dung. Dùng chung ở detail và session, giữ callback URL đã xác minh (không tự đổi URL). Tham chiếu [meet-button-owner-2026-10-20.png](references/meet-button-owner-2026-10-20.png). Nhãn mới ưu tiên hơn ghi chú nhãn trung tính bên dưới.
- Màn buổi hiển thị toàn màn hình bằng trạng thái nội bộ trong component detail, không dùng native Modal hoặc sửa navigator. Cách này tránh cửa sổ session cũ còn phủ lên sheet công cụ sau khi Back trên Android; status bar do màn đang hiển thị điều khiển. Hardware Back đóng buổi trước detail.
- Nút footer “Vào lớp trực tuyến” rộng vừa icon, chữ và padding theo yêu cầu mới của owner; không kéo giãn hết phần ngang còn lại. Cho phép chữ xuống dòng ở màn hẹp/chữ lớn, giữ vùng bấm tối thiểu.
- Bổ sung ảnh session owner gửi sau ảnh detail: [session-detail-owner-2026-10-20.png](references/session-detail-owner-2026-10-20.png). Khi bấm buổi, dùng full-screen Modal trong preview (không đổi navigator khoá) thay AppSheet: header cover-a-soft, Back44dp, code/buổiN/tổng thật, badge status/tên22dp/chương13dp. Thân trắng bo28dp, bốn ô thông tin soft (ngày/giờ/mentor/hình thức), nội dung và mục tiêu. Contract chưa có mô tả/mục tiêu/tài liệu nên hiển thị thông báo chưa cung cấp và nút Tài liệu disabled, không đoạn prose/bullets/3tài liệu giả. Session ONLINE SCHEDULED/IN_PROGRESS có URL hợp lệ vẫn có hành động vào lớp trong body; COMPLETED/CANCELLED/preview/offline không join ở màn buổi. Giữ guard FULL và xử lý lỗi; Back đóng session trước detail, Reduce Motion và safe area. Không cố định Google Meet vì URL có thể là nền tảng khác.
- Nguồn [class-detail-owner-2026-10-20.png](references/class-detail-owner-2026-10-20.png), snapshot trước tại PROGRESS/evidence/class-detail-redesign/before.png.
- Hero forestDeep→mint hết chiều ngang, có vòng tròn trang trí mờ bên phải; Back icon trắng44dp trong hero, cover112×149dp, code24dp/tên khoá14.5dp trắng và badge classStatus coral. Bỏ thanh tiêu đề Chi tiết lớp học và hero card thụt lề. 320dp/font130% có thể xếp dọc để giữ chữ.
- Nội dung canvas bo trên28dp chồng hero28dp; stats4ô (màn hẹp/chữ lớn2cột) dùng số buổi thật, ngày bắt đầu/kết thúc và hình thức. Không bịa3/12 tiến độ,18học viên hoặc lịch tuần. Tên lớp thật thay mô tả khi chưa có description; nếu có courseDescription thì cho Xem thêm/Thu gọn, không CTA mở giả.
- Thẻ giảng viên soft/bo18dp: initials42dp nền sunshine, label11dp và tên14dp. Danh sách Buổi học phẳng, tổng buổi thật bên phải; bỏ accordion chương nhưng giữ title chương trong sheet/accessibility. Row>=64dp: icon trạng thái32dp, title14dp, metadata11.5dp buổi/thứ/ngày/giờ và nhãn trạng thái có chữ. COMPLETED chỉ là Đã kết thúc, không Đã học/điểm danh. CANCELLED không join; buổi chọn nền peach.
- Thanh hành động dưới có initials mentor và nút video/pill trắng có shadow. Chỉ FULL/ONLINE/URL http(s) hợp lệ ở response đã xác minh, session không CANCELLED; ưu tiên session đang chọn rồi IN_PROGRESS rồi SCHEDULED có URL. Không tự gọi link khi mở màn. Text trung tính Vào lớp trực tuyến vì server không bảo đảm Google Meet; không số roster/online19 giả. Preview/offline không có thanh join. Reserve vùng footer/safe area để không che buổi cuối; giữ sheet thông tin buổi và lỗi mở link.
- FULL/preview/denial/cache/route vẫn giữ quy tắc trước; không thêm API hoặc dữ liệu tiến độ/tài liệu/roster từ ảnh.

- Màn detail toàn màn hình, ẩn AppTabBar; Back44dp ở top safe area. Hero gradient forestDeep→forest→mint, padding16dp, ảnh khoá112×149dp bo14dp bên trái, mã lớp24/28 ExtraBold và tên khoá14.5/20 bên phải, badge classStatus. Tại320dp/chữ lớn ảnh thu88×117dp hoặc xếp dọc, giữ chữ/hành động đầy đủ.
- Khối nội dung canvas bo góc trên28dp chồng hero28dp, padding16dp, cuộn dọc. Metadata dạng2cột nền soft bo12dp: hình thức, ngày bắt đầu/kết thúc, mentor và số buổi từ danh sách sessions. Không dùng availableSeats để suy ra số học viên; không hiển thị thống kê tiến độ hoặc danh sách người học.
- Tên/ảnh khoá ưu tiên dữ liệu enrollment từ danh sách đã có; khi đi từ Home/lịch, tra me/classes với courseId và phân trang để tìm enrollment liên quan. Thiếu metadata khoá không chặn detail: hiển thị tên/mã lớp, ảnh fallback. Không gọi public classes/:id thay protected detail hoặc phụ thuộc public course còn active để mở lớp.
- CASH_PREVIEW: banner sunshine “Đang chờ xác nhận thanh toán tiền mặt — chỉ xem trước” và expiresAt nếu có. Không có meetingUrl/nút vào lớp/tài liệu. FULL: hiển thị chương và buổi theo dữ liệu. Mỗi chương có title, số buổi và mở/đóng; mặc định mở chương chứa sessionId được chọn hoặc chương đầu.
- Row buổi phẳng: số buổi, title14.5/20 Bold, ngày/giờ12.5/18, trạng thái có chữ. Session CANCELLED vẫn hiển thị, không join; không gọi COMPLETED là đã điểm danh hoặc hoàn thành bài. Không có nút đánh dấu đã học.
- Bấm buổi mở AppSheet thông tin: tên buổi20/26, tên chương, ngày/giờ, phòng nếu có, hình thức và trạng thái; không dựng đoạn mô tả/mục tiêu/tài liệu giả từ HTML. Chỉ một lớp modal; Back đóng sheet trước rồi detail.
- FULL + ONLINE + session không CANCELLED + URL hợp lệ từ protected detail mới có “Vào lớp trực tuyến” (min-height52dp). Ưu tiên meetingUrl của session, fallback root khi session thiếu; không dùng URL từ cache quyền cũ. Kiểm tra URL https/http trước khi đưa cho Linking, không dùng google.com/meet chung hoặc URL tự dựng. Lỗi mở link báo rõ và giữ detail. OFFLINE chỉ hiển thị roomName hoặc “Chưa có thông tin phòng”.
- Từ lịch/Home truyền sessionId: sau tải detail, mở đúng chương và cuộn/highlight buổi, không tự mở link. Không tìm thấy sessionId thì báo “Buổi học không còn trong lịch lớp”, vẫn cho xem lớp nếu có quyền.
- Detail không có timezone: dùng response.timeZone của lịch nếu có; fallback Asia/Ho_Chi_Minh (quy ước nghiệp vụ hiện tại), không theo timezone thiết bị. Ngày thuần giữ nguyên; timestamp được format đúng múi giờ.
- Loading skeleton hero/chương. Empty units/sessions có lời giải thích, không tạo nội dung thay. 403 xoá ngay chi tiết nhạy cảm/link học, refetch list và chuyển sang quyền hiện tại; không loop FULL↔preview. 404 hiển thị “Không tìm thấy lớp” + về danh sách. Lỗi mạng retry; chỉ giữ stale detail trong cùng scope/quyền đã xác minh, không giữ FULL sau denial/logout.
- Accessible labels/state expanded cho chương, focus sheet, target44dp, chiều cao theo chữ, Reduce Motion theo motion.ts. Tài liệu/roster/ghi chú/video trong base không thuộc phạm vi Phase 3.

## API / dữ liệu

[§14.2–14.3](../../API_CONTRACT/my-classes.md): GET `/me/classes/:classId` hoặc `/preview`; classUnitId và sessionId nguyên bản. FULL không đồng nghĩa quyền tài liệu. Mapping view model không thêm field attendance/progress. Không truyền meetingUrl hay DTO qua navigation params.

## Task

### 3.4.1 Hero và chương/buổi
- Test FULL/preview, units rỗng, thông tin null, tên dài, dates, session bị huỷ và sessionId không còn tồn tại.
- testID `class-detail-back`, `class-detail-unit-{classUnitId}`, `class-detail-session-{sessionId}`; i18n `classDetail.*`.

### 3.4.2 Thông tin buổi và hành động
- Test mở/đóng sheet, focus, callback link hợp lệ, không join ở preview/offline/cancelled, lỗi mở link, đổi quyền không giữ URL.
- testID `class-session-sheet`, `class-session-join`, `class-detail-retry`; i18n `classDetail.session.*`, `classDetail.access.*`.

## Nghiệm thu

- [x] Luồng list/schedule/Home mở đúng lớp và buổi, Back giữ ngữ cảnh.
- [x] Preview không có URL học; denial loại ngay dữ liệu nhạy cảm.
- [x] Đối chiếu native FULL/preview/empty/error/320dp và ghi sai khác.

## Đồng bộ checklist (2026-10-22)

Đối chiếu bằng chứng đã ghi, không chạy lại test trong lượt đồng bộ này. Xem [bảng đối chiếu và giới hạn](../../PROGRESS/ACCEPTANCE_SYNC_2026-10-22.md) và [PROGRESS liên quan](../../PROGRESS/PHASE_03_STUDENT_LEARNING/PHASE_03_04_CLASS_DETAIL.md). Trạng thái Done của phase giữ theo UAT owner đã có; checkbox chỉ phản ánh phạm vi kiểm chứng, không tự thay xác nhận owner.

Các nhánh FULL/CASH_PREVIEW/NONE, thay đổi quyền và dữ liệu có buổi được ghi theo unit/MSW/fixture khi chưa có dataset backend phù hợp. Có native protected detail bổ sung lúc 18:44 ngày 2026-10-20; Student roster, các dataset còn thiếu và TalkBack/iOS thủ công giữ giới hạn tại API_REVIEW.
