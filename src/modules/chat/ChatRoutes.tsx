import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import routes from '@/navigation/routes';
import type { NavigationProp, RootStackParamList } from '@/navigation/types';
import { navigateLearningTab } from '@/navigation/navigateLearningTab';
import {
  MessagesScreen,
  ConversationScreen,
  conversationTitle,
} from './ChatScreens';

export function MessagesRoute() {
  const navigation = useNavigation<NavigationProp>();
  return (
    <MessagesScreen
      onBack={() => navigation.goBack()}
      onTab={(tab) => navigateLearningTab(navigation, tab)}
      onOpen={(row) =>
        navigation.navigate(routes.studentChat, {
          conversationId: row.id,
          title: conversationTitle(row),
        })
      }
    />
  );
}
export function ConversationRoute() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, routes.studentChat>>();
  return (
    <ConversationScreen
      key={route.params.conversationId}
      conversationId={route.params.conversationId}
      fallbackTitle={route.params.title}
      onBack={() => navigation.goBack()}
    />
  );
}
