import { paymentResultHome } from './resultNavigation';
import routes from '@/navigation/routes';

it('resets navigation to Home without QR or checkout history', () => {
  const navigation = { reset: jest.fn() };
  paymentResultHome(navigation);
  expect(navigation.reset).toHaveBeenCalledWith({
    index: 0,
    routes: [{ name: routes.studentHome }],
  });
});
