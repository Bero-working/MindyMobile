import type { Course, CourseClass } from '../courses/types/courses.type';
// Development-only data. The QR text is deliberately not a banking payload.
export function commerceFixtures() {
  if (!__DEV__) return { courses: [], classes: [] };
  const titles = [
    'Lập trình Web cơ bản',
    'Python cho người mới',
    'Java nền tảng',
    'React thực chiến',
    'Thiết kế UI/UX',
    'Cơ sở dữ liệu',
    'Lập trình di động',
    'JavaScript nâng cao',
    'Node.js & API',
    'Kiểm thử phần mềm',
    'Git & GitHub',
    'Thuật toán cơ bản',
  ];
  const courses: Course[] = titles.map((title, index) => ({
    id: 'demo-' + index,
    code: 'MINDY-' + (index + 1),
    title,
    description:
      'Học qua dự án thực tế, rèn luyện tư duy và xây dựng nền tảng vững chắc cùng mentor. Nội dung từng bước giúp bạn tự tin hoàn thành sản phẩm của riêng mình.',
    imgUrl: null,
    priceAmount: 1500000 + index * 100000,
    category: {
      id: index % 2 ? 'programming' : 'web',
      name: index % 2 ? 'Lập trình' : 'Web',
      slug: index % 2 ? 'programming' : 'web',
    },
    openClass: {
      startDate: '2026-11-02',
      deliveryMode: index % 2 ? 'OFFLINE' : 'ONLINE',
    },
  }));
  const classes: CourseClass[] = courses.flatMap((course, index) =>
    (['a', 'b', 'full'] as const).map((suffix, i) => ({
      id: course.id + '-' + suffix,
      courseId: course.id,
      code: course.code + '-' + suffix.toUpperCase(),
      name: course.code + ' · ' + suffix.toUpperCase(),
      startDate: i === 1 ? '2026-11-16' : '2026-11-02',
      endDate: '2027-01-20',
      deliveryMode: i === 1 ? 'OFFLINE' : 'ONLINE',
      availableSeats: i === 2 ? 0 : 5 + i * 6,
      mentor: { displayName: index % 2 ? 'Minh Anh' : 'Tuấn Nguyễn' },
      sessions: [
        { startsAt: '2026-11-02T12:00:00Z' },
        { startsAt: '2026-11-04T12:00:00Z' },
        { startsAt: '2026-11-06T12:00:00Z' },
      ],
    }))
  );
  return { courses, classes };
}
