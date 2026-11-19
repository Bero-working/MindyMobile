import type { Assignment } from '@/modules/assignments/assignments.service';
import type { Quiz, ZipSubmission } from '@/modules/assignments/work.service';
import { commerceId as id } from './commerce';

export const assignment: Assignment = {
  id: id(700),
  sessionId: id(701),
  type: 'QUIZ',
  purpose: 'HOMEWORK',
  title: 'Thực hành JavaScript',
  description: 'Hoàn thành bài tập',
  maxScore: '10.00',
  dueAt: null,
  timeLimitMinutes: 15,
  maxAttempts: 3,
  status: 'PUBLISHED',
  revision: 1,
  instructionFiles: [],
  capabilities: { zipMutationsEnabled: true, instructionFilesEnabled: true },
};
export const quiz: Quiz = {
  attemptId: id(702),
  assignmentId: assignment.id,
  version: 0,
  status: 'IN_PROGRESS',
  serverNow: '2026-11-09T10:00:00Z',
  expiresAt: '2026-11-09T10:15:00Z',
  questions: [
    {
      id: id(703),
      position: 1,
      prompt: '1 + 1 = ?',
      options: [
        { label: 'A', text: '2' },
        { label: 'B', text: '3' },
      ],
    },
  ],
  answers: [],
  result: null,
  retryAfterSeconds: null,
};
export const quizResult = {
  score: '10.00',
  maxScore: '10.00',
  correctCount: 1,
  totalQuestions: 1,
  results: [
    {
      questionId: id(703),
      selectedOption: 'A' as const,
      correctOption: 'A' as const,
      isCorrect: true,
    },
  ],
};
export const codeDetail = {
  assignmentId: assignment.id,
  sessionId: assignment.sessionId,
  title: assignment.title,
  canSubmit: true,
  deadlinePassed: false,
  attemptsRemaining: 3,
  bestScore: null,
  inFlightSubmissionId: null,
  problem: {
    statementMd: 'Tính tổng hai số',
    constraintsMd: '0 <= a, b <= 100',
  },
  languages: [
    {
      key: 'javascript',
      displayName: 'JavaScript',
      starterCode: 'function sum(a,b) {}',
    },
  ],
  samples: [
    { position: 1, display: 'a = 1, b = 1', expected: 2, explanationMd: null },
  ],
};
export const codeSubmission = {
  id: id(704),
  assignmentId: assignment.id,
  status: 'QUEUED',
  score: null,
  maxScore: '10.00',
  verdict: null,
  compileOutput: null,
  retryAfterMs: 1000,
  passedCount: null,
  totalCount: null,
};
export const zipDraft: ZipSubmission = {
  id: id(705),
  assignmentId: assignment.id,
  version: 0,
  status: 'DRAFT',
  file: null,
  grade: null,
};
export const zipFile = {
  id: id(706),
  originalFilename: 'homework.zip',
  sizeBytes: 1024,
};
