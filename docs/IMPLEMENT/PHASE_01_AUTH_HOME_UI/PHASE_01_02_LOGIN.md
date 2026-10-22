# 1.2 Welcome và Login

## Mô tả

Welcome theo ảnh tham chiếu: mascot ở vùng trên, tiêu đề “Chào mừng bạn!”, mô tả ngắn, CTA “Tạo tài khoản” và
“Đăng nhập”. Login đã quan sát: Back tròn góc trái, mascot nhỏ phía trên panel trắng, tiêu đề giữa, input pill có
icon thư/khoá, hiện/ẩn password, CTA gradient mint/forest và link Register bên dưới.
Nguồn gốc có Ghi nhớ đăng nhập, Quên mật khẩu và Google. Mobile bỏ Ghi nhớ vì session do cookie backend quản lý;
ẩn Quên mật khẩu/Google khi chưa có API/luồng mobile hỗ trợ. Sai khác ghi trong
[bản đối chiếu](references/DESIGN_SOURCE.md); không lưu password/token để mô phỏng remember-me.

## Đặc tả UI từ Claude Design (Claude Code bàn giao, 2026-10-17 16:11)

Nguồn: Auth `Us4jQKCMwnxgvieMGTbdaG` version `1792222520-e878`, bản trích
[source/auth-design.html](references/source/auth-design.html). Ảnh: [Welcome (artifact)](references/claude-auth-welcome-artifact.jpg),
[Welcome (owner)](references/claude-auth-welcome.png). Login **chưa có ảnh**; markup trong bản trích là căn cứ.
Quy tắc chung (quy đổi status bar, token, chữ, bóng, preview) ở [1.1](PHASE_01_01_DESIGN_FOUNDATION.md#đặc-tả-ui-từ-claude-design-claude-code-bàn-giao-2026-10-17-1611).

### Shell Auth dùng chung (Welcome, Login, Register, Check email)

Cấu trúc: một `ScrollView` dọc chứa **vùng trên** (gradient + mascot) rồi **sheet trắng** chồng lên vùng trên.
Không có phần cố định ngoài nút Back.

| Thành phần | Thông số thiết kế | Mobile |
| --- | --- | --- |
| Nền màn | `#fff` | `bg-canvas` |
| Vùng trên — chiều cao | Welcome **420**, Login **250**, Register **230** (gồm 46 status bar) | `insets.top + 374 / 204 / 184`. Check email dùng như Login |
| Vùng trên — nền | `G-auth` 160° banner→logo-soft 45%→sunshine | SVG phủ toàn vùng, `overflow:hidden` |
| Tròn trang trí 1 | `left:-40; top:70; 180×180`, `canvas/35` | `top: insets.top + 24` |
| Tròn trang trí 2 | `right:-30; top:30; 140×140`, `canvas/30` | `top: insets.top − 16` (có thể tràn lên vùng status bar) |
| Mascot | `mindy-mascot-laptop.png`, giữa ngang, `bottom` Welcome **50** / form **36**, rộng Welcome **280** / form **170**, cao tự theo tỉ lệ 540:432 | Welcome 280×224, form 170×136. Màn hẹp: rộng tối đa `screenWidth − 110` |
| Nút Back (form) | 46×46 tròn, `canvas`, bóng `0 4 12 forest/15`, icon mũi tên trái 20, stroke đen 2; `top:56; left:16`; z trên sheet | `top: insets.top + 10`. Label “Quay lại” |
| Sheet | `margin-top:-32`, bo trên **32**, `canvas`, padding **26 / 22 / 40** (trên/ngang/dưới), cao tối thiểu Welcome 456 / form 620 | Cao tối thiểu = phần còn lại của màn (lấp đáy), padding dưới `40 + insets.bottom` |

Không có chữ “Mindy Coding”, logo hoặc vòng tròn màu kem/xám đặc như bản triển khai trước. Hai vòng tròn là trắng mờ.

Khối dùng lại trong sheet:

| Khối | Thông số |
| --- | --- |
| Tiêu đề H1 | Welcome **28**, form **26**; weight 800; đen; căn giữa; tracking −0.02em |
| Mô tả | **14.5**, line-height 1.6 (23.2), `muted`, căn giữa |
| Nút chính | Cao **54**, rộng 100%, pill, `G-cta`, chữ trắng **16 / 800**, bóng `0 8 20 forest/25` |
| Nút phụ | Cao **54**, pill, nền `canvas`, viền **1.5 `banner`**, chữ đen **16 / 700** |
| Divider “hoặc tiếp tục với” và nút Google | Ẩn trong app (Google chưa hỗ trợ) — ẩn cả divider |
| Dòng chân form | `margin-top:22`, căn giữa, **14.5** đen; link **800 `mint` gạch chân**, cùng dòng |

### Welcome

Thứ tự trong sheet: H1 “Chào mừng bạn!” → mô tả 2 dòng (xuống dòng sau “lập trình.”) với `margin 10 0 24` →
nút chính “Tạo tài khoản” → nút phụ “Đăng nhập” `margin-top:12`. Kết thúc tại đây (Google ẩn).
Link preview `__DEV__` đặt dưới, theo [1.1](PHASE_01_01_DESIGN_FOUNDATION.md#công-cụ-preview-không-được-làm-lệch-layout).

### Login

Thứ tự sheet: H1 “Đăng nhập” (`margin-bottom:18`) → 2 field (gap **14**) → nút chính “Đăng nhập” → dòng chân
“Chưa có tài khoản? **Đăng ký**”.

- Hàng “Ghi nhớ đăng nhập / Quên mật khẩu?” (`margin-top:12`) **ẩn**; khi ẩn, nút submit cách field cuối **20**.
- Field (dùng chung Register):

| Phần | Thông số |
| --- | --- |
| Label | **13.5 / 700** đen, cách ô **6** |
| Ô nhập | Cao **50**, pill, padding ngang **14**, gap **10**, nền **`canvas`** (không phải `soft`), viền **1.5 `line`**; lỗi → viền `headsup` |
| Icon trái | 17×17, stroke `muted` 2. Email: thư `M3 6h18v12H3zM3 7l9 6 9-6`; mật khẩu: khoá `M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4` |
| Text | **15** đen; placeholder `ten@email.com` / `••••••••`, màu `muted` |
| Hiện/ẩn mật khẩu | Icon mắt 18, stroke `muted`; vùng chạm mở rộng 44×44 (thiết kế 18) |
| Lỗi field | **12.5 / 600** `headsup`, `padding-left:14`, dưới ô |

- Thông điệp lỗi theo thiết kế: “Email không hợp lệ”, “Mật khẩu tối thiểu 8 ký tự”. **Không dùng** quy tắc
  8 ký tự của prototype: Login giữ 1–128 theo 1.2.2 (contract thắng); chỉ lấy văn phong.
- Lỗi chung của form (sai thông tin, mạng): khối trên field đầu, chữ 13.5/700 `headsup`, nền `peach`, bo 14,
  padding 12×14. Thiết kế chỉ có toast `forest` ở đáy cho thông báo thành công; không dùng toast cho lỗi vì
  dễ bị bỏ lỡ với trình đọc màn hình (sai khác có chủ đích).

### Sai khác của bản triển khai 2026-10-17 phải sửa

| # | Hiện tại ([ảnh](../../PROGRESS/PHASE_01_AUTH_HOME_UI/evidence/phase1-welcome.png), [Login](../../PROGRESS/PHASE_01_AUTH_HOME_UI/evidence/phase1-login.png)) | Đúng thiết kế |
| --- | --- | --- |
| A1 | Nền vùng trên `soft` phẳng + vòng tròn kem/xám đặc | Gradient `G-auth` + 2 vòng tròn trắng mờ, đúng vị trí bảng trên |
| A2 | Chữ “Mindy Coding” trên mascot | Bỏ |
| A3 | H1 và mô tả màu `forest`; H1 Welcome ~38dp | H1 đen 28/26; mô tả `muted` 14.5 |
| A4 | Nút phụ viền `mint` | Viền 1.5 `banner`, chữ đen 700 |
| A5 | Ô nhập nền `soft` | Nền `canvas`, viền `line` |
| A6 | Không có placeholder | `ten@email.com` / `••••••••` |
| A7 | Dòng chân form dạng 1 link màu forest | “Chưa có tài khoản?” đen + “Đăng ký” mint 800 gạch chân |
| A8 | Nút chính thiếu bóng | Bóng `0 8 20 forest/25` |
| A9 | Panel preview đẩy màn xuống | Theo 1.1, bộ chọn nổi thu gọn |

Tiêu chí đối chiếu: chụp Welcome/Login trên Pixel 8 (1080×2400, density 420, font 1.0) khi bộ chọn preview thu
gọn; đặt cạnh [ảnh Welcome artifact](references/claude-auth-welcome-artifact.jpg). Đo: mép trên sheet ở
`insets.top + 342` (Welcome) / `+172` (Login); mascot căn giữa; khoảng cách các khối đúng bảng. Sai lệch ≤ 4dp
được chấp nhận; lệch hơn ghi vào PROGRESS kèm lý do.

## API / dữ liệu

Tham chiếu [Auth §6.4](../../API_CONTRACT/auth.md): khi tích hợp, payload chỉ có `email`, `password`,
`deviceName?`; trả `AuthenticatedUserDto` và cookie. Trong phạm vi UI, controller nhận callback/pending/error từ
adapter có kiểu; test dùng callback giả, không ghi authenticated user vào store thật.

## Task

### 1.2.1 Welcome và chuyển chế độ Auth

- CTA tạo tài khoản mở Register; đăng nhập mở Login; Back trở lại Welcome trong preview Auth.
- Test cần viết trước: từng CTA gọi đúng callback một lần; không xuất hiện Google/quên mật khẩu hoạt động giả.
- testID: `welcome-screen`, `welcome-register-button`, `welcome-login-button`.
- i18n key: `auth.welcome.title`, `auth.welcome.description`, `auth.welcome.register`, `auth.welcome.login`.

### 1.2.2 Form và validation Login

- Email bắt buộc, đúng định dạng, tối đa 320; mật khẩu bắt buộc **1–128**, không áp dụng min 6 của Register.
- Validate zod khi blur/submit; không trim password. Email dùng bàn phím email, tắt auto-capitalize; cấu hình autofill.
- Chuyển focus email → password → submit; hiện/ẩn password giữ nội dung; cuộn khi bàn phím mở.
- Test cần viết trước: email sai/rỗng, password 0/1/128/129 ký tự; invalid không submit; toggle không đổi password.
- testID: `login-screen`, `login-email-input`, `login-password-input`, `login-password-toggle`, `login-submit-button`.
- i18n key: `auth.login.title`, `auth.fields.email`, `auth.fields.password`, `auth.validation.*`, `auth.login.submit`.

### 1.2.3 Pending, lỗi và chuyển giao thành công

- Pending khoá nút/chặn submit lặp, có busy state; lỗi giữ dữ liệu đã nhập.
- `INVALID_CREDENTIALS`: “Email hoặc mật khẩu không đúng”, không tiết lộ field nào sai.
- 422 map field nếu nhận ra; lỗi khác ở đầu form theo `errors.<CODE>`/fallback, có `requestId` nếu được cung cấp.
- Mất mạng có phản hồi rõ ràng, không tự retry mutation. Thành công gọi callback của luồng auth; không tự gán role.
- Test cần viết trước: double submit, pending, lỗi chung, 422/fallback, giữ dữ liệu và callback success đúng một lần.
- testID: `login-form-error`, `login-register-link`; i18n key: `errors.INVALID_CREDENTIALS`, `errors.generic`, `auth.login.registerLink`.

## Tiêu chí nghiệm thu

- [ ] Welcome/Login khớp nguồn Claude đã xác nhận và hoạt động khi bàn phím mở/chữ lớn.
- [ ] Có idle (form trống), validation, pending, error và success; không ép empty illustration vào form trống.
- [ ] Không lưu/log password, cookie hoặc token; không tự đăng nhập giả khi bấm CTA.
- [ ] Test form/callback xanh; Maestro dự kiến `e2e/flows/auth-ui-login.yaml`.
