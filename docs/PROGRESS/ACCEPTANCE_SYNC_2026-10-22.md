# Đồng bộ tiêu chí nghiệm thu — 2026-10-22

Theo yêu cầu owner, đối chiếu checklist Phase 0–3 với IMPLEMENT/PROGRESS và xác nhận UAT đã ghi. Không chạy test mới, không sửa code, không thay UAT hoặc nhật ký lịch sử. Phase 0–3 giữ Done theo owner; Phase 4 vẫn In review chờ UAT riêng.

Kết quả: cập nhật 28 file tiêu chí, tick bổ sung 78 mục đủ bằng chứng và ghi rõ lý do cho 8 mục còn thiếu/đạt một phần. Giữ nguyên nội dung và số lượng tiêu chí gốc. Đã kiểm tra liên kết mới và git diff --check; các entry PROGRESS mới chỉ thêm ở cuối file.

`[x]` = đủ bằng chứng cho nội dung tiêu chí trong phạm vi nêu ở hồ sơ (có thể là unit/MSW/fixture hoặc xác nhận owner nếu tiêu chí yêu cầu owner). `[ ]` = còn vế chưa kiểm tra/đạt một phần; xem lý do bên dưới. Không coi mọi ô trống là lỗi chức năng và không coi UAT tổng thể là PASS cho mọi ca chưa chạy.

Nguồn bổ sung hiện tại: [CI Phase 4 run 39700197090](https://github.com/Bero-working/MindyMobile/actions/runs/39700197090), [bàn giao CI](PHASE_04_GITHUB_ACTIONS/HANDOFF.md). CI này chứng minh quality/13 flow preview và native builds ở revision đã ghi; không chứng minh thanh toán, dataset backend khác hoặc E2E iOS. Không dùng kết quả mới để đổi kết quả lịch sử của Phase 0–3.

## PHASE_00_FOUNDATION

| File tiêu chí | Đã tick / tổng | Tick bổ sung | Bằng chứng đối chiếu |
| --- | --- | --- | --- |
| [PHASE_00_01_NATIVEWIND.md](../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_01_NATIVEWIND.md) | 4/4 | 0 | [PROGRESS](PHASE_00_FOUNDATION/PHASE_00_01_NATIVEWIND.md) |
| [PHASE_00_02_FONT.md](../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_02_FONT.md) | 2/2 | 0 | [PROGRESS](PHASE_00_FOUNDATION/PHASE_00_02_FONT.md) |
| [PHASE_00_03_THEME.md](../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_03_THEME.md) | 2/2 | 0 | [PROGRESS](PHASE_00_FOUNDATION/PHASE_00_03_THEME.md) |
| [PHASE_00_04_HTTP.md](../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_04_HTTP.md) | 3/3 | 0 | [PROGRESS](PHASE_00_FOUNDATION/PHASE_00_04_HTTP.md) |
| [PHASE_00_05_IDEMPOTENCY_KEY.md](../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_05_IDEMPOTENCY_KEY.md) | 3/3 | 3 | [PROGRESS](PHASE_00_FOUNDATION/PHASE_00_05_IDEMPOTENCY_KEY.md) |
| [PHASE_00_06_LOGGER.md](../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_06_LOGGER.md) | 2/2 | 2 | [PROGRESS](PHASE_00_FOUNDATION/PHASE_00_06_LOGGER.md) |
| [PHASE_00_07_QUERY_CLIENT.md](../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_07_QUERY_CLIENT.md) | 2/2 | 2 | [PROGRESS](PHASE_00_FOUNDATION/PHASE_00_07_QUERY_CLIENT.md) |
| [PHASE_00_08_ESLINT.md](../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_08_ESLINT.md) | 1/1 | 1 | [PROGRESS](PHASE_00_FOUNDATION/PHASE_00_08_ESLINT.md) |
| [PHASE_00_09_TEST_INFRA.md](../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_09_TEST_INFRA.md) | 2/2 | 2 | [PROGRESS](PHASE_00_FOUNDATION/PHASE_00_09_TEST_INFRA.md) |
| [PHASE_00_10_E2E.md](../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_10_E2E.md) | 1/2 | 1 | [PROGRESS](PHASE_00_FOUNDATION/PHASE_00_10_E2E.md) |
| [PHASE_00_11_I18N.md](../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_11_I18N.md) | 2/2 | 0 | [PROGRESS](PHASE_00_FOUNDATION/PHASE_00_11_I18N.md) |
| [PHASE_00_99_User_Acceptance.md](../IMPLEMENT/PHASE_00_FOUNDATION/PHASE_00_99_User_Acceptance.md) | 15/15 | 0 | [PROGRESS](PHASE_00_FOUNDATION/README.md) |
| [README.md](../IMPLEMENT/PHASE_00_FOUNDATION/README.md) | 6/6 | 0 | [PROGRESS](PHASE_00_FOUNDATION/README.md) |

- **PHASE_00_10_E2E.md, checkbox 2:** Đạt một phần: Android APP_ID=com.mindymobile và override đã kiểm chứng/owner duyệt bước 8; chưa có bằng chứng chốt riêng bundle ID và E2E iOS. Không suy từ build Simulator thành E2E iOS.

## PHASE_01_AUTH_HOME_UI

| File tiêu chí | Đã tick / tổng | Tick bổ sung | Bằng chứng đối chiếu |
| --- | --- | --- | --- |
| [PHASE_01_01_DESIGN_FOUNDATION.md](../IMPLEMENT/PHASE_01_AUTH_HOME_UI/PHASE_01_01_DESIGN_FOUNDATION.md) | 4/4 | 4 | [PROGRESS](PHASE_01_AUTH_HOME_UI/PHASE_01_01_DESIGN_FOUNDATION.md) |
| [PHASE_01_02_LOGIN.md](../IMPLEMENT/PHASE_01_AUTH_HOME_UI/PHASE_01_02_LOGIN.md) | 4/4 | 4 | [PROGRESS](PHASE_01_AUTH_HOME_UI/PHASE_01_02_LOGIN.md) |
| [PHASE_01_03_REGISTER.md](../IMPLEMENT/PHASE_01_AUTH_HOME_UI/PHASE_01_03_REGISTER.md) | 4/4 | 4 | [PROGRESS](PHASE_01_AUTH_HOME_UI/PHASE_01_03_REGISTER.md) |
| [PHASE_01_04_HOMEPAGE.md](../IMPLEMENT/PHASE_01_AUTH_HOME_UI/PHASE_01_04_HOMEPAGE.md) | 4/4 | 4 | [PROGRESS](PHASE_01_AUTH_HOME_UI/PHASE_01_04_HOMEPAGE.md) |
| [PHASE_01_05_NAVIGATION.md](../IMPLEMENT/PHASE_01_AUTH_HOME_UI/PHASE_01_05_NAVIGATION.md) | 3/3 | 3 | [PROGRESS](PHASE_01_AUTH_HOME_UI/PHASE_01_05_NAVIGATION.md) |
| [PHASE_01_06_API_INTEGRATION.md](../IMPLEMENT/PHASE_01_AUTH_HOME_UI/PHASE_01_06_API_INTEGRATION.md) | 22/22 | 2 | [PROGRESS](PHASE_01_AUTH_HOME_UI/PHASE_01_06_API_INTEGRATION.md) |
| [PHASE_01_99_User_Acceptance.md](../IMPLEMENT/PHASE_01_AUTH_HOME_UI/PHASE_01_99_User_Acceptance.md) | 7/8 | 1 | [PROGRESS](PHASE_01_AUTH_HOME_UI/README.md) |
| [README.md](../IMPLEMENT/PHASE_01_AUTH_HOME_UI/README.md) | 8/9 | 8 | [PROGRESS](PHASE_01_AUTH_HOME_UI/README.md) |

Bằng chứng UI/ảnh/chữ lớn/target: README PROGRESS và các entry 2026-10-17 21:08; API 22:12; UAT 22:42; owner bổ sung phiên/refresh, đăng ký/resend và TalkBack ngày 2026-10-20. Sai khác thiết kế có chủ đích giữ nguyên theo owner.

- **PHASE_01_99_User_Acceptance.md, checkbox 6:** Chưa đủ hồ sơ tại mốc Phase 1: nhật ký 2026-10-20 14:58 ghi rõ không tự tick điều kiện Dọn dẹp/chuyển In review vì thiếu bản ghi đầy đủ. Giữ UAT Done theo owner, không tái dựng mốc lịch sử từ CI mới.
- **README.md, checkbox 5:** Đạt một phần: có đo target, chữ lớn/animator=0 và owner xác nhận TalkBack; Reduce Motion native sau thay đổi autoplay chưa được kiểm tra lại theo nhật ký. Giữ phần chưa kiểm tra, không tick toàn tiêu chí ghép.

## PHASE_02_COURSE_CHECKOUT

| File tiêu chí | Đã tick / tổng | Tick bổ sung | Bằng chứng đối chiếu |
| --- | --- | --- | --- |
| [PHASE_02_01_COURSE_CATALOG.md](../IMPLEMENT/PHASE_02_COURSE_CHECKOUT/PHASE_02_01_COURSE_CATALOG.md) | 3/4 | 3 | [PROGRESS](PHASE_02_COURSE_CHECKOUT/PHASE_02_01_COURSE_CATALOG.md) |
| [PHASE_02_02_CLASS_PICKER.md](../IMPLEMENT/PHASE_02_COURSE_CHECKOUT/PHASE_02_02_CLASS_PICKER.md) | 1/2 | 1 | [PROGRESS](PHASE_02_COURSE_CHECKOUT/PHASE_02_02_CLASS_PICKER.md) |
| [PHASE_02_03_CART_SHEET.md](../IMPLEMENT/PHASE_02_COURSE_CHECKOUT/PHASE_02_03_CART_SHEET.md) | 3/3 | 3 | [PROGRESS](PHASE_02_COURSE_CHECKOUT/PHASE_02_03_CART_SHEET.md) |
| [PHASE_02_04_PAYMENT_QR.md](../IMPLEMENT/PHASE_02_COURSE_CHECKOUT/PHASE_02_04_PAYMENT_QR.md) | 3/4 | 3 | [PROGRESS](PHASE_02_COURSE_CHECKOUT/PHASE_02_04_PAYMENT_QR.md) |
| [PHASE_02_05_NAVIGATION.md](../IMPLEMENT/PHASE_02_COURSE_CHECKOUT/PHASE_02_05_NAVIGATION.md) | 3/3 | 3 | [PROGRESS](PHASE_02_COURSE_CHECKOUT/PHASE_02_05_NAVIGATION.md) |
| [PHASE_02_06_API_INTEGRATION.md](../IMPLEMENT/PHASE_02_COURSE_CHECKOUT/PHASE_02_06_API_INTEGRATION.md) | 2/3 | 0 | [PROGRESS](PHASE_02_COURSE_CHECKOUT/PHASE_02_06_API_INTEGRATION.md) |
| [PHASE_02_99_User_Acceptance.md](../IMPLEMENT/PHASE_02_COURSE_CHECKOUT/PHASE_02_99_User_Acceptance.md) | 6/6 | 0 | [PROGRESS](PHASE_02_COURSE_CHECKOUT/README.md) |
| [README.md](../IMPLEMENT/PHASE_02_COURSE_CHECKOUT/README.md) | 10/10 | 1 | [PROGRESS](PHASE_02_COURSE_CHECKOUT/README.md) |

Nguồn bổ sung: [UI_REVIEW](PHASE_02_COURSE_CHECKOUT/UI_REVIEW.md), [API_REVIEW](PHASE_02_COURSE_CHECKOUT/API_REVIEW.md), owner UI 02:00 và UAT duyệt lại 21:34 ngày 2026-10-18. Thanh toán payment-pending theo yêu cầu sau đó chỉ loại khỏi CI; không xoá bằng chứng hoặc giới hạn Phase 2.

- **PHASE_02_01_COURSE_CATALOG.md, checkbox 4:** Đạt một phần: có nhãn/target và kiểm tra chữ lớn ở bản đã ghi; TalkBack và Reduce Motion native thủ công chưa có bằng chứng Phase 2, một số thay đổi UI sau đó chưa kiểm tra lại chữ lớn.
- **PHASE_02_02_CLASS_PICKER.md, checkbox 1:** Đạt một phần: UI/ảnh và owner approval đã có; nhật ký đổi bố cục nhãn chọn lớp chưa hoàn tất so sánh geometry hai trạng thái và chưa kiểm tra lại iOS/chữ lớn ở lượt đó. Không ghi toàn bộ thông số/biến thể đã đối chiếu đầy đủ.
- **PHASE_02_04_PAYMENT_QR.md, checkbox 2:** Chưa kiểm tra: chưa có kết quả quét QR backend bằng app ngân hàng/xác minh sandbox. Owner đã duyệt UAT Phase 2 với giới hạn ghi trong API_REVIEW; thanh toán hiện payment-pending, ngoài CI bắt buộc theo owner.
- **PHASE_02_06_API_INTEGRATION.md, checkbox 3:** Chưa kiểm tra: QR backend đã tạo/hiển thị, nhưng chưa có bằng chứng quét bằng app ngân hàng. Giữ giới hạn thanh toán theo API_REVIEW; không dùng CI preview hoặc UAT tổng thể để tick ca này.

## PHASE_03_STUDENT_LEARNING

| File tiêu chí | Đã tick / tổng | Tick bổ sung | Bằng chứng đối chiếu |
| --- | --- | --- | --- |
| [PHASE_03_01_SCHEDULE.md](../IMPLEMENT/PHASE_03_STUDENT_LEARNING/PHASE_03_01_SCHEDULE.md) | 3/3 | 3 | [PROGRESS](PHASE_03_STUDENT_LEARNING/PHASE_03_01_SCHEDULE.md) |
| [PHASE_03_02_ACCOUNT.md](../IMPLEMENT/PHASE_03_STUDENT_LEARNING/PHASE_03_02_ACCOUNT.md) | 3/3 | 3 | [PROGRESS](PHASE_03_STUDENT_LEARNING/PHASE_03_02_ACCOUNT.md) |
| [PHASE_03_03_MY_CLASSES.md](../IMPLEMENT/PHASE_03_STUDENT_LEARNING/PHASE_03_03_MY_CLASSES.md) | 3/3 | 3 | [PROGRESS](PHASE_03_STUDENT_LEARNING/PHASE_03_03_MY_CLASSES.md) |
| [PHASE_03_04_CLASS_DETAIL.md](../IMPLEMENT/PHASE_03_STUDENT_LEARNING/PHASE_03_04_CLASS_DETAIL.md) | 3/3 | 3 | [PROGRESS](PHASE_03_STUDENT_LEARNING/PHASE_03_04_CLASS_DETAIL.md) |
| [PHASE_03_05_NAVIGATION.md](../IMPLEMENT/PHASE_03_STUDENT_LEARNING/PHASE_03_05_NAVIGATION.md) | 2/2 | 2 | [PROGRESS](PHASE_03_STUDENT_LEARNING/PHASE_03_05_NAVIGATION.md) |
| [PHASE_03_06_API_INTEGRATION.md](../IMPLEMENT/PHASE_03_STUDENT_LEARNING/PHASE_03_06_API_INTEGRATION.md) | 3/3 | 0 | [PROGRESS](PHASE_03_STUDENT_LEARNING/PHASE_03_06_API_INTEGRATION.md) |
| [PHASE_03_99_User_Acceptance.md](../IMPLEMENT/PHASE_03_STUDENT_LEARNING/PHASE_03_99_User_Acceptance.md) | 3/3 | 3 | [PROGRESS](PHASE_03_STUDENT_LEARNING/README.md) |
| [README.md](../IMPLEMENT/PHASE_03_STUDENT_LEARNING/README.md) | 6/7 | 6 | [PROGRESS](PHASE_03_STUDENT_LEARNING/README.md) |

Nguồn bổ sung: [API_REVIEW](PHASE_03_STUDENT_LEARNING/API_REVIEW.md), [kiểm tra sau UAT](PHASE_03_STUDENT_LEARNING/POST_UAT_CHECK.md), ảnh/flow 320dp trong nhật ký. FULL/CASH/đổi quyền dùng MSW/fixture khi thiếu dataset; protected detail native đã có bổ sung. Không ghi TalkBack/iOS thủ công hoặc roster đã đạt.

- **README.md, checkbox 3:** Đạt một phần: có native 320dp/font130%/animator0 và nhãn accessibility; chưa đủ bằng chứng kiểm tra toàn bộ target 44x44 và TalkBack thủ công Phase 3. Không suy từ test chức năng thành kiểm tra đọc màn hình đầy đủ.

## Quy trình từ các lượt sau

Áp dụng [docs/README B.7.1](../README.md#b71-đồng-bộ-sau-mỗi-tổng-kết-test-hoặc-ai-review): cùng lượt tổng kết phải cập nhật checklist có bằng chứng, phần chưa kiểm tra, trạng thái sub-phase/phase/roadmap và entry PROGRESS. Mẫu sub-phase có bảng đối chiếu, mẫu entry có trường tiêu chí và đồng bộ.

## Bổ sung sau lượt dọn dẹp Phase 1 cùng ngày

Lượt kiểm tra mới sau dọn mã có 294/294 Jest, lint/format/type-check đạt; Android mới chỉ xác nhận đầy đủ Login/Register, 3 flow mở app/Home/carousel chưa đạt sau chạy lại. Vì vậy README IMPLEMENT Phase 1 hiện **7/9** tiêu chí được tick (bảng 8/9 bên trên là kết quả tại lượt đồng bộ trước), tiêu chí chất lượng tổng hợp chuyển về chưa tick với lý do cụ thể. Phase 1/1.99 vẫn Done theo UAT owner trước đó; không suy ra lỗi chức năng mới từ timeout/màn lỗi kiểm tra phiên. Tiêu chí lịch sử Dọn dẹp/chuyển In review trước UAT và Reduce Motion native giữ nguyên giới hạn. Xem [báo cáo và bằng chứng mới](PHASE_01_AUTH_HOME_UI/POST_UAT_CLEANUP.md).
