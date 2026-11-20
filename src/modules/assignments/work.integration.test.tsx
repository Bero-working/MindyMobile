import '../../../tests/mocks/nativeUi';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Alert, AppState } from 'react-native';
import { http, HttpResponse } from 'msw';
import { pick, keepLocalCopy } from '@react-native-documents/picker';
import { mockServer } from '../../../tests/mocks/server';
import { TEST_API_URL as base } from '../../../tests/mocks/constants';
import { renderWithProviders } from '../../../tests/utils/renderWithProviders';
import {
  assignment,
  quiz,
  quizResult,
  codeDetail,
  codeSubmission,
  zipDraft,
  zipFile,
} from '../../../tests/fixtures/assignments';
import { student, commerceId } from '../../../tests/fixtures/commerce';
import { useStore } from '@/state/store';
import '@/config/i18n.config';
import { QuizWork, quizRemaining } from './QuizWork';
import { CodeWork } from './CodeWork';
import { ZipWork, validZip } from './ZipWork';
import { SessionAssignments } from './SessionAssignments';
import { AssignmentWorkRoute } from './AssignmentWorkRoute';
import type { Quiz } from './work.service';

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
type RemoveEvent = {
  preventDefault: () => void;
  data: { action: { type: string } };
};
const mockAddListener = jest.fn(
  (_name: string, _listener: (event: RemoveEvent) => void) => jest.fn()
);
const mockDirty = jest.fn();
let mockFocused = true;
jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => mockFocused,
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
    dispatch: mockDispatch,
    addListener: mockAddListener,
  }),
  useRoute: () => ({
    params: { assignmentId: '22222222-2222-4222-8222-000000000700' },
  }),
}));
jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(),
  keepLocalCopy: jest.fn(),
  isErrorWithCode: () => false,
  errorCodes: { OPERATION_CANCELED: 'cancelled' },
  types: { zip: 'application/zip' },
}));

beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  jest.clearAllMocks();
  mockFocused = true;
  AppState.currentState = 'active';
  useStore.setState({
    sessionUser: student,
    bootstrapStatus: 'ready',
    generation: 10,
  });
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  mockServer.use(
    http.get(base + '/me/assignments/:id/submissions', () =>
      HttpResponse.json({ items: [], total: 0 })
    )
  );
});
afterEach(() => {
  mockServer.resetHandlers();
  jest.restoreAllMocks();
});
afterAll(() => mockServer.close());
function confirm() {
  const buttons = jest.mocked(Alert.alert).mock.calls.at(-1)?.[2];
  act(() => {
    buttons?.find((button) => button.style !== 'cancel')?.onPress?.();
  });
}

it('opens an assignment inside the app from the selected session', async () => {
  mockServer.use(
    http.get(base + '/me/classes/:id/assignments', ({ request }) => {
      expect(new URL(request.url).searchParams.get('sessionId')).toBe(
        assignment.sessionId
      );
      return HttpResponse.json({
        items: [assignment],
        page: 1,
        pageSize: 20,
        total: 1,
      });
    })
  );
  renderWithProviders(
    <SessionAssignments
      classId={commerceId(1)}
      sessionId={assignment.sessionId}
      timeZone="Asia/Ho_Chi_Minh"
    />
  );
  fireEvent.press(
    await screen.findByTestId(`assignment-open-${assignment.id}`)
  );
  expect(mockNavigate).toHaveBeenCalledWith('STUDENT_ASSIGNMENT', {
    assignmentId: assignment.id,
  });
});

it('splits session assignments into Code and Quiz tabs', async () => {
  const code = {
    ...assignment,
    id: commerceId(790),
    type: 'CODE' as const,
    title: 'Tổng hai số',
  };
  mockServer.use(
    http.get(base + '/me/classes/:id/assignments', () =>
      HttpResponse.json({
        items: [assignment, code],
        page: 1,
        pageSize: 20,
        total: 2,
      })
    )
  );
  renderWithProviders(
    <SessionAssignments
      classId={commerceId(1)}
      sessionId={assignment.sessionId}
      timeZone="Asia/Ho_Chi_Minh"
    />
  );
  const codeTab = await screen.findByTestId('assignment-tab-CODE');
  expect(codeTab.props.accessibilityState).toMatchObject({ selected: true });
  expect(screen.getByTestId(`assignment-open-${code.id}`)).toBeTruthy();
  expect(screen.queryByTestId(`assignment-open-${assignment.id}`)).toBeNull();
  expect(screen.queryByTestId('assignment-tab-ZIP')).toBeNull();
  fireEvent.press(screen.getByTestId('assignment-tab-QUIZ'));
  expect(screen.getByTestId(`assignment-open-${assignment.id}`)).toBeTruthy();
  expect(screen.queryByTestId(`assignment-open-${code.id}`)).toBeNull();
});

it('shows an empty state for a tab without assignments', async () => {
  mockServer.use(
    http.get(base + '/me/classes/:id/assignments', () =>
      HttpResponse.json({
        items: [assignment],
        page: 1,
        pageSize: 20,
        total: 1,
      })
    )
  );
  renderWithProviders(
    <SessionAssignments
      classId={commerceId(1)}
      sessionId={assignment.sessionId}
      timeZone="Asia/Ho_Chi_Minh"
    />
  );
  // Opens on the first tab that has work.
  expect(
    (await screen.findByTestId('assignment-tab-QUIZ')).props.accessibilityState
  ).toMatchObject({ selected: true });
  fireEvent.press(screen.getByTestId('assignment-tab-CODE'));
  expect(screen.getByTestId('assignment-tab-empty')).toBeTruthy();
});

it('starts, autosaves a full answer set and retries an uncertain submit with the same receipt', async () => {
  let current = { ...quiz };
  const receipts: (string | null)[] = [];
  const bodies: object[] = [];
  mockServer.use(
    http.post(base + '/me/assignments/:id/start', ({ request }) => {
      expect(request.headers.get('Origin')).toBe('https://mobile.mindy.test');
      expect(request.headers.get('Idempotency-Key')).toMatch(/^[0-9a-f-]{36}$/);
      return HttpResponse.json(current);
    }),
    http.get(base + '/me/assignment-submissions/:id', () =>
      HttpResponse.json(current)
    ),
    http.put(
      base + '/me/assignment-submissions/:id/answers',
      async ({ request }) => {
        const input = (await request.json()) as {
          expectedVersion: number;
          answers: Quiz['answers'];
        };
        expect(input.expectedVersion).toBe(0);
        current = { ...current, answers: input.answers, version: 1 };
        return HttpResponse.json(current);
      }
    ),
    http.post(
      base + '/me/assignment-submissions/:id/submit',
      async ({ request }) => {
        receipts.push(request.headers.get('Idempotency-Key'));
        bodies.push((await request.json()) as object);
        if (receipts.length === 1)
          return HttpResponse.json(
            { statusCode: 503, code: 'UNAVAILABLE', message: 'Retry' },
            { status: 503 }
          );
        current = { ...current, status: 'GRADED', result: quizResult };
        return HttpResponse.json(current);
      }
    ),
    http.get(base + '/me/assignment-submissions/:id/result', () =>
      HttpResponse.json(current)
    )
  );
  renderWithProviders(
    <QuizWork
      assignment={assignment}
      onDirty={mockDirty}
    />
  );
  fireEvent.press(await screen.findByTestId('quiz-start'));
  const option = await screen.findByTestId('quiz-option-0-A');
  await waitFor(() =>
    expect(option.props.accessibilityState.disabled).toBe(false)
  );
  fireEvent.press(option);
  await waitFor(
    () =>
      expect(current.answers).toEqual([
        { questionId: commerceId(703), selectedOption: 'A' },
      ]),
    { timeout: 3000 }
  );
  await waitFor(() =>
    expect(
      screen.getByTestId('quiz-submit').props.accessibilityState.disabled
    ).toBe(false)
  );
  fireEvent.press(screen.getByTestId('quiz-submit'));
  expect(receipts).toHaveLength(0);
  confirm();
  fireEvent.press(await screen.findByText('Thử lại'));
  await screen.findByText('Điểm: 10.00 / 10.00');
  expect(receipts).toHaveLength(2);
  expect(receipts[0]).toBe(receipts[1]);
  expect(bodies[0]).toEqual(bodies[1]);
  expect(mockDirty).toHaveBeenLastCalledWith(false);
});

it('uses elapsed time against the server clock', () => {
  expect(quizRemaining(quiz, 1000, 2000)).toBe(899);
  expect(quizRemaining(quiz, 1000, 901001)).toBe(0);
  expect(quizRemaining({ ...quiz, expiresAt: null }, 0, 5000)).toBeNull();
});

it('resumes saved answers from the server without restarting the clock', async () => {
  const resumed = {
    ...quiz,
    version: 2,
    answers: [{ questionId: commerceId(703), selectedOption: 'B' as const }],
    serverNow: '2026-11-09T10:10:00Z',
  };
  mockServer.use(
    http.post(base + '/me/assignments/:id/start', () =>
      HttpResponse.json(resumed)
    ),
    http.get(base + '/me/assignment-submissions/:id', () =>
      HttpResponse.json(resumed)
    )
  );
  renderWithProviders(
    <QuizWork
      assignment={assignment}
      onDirty={mockDirty}
    />
  );
  fireEvent.press(await screen.findByTestId('quiz-start'));
  await waitFor(() =>
    expect(
      screen.getByTestId('quiz-option-0-B').props.accessibilityState.checked
    ).toBe(true)
  );
  expect(screen.getByTestId('quiz-timer').props.children.join('')).toBe(
    '05:00'
  );
});

it('requires confirmation to leave an editor with unsaved answers', async () => {
  mockServer.use(
    http.get(base + '/me/assignments/:id', () => HttpResponse.json(assignment)),
    http.post(base + '/me/assignments/:id/start', () =>
      HttpResponse.json(quiz)
    ),
    http.get(base + '/me/assignment-submissions/:id', () =>
      HttpResponse.json(quiz)
    )
  );
  renderWithProviders(<AssignmentWorkRoute />);
  fireEvent.press(await screen.findByTestId('quiz-start'));
  await waitFor(() =>
    expect(
      screen.getByTestId('quiz-option-0-A').props.accessibilityState.disabled
    ).toBe(false)
  );
  fireEvent.press(screen.getByTestId('quiz-option-0-A'));
  const event = {
    preventDefault: jest.fn(),
    data: { action: { type: 'GO_BACK' } },
  };
  act(() => {
    mockAddListener.mock.calls.at(-1)?.[1](event);
  });
  expect(event.preventDefault).toHaveBeenCalled();
  expect(mockDispatch).not.toHaveBeenCalled();
  confirm();
  expect(mockDispatch).toHaveBeenCalledWith(event.data.action);
});

it('blocks edits after timeout and reads the server result without a late answer write', async () => {
  let reads = 0;
  let writes = 0;
  const expired = { ...quiz, serverNow: quiz.expiresAt ?? quiz.serverNow };
  mockServer.use(
    http.post(base + '/me/assignments/:id/start', () =>
      HttpResponse.json(expired)
    ),
    http.get(base + '/me/assignment-submissions/:id', () => {
      reads++;
      return HttpResponse.json(
        reads < 2
          ? expired
          : { ...expired, status: 'GRADED', result: quizResult }
      );
    }),
    http.get(base + '/me/assignment-submissions/:id/result', () =>
      HttpResponse.json({ ...expired, status: 'GRADED', result: quizResult })
    ),
    http.post(base + '/me/assignment-submissions/:id/submit', () => {
      writes++;
      return HttpResponse.json(expired);
    })
  );
  renderWithProviders(
    <QuizWork
      assignment={assignment}
      onDirty={mockDirty}
    />
  );
  fireEvent.press(await screen.findByTestId('quiz-start'));
  await waitFor(() =>
    expect(
      screen.getByTestId('quiz-option-0-A').props.accessibilityState.disabled
    ).toBe(true)
  );
  await screen.findByText('Điểm: 10.00 / 10.00', {}, { timeout: 5000 });
  expect(writes).toBe(0);
});

it('marks a wrong pick red, the right option green and names the answer', async () => {
  const questionId = quiz.questions[0]?.id ?? '';
  const graded = {
    ...quiz,
    status: 'GRADED',
    answers: [{ questionId, selectedOption: 'B' }],
    result: {
      ...quizResult,
      score: '0.00',
      correctCount: 0,
      results: [
        {
          questionId,
          selectedOption: 'B',
          correctOption: 'A',
          isCorrect: false,
        },
      ],
    },
  };
  mockServer.use(
    http.post(base + '/me/assignments/:id/start', () =>
      HttpResponse.json(graded)
    ),
    http.get(base + '/me/assignment-submissions/:id', () =>
      HttpResponse.json(graded)
    ),
    http.get(base + '/me/assignment-submissions/:id/result', () =>
      HttpResponse.json(graded)
    )
  );
  renderWithProviders(
    <QuizWork
      assignment={assignment}
      onDirty={mockDirty}
    />
  );
  fireEvent.press(await screen.findByTestId('quiz-start'));
  expect(await screen.findByText('Đáp án đúng: A. 2')).toBeTruthy();
  expect(screen.getByTestId('quiz-option-0-B').props.accessibilityLabel).toBe(
    'B. 3, bạn chọn, sai'
  );
  expect(screen.getByTestId('quiz-option-0-A').props.accessibilityLabel).toBe(
    'A. 2, đáp án đúng'
  );
});

it('keeps ZIP writes disabled when the server turns off uploads', async () => {
  renderWithProviders(
    <ZipWork
      assignment={{
        ...assignment,
        type: 'ZIP',
        capabilities: {
          zipMutationsEnabled: false,
          instructionFilesEnabled: false,
        },
      }}
      onDirty={mockDirty}
    />
  );
  expect(
    screen.getByTestId('zip-start').props.accessibilityState.disabled
  ).toBe(true);
  expect(pick).not.toHaveBeenCalled();
});

it('saves code, runs samples and polls a submitted program to its graded result', async () => {
  let source = 'function sum(a,b) {}';
  let submitted = false;
  let polls = 0;
  mockServer.use(
    http.get(base + '/me/assignments/:id/code', () =>
      HttpResponse.json(codeDetail)
    ),
    http.get(base + '/me/assignments/:id/code-submissions', () =>
      HttpResponse.json({ items: submitted ? [codeSubmission] : [] })
    ),
    http.get(base + '/me/assignments/:id/code-drafts/:language', () =>
      HttpResponse.json({
        languageKey: 'javascript',
        sourceCode: source,
        version: 0,
      })
    ),
    http.put(
      base + '/me/assignments/:id/code-drafts/:language',
      async ({ request }) => {
        const body = (await request.json()) as {
          sourceCode: string;
          expectedVersion: number;
        };
        source = body.sourceCode;
        return HttpResponse.json({
          languageKey: 'javascript',
          sourceCode: source,
          version: body.expectedVersion + 1,
        });
      }
    ),
    http.post(base + '/me/assignments/:id/code-runs', () =>
      HttpResponse.json({
        compileStatus: 'OK',
        compileOutput: '',
        tests: [
          {
            display: '1 + 1',
            status: 'PASSED',
            expected: 2,
            actual: 2,
            console: '',
            stderr: '',
          },
        ],
      })
    ),
    http.post(
      base + '/me/assignments/:id/code-submissions',
      async ({ request }) => {
        expect(await request.json()).toEqual({
          languageKey: 'javascript',
          sourceCode: source,
        });
        expect(request.headers.get('Idempotency-Key')).toBeTruthy();
        submitted = true;
        return HttpResponse.json(codeSubmission, { status: 202 });
      }
    ),
    http.get(base + '/me/code-submissions/:id', () => {
      polls++;
      return HttpResponse.json(
        polls < 2
          ? codeSubmission
          : {
              ...codeSubmission,
              status: 'GRADED',
              score: '10.00',
              passedCount: 2,
              totalCount: 2,
              retryAfterMs: null,
            }
      );
    })
  );
  renderWithProviders(
    <CodeWork
      assignment={{ ...assignment, type: 'CODE' }}
      onDirty={mockDirty}
    />
  );
  expect(
    await screen.findByText('Bấm Chạy thử để chạy code với các ví dụ trong đề.')
  ).toBeTruthy();
  fireEvent.changeText(
    await screen.findByTestId('code-editor'),
    'function sum(a,b) {\n  return a+b;\n}'
  );
  // The IDE gutter numbers every source line.
  expect(
    screen.getByTestId('code-gutter', { includeHiddenElements: true })
  ).toHaveTextContent(/^1\s+2\s+3$/);
  expect(screen.getByText('3 dòng')).toBeTruthy();
  await waitFor(() => expect(source).toContain('return a+b'), {
    timeout: 3500,
  });
  await waitFor(() =>
    expect(
      screen.getByTestId('code-run').props.accessibilityState.disabled
    ).toBe(false)
  );
  fireEvent.press(screen.getByTestId('code-run'));
  await screen.findByTestId('code-run-result');
  await waitFor(() =>
    expect(
      screen.getByTestId('code-submit').props.accessibilityState.disabled
    ).toBe(false)
  );
  fireEvent.press(screen.getByTestId('code-submit'));
  confirm();
  await screen.findByText('Điểm: 10.00 / 10.00', {}, { timeout: 5000 });
  expect(submitted).toBe(true);
  expect(polls).toBeGreaterThanOrEqual(2);
});

it('closes sample runs after the deadline and explains why', async () => {
  mockServer.use(
    http.get(base + '/me/assignments/:id/code', () =>
      HttpResponse.json({
        ...codeDetail,
        deadlinePassed: true,
        canSubmit: false,
      })
    ),
    http.get(base + '/me/assignments/:id/code-submissions', () =>
      HttpResponse.json({ items: [], page: 1, pageSize: 20, total: 0 })
    ),
    http.get(base + '/me/assignments/:id/code-drafts/:language', () =>
      HttpResponse.json({
        languageKey: 'javascript',
        sourceCode: 'function sum(a,b) { return a+b; }',
        version: 1,
      })
    )
  );
  renderWithProviders(
    <CodeWork
      assignment={{ ...assignment, type: 'CODE' }}
      onDirty={mockDirty}
    />
  );
  expect(await screen.findByTestId('code-output-empty')).toHaveTextContent(
    'Đã hết hạn nộp bài nên không thể chạy thử.'
  );
  expect(screen.getByTestId('code-run').props.accessibilityState.disabled).toBe(
    true
  );
  expect(
    screen.getByTestId('code-submit').props.accessibilityState.disabled
  ).toBe(true);
});

it('uploads and validates a ZIP before attaching and explicitly submitting it', async () => {
  let current = { ...zipDraft };
  const steps: string[] = [];
  jest.mocked(pick).mockResolvedValue([
    {
      uri: 'file:///homework.zip',
      name: 'homework.zip',
      size: 1024,
      type: 'application/zip',
      isVirtual: false,
      hasRequestedType: true,
      nativeType: 'application/zip',
      error: null,
      convertibleToMimeTypes: null,
    },
  ]);
  jest.mocked(keepLocalCopy).mockResolvedValue([
    {
      status: 'success',
      sourceUri: 'file:///homework.zip',
      localUri: 'file:///cache/homework.zip',
    },
  ]);
  jest.spyOn(global, 'fetch').mockImplementation(async (input) => {
    steps.push(String(input).startsWith('file:') ? 'read' : 'upload');
    return new Response(new Blob(['zip-bytes']));
  });
  mockServer.use(
    http.post(base + '/me/assignments/:id/zip-submissions', () =>
      HttpResponse.json(current)
    ),
    http.post(base + '/me/zip-submissions/:id/upload-intents', () => {
      steps.push('intent');
      return HttpResponse.json({
        ...zipFile,
        fileId: zipFile.id,
        status: 'PENDING_UPLOAD',
        version: 0,
        uploadUrl: 'https://storage.test/zip',
        requiredHeaders: { 'Content-Type': 'application/zip' },
      });
    }),
    http.post(base + '/assignment-files/:id/complete', () => {
      steps.push('complete');
      return HttpResponse.json({
        ...zipFile,
        status: 'PROCESSING',
        version: 1,
      });
    }),
    http.get(base + '/assignment-files/:id', () => {
      steps.push('ready');
      return HttpResponse.json({ ...zipFile, status: 'READY', version: 2 });
    }),
    http.put(base + '/me/zip-submissions/:id/file', () => {
      steps.push('attach');
      current = { ...current, file: zipFile, version: 1 };
      return HttpResponse.json(current);
    }),
    http.post(base + '/me/zip-submissions/:id/submit', () => {
      steps.push('submit');
      current = { ...current, status: 'SUBMITTED', version: 2 };
      return HttpResponse.json(current);
    })
  );
  renderWithProviders(
    <ZipWork
      assignment={{ ...assignment, type: 'ZIP' }}
      onDirty={mockDirty}
    />
  );
  fireEvent.press(await screen.findByTestId('zip-start'));
  fireEvent.press(await screen.findByTestId('zip-pick'));
  await waitFor(() => expect(steps).toContain('attach'), { timeout: 4000 });
  await waitFor(() =>
    expect(
      screen.getByTestId('zip-submit').props.accessibilityState.disabled
    ).toBe(false)
  );
  expect(steps).not.toContain('submit');
  fireEvent.press(screen.getByTestId('zip-submit'));
  confirm();
  await screen.findByText('Đã nộp bài thành công.');
  expect(steps).toEqual([
    'intent',
    'read',
    'upload',
    'complete',
    'ready',
    'attach',
    'submit',
  ]);
});

it.each([
  ['work.txt', 1024],
  ['work.zip', 0],
  ['work.zip', 21 * 1024 * 1024],
  ['work.zip', null],
])('rejects invalid ZIP %s (%s bytes)', (name, size) => {
  expect(validZip(name as string, size as number | null)).toBe(false);
});

it('does not fetch private assignment data for a signed out user', async () => {
  useStore.setState({ sessionUser: null });
  let reads = 0;
  mockServer.use(
    http.get(base + '/me/assignments/:id', () => {
      reads++;
      return HttpResponse.json(assignment);
    })
  );
  renderWithProviders(<AssignmentWorkRoute />);
  await screen.findByText('Đăng nhập với tài khoản học viên để mở trang chủ.');
  expect(reads).toBe(0);
});
