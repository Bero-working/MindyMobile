# ADR-0020: Token màu thiết kế Phase 1 và bỏ ghi đè màu vùng Home trên mobile

- Status: Accepted
- Date: 2026-10-17
- Author: @Bero (Claude Code hỗ trợ soạn thảo)
- Approved by: Owner, chốt trực tiếp trong chat ngày 2026-10-17: “D1. Sử dụng xanh đậm như thiết kế”,
  “D2. Chỉnh sửa global.css để thêm các token màu liên quan”. Tên token do Claude Code đặt; owner đổi tên được
  bằng ADR cập nhật.

## Context

Bàn giao Claude Design của Phase 1 (ADR-0019) có hai điểm không thực hiện được với token hiện tại:

1. [CORE §5](../CORE/GLOBAL_CSS.md#5-ghi-đè-theo-vùng) đổi `forest`/`muted` thành đen trong `.home-content`
   (`regionVars.home` ở mobile). Home 2a dùng `forest` cho nhãn và nút “Vào lớp”, nên ghi đè làm sai thiết kế.
2. Thiết kế dùng các màu không có token: thân/thanh terminal, khung ảnh slide, dòng test ✓, góc gấp giấy,
   băng dính và nền chờ ảnh khoá học (`oklch`). `global.css`, `tailwind.config.js`, `src/theme/**` bị khoá.

## Decision

### 1. Home mobile không dùng `regionVars.home`

- `StudentHome` (Home 2a) không bọc nội dung bằng `regionVars.home`. Màu chữ ghi rõ theo đặc tả 1.4:
  tiêu đề/nội dung `black`, nhãn và nút “Vào lớp” `forest`, các phần còn lại theo bảng trong đặc tả.
- `src/theme/regions.ts` giữ nguyên (không sửa file khoá); chỉ bỏ cách dùng ở Home. CORE §5 ghi thêm ngoại lệ
  “Home mobile 2a” trỏ về ADR này. Các vùng khác (cart, courseDetail, catalog) không đổi.

### 2. Thêm token màu

Thêm vào `global.css` (nhóm “4. Màu thiết kế Phase 1”), `tailwind.config.js` và `src/theme/colors.ts`:

| Token | Hex | RGB | Dùng cho |
| --- | --- | --- | --- |
| `forest-deep` | `#12302E` | 18 48 46 | Thân terminal, gradient chữ trên ảnh khoá học |
| `forest-night` | `#0C2422` | 12 36 34 | Thanh tiêu đề terminal, bóng tờ ghi chú |
| `teal` | `#1F9184` | 31 145 132 | Khung ảnh slide giới thiệu |
| `aqua` | `#7FD6C9` | 127 214 201 | Dòng test ✓ trong terminal |
| `cream` | `#FFF1D6` | 255 241 214 | Góc gấp tờ ghi chú |
| `tape` | `#78F0E8` | 120 240 232 | Băng dính tờ ghi chú (dùng `tape/80`) |
| `cover-a` / `cover-a-soft` | `#A6DED4` / `#DAF6F0` | 166 222 212 / 218 246 240 | Nền chờ ảnh khoá học thứ 1 (oklch h182) |
| `cover-b` / `cover-b-soft` | `#EFC8AA` / `#FEEADB` | 239 200 170 / 254 234 219 | Thứ 2 (h60) |
| `cover-c` / `cover-c-soft` | `#F6C3BA` / `#FFE8E3` | 246 195 186 / 255 232 227 | Thứ 3 (h30) |
| `cover-d` / `cover-d-soft` | `#B6DDBD` / `#E1F5E4` | 182 221 189 / 225 245 228 | Thứ 4 (h150) |

Mã `cover-*` quy đổi từ `oklch(0.86 0.06 h)` (tint) và `oklch(0.95 0.03 h)` (soft) của thiết kế, sai số làm tròn ±1.
`colors.test.ts` hiện có bảo đảm `colors.ts` khớp `global.css`.

Không đổi token cũ, token ngữ nghĩa, font hoặc provider. Không thêm thư viện.

## Alternatives

- Giữ ghi đè vùng và quy đổi màu gần nhất: owner không chọn; UI lệch thiết kế.
- Sửa `regionVars.home` thay vì bỏ dùng: ảnh hưởng mọi nơi dùng vùng này về sau, sửa thêm file khoá không cần thiết.
- Dùng màu literal trong component: vi phạm `no-color-literals` và guide styling.

## Consequences

- UI Home và terminal/ghi chú khớp màu thiết kế; đặc tả 1.1/1.4 dùng thẳng token mới.
- Mobile khác web ở vùng Home (web vẫn đổi forest/muted thành đen); ghi trong CORE §5.
- Thêm 14 token; ai dùng phải theo đúng mục đích trong bảng, không dùng thay token brand.
