# ADR-0011: Không optimistic update cho thanh toán, giỏ hàng, điểm danh

- Status: Accepted
- Date: 2026-10-16
- Author: @Bero
- Approved by: @Bero

## Context
Với thanh toán, giỏ hàng, điểm danh, server mới là nơi quyết định chỗ ngồi, giá và trạng thái: lớp có thể hết chỗ
(`CLASS_FULL`), giỏ có thể vượt giới hạn, buổi điểm danh có thể đổi version (`SESSION_VERSION_CONFLICT`).

## Decision
- Không làm optimistic update cho thanh toán, giỏ hàng, điểm danh. Chỉ cập nhật UI theo response của server
  (`setQueryData` từ response hoặc invalidate).
- Gặp 409 có `expectedRevision` / `expectedVersion` thì refetch rồi để người dùng quyết định lại. Không tự tăng
  version rồi retry.

## Alternatives
- Optimistic update rồi rollback khi lỗi: người dùng thấy trạng thái sai (đã thêm vào giỏ, đã thanh toán) trong
  lúc chờ, rollback gây nhầm lẫn với dữ liệu liên quan tới tiền.

## Consequences
+ UI luôn khớp server ở các luồng liên quan tới tiền và điểm danh.
- Phản hồi chậm hơn một nhịp; nút phải có trạng thái loading và khoá bấm trong lúc chờ.
