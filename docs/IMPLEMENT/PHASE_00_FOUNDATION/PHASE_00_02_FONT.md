# 0.2 Font

## Mô tả
Thêm font Nunito (file tĩnh) cho cả Android và iOS, dùng qua class `font-nunito-*`.

## Hạ tầng / ADR
- File khoá bị sửa: `android/**`, `ios/**` (link font). `react-native.config.js` đã khai báo `assets/fonts`.
- ADR: [ADR-0004](../../adr/ADR-0004-nativewind-nativecn.md).
- Quy tắc font: [guides/styling.md](../../guides/styling.md#font).

## Task
### 0.2.1 Thêm và link font
- Kết quả mong đợi: `Nunito-Regular.ttf`, `Nunito-SemiBold.ttf`, `Nunito-Bold.ttf`, `Nunito-ExtraBold.ttf` trong
  `assets/fonts/`; đã chạy `npx react-native-asset`; build lại native.
- Test cần viết trước: không có unit test cho asset native. Kiểm tra bằng mắt ở tiêu chí nghiệm thu.

## Tiêu chí nghiệm thu
- [ ] Text dùng `font-nunito`, `font-nunito-semibold`, `font-nunito-bold`, `font-nunito-extrabold` hiện đúng 4 độ
      đậm trên Android Emulator (và iOS Simulator nếu có macOS).
- [ ] Không dùng `font-bold` với Nunito ở bất kỳ chỗ nào.
