# ADR-0008: Bắt buộc TDD

- Status: Accepted
- Date: 2026-10-16
- Author: @Bero
- Approved by: @Bero

## Context
App có nhiều rule dễ sai: refresh cookie, mã lỗi theo `code`, polling có điều kiện dừng, giới hạn giỏ hàng,
`expectedVersion`. Lỗi ở các phần này khó phát hiện bằng chạy tay.

## Decision
Mọi code production viết theo **Red → Green → Refactor**: viết test (và MSW handler nếu gọi API) trước, chạy thấy
fail, rồi mới viết code. Sửa bug cũng viết test tái hiện bug trước. Mỗi màn hình mới có Maestro flow cho luồng chính.

## Alternatives
- Viết test sau: dễ bỏ sót, test thường bám theo code đã viết thay vì theo hành vi.

## Consequences
+ Mỗi hành vi đều có test, refactor an toàn.
- Tốn thời gian hơn ở đầu mỗi task. Cần hạ tầng test (MSW, `tests/utils/`) xong ở Phase 0.
