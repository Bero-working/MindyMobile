import { z } from 'zod';
import { apiInstances } from '@/config/http/apiInstance.config';
import { env } from '@/config/env';
import { ApiError } from '@/shared/utilities/apiError';
import { assignmentSchema } from './assignments.service';

const uuid = z.string().uuid();
const version = z.number().int().nonnegative();
const option = z.enum(['A', 'B', 'C', 'D']);
export const answerSchema = z.object({
  questionId: uuid,
  selectedOption: option,
});
const resultSchema = z.object({
  score: z.string(),
  maxScore: z.string(),
  correctCount: version,
  totalQuestions: version,
  results: z.array(
    z.object({
      questionId: uuid,
      selectedOption: option.nullable(),
      correctOption: option,
      isCorrect: z.boolean(),
    })
  ),
});
export const quizSchema = z.object({
  attemptId: uuid,
  assignmentId: uuid,
  version,
  status: z.enum(['IN_PROGRESS', 'FINALIZING', 'GRADED', 'VOIDED']),
  serverNow: z.string().datetime({ offset: true }),
  expiresAt: z.string().datetime({ offset: true }).nullable(),
  questions: z.array(
    z.object({
      id: uuid,
      position: version,
      prompt: z.string(),
      options: z.array(z.object({ label: option, text: z.string() })),
    })
  ),
  answers: z.array(answerSchema),
  result: resultSchema.nullable(),
  retryAfterSeconds: z.number().positive().nullable(),
});
export type Quiz = z.infer<typeof quizSchema>;
export type Answer = z.infer<typeof answerSchema>;
const fileSchema = z.object({
  id: uuid,
  originalFilename: z.string(),
  sizeBytes: version,
});
export const zipSchema = z.object({
  id: uuid,
  assignmentId: uuid,
  version,
  attemptNumber: version.nullable().optional(),
  snapshot: z.object({ maxScore: z.string() }).nullable().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'VOIDED']),
  file: fileSchema.nullable(),
  grade: z.object({ score: z.string(), feedback: z.string() }).nullable(),
});
export type ZipSubmission = z.infer<typeof zipSchema>;
const fileStatusSchema = fileSchema.extend({
  status: z.enum([
    'PENDING_UPLOAD',
    'PROCESSING',
    'READY',
    'FAILED',
    'DELETING',
    'DELETED',
  ]),
  version,
});
export const uploadSchema = fileStatusSchema.extend({
  fileId: uuid,
  uploadUrl: z.string().url(),
  requiredHeaders: z.record(z.string()),
});
export type Upload = z.infer<typeof uploadSchema>;
const language = z.enum(['javascript', 'java21']);
export type Language = z.infer<typeof language>;
export const codeSchema = z.object({
  assignmentId: uuid,
  sessionId: uuid,
  title: z.string(),
  canSubmit: z.boolean(),
  deadlinePassed: z.boolean(),
  attemptsRemaining: version,
  bestScore: z.string().nullable(),
  inFlightSubmissionId: uuid.nullable(),
  problem: z.object({ statementMd: z.string(), constraintsMd: z.string() }),
  languages: z
    .array(
      z.object({
        key: language,
        displayName: z.string(),
        starterCode: z.string(),
      })
    )
    .min(1),
  samples: z.array(
    z.object({
      position: version,
      display: z.string(),
      expected: z.unknown(),
      explanationMd: z.string().nullable(),
    })
  ),
});
export const draftSchema = z.object({
  languageKey: language,
  sourceCode: z.string(),
  version,
});
export const codeSubmissionSchema = z.object({
  id: uuid,
  assignmentId: uuid,
  attemptNumber: version.optional(),
  status: z.enum(['QUEUED', 'RUNNING', 'GRADED', 'FAILED', 'VOIDED']),
  score: z.string().nullable(),
  maxScore: z.string(),
  verdict: z.string().nullable(),
  compileOutput: z.string().nullable(),
  retryAfterMs: z.number().positive().nullable(),
  passedCount: version.nullable(),
  totalCount: version.nullable(),
});
const runSchema = z.object({
  compileStatus: z.string(),
  compileOutput: z.string(),
  tests: z.array(
    z.object({
      display: z.string(),
      status: z.string(),
      expected: z.unknown().optional(),
      actual: z.unknown(),
      console: z.string(),
      stderr: z.string(),
    })
  ),
});
export type CodeRun = z.infer<typeof runSchema>;
export type CodeSubmission = z.infer<typeof codeSubmissionSchema>;
const historySchema = z.object({
  items: z.array(
    z.union([
      zipSchema,
      z.object({
        type: z.literal('QUIZ'),
        id: uuid,
        assignmentId: uuid,
        result: resultSchema.nullable(),
      }),
    ])
  ),
  total: version,
});

export function parseWork<S extends z.ZodTypeAny>(
  schema: S,
  response: object
): z.output<S> {
  const parsed = schema.safeParse(response);
  if (!parsed.success)
    throw new ApiError({
      statusCode: 502,
      code: 'INVALID_ASSIGNMENT_RESPONSE',
      message: 'Invalid assignment response',
    });
  return parsed.data;
}
export function mutationConfig(key?: string) {
  if (!env.APP_ORIGIN)
    throw new ApiError({
      statusCode: 0,
      code: 'APP_ORIGIN_REQUIRED',
      message: 'APP_ORIGIN is required',
    });
  return {
    headers: {
      Origin: env.APP_ORIGIN,
      ...(key ? { 'Idempotency-Key': key } : {}),
    },
  };
}
async function read<S extends z.ZodTypeAny>(
  path: string,
  schema: S,
  signal?: AbortSignal
): Promise<z.output<S>> {
  return parseWork(
    schema,
    await apiInstances.service.get<object>(path, signal ? { signal } : {})
  );
}
async function write<S extends z.ZodTypeAny>(
  path: string,
  body: object,
  schema: S,
  key?: string,
  put = false
): Promise<z.output<S>> {
  const config = mutationConfig(key);
  return parseWork(
    schema,
    put
      ? await apiInstances.service.put<object, object>(path, body, config)
      : await apiInstances.service.post<object, object>(path, body, config)
  );
}
export const workService = {
  download: (id: string, signal?: AbortSignal) =>
    read(
      `assignment-files/${id}/download`,
      z.object({ url: z.string().url() }),
      signal
    ),
  detail: (id: string, signal?: AbortSignal) =>
    read(`me/assignments/${id}`, assignmentSchema, signal),
  history: (id: string, signal?: AbortSignal) =>
    read(
      `me/assignments/${id}/submissions?page=1&pageSize=100`,
      historySchema,
      signal
    ),
  startQuiz: (id: string, revision: number, key: string) =>
    write(
      `me/assignments/${id}/start`,
      { expectedAssignmentRevision: revision },
      quizSchema,
      key
    ),
  async quiz(id: string, signal?: AbortSignal) {
    const quiz = await read(
      `me/assignment-submissions/${id}`,
      quizSchema,
      signal
    );
    return quiz.status === 'GRADED'
      ? read(`me/assignment-submissions/${id}/result`, quizSchema, signal)
      : quiz;
  },
  answers: (quiz: Quiz, answers: Answer[], key: string, submit = false) =>
    write(
      `me/assignment-submissions/${quiz.attemptId}/${submit ? 'submit' : 'answers'}`,
      { expectedVersion: quiz.version, answers },
      quizSchema,
      key,
      !submit
    ),
  code: (id: string, signal?: AbortSignal) =>
    read(`me/assignments/${id}/code`, codeSchema, signal),
  draft: (id: string, lang: Language, signal?: AbortSignal) =>
    read(`me/assignments/${id}/code-drafts/${lang}`, draftSchema, signal),
  saveCode: (
    id: string,
    lang: Language,
    sourceCode: string,
    expectedVersion: number
  ) =>
    write(
      `me/assignments/${id}/code-drafts/${lang}`,
      { sourceCode, expectedVersion },
      draftSchema,
      undefined,
      true
    ),
  run: (id: string, languageKey: Language, sourceCode: string) =>
    write(
      `me/assignments/${id}/code-runs`,
      { languageKey, sourceCode },
      runSchema
    ),
  submitCode: (
    id: string,
    languageKey: Language,
    sourceCode: string,
    key: string
  ) =>
    write(
      `me/assignments/${id}/code-submissions`,
      { languageKey, sourceCode },
      codeSubmissionSchema,
      key
    ),
  codeResult: (id: string, signal?: AbortSignal) =>
    read(`me/code-submissions/${id}`, codeSubmissionSchema, signal),
  codeHistory: (id: string, signal?: AbortSignal) =>
    read(
      `me/assignments/${id}/code-submissions`,
      z.object({ items: z.array(codeSubmissionSchema) }),
      signal
    ),
  zip: (id: string, signal?: AbortSignal) =>
    read(`me/zip-submissions/${id}`, zipSchema, signal),
  zipDraft: (id: string, revision: number, key: string) =>
    write(
      `me/assignments/${id}/zip-submissions`,
      { expectedAssignmentRevision: revision },
      zipSchema,
      key
    ),
  uploadIntent: (
    draft: ZipSubmission,
    name: string,
    size: number,
    key: string
  ) =>
    write(
      `me/zip-submissions/${draft.id}/upload-intents`,
      {
        expectedVersion: draft.version,
        originalFilename: name,
        declaredMimeType: 'application/zip',
        declaredSizeBytes: size,
      },
      uploadSchema,
      key
    ),
  completeFile: (file: Upload, key: string) =>
    write(
      `assignment-files/${file.fileId}/complete`,
      { expectedVersion: file.version },
      fileStatusSchema,
      key
    ),
  fileStatus: (id: string, signal?: AbortSignal) =>
    read(`assignment-files/${id}`, fileStatusSchema, signal),
  attachZip: (draft: ZipSubmission, fileId: string, key: string) =>
    write(
      `me/zip-submissions/${draft.id}/file`,
      { expectedVersion: draft.version, fileId },
      zipSchema,
      key,
      true
    ),
  submitZip: (draft: ZipSubmission, key: string) =>
    write(
      `me/zip-submissions/${draft.id}/submit`,
      { expectedVersion: draft.version },
      zipSchema,
      key
    ),
};

export async function uploadZipBytes(intent: Upload, uri: string) {
  const url = new URL(intent.uploadUrl);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error('Invalid upload URL');
  const local = await fetch(uri);
  const blob = await local.blob();
  const response = await fetch(intent.uploadUrl, {
    method: 'PUT',
    headers: intent.requiredHeaders,
    body: blob,
    credentials: 'omit',
  });
  if (!response.ok) throw new Error('Upload failed');
}
