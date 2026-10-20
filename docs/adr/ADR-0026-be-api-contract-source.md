# ADR-0026: Contract API nhận từ BE là nguồn của các file contract theo domain

- Status: Proposed
- Date: 2026-10-17
- Created at: 2026-10-17T23:34:58+07:00
- Author: @Bero
- Approved by: (chờ @Bero)

## Context
`docs/API_CONTRACT/` được tách theo domain từ một bản chụp contract BE (`API_CONTRACT_FE.legacy.md`, đối chiếu
2026-10-16). BE tiếp tục cập nhật contract tổng hợp ở repo BE (`docs/api_flow/API_CONTRACT_FE.md`); bản ngày
2026-10-17 đã thêm hành vi giỏ hàng (§11.1) và giỏ bị xoá sau checkout (§11.4) mà file domain chưa có. Không có
bản gốc cố định trong repo mobile thì không biết file domain đang lệch BE ở đâu, và mỗi người/agent có thể sửa
contract theo cách khác nhau.

## Decision
- `docs/API_CONTRACT/API_CONTRACT_BE.md` là bản contract **nguyên văn nhận từ BE** và là nguồn của mọi file domain
  trong `docs/API_CONTRACT/` (README.md và các file liệt kê trong bảng đối chiếu).
- Chỉ owner (@Bero) cập nhật `API_CONTRACT_BE.md`, bằng cách chép đè bản mới nhất từ BE. Người khác và AI agent
  **KHÔNG ĐƯỢC** sửa tay nội dung file này.
- Mỗi lần `API_CONTRACT_BE.md` đổi, phần khác biệt (`git diff docs/API_CONTRACT/API_CONTRACT_BE.md`) PHẢI được đồng
  bộ sang file domain tương ứng trong cùng commit, giữ nguyên số mục (§). Ghi ngày và phạm vi lần đồng bộ gần nhất
  ở mục "Nguồn contract nhận từ BE" của `docs/API_CONTRACT/README.md`.
- File domain lệch với `API_CONTRACT_BE.md` thì `API_CONTRACT_BE.md` thắng; sửa file domain cho khớp.
- Thay đổi contract ảnh hưởng spec phase (`docs/IMPLEMENT/`) hoặc `BUSINESS_RULES.md` thì báo owner trước khi sửa,
  theo B.9 của [docs/README.md](../README.md).
- Thứ tự ưu tiên nguồn ở B.1 giữ nguyên: `docs/API_CONTRACT/` (gồm `API_CONTRACT_BE.md`) đứng đầu. Source code và
  Swagger của BE vẫn là nguồn sự thật khi contract lệch với BE thực tế; khi đó báo BE cập nhật contract rồi owner
  chép lại.
- `API_CONTRACT_FE.legacy.md` chỉ còn để đối chiếu lần tách đầu, không dùng làm nguồn; xoá khi owner xác nhận.

## Alternatives
- Chỉ giữ file domain, đồng bộ trực tiếp từ repo BE: không có bản gốc trong repo mobile để diff, agent không đọc
  được repo BE.
- Dùng thẳng `API_CONTRACT_BE.md`, bỏ file domain: file 1.700+ dòng khó đọc, spec phase đang trỏ tới file domain.
- Đọc trực tiếp Swagger: cần môi trường BE chạy, thiếu phần mô tả hành vi/flow mà contract có.

## Consequences
+ Biết chính xác contract BE đã đổi gì qua git diff; file domain luôn truy về một nguồn.
+ Một người chịu trách nhiệm nhận contract, tránh sửa tay lệch nhau.
- Mỗi lần owner cập nhật phải có thêm bước đồng bộ file domain.
- Repo mobile giữ hai bản nội dung trùng nhau (bản gốc và bản tách).
