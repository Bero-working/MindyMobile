import type routes from '@/navigation/routes';
import type {
  StackScreenProps,
  StackNavigationProp,
} from '@react-navigation/stack';

export type RootScreenProps<
  S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>;

export type RootStackParamList = {
  [routes.splash]: undefined;
  [routes.example]: undefined;
  [routes.welcome]: undefined;
  [routes.login]: undefined;
  [routes.register]: undefined;
  [routes.studentHome]: undefined;
  [routes.phaseOnePreview]: undefined;
  [routes.courses]: undefined;
  [routes.payment]: { orderId: string };
};

export type NavigationProp = StackNavigationProp<RootStackParamList>;
