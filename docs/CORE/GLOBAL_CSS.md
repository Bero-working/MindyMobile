# Bộ màu, font và border đang sử dụng

Tổng hợp từ code ngày 16/10/2026. Nguồn token: `src/app/globals.css` (`@theme`) và `src/app/admin/tokens.css`. Mã hex của các màu pha bằng `color-mix` là giá trị quy đổi gần đúng.

Khi đổi màu, chỉ sửa token trong hai file trên; không hard-code hex trong JSX.

## 1. Màu gốc (brand)

| Token       | Hex       | Vai trò                                                             |
| ----------- | --------- | ------------------------------------------------------------------- |
| `canvas`    | `#FFFFFF` | Nền trang, nền card, chữ trên nền đậm                               |
| `mint`      | `#338A85` | Màu nhấn chính: link, icon, trạng thái active, focus ring, nền hero |
| `forest`    | `#1D5B57` | Chữ mặc định, nút primary, đổ bóng (`shadow-forest/5…25`)           |
| `coral`     | `#FF7F50` | CTA, điểm nhấn trên hero, viền cảnh báo nhẹ (`border-coral/40`)     |
| `headsup`   | `#FF5400` | Lỗi/destructive, cảnh báo trong lịch học và chọn lớp                |
| `sunshine`  | `#FFDDAE` | Nền section "feature" ở homepage                                    |
| `logo-soft` | `#D8F0FA` | Nền khối ở trang chi tiết khóa học (overview, curriculum, mentors)  |
| `black`     | `#000000` | Chữ ở homepage, giỏ hàng, chi tiết khóa học, user workspace         |

## 2. Màu pha (dẫn xuất)

| Token          | Công thức          | Hex ≈     | Dùng cho                                                      |
| -------------- | ------------------ | --------- | ------------------------------------------------------------- |
| `soft`         | mint 7% + trắng    | `#F1F7F6` | Nền phụ, hover, nav active, nền user workspace (`bg-soft/50`) |
| `line`         | mint 19% + trắng   | `#D8E9E8` | Border mặc định cho card, input, divider                      |
| `muted`        | forest 90% + trắng | `#346B68` | Chữ phụ, mô tả                                                |
| `peach`        | coral 13% + trắng  | `#FFEEE8` | Nền thông báo/alert ở auth, cart, payment, order              |
| `action`       | coral 80% + trắng  | `#FF9973` | Nền nút `ActionLink`                                          |
| `action-hover` | coral 70% + trắng  | `#FFA584` | Hover của `ActionLink`                                        |
| `banner`       | mint 26% + trắng   | `#CAE1DF` | Banner ở homepage (start section)                             |
| `catalog-ink`  | đen 85% + trắng    | `#262626` | Chữ trong danh sách khóa học                                  |

## 3. Token ngữ nghĩa

Các component trong `src/components/ui` dùng nhóm token này.

| Token                                       | Trỏ tới  |
| ------------------------------------------- | -------- |
| `background`                                | canvas   |
| `foreground`                                | forest   |
| `card`                                      | canvas   |
| `card-foreground`                           | forest   |
| `primary`                                   | forest   |
| `primary-foreground`                        | canvas   |
| `secondary`, `accent`                       | soft     |
| `secondary-foreground`, `accent-foreground` | forest   |
| `border`, `input`                           | line     |
| `ring`                                      | mint     |
| `muted-foreground`                          | muted    |
| `destructive`                               | headsup  |
| `hero`                                      | mint     |
| `hero-ink`, `hero-copy`                     | canvas   |
| `feature`                                   | sunshine |
| `popover`                                   | canvas   |
| `popover-foreground`                        | forest   |

## 4. Màu theo component

| Component               | Nền                         | Chữ                                | Border / Focus                                                    |
| ----------------------- | --------------------------- | ---------------------------------- | ----------------------------------------------------------------- |
| Button `default`        | forest (hover 90%)          | trắng                              | Focus: ring mint/50, 3px                                          |
| Button `secondary`      | soft                        | forest                             | —                                                                 |
| Button `outline`        | trắng, hover soft           | forest                             | `line`                                                            |
| Button `destructive`    | headsup                     | trắng                              | —                                                                 |
| Button `ghost` / `link` | hover soft / không nền      | forest                             | —                                                                 |
| `ActionLink` (CTA)      | action → hover action-hover | trắng                              | `canvas/25`, đổ bóng `forest/20`                                  |
| Card                    | trắng                       | forest, mô tả dùng muted           | `line`, `rounded-xl`, `shadow-sm`                                 |
| Input                   | trong suốt                  | forest, placeholder muted          | `line`; focus mint; lỗi headsup                                   |
| Badge                   | forest / soft / headsup     | trắng / forest                     | `outline` dùng `line`                                             |
| Alert                   | trắng                       | forest; `destructive` dùng headsup | `line`                                                            |
| Header                  | `canvas/95`                 | black / muted, active mint         | `border-line`, bóng `forest/5`                                    |
| User sidebar / topbar   | trắng                       | black                              | `border-line`; nav active: nền soft, chữ mint, vạch mint bên trái |
| Hero (homepage)         | mint                        | trắng                              | Điểm nhấn coral                                                   |
| Learning article        | `pre` nền soft              | Link mint, blockquote muted        | Blockquote viền trái mint 4px; bảng viền `line`                   |

## 5. Ghi đè theo vùng

| Class / vùng                | Thay đổi                                                              |
| --------------------------- | --------------------------------------------------------------------- |
| `.home-content`             | `forest` và `muted` chuyển thành đen                                  |
| `.cart-content`             | Các token `*-foreground` chuyển thành đen                             |
| `.course-detail-container`  | Chữ forest/muted/mint chuyển thành đen (không áp dụng cho SVG)        |
| `.course-catalog`           | Chữ forest/muted/mint chuyển thành `catalog-ink`, trừ bộ lọc khóa học |
| Admin (`[data-admin-root]`) | Xem mục 6                                                             |

Ngoại lệ mobile: Home 2a (`StudentHome`) không áp dụng `.home-content`; màu chữ ghi rõ theo đặc tả Phase 1.4.
Xem [ADR-0020](../adr/ADR-0020-phase-01-design-tokens-home-region.md).

## 5b. Màu thiết kế Phase 1 (chỉ mobile)

Thêm theo [ADR-0020](../adr/ADR-0020-phase-01-design-tokens-home-region.md); bảng mục đích dùng nằm trong ADR.
`forest-deep` `#12302E`, `forest-night` `#0C2422`, `teal` `#1F9184`, `aqua` `#7FD6C9`, `cream` `#FFF1D6`,
`tape` `#78F0E8`, `cover-a`/`-soft` `#A6DED4`/`#DAF6F0`, `cover-b`/`-soft` `#EFC8AA`/`#FEEADB`,
`cover-c`/`-soft` `#F6C3BA`/`#FFE8E3`, `cover-d`/`-soft` `#B6DDBD`/`#E1F5E4`.

## 6. Admin

Định nghĩa trong `src/app/admin/admin.css` và `src/app/admin/tokens.css`.

| Thuộc tính                     | Giá trị                                  |
| ------------------------------ | ---------------------------------------- |
| Font                           | `Inter Variable`, cỡ chữ gốc 18px        |
| Chữ chính (`foreground`)       | `ink-soft` ≈ `#2E2E2E` (đen 82% + trắng) |
| Chữ phụ (`muted`)              | `ink-gray` ≈ `#6B6B6B` (đen 58% + trắng) |
| `primary`                      | mint (thay cho forest)                   |
| Logo, border, hover, đang chọn | Giữ mint/forest                          |
| `status-green`                 | `#15803D`                                |
| `status-yellow`                | `#A16207`                                |
| `status-red`                   | `#B91C1C`                                |
| `pastel-red`                   | ≈ `#D57777` (status-red 60% + trắng)     |

## 7. Font và trạng thái tương tác

| Mục              | Giá trị                                                                        |
| ---------------- | ------------------------------------------------------------------------------ |
| Font chính       | `Nunito Variable` (`@fontsource-variable/nunito`), fallback Arial, sans-serif  |
| Font admin       | `Inter Variable`, fallback Arial, sans-serif                                   |
| `.section-title` | `font-extrabold`, `text-3xl` → `sm:text-4xl` → `lg:text-5xl`, `tracking-tight` |
| `.eyebrow`       | `text-xs`, `font-extrabold`, viết hoa, `tracking-[0.14em]`                     |
| `.text-link`     | `text-sm`, `font-extrabold`, hover mint                                        |
| Focus            | `outline` mint 3px, `outline-offset` 5px                                       |
| Vùng chọn chữ    | Nền mint, chữ trắng                                                            |

## 8. Ghi chú

- Palette bắt buộc trong `AGENTS.md` gồm 5 màu: trắng, mint, forest, coral, headsup. Các màu `sunshine`, `logo-soft` và màu status của admin đang được dùng nhưng nằm ngoài danh sách này, cần thống nhất và ghi lại trong `docs/ui-rules.md`.
- Tại thời điểm tổng hợp, không có mã hex hard-code trong các file `.tsx`.

## Token Phase 2 — ADR-0027

`ember`: `#C2410C`; `ribbon`: `#EC4A3C`; `ribbon-deep`: `#C8281D`; `ribbon-fold`: `#8E1A12`. Đồng bộ global.css, tailwind.config.js và src/theme/colors.ts.
