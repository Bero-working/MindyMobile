# Review API Phase 1 — 2026-10-17

Review chỉ đọc bởi agent review_phase1 theo ADR-0022 Accepted và kế hoạch1.6.

Không tìm thấy lỗi code có căn cứ trong service/schema Auth/Home, generation guard, role guard,
cache key theo user/generation, pagination/lọc lịch theo asOf hoặc slot logout production.

Review yêu cầu bổ sung bằng chứng cho ba tình huống; đã thực hiện và chạy lại:

- HTTP refresh thất bại đi qua navigator thật thay vì chỉ gọi store.logout trực tiếp.
- Bootstrap auth/me trả muộn sau logout không khôi phục user.
- Logout503 giữ phiên, hiển thị lỗi và cho phép thử lại chủ động.

Nhóm test review9/9 đạt; full suite chạy lại132 test. Native cookie/backend cần bằng chứng riêng,
không suy từ MSW. Xem nhật ký API và báo cáo Maestro. Không đánh dấu owner UAT đã đạt.
