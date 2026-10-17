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

## B.3 Cấu trúc phase

- **Phase 0 (`PHASE_00_FOUNDATION`)**: hạ tầng và component dùng chung. Phải nghiệm thu xong trước mọi phase màn hình.
- **Phase 1 trở đi**: mỗi phase là **một màn hình** (`PHASE_01_HOME`).
- **Sub-phase** (`1.1`, `1.2`...): mỗi sub-phase là **một phần của màn hình** (Header, Banner...). Số thứ tự chỉ dùng
  cho phần màn hình, không dùng cho bước quy trình.
- **Task** (`1.1.1`, `1.1.2`...): nằm bên trong file sub-phase, mỗi task là một đơn vị TDD nhỏ.
- Mỗi phase màn hình kết thúc bằng **ba bước cố định, có tên, không đánh số**: **Dọn dẹp → Kiểm tra → Nghiệm thu**.

Quy ước đặt tên:

- Phase: `PHASE_<NN>_<SCREEN>`. Sub-phase: `PHASE_<NN>_<MM>_<PART>`. Luôn có số 0 ở đầu (`PHASE_01`, không phải
  `PHASE_1`).
- Phần chữ trong tên phase viết UPPER_SNAKE_CASE tiếng Anh: `PHASE_01_HOME/PHASE_01_01_HEADER.md`.
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
Đọc spec phase + API contract + guide liên quan
  → Với mỗi sub-phase 1.x, mỗi task 1.x.y:
        Red: viết test (+ MSW handler) → chạy, phải fail
        Green: viết code tối thiểu cho test pass
        Refactor khi test xanh
        Ghi entry PROGRESS cho task
  → Viết Maestro flow cho luồng chính của màn hình
  → Dọn dẹp
  → Kiểm tra
  → Đổi trạng thái sang In review, ghi PROGRESS, báo owner
  → Nghiệm thu (owner) → Done → phase tiếp theo
```

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

**Nghiệm thu**: owner (@Bero) duyệt theo mục "Tiêu chí nghiệm thu" viết sẵn trong file IMPLEMENT. Agent **KHÔNG
ĐƯỢC** tự đánh dấu `Done`. Owner không duyệt thì quay lại bước tương ứng, ghi entry mới.

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
