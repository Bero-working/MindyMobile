# 1.3 Register và trạng thái kiểm tra email

## Mô tả

Register kế thừa nhận diện Auth, có tên hiển thị, email, mật khẩu, xác nhận mật khẩu và điện thoại tuỳ chọn.
Bản Auth đã đọc chỉ có email/password/confirmPassword, Back, mascot, mô tả, checkbox Điều khoản & Chính sách,
CTA và link Login. **Bổ sung displayName bắt buộc** và phone optional theo contract, giữ cùng kiểu input pill.
Thứ tự form mobile: displayName → email → phone (tuỳ chọn) → password → confirmPassword. Panel cuộn để chứa
field bổ sung; không thu nhỏ chữ hoặc che CTA. Google ẩn; checkbox/link pháp lý chưa phát hành khi chưa có
nội dung và URL thật. Check email/resend bổ sung theo contract, chưa có trong artifact đã đọc.

## Đặc tả UI từ Claude Design (Claude Code bàn giao, 2026-10-17 16:11)

Nguồn: Auth version `1792222520-e878`, [bản trích](references/source/auth-design.html),
[ảnh Register](references/claude-auth-register.jpg). Shell, nút, field và dòng chân form dùng đúng thông số
[1.2](PHASE_01_02_LOGIN.md#shell-auth-dùng-chung-welcome-login-register-check-email).

### Register

- Vùng trên cao `insets.top + 184` (thiết kế 230), mascot rộng 170, `bottom:36`. Mép trên sheet ở `insets.top + 152`.
- Thứ tự sheet:
  1. H1 “Tạo tài khoản” 26/800 đen, căn giữa.
  2. Mô tả `margin 8 0 18`, **14**, line-height 1.5 (21), `muted`, 2 dòng: “Học lập trình. Mở thế giới của bạn.”
     xuống dòng “**Bạn đã sẵn sàng chưa?**” (đậm, đen).
  3. Field, gap **14**, thứ tự mobile: Tên hiển thị → Email → Số điện thoại (tuỳ chọn) → Mật khẩu → Xác nhận mật khẩu.
     Thiết kế chỉ có Email / Mật khẩu / Xác nhận mật khẩu; hai field thêm theo contract dùng cùng kiểu.
     Icon bổ sung (cùng bộ stroke 2, 17dp): tên `M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0`
     (icon người lấy từ tab Tài khoản của Home); điện thoại
     `M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2`
     (bổ sung, thiết kế không có). Placeholder tên “Họ và tên”, điện thoại để trống. Label tuỳ chọn ghi “(không bắt buộc)” màu `muted` 600.
  4. Hàng checkbox “Đồng ý Điều khoản & Chính sách” (`margin-top:12`) **ẩn** tới khi có tài liệu pháp lý thật.
     Khi ẩn, nút “Đăng ký” cách field cuối **20**.
  5. Nút chính “Đăng ký”.
  6. Dòng chân: “Đã có tài khoản? **Đăng nhập**”.
- Thông điệp lỗi theo văn phong thiết kế: “Email không hợp lệ”, “Mật khẩu xác nhận không khớp”. Biên mật khẩu
  6–128 theo contract (prototype ghi 8 — không áp dụng).

### Check email (không có trong thiết kế)

Dựng từ cùng shell để không tự sáng tác phong cách mới:

- Vùng trên như Login (mascot laptop 170). Sheet: H1 “Kiểm tra email” 26/800 → mô tả 14.5 `muted`
  `margin 10 0 24` (thông điệp trung lập, hiện email đã nhập in đậm đen) → nút chính “Về đăng nhập” →
  nút phụ “Gửi lại email” `margin-top:12` → phản hồi resend 13.5/700 căn giữa `margin-top:12`
  (`mint` khi thành công, `headsup` khi lỗi).
- Không có nút Back trên màn này (tránh quay lại form đã gửi); Android Back về Login.
- Thành công hiển thị inline như trên, không dùng toast.

### Sai khác của bản triển khai 2026-10-17 phải sửa

| # | Hiện tại ([Register](../../PROGRESS/PHASE_01_AUTH_HOME_UI/evidence/phase1-register.png), [Check email](../../PROGRESS/PHASE_01_AUTH_HOME_UI/evidence/phase1-check-email.png)) | Đúng thiết kế |
| --- | --- | --- |
| R1 | Toàn bộ A1–A9 của 1.2 | Áp dụng như Login |
| R2 | Thiếu mô tả 2 dòng dưới H1 | Thêm, dòng 2 đậm đen |
| R3 | Vùng trên cao như Login | 184 + insets.top (thấp hơn Login 20) |
| R4 | Check email dùng bố cục riêng | Theo mục Check email ở trên |

Tiêu chí đối chiếu: chụp Register cạnh [ảnh Register](references/claude-auth-register.jpg) ở cùng điều kiện 1.2;
ghi riêng phần dài thêm do 2 field bổ sung.

## API / dữ liệu

Tham chiếu [Auth §6.1–6.2](../../API_CONTRACT/auth.md). Register nhận 202 với thông báo trung lập, **không tạo
session**; resend nhận cùng loại phản hồi. UI nhận callback có kiểu; phase này không triển khai service/backend.

## Task

### 1.3.1 Form Register và ranh giới payload

- `displayName`: 1–150 ký tự, có ít nhất một ký tự không phải khoảng trắng.
- `email`: email hợp lệ, tối đa 320; `password`: **6–128**, không trim.
- `confirmPassword`: khớp password; chỉ là field UI, không gửi backend.
- `phone`: tuỳ chọn; có nhập thì 7–32 ký tự theo contract, không tự ép quy tắc số điện thoại Việt Nam.
- Payload tích hợp sau này chỉ gồm `displayName`, `email`, `password`, `phone?`; rỗng thì bỏ `phone`.
  Không có `role`, `status`, `confirmPassword` hoặc checkbox giao diện trong payload.
- Test cần viết trước: biên từng field, tên toàn khoảng trắng, phone trống/6/7/32/33, password 5/6/128/129,
  confirm sai, payload whitelist và password có khoảng trắng được giữ nguyên.
- testID: `register-screen`, `register-display-name-input`, `register-email-input`, `register-phone-input`,
  `register-password-input`, `register-confirm-password-input`, `register-submit-button`.
- i18n key: `auth.register.title`, `auth.fields.displayName`, `auth.fields.phone`, `auth.fields.confirmPassword`, `auth.validation.*`.

### 1.3.2 Submit và trạng thái kiểm tra email

- Pending khoá submit, giữ giá trị nếu lỗi; 422 map field hoặc đầu form, 503 `MAIL_DELIVERY_UNAVAILABLE` có thông báo thử lại.
- 202 chuyển sang “Kiểm tra email” với cùng thông điệp cho cả email mới và đã tồn tại; không hiện “Email đã đăng ký”.
- Không chuyển Home, không set auth store. Có “Về đăng nhập”; không nhận token/link email trên mobile trong phase này.
- Test cần viết trước: submit lặp, 202 trung lập, không gọi callback đăng nhập, 503/422 và giữ dữ liệu.
- testID: `register-form-error`, `register-check-email`, `register-login-link`.
- i18n key: `auth.register.submit`, `auth.register.checkEmailTitle`, `auth.register.checkEmailDescription`,
  `auth.register.backToLogin`, `errors.MAIL_DELIVERY_UNAVAILABLE`.

### 1.3.3 UI gửi lại email

- Trên trạng thái kiểm tra email có callback “Gửi lại email”, pending/error/success riêng; không tự gửi khi render.
- Không đặt thời gian đếm ngược theo suy đoán. Nếu nhận 429, xử lý giới hạn theo phản hồi thực tế của tầng tích hợp.
- Test cần viết trước: chỉ gửi khi bấm, chống bấm lặp, thông báo trung lập, lỗi không làm mất trạng thái kiểm tra email.
- testID: `register-resend-button`, `register-resend-feedback`.
- i18n key: `auth.register.resend`, `auth.register.resendSuccess`.

## Tiêu chí nghiệm thu

- [x] Autofill đúng, có hiện/ẩn password, next focus và cuộn tới field lỗi; chữ lớn không che CTA.
- [x] Có form trống/validation/pending/error/check-email, resend có phản hồi riêng.
- [x] Không yêu cầu chọn role, không tự đăng nhập sau đăng ký và không triển khai deep link xác thực.
- [x] Test biên/payload/callback xanh; Maestro dự kiến `e2e/flows/auth-ui-register.yaml`.

## Đồng bộ checklist (2026-10-22)

Đối chiếu bằng chứng đã ghi, không chạy lại test trong lượt đồng bộ này. Xem [bảng đối chiếu và giới hạn](../../PROGRESS/ACCEPTANCE_SYNC_2026-10-22.md) và [PROGRESS liên quan](../../PROGRESS/PHASE_01_AUTH_HOME_UI/PHASE_01_03_REGISTER.md). Trạng thái Done của phase giữ theo UAT owner đã có; checkbox chỉ phản ánh phạm vi kiểm chứng, không tự thay xác nhận owner.
