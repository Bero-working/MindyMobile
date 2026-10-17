# 1.6 Tích hợp API trong Phase 1

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Nối API Auth và dữ liệu Student Home vào UI Phase 1 đã được owner duyệt, chuẩn bị UAT cuối phase.

**Architecture:** Service parse DTO bằng Zod qua `apiInstances.service`; hook React Query/controller nối callback và
data region hiện có. Phiên dùng cookie HttpOnly/refresh single-flight Foundation; guard lấy user/role đã xác minh,
reset stack khi mất phiên. Giữ nguyên thiết kế và preview chỉ development.

**Tech Stack:** React Native, TypeScript strict, Zod, TanStack Query, Zustand, Axios Foundation, Jest/MSW, Maestro; không thêm package.

**Spec:** [README Phase 1](README.md), [Auth contract](../../API_CONTRACT/auth.md),
[Catalog](../../API_CONTRACT/catalog.md), [My Classes/Lịch](../../API_CONTRACT/my-classes.md),
[quy ước API](../../API_CONTRACT/README.md), [ADR-0021](../../adr/ADR-0021-per-phase-ui-approval-api-uat.md).

## Trạng thái và điều kiện bắt đầu

- UI được owner xác nhận trực tiếp: “UI phase 1 đã được approve”, ngày 2026-10-17; ghi trong PROGRESS cấp phase.
- Trạng thái bước API: **Blocked ở xác minh cuối** — code tích hợp và các kiểm tra đã chạy đạt; còn ca refresh khi hết hạn native và phạm vi email test cho register/resend thật. ADR-0022 đã Accepted, không còn chờ duyệt ADR.
- Khi ADR được Accepted, cập nhật ARCHITECTURE trước/cùng thay đổi navigator thuộc ngoại lệ; giữ Foundation/UAT chưa đạt.
- Đối chiếu Swagger/source của môi trường trước khi bật route. Thiếu route/tài khoản/dữ liệu phải ghi chặn thực tế,
  không suy ra triển khai production từ nhãn IMPL trong tài liệu.

## Global Constraints

- Không đổi UI đã duyệt ngoài trạng thái/phản hồi cần cho API; thay đổi ảnh hưởng thiết kế phải xin owner xác nhận lại.
- Response là DTO trực tiếp, không wrapper `data`; list dùng `items/page/pageSize/total`.
- Cookie HttpOnly, không Bearer, không lưu token/password; không tự retry mutation timeout.
- Không có `any`, `unknown`, `@ts-ignore` hoặc dependency mới. Dữ liệu ngoài parse Zod tại ranh giới service.
- Không gọi API PLANNED; không Google/deep link/quên mật khẩu/thanh toán hoặc thêm route rỗng.
- Task làm tuần tự Red → Green → Refactor; ghi PROGRESS sau từng task. Mọi `Expected` phải được đối chiếu với output thật.

## Review Focus

- Bootstrap chưa hoàn tất: không chớp Home/dữ liệu người dùng cũ, không lặp request vô hạn.
- Refresh thất bại hoặc đổi user: clear cache và reset stack, Back không trở lại dữ liệu cũ; phản hồi cũ không khôi phục phiên.
- Staff đăng nhập: không vào Home hoặc gọi `me/schedule` Student.
- Lịch phân trang/hủy buổi/đang diễn ra: không chọn nhầm “buổi tiếp theo” hoặc lấy thời gian thiết bị thay `asOf`/`timeZone`.
- Mutation mất response: giữ dữ liệu/lỗi có thể thử lại chủ động; không gửi lặp register/resend/login tự động.

## Ánh xạ contract

| UI / luồng | API | Giới hạn |
| --- | --- | --- |
| Login | POST `auth/login` | email/password/deviceName?; password 1–128, giữ khoảng trắng |
| Register | POST `auth/register` | displayName/email/password/phone?; 202 trung lập, không có session |
| Resend | POST `auth/email/resend` | 202 trung lập; pending/error riêng |
| Bootstrap | GET `auth/me` | UserDto, không phải AuthenticatedUserDto; 401 chưa đăng nhập |
| Refresh | POST `auth/refresh` | Dùng interceptor Foundation một lần, không viết cơ chế khác |
| Logout | POST `auth/logout` | 204; clear private cache/polling và user trong bộ nhớ |
| Grid Home | GET `courses?page=1&pageSize=4` | Catalog hiện có, không gọi API “featured” hoặc tự tạo rank |
| Meta khoá học | GET `courses/:id/classes` | Chỉ lớp OPEN; thiếu dữ liệu thì ẩn meta; không tạo field lịch trong CourseDto |
| Buổi học tới | GET `me/schedule` | range có offset ≤31 ngày, đủ trang, `includeCancelled=false`; lấy `timeZone/asOf` từ response |

Lịch chỉ chọn `SCHEDULED`, không lớp CANCELLED, `startsAt >= asOf`; sort startsAt/sessionId và lấy sớm nhất.
Home hiển thị classCode và sessionTitle; giữ FULL/CASH_PREVIEW khi truyền action. Không gọi detail/meeting URL
khi chưa có màn đích được triển khai. Không có buổi trong range thì UI rỗng đúng phạm vi, không tự tạo buổi mẫu.
Chọn thời gian range 7 ngày kể từ thời điểm request (ISO có offset), không suy ra “hôm nay” từ UTC thay timezone response.

## Task 1.6.1 — Service Auth và schema DTO

**Files:** tạo `src/modules/auth/services/auth.service.ts`, `schemas/authResponse.schema.ts`,
`services/auth.service.test.ts`; mở rộng `types/auth.type.ts` nếu cần, không phá payload UI đã có.

**Produces:** `authService.login(values): Promise<AuthResult>`, `register(payload): Promise<void>`,
`resend(email): Promise<void>`, `me(): Promise<AuthResult['user']>`, `logout(): Promise<void>`.

- [x] Viết MSW test login DTO và body whitelist; register/resend 202 không set user; me parse UserDto; logout 204;
  lỗi 401/422/429/503 giữ code/requestId; DTO sai bị từ chối, không gửi credential vào log.
- [x] Chạy `npx jest src/modules/auth/services/auth.service.test.ts --runInBand`.
  Expected: RED do service/schema chưa tồn tại, không phải lỗi setup MSW.
- [x] Triển khai schema/service tối thiểu qua HTTP Foundation; không sửa `src/config/**`.
- [x] Chạy lại cùng lệnh. Expected: PASS; ghi PROGRESS và các giới hạn native-cookie chưa kiểm tra.

## Task 1.6.2 — Phiên, bootstrap và nối form thật

**Files:** tạo `src/modules/auth/hooks/useAuthSession.ts`, `useAuthSession.test.tsx`;
sửa `src/modules/auth/AuthRoutes.tsx`, `src/state/slices/authSlice.ts`, test `src/modules/auth/navigation.test.tsx`.
`src/navigation/index.tsx` chỉ sửa khi cần theo ADR-0022 Accepted, kèm ARCHITECTURE.

**Consumes:** service 1.6.1. **Produces:** user/role từ backend, bootstrap/pending/error, callback Login/Register/Resend thật,
reset khi hết phiên; HTTP Foundation tiếp tục gọi logout state hiện có.

- [x] Viết test me thành công/401/network, không flash dữ liệu cũ; login Student/staff, reset stack và Back;
  register/resend không tạo phiên; refresh thất bại clear cache và về Login; response cũ sau logout không set lại user.
- [x] Chạy `npx jest src/modules/auth --runInBand`. Expected: test tích hợp mới RED; UI regression cũ vẫn có căn cứ.
- [x] Nối adapter thật qua hooks/controller; phản hồi hết phiên từ store phải tới Login. Không lưu credential vào route params.
  Staff dùng trạng thái đích chưa hỗ trợ trong luồng Auth, không tự dựng dashboard hoặc vào Student Home.
- [x] Chạy lại `npx jest src/modules/auth --runInBand`. Expected: PASS; ghi PROGRESS.

## Task 1.6.3 — Service/query dữ liệu Home

**Files:** tạo `src/modules/home/services/home.service.ts`, `schemas/homeResponse.schema.ts`,
`services/home.service.test.ts`, `hooks/useHomeQuery.ts`, `hooks/useHomeQuery.test.tsx`;
sửa `src/modules/home/types/home.type.ts` nếu cần.

**Consumes:** user/role đã xác minh của 1.6.2. **Produces:** courses và schedule DataRegion hiện có,
timezone/asOf thật; query key có user id cho dữ liệu riêng; chỉ query lịch cho Student đã đăng nhập.

- [x] Viết MSW test nullable cover/price0, không quá4 course; meta từ lớp OPEN, lỗi meta không xoá course;
  lịch nhiều trang, canceled/past/đang diễn ra không chọn làm buổi kế tiếp, tie sort sessionId; offset/range ≤31 ngày;
  malformed DTO và timezone, lỗi từng vùng độc lập; staff không query lịch và cache không lẫn hai user.
- [x] Chạy `npx jest src/modules/home/services src/modules/home/hooks --runInBand`.
  Expected: test mới RED vì service/query chưa có.
- [x] Triển khai parse/schema/query và adapter sang DTO UI; giữ empty/error/loading và không fake API “featured”.
- [x] Chạy lại cùng lệnh. Expected: PASS; ghi PROGRESS, phạm vi range7 ngày và dữ liệu chưa có.

## Task 1.6.4 — Ghép Home production và kiểm tra toàn luồng

**Files:** sửa `src/modules/auth/AuthRoutes.tsx`, thêm controller production Home nếu cần;
mở rộng test Auth/Home; thêm `e2e/api/auth-api.yaml` khi có tài khoản test phù hợp (ngoài bộ fixture mặc định);
cập nhật `PHASE_01_99_User_Acceptance.md`, PROGRESS và bằng chứng Foundation liên quan.

**Consumes:** 1.6.2/1.6.3. **Produces:** Home production chỉ hiện dữ liệu thật của Student; fixture riêng development;
bản bàn giao UAT sau kiểm tra.

- [x] Viết integration test success/empty/loading/error độc lập, refresh chống lặp, logout/refresh-failure clear private cache,
  guard role và Back, CTA màn chưa có vẫn disabled; query lỗi không thay session bằng fixture.
- [x] Chạy `npx jest src/modules/auth src/modules/home --runInBand`. Expected: RED cho adapter production còn thiếu.
- [x] Ghép route/controller; không đổi thiết kế đã duyệt, không dùng token/phiên test ở app thật.
- [x] Chạy lint:rules, lint:code-format, lint:type-check, `npm test -- --runInBand`, Maestro UI và API trên Android.
  Expected: toàn bộ kiểm tra bắt buộc PASS; bằng chứng cookie thật/session reset riêng với test MSW.
- [x] Chỉ dùng tài khoản/dữ liệu test được cung cấp; không gửi register/email thật hoặc sửa dữ liệu backend để tạo bằng chứng
  khi chưa có phạm vi test phù hợp. Thiếu thì ghi Blocked/phần chưa kiểm tra.
- [x] Dọn file thuộc phạm vi; cập nhật UAT có ca nghiệp vụ thật/role/phiên. Chỉ chuyển In review chờ UAT khi đủ điều kiện;
  không tự chuyển Phase0/Phase1 Done.

## Hoàn tất bước API

- [x] Không còn production submit disabled vì thiếu adapter; các tính năng ngoài phạm vi vẫn giải thích đúng.
- [ ] Register/resend trung lập, Login/refresh/me/logout hoạt động bằng cookie thật, dữ liệu Home đúng hợp đồng.
- [x] Không có UI approval/UAT giả hoặc dùng screenshot fixture làm bằng chứng API.
- [ ] Owner thực hiện 1.99 sau bàn giao, xác nhận riêng theo ADR-0021.



## Kết quả kiểm tra 2026-10-17 22:12 (+07:00)

- Task1.6.1–1.6.3 đã hoàn tất; phần code1.6.4 đã ghép production và review.
- Lint/format/TypeScript PASS; Jest26 suite/132 test PASS. Android UI4/4 và API1/1 PASS.
- Native/backend đã xác minh: Student login, catalog/meta và buổi tới thật, auth/me/cookie sau stop/mở lại app,
  logout, Back không trở lại Home, mở lại app guest. Bằng chứng ở PROGRESS/evidence, không lấy preview làm bằng chứng API.
- Chưa xác minh native: access-cookie hết hạn còn refresh hợp lệ; refresh bị thu hồi/hết hạn đi qua navigator;
  register/resend gửi email thật; staff login bằng tài khoản thật. Các nhánh logic đã có MSW/UI test nhưng không thay native/backend.
- Tài khoản do owner cung cấp chỉ dùng đăng nhập/phiên; không lưu credential trong repo/YAML/evidence,
  không gửi thư hoặc tạo user backend để bổ sung bằng chứng. Cần phạm vi email test/điều kiện phiên phù hợp cho các ca còn lại.
- 1.6 và Phase1 giữ Blocked ở kiểm tra cuối,1.99 Todo. Foundation và owner UAT5–6 giữ độc lập; không tự Done.
