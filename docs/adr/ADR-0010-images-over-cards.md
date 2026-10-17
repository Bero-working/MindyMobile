# ADR-0010: Hạn chế card, ưu tiên ảnh và animation

- Status: Accepted
- Date: 2026-10-16
- Author: @Bero
- Approved by: @Bero

## Context
Danh sách khoá học, lớp, lịch dễ thành chuỗi card viền + bóng giống nhau, nặng về thị giác trên màn hình nhỏ. Khoá học
có ảnh bìa (`imgUrl`). Repo đã có `react-native-reanimated` 3, FastImage, `react-native-svg`.

## Decision
- Không dùng card làm mặc định cho item danh sách. Ưu tiên ảnh bìa tràn, carousel ngang, row phẳng, khối nền màu.
- Card chỉ dùng để gom thông tin không có ảnh (tóm tắt thanh toán, thông tin order, form trong Dialog).
- Phản hồi chạm và xuất hiện item dùng animation Reanimated, tôn trọng Reduce Motion. Chi tiết ở
  [guides/visual-and-motion.md](../guides/visual-and-motion.md).

## Alternatives
- Card cho mọi item: dễ làm, nhưng giao diện nặng và lặp.

## Consequences
+ Giao diện nhẹ, tập trung vào hình ảnh.
- Cần ảnh placeholder theo danh mục và illustration cho empty/error state.
