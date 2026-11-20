import { z } from 'zod';
import { apiInstances } from '@/config/http/apiInstance.config';
import { dateTime } from '@/modules/home/schemas/homeResponse.schema';
import { ApiError } from '@/shared/utilities/apiError';

const uuid = z.string().uuid();
const fileSchema = z.object({
  id: uuid,
  originalFilename: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number().int().nonnegative(),
  kind: z.string(),
});
export const materialSchema = z.object({
  id: uuid,
  classId: uuid,
  classUnitId: uuid,
  courseUnitId: uuid,
  contentType: z.enum(['ARTICLE', 'FILE', 'VIDEO']),
  title: z.string(),
  description: z.string().nullable(),
  sortOrder: z.number().int(),
  revision: z.number().int().positive(),
  sessionId: uuid.nullable(),
  availableAt: dateTime.nullable(),
  publishedAt: dateTime,
  updatedAt: dateTime,
  file: fileSchema.nullable(),
  attachmentCount: z.number().int().nonnegative(),
});
const detailSchema = materialSchema.extend({
  contentHtml: z.string().nullable(),
  contentSchemaVersion: z.number().int().positive().nullable(),
  inlineImages: z.array(fileSchema),
  attachments: z.array(fileSchema),
});
const pageSchema = z.object({
  items: z.array(materialSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().min(1).max(100),
  total: z.number().int().nonnegative(),
  asOf: dateTime,
});
const accessSchema = z.object({
  materialId: uuid,
  fileId: uuid,
  url: z
    .string()
    .url()
    .refine((raw) => {
      const url = new URL(raw);
      return url.protocol === 'https:' && !url.username && !url.password;
    }),
  expiresAt: dateTime,
});
export type Material = z.infer<typeof materialSchema>;
export type MaterialDetail = z.infer<typeof detailSchema>;
export type MaterialFile = z.infer<typeof fileSchema>;
function invalid(): never {
  throw new ApiError({
    statusCode: 502,
    code: 'INVALID_MATERIAL_RESPONSE',
    message: 'Invalid material response',
  });
}
function parse<S extends z.ZodTypeAny>(
  schema: S,
  response: object
): z.output<S> {
  const parsed = schema.safeParse(response);
  return parsed.success ? parsed.data : invalid();
}
const path = (classId: string, materialId: string) => {
  uuid.parse(classId);
  uuid.parse(materialId);
  return `me/classes/${classId}/materials/${materialId}`;
};

export const materialsService = {
  async list(
    classId: string,
    unitId: string,
    page: number,
    signal?: AbortSignal
  ) {
    uuid.parse(classId);
    uuid.parse(unitId);
    const data = parse(
      pageSchema,
      await apiInstances.service.get<object>(
        `me/classes/${classId}/units/${unitId}/materials`,
        { params: { page, pageSize: 20 }, ...(signal ? { signal } : {}) }
      )
    );
    if (
      data.page !== page ||
      data.items.length > data.pageSize ||
      data.items.some(
        (item) => item.classId !== classId || item.classUnitId !== unitId
      ) ||
      (!data.items.length && data.total > (page - 1) * data.pageSize)
    )
      invalid();
    return data;
  },
  async detail(classId: string, materialId: string, signal?: AbortSignal) {
    const data = parse(
      detailSchema,
      await apiInstances.service.get<object>(
        path(classId, materialId),
        signal ? { signal } : {}
      )
    );
    if (
      data.id !== materialId ||
      data.classId !== classId ||
      (data.contentType === 'ARTICLE'
        ? data.contentHtml === null || data.file !== null
        : !data.file)
    )
      invalid();
    return data;
  },
  // Capabilities are returned directly to the caller, never placed in query/storage caches.
  async download(
    classId: string,
    material: MaterialDetail,
    signal?: AbortSignal
  ) {
    if (!material.file || material.contentType === 'ARTICLE') invalid();
    const data = parse(
      accessSchema,
      await apiInstances.service.get<object>(
        `${path(classId, material.id)}/download`,
        signal ? { signal } : {}
      )
    );
    if (
      data.materialId !== material.id ||
      data.fileId !== material.file.id ||
      Date.parse(data.expiresAt) <= Date.now()
    )
      invalid();
    return data;
  },
  async access(
    classId: string,
    material: MaterialDetail,
    fileId: string,
    signal?: AbortSignal
  ) {
    uuid.parse(fileId);
    const role =
      material.file?.id === fileId
        ? 'PRIMARY'
        : material.inlineImages.some((file) => file.id === fileId)
          ? 'INLINE_IMAGE'
          : material.attachments.some((file) => file.id === fileId)
            ? 'ATTACHMENT'
            : null;
    if (!role) invalid();
    const data = parse(
      accessSchema.extend({
        role: z.enum(['PRIMARY', 'INLINE_IMAGE', 'ATTACHMENT']),
        revision: z.number().int().positive(),
      }),
      await apiInstances.service.post<object, object>(
        `${path(classId, material.id)}/files/${fileId}/access`,
        {},
        signal ? { signal } : {}
      )
    );
    if (
      data.materialId !== material.id ||
      data.fileId !== fileId ||
      data.role !== role ||
      Date.parse(data.expiresAt) <= Date.now()
    )
      invalid();
    if (data.revision !== material.revision)
      throw new ApiError({
        statusCode: 409,
        code: 'MATERIAL_REVISION_CHANGED',
        message: 'Material changed',
      });
    return data;
  },
};
