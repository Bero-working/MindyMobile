import i18next from 'i18next';
import localStore from '@/services/storage/localStore.service';
import { languageSchema, type Language } from './schema';

const changeLanguage = async (lang: Language): Promise<void> => {
  const language = languageSchema.parse(lang);
  await i18next.changeLanguage(language);
  localStore.setSystemLanguage(language);
};
const toggleLanguage = (): Promise<void> =>
  changeLanguage(i18next.language === 'vi-VN' ? 'en-EN' : 'vi-VN');
export const useI18n = () => ({ changeLanguage, toggleLanguage });
