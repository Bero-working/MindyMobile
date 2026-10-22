# Phase NN: <Tên màn hình>

## Mục tiêu
1–3 câu: màn hình này cho người dùng làm gì.

## Phạm vi
- Có: ...
- Không có: ...

## Nguồn thiết kế và đặc tả UI

Theo [ADR-0029](../../adr/ADR-0029-local-ui-base-codex-spec-implementation.md). Phase không có UI ghi rõ không áp dụng.

- Người đặc tả: Codex mặc định; Claude nếu owner yêu cầu. Hoàn thiện mục này cùng đặc tả UI trong từng sub-phase
  trước khi triển khai phần tương ứng; Codex có thể đảm nhiệm triển khai.
- Nguồn base: `assets/Student Home Page Design/Student Home.dc.html` hoặc `Auth.dc.html`; màn hình/section: ...;
  phiên bản/biến thể được chọn: ...; thời điểm khảo sát: ...
- Yêu cầu điều chỉnh của owner và thay đổi so với base: ...
- Nếu cần thiết kế/truy cập Claude Design: yêu cầu owner giao Claude hỗ trợ; nguồn bàn giao bổ sung (nếu có): ...
- Ảnh tham chiếu, asset gốc và bản ghi đối chiếu: [references/](references/); ghi đường dẫn cụ thể trong sub-phase.
- Quyết định thích nghi React Native/sai khác so với thiết kế và lý do: ...
- Đầu vào thiếu/chưa xác nhận, phần bị chặn và người cần bổ sung: ...
- Codex triển khai theo đặc tả; đối chiếu UI chạy thật, ghi bằng chứng/sai khác vào PROGRESS để owner xác nhận UI trước bước gắn API.

## Các mốc trong phase

Theo [ADR-0021](../../adr/ADR-0021-per-phase-ui-approval-api-uat.md), mỗi phase đi trọn bốn mốc:

| Mốc | Phạm vi / bằng chứng | Trạng thái |
| --- | --- | --- |
| Thiết kế và triển khai UI | Đặc tả, bản chạy, ảnh và kiểm thử UI | Todo |
| Owner xác nhận UI | Xác nhận rõ của owner, ghi riêng trong PROGRESS | Todo |
| Gắn API | Task tích hợp trong cùng phase, contract và kiểm thử dữ liệu thật | Todo |
| Owner UAT | File N.99, xác nhận cuối phase trong PROGRESS | Todo |

Không gắn API trước khi owner xác nhận UI. Chờ xác nhận UI: phase In review, API/UAT Todo.
Sau duyệt UI, đặc tả task API của phase trước khi triển khai; sau tích hợp và kiểm tra mới bàn giao UAT.
Mốc không áp dụng phải ghi lý do trong spec; không tự tạo API/UI giả. Chỉ owner UAT đạt mới chuyển phase Done.

## Phụ thuộc
- Phase: PHASE_00_FOUNDATION
- API: [catalog.md#get-courses](../../API_CONTRACT/catalog.md) ...
- Business rule: [BUSINESS_RULES.md#...](../../BUSINESS_RULES.md)

## Sub-phase
| # | File | Trạng thái |
| --- | --- | --- |
| 1.1 | PHASE_NN_01_<PART>.md | Todo |
| N.99 | PHASE_NN_99_User_Acceptance.md | Todo |

Bước `N.99` luôn nằm cuối bảng, thực hiện sau owner xác nhận UI, gắn API của phase, Dọn dẹp và Kiểm tra. Khi tạo phase,
thay `N`/`NN` bằng số phase thực tế và tạo file UAT tương ứng (ví dụ `PHASE_02_99_User_Acceptance.md`) với phạm vi,
điều kiện bắt đầu, các bước User kiểm tra, kết quả mong đợi, liên kết bằng chứng AI và phần xác nhận của owner.
Owner thực hiện UAT cuối cùng; chỉ chuyển phase sang `Done` khi owner xác nhận đạt.

## Tiêu chí nghiệm thu màn hình
- [ ] Bàn giao thiết kế đủ chi tiết; đúng màn hình/phiên bản/biến thể và asset được chỉ định (nếu có UI).
- [ ] UI chạy thật đã đối chiếu với ảnh/đặc tả; PROGRESS có bằng chứng, sai khác và phần chưa kiểm tra (nếu có UI).
- [ ] Owner đã xác nhận UI, có bằng chứng trong PROGRESS.
- [ ] API trong phạm vi đã tích hợp và kiểm thử; mốc không áp dụng có lý do trong spec.
- [ ] Đủ 4 trạng thái loading / empty / error / success
- [ ] Maestro flow: `e2e/flows/<screen>-<flow>.yaml`
- [ ] ...

Sau mỗi tổng kết test/AI review, đồng bộ checklist của sub-phase và phase, bảng trạng thái bên trên, roadmap và
entry PROGRESS theo [B.7.1](../../README.md#b71-đồng-bộ-sau-mỗi-tổng-kết-test-hoặc-ai-review).
Mỗi mục chưa đủ bằng chứng phải có lý do/phần còn thiếu và liên kết nguồn; không để checkbox trống không giải thích.
