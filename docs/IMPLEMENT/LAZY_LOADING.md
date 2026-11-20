# Lazy loading UI

Cập nhật: 2026-11-06 (Asia/Bangkok).

## Mục tiêu và phạm vi

Hoãn khởi tạo module JavaScript và mount UI cho đến khi người dùng mở màn hình
hoặc bật component tương ứng. Áp dụng cho React Native Android/iOS của dự án.

| Nhóm UI                                                                         | Thời điểm tải                                                      | File triển khai                                                                      |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Tất cả màn hình đăng ký trong root stack, chỉ gồm các màn hình ứng dụng thực tế | Khi navigator cần render route                                     | `src/navigation/index.tsx`                                                           |
| Welcome, Login, Register, Home học viên                                         | Khi render route tương ứng; mở Login không khởi tạo các UI còn lại | `src/modules/auth/AuthRoutes.tsx`                                                    |
| Lịch học, tài khoản, danh sách lớp, chi tiết lớp                                | Khi render màn hình tương ứng                                      | `src/modules/my-classes/LearningRoutes.tsx`                                          |
| ShoppingSheets trên Home/Courses                                                | Khi mở chi tiết khóa học hoặc giỏ hàng                             | `src/modules/home/ProductionStudentHome.tsx`, `src/modules/courses/CoursesRoute.tsx` |
| CourseSheet, CartSheet                                                          | Khi loại sheet tương ứng được render                               | `src/modules/courses/components/ShoppingSheets.tsx`                                  |
| FilterSheet                                                                     | Khi mở bộ lọc                                                      | `src/modules/courses/CoursesRoute.tsx`                                               |
| Chi tiết buổi học, danh sách thành viên                                         | Khi chọn buổi học hoặc mở sheet thành viên                         | `src/modules/my-classes/ClassDetailScreen.tsx`                                       |
| QR thanh toán, ticket kết quả                                                   | Khi nhánh QR hoặc kết quả thanh toán được render                   | `src/modules/payment/PaymentScreen.tsx`                                              |
| Sheet hồ sơ, ngôn ngữ, đăng xuất                                                | Khi mở sheet tài khoản                                             | `src/modules/account/AccountScreen.tsx`                                              |

Các thành phần cơ bản dùng ngay trên màn hình như Button, Input, Skeleton,
header và tab bar tiếp tục được import trực tiếp. Nội dung trong ScrollView
không tự động được trì hoãn theo viewport. Đây cũng không phải lazy loading ảnh
hay thay đổi phân trang/API.

## Cơ chế

Root navigator dùng `Stack.Screen.getComponent` với `require` bên trong callback,
thay cho import toàn bộ màn hình từ barrel `@/modules`.

```tsx
<Stack.Screen
  name={routes.courses}
  getComponent={() =>
    (
      require('@/modules/courses/CoursesRoute') as typeof import('@/modules/courses/CoursesRoute')
    ).CoursesRoute
  }
/>
```

UI có điều kiện dùng helper
[`deferComponent`](../../src/components/common/deferComponent.tsx). Helper chỉ gọi
loader khi wrapper được render lần đầu; sau đó giữ nguyên component type đã tải.
Props vẫn được chuyển tiếp và state được giữ khi rerender. Khi UI bị unmount rồi
mở lại, state được tạo mới theo lifecycle React bình thường; module đã tải vẫn
được tái sử dụng.

```tsx
/* eslint-disable @typescript-eslint/no-require-imports */
import { deferComponent } from '@/components/common/deferComponent';

// Khai báo ngoài component để wrapper không bị tạo lại mỗi lần render.
const FilterSheet = deferComponent(
  () =>
    (
      require('./components/FilterSheet') as typeof import('./components/FilterSheet')
    ).FilterSheet
);

// Trong JSX, chỉ render khi cần hiển thị:
// {filterOpen && <FilterSheet {...filterProps} />}
```

`typeof import(...)` chỉ phục vụ kiểm tra kiểu, không import module lúc runtime.
Không thay loader bằng một component đã được static import: khi đó module đã
được khởi tạo trước khi helper có tác dụng.

Loader chạy đồng bộ bằng `require` trên native; không tạo Promise, không cần
Suspense và không thêm trạng thái chờ bất đồng bộ. Lần mở đầu có thể phải trả chi
phí khởi tạo module. Helper dành cho các component nhận props thông thường đang
dùng ở đây; không dùng wrapper này để chuyển tiếp `ref`.

Metro khai báo `inlineRequires: true` trong `getTransformOptions`. Các ranh giới
tải UI quan trọng vẫn dùng callback `require` rõ ràng, không phụ thuộc vào việc
Metro có tự hoãn static import hay không.

## Tránh kéo theo module không sử dụng

`navigateLearningTab` được tách sang
[`src/navigation/navigateLearningTab.ts`](../../src/navigation/navigateLearningTab.ts).
Home và Courses dùng helper này mà không cần import `LearningRoutes` và các phụ
thuộc của màn hình học tập.

ShoppingSheets chỉ được mount khi trạng thái sheet là `course` hoặc `cart`.
Khi đóng sheet, các adapter của sheet được unmount như trước; không giữ UI ẩn
chỉ để phục vụ lazy loading.

Giữ các side-effect import cần thiết như global CSS, i18n và đăng ký NativeWind
interop cho FastImage. Không chuyển phần khởi tạo dùng chung sang một màn hình
chỉ để nó được chạy tình cờ khi màn hình đó mở.

## Kiểm tra đã thực hiện

- `npx tsc --noEmit`: đạt.
- ESLint trên các file TypeScript/TSX và Metro đã thay đổi: đạt.
- `npx jest --runInBand --silent`: **69 suites, 355 tests đạt**.
- Chạy riêng `src/modules/auth/lazyRoutes.test.tsx` được bổ sung sau khi lượt
  toàn bộ đã bắt đầu: **1 suite, 1 test đạt**.
- Tổng hai lượt: **70 suites, 356 tests đạt**. Đây là unit/component và
  integration tests của Jest, gồm các luồng dùng API giả lập bằng MSW.
- `deferComponent.test.tsx` kiểm tra chưa gọi loader khi UI ẩn, chỉ tải một lần,
  chuyển props mới, giữ state khi rerender và tạo state mới sau khi mở lại.
- `lazyRoutes.test.tsx` kiểm tra mở Login/Register không đánh giá module UI
  Welcome/Home; route Home khi chưa có phiên học viên cũng không tải UI Home.

**Không chạy E2E/Maestro theo yêu cầu của người dùng.** Không dùng kết quả trên
để khẳng định đã đo cải thiện thời gian khởi động hay độ trễ lần mở đầu.

## Chạy và bảo trì

Sau khi đổi `metro.config.js`, khởi động lại Metro:

```sh
npm start -- --reset-cache
```

Module UI vẫn nằm trong bundle Android/iOS phát hành; thay đổi này hoãn việc
khởi tạo/render, không tải code từ mạng và không đảm bảo APK nhỏ hơn. Chỉ ghi
nhận mức cải thiện sau khi đo trên release build cùng thiết bị và cùng dữ liệu.

Tài liệu tham khảo:

- [React Navigation: Screen/getComponent](https://reactnavigation.org/docs/screen/#getcomponent).
- [React Native 0.80: Optimizing JavaScript loading](https://reactnative.dev/docs/0.80/optimizing-javascript-loading).
