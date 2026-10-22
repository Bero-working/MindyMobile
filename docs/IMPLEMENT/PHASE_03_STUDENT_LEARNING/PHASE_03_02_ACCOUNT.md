# 3.2 Tài khoản

## Bước và nguồn

UI, Done (owner duyệt UAT ngày 2026-10-21). Base `section#t2` → `showProfile`, `c.isAccount`, `acctGroups`; khảo sát2026-10-20, [điều chỉnh](references/DESIGN_SOURCE.md). Đã có fixture/callback trong UI; auth thật ở3.6. Xác nhận logout dùng AppSheet hiện có vì repo chưa có component Dialog; không thêm component UI bị khoá hoặc dependency.

## Đặc tả UI

### Điều chỉnh theo ảnh owner — 2026-10-20 (ưu tiên)
- Nguồn mới [profile-owner-2026-10-20.png](references/profile-owner-2026-10-20.png); giữ snapshot trước ở PROGRESS/evidence/profile-redesign/before.png.
- Bỏ tiêu đề Tài khoản lớn và hero dạng card/gradient thụt lề. BrandBar và hero xanh mint hết chiều ngang, avatar88dp căn giữa, tên20dp/email13.5dp căn giữa; khối trắng bo trên28dp chồng28dp ở dưới.
- Menu nền soft bo18dp, ba nhóm: Đơn hàng của tôi; Chỉnh sửa hồ sơ/Lớp của tôi/Chứng chỉ/Lịch sử điểm danh; Thông báo đẩy/Ngôn ngữ/Trợ giúp/Điều khoản & chính sách. Row>=50dp, icon32dp trong vòng canvas, chữ14.5dp, chevron bên phải; không các nút outline lớn hoặc tiêu đề Học tập/Ngôn ngữ riêng. Tăng chiều cao tự nhiên theo chữ.
- Theo yêu cầu hình ảnh mới, hiển thị các mục ngoài API ở trạng thái disabled có accessibilityHint chưa khả dụng. Không số đơn/lớp mẫu, không switch push bật giả, không upload ảnh hoặc mutation hồ sơ. Badge camera chỉ báo thao tác chưa khả dụng; tên học viên mở sheet Thông tin cá nhân chỉ đọc. Mục Chỉnh sửa hồ sơ disabled. Giữ quyền thực tế, không tự mở rộng API của phase.
- Ngôn ngữ là một row với giá trị hiện tại và chevron, mở sheet chọn vi/en dùng useI18n. Logout giữ dưới các nhóm để bảo toàn chức năng; xác nhận/lỗi như đặc tả. Không thêm nút Lịch học vào nhóm vì đã có tab.
- Không dựng khung điện thoại, dữ liệu tên/email mẫu trong ảnh, badge thông báo đỏ hoặc tổng đơn/lớp chưa có dữ liệu. Tab Tài khoản selected; font lớn giữ đầy đủ nhãn/hành động. Một sheet tại một thời điểm.

- Hero gradient forestDeep→forest→mint, padding16dp cộng top safe area; avatar initials tròn80dp nền sunshine, tên20/26 ExtraBold và email13.5/20 trên nền tối, tự xuống dòng. Không ảnh đại diện giả hoặc nút thay ảnh.
- Khối trắng chồng đáy hero28dp, bo góc trên28dp, padding16dp; nhóm menu nền soft bo18dp, gap12dp. Row tối thiểu50dp, padding ngang14dp, icon32dp, text14.5/20 Semibold; chiều cao tự tăng theo font. AppTabBar chọn account, không che menu cuối.
- Nhóm Học tập: “Lớp của tôi” → My Classes; “Lịch học” → Schedule. Không hardcode “2 lớp” hoặc lấy số item trang đầu làm tổng.
- Nhóm Tài khoản: “Thông tin cá nhân” mở vùng chỉ đọc gồm tên, email, điện thoại (null→“Chưa cập nhật”), vai trò hiển thị tiếng Việt. Dùng UserDto; không ngày sinh/trường/giới tính/bio vì contract chưa có. Không có nút lưu, không toast lưu thành công giả.
- Nhóm tuỳ chọn: “Ngôn ngữ” Việt/Anh dùng cơ chế i18n hiện có; áp dụng ngay và giữ lựa chọn bằng cơ chế sẵn có. Không thêm cơ chế lưu mới.
- “Đăng xuất” màu headsup; xác nhận bằng Dialog có sẵn, pending khoá bấm, lỗi hiện tại vùng thao tác và retry. Thành công reset phiên/stack theo flow có sẵn, Back không quay lại dữ liệu Student.
- Các mục trong prototype chưa thuộc phạm vi (đơn hàng, sửa hồ sơ, chứng chỉ, lịch sử điểm danh, push, trợ giúp/chính sách chưa có URL) không xuất hiện như nút hoạt động. Tab Thông báo giữ disabled+hint như hiện tại.
- Loading skeleton profile/menu; lỗi lấy hồ sơ có retry, không lộ hồ sơ user trước; tình huống không phiên chuyển về auth qua guard, không coi là “tài khoản rỗng”. Empty của trường nullable có copy riêng; lỗi refetch cùng user giữ dữ liệu cũ và thông báo.
- Nhãn đọc màn hình cho avatar/menu/ngôn ngữ; modal focus đúng, Back đóng modal trước. Không tắt scaling; animation theo motion.ts/Reduce Motion.

## API / dữ liệu

[Auth §6.7, §6.6](../../API_CONTRACT/auth.md): GET auth/me và POST auth/logout hiện có. Chỉ tái sử dụng session/query/actions hiện có; không tạo profile service sửa dữ liệu. API đổi hồ sơ/mật khẩu đang chưa có theo §22, ghi rõ phần khác base này.

## Task

### 3.2.1 Hero, menu và thông tin cá nhân
- Test tên/email dài, phone null, không có dữ liệu ngoài UserDto, callbacks classes/schedule, trạng thái lỗi và ngôn ngữ.
- testID `account-my-classes`, `account-schedule`, `account-profile`, `account-language`; i18n `account.profile.*`, `account.menu.*`.

### 3.2.2 Đăng xuất
- Test mở/huỷ/xác nhận, khoá bấm khi pending, lỗi giữ màn; UI chỉ callback, integration reset cache/stack ở3.6.
- testID `account-logout`, `account-logout-confirm`; i18n `account.logout.*`.

## Nghiệm thu

- [ ] Menu, profile và ngôn ngữ dùng được; không giả chức năng chưa có API.
- [ ] Đăng xuất có phản hồi rõ; đủ loading/error/nullable/phiên không còn hợp lệ.
- [ ] Ảnh và kiểm tra chữ lớn/320dp/native ghi trong PROGRESS.
