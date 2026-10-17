import i18n from './i18n.config';
import en from '@/translations/en-EN.json';
import vi from '@/translations/vi-VN.json';
import { languageSchema } from '@/shared/hooks/language/schema';
import localStore from '@/services/storage/localStore.service';
import { useI18n } from '@/shared/hooks/language/useI18n';

it('defaults to Vietnamese with matching translation keys', () => {
  expect(i18n.language).toBe('vi-VN');
  const paths = (value: object, prefix = ''): string[] =>
    Object.entries(value).flatMap(([key, item]: [string, string | object]) =>
      typeof item === 'string'
        ? [`${prefix}${key}`]
        : paths(item, `${prefix}${key}.`)
    );
  expect(paths(vi).sort()).toEqual(paths(en).sort());
  expect(i18n.t('boilerplate.common_error')).toBe(
    'Đã xảy ra lỗi. Vui lòng thử lại.'
  );
});

it('supports only Vietnamese and English', () => {
  expect(languageSchema.options).toEqual(['vi-VN', 'en-EN']);
  expect(Object.keys(i18n.options.resources ?? {}).sort()).toEqual([
    'en-EN',
    'vi-VN',
  ]);
});

it('persists language changes', async () => {
  await useI18n().changeLanguage('en-EN');
  expect(i18n.language).toBe('en-EN');
  expect(localStore.getSystemLanguage()).toBe('en-EN');
  await useI18n().toggleLanguage();
  expect(i18n.language).toBe('vi-VN');
  expect(localStore.getSystemLanguage()).toBe('vi-VN');
});
