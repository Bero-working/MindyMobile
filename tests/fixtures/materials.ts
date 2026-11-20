import type { MaterialDetail } from '@/modules/materials/materials.service';
import { commerceId } from './commerce';

export const materialFile = {
  id: commerceId(805),
  originalFilename: 'lesson.pdf',
  mimeType: 'application/pdf',
  sizeBytes: 4096,
  kind: 'PDF',
};
export const material: MaterialDetail = {
  id: commerceId(800),
  classId: commerceId(1),
  classUnitId: commerceId(801),
  courseUnitId: commerceId(802),
  contentType: 'FILE',
  title: 'Tài liệu React',
  description: 'Bài đọc chương React',
  sortOrder: 0,
  revision: 1,
  sessionId: null,
  availableAt: null,
  publishedAt: '2026-10-12T08:00:00Z',
  updatedAt: '2026-10-12T08:00:00Z',
  file: materialFile,
  attachmentCount: 0,
  contentHtml: null,
  contentSchemaVersion: null,
  inlineImages: [],
  attachments: [],
};
export const materialAccess = (fileId = materialFile.id) => ({
  materialId: material.id,
  fileId,
  url: 'https://storage.example.test/private/lesson?signature=temporary',
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
});
