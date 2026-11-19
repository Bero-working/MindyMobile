/* eslint-disable @typescript-eslint/no-require-imports */
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useTheme } from '@sohantalukder/rn-kit';
import type { RootStackParamList } from './types';
import routes from './routes';
import { screenOptions } from './screenOptions';
import { SessionSplash } from '@/components/common/SessionSplash';
import { useAuthSession } from '@/modules/auth/hooks/useAuthSession';
import { useStore } from '@/state/store';

const Stack = createStackNavigator<RootStackParamList>();

const Navigation = () => {
  const { navigationTheme, variant } = useTheme();
  const session = useAuthSession();
  const user = useStore((state) => state.sessionUser);
  const generation = useStore((state) => state.generation);
  if (session.pending) return <SessionSplash />;

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName={
          user?.role === 'STUDENT'
            ? routes.studentHome
            : !user
              ? routes.login
              : routes.welcome
        }
        key={`${variant}:${generation}:${user?.id ?? 'guest'}:${user?.role ?? 'guest'}`}
        screenOptions={screenOptions}
      >
        {user?.role !== 'STUDENT' && (
          <Stack.Screen
            getComponent={() =>
              (
                require('@/modules/auth/AuthRoutes') as typeof import('@/modules/auth/AuthRoutes')
              ).WelcomeRoute
            }
            name={routes.welcome}
          />
        )}
        {!user && (
          <Stack.Screen
            getComponent={() =>
              (
                require('@/modules/auth/AuthRoutes') as typeof import('@/modules/auth/AuthRoutes')
              ).LoginRoute
            }
            name={routes.login}
          />
        )}
        {!user && (
          <Stack.Screen
            getComponent={() =>
              (
                require('@/modules/auth/AuthRoutes') as typeof import('@/modules/auth/AuthRoutes')
              ).RegisterRoute
            }
            name={routes.register}
          />
        )}
        {user?.role === 'STUDENT' && (
          <Stack.Screen
            getComponent={() =>
              (
                require('@/modules/auth/AuthRoutes') as typeof import('@/modules/auth/AuthRoutes')
              ).StudentHomeRoute
            }
            name={routes.studentHome}
          />
        )}
        {user?.role === 'STUDENT' && (
          <Stack.Screen
            name={routes.courses}
            getComponent={() =>
              (
                require('@/modules/courses/CoursesRoute') as typeof import('@/modules/courses/CoursesRoute')
              ).CoursesRoute
            }
          />
        )}
        {user?.role === 'STUDENT' && (
          <Stack.Screen
            name={routes.payment}
            getComponent={() =>
              (
                require('@/modules/payment/PaymentRoute') as typeof import('@/modules/payment/PaymentRoute')
              ).PaymentRoute
            }
            options={{ gestureEnabled: false }}
          />
        )}
        {user?.role === 'STUDENT' && (
          <Stack.Group>
            <Stack.Screen
              name={routes.studentMaterials}
              getComponent={() =>
                (
                  require('@/modules/materials/MaterialsRoutes') as typeof import('@/modules/materials/MaterialsRoutes')
                ).MaterialsRoute
              }
            />
            <Stack.Screen
              name={routes.studentMaterial}
              getComponent={() =>
                (
                  require('@/modules/materials/MaterialsRoutes') as typeof import('@/modules/materials/MaterialsRoutes')
                ).MaterialRoute
              }
            />
            <Stack.Screen
              name={routes.studentAssignment}
              getComponent={() =>
                (
                  require('@/modules/assignments/AssignmentWorkRoute') as typeof import('@/modules/assignments/AssignmentWorkRoute')
                ).AssignmentWorkRoute
              }
            />
            <Stack.Screen
              name={routes.studentMessages}
              getComponent={() =>
                (
                  require('@/modules/chat/ChatRoutes') as typeof import('@/modules/chat/ChatRoutes')
                ).MessagesRoute
              }
            />
            <Stack.Screen
              name={routes.studentChat}
              getComponent={() =>
                (
                  require('@/modules/chat/ChatRoutes') as typeof import('@/modules/chat/ChatRoutes')
                ).ConversationRoute
              }
            />
            <Stack.Screen
              name={routes.studentAttendance}
              getComponent={() =>
                (
                  require('@/modules/attendance/AttendanceRoute') as typeof import('@/modules/attendance/AttendanceRoute')
                ).AttendanceRoute
              }
            />
            <Stack.Screen
              name={routes.studentOrders}
              getComponent={() =>
                (
                  require('@/modules/orders/OrdersRoutes') as typeof import('@/modules/orders/OrdersRoutes')
                ).OrdersRoute
              }
            />
            <Stack.Screen
              name={routes.studentOrderDetail}
              getComponent={() =>
                (
                  require('@/modules/orders/OrdersRoutes') as typeof import('@/modules/orders/OrdersRoutes')
                ).OrderDetailRoute
              }
            />
            <Stack.Screen
              name={routes.studentSchedule}
              getComponent={() =>
                (
                  require('@/modules/my-classes/LearningRoutes') as typeof import('@/modules/my-classes/LearningRoutes')
                ).StudentScheduleRoute
              }
            />
            <Stack.Screen
              name={routes.studentAccount}
              getComponent={() =>
                (
                  require('@/modules/my-classes/LearningRoutes') as typeof import('@/modules/my-classes/LearningRoutes')
                ).StudentAccountRoute
              }
            />
            <Stack.Screen
              name={routes.myClasses}
              getComponent={() =>
                (
                  require('@/modules/my-classes/LearningRoutes') as typeof import('@/modules/my-classes/LearningRoutes')
                ).MyClassesRoute
              }
            />
            <Stack.Screen
              name={routes.studentClassDetail}
              getComponent={() =>
                (
                  require('@/modules/my-classes/LearningRoutes') as typeof import('@/modules/my-classes/LearningRoutes')
                ).StudentClassDetailRoute
              }
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
