import type routes from '@/navigation/routes';
import type {
  StackScreenProps,
  StackNavigationProp,
} from '@react-navigation/stack';

export type RootScreenProps<
  S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>;

export type RootStackParamList = {
  [routes.welcome]: undefined;
  [routes.login]: undefined;
  [routes.register]: undefined;
  [routes.studentHome]: undefined;
  [routes.courses]: undefined;
  [routes.payment]: { orderId: string; origin?: 'learning' };
  [routes.studentSchedule]: undefined;
  [routes.studentAccount]: undefined;
  [routes.myClasses]: { origin: 'home' | 'courses' | 'account' };
  [routes.studentClassDetail]: {
    classId: string;
    sessionId?: string | undefined;
  };
  [routes.studentOrders]: undefined;
  [routes.studentAttendance]: undefined;
  [routes.studentMessages]: undefined;
  [routes.studentChat]: { conversationId: string; title: string };
  [routes.studentAssignment]: { assignmentId: string };
  [routes.studentMaterials]: {
    classId: string;
    unitId: string;
    unitTitle: string;
  };
  [routes.studentMaterial]: { classId: string; materialId: string };
  [routes.studentOrderDetail]: { orderId: string };
};

export type NavigationProp = StackNavigationProp<RootStackParamList>;
