# Tài liệu MindyMobile

Điểm vào của toàn bộ tài liệu MindyMobile (app React Native của Mindy Center). Mọi người và AI agent **PHẢI** đọc
file này trước khi làm bất kỳ việc gì: file nêu thứ tự ưu tiên khi các nguồn mâu thuẫn, nên đọc gì cho từng việc, và
quy trình làm việc cố định.

- Owner (người nghiệm thu): **@Bero**.
- Ngôn ngữ tài liệu: tiếng Việt. Tên file, tên thư mục, code, `testID`: tiếng Anh.

## Từ khoá

- **PHẢI**: bắt buộc, review sẽ chặn.
- **KHÔNG ĐƯỢC**: cấm.
- **NÊN**: khuyến nghị. Làm khác thì ghi lý do.

## Bản đồ thư mục

| Đường dẫn | Nội dung |
| --- | --- |
| [BUSINESS_RULES.md](BUSINESS_RULES.md) | Rule nghiệp vụ (quyền, giỏ hàng, thanh toán, điểm danh, định dạng tiền/ngày giờ) |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Tech stack, cây thư mục, tầng gọi API, danh sách file hạ tầng bị khoá |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Lệnh, máy ảo, thứ tự TDD, Definition of Done |
| [guides/](guides/) | Quy chuẩn kỹ thuật: [typescript](guides/typescript.md), [api-client](guides/api-client.md), [styling](guides/styling.md), [visual-and-motion](guides/visual-and-motion.md), [ux](guides/ux.md), [performance](guides/performance.md), [logging](guides/logging.md), [testing](guides/testing.md), [linting](guides/linting.md) |
| [adr/](adr/README.md) | Quyết định kiến trúc (ADR) |
| [API_CONTRACT/](API_CONTRACT/README.md) | Hợp đồng API theo domain |
| [CORE/GLOBAL_CSS.md](CORE/GLOBAL_CSS.md) | Token màu, font, border (nguồn từ web) |
| [IMPLEMENT/](IMPLEMENT/README.md) | Spec từng phase: làm gì, tiêu chí nghiệm thu, roadmap |
| [PROGRESS/](PROGRESS/) | Nhật ký thực hiện, chỉ ghi thêm. Cấu trúc giống `IMPLEMENT/` |

Bản gốc trước khi tách: [BUSINESS_RULES.legacy.md](BUSINESS_RULES.legacy.md),
[API_CONTRACT_FE.legacy.md](API_CONTRACT/API_CONTRACT_FE.legacy.md). Giữ tới khi owner xác nhận đã tách đủ, không
dùng làm nguồn khi viết code mới.

---

# Quy trình làm việc

Áp dụng cố định cho mọi lần triển khai. Lý do của quy trình: [ADR-0014](adr/ADR-0014-docs-workflow.md).
Quyền tự nghiệm thu của AI và UAT cuối phase: [ADR-0017](adr/ADR-0017-ai-self-review-owner-uat.md).
Thứ tự trong **từng phase** theo [ADR-0021](adr/ADR-0021-per-phase-ui-approval-api-uat.md): **thiết kế và triển khai UI → owner xác nhận UI → gắn API → owner UAT**.

## B.1 Thứ tự ưu tiên khi các nguồn mâu thuẫn

1. `docs/API_CONTRACT/`: hành vi API (route, body, mã lỗi, polling).
2. `docs/BUSINESS_RULES.md`: rule nghiệp vụ.
3. `docs/adr/` (Accepted): quyết định kiến trúc. ADR mới hơn thay ADR cũ khi có "Superseded by".
4. `docs/ARCHITECTURE.md` và `docs/guides/`: quy chuẩn kỹ thuật.
5. `docs/CORE/`: token màu, font, border.
6. `docs/IMPLEMENT/`: spec của phase đang làm.
7. Code mẫu của boilerplate: chỉ để tham khảo.

Spec phase (6) mâu thuẫn với nguồn 1–5 thì **dừng lại hỏi owner**, không tự chọn.

## B.2 Đọc tài liệu theo vai trò

| Muốn làm | Đọc |
| --- | --- |
| Bắt đầu một phase | [IMPLEMENT/README.md](IMPLEMENT/README.md) → `IMPLEMENT/<phase>/README.md` → file sub-phase → API contract được liệt kê → guide liên quan |
| Biết vì sao chọn công nghệ X | [adr/README.md](adr/README.md) |
| Rule nghiệp vụ (giới hạn giỏ, quyền, thanh toán) | [BUSINESS_RULES.md](BUSINESS_RULES.md) |
| Chạy app, test, lint | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Xem đã làm tới đâu | [IMPLEMENT/README.md](IMPLEMENT/README.md) (tổng quan), `PROGRESS/<phase>/` (chi tiết) |

### B.2.1 Phân công thiết kế và triển khai UI

Theo [ADR-0019](adr/ADR-0019-claude-design-handoff-codex-ui.md), **Claude Code** chịu trách nhiệm lấy thiết kế từ
Claude Design, xác định đúng màn hình/phiên bản/biến thể và mô tả kỹ trong `IMPLEMENT/<phase>/` trước khi
**Codex** triển khai UI tương ứng. README phase ghi nguồn và phạm vi; sub-phase ghi bố cục, thông số UI,
ảnh/asset, trạng thái, tương tác và tiêu chí nghiệm thu; tài liệu tham chiếu nằm trong `references/` của phase.

Codex triển khai theo bàn giao, đối chiếu UI chạy thật với ảnh/đặc tả và ghi bằng chứng, sai khác cùng phần chưa
kiểm tra vào PROGRESS. Đầu vào thiếu phải được bổ sung; không tự chọn lại thiết kế hoặc thay asset. Thay đổi
thiết kế được Claude Code cập nhật vào IMPLEMENT trước khi Codex sửa phần UI tương ứng. Owner thực hiện UAT
cuối phase theo ADR-0017. Owner xác nhận UI trước khi Codex gắn API trong chính phase đó theo ADR-0021;
bàn giao UI hoặc test xanh không thay thế xác nhận của owner.

## B.3 Cấu trúc phase

- **Phase 0 (`PHASE_00_FOUNDATION`)**: hạ tầng và component dùng chung. Phải nghiệm thu xong trước mọi phase màn hình.
- **Phase 1 trở đi**: mỗi phase là **một màn hình** (`PHASE_01_HOME`).
- **Sub-phase** (`1.1`, `1.2`...): mỗi sub-phase là **một phần của màn hình** (Header, Banner...). Số thứ tự chỉ dùng
  cho phần màn hình, ngoại trừ bước UAT cố định `N.99` theo ADR-0017.
- **Task** (`1.1.1`, `1.1.2`...): nằm bên trong file sub-phase, mỗi task là một đơn vị TDD nhỏ.
- Mỗi phase lớn kết thúc bằng **Dọn dẹp → Kiểm tra → User Acceptance (UAT)**. Dọn dẹp và Kiểm tra không đánh số;
  UAT là bước `N.99`, luôn nằm cuối bảng sub-phase và được thực hiện bởi owner.

Quy ước đặt tên:

- Phase: `PHASE_<NN>_<SCREEN>`. Sub-phase: `PHASE_<NN>_<MM>_<PART>`. Luôn có số 0 ở đầu (`PHASE_01`, không phải
  `PHASE_1`).
- Phần chữ trong tên phase viết UPPER_SNAKE_CASE tiếng Anh: `PHASE_01_HOME/PHASE_01_01_HEADER.md`.
- Ngoại lệ bắt buộc cho UAT: `PHASE_<NN>_99_User_Acceptance.md` trong thư mục phase, giữ nguyên `User_Acceptance`.
  `<NN>` là số phase hai chữ số (kể cả `00`); `99` dành riêng cho UAT, sub-phase triển khai dùng `01`–`98`.
  Ví dụ: `PHASE_02_99_User_Acceptance.md`, luôn xếp cuối các file `PHASE_*` theo tên.
- ADR: `ADR-<NNNN>-<kebab-slug>.md`.

## B.4 Thứ tự thực hiện

- Task trong sub-phase: tuần tự. Xong `1.1.1` (test xanh) mới sang `1.1.2`.
- Sub-phase trong phase: tuần tự. Xong `1.1` mới sang `1.2`.
- Phase màn hình độc lập nhau: **được làm song song** sau khi Phase 0 nghiệm thu. Phụ thuộc giữa các phase ghi ở
  [IMPLEMENT/README.md](IMPLEMENT/README.md).
- Phase bị chặn bởi yếu tố ngoài (API PLANNED, chờ backend): đặt trạng thái **Blocked**, ghi lý do, chuyển sang phase
  khác. Không tự làm thay phần bị chặn.

Trạng thái hợp lệ: `Todo` · `In progress` · `Blocked` · `In review` · `Done`.

## B.5 Vòng đời một phase

```
Trong mỗi phase:
  1. Claude Code bàn giao thiết kế/đặc tả → Codex triển khai UI, đối chiếu và ghi PROGRESS
  2. Owner xác nhận UI → ghi bằng chứng xác nhận trong PROGRESS
  3. Codex gắn API của chính phase đó theo contract
  4. Dọn dẹp → Kiểm tra → owner UAT (N.99) → Done khi owner xác nhận đạt

Trong bước UI và bước API, task/sub-phase vẫn làm tuần tự:
  Red → Green → Refactor → AI tự kiểm tra và ghi PROGRESS
  MSW cho test HTTP; test UI chỉ callback thì không cần MSW.

```

**Mốc xác nhận UI trước API**: phase chuyển `In review`, ghi rõ “chờ owner xác nhận UI”; mốc API và UAT
còn `Todo`. Owner phải xác nhận rõ UI của phase trước khi AI gắn API. Yêu cầu chỉnh UI, duyệt ADR hoặc im lặng
không được xem là đã duyệt UI. Sau duyệt UI, đặc tả task tích hợp của cùng phase và chuyển `In progress` khi bắt đầu.
API/phụ thuộc chưa sẵn sàng thì `Blocked`; không bỏ qua để đóng phase. Mốc không áp dụng phải có lý do trong spec.

**Dọn dẹp** (chỉ trong phạm vi phase):

- Phạm vi: các file trong `git diff --name-only main...HEAD`.
- Xoá: code chết, import thừa, `logger.debug` tạm, TODO đã xong, file/asset/translation key **do phase này tạo ra** mà
  không còn dùng.
- **KHÔNG ĐƯỢC** sửa file ngoài phạm vi, kể cả khi thấy "rác". Ghi lại vào mục "Ghi chú" của entry PROGRESS để owner
  quyết định.

**Kiểm tra** (tất cả phải qua):

```bash
npm run lint:rules
npm run lint:code-format
npm run lint:type-check
npm test
npm run test:e2e        # Ít nhất trên Android Emulator. iOS nếu có macOS.
```

Và đủ Definition of Done trong [CONTRIBUTING.md](CONTRIBUTING.md#definition-of-done).

**AI tự nghiệm thu trong quá trình triển khai**: AI được tự kiểm tra, nghiệm thu và đánh giá task/sub-phase theo
tiêu chí trong IMPLEMENT, ghi kết quả và bằng chứng vào PROGRESS rồi tiếp tục theo thứ tự, phụ thuộc đã quy định.
Entry phải ghi rõ AI thực hiện, tiêu chí đạt/chưa đạt, phần chưa kiểm tra và vấn đề còn tồn tại. AI chỉ tiếp tục
trong bước đang được phép; không tự vượt mốc xác nhận UI hoặc UAT của owner.

**Nghiệm thu cuối cùng (UAT)**: mỗi phase lớn, bao gồm Phase 0 và các phase màn hình, kết thúc bằng UAT do owner
(@Bero) thực hiện theo mục "Tiêu chí nghiệm thu" trong IMPLEMENT. AI bàn giao hướng dẫn UAT, bằng chứng và tổng hợp
tự nghiệm thu tại `PROGRESS/<phase>/README.md`. Hướng dẫn UAT nằm trong file riêng
`IMPLEMENT/<phase>/PHASE_<NN>_99_User_Acceptance.md`, gồm phạm vi, điều kiện bắt đầu, bước kiểm tra, kết quả mong đợi,
liên kết bằng chứng và phần ghi nhận kết quả/xác nhận của owner. Phase và bước `N.99` chờ UAT ở `In review`
sau khi UI đã được owner xác nhận, API trong phạm vi đã tích hợp và đủ điều kiện kiểm tra; kết quả UAT thực tế
ghi thêm vào nhật ký cấp phase. Xác nhận UI và xác nhận UAT là hai mốc riêng; fixture/callback không chứng minh API thật.
Chỉ owner xác nhận UAT đạt mới được chuyển phase sang `Done`; AI **KHÔNG ĐƯỢC** tự đánh dấu phase `Done` hoặc xác
nhận UAT thay owner. Owner chưa duyệt thì chưa hoàn tất; UAT chưa đạt thì quay lại bước tương ứng và ghi entry mới.

## B.6 Template

| Template | Dùng khi |
| --- | --- |
| [IMPLEMENT/_template/PHASE_README.md](IMPLEMENT/_template/PHASE_README.md) | Tạo phase mới (README của phase) |
| [IMPLEMENT/_template/SUBPHASE.md](IMPLEMENT/_template/SUBPHASE.md) | Tạo file sub-phase |
| [PROGRESS/_template/ENTRY.md](PROGRESS/_template/ENTRY.md) | Thêm entry vào file PROGRESS |
| [adr/template.md](adr/template.md) | Viết ADR mới |

## B.7 Quy tắc ghi PROGRESS

- **Mỗi lần xong một task, hoặc đổi trạng thái phase, PHẢI thêm một entry.** Entry của task ghi vào
  `PROGRESS/<phase>/<sub-phase>.md`; entry của Dọn dẹp, Kiểm tra, Nghiệm thu và đổi trạng thái phase ghi vào
  `PROGRESS/<phase>/README.md`.
- Entry mới luôn **thêm vào cuối file**. **KHÔNG ĐƯỢC** sửa hoặc xoá entry cũ.
- Ghi sai thì thêm entry mới, dòng đầu "Đính chính entry <thời gian>".
- Thời gian lấy từ lệnh `date '+%Y-%m-%d %H:%M'` ở múi giờ `Asia/Ho_Chi_Minh` (+07:00).
- Tên lấy từ GitHub handle: `gh api user --jq .login`. Không lấy được thì hỏi người dùng, **không được đoán**.
- Đồng thời cập nhật cột trạng thái trong [IMPLEMENT/README.md](IMPLEMENT/README.md) và trong README của phase. Đây là
  bảng tổng quan nên được phép sửa đè. Lịch sử nằm ở PROGRESS.

## B.8 Hạ tầng và công nghệ mới

- File trong danh sách [File hạ tầng (bị khoá)](ARCHITECTURE.md#file-hạ-tầng-bị-khoá) ở `ARCHITECTURE.md` **KHÔNG
  ĐƯỢC** sửa, trừ khi:
  1. Có ADR mới (hoặc ADR được cập nhật trạng thái) mô tả thay đổi, **và**
  2. Owner đã đổi ADR đó sang `Accepted`, **và**
  3. `ARCHITECTURE.md` được cập nhật trong cùng PR.
- Thêm thư viện mới (kể cả devDependency): viết ADR `Proposed` → chờ owner duyệt `Accepted` → mới được `npm install`
  → cập nhật bảng tech stack trong `ARCHITECTURE.md`.
- Sửa lỗi khẩn trong file hạ tầng: vẫn phải có ADR, có thể ngắn, ghi rõ "Hotfix".
- Phát hiện cần sửa hạ tầng giữa chừng một phase: dừng task đó, đặt `Blocked`, viết ADR `Proposed`, báo owner.

## B.9 Khi nào phải dừng và hỏi owner

- Spec phase mâu thuẫn với API contract, business rules hoặc ADR.
- API cần dùng có nhãn **PLANNED**.
- Cần sửa file hạ tầng hoặc thêm thư viện.
- Không xác định được GitHub handle.
- Phát hiện rác ngoài phạm vi phase.
- Tiêu chí nghiệm thu không rõ hoặc không kiểm tra được.
