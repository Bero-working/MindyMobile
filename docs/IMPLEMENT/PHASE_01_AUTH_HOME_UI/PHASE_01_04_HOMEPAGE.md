# 1.4 Student Homepage — bản 2

## Mô tả

Dùng mục **2 — Bản chỉnh theo góp ý — dựa trên 1b**, biến thể **2a** của
[artifact Homepage](https://claude.ai/artifact/YMKY9dp3DFE9BQ69Er6rjD). Đã xác nhận bằng DOM và ảnh trong
[bản ghi nguồn](references/DESIGN_SOURCE.md). Không lấy bố cục `1a`/`1b` ở phía dưới artifact.

Mockup rộng 390, cao 844, cuộn dọc và có tab bar cố định. Mobile thích nghi safe area/màn nhỏ/chữ lớn,
không dựng vỏ máy/status bar giả. Thứ tự section phải giữ:

| #   | Section                        | Chi tiết                                                                                             |
| --- | ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| 1   | Hero mint                      | Logo giữa, giỏ góc phải, lời chào và “Cứ thử. Bạn sẽ làm được.” trái, mascot phải tràn qua đáy       |
| 2   | Buổi học tiếp theo             | Khối sunshine bo 20, giờ/lớp/bài, CTA Vào lớp                                                        |
| 3   | Khoá học nổi bật               | Tối đa 4 item lưới 2×2, gap 12, ảnh dọc 3:4 bo 20, gradient tối, badge hình thức/ngày, title/giá/`+` |
| 4   | Khám phá khoá học              | CTA outline pill rộng vùng nội dung                                                                  |
| 5   | Có nhiều cách để bắt đầu.      | Carousel 3 slide giới thiệu, mỗi slide có ảnh/mascot/mô tả/CTA và chấm chuyển                        |
| 6   | Viết code ngay trên điện thoại | Khối logo-soft, lợi ích, Thử compiler, terminal forest minh hoạ nghiêng nhẹ                          |
| 7   | Ghi chú Về chúng tôi           | Nền mint, giấy trắng nghiêng/góc gấp/băng dính, 3 ghi chú và chấm chuyển                             |
| 8   | Footer                         | Brand/tagline, nhóm Học tập/Hỗ trợ và copyright                                                      |
| 9   | Tab bar cố định                | Khoá học · Lịch học · Trang chủ · Thông báo · Tài khoản; Home nút tròn ở giữa                        |

## Đặc tả UI từ Claude Design (Claude Code bàn giao, 2026-10-17 16:11)

Nguồn: Home `YMKY9dp3DFE9BQ69Er6rjD` version `1792222488-748f`, mục 2 / 2a, trạng thái `tab = 2` (Trang chủ).
Bản trích: [source/home-2a-design.html](references/source/home-2a-design.html) (markup + dữ liệu `courses`,
`slides`, `notes`, `tabs`, `deco`). Ảnh: [header](references/claude-home-v2-header.jpg),
[carousel](references/claude-home-v2-carousel.jpg), [compiler](references/claude-home-v2-compiler.jpg),
[ghi chú](references/claude-home-v2-about.jpg). Quy tắc chung ở
[1.1](PHASE_01_01_DESIGN_FOUNDATION.md#đặc-tả-ui-từ-claude-design-claude-code-bàn-giao-2026-10-17-1611).

### Khung màn

- Một `ScrollView` dọc toàn màn, nền `canvas`. Lớp phủ cố định: **top bar thu gọn** (trên cùng) và **tab bar nổi**
  (dưới cùng). Không có header cố định khi chưa cuộn.
- Thứ tự trong scroll: Hero → Buổi học tiếp theo → Khoá học nổi bật + Khám phá → Carousel giới thiệu →
  Compiler → Ghi chú → Footer.
- **Không** bọc `regionVars.home` (D1, ADR-0020). Mỗi phần dùng đúng màu ghi trong bảng; chữ không ghi màu là `black`.

### 1. Hero

| Phần | Thông số |
| --- | --- |
| Khối | Nền `mint`, chữ `canvas`, cao tối thiểu `insets.top + 190` (thiết kế 236), padding dưới **26**. Khung cha `position:relative` để mascot tràn ra ngoài |
| Hàng nav | Lưới 3 cột `44 · 1fr · 44`, padding `2 14 0`, đặt dưới `insets.top` |
| Logo (giữa) | 2 dòng căn giữa, line-height 1: “Mindy” **19 / 900** tracking −0.19; “CODING” **10.5 / 800** tracking 0.24em (2.52) màu `sunshine`, `margin-top:2`. Bấm = cuộn lên đầu |
| Giỏ hàng (phải) | Nút 44×44, icon 22 stroke `canvas` 2: `M3 4h2l2.4 11h11l2-8H6.2` + 2 chấm tròn r1.4 tại (9,20),(18,20). Không hiện badge số (chưa có dữ liệu giỏ) |
| Lời chào | Khối padding `18 18 0`, **rộng tối đa 200**. “Xin chào, {displayName}” **14 / 700** màu `line` |
| Tiêu đề | `margin-top:12` (owner yêu cầu hạ thêm8dp), **27 / 900**, line-height 1.12 (30.2), tracking −0.54, `canvas`: “Cứ thử. Bạn sẽ làm được.” — một chuỗi, tự xuống dòng trong 200dp (ra 2 dòng “Cứ thử. Bạn sẽ” / “làm được.”) |
| Mascot | `mindy-mascot-laptop.png` **196 × 157**, tuyệt đối `right:-4; bottom:-14` của khung hero, **z trên** thẻ Buổi học, không nhận chạm. Bóng `drop-shadow 0 10 14 rgba(18,48,46,.28)`: iOS dùng shadow trên Image (theo alpha); Android bỏ bóng (sai khác chấp nhận) |

Bản triển khai trước: logo 1 dòng, tiêu đề ~3 dòng cỡ lớn chiếm hết bề ngang, mascot nhỏ nằm trong hero → sai.

### Top bar thu gọn (khi cuộn)

- Hiện khi `scrollY > 150`, ẩn khi ≤ 150. Tuyệt đối trên cùng, nền `mint`, bóng `0 6 18 forest/18`, cao
  `insets.top + 52`; hàng nav giống hero (padding `0 14 8`): logo 2 dòng + giỏ hàng.
- Thiết kế đổi tức thì (`translateY(-105%) ↔ 0`, opacity 0/1, không transition). Mobile: trượt từ trên xuống kết hợp fade, 200ms easing out cubic; cả xuất hiện và ẩn đều có chuyển động. Giữ header mounted để chạy được chiều ẩn; khi ẩn bỏ nhận chạm và ẩn khỏi trình đọc màn hình. Reduce Motion: đổi tức thì.

### 2. Buổi học tiếp theo

| Phần | Thông số |
| --- | --- |
| Khối | `margin 26 16 0`, padding `14 16`, bo **20**, nền `sunshine`, hàng ngang gap 12, căn giữa dọc |
| Dòng 1 | **12 / 800**, `forest`: “Buổi học tiếp theo · {giờ} {hôm nay \| dd/MM}” |
| Dòng 2 | **15.5 / 900** đen, `margin-top:2`: “{classCode} · {sessionTitle}”, cắt 2 dòng |
| Nút “Vào lớp” | Cao 40 → **44** (vùng chạm), padding ngang 14, bo **12** (không phải pill), nền `forest`, chữ `canvas` **13 / 900**. Không gradient |

Chỉ 2 dòng chữ. Bản trước có 3 dòng (tiêu đề / giờ / “Buổi 3 · …”) và nút pill gradient → sai.

### 3. Khoá học nổi bật

| Phần | Thông số |
| --- | --- |
| Khối | padding `28 16 0` |
| Tiêu đề | “Khoá học nổi bật” **22 / 900** tracking −0.44 |
| Lưới | 2 cột, gap **12**, `margin-top:14`, tối đa 4 thẻ |
| Thẻ | Tỉ lệ **3:4**, bo **20**, `overflow:hidden`. Ảnh: `imgUrl` cover qua `CoverImage`; null/lỗi → nền chờ: thẻ thứ i dùng nền `cover-{a..d}-soft` + sọc chéo 135° rộng 9dp màu `cover-{a..d}` cách nhau 9dp (SVG pattern), không icon, không nhãn “ảnh khoá học” (nhãn đó là chỗ trống của công cụ thiết kế) |
| Lớp phủ đáy | Tuyệt đối đáy, padding `44 12 12`, gradient `G-tile` |
| Meta | **11 / 800** `sunshine`: “{ONLINE\|OFFLINE} · KG {dd/MM}”. Thiếu dữ liệu lớp OPEN thì ẩn dòng |
| Tên | **15 / 900**, line-height 1.25, `canvas`, `margin-top:3`, tối đa 3 dòng |
| Hàng giá | `margin-top:8`, giãn hai đầu, gap 6. Giá **15 / 900 `canvas`** (không phải sunshine), format theo BUSINESS_RULES §7 (`1.500.000 ₫`; thiết kế ghi `1.500.000đ`, sai khác theo nguồn ưu tiên cao hơn) |
| Nút `+` | Hình tròn **34×34** nền `action`, glyph “+” **17 / 900** `canvas`; giữ kích thước nhìn 34, mở vùng chạm 44 bằng `hitSlop` 5. Bản trước làm tròn trắng 44 viền mint → sai |
| Nhấn thẻ | Scale 0.97 (Motion ở 1.1) |

Nút “Khám phá khoá học”: `margin-top:16`, rộng 100%, cao **52**, pill, nền `canvas`, viền **2 đen**, chữ
**15 / 900 đen** “Khám phá khoá học” + “→” cỡ 18, gap 10. **Bóng cứng `0 4 0 #000`**.

> **Nút 3D** (dùng cho Khám phá, CTA slide, Thử compiler): một `View` đen cùng bo góc đặt lệch xuống **4dp** phía
> sau nút; khi nhấn, nút dịch xuống 3dp (còn lộ 1dp). Không dùng `elevation` vì Android không vẽ được bóng cứng lệch.

### 4. Carousel “Có nhiều cách để bắt đầu.”

- Khối `padding-top:34`. Tiêu đề `margin 0 16`, **28 / 900**, line-height 1.1, tracking −0.84:
  “Có **nhiều cách**” (cụm “nhiều cách” màu `mint`) xuống dòng “để bắt đầu.”
- Carousel ngang phân trang, mỗi trang rộng màn, không có padding ngoài theo yêu cầu owner (full-width); nội dung thẻ vẫn padding ngang18dp, `padding-top:40` (chỗ cho mascot tràn lên).
- Thẻ slide: **không bo góc**, padding `66 18 22`, nền theo slide. Mascot tuyệt đối:

| # | Nền | Mascot | Vị trí / cỡ |
| --- | --- | --- | --- |
| 1 | `sunshine` | `mindy-mascot-map.png` | `left:14; top:-44`, rộng 104 (104×107) |
| 2 | `logo-soft` | `mindy-mascot-laptop.png` | `right:10; top:-50`, rộng 140 (140×112) |
| 3 | `banner` | `mindy-mascot-book.png` | giữa ngang (`left: 50% − 38`), `top:-36`, rộng 76 (76×91) |

  Mascot map/book độ phân giải thấp (170×175, 137×164 px) sẽ hơi mờ ở 104/76dp; giữ nguyên, ghi khi UAT.
- Trong thẻ: tiêu đề **23 / 900**, line-height 1.2, tracking −0.46, `margin-bottom:8` → đoạn **14.5**,
  line-height 1.6, `margin-bottom:16` → khung ảnh nền `teal` padding **9**, bóng `0 8 18 forest/22`,
  `margin-bottom:18`, ảnh **4:3** cover hoặc khung trống (D3, xem “Khung ảnh slide” dưới) → CTA nút 3D cao **46**,
  padding ngang 22, chữ **14 / 900** “{cta} →”, gap 12, căn trái.
- Chấm: `padding-top:18`, căn giữa, gap 10; cao 8, rộng 8 / đang chọn **28**; màu đang chọn **đen**, còn lại `banner`.

| # | Tiêu đề | Đoạn | CTA |
| --- | --- | --- | --- |
| 1 | Khởi đầu của riêng bạn. | Ai cũng có một điểm xuất phát. Bắt đầu từ điều cơ bản và đi theo nhịp học của mình. | Cách bắt đầu |
| 2 | Không ai phải học một mình. | Lớp tối đa 20 học viên, mentor theo sát từng bài tập và trả lời trong 24 giờ. | Gặp mentor |
| 3 | Dự án đầu tiên sau 4 tuần. | Mỗi khoá học kết thúc bằng một sản phẩm bạn có thể khoe với bạn bè. | Xem dự án |

  Copy dùng nguyên văn qua i18n production (D4 đã duyệt).

  **Khung ảnh slide (D3)**: ảnh chưa có, khung để trống nhưng thay ảnh chỉ cần 1 bước:
  - Hằng `HOME_INTRO_IMAGES` trong `src/modules/home/constants/homeIntro.constant.ts`, khoá `start` / `mentor` /
    `project`, giá trị `ImageSourcePropType | undefined` (hiện tất cả `undefined`). Thêm ảnh = đặt file vào
    `src/assets/images/home/` (ví dụ `intro-mentor.jpg`) và gán `require(...)`; hoặc truyền `{ uri }` khi có CMS/API.
  - Có ảnh: `CoverImage` tỉ lệ 4:3 `resizeMode=cover`, label từ i18n `home.intro.slides.{key}.imageAlt`.
  - Không có ảnh: khung trống cùng tỉ lệ 4:3, nền `canvas/60` trên viền `teal` 9dp, **không chữ, không icon**, ẩn với
    trình đọc màn hình. Không dùng `student-certificate.png`.
  - Ảnh khuyến nghị: JPG/WebP ngang 4:3, tối thiểu 1200×900 px. Test: có/không ảnh render đúng nhánh.

### 5. Compiler

- Khối `margin 44 16 0`, `position:relative`.
- Panel: `margin-left:52`, bo **32**, nền `logo-soft`, padding `26 18 24 110`, cao tối thiểu 280.
  Tiêu đề **21 / 800**, line-height 1.2, `margin-bottom:14`: “Viết code ngay trên điện thoại”.
  3 dòng, mỗi dòng padding dọc 11, viền trên 1 `forest/20` (dòng cuối thêm viền dưới), **14.5 / 600**,
  line-height 1.35: “Chạy code ngay, không cần cài đặt” / “Chấm bài tự động sau mỗi lần nộp” / “Gợi ý sửa lỗi dễ hiểu”.
  CTA căn phải `margin-top:16`: nút 3D cao **42**, padding ngang 18, **13.5 / 900** “Thử compiler →”.
- Terminal (minh hoạ, ẩn khỏi trình đọc màn hình, label nhóm “Minh hoạ terminal”): tuyệt đối `left:0`,
  giữa theo chiều dọc khối, **xoay −4°**, rộng **154**, bo 14, nền `forest-deep`, bóng `0 18 30 forest-deep/35`.
  - Thanh tiêu đề: padding `8 9`, nền `forest-night`, 3 chấm 7×7 (`headsup`, `sunshine`, `mint`) gap 4,
    chữ “mindy — zsh” cỡ **8** mono `banner`, cách chấm 6.
  - Thân: padding `10 10 14`, mono **8.5**, line-height 15.3, không xuống dòng. Dòng: `$ mindy run main.py`
    (`$` `sunshine`, còn lại `canvas`) / `Đang chạy…` `banner` / `Xin chào, {displayName}!` `canvas` /
    `✓ test 1   0.12s`, `✓ test 2   0.09s`, `✓ test 3   0.21s` `aqua` / `Hoàn thành · 3/3 đạt` `action` /
    `$ ` + khối con trỏ 5×10 `canvas` (tĩnh).
  - Mono: repo không có JetBrains Mono, dùng font monospace hệ thống (`Menlo` iOS, `monospace` Android); không thêm font.

### 6. Ghi chú (Về chúng tôi)

- Khối `margin-top:44`, nền `mint`, padding `6 0 30`, `overflow:hidden`. Hai tròn trang trí: `canvas/10`
  `left:-40; top:-30; 140×140` và `canvas/5` `right:-50; bottom:40; 120×120`.
- **Không có tiêu đề “Về chúng tôi”** trong thiết kế (bản trước thêm vào → bỏ).
- Carousel ngang phân trang, mỗi trang padding `40 26 26`.
- Tờ giấy: xoay theo ghi chú, bóng `0 16 18 forest-night/35` (+ `0 2 3 forest-night/25`). Giấy nền `canvas`, padding `30 22 48`, cao tối thiểu 300.
  **Góc dưới phải gấp 46×46**: chia đôi theo đường chéo, nửa trên-trái `cream`, nửa dưới-phải là màu nền
  `mint` (vẽ bằng SVG polygon, không clip).
- Băng dính: tuyệt đối `top:28`, `right` theo ghi chú, **76×24**, `tape/80`, xoay theo ghi chú, bóng nhỏ `0 1 2 black/12`.
- Chữ: tiêu đề **26 / 900 nghiêng**, tracking −0.52, line-height 1.15, `margin-bottom:14` (repo không có
  Nunito Italic: dùng `fontStyle: italic` trên ExtraBold; nền tảng không nghiêng được thì ghi PROGRESS) →
  intro **14.5**, line-height 1.6, `margin-bottom:12` → mỗi mục “– **{b}** {t}” cùng cỡ, `margin-bottom:12`.
- Chấm: `padding-top:4`, gap 10, đang chọn `canvas` rộng 28, còn lại `canvas/40` rộng 8.

| # | Xoay giấy | Băng dính `right` / xoay | Tiêu đề | Intro | Mục |
| --- | --- | --- | --- | --- | --- |
| 1 | −1.6° | 52 / 5° | Sáng học, tối dùng luôn | Mỗi buổi học tại Mindy đều chia làm 2 phần: | **Nạp kiến thức** (Input): hiểu rõ kiến thức đó dùng khi nào, dùng như thế nào. · **Ứng dụng kiến thức** (Output): làm bài ngay trên compiler ⇒ mentor kiểm tra ⇒ học viên tự tin áp dụng vào dự án thật. |
| 2 | 1.2° | 140 / −4° | Lớp nhỏ, mentor kèm sát | Mỗi lớp tối đa 20 học viên để không ai bị bỏ lại phía sau: | **Mentor theo sát** chấm bài và góp ý cho từng dòng code. · **Hỏi đáp trong 24 giờ** mọi thắc mắc đều được trả lời trong vòng một ngày. |
| 3 | −0.8° | 70 / 3° | Học theo cách của bạn | Chọn hình thức phù hợp với lịch của mình: | **Online** học mọi lúc, mọi nơi qua lớp trực tuyến. · **Offline** gặp mentor và bạn học trực tiếp tại lớp. |

  Copy dùng nguyên văn (D4 đã duyệt).

### 7. Footer

- Nền `forest` (ngoài region nên giữ forest), chữ `canvas`, padding `28 16`, padding dưới `130 + insets.bottom`
  (chừa tab bar nổi).
- Brand: ô vuông 30×30 bo 9 nền `canvas`, chữ “M” **16 / 900** `forest`; cạnh đó “Mindy Coding” **17 / 900**, gap 8.
- Tagline `margin 10 0 18`, **14**, line-height 1.55, màu `line`: “Học lập trình. Mở thế giới của bạn.”
- Lưới 2 cột, gap dọc 18 / ngang 12. Tiêu đề cột **13 / 900** `sunshine`; link **14** `canvas`, gap 8.
  - “Học tập”: Khoá học, Lịch học, Lớp của tôi — cùng hành vi với tab tương ứng (callback preview / disabled có giải thích).
  - “Hỗ trợ”: Trợ giúp, Chính sách hoàn tiền, Điều khoản — **ẩn cả cột** tới khi có URL thật; khi ẩn, cột Học tập giữ nửa trái.
- Dòng liên hệ `margin-top:18`, **13.5**, line-height 1.7, màu `line`: “hotro@mindycoding.vn · 1900 0000” (D4 duyệt).
  Chữ thường, không gắn `mailto:`/`tel:` tới khi owner xác nhận số thật.
- Copyright: `margin-top:16`, `padding-top:12`, viền trên 1 `canvas/20`, **12** `banner`: “© 2026 Mindy Coding”.

Bản trước: footer nền trắng, chữ mint, không có link → sai.

### 8. Tab bar nổi

| Phần | Thông số |
| --- | --- |
| Khối | Tuyệt đối `left:12; right:12; bottom: insets.bottom`, cao **68**, bo **26**, nền `canvas`, bóng `0 10 30 forest/22`, lưới 5 cột, padding ngang 4. **Không** phải thanh phẳng full-width có viền trên |
| Tab bên | Pill padding `6 7`, bo 14; icon 20 stroke 2.2 + nhãn **10.5 / 900**, gap 3, không xuống dòng. Chọn: nền `mint`, chữ/icon `canvas`; không chọn: trong suốt, `muted`. Trên Home không tab bên nào được chọn |
| Trang chủ (giữa) | Tròn **78×78** nhô lên (`top:-28`), viền **6 `canvas`**, nền **`action`** khi đang ở Home (`mint` khi không), bóng `0 10 22 forest/32`, icon nhà 30 stroke `canvas` 2.3. **Không nhãn chữ** (label a11y “Trang chủ”) |
| Chấm đỏ Thông báo | Thiết kế có; **ẩn** (không badge giả) |
| Ẩn khi cuộn | Cuộn xuống (Δ>3, y>60) → trượt xuống ẩn; cuộn lên (Δ<−3) hoặc y<20 → hiện. Mobile 200ms; Reduce Motion và khi bật trình đọc màn hình: **luôn hiện** |

Icon (viewBox 24): Khoá học `M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z`; Lịch học
`M4 6h16v14H4zM4 10h16M8 3v4M16 3v4`; Trang chủ `M3 11l9-7 9 7v9h-6v-6H9v6H3z`; Thông báo
`M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4`; Tài khoản `M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0`.
Bản trước dùng icon sách cho Khoá học, nút Home tròn mint có nhãn “Trang chủ” → sai.

### Trạng thái dữ liệu (không có trong thiết kế)

Thiết kế chỉ có trạng thái success. Loading/empty/error giữ đúng khung để không nhảy layout:

- Loading: thẻ Buổi học → `Skeleton` cao 72 bo 20 nền `sunshine/50`; lưới → 4 `Skeleton` tỉ lệ 3:4 bo 20.
- Empty Buổi học: ẩn cả thẻ (không thẻ rỗng). Empty khoá học: thay lưới bằng khối nền `soft` bo 16 padding 24,
  chữ 14 / 700 `muted` căn giữa + nút 3D Khám phá vẫn hiện.
- Error vùng: khối như empty, chữ `headsup`, nút “Thử lại” (nút phụ viền `line`, cao 44).

### Sai khác của bản triển khai 2026-10-17 phải sửa (tổng hợp)

H1 panel preview đẩy màn (1.1) · H2 logo 2 dòng · H3 cỡ/độ rộng tiêu đề hero · H4 mascot tràn đáy hero ·
H5 thẻ Buổi học 2 dòng + nút bo 12 không gradient · H6 meta ONLINE·KG, giá trắng, nút `+` 34 `action` ·
H7 không icon placeholder ảnh · H8 nút 3D (Khám phá, CTA slide, compiler) · H9 thẻ slide không bo, mascot tràn
trên, khung ảnh mint · H10 terminal xoay và chồng panel `logo-soft` · H11 ghi chú không tiêu đề, giấy nghiêng,
góc gấp, băng dính · H12 footer nền forest · H13 tab bar nổi bo 26, Home tròn 78 nền action không nhãn, icon đúng bộ.

Tiêu chí đối chiếu: chụp từng section trên Pixel 8 (1080×2400, density 420, font 1.0), bộ chọn preview thu gọn,
đặt cạnh ảnh tham chiếu tương ứng. Sai lệch vị trí/kích thước ≤ 4dp chấp nhận; các sai khác có chủ đích
(giá ₫ và không tự chạy carousel là sai khác lịch sử, đã thay bởi yêu cầu owner; bóng mascot Android, font 900/nghiêng/mono) liệt kê trong PROGRESS.

## API / dữ liệu

- Catalog: [catalog.md](../../API_CONTRACT/catalog.md), category và course DTO phân trang
  `{ items, page, pageSize, total }`; `imgUrl`/`description` nullable, `priceAmount` nguyên VND.
- Tên người dùng: `UserDto.displayName` từ auth adapter; không cố định tên Minh Anh.
- Buổi học tiếp theo: [schedule §14.4](../../API_CONTRACT/my-classes.md), dùng `classId`, `sessionId`,
  `sessionTitle`, `startsAt`, `accessMode`; hiển thị theo `timeZone`, quyết định thời điểm theo `asOf`.
- CourseDto không có `deliveryMode`/`startDate`; badge lấy từ lớp OPEN qua adapter khi tích hợp, thiếu thì ẩn.
  Không có flag/sort featured, không tự tạo thứ hạng “bán chạy”; UI giữ thứ tự backend trả về, tối đa 4 item.
- Compiler/marketing/footer dùng nội dung tĩnh qua i18n. Copy cam kết và email/hotline đã được owner duyệt (D4);
  “20 học viên” trong copy không thay capacity thật từ backend.
- Mọi field trong bản 2 phải có nguồn: DTO hiện hữu, nội dung tĩnh hoặc fixture preview. Tiến độ học thuộc PLANNED;
  không tạo endpoint hoặc tính phần trăm giả. Phase này không triển khai query/service thật.

## Task

### 1.4.1 Layout và nội dung Student Home bản 2

- Dựng native hierarchy đúng bảng section trên. Giữ 4 item tối đa; ít hơn 4 thì hiện số thật, không chèn course mẫu.
- Giữ nhận diện/asset gốc; không áp dụng `regionVars.home` (ADR-0020); hero giữ độ tương phản theo token.
- Danh sách dùng ảnh/row phẳng theo guide, tránh tự thêm card viền/bóng vào mọi item.
- Test cần viết trước: render đúng section từ view model, tên dài/nội dung nullable không vỡ; CTA có callback/label đúng.
- testID: `home-screen`, `home-header`, `home-content`, `home-next-session`, `home-featured-courses`,
  `home-intro-carousel`, `home-compiler-section`, `home-about-carousel`, `home-footer`.
- i18n key: `home.title`, `home.greeting`, `home.sections.*`, `home.actions.*` tương ứng nội dung thực tế.

### 1.4.2 Các trạng thái dữ liệu và ảnh

- Mỗi vùng dữ liệu có loading skeleton theo layout, empty illustration + giải thích/CTA, error + retry/requestId,
  success. Lỗi một vùng không xoá các vùng khác đã có dữ liệu; refetch giữ nội dung hiện tại.
- Ảnh mạng dùng FastImage với kích thước ổn định, placeholder khi null/lỗi; SVG/local dùng asset đã xác nhận.
- Giá nếu xuất hiện dùng `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`.
- Test cần viết trước: loading/empty/error/success, ảnh null/lỗi, giá 0, tên dài, retry đúng vùng, refetch không nhấp nháy.
- testID: `home-loading`, `home-empty`, `home-error`, `home-retry-button`, `home-refresh`.
- i18n key: `home.empty.title`, `home.empty.description`, `home.empty.action`, `errors.generic`, `common.retry`.

### 1.4.3 Tương tác và giới hạn tính năng

- Pull-to-refresh truyền callback, khoá khi pending; refetch giữ nội dung. Bản 2a có 4 course, không có tải tiếp,
  search hoặc filter; không thêm infinite scroll hay query `search`/`q` từ bản 1.
- Callback Vào lớp nhận đúng `classId`/`sessionId`/`accessMode`; schedule không có meetingUrl, chỉ chuyển tới
  detail/preview khi có màn đích. Không đưa CASH_PREVIEW vào meeting như FULL hoặc ghép URL từ fixture.
- Nút `+` nhận courseId để chuyển tới chọn khoá/lớp; không thêm course trực tiếp vào giỏ vì giỏ mua **lớp**.
  Tách callback item và nút `+`, mở rộng vùng chạm từ 34×34 của mockup lên ít nhất 44×44.
- CTA tới khoá học/lịch/lớp/giỏ/tài khoản ngoài phạm vi dùng callback trong preview; app thật ẩn hoặc disabled có
  giải thích cho màn chưa tồn tại. Không tạo route rỗng để giả vờ có chức năng.
- Test cần viết trước: callback nhận đúng ID/quyền, item và `+` không kích hoạt đồng thời, không gọi mutation giỏ,
  refresh chỉ gọi khi phù hợp, disabled không điều hướng.
- testID: `home-course-{id}`, `home-course-select-{id}`, `home-join-class-button`, `home-explore-courses-button`.
- i18n key: `home.actions.unavailable`, các label tương ứng thiết kế.

### 1.4.4 Carousel giới thiệu, compiler và ghi chú

- Ba slide theo thứ tự: “Khởi đầu của riêng bạn.” / “Không ai phải học một mình.” / “Dự án đầu tiên sau 4 tuần.”;
  CTA lần lượt Cách bắt đầu / Gặp mentor / Xem dự án. Cả 3 slide dùng khung ảnh trống theo D3; không hiện nút
  Replace/Edit của công cụ design hoặc tự tạo ảnh thay thế.
- Ba ghi chú theo thứ tự: “Sáng học, tối dùng luôn” / “Lớp nhỏ, mentor kèm sát” / “Học theo cách của bạn”.
- Vuốt ngang và bấm chấm đổi slide/ghi chú; giữ vị trí cuộn dọc. Mỗi chấm có label theo số/tên và selected state,
  không dùng label giống nhau “Chuyển slide”. Tự chuyển mục kế tiếp mỗi 3 giây theo chỉ đạo owner 2026-10-18; cuối danh sách lặp về đầu.
- Terminal `mindy — zsh` và kết quả 3/3 là minh hoạ trong preview; không nhận/chạy/chấm code thật hoặc giả kết quả
  bài tập người dùng. CTA compiler chỉ callback preview/disabled trong app khi chưa có đích.
- Footer không có link `#` hoặc chính sách chưa tồn tại; email/hotline hiện dạng chữ theo D4.
- Test cần viết trước: đủ 3 slide/3 ghi chú, đổi đúng index, selected state, CTA riêng, timer 3 giây và vòng lặp,
  compiler không gọi API, link thiếu đích không bấm được, Reduce Motion chuyển trang tức thì, không có animation trượt.
- testID: `home-intro-slide-{index}`, `home-intro-dot-{index}`, `home-about-dot-{index}` (index 0–2), `home-compiler-button`.
- i18n key: `home.intro.*`, `home.about.notes.*`, `home.compiler.*`, `home.footer.*`, `home.carousel.goToSlide`.

### 1.4.5 Tab bar năm mục

- Giữ thứ tự Khoá học → Lịch học → **Trang chủ** → Thông báo → Tài khoản, Home ở giữa được nhấn mạnh.
  Không dùng tab Compiler của bản 1. Chừa bottom inset để tab bar không che footer/nút cuối.
- Preview đủ 5 tab với callback; app thật disabled có giải thích cho màn chưa có. Không tạo notification navigator
  hoặc badge giả. Home có selected state, mỗi tab có role/label riêng.
- Test cần viết trước: đúng thứ tự/selected/disabled/callback; kiểm tra safe area/chữ lớn trên thiết bị.
- testID: `home-tab-courses`, `home-tab-schedule`, `home-tab-home`, `home-tab-notifications`, `home-tab-account`.
- i18n key: `home.tabs.*`, `home.actions.unavailable`.

## Tiêu chí nghiệm thu

- [x] Đúng bản **2a**: thứ tự section, tối đa 4 course, 3 slide, 3 ghi chú, 5 tab; sai khác có lý do/ảnh trong PROGRESS.
- [x] Đủ trạng thái từng vùng dữ liệu; ảnh dự phòng, chữ dài và cỡ chữ lớn hoạt động.
- [x] Không hiển thị số liệu fixture như dữ liệu người dùng thật, không gọi API PLANNED.
- [x] Test tương tác/state xanh; Maestro dự kiến `e2e/flows/student-home-ui.yaml`.

### Điều chỉnh của owner — 2026-10-18

Tất cả carousel (Home giới thiệu, Home về Mindy, gợi ý khoá học) tự chuyển sang mục kế tiếp theo thứ tự trái → phải mỗi **3 giây**, lặp về mục đầu. Chạm chấm/vuốt đặt lại thời gian chờ; tạm dừng khi kéo và khi app ở nền. Reduce Motion giữ chu kỳ nhưng bỏ animation trượt. Chỉ đạo trực tiếp của owner thay quy tắc không tự chạy trước đây; không thay mốc UI approval/API.


### Hạ thanh tab theo owner — 2026-10-18

Thanh tab nổi Home và Khoá học dùng bottom=max(safeAreaBottom−12dp,0), hạ thêm 12dp so với vị trí safe area trước đó. Catalog giảm đệm cuối từ 120 xuống 100dp cộng safe area, bảo đảm phân trang vẫn cuộn được lên trên thanh tab.

## Đồng bộ checklist (2026-10-22)

Đối chiếu bằng chứng đã ghi, không chạy lại test trong lượt đồng bộ này. Xem [bảng đối chiếu và giới hạn](../../PROGRESS/ACCEPTANCE_SYNC_2026-10-22.md) và [PROGRESS liên quan](../../PROGRESS/PHASE_01_AUTH_HOME_UI/PHASE_01_04_HOMEPAGE.md). Trạng thái Done của phase giữ theo UAT owner đã có; checkbox chỉ phản ánh phạm vi kiểm chứng, không tự thay xác nhận owner.
