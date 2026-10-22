# 2.1 Màn Khoá học

## Mô tả

Màn mở khi chọn tab **Khoá học**. Học viên xem khoá học gợi ý, lọc theo danh mục/bộ lọc, lật trang lưới, chạm thẻ
hoặc `+` để mở sheet khoá học ([2.2](PHASE_02_02_CLASS_PICKER.md)). Nút giỏ ở top bar mở sheet Giỏ hàng ([2.3](PHASE_02_03_CART_SHEET.md)).

## Đặc tả UI từ Claude Design (Claude Code bàn giao, 2026-10-17 23:45)

- Nguồn: artifact Home version `1792255829-893f`, mục 2, `tab = courses` — [bản trích dòng 400–410, 480–543, 800–822,
  955–1026, 1571–1591, 1703–1749](references/source/courses-cart-payment-design.html). Ảnh: [claude-courses-catalog.png](references/claude-courses-catalog.png).
- Khung: nền `canvas`; **top bar thu gọn** luôn hiện ở tab này; nội dung `ScrollView` dọc padding `20 0 120`, các khối
  cách nhau **22**; tab bar nổi cố định đáy (padding dưới 120 chừa tab bar + `insets.bottom`).

### Top bar

Giống top bar thu gọn của [Home 1.4](../PHASE_01_AUTH_HOME_UI/PHASE_01_04_HOMEPAGE.md#top-bar-thu-gọn-khi-cuộn): nền
`mint`, bóng `0 6 18 forest-deep/18`, lưới `44 · 1fr · 44`, padding `0 14 8` dưới `insets.top`. Logo “Mindy” 19/900
tracking −0.19 + “CODING” 10.5/800 tracking 0.24em `sunshine` margin-top 2; chạm logo → Home. Giỏ 44×44, icon 22
stroke `canvas` 2. **Badge** khi giỏ có lớp: tuyệt đối `top 4 right 2`, cao 18, rộng tối thiểu 18, padding ngang 4,
bo tròn, nền `coral`, viền 2 `mint`, chữ `canvas` 11/900 = số lớp trong giỏ (> 9 hiện `9+`).

### Gợi ý cho bạn

| Phần | Thông số |
| --- | --- |
| Tiêu đề | margin ngang 16, **20 / 900**, tracking −0.4, `black` |
| Carousel | cách tiêu đề 12; cuộn ngang snap từng trang, mỗi trang rộng 100%, padding `10 16 4` |
| Thẻ | lưới 2 cột `1fr · 128`, gap 12, padding 14, bo **24**, nền gradient 135° từ `cover-*-soft` → `canvas`, bóng `0 6 18 forest/8`; nhấn: scale 0.98 |
| Cột chữ | dọc, gap 5, padding dọc 2. Eyebrow “{danh mục} · {ONLINE/OFFLINE}” 12/700 `muted`; tiêu đề **20 / 900** line-height 1.15 tracking −0.4; meta “Khai giảng {dd/MM} · {giá}” 12.5 line-height 1.45 `black`; nút “Xem khoá học” đẩy xuống đáy (`margin-top:auto`), cao 36, padding ngang 16, pill, viền `line` 1, nền `canvas` 90%, chữ 13/800 `forest` |
| Ảnh | cao tối thiểu 150, bo 18, `CoverImage`; fallback sọc 135° `cover-*` 8px / trong suốt 8px trên nền `cover-*-soft`. Không hiện nhãn “ảnh khoá học” (chỉ là placeholder thiết kế) |
| Ribbon | Khung `104×104` tuyệt đối `top −7 right −7` của thẻ, `overflow:hidden`, không nhận chạm. Dải rộng 156, `top 26 right −32`, xoay 45°, gradient dọc `ribbon` → `ribbon-deep`, chữ “RECOMMEND” 10/900 `canvas` tracking 0.14em căn giữa, padding dọc 7, viền trên/dưới 1 nét đứt `canvas`/45, bóng `0 4 8`. Hai ô 7×7 `ribbon-fold` tại `top 0 left 6` và `bottom 6 right 0` (nếp gấp). Màu theo [ADR-0027](../../adr/ADR-0027-phase-02-design-tokens.md) |
| Chấm | dưới carousel padding-top 12, gap 8, căn giữa: cao 7, rộng 7 (`banner`) / 24 (`forest`) cho trang hiện tại, bo tròn; đổi rộng/màu 300ms; chạm chấm cuộn tới trang |

Màu `cover-*` theo chỉ số khoá (a/b/c/d xoay vòng như `CourseCover` Phase 1).

### Danh mục và chip

- Khối padding ngang 16. Hàng tiêu đề `space-between`: “Danh mục” **20 / 900**; nút bộ lọc 42×42 tròn, viền `line` 1,
  nền `canvas`, icon 19 stroke `black` 2 (`M4 8h9M17 8h3M4 16h3M11 16h9` + 2 vòng r2 tại (15,8),(9,16)). Khi lọc đang
  bật: chấm 9×9 `coral` viền 2 `canvas` tại `top 6 right 7`.
- Chip: `ScrollView` ngang, gap 8, padding `12 16 2` (tràn ra lề màn). Chip cao **38**, padding ngang 16, bo **12**,
  không viền, chữ 14/800. Chọn: nền `forest`, chữ `canvas`; không chọn: nền `soft`, chữ `forest`; đổi màu 200ms.
  Chip đầu “Tất cả”, sau đó theo `course-categories`. Đổi chip → về trang 1.

### Lưới khoá học

- Lưới 2 cột, gap 12, padding ngang 16, `margin-top −8` (sát chip). **6 thẻ mỗi trang.**
- Thẻ: tỉ lệ 3:4, bo 20, ảnh/sọc 135° `cover-*` 9px; nhấn scale 0.97. Lớp dưới: padding `44 12 12`, gradient dọc
  `forest-deep` 0% → 82% (45%) → 95%; eyebrow “{ONLINE/OFFLINE} · KG {dd/MM}” 11/800 `sunshine`; tiêu đề 15/900
  line-height 1.25 margin-top 3 `canvas`; hàng giá margin-top 8 `space-between`: giá 15/900 `canvas`; nút **mũi tên →**
  không nền, không viền, padding 0: icon 22, stroke `action` 2.4, bo đầu/khớp tròn (`M5 12h14M13 6l6 6-6 6`), nhãn đọc
  “Xem khoá học”. Bản `1792255829-893f` bỏ nút tròn “+” và trạng thái ✓ — thẻ không còn thể hiện “đã có trong giỏ”.
- Tái sử dụng `CourseTile` Phase 1 (cùng gradient/ảnh), thay nút “+” bằng mũi tên; prop `onOpen`. Home 2a dùng cùng
  thẻ nên cũng đổi sang mũi tên (nguồn đổi cả dòng 408 — thẻ “Khoá học nổi bật” của Home).
- Phân trang (khi > 1 trang): hàng căn giữa gap 8 padding ngang 16: nút ‹ và › 40×40 tròn viền `line` nền `canvas`
  chữ 18/900 (`forest`, mờ `banner` khi hết hướng); nút số 40×40 tròn không viền, trang hiện tại nền `mint` chữ
  `canvas`, khác nền `soft` chữ `forest`, 14/900. Đổi trang cuộn tới đầu khối Danh mục. Nhiều trang (> 5): hiện
  trang đầu, cuối, hiện tại ±1, chỗ ngắt là “…” không bấm (thiết kế chỉ có 2–3 trang).
- Rỗng: khối margin ngang 16, padding 24, nền `soft`, bo 16, chữ 14/700 `muted` căn giữa “Không có khoá học phù hợp
  bộ lọc.”; khi đang lọc thêm nút chữ “Đặt lại bộ lọc” 14/800 `mint`.

### Sheet Bộ lọc

Khung sheet chung (xem [2.3](PHASE_02_03_CART_SHEET.md#khung-sheet-chung)). Tiêu đề “Bộ lọc” 22/900 margin dưới 16.
Nhóm “Hình thức” (nhãn 14/800 margin dưới 10): chip Tất cả / Online / Offline cao 40, padding 16, bo 12, 14/800,
chọn `forest`/`canvas`, không chọn `soft`/`forest`, gap 8, nhóm cách dưới 20. Nhóm “Sắp xếp” (Mặc định / Giá thấp →
cao / Giá cao → thấp) **ẩn** theo Q11 (owner duyệt): `GET courses` không có tham số sắp xếp; mở lại khi backend hỗ trợ. Hàng nút gap 10: “Đặt lại” cao 52 padding 20 bo 14 viền
`line` chữ `forest` 15/800; “Xem {n} khoá học” flex 1 cao 52 bo 14 nền `forest` chữ `canvas` 15/900 → áp dụng, đóng
sheet. `n` = `total` của truy vấn với bộ lọc đang chọn (loading: “Xem khoá học”).

## Nội dung, dữ liệu, trạng thái

- Dữ liệu UI: `CatalogCourse { id, code, title, description|null, imgUrl|null, priceAmount, categoryName, nextClass:
  { startDate, deliveryMode }|null }`. `nextClass` là lớp OPEN sớm nhất (CourseDto không có ngày/hình thức).
  Không có `nextClass` → eyebrow chỉ còn hình thức trống, ẩn phần “KG”.
- Gợi ý: không có API xếp hạng. Lấy 3 khoá đầu của `GET courses?page=1` (thứ tự server); nhãn RECOMMEND là trình bày.
- Tiền: `formatVnd(n)` → `1.500.000 VND` (Q10). Ngày `dd/MM` cắt từ chuỗi `YYYY-MM-DD`, không qua `Date`.
- Loading: skeleton 1 thẻ gợi ý, 4 chip, 6 ô lưới. Đổi chip/trang/bộ lọc: chỉ lưới skeleton, giữ chip và phân trang.
- Error theo vùng (gợi ý / danh mục / lưới) bằng `ScreenState` + “Thử lại” chỉ refetch vùng đó.
- Kéo để làm mới (`RefreshControl` màu `mint`) làm mới gợi ý, danh mục, trang hiện tại và giỏ.

## Tương tác

- Chạm thẻ gợi ý, “Xem khoá học”, thẻ lưới hoặc mũi tên → mở sheet khoá học với `courseId` (Q2). Không thêm giỏ trực tiếp.
- Accessibility: chip `tab` + `selected`; nút trang có nhãn “Trang {n}”, trang hiện tại `selected`; ribbon ẩn khỏi
  trình đọc, thẻ gợi ý đọc “Gợi ý: {tiêu đề}”; mũi tên đọc “Xem khoá học {tiêu đề}”.
  Vùng chạm ≥ 44 (mũi tên 22 và nút 38/40/42 mở rộng `hitSlop`). Chữ lớn (`fontScale > 1.2`): thẻ gợi ý xếp ảnh trên chữ dưới.
  Reduce Motion: bỏ scale khi nhấn và chuyển chấm tức thì; carousel tự chuyển theo thứ tự trái → phải mỗi 3 giây, hết mục cuối quay lại mục đầu; Reduce Motion chuyển tức thì.

## API / dữ liệu

- Bước UI: dữ liệu qua props/fixture, không gọi HTTP.
- Bước API (2.6): `GET course-categories`, `GET courses?page&pageSize=6&categoryId&deliveryMode`,
  `GET courses/:id/classes?pageSize=1`, `GET me/cart` (badge) → [catalog.md §8](../../API_CONTRACT/catalog.md#8-catalog-public).

## Bước của phase

- Bước: **UI**. Test UI dùng fixture/callback; không MSW.

## Task

### 2.1.1 Tách component dùng chung và `formatVnd`

- Kết quả: thêm 4 token ADR-0027 vào `global.css`, `tailwind.config.js`, `src/theme/colors.ts` (cập nhật
  `docs/CORE/GLOBAL_CSS.md`); `CourseTile`, `CourseCover`, `AppTabBar`, `BrandBar` ở `src/components/common/`; `formatVnd` ở
  `src/shared/utilities/`; Home dùng lại, đổi sang `1.500.000 VND` (Q10) và nút mũi tên trên thẻ (nguồn mới); ngoài ra không đổi UI.
- Test trước: token mới có trong `colors.ts`; `formatVnd(1500000) === '1.500.000 VND'`, `formatVnd(0) === '0 VND'`; test Home cập nhật chuỗi tiền và vẫn xanh;
  `AppTabBar` chọn tab `courses`; `CourseTile` hiện mũi tên và gọi `onOpen(id)` khi chạm thẻ hoặc mũi tên; Home `+` → mũi tên.
- testID: giữ `home-*`; mới `courses-tab-*`, `courses-course-{id}`, `courses-open-{id}` (Home giữ `home-course-{id}`, thêm `home-course-open-{id}`).

### 2.1.2 Top bar có badge, Gợi ý cho bạn và ribbon

- Test trước: badge ẩn khi 0, hiện số, `9+`; 3 gợi ý, chấm đổi khi lướt/chạm; “Xem khoá học” gọi `onOpenCourse(id)`;
  ẩn khối khi rỗng; ảnh null dùng sọc.
- testID: `courses-screen`, `courses-header`, `courses-cart-button`, `courses-cart-badge`, `courses-recommend`,
  `courses-recommend-{id}`, `courses-recommend-view-{id}`, `courses-recommend-dot-{i}`.
- i18n key: `courses.recommend.title`, `courses.recommend.badge`, `courses.recommend.view`, `courses.meta.startsAndPrice`.

### 2.1.3 Danh mục, chip và sheet Bộ lọc

- Test trước: “Tất cả” mặc định; chọn chip gọi `onCategory(id|null)` và về trang 1; bộ lọc trả `{ deliveryMode? }`
  (không gửi key rỗng); “Xem {n} khoá học” hiện `n`; Đặt lại xoá chấm.
- testID: `courses-categories`, `courses-category-{id|all}`, `courses-filter-button`, `courses-filter-dot`,
  `courses-filter-sheet`, `courses-filter-mode-{all|ONLINE|OFFLINE}`, `courses-filter-apply`, `courses-filter-reset`.
- i18n key: `courses.categories.title`, `courses.categories.all`, `courses.filter.*`.

### 2.1.4 Lưới, phân trang và trạng thái

- Test trước: 6 thẻ/trang; ‹ › disabled ở biên; rút gọn số trang khi > 5; loading/empty/error/success từng vùng;
  retry chỉ vùng lỗi.
- testID: `courses-grid`, `courses-page-{n}`, `courses-page-prev`, `courses-page-next`, `courses-loading`,
  `courses-empty`, `courses-error`, `courses-retry`.
- i18n key: `courses.grid.empty`, `courses.grid.clearFilter`, `courses.pagination.*`, `courses.actions.*`.

## Tiêu chí nghiệm thu

- [ ] Đúng thông số artifact: khoảng cách 22, thẻ gợi ý bo 24 + ribbon, chip 38 bo 12, lưới 6 thẻ + phân trang, badge giỏ.
- [ ] Home Phase 1 không đổi giao diện ngoài định dạng tiền; test Home xanh.
- [ ] Đủ loading/empty/error/success theo vùng; text qua i18n vi-VN/en-EN.
- [ ] Chữ lớn, đọc màn hình, vùng chạm, Reduce Motion đạt; ảnh đối chiếu và sai khác ghi vào PROGRESS.

### Điều chỉnh của owner — 2026-10-18

Tất cả carousel (Home giới thiệu, Home về Mindy, gợi ý khoá học) tự chuyển sang mục kế tiếp theo thứ tự trái → phải mỗi **3 giây**, lặp về mục đầu. Chạm chấm/vuốt đặt lại thời gian chờ; tạm dừng khi kéo và khi app ở nền. Reduce Motion giữ chu kỳ nhưng bỏ animation trượt. Chỉ đạo trực tiếp của owner thay quy tắc không tự chạy trước đây; không thay mốc UI approval/API.


### Hạ thanh tab theo owner — 2026-10-18

Thanh tab nổi Home và Khoá học dùng bottom=max(safeAreaBottom−12dp,0), hạ thêm 12dp so với vị trí safe area trước đó. Catalog giảm đệm cuối từ 120 xuống 100dp cộng safe area, bảo đảm phân trang vẫn cuộn được lên trên thanh tab.
