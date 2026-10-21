import type { HomeCourse, DataRegion } from '@/modules/home/types/home.type';
export type DeliveryMode = 'ONLINE' | 'OFFLINE';
export type Course = HomeCourse;
export type CourseClass = {
  id: string;
  courseId: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  deliveryMode: DeliveryMode;
  availableSeats: number;
  mentor: { displayName: string };
  sessions?: { startsAt: string }[];
};
export type Category = { id: string; name: string };
export type CatalogProps = {
  onLearningTab?:
    | ((tab: import('@/modules/home/types/home.type').HomeTab) => void)
    | undefined;
  courses: DataRegion<Course[]>;
  recommendations: DataRegion<Course[]>;
  categories: DataRegion<Category[]>;
  total: number;
  page: number;
  categoryId: string | null;
  deliveryMode?: DeliveryMode | undefined;
  cartCount: number;
  refreshing?: boolean;
  onRefresh?: (() => void) | undefined;
  onPage: (page: number) => void;
  onCategory: (id: string | null) => void;
  onFilter: (filter: { deliveryMode?: DeliveryMode }) => void;
  filterTotal?: number | undefined;
  onPreviewFilter?: ((mode: DeliveryMode | undefined) => void) | undefined;
  onOpenCourse: (id: string) => void;
  onCart: () => void;
  onHome: () => void;
};
