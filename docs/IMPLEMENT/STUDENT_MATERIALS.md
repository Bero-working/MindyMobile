# Student materials

The mobile implementation follows §17 of `docs/API_CONTRACT/materials.md`.

- Entry point: only the Materials button on session detail (`class-session-materials`, shared component `my-classes/components/MaterialsButton.tsx`), for verified FULL access; it opens that session's unit list (unit-wide and session materials mixed, the API has no session filter). The class detail screen has no materials entry: per-unit rows and the class-level button were removed at the owner's request (2026-11-20) because the API has no class-wide or shared-only materials list.
- `GET me/classes/:classId/units/:classUnitId/materials`: paginated list, refresh, empty and retry states. Uses the class unit ID, not the course unit ID.
- `GET me/classes/:classId/materials/:materialId`: detail with article, file/video metadata and attachments.
- `GET .../download`: fresh primary FILE/VIDEO capability per action. FILE opens through the system browser/file handler; VIDEO also has an inline player.
- `POST .../files/:fileId/access`: inline images and attachments. The shared HTTP client supplies `APP_ORIGIN`; file membership, role and revision are checked before a URL is used.

Article HTML is rebuilt inside an isolated WebView with an element allowlist. API scripts, styles, event handlers and external image URLs are discarded. Images request access when visible. Signed URLs are injected only into the temporary viewer DOM, never into React Query data, persisted HTML or storage. The video player renews access once after a playback error and restores the seek position; inline images also retry once. External file viewers cannot report storage errors back to the app: tapping Open / download again requests a fresh URL.

Queries are scoped to the student and session generation, canceled when inactive, and do not retry automatically. The player unmounts on blur/background. File operations are aborted on leaving the screen, and late responses cannot open a URL. Access denial stops the viewer and invalidates learning data; unavailable materials invalidate the list. Changed revisions or files still processing invalidate detail. Storage failures preserve readable metadata and offer user-driven retry.

Verification uses the real Axios HTTP pipeline with the repository's MSW fixtures, plus native component tests. It covers list/detail navigation, pagination, Origin, fresh download URLs, lazy image access, malformed responses, revision conflicts, revoked access, retry limits and inactive screens. The native WebView and system file handler still need a device smoke test against the deployed backend with a student account and released materials.

## UI danh sách tài liệu (chỉnh theo yêu cầu owner 2026-11-20)

Nguồn: hàng tệp trong sheet "Tài liệu buổi" của `assets/Student Home Page Design/Student Home.dc.html` (ô icon 42 px màu theo loại, tên, dòng phụ). Thay đổi so với bản trước:

- Tiêu đề chương 20 px `text-forest`, dưới là dòng đếm `materials.count` (lấy `total` của trang đầu, ẩn khi 0).
- Mỗi tài liệu là một thẻ bấm được toàn bộ (`MaterialCard`, giữ `testID=material-open-<id>`, role button, nhãn trợ năng "Mở <loại>: <tiêu đề>"), thay cho nút "Xem tài liệu" full-width.
- Thẻ: nền trắng, viền `line`, bo 20, padding 14. Trái: ô 48 px bo 14 theo loại — ARTICLE `cover-a-soft` + icon sách `forest`; FILE `peach` + icon tài liệu `coral`; VIDEO `cream` + icon play `status-yellow`. Giữa: nhãn loại in hoa 12 px `mint`, tiêu đề 16 px tối đa 2 dòng, mô tả 13 px `muted` tối đa 2 dòng, dòng phụ tên tệp · dung lượng (B/KB/MB) và số tệp đính kèm khi có. Phải: nút tròn 32 px `soft` có mũi tên.
- Trạng thái loading/empty/lỗi/xem thêm giữ nguyên.

WebView viewer must not set `incognito`: on Android it calls `CookieManager.removeAllCookies`, and that CookieManager is shared with the React Native HTTP client, so it wipes the HttpOnly `access_token`/`refresh_token` cookies and signs the student out (fixed 2026-11-20). Isolation relies on disabled cache, DOM storage and third-party cookies plus blocked navigation.
