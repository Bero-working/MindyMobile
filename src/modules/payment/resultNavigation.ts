import routes from '@/navigation/routes';
import type { NavigationProp } from '@/navigation/types';

export function paymentResultHome(navigation: Pick<NavigationProp, 'reset'>) {
  navigation.reset({ index: 0, routes: [{ name: routes.studentHome }] });
}
