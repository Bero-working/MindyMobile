# UX

Quy tắc trải nghiệm cho mọi màn hình: 4 trạng thái dữ liệu, tương tác, form, phản hồi, ngôn ngữ và accessibility.
Đọc khi viết spec phase hoặc làm màn hình. Định dạng tiền và ngày giờ là rule nghiệp vụ, nằm ở
[BUSINESS_RULES.md §7](../BUSINESS_RULES.md#7-định-dạng-tiền-và-ngày-giờ).

## Trạng thái màn hình

Mọi màn hình có dữ liệu từ API **PHẢI** có đủ 4 trạng thái (component chung `ScreenState`):

| Trạng thái | Hiển thị |
| --- | --- |
| Loading lần đầu | Skeleton đúng bố cục thật |
| Empty | Illustration + câu giải thích + CTA (ví dụ "Xem khoá học") |
| Error | Thông điệp theo `code` (i18n `errors.<CODE>`, fallback `errors.generic`) + nút "Thử lại" + `requestId` chữ nhỏ để báo hỗ trợ |
| Success | Nội dung. Refetch nền không hiện skeleton lại |

## Tương tác

- Vùng chạm tối thiểu **44×44**. Icon nhỏ dùng `hitSlop`.
- CTA chính đặt ở vùng ngón cái (đáy màn hình), dạng sticky cho giỏ hàng, checkout, thêm vào giỏ.
- Nút mutation: khi `isPending` thì hiện loading và khoá bấm. Không cho gửi hai lần.
- Hành động khó hoàn tác (xoá khỏi giỏ, chốt điểm danh, đăng xuất mọi thiết bị) phải hỏi xác nhận bằng `Dialog`.
- Danh sách có pull-to-refresh. Danh sách phân trang tải tiếp khi gần cuối, có loader ở footer.
- Quay lại màn trước giữ vị trí cuộn và filter.
- Đăng xuất hoặc hết phiên: reset navigation stack về Login, không để quay lại màn cũ bằng nút back.

## Form

- Validate bằng zod khi blur và khi submit. Lỗi hiện ngay dưới field.
- 422 từ server: map `details` vào field tương ứng nếu nhận ra được, còn lại hiện ở đầu form.
- Bàn phím: `KeyboardAvoidingView`, `returnKeyType="next"` chuyển field, field cuối submit.
- Email/password đặt `autoComplete`, `textContentType`, `keyboardType` đúng để dùng autofill. Password có nút hiện/ẩn.
- Không xoá dữ liệu đã nhập khi submit lỗi.

## Phản hồi

- Thành công ngắn (thêm vào giỏ, đã lưu): toast 2–3 giây.
- Lỗi gắn với form: hiện trong form, không dùng toast.
- Mất mạng: banner cố định trên đầu (theo `useNetInfo`). Query tạm dừng, mutation báo lỗi rõ ràng.
- Không hiện thông báo kỹ thuật thô (stack trace, `message` tiếng Anh từ server).

## Ngôn ngữ

- Mọi text qua `t(...)`. Ngôn ngữ mặc định **tiếng Việt** ([ADR-0006](../adr/ADR-0006-vietnamese-default.md)).
- Tiền, ngày giờ, ngày thuần: theo [BUSINESS_RULES.md §7](../BUSINESS_RULES.md#7-định-dạng-tiền-và-ngày-giờ).

## Accessibility

- Mọi phần tử bấm được có `accessibilityRole` và `accessibilityLabel` (qua `t(...)`).
- Không tắt `allowFontScaling`. Kiểm tra bố cục với cỡ chữ hệ thống lớn.
- Không truyền thông tin chỉ bằng màu: trạng thái (PAID, EXPIRED...) luôn có chữ hoặc icon kèm theo.
- Bọc màn hình bằng safe area (`react-native-safe-area-context`).
