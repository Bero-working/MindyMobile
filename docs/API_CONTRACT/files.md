# API contract: Files

Upload file private qua signed URL (§15). Đọc khi làm upload cho tài liệu (Mentor/Manager).

> Số mục (§) giữ nguyên theo contract gốc để tham chiếu chéo vẫn tra được. Mục nào nằm ở file nào: xem
> [bảng đối chiếu](README.md#bảng-đối-chiếu-mục-cũ-sang-file-mới). Quy ước chung (cookie, header `Origin`,
> format lỗi, `Idempotency-Key`, polling): [README.md](README.md).

---

## 15. Files: upload private

Role **MANAGER** hoặc **MENTOR** (ADMIN/STUDENT bị 403). Cần storage bật (`MINIO_ENABLED=true`).
Chi tiết: breakdown 3.2 (repo BE: `docs/api_flow/PHASE_3_2_flow-api-breakdown.md`). Responses `Cache-Control: no-store`.

### Quy trình

```
POST /files/upload-intents  → { fileId, uploadUrl, requiredHeaders, ... }
PUT  uploadUrl (MinIO, raw bytes)
POST /files/:fileId/complete → 202 PROCESSING | 200 READY
GET  /files/:fileId (poll 2–3s) → READY | FAILED
```

### 15.1 POST `/api/v1/files/upload-intents` — 201

| Field | Rule |
|---|---|
| `courseUnitId` | UUID v4, bắt buộc (Course Unit, không phải classUnitId) |
| `classId`, `classUnitId` | **Bắt buộc với Mentor** (cặp lớp + chương được phân công). Manager có thể bỏ; nếu gửi phải đủ cặp và khớp |
| `originalFilename` | 1–250, không `/`, ký tự điều khiển, khoảng trắng đầu/cuối |
| `declaredMimeType` | 1–150, thuộc allowlist |
| `declaredSizeBytes` | integer dương = `file.size` (bytes) |

```json
{
  "fileId": "22222222-2222-4222-8222-222222222222",
  "uploadUrl": "https://storage.example.test/<signed-path-and-query>",
  "requiredHeaders": { "content-type": "application/pdf" },
  "uploadUrlExpiresAt": "2026-10-10T14:10:00.000Z",
  "intentExpiresAt": "2026-10-10T14:30:00.000Z"
}
```

Mặc định URL PUT sống 10 phút, intent 30 phút (dùng timestamp trong response, không hardcode). Tối đa
20 intent đang mở/PROCESSING mỗi người → 429 `FILE_UPLOAD_QUOTA_EXCEEDED`. Disable nút trong lúc gọi.

**Allowlist**: PDF `application/pdf`; PNG `image/png`; JPG/JPEG `image/jpeg`; DOCX/PPTX/XLSX (MIME Office);
MP3 `audio/mpeg`; MP4 `video/mp4`; text/source `txt md csv json js ts py java c cpp h css sql`
(MIME `text/plain`, `text/markdown`, `text/csv`, `application/json`, `text/javascript`,
`application/javascript`, `text/css`). Tối đa **25 MiB**, riêng MP4 **200 MiB**. Không nhận file rỗng.
`file.type` của browser có thể rỗng → FE tự map MIME theo extension. Server luôn kiểm binary thật.

### 15.2 PUT `uploadUrl` — gửi trực tiếp tới storage

```js
const res = await fetch(intent.uploadUrl, {
  method: 'PUT',
  headers: intent.requiredHeaders,
  body: file,            // raw File/Blob — không FormData/base64
  credentials: 'omit',   // không gửi cookie BE tới storage
});
if (!res.ok) throw new Error(`Storage upload failed: ${res.status}`);
```

Muốn % tiến độ → dùng XHR/Axios `onUploadProgress`. Lỗi ở bước này là lỗi storage (CORS/TLS/XML S3),
không phải error envelope của BE. 403 thường do URL hết hạn hoặc sai header. URL hết hạn → tạo intent mới.

### 15.3 POST `/api/v1/files/:fileId/complete` — 202 hoặc 200

Body `{}`. **Chỉ gọi sau khi PUT thành công.** 202 = đã nhận, đang kiểm tra (chưa hợp lệ); 200 = đã READY.
Gọi lặp không tạo job trùng. Mất response → GET status trước, chỉ POST lại nếu vẫn `PENDING_UPLOAD`.
409 `UPLOAD_EXPIRED` (intent hết hạn), `UPLOAD_FAILED`/`FILE_DELETED` (terminal).

### 15.4 GET `/api/v1/files/:fileId` — 200 `FileStatusDto`

```json
{
  "id": "22222222-2222-4222-8222-222222222222",
  "status": "READY",
  "originalFilename": "lesson.pdf",
  "courseUnitId": "11111111-1111-4111-8111-111111111111",
  "declaredSizeBytes": 128000,
  "sizeBytes": 128000,
  "mimeType": "application/pdf",
  "kind": "PDF",
  "intentExpiresAt": "2026-10-10T14:30:00.000Z",
  "readyAt": "2026-10-10T14:01:00.000Z",
  "metadataStatus": "PENDING",
  "errorCode": null
}
```

(Intent trả `fileId`, status trả `id` — cùng một file.)

| status | FE |
|---|---|
| `PENDING_UPLOAD` | Chưa complete |
| `PROCESSING` | "Đang kiểm tra file", poll 2–3s, không chồng request |
| `READY` | Dừng poll, lưu `fileId` để gắn vào Material. `metadataStatus=PENDING` không cản trở |
| `FAILED` | Dừng poll, hiện `errorCode`; upload lại = **intent mới** |
| `DELETED` | Dừng |

Không có API list/xoá/tải file ở module Files. Tải/xem file đi qua Materials (§17).

### 15.5 Lỗi Files

401, 403 `INSUFFICIENT_ROLE`, 403 `MATERIAL_ACCESS_DENIED` (assignment không đủ), 404 `FILE_NOT_FOUND`/
`CLASS_NOT_FOUND`/`CLASS_UNIT_NOT_FOUND`, 422 `MATERIAL_SCOPE_MISMATCH` (classUnitId không trỏ courseUnitId),
422 `MATERIAL_CONTENT_INVALID` (tên/MIME/size), 429 quota, 503 `FILE_STORAGE_DISABLED`/`FILE_STORAGE_UNAVAILABLE`.
