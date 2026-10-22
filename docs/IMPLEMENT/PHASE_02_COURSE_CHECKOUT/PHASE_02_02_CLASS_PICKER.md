# 2.2 Sheet khoá học và chọn lớp

## Mô tả

Giỏ hàng nhận **lớp** (`classId`). Chạm một khoá học (thẻ gợi ý, “Xem khoá học”, thẻ lưới hoặc nút mũi tên) mở sheet
khoá học: ảnh, mã · danh mục, tiêu đề, mô tả, danh sách **Lớp đang mở** với nút “Chọn lớp”, giá và “Mua ngay” (Q2).

## Đặc tả UI từ Claude Design (Claude Code bàn giao, 2026-10-17 23:53)

- Nguồn: artifact Home version **`1792255829-893f`**, mục 2, `sheet = 'course'` —
  [bản trích dòng 955–1026 và 1703–1749](references/source/courses-cart-payment-design.html). Ảnh đối chiếu:
  [claude-course-sheet-classes.png](references/claude-course-sheet-classes.png).
- Khung sheet chung: [2.3](PHASE_02_03_CART_SHEET.md#khung-sheet-chung). Toàn bộ nội dung cuộn trong sheet (tối đa
  82% màn); hàng giá + “Mua ngay” là phần cuối nội dung, **không** cố định.
- Biến thể `sheet = 'classes'` (dạng gọn: ô 56×56 + tên + giá, danh sách lớp, nút “Xem giỏ hàng”): owner quyết định
  **bỏ** (chat 2026-10-17). Không triển khai, không tạo component/testID/i18n cho biến thể này.

| Phần | Thông số |
| --- | --- |
| Ảnh | tỉ lệ 16:9, bo 18, margin dưới 14; `CoverImage` hoặc sọc 135° `cover-*` 10px / trong suốt 10px trên `cover-*-soft` |
| Eyebrow | “{code} · {danh mục}” 12/900 tracking 0.1em `mint` |
| Tiêu đề | margin `4 0 8`, **22 / 900** line-height 1.25 tracking −0.44 `black` |
| Mô tả | margin dưới 14, 14.5 line-height 1.6 `muted`; ẩn khi `description` null; dài hơn 4 dòng thì cắt + “Xem thêm” 14/800 `mint` |
| Hàng “Lớp đang mở” | căn theo baseline, `space-between`, margin `2 0 10`: “Lớp đang mở” **16 / 800**; “{n} lớp” 12.5/700 `muted` |
| Danh sách lớp | cột, gap 10, margin dưới 18 |
| Thẻ lớp | hàng, căn giữa, gap 12, padding `12 14`, bo 16, viền **1.5** `line`, nền `canvas`. Lớp đang chọn: viền `mint`, nền `soft` |
| — dòng 1 | hàng gap 8: tên lớp 15/800 `black`; badge hình thức padding `2 8`, pill, nền `line`, chữ 10.5/800 `forest` |
| — dòng 2–3 | margin-top 4, 13 line-height 1.5 `muted`: “{dd/MM} – {dd/MM} · {lịch}” xuống dòng “Mentor {tên} · ” + “còn {n} chỗ” 700, màu `headsup` khi n ≤ 5, `muted` khi > 5 |
| — nút | cao 36, padding ngang 14, pill, không viền, 13/800. Chưa chọn: “Chọn lớp”, nền `forest`, chữ `canvas`. Đã chọn: “✓ Đã chọn”, nền `line`, chữ `forest` |
| Hàng đáy | hàng căn giữa gap 10: giá **22 / 900** `forest` (flex 1); “Mua ngay” cao 50, padding ngang 20, bo 14, nền `action`, chữ `canvas` 15/900 |

`{lịch}` trong nguồn là chuỗi mẫu “T2 · T4 · T6, 19:00”; app tính từ buổi học thật (xem API).

## Hành vi (theo script nguồn)

- **“Chọn lớp”** thêm ngay lớp đó vào giỏ; thành công → thẻ chuyển “✓ Đã chọn”, toast “Đã thêm lớp {tên} vào giỏ”.
- **“✓ Đã chọn”** bấm lại → bỏ lớp khỏi giỏ; toast “Đã bỏ {tên} khỏi giỏ”.
- Mỗi khoá chỉ một lớp được chọn: chọn lớp khác khi đã có một lớp cùng khoá trong giỏ thì **đổi lớp**. App làm tuần
  tự `POST` lớp mới → thành công mới `DELETE` lớp cũ; `POST` lỗi thì giữ lớp cũ. (Nguồn lưu theo khoá, API lưu theo lớp.)
- **“Mua ngay”**: khoá đã có lớp trong giỏ → mở sheet Giỏ hàng. Chưa có → thêm lớp mặc định rồi mở giỏ. Nguồn chọn lớp
  đầu danh sách; app chọn lớp OPEN còn chỗ có `startDate` sớm nhất. Không còn lớp nào còn chỗ → “Mua ngay” disabled.
- Lớp hết chỗ (`availableSeats = 0`, nguồn không có trạng thái này): thẻ opacity 0.55, dòng ghế “Hết chỗ” `status-red`,
  nút “Hết chỗ” nền `line` chữ `muted`, không bấm được.
- Ảnh 4 khớp trạng thái chưa chọn của nguồn.

## Trạng thái

- Loading: skeleton ảnh + 3 dòng chữ + 2 thẻ lớp. Error: thông điệp + Thử lại trong sheet. Không có lớp OPEN:
  “Khoá học chưa có lớp mở.” 14/600 `muted` thay danh sách, “{n} lớp” ẩn, “Mua ngay” disabled (opacity 0.6).
- Lịch chưa tải xong hoặc lỗi: dòng 2 chỉ hiện khoảng ngày, không báo lỗi.
- Pending một thẻ: nút thẻ đó hiện spinner, các nút “Chọn lớp” khác và “Mua ngay” khoá; **không** đổi trạng thái thẻ
  trước khi server trả kết quả (ADR-0011). Pending “Mua ngay”: nút spinner, khoá đóng sheet.
- Lỗi theo `code` (BUSINESS_RULES §3), toast lỗi, giữ trạng thái cũ: `CART_ITEM_ALREADY_EXISTS` → refetch giỏ (coi như đã
  chọn); `CART_LIMIT_EXCEEDED` → “Giỏ đã đủ 20 lớp.”; `CLASS_FULL` → “Lớp đã hết chỗ.” + refetch lớp;
  `CLASS_NOT_OPEN`/`CLASS_NOT_FOUND` → “Lớp không còn mở đăng ký.” + refetch; `CLASS_ALREADY_ENROLLED` → “Bạn đã học lớp này.”;
  `CART_ITEM_NOT_FOUND` khi bỏ chọn → refetch im lặng.

## Tương tác

- Kéo xuống/chạm nền phủ/Back Android đóng sheet (trừ khi pending).
- Accessibility: mỗi thẻ đọc đủ tên, hình thức, khoảng ngày, lịch, mentor, số chỗ; nút có `accessibilityState.selected`
  khi “✓ Đã chọn”, hint “Bấm để bỏ khỏi giỏ”; “Mua ngay” hint “Thêm lớp vào giỏ và mở giỏ hàng”. Vùng chạm nút 36 mở rộng
  `hitSlop` tới 44.

## API / dữ liệu

- UI: props `course`, `classes`, `schedules`, `cartClassIds`, `pendingClassId`, `status`, `onPick(classId)`,
  `onUnpick(classId)`, `onBuy()`.
- API (2.6): `GET courses/:courseId` (mô tả), `GET courses/:courseId/classes?pageSize=20`; lịch từ `GET classes/:classId`
  (`units[].sessions[].startsAt`, múi giờ `Asia/Ho_Chi_Minh`); `POST me/cart/items { classId }`,
  `DELETE me/cart/items/:classId`; trạng thái chọn từ `GET me/cart`.
- Ngày `startDate`/`endDate` là ngày thuần: format từ chuỗi, không qua `Date` (BUSINESS_RULES §7).

## Bước của phase

- Bước: **UI**. Test UI bằng callback/fixture.

## Task

### 2.2.1 Khung sheet, thông tin khoá và danh sách lớp

- Test trước: ảnh/eyebrow/tiêu đề/mô tả (ẩn khi null, “Xem thêm”); “{n} lớp”; màu số chỗ ở ngưỡng 5; hết chỗ disabled;
  lớp trong giỏ hiện “✓ Đã chọn” viền `mint`; empty/loading/error.
- testID: `course-sheet`, `course-sheet-title`, `course-sheet-description`, `course-sheet-class-{id}`,
  `course-sheet-pick-{id}`, `course-sheet-seats-{id}`, `course-sheet-empty`, `course-sheet-error`, `course-sheet-retry`.
- i18n key: `courseSheet.openClasses`, `courseSheet.classCount`, `courseSheet.seats`, `courseSheet.full`,
  `courseSheet.mentor`, `courseSheet.pick`, `courseSheet.picked`, `courseSheet.empty`, `courseSheet.more`.

### 2.2.2 Lịch học rút gọn

- Test trước: `summarizeSchedule(sessions, timeZone)` → `{ weekdays: ['T2','T4','T6'], time: '19:00' }` → “T2 · T4 · T6, 19:00”;
  CN đúng; giờ lệch chọn giờ phổ biến nhất; rỗng → `null`.

### 2.2.3 Chọn, bỏ chọn, đổi lớp và Mua ngay

- Test trước: “Chọn lớp” gọi `onPick` một lần dù bấm lặp; “✓ Đã chọn” gọi `onUnpick`; khoá đã có lớp A, chọn B →
  `onPick(B)` (controller đổi lớp); “Mua ngay” khi có lớp trong giỏ → `onOpenCart` không thêm; khi chưa có → `onBuy()`;
  pending khoá thao tác; mỗi mã lỗi đúng thông điệp.
- testID: `course-sheet-price`, `course-sheet-buy`, `course-sheet-toast`.
- i18n key: `courseSheet.buy`, `courseSheet.added`, `courseSheet.removed`, `cart.errors.*`.

## Tiêu chí nghiệm thu

- [ ] Khớp nguồn `1792255829-893f` và ảnh 4: ảnh 16:9, eyebrow, tiêu đề, mô tả, “Lớp đang mở · n lớp”, thẻ lớp viền 1.5,
      badge hình thức, lịch, mentor, số chỗ, “Chọn lớp” / “✓ Đã chọn”, giá + “Mua ngay”.
- [ ] Chọn/bỏ/đổi lớp và Mua ngay đúng hành vi nguồn; không optimistic; lỗi theo `code`.


### Điều chỉnh trực tiếp từ owner — 2026-10-18

Bọc danh sách lớp trong một thẻ chung bo góc, viền line, nền soft, padding 10dp. Vùng danh sách chỉ cao bằng hai lớp đầu cộng khoảng cách 10dp; từ lớp thứ ba trở đi cuộn dọc bên trong. Đo chiều cao thực tế để hỗ trợ chữ lớn và nội dung xuống dòng. Với tối đa hai lớp, hiển thị tự nhiên, không cuộn nội bộ. Giá và nút Mua ngay nằm ngoài vùng cuộn lớp.


### Cố định modal theo owner — 2026-10-18

Modal chi tiết khoá học dùng chiều cao cố định 94% màn hình, không cuộn toàn modal và không kéo nội dung/tay nắm để đổi vị trí. Chỉ danh sách lớp cuộn, vùng này được co khi cần để giá/nút mua không tràn đáy. Đóng bằng nền mờ hoặc Back. Sheet giỏ và bộ lọc giữ hành vi hiện tại.


### Thu gọn khoảng trắng và đưa noti lên trên theo owner — 2026-10-18

Thay chiều cao cố định 94% bằng chiều cao vừa nội dung, giới hạn tối đa 94%, vẫn không có ScrollView bao ngoài và không nhận kéo modal. Bỏ mt-auto ở hàng giá/Mua ngay để không đẩy giá ra xa danh sách. Thông báo chọn/bỏ lớp tạm thời hiển thị overlay ở đầu modal (top 12dp), không chiếm chiều cao nội dung hoặc chặn thao tác. Owner sẽ xây component thông báo dùng chung sau.


### Giảm khoảng trắng dưới giá theo owner — 2026-10-18

Giảm padding dưới của modal khoá học từ 32dp + safe area xuống 8dp + safe area. Modal vừa nội dung nên chiều cao giảm 24dp; giữ khoảng an toàn cho thanh điều hướng hệ thống.


### Chọn tạm và nút giỏ riêng theo owner — 2026-10-18

Thay hành vi Chọn lớp tự thêm giỏ bằng lựa chọn tạm một lớp trong mỗi khoá. Bấm lớp khác chuyển lựa chọn, bấm lớp đã chọn để bỏ chọn, không sửa giỏ. Thêm nút icon giỏ 50×50dp, bo 14dp, nền soft/viền forest bên trái nút Mua ngay, nhãn accessibility Thêm lớp đã chọn vào giỏ hàng. Icon giỏ thêm lớp đang chọn và giữ modal; Mua ngay thêm lớp đang chọn rồi mở giỏ. Khoá cả hai khi chưa chọn/lớp hết chỗ/pending. Mở lại modal khởi tạo lựa chọn từ lớp đã có trong giỏ; bỏ lựa chọn tạm chưa lưu khi đóng. Chỉ một lớp mỗi khoá trong giỏ; thêm mới thành công trước bỏ cũ, chống tap lặp và giữ cũ khi thêm lỗi. Toast chỉ xuất hiện sau xác nhận thêm giỏ.


### Modal detail theo ảnh owner — 2026-10-18

Owner yêu cầu sửa UI theo ảnh codex-clipboard-ab04abfc-b691-46dc-aac4-4be04dd0c711.png: hero ảnh tỉ lệ 8:5, bo 20dp, gradient tối phía dưới; mã khoá · danh mục màu sunshine 12dp và tiêu đề canvas 22dp đặt trong ảnh, padding 16dp. Mô tả 14dp/22dp dưới hero, cách 14dp. Header lớp 15dp; các lớp viền line 1dp, bo 16dp, padding 14×12dp, cách 10dp; lịch/mentor 12dp/18dp, nút chọn 36dp. Thẻ bọc danh sách giữ cấu trúc nhưng bỏ nền/viền/padding ngoài để sát ảnh mẫu. Giá 20dp, CTA 50dp bo 14dp. Giữ icon thêm giỏ, chọn tạm một lớp mỗi khoá, hai lớp trong viewport, cuộn nội bộ, noti trên, đệm đáy 8dp + safe area và định dạng VND đã chốt. Nhãn ảnh khoá học trong ảnh tham chiếu là chú thích placeholder, không đưa vào UI thật.


### Ảnh full width theo owner — 2026-10-18

Ảnh hero của modal phủ hết chiều ngang modal, bỏ khoảng đệm 18dp hai bên bằng margin ngang −18dp của hero. Giữ tỉ lệ 8:5, bo góc20dp, gradient và chữ trong ảnh. Các phần mô tả/lớp/giá giữ đệm ngang hiện tại.


### Full width hai mép, bỏ bo ảnh — 2026-10-18

Owner bổ sung: bên phải phải sát mép, không cần bo tròn ảnh. Hero dùng width lấy từ useWindowDimensions và margin-left −18dp, không dùng width auto với margin âm hai bên (gây lỗi layout/SVG trên Android). Bỏ radius hero, giữ gradient và title; nội dung dưới vẫn có đệm.


### Khối nội dung chồng ảnh và viewport 2,5 lớp theo owner — 2026-10-18

Theo ảnh codex-clipboard-7020ed9b-27a2-435f-9a56-c334043b1b92.png: giữ ảnh full width không bo, thêm khối trắng full width bo hai góc trên 22dp chồng lên đáy ảnh 22dp, padding ngang18dp/trên22dp. Dời chữ trong hero lên để không bị khối trắng che. Vùng danh sách đo ba hàng đầu: height=hàng1+hàng2+2×gap10dp+0,5×hàng3; từ ba lớp trở lên cuộn bên trong. Với tối đa hai lớp, tự cao theo nội dung, không cuộn nội bộ. Ở màn hình thiếu chiều cao, vùng lớp có thể co để giữ footer truy cập được. Giữ icon giỏ, chọn tạm, Mua ngay, VND và API đã chốt.

Owner nhắc phần description: mô tả từ course detail phải hiện đầu khối trắng, trước header Lớp đang mở, không co mất khi danh sách có nhiều lớp; giữ chữ 14/22dp và Xem thêm cho mô tả dài. Không tạo mô tả giả khi API trả null.

### Giữ layout khi đổi trạng thái chọn lớp — 2026-10-18

Owner báo nhãn Đã chọn rộng hơn Chọn lớp làm tiêu đề bị ép xuống dòng. Đặt tên lớp/badge trong hàng riêng dùng toàn bộ chiều ngang thẻ; lịch/mentor và nút nằm hàng dưới. Nút có chiều rộng104dp thống nhất ở trạng thái chọn/chưa chọn/hết chỗ/loading, không co; khi fontScale>1,2 giữ bố cục dọc với nút rộng toàn hàng để nhãn lớn không bị cắt. Tiêu đề được xuống dòng tự nhiên theo nội dung, nhưng không đổi số dòng vì chọn/bỏ chọn. Viewport vẫn đo chiều cao thẻ thật cho2,5lớp; không đổi hành vi/API.

### Kéo thanh nắm xuống để đóng — 2026-10-18

Theo owner, modal cố định vẫn phải kéo xuống từ thanh nắm để đóng. Tách quyền kéo handle/đóng khỏi scrollable: bật khi không locked, giữ content panning và outer scroll tắt cho course detail. Khi mutation pending, handle/đóng vẫn khoá. Không bật cuộn toàn modal; danh sách lớp giữ cuộn riêng.
