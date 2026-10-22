# Tiến độ Phase 01 — Auth và Homepage UI

Nhật ký cấp phase, chỉ ghi thêm theo [template](../_template/ENTRY.md).

Đây là khung nhật ký đi kèm [spec](../../IMPLEMENT/PHASE_01_AUTH_HOME_UI/README.md), chưa có kết quả triển khai,
kiểm thử hoặc UAT. Khi bàn giao cần ghi rõ nguồn Claude Auth, Student Home bản 2, môi trường preview/fixture,
ảnh đối chiếu, kết quả kiểm thử và phần tích hợp backend chưa kiểm tra. Không coi việc tạo spec là hoàn tất UI.

### 2026-10-17 15:01 (+07:00) · @LogKoNger
- Phase: 1 Ghi nhận ADR-0018 Accepted và điều kiện bắt đầu
- Trạng thái: Blocked
- Đã làm: AI ghi nhận owner duyệt trực tiếp “Duyệt ADR 18”; chuyển ADR-0018 sang Accepted, cập nhật index ADR, ngoại lệ trong ARCHITECTURE, phụ thuộc Phase 1 và roadmap. Xác minh GitHub handle bằng connector GitHub get_user_login do gh CLI không có trong PATH; kết quả LogKoNger, không suy đoán từ tác giả nhật ký cũ. Lập bản đồ section/component/dữ liệu/CTA trong references/SECTION_MAP.md. Giữ nguyên Foundation Blocked và UAT chưa đạt.
- Test: Chỉ sửa tài liệu, không chạy Jest/build/E2E. Đã kiểm tra diff không có lỗi whitespace. Auth artifact mở được; downloadMedia cho ảnh mascot trả lỗi blob trong embedded frame. Không có kết quả kiểm thử UI hoặc cookie/backend mới.
- PR / commit: Chưa tạo.
- Ghi chú: Đã gỡ yêu cầu duyệt ADR, còn chặn tại task 1.1.1 do chưa có file mascot gốc/export từ Claude. Không cắt screenshot hoặc tạo ảnh thay thế; chưa chuyển sang 1.1.2 theo thứ tự task của repo. Cần owner cung cấp ảnh mascot gốc, kèm ảnh học viên nếu có trong export. Không thay đổi production code hoặc tự xác nhận UAT.

### 2026-10-17 15:04 (+07:00) · @LogKoNger
- Phase: 1 Gỡ chặn task 1.1.1
- Trạng thái: In progress
- Đã làm: AI lấy được asset gốc (mascot laptop/bản đồ/sách, ảnh học viên) từ bundle manifest của artifact Auth/Home, lưu ở references/assets/. Chuyển phase và sub-phase 1.1 sang In progress, cập nhật roadmap.
- Test: Chỉ sửa tài liệu và thêm ảnh tham chiếu, không chạy Jest/build/E2E.
- PR / commit: Chưa tạo.
- Ghi chú: Chi tiết ở PHASE_01_01_DESIGN_FOUNDATION.md. Chưa thay đổi production code, không tự xác nhận UAT.

### 2026-10-17 15:46 (+07:00) · @LogKoNger
- Phase: 1 Dọn dẹp, Kiểm tra và bàn giao UAT
- Trạng thái: In review
- Đã làm: AI triển khai UI native Welcome/Login/Register/Check email và Student Home2a theo ADR-0018, cập nhật navigation, i18n hai ngôn ngữ, component nền tảng, preview chỉ development và Maestro flows. Dùng mascot gốc đã bổ sung vào workspace; source/hash ở references và src/assets/illustrations/README.md. Giữ thay đổi Phase0/user đã có trước; dọn các log thử do task tạo, không xoá module mẫu ngoài phạm vi. Không tự tạo phiên, API hoặc dữ liệu người dùng production.
- Test: Jest20 suite/97 test; ESLint, Prettier, TypeScript xanh. Android main5/5; chữ lớn/Reduce Motion1/1; Login visual1/1, Home visual1/1 sau điều chỉnh hiển thị. Kiểm tra149 translation keys khớp vi/en. git diff --check không lỗi.
- PR / commit: Chưa tạo.
- Ghi chú: Chỉ tự đánh giá UI; chưa có owner UAT và không đánh dấu Done. Foundation vẫn Blocked cho auth integration/Origin thật. Chưa test iOS/release binary/TalkBack thủ công. Ảnh học viên chưa dùng, course/mentor/project dùng placeholder; không phát hành cam kết marketing hoặc liên kết giả.

## Bàn giao UI Phase 1

- [Cách mở preview, fixture và giới hạn](PREVIEW.md).
- [Jest97 test](evidence/2026-10-17-jest.json), [output Jest](evidence/2026-10-17-jest.txt).
- [ESLint](evidence/2026-10-17-eslint.txt), [format](evidence/2026-10-17-format.txt), [TypeScript](evidence/2026-10-17-typescript.txt).
- [Maestro main5/5](evidence/2026-10-17-maestro.xml), [output](evidence/2026-10-17-maestro.txt).
- [Chữ lớn/Reduce Motion1/1](evidence/2026-10-17-accessibility.xml).
- [Login sau sửa label](evidence/2026-10-17-login-visual.xml), [Home sau sửa fallback/placeholder](evidence/2026-10-17-home-visual.xml).
- Ảnh: [Welcome](evidence/phase1-welcome.png), [Login](evidence/phase1-login.png), [Register](evidence/phase1-register.png), [Check email](evidence/phase1-check-email.png), [Home hero](evidence/phase1-home-hero.png), [course grid](evidence/phase1-home-courses.png), [loading](evidence/phase1-home-loading.png), [empty](evidence/phase1-home-empty.png), [error](evidence/phase1-home-error.png), [about](evidence/phase1-home-about.png), [chữ lớn Register](evidence/phase1-register-large-text.png), [chữ lớn Home](evidence/phase1-home-large-text.png).
- Môi trường: Windows; Pixel_8_2/API37,1080×2400,density420, font1.0; kiểm tra thêmfont1.3/motion0 và đã khôi phục. APK debug Foundation đã cài, JS/asset từ Metro; không đổi native config nên không build native lại.
- Review: đã có reviewer độc lập, không thấy Critical; hai findings focus/a11y đã sửa. Các chỉnh UI sau đó được kiểm tra bằng test và native; không có lượt review thứ hai.
- Chờ owner thực hiện [1.99 User Acceptance](../../IMPLEMENT/PHASE_01_AUTH_HOME_UI/PHASE_01_99_User_Acceptance.md). Chưa có kết quả UAT; phase In review.

### 2026-10-17 15:56 (+07:00) · @LogKoNger
- Phase: 1 Khắc phục lỗi chạy Android theo phản hồi owner
- Trạng thái: In review
- Đã làm: Tái hiện `npm run android` lỗi `com.facebook.react.settings > 25.0.3`. Process không có JAVA_HOME và dùng Java 25 từ PATH; JAVA_HOME cấp User đã trỏ tới JDK 21 của Android Studio nhưng chưa được process nhận. Đặt JAVA_HOME cho terminal chạy build, bổ sung cách áp dụng trong PREVIEW.md; không đổi package.json hoặc cấu hình native.
- Test: Với JDK 21, qua bước biên dịch nhưng installDebug báo INSTALL_FAILED_INSUFFICIENT_STORAGE. Dọn cache và APK tạm chưa đủ; gỡ riêng com.mindymobile bằng `pm uninstall -k` để giữ dữ liệu/cache, sau đó chạy lại đúng `npm run android`: exit 0, BUILD SUCCESSFUL trong 45s, Installed on 1 device, khởi chạy MainActivity trên emulator-5554. Dọn APK tạm sau kiểm tra. Không chạy lại Jest vì không đổi mã ứng dụng.
- PR / commit: Chưa tạo.
- Ghi chú: [Lỗi Java ban đầu](evidence/2026-10-17-android-java25.txt), [lỗi thiếu dung lượng](evidence/2026-10-17-android-storage.txt), [build/cài/chạy thành công](evidence/2026-10-17-android-build.txt). Kết quả bổ sung build native debug cho bàn giao trước đó; chưa test release/iOS và chưa có owner UAT.

### 2026-10-17 16:01 (+07:00) · @LogKoNger
- Phase: 1 Cấu hình chạy Android cho các lần sau
- Trạng thái: In review
- Đã làm: Lưu `org.gradle.java.home=C:/Program Files/Android/Android Studio/jbr` trong `C:/Users/admin/.gradle/gradle.properties` (file trước đó chưa tồn tại). Đây là mặc định Gradle cục bộ cho tài khoản Windows, áp dụng cả các dự án khác; không sửa cấu hình build trong repo. Bổ sung hướng dẫn `npm run android -- --active-arch-only` cho máy ảo ít dung lượng.
- Test: Chạy lệnh gốc trong process không có JAVA_HOME: lỗi Java không còn nhưng cập nhật APK vẫn thiếu dung lượng. Chạy active-arch-only liên tiếp hai lần, không đặt JAVA_HOME: exit 0 cả hai, BUILD SUCCESSFUL 22s/17s, cài và mở app thành công. APK giảm từ 178105673 xuống 57645594 byte. Máy ảo còn khoảng 883 MB trống. Không chạy Jest vì chỉ thay môi trường máy và tài liệu.
- PR / commit: Chưa tạo.
- Ghi chú: [Kiểm tra JDK cố định](evidence/2026-10-17-android-persistent-jdk.txt), [build theo thiết bị](evidence/2026-10-17-android-active-arch.txt), [chạy lại không gỡ app](evidence/2026-10-17-android-active-arch-repeat.txt). Lệnh gốc vẫn build đủ bốn kiến trúc; hướng dẫn dùng active-arch-only khi phát triển trên máy ảo hiện tại. Không cố định x86_64 cho release, không tự gỡ app hoặc xoá dữ liệu mỗi lần chạy.

### 2026-10-17 16:17 (+07:00) · @Bero
- Phase: 1 Đổi trạng thái — triển khai lại theo bàn giao Claude Design
- Trạng thái: In progress
- Đã làm: Owner yêu cầu “triển khai lại phase 1 theo Claude”. Claude Code (vai trò ADR-0019) đọc lại hai artifact bằng Artifact `read` (version không đổi), giải mã template thiết kế, lưu bản trích ở `IMPLEMENT/PHASE_01_AUTH_HOME_UI/references/source/`. Đối chiếu với ảnh bằng chứng bản 15:46 thấy lệch nhiều điểm (A1–A9 Auth, R1–R4 Register, H1–H13 Home). Bổ sung mục “Đặc tả UI từ Claude Design” với thông số chính xác, ánh xạ token, quy đổi safe area, motion, trạng thái và tiêu chí đối chiếu vào 1.1–1.4. Đưa phase về In progress; 1.1 In progress, 1.2–1.5 và 1.99 Todo chờ Codex sửa UI.
- Test: Chỉ sửa tài liệu và thêm bản trích nguồn; không chạy Jest/build/E2E. Không đổi production code.
- PR / commit: Chưa tạo.
- Ghi chú: Quyết định mở cho owner (có mặc định, không chặn): D1 CORE §5 đổi forest/muted trong home-content thành đen, xung đột màu forest của Home 2a — mặc định theo CORE; D2 sáu màu thiết kế không có token — quy đổi gần nhất, muốn đúng cần ADR thêm token; D3 ảnh học viên người thật chưa dùng; D4 copy cam kết (20 học viên, 24 giờ, 4 tuần, hotline/email) chỉ ở preview. Sai khác có chủ đích: giá theo BUSINESS_RULES §7 (`₫`), không tự chạy carousel, font 900/nghiêng/mono quy đổi. Bằng chứng bản 15:46 giữ nguyên để so sánh, không còn là bằng chứng khớp thiết kế. Login chưa có ảnh tham chiếu; markup là căn cứ.

### 2026-10-17 20:34 (+07:00) · @Bero
- Phase: 1 Ghi nhận quyết định owner D1–D4 và token màu
- Trạng thái: In progress
- Đã làm: Owner chốt trong chat: D1 dùng xanh đậm như thiết kế; D2 sửa global.css thêm token; D3 để trống, dựng khung dễ thay ảnh; D4 duyệt. Claude Code viết ADR-0020 (Accepted theo chỉ đạo owner), thêm 14 token `forest-deep`, `forest-night`, `teal`, `aqua`, `cream`, `tape`, `cover-{a..d}`, `cover-{a..d}-soft` vào `global.css`, `tailwind.config.js`, `src/theme/colors.ts`; cập nhật ARCHITECTURE (ngoại lệ ADR-0020), CORE §5/§5b, danh mục ADR. Sửa đặc tả 1.1 (bảng màu dùng token mới, bảng quyết định đã chốt) và 1.4 (không bọc `regionVars.home`, màu terminal/ghi chú/nền chờ ảnh, khung ảnh slide qua `HOME_INTRO_IMAGES`, copy cam kết và dòng liên hệ footer hiển thị).
- Test: `npx jest src/theme` 3 suite / 6 test đạt (gồm `colors.test.ts` đồng bộ colors.ts ↔ global.css); ESLint và Prettier sạch trên colors.ts/tailwind.config.js/global.css; `npm run lint:type-check` đạt. Chưa chạy toàn bộ Jest/E2E vì chưa đổi UI.
- PR / commit: Chưa tạo.
- Ghi chú: Mã `cover-*` quy đổi từ oklch của thiết kế (±1). Token mới chưa được component nào dùng; Codex áp dụng khi sửa UI. Đổi token cần build lại Metro cache (`npm start -- --reset-cache`). Số `1900 0000` có dạng số mẫu nên chỉ hiện chữ, không gắn `tel:` tới khi owner xác nhận. Cột “Hỗ trợ” footer vẫn ẩn vì chưa có URL (D4 không bao gồm link).

### 2026-10-17 21:08 (+07:00) · @LogKoNger
- Phase: 1 Dọn dẹp, Kiểm tra và bàn giao lại theo Claude Design
- Trạng thái: In review
- Đã làm: AI hoàn tất UI Welcome/Login/Register/Check email và Student Home2a theo bàn giao, áp dụng D1–D4/ADR-0020. Sửa lỗi review callback My classes và hit bounds; chuẩn hoá kích thước dp để tránh rem14 của NativeWind; xác nhận target+44dp/Home78dp bằng hierarchy native. Preview thu gọn không đẩy layout. Sửa mascot che chữ ở320dp bằng kích thước128dp và giới hạn khối chữ ở màn<360dp; Pixel8 giữ196dp. Dọn file log thử do lượt này tạo; giữ thay đổi có sẵn ngoài phase.
- Test: Jest20 suite/102 test đạt; lint:rules, lint:code-format, lint:type-check đạt. Maestro main: api-health/app-launch/Login/Register đạt ở lượt2026-10-17_205658; Home đạt sau sửa flow retry ở lượt210136 (1/1). Chữ lớn1.3×/Reduce Motion1/1, visual sections1/1 và compact320dp1/1 đạt. Hệ thống máy ảo đã khôi phục1080×2400, font1.0, animator_duration_scale=null.
- PR / commit: Chưa tạo; branch codex/phase-01-design-handoff, giữ thay đổi chưa commit để owner xem.
- Ghi chú: Lượt main cuối có4/5 do flow Home tìm thẻ bằng cuộn xuống sau retry khi vị trí đã ở dưới; sửa flow cuộn về đầu, chạy riêng Home đạt. Không coi báo cáo4/5 là5/5; năm luồng được xác nhận qua hai báo cáo. Không tích hợp backend/cookie, không có iOS/release/TalkBack thủ công. Owner UAT chưa thực hiện; Phase0 vẫn Blocked. Sai khác nhỏ: icon, khoảng chấm, outline ExtraBold và top bar tức thì ở báo cáo review. Không tự đánh dấu Done.

## Bàn giao sau chỉnh thiết kế (lượt 21:07)

- [Cách mở preview](PREVIEW.md): Welcome → Xem thử UI → Auth hoặc Home; nút nổi **UI** mở/thu gọn trạng thái.
- [Jest102](evidence/2026-10-17-handoff-jest.json), [output](evidence/2026-10-17-handoff-jest.txt), [ESLint](evidence/2026-10-17-handoff-eslint.txt), [format](evidence/2026-10-17-handoff-format.txt), [TypeScript](evidence/2026-10-17-handoff-typescript.txt).
- Android: [main4/5](evidence/2026-10-17-handoff-maestro.xml) + [Home chạy lại1/1](evidence/2026-10-17-handoff-home.xml); [chữ lớn/Reduce Motion1/1](evidence/2026-10-17-handoff-accessibility.xml); [visual sections1/1](evidence/2026-10-17-handoff-visual.xml); [compact320dp1/1](evidence/2026-10-17-handoff-compact.xml).
- [Review và sai khác còn lại](evidence/2026-10-17-handoff-review.md); [đo vùng chạm native](evidence/2026-10-17-handoff-target-bounds.json). Target compiler xấp xỉ44dp (sai số làm tròn1px).
- Ảnh mới: [Welcome](evidence/handoff-welcome.png), [Login](evidence/handoff-login.png), [Register](evidence/handoff-register.png), [Check email](evidence/handoff-check-email.png), [Home hero](evidence/handoff-home-hero.png), [courses](evidence/handoff-home-courses.png), [intro](evidence/handoff-home-intro.png), [compiler](evidence/handoff-home-compiler.png), [notes](evidence/handoff-home-note.png), [footer](evidence/handoff-home-footer.png).
- Trạng thái: [loading](evidence/handoff-home-loading.png), [empty](evidence/handoff-home-empty.png), [error](evidence/handoff-home-error.png), [font lớn](evidence/handoff-home-large-text.png), [Home320dp sau sửa](evidence/handoff-compact-home.png).
- Ảnh nguồn ở IMPLEMENT/references; so sánh theo dp, màn Pixel8 rộng~411dp so với thiết kế390dp. Font900→ExtraBold; chữ nghiêng/monospace dùng khả năng nền tảng; Android shadow xấp xỉ. Ảnh slide trống theo D3, map/book hơi mờ do nguồn nhỏ. Course/date/name trong preview là fixture cố định, có nội dung dài để kiểm tra xuống dòng.
- [Owner UAT1.99](../../IMPLEMENT/PHASE_01_AUTH_HOME_UI/PHASE_01_99_User_Acceptance.md) là bước tiếp theo. Kiểm tra UI không xác nhận backend auth.

### 2026-10-17 21:23 (+07:00) · @LogKoNger
- Phase: 1 Áp dụng ADR-0021 — luồng đầy đủ trong từng phase
- Trạng thái: In review
- Đã làm: Ghi nhận owner chỉ đạo “thiết kế UI → xác nhận (tôi) → gắn API → nghiệm thu UAT” và làm rõ áp dụng theo từng phase. Tạo ADR-0021 Accepted theo chỉ đạo trực tiếp; đồng bộ quy trình, tài liệu đóng góp, CLAUDE.md và template phase/sub-phase. Thêm bảng bốn mốc cho Phase1. Phase chờ owner xác nhận UI; API Todo; bước1.99 về Todo, chưa bắt đầu UAT cuối phase. Các nhận định “chờ UAT” trong entry trước được hiểu là bàn giao UI; mốc hiện tại theo ADR mới là chờ xác nhận UI.
- Test: Chỉ thay đổi tài liệu; kiểm tra liên kết Markdown và tính nhất quán các mốc. Không chạy Jest/build/E2E.
- PR / commit: Chưa tạo.
- Ghi chú: Duyệt ADR và phản hồi chỉnh UI không phải xác nhận UI đã đạt. Chưa gọi/gắn API mới, chưa xác nhận UAT, không chuyển phase Done hoặc gỡ blocker Foundation. Sau khi owner xác nhận UI, phải đặc tả task API trong cùng Phase1 trước khi triển khai.

### 2026-10-17 21:34 (+07:00) · @LogKoNger
- Phase: 1 Owner xác nhận UI và chuẩn bị tích hợp API
- Trạng thái: Blocked
- Đã làm: Ghi nhận xác nhận trực tiếp của owner “UI phase 1 đã được approve” trong chat ngày2026-10-17. Chuyển mốc UI và xác nhận UI sang Done; các phần UI1.1–1.5 Done theo phạm vi đã duyệt. Không yêu cầu duyệt UI lại. Tạo kế hoạch1.6 trong chính Phase1 cho Auth/phiên và dữ liệu Home, kèm task TDD, file, contract, test/điều kiện UAT. Chuẩn bị ADR-0022 Proposed để mở rộng ngoại lệ Foundation/API và quyền navigator giới hạn nếu cần; thêm mô tả Proposed trong ARCHITECTURE, không mở khoá thực tế.
- Test: Chỉ đọc source/contract và sửa tài liệu; kiểm tra liên kết, trạng thái và diff. Không chạy Jest/build/E2E hoặc mutation backend.
- PR / commit: Chưa tạo.
- Ghi chú: B.3 yêu cầu Foundation nghiệm thu trước phase màn hình; ADR-0018 chỉ cho ngoại lệ UI, mục5 giữ auth integration riêng; Phase0 còn Blocked. ADR-0021 không tự gỡ Foundation. Vì vậy mốc API1.6 Blocked chờ owner duyệt ADR-0022, còn UAT1.99 Todo; Phase1 chưa Done. UI approval không phải UAT hoặc chấp nhận ngoại lệ hạ tầng mới. Bằng chứng approval là thông điệp owner ở chat này, không suy ra từ im lặng hay các yêu cầu chỉnh UI trước đó.

### 2026-10-17 22:12 (+07:00) · @LogKoNger
- Phase: 1 Owner duyệt ADR-0022 và tích hợp API
- Trạng thái: Blocked ở xác minh API cuối; UI đã duyệt, UAT1.99 Todo
- Đã làm: Ghi nhận chỉ đạo “Duyệt ADR-0022”; chuyển ADR Accepted và cập nhật ngoại lệ navigator trong ARCHITECTURE. Đã nối Auth/session/guard/reset stack và Catalog/lịch vào Home production; không dùng fixture hoặc lưu token/password. Task1.6.1–1.6.3 complete, code1.6.4 complete. Chi tiết và giới hạn tại [nhật ký API](PHASE_01_06_API_INTEGRATION.md).
- Test: Lint/format/TypeScript PASS; Jest132/132,26 suite. Android UI4/4; API thật1/1 (login Student, cookie/auth-me sau mở lại app, dữ liệu khoá học/buổi tới thật, logout/Back/guest). Bằng chứng tại nhật ký API và evidence/2026-10-17-api-*.
- PR / commit: Chưa tạo.
- Ghi chú: Chưa kiểm tra native refresh khi hết hạn/thất bại, staff bằng credential thật, gửi register/resend email thật. Không coi MSW là native hoặc tự gửi email/tạo user để lấy bằng chứng. Giữ1.6 Blocked ở xác minh cuối và1.99 Todo theo kế hoạch; không đóng Foundation hoặc tự xác nhận owner UAT.

### 2026-10-17 22:42 (+07:00) · @LogKoNger
- Phase: 1 Nghiệm thu UAT của owner
- Trạng thái: Done
- Đã làm: Codex ghi nhận xác nhận trực tiếp của owner trong chat: “Nghiệm thu UAT phase được approve”, sau đó xác định phạm vi “phase 1”. Chuyển Phase 1, mốc tích hợp API 1.6 và User Acceptance 1.99 sang Done; cập nhật roadmap, README phase và tài liệu UAT. Đây là xác nhận nghiệm thu của owner, không phải AI tự xác nhận UAT.
- Test: Chỉ cập nhật tài liệu theo xác nhận của owner; không chạy lại Jest/build/Maestro hoặc thao tác backend. Bằng chứng trước đó: Jest 132/132, lint/format/TypeScript PASS, Android UI 4/4 và API thật 1/1 theo entry 22:12. Không có mô tả từng bước hoặc môi trường UAT mới từ owner.
- PR / commit: Chưa tạo.
- Ghi chú: Xác minh GitHub handle qua connector GitHub get_user_login: LogKoNger. Giữ nguyên giới hạn bằng chứng đã ghi: native refresh khi access/refresh hết hạn hoặc bị thu hồi, staff login thật, register/resend email thật, iOS/release/TalkBack thủ công chưa có kết quả mới. Owner duyệt UAT tổng thể Phase 1; không suy ra các ca chưa chạy đã PASS hoặc Foundation đã nghiệm thu. Phase 0 giữ Blocked và UAT riêng. Các entry lịch sử được giữ nguyên.

### 2026-10-20 14:58 (+07:00) · @LogKoNger
- Phase: 1 Bổ sung xác nhận UAT và đổi thông báo tài khoản staff
- Trạng thái: Done — giữ xác nhận UAT tổng thể trước đó; thay đổi thông báo đã triển khai theo yêu cầu owner.
- Đã làm: Owner xác nhận trong chat “Phiên đăng nhập và refresh tôi xác nhận done”, “Đăng kí/gửi lại email tôi đã test thành công”, “talkback ok”. Ghi nhận các phần này đạt theo owner, không suy diễn thành lượt chạy mới của AI hoặc thêm chi tiết môi trường/ca thu hồi chưa được mô tả. Owner gửi ảnh màn tài khoản staff và yêu cầu đổi thông báo sang sai tài khoản/mật khẩu. Đổi chuỗi vi/en thành “Sai tài khoản hoặc mật khẩu.” / “Incorrect account or password.”; giữ nút Đăng xuất, chặn Home và lịch Student như hiện có. Đồng bộ đặc tả 1.6, hướng dẫn UAT và kiểm thử điều hướng.
- Test: Jest sessionNavigation 1 suite/2 test PASS; ESLint file test và Prettier ba file src thay đổi đạt. Lượt Jest có cảnh báo request me/cart chưa có mock và tiến trình chưa tự thoát sau khi báo PASS; dừng tiến trình sau kết quả. Chưa chạy lại Android/E2E hoặc kiểm thử iOS/release cho thay đổi thông báo.
- PR / commit: Chưa tạo.
- Ghi chú: Dùng handle đã được xác minh ở entry 2026-10-17 22:42; CLI gh không có trong môi trường hiện tại. Không sửa các entry lịch sử hoặc tự tích điều kiện Dọn dẹp/chuyển In review vốn chưa có bản ghi đầy đủ. Xác nhận hôm nay bổ sung kết quả owner cho phiên/refresh, email và TalkBack; không thay bằng chứng kỹ thuật cũ.

### 2026-10-20 15:01 (+07:00) · @LogKoNger
- Phase: 1.6 Đổi phản hồi login staff sang lỗi trong form
- Trạng thái: Done — triển khai yêu cầu chỉnh lỗi Login của owner.
- Đã làm: Owner gửi ảnh màn chặn và khối lỗi Login, yêu cầu hiển thị như ảnh lỗi. Thay đổi trước chỉ đổi copy chưa đáp ứng cách hiển thị mới. Cập nhật đặc tả và UAT: login ADMIN/MENTOR/MANAGER kết thúc phiên backend vừa được cấp, trả INVALID_CREDENTIALS cho khối FormFeedback của Login, giữ email/password và không nhận sessionUser staff; không đi sang màn riêng có nút Đăng xuất. Dùng copy lỗi sẵn có “Email hoặc mật khẩu không đúng.” và kiểu nền peach/chữ headsup. Không tạo requestId giả vì response login thành công không có mã hỗ trợ. Nếu logout backend lỗi, giữ xử lý lỗi tương ứng và không nhận phiên vào app. Màn fallback cho cookie staff có sẵn từ trước vẫn được giữ; thay đổi này áp dụng khi submit Login.
- Test: Ba ca hồi quy ADMIN/MENTOR/MANAGER chạy RED trước thay đổi (chưa có login-form-error), sau thay đổi GREEN. SessionNavigation và useAuthSession: 2 suite/12 test PASS; ESLint, Prettier các file code thay đổi và TypeScript PASS. Jest dùng forceExit do tiến trình mở đã ghi nhận trước; vẫn có cảnh báo me/cart chưa mock ở ca Student cũ. Không chạy native/E2E trong lượt này.
- PR / commit: Chưa tạo.
- Ghi chú: Giữ xác nhận UAT trước của owner, không tự xác nhận owner đã test phản hồi mới. Không sửa navigator, HTTP foundation hoặc các thay đổi Phase 3 đang có trong workspace.

### 2026-10-20 15:04 (+07:00) · @LogKoNger
- Phase: 1 Owner duyệt phản hồi lỗi Login cho Admin/Mentor/Manager
- Trạng thái: Done.
- Đã làm: Owner xác nhận trực tiếp “Được duyệt” sau bàn giao thay đổi login ADMIN/MENTOR/MANAGER ở lại form và hiển thị “Email hoặc mật khẩu không đúng.” trong khối lỗi, giữ dữ liệu nhập. Ghi nhận duyệt thay đổi này trong tài liệu UAT 1.99. Phase 1 và 1.99 tiếp tục Done theo xác nhận UAT đã có.
- Test: Chỉ ghi nhận approval, không chạy kiểm thử mới. Kết quả 12 test, lint/format/TypeScript ở entry 15:01 được giữ nguyên; không suy ra môi trường hoặc ca test mới từ xác nhận duyệt.
- PR / commit: Chưa tạo.
- Ghi chú: Approval áp dụng cho phản hồi Login vừa bàn giao; không thay kết quả kiểm tra hoặc bản ghi lịch sử khác.


### 2026-10-22 09:25 (+07:00) · @Bero-working (Codex)

- Phase: Đồng bộ hồ sơ nghiệm thu theo yêu cầu owner sau tổng kết test.
- Trạng thái: Done theo xác nhận UAT lịch sử; không phát sinh xác nhận UAT hoặc kết quả kiểm thử mới.
- Đã làm: Đối chiếu từng checklist với bằng chứng đã có, tick phần đủ căn cứ và ghi rõ phần chưa kiểm tra/đạt một phần; giữ giới hạn được owner chấp nhận. Các file đồng bộ: PHASE_01_01_DESIGN_FOUNDATION.md, PHASE_01_02_LOGIN.md, PHASE_01_03_REGISTER.md, PHASE_01_04_HOMEPAGE.md, PHASE_01_05_NAVIGATION.md, PHASE_01_06_API_INTEGRATION.md, PHASE_01_99_User_Acceptance.md, README.md.
- Test: Chỉ rà tài liệu/liên kết/diff. Kết quả CI Phase 4 là nguồn bổ sung có ngày/revision riêng, không thay kết quả các lượt cũ. Không chạy lại native/backend và không sửa mã nguồn.
- Đồng bộ: [Bảng đối chiếu](../ACCEPTANCE_SYNC_2026-10-22.md); trạng thái roadmap/README giữ theo owner đã duyệt. Quy trình B.7.1 và template được cập nhật để tự đồng bộ trong cùng lượt review về sau. Nhật ký cũ giữ nguyên.

### 2026-10-22 09:42 (+07:00) · @Bero
- Phase: 1 Dọn dẹp sau UAT
- Trạng thái: Done
- Đã làm: AI rà phạm vi main...HEAD, thu hẹp vào Auth/Home; bỏ HomeProps.preview/HomeCarousel.preview không sử dụng, đối số dư tại preview/test và 8 key Home cũ trong mỗi ngôn ngữ. Đồng bộ duy nhất nơi truyền homeProps.preview trong PhaseThreePreview để giữ type-check. Giữ thay đổi có sẵn của người dùng, hạ tầng, asset nguồn và nhật ký lịch sử. Chi tiết tại [báo cáo dọn dẹp](POST_UAT_CLEANUP.md).
- Test: Baseline toàn repo 63 suites/294 tests PASS; sau dọn mã, Home/điều hướng preview/i18n 3 suites/24 tests PASS. ESLint 0 lỗi/1 warning có sẵn ngoài Phase 1; Prettier/type-check PASS. Maestro Android đang chạy; chưa tổng kết bước Kiểm tra.
- Tiêu chí nghiệm thu: Dọn mã trong phạm vi đạt; bản dịch chỉ xoá đúng 8 key mỗi file, không đổi key còn lại; guard release/preview được Jest kiểm tra lại. Giữ giới hạn Reduce Motion native và điều kiện In review lịch sử trước UAT chưa đủ hồ sơ.
- Đồng bộ: IMPLEMENT Phase 1 README, 1.5, 1.99 và roadmap giữ Done theo xác nhận owner trước đó; bổ sung báo cáo hiện tại, không tự tick các vế chưa kiểm tra hoặc nghiệm thu lại thay owner.
- PR / commit: Chưa tạo; nền 67cdc9e và working tree hiện tại.
- Ghi chú: Handle @Bero do owner cung cấp trực tiếp trong chat vì máy không có gh. Cảnh báo act/MSW của các test đã có được ghi trong báo cáo; không tắt cảnh báo để làm sạch output. Bằng chứng Android được bổ sung sau khi lượt chạy kết thúc.

### 2026-10-22 09:58 (+07:00) · @Bero
- Phase: 1 Kiểm tra bổ sung sau dọn dẹp
- Trạng thái: In review — bước kiểm tra mới chưa đạt đầy đủ; Phase 1 và UAT lịch sử giữ Done.
- Đã làm: AI hoàn tất kiểm tra trên bản sau dọn mã và ghi [báo cáo](POST_UAT_CLEANUP.md), lưu JUnit/Jest summary kèm SHA-256 mã nguồn và ảnh tại evidence/cleanup-2026-10-22. Không sửa code runtime, test flow hay timeout sau khi có lỗi Android.
- Test: Lint toàn repo 0 lỗi/1 warning có sẵn; Prettier/type-check PASS. Jest toàn repo sau dọn mã 63 suites/294 tests PASS, tự thoát, không forceExit. Android Pixel_8/API37/Maestro2.11.0: lượt đầu 2/5 PASS (Login/Register); chạy lại đúng 3 ca chưa đạt, 0/3 PASS. app-launch còn splash khi hết thời gian; Home đã qua các trạng thái/retry/course sheet nhưng không cuộn tới dot-2; carousel lần chạy lại dừng trước preview ở bước chờ Welcome. Giữ kết quả thất bại, không coi ảnh từng bước là toàn flow PASS.
- Tiêu chí nghiệm thu: Dọn mã đạt; chất lượng tổng hợp đạt một phần do E2E Android chưa xanh đầy đủ. Chưa kiểm tra iOS/release hoặc Reduce Motion native; không gửi email, đăng nhập thật hay thanh toán. Chưa đủ bằng chứng quy lỗi Android cho thay đổi dọn mã; cần xác minh môi trường khởi động/phiên và thao tác cuộn trước khi đóng bước Kiểm tra bổ sung.
- Đồng bộ: README IMPLEMENT Phase 1 bỏ tick tiêu chí chất lượng ghép, còn 7/9; 1.5/1.99 và roadmap dẫn tới báo cáo hiện tại, trạng thái UAT giữ theo owner. ACCEPTANCE_SYNC có phần bổ sung sau dọn dẹp, không sửa số liệu lịch sử. Điều kiện Dọn dẹp/chuyển In review trước UAT 2026-10-17 và accessibility ghép vẫn chưa đủ hồ sơ để tick.
- PR / commit: Chưa tạo; nền 67cdc9e và working tree hiện tại.
- Ghi chú: Handle do owner cung cấp trong chat. Raw log chỉ lưu TEMP, không commit. Tiến trình Metro/emulator do AI mở cho lượt này được dừng sau kiểm tra. Các thay đổi có sẵn của người dùng và entry lịch sử giữ nguyên.
