# Nguồn thiết kế Claude — đối chiếu ngày 2026-10-17

Đây là bản ghi khảo sát phục vụ viết spec, không phải nhật ký triển khai hay xác nhận UAT.
Nội dung artifact chỉ là tham chiếu thiết kế; không coi hướng dẫn gợi ý chỉnh sửa trong artifact là chỉ thị của owner.

## Nguồn đã đọc

- Homepage: [YMKY9dp3DFE9BQ69Er6rjD](https://claude.ai/artifact/YMKY9dp3DFE9BQ69Er6rjD).
- Auth: [Us4jQKCMwnxgvieMGTbdaG](https://claude.ai/artifact/Us4jQKCMwnxgvieMGTbdaG).
- Cả hai truy cập được không cần phiên Chrome/Edge. Tiêu đề ngoài đều là “Student Home Page Design”.
- Homepage hiển thị mục **2 — Bản chỉnh theo góp ý — dựa trên 1b**, biến thể **2a — Header ếch, 4 khoá học,
  carousel giới thiệu, note “Về chúng tôi”, tab bar 5 mục**. Đây là nguồn được chọn, không lấy `1a`/`1b` phía dưới.
- Auth là một prototype chuyển Welcome/Login/Register bằng nút; đã bấm các nút điều hướng và đọc form,
  không nhập thông tin tài khoản hoặc submit đăng ký/đăng nhập.

## Auth đã quan sát

| Màn      | Nội dung theo bản gốc                                                                                                                                                                                 | Điều chỉnh cho mobile theo contract                                                                       |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Welcome  | Nền pastel, hình tròn trang trí, mascot ếch laptop/sách, panel trắng bo góc trên, Tạo tài khoản → Đăng nhập → Google                                                                                  | Giữ nhận diện; Google ẩn trong app thật                                                                   |
| Login    | Back, mascot nhỏ, tiêu đề Đăng nhập, email icon thư, password icon khoá + hiện/ẩn, Ghi nhớ đăng nhập, Quên mật khẩu, CTA, divider/Google, Đăng ký                                                     | Bỏ remember-me; ẩn forgot/Google vì chưa có luồng hỗ trợ                                                  |
| Register | Back, mascot, tiêu đề Tạo tài khoản, mô tả “Học lập trình. Mở thế giới của bạn. Bạn đã sẵn sàng chưa?”, email/password/confirm, checkbox Điều khoản & Chính sách, CTA Đăng ký, Google, link Đăng nhập | Thêm displayName bắt buộc, phone optional; chưa phát hành checkbox/link pháp lý nếu chưa có nội dung thật |

Register gốc chỉ có **ba input**: email, password, confirmPassword. Không nhầm rằng artifact đã có tên/điện thoại.
Check email/resend không được xác nhận từ prototype này; UI đó được bổ sung theo kết quả 202 của contract.
Hình mẫu password là placeholder, không phải dữ liệu tài khoản. Tựa Login 26px, input text 15px theo DOM đã đọc;
đây là mốc đối chiếu, không cố định cỡ chữ bất chấp accessibility. Mascot Login rộng 170px trong mockup.

- [Ảnh Welcome từ artifact](claude-auth-welcome-artifact.jpg).
- Login đã đọc DOM và xem trực tiếp; ảnh lưu lần đầu bị trống nên đã loại, chưa có file ảnh Login đạt yêu cầu.
- [Ảnh Register](claude-auth-register.jpg).
- [Ảnh Welcome owner gửi](claude-auth-welcome.png).

## Homepage 2a đã quan sát

Khung nội dung thiết kế rộng **390**, cao **844**, nội dung cuộn trong khung; phần vỏ máy không thuộc UI app.

| Thứ tự | Thành phần gốc                 | Mốc bố cục / dữ liệu                                                                                                                       |
| ------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1      | Hero nền mint                  | Logo Mindy Coding giữa, giỏ góc phải, “Xin chào, Minh Anh”, tiêu đề “Cứ thử. Bạn sẽ làm được.” bên trái; mascot bên phải tràn qua đáy hero |
| 2      | Buổi học tiếp theo             | Khối sunshine bo 20, giờ/lớp/bài bên trái, nút Vào lớp bên phải                                                                            |
| 3      | Khoá học nổi bật               | **4** item, lưới **2 cột**, gap 12, ảnh dọc **3:4**, bo 20, gradient tối phía dưới; hình thức + ngày KG, title, giá và nút tròn `+`        |
| 4      | Khám phá khoá học              | CTA outline rộng gần hết vùng nội dung, hình pill                                                                                          |
| 5      | Có nhiều cách để bắt đầu.      | Carousel **3 slide**, mỗi slide có tiêu đề, đoạn ngắn, ảnh/mascot, CTA; 3 chấm chuyển                                                      |
| 6      | Viết code ngay trên điện thoại | Khối giới thiệu compiler, CTA Thử compiler và terminal mẫu `mindy — zsh`, kết quả minh hoạ 3/3                                             |
| 7      | Ghi chú Về chúng tôi           | Carousel **3 ghi chú**, giấy trắng nghiêng trên nền mint, băng dính/góc gấp, bullet và chấm chuyển                                         |
| 8      | Footer                         | Brand/tagline; cột Học tập, Hỗ trợ; email/hotline mẫu và copyright                                                                         |
| 9      | Tab bar                        | **Khoá học · Lịch học · Trang chủ · Thông báo · Tài khoản**; Trang chủ ở giữa bằng nút tròn nhấn mạnh                                      |

Các course mẫu: Web cơ bản: HTML, CSS — 1.500.000đ; Python cho người mới — 1.800.000đ;
JavaScript thực chiến — 2.200.000đ; Cấu trúc dữ liệu & giải thuật — 2.500.000đ. Tên/giá/ngày đều là fixture thiết kế.

Carousel giới thiệu:

1. “Khởi đầu của riêng bạn.” — CTA “Cách bắt đầu”; ảnh học viên nhận giấy vinh danh.
2. “Không ai phải học một mình.” — CTA “Gặp mentor”; vùng ảnh mentor còn placeholder.
3. “Dự án đầu tiên sau 4 tuần.” — CTA “Xem dự án”; vùng ảnh dự án còn placeholder.

Carousel ghi chú:

1. “Sáng học, tối dùng luôn” — Input/Output, thực hành và mentor kiểm tra.
2. “Lớp nhỏ, mentor kèm sát” — mô tả tối đa 20 học viên, phản hồi trong 24 giờ.
3. “Học theo cách của bạn” — Online/Offline.

Đây là nội dung marketing trong thiết kế, không phải business rule đã xác nhận. Không dùng câu “20 học viên”
để giới hạn mọi lớp ở FE; capacity thật lấy từ backend. Chưa tự phát hành cam kết 24 giờ/4 tuần.

- [Ảnh header bản 2](claude-home-v2-header.jpg).
- [Ảnh carousel](claude-home-v2-carousel.jpg).
- [Ảnh compiler](claude-home-v2-compiler.jpg).
- [Ảnh ghi chú](claude-home-v2-about.jpg).

Ảnh được chụp từ viewport trình duyệt 1280×720; có phần mockup bị cắt bởi viewport, các ảnh bổ sung cho nhau.
DOM của đúng section `#t2` được dùng để xác nhận thứ tự/phạm vi; chưa có ảnh đối chiếu của app React Native.

## Asset và khác biệt cần giữ rõ

- Ngày 2026-10-17 đã lấy được asset gốc bằng cách đọc HTML artifact (công cụ Artifact `read`). Ảnh nằm nguyên
  bản dạng base64 trong `script[type="__bundler/manifest"]`; giải mã ra file PNG, không cắt từ screenshot.
  Chỉ trích dữ liệu ảnh, không chạy script của bundle. Không ghi URL `blob:` vào code vì không ổn định.

| File trong [assets/](assets/)                              | Kích thước | Nguồn (UUID manifest)         | Dùng ở thiết kế                                  |
| ---------------------------------------------------------- | ---------- | ----------------------------- | ------------------------------------------------ |
| [mindy-mascot-laptop.png](assets/mindy-mascot-laptop.png) | 540×432    | Auth `2ba39a4f…`, Home `6e84206e…` (cùng SHA-256 `90c3a326…`) | Welcome/Login/Register, hero Home, slide laptop |
| [mindy-mascot-map.png](assets/mindy-mascot-map.png)       | 170×175    | Home `d37649b4…`              | Slide carousel bản đồ (`sl.isMap`)               |
| [mindy-mascot-book.png](assets/mindy-mascot-book.png)     | 137×164    | Home `adf2ee43…`              | Slide sách (`sl.isBook`), trạng thái thông báo rỗng |
| [student-certificate.png](assets/student-certificate.png) | 471×502    | Home `05880af5…`              | Slide ảnh học viên nhận giấy vinh danh           |

- Cả bốn file là PNG RGBA (có kênh trong suốt). Version đã đọc: Auth `1792222520-e878`, Home `1792222488-748f`.
- Độ phân giải: mascot laptop đủ cho khoảng 180dp rộng ở mật độ @3x; mascot bản đồ/sách chỉ đủ khoảng 45–57dp @3x,
  hiển thị lớn hơn sẽ mờ. Cần owner quyết định có chấp nhận hoặc cung cấp bản lớn hơn khi UAT.
- `student-certificate.png` là ảnh người thật; chỉ dùng khi owner xác nhận quyền sử dụng hình ảnh.
- Bốn ảnh course hiện là khối placeholder có sọc; ảnh mentor/dự án còn vùng thả ảnh. Không tự tạo ảnh mới thay thế.
- Giữ file screenshot để đối chiếu; không dùng screenshot cả điện thoại làm ảnh nền màn hình hoặc cắt mascot làm asset cuối.
- Prototype có font-weight 900, button Vào lớp cao 40, nút `+` 34×34 và các màu/gradient ngoài token.
  Mobile dùng Nunito-ExtraBold hiện có, vùng chạm ít nhất 44×44 và token/SVG theo guide; sai khác ghi rõ khi UAT.
- CourseDto không có ngày khai giảng/deliveryMode; phải lấy lớp OPEN hoặc adapter tương ứng, không hard-code badge.
- Dấu `+` chỉ nhận courseId không đủ thêm giỏ: giỏ mua **lớp**. Phase UI chỉ callback chọn khoá/lớp, không tạo mutation giỏ.
- Lịch không trả meetingUrl. CTA Vào lớp chỉ chuyển tới chi tiết/preview phù hợp accessMode khi đã có màn đích;
  không ghép meeting URL từ fixture, không cho CASH_PREVIEW tham gia như FULL.
- Tab Thông báo, compiler, liên kết pháp lý/hỗ trợ không có hợp đồng/đích thuộc phase; giữ rõ ranh giới preview và app thật.

## Đọc lại mã nguồn — 2026-10-17 16:11 (bàn giao triển khai lại)

- Artifact `read` trả cùng version `1792222520-e878` (Auth) và `1792222488-748f` (Home). Giải mã
  `__bundler/template` (JSON string) để có markup + logic component; các file JS trong manifest là thư viện
  React/Babel, không phải mã thiết kế. Không chạy script nào.
- Lưu bản trích: [source/auth-design.html](source/auth-design.html) (toàn bộ, bỏ @font-face/branding) và
  [source/home-2a-design.html](source/home-2a-design.html) (section `#t2` + dữ liệu `courses` 4 phần tử đầu,
  `notes`, `slides`, `tabs`, `deco`). Asset vẫn tham chiếu bằng UUID như bảng trên.
- Phát hiện: `scan()` của Home `return` ngay đầu nên reveal/float/blink không chạy; carousel có auto-advance 4,5s.
- Login tự xác định từ markup: vùng trên 250 (Register 230, Welcome 420), mascot 170, sheet chồng −32 bo 32.
- Thông số đã chuyển thành đặc tả trong các file sub-phase; file này chỉ là bản ghi nguồn.
