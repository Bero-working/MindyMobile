import routes from './routes';
import type { NavigationProp } from './types';
import type { HomeTab } from '@/modules/home/types/home.type';

export function navigateLearningTab(navigation: NavigationProp, tab: HomeTab) {
  if (tab === 'home')
    navigation.navigate(routes.studentHome, undefined, { pop: true });
  else if (tab === 'courses')
    navigation.navigate(routes.courses, undefined, { pop: true });
  else if (tab === 'schedule')
    navigation.navigate(routes.studentSchedule, undefined, { pop: true });
  else if (tab === 'account')
    navigation.navigate(routes.studentAccount, undefined, { pop: true });
  else if (tab === 'messages')
    navigation.navigate(routes.studentMessages, undefined, { pop: true });
}
