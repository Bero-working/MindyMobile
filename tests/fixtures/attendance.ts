import type {
  AttendanceHistory,
  AttendanceItem,
  AttendanceSummary,
} from '@/modules/attendance/attendance.service';
import { commerceId } from './commerce';

export const attendanceClassId = commerceId(200);
export const attendanceItem = (n = 1): AttendanceItem => ({
  sessionId: commerceId(n),
  enrollmentId: commerceId(100),
  rootSessionId: commerceId(n),
  title: `Session ${n}`,
  startsAt: '2026-11-01T01:00:00Z',
  endsAt: '2026-11-01T03:00:00Z',
  sessionStatus: 'COMPLETED',
  attendanceStatus: 'PRESENT',
  attendanceApplicability: 'ELIGIBLE',
  excluded: false,
  effectiveMentor: { id: commerceId(900), displayName: 'Mentor An' },
  assignmentType: 'PRIMARY',
  makeupForSessionId: null,
  makeupRootSessionId: null,
  makeupPlacementId: null,
  creditSessionId: commerceId(n),
  creditedAttendanceStatus: 'PRESENT',
});
export const attendanceSummary = (): AttendanceSummary => ({
  classId: attendanceClassId,
  asOf: '2026-11-06T01:00:00Z',
  timeZone: 'Asia/Ho_Chi_Minh',
  present: 3,
  absent: 1,
  unmarked: 1,
  excluded: 2,
  makeupPending: 1,
  finalizedEligibleCount: 4,
  rate: 75,
});
export const attendanceHistory = (
  items = [attendanceItem()],
  page = 1,
  total = items.length
): AttendanceHistory => ({
  classId: attendanceClassId,
  items,
  page,
  pageSize: 20,
  total,
  asOf: '2026-11-06T01:00:00Z',
  timeZone: 'Asia/Ho_Chi_Minh',
});
