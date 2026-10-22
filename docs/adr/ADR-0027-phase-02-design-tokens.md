# ADR-0027: Token màu thiết kế Phase 2 (ember, ribbon)

- Status: Accepted
- Date: 2026-10-17
- Created at: 2026-10-17T23:44:00+07:00
- Author: @Bero
- Approved by: @Bero (chat 2026-10-17, Phase 2 Q13)

## Context
Thiết kế Phase 2 (artifact Student Home mục 2, xem
[DESIGN_SOURCE](../IMPLEMENT/PHASE_02_COURSE_CHECKOUT/references/DESIGN_SOURCE.md)) dùng màu chưa có trong `global.css`:

- `#C2410C`: chữ/icon chip “Hết hạn sau” ở màn Thanh toán (cũng dùng cho icon chuông/sao ở các màn sau).
- `#EC4A3C` → `#C8281D`: gradient dải RECOMMEND; `#8E1A12`: nếp gấp của dải.

ESLint cấm màu literal; `global.css`, `tailwind.config.js`, `src/theme/colors.ts` bị khoá. Thay bằng token gần nhất
(`status-red` `#B91C1C`, `headsup` `#FF5400`) làm lệch rõ so với thiết kế.

## Decision
Thêm nhóm “5. Màu thiết kế Phase 2” vào `global.css`, `tailwind.config.js`, `src/theme/colors.ts`:

| Token | Giá trị | Dùng |
| --- | --- | --- |
| `ember` | `#C2410C` | Chữ/icon cảnh báo trên nền `peach` (chip hết hạn) |
| `ribbon` | `#EC4A3C` | Đầu gradient dải RECOMMEND |
| `ribbon-deep` | `#C8281D` | Cuối gradient dải RECOMMEND |
| `ribbon-fold` | `#8E1A12` | Nếp gấp dải RECOMMEND |

Không đổi token cũ, token ngữ nghĩa, font hoặc `regions.ts`. Cập nhật `ARCHITECTURE.md` và `docs/CORE/GLOBAL_CSS.md`
trong cùng PR.

## Alternatives
- Dùng `status-red`/`headsup`: không cần ADR nhưng ribbon và chip lệch màu thiết kế.
- Bỏ gradient ribbon, dùng một màu: vẫn cần ít nhất một token mới.

## Consequences
+ Bám màu thiết kế, không có hex trong component.
- Thêm 4 token; mở khoá có giới hạn 3 file hạ tầng.
