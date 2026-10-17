# Bản đồ section → component → dữ liệu → CTA của Phase 1

Chuẩn bị cho task 1.1.1 ngày 2026-10-17. Đây là bản đồ triển khai, không phải code hoặc bằng chứng UI đã đạt.
Nguồn và bố cục đã khảo sát: [DESIGN_SOURCE](DESIGN_SOURCE.md). ADR-0018 đã Accepted.

| Section | Component dự kiến | Nguồn dữ liệu | CTA và giới hạn |
| --- | --- | --- | --- |
| Welcome | AuthShell, WelcomeScreen | i18n và mascot gốc | Tạo tài khoản → Register; Đăng nhập → Login |
| Login | LoginScreen, Input, Button | Giá trị form và adapter có kiểu | Submit chỉ khi có adapter; link Register, Back; ẩn Google/forgot |
| Register | RegisterScreen, Input, Button | Giá trị form và adapter có kiểu | Submit payload whitelist; 202 → Check email; không tạo session |
| Check email | CheckEmailScreen | Kết quả trung lập từ adapter | Resend theo thao tác, pending riêng; về Login |
| Home hero | HomeHeader | displayName từ auth adapter, i18n, mascot gốc | Giỏ chỉ có callback preview hoặc disabled có giải thích |
| Buổi học tiếp theo | NextSession | Adapter schedule: classId/sessionId/sessionTitle/startsAt/timeZone/accessMode | Callback đúng ID/quyền; không ghép meeting URL |
| Khoá học | FeaturedCourses, CourseCover | Tối đa 4 CourseDto theo thứ tự backend; badge từ lớp OPEN nếu có | Item và dấu + gọi callback riêng; không thêm course trực tiếp vào giỏ |
| Khám phá | Button | i18n | Callback preview; disabled nếu chưa có màn đích thật |
| Giới thiệu | IntroCarousel | 3 slide từ i18n/fixture preview; ảnh gốc nếu có | Vuốt/chấm đổi slide; CTA riêng, không timer |
| Compiler | CompilerSection | Nội dung tĩnh; terminal/kết quả minh hoạ chỉ ở preview | Không chạy/chấm code; callback preview hoặc disabled |
| Ghi chú | AboutCarousel | 3 ghi chú từ i18n/fixture preview | Vuốt/chấm đổi ghi chú; không công bố cam kết chưa duyệt |
| Footer | HomeFooter | Brand và nội dung đã xác nhận | Ẩn email/hotline/link pháp lý mẫu, không dùng link # |
| Tab bar | HomeTabBar | i18n; Home selected | 5 tab đúng thứ tự; callback preview hoặc disabled kèm giải thích |

## Asset

| Asset | Hiện trạng | Ghi chú |
| --- | --- | --- |
| Mascot ếch Mindy (laptop) | Đã có file gốc [mindy-mascot-laptop.png](assets/mindy-mascot-laptop.png) 540×432 RGBA | Dùng chung Auth và hero Home |
| Mascot bản đồ / sách | Đã có [mindy-mascot-map.png](assets/mindy-mascot-map.png) 170×175, [mindy-mascot-book.png](assets/mindy-mascot-book.png) 137×164 | Độ phân giải thấp, chỉ dùng cỡ nhỏ |
| Ảnh học viên nhận giấy | Đã có [student-certificate.png](assets/student-certificate.png) 471×502 | Ảnh người thật, chờ owner xác nhận quyền dùng |
| Course/mentor/project | Bản thiết kế dùng placeholder | Giữ placeholder có chủ đích, không tự sinh ảnh thay thế |

Ngày 2026-10-17 đọc HTML của hai artifact bằng công cụ Artifact `read`, giải mã ảnh base64 trong bundle manifest.
Chi tiết nguồn, UUID và hash ở [DESIGN_SOURCE](DESIGN_SOURCE.md#asset-và-khác-biệt-cần-giữ-rõ).
Home mục `2` / `2a` vẫn còn trong version đã đọc.
