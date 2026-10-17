# 0.3 Theme

## Mô tả
Tạo các file theme dùng chung: màu cho prop không nhận `className`, ghi đè màu theo vùng, hằng số animation và hàm
ghép class `cn()`.

## Hạ tầng / ADR
- File khoá được tạo: `src/theme/colors.ts`, `src/theme/regions.ts`, `src/theme/motion.ts`.
- File mới không khoá: `src/shared/utilities/cn.ts`.
- ADR: [ADR-0004](../../adr/ADR-0004-nativewind-nativecn.md), [ADR-0005](../../adr/ADR-0005-light-mode-only.md),
  [ADR-0010](../../adr/ADR-0010-images-over-cards.md).
- Nội dung: [guides/styling.md](../../guides/styling.md), [guides/visual-and-motion.md](../../guides/visual-and-motion.md).

## Task
### 0.3.1 `colors.ts`
- Kết quả mong đợi: `src/theme/colors.ts` theo guide.
- Test cần viết trước: `src/theme/colors.test.ts` đọc `global.css`, so từng biến brand/dẫn xuất với `colors.ts`, lệch
  là fail.

### 0.3.2 `cn.ts`
- Kết quả mong đợi: `src/shared/utilities/cn.ts` theo guide.
- Test cần viết trước: `cn('px-2', 'px-4')` trả `'px-4'`; bỏ qua giá trị falsy.

### 0.3.3 `regions.ts`
- Kết quả mong đợi: `regionVars` cho `home`, `cart`, `courseDetail`, `catalog` theo guide.
- Test cần viết trước: mỗi vùng có đủ biến CSS như bảng "Ghi đè theo vùng" của GLOBAL_CSS §5.

### 0.3.4 `motion.ts`
- Kết quả mong đợi: `motion` theo guide (`duration`, `easing`, `pressScale`, `staggerMs`, `staggerLimit`).
- Test cần viết trước: giá trị khớp bảng animation trong guide (`pressScale` 0.97, `staggerLimit` 8...).

## Tiêu chí nghiệm thu
- [x] 4 file tạo xong, test xanh.
- [x] `colors.test.ts` fail khi sửa một màu chỉ ở một trong hai file.

Owner @Bero đã chấp nhận phạm vi này qua UAT bước 1–4a ngày 2026-10-17.
Chi tiết và giới hạn xem [file UAT](PHASE_00_99_User_Acceptance.md).
