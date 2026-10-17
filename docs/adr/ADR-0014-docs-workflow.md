# ADR-0014: Quy trình docs: IMPLEMENT / PROGRESS, khoá hạ tầng, ADR trước khi thêm công nghệ

- Status: Accepted
- Date: 2026-10-16
- Author: @Bero
- Approved by: @Bero

## Context
Toàn bộ rule cũ nằm trong một file `BUSINESS_RULES.md` (15 mục) lẫn kiến trúc, UI, test và việc cần làm. Nhiều người
và AI agent cùng làm song song nên cần biết làm gì tiếp, ai đã làm gì, và tránh sửa nhầm file hạ tầng.

## Decision
- Tách docs theo vai trò: `BUSINESS_RULES.md` (nghiệp vụ), `ARCHITECTURE.md`, `CONTRIBUTING.md`, `guides/`, `adr/`,
  `API_CONTRACT/` theo domain.
- `IMPLEMENT/` chứa spec phase (làm gì + tiêu chí nghiệm thu). `PROGRESS/` là nhật ký chỉ ghi thêm, cùng cấu trúc.
- Phase 0 là hạ tầng; mỗi phase sau là một màn hình, kết thúc bằng Dọn dẹp → Kiểm tra → Nghiệm thu. Chỉ owner
  đánh dấu `Done`.
- File hạ tầng bị khoá (danh sách trong [ARCHITECTURE.md](../ARCHITECTURE.md#file-hạ-tầng-bị-khoá), owner trong
  `.github/CODEOWNERS`). Sửa file khoá hoặc thêm thư viện phải có ADR `Accepted` trước.
- Quy trình đầy đủ ghi trong [docs/README.md](../README.md).

## Alternatives
- Giữ một file lớn: khó đọc, khó review, không theo dõi được tiến độ.
- Theo dõi tiến độ bằng issue tracker: tách khỏi repo, agent không đọc được.

## Consequences
+ Agent và người mới biết đọc gì, làm gì tiếp, ai duyệt.
- Thêm việc ghi PROGRESS và viết ADR.
