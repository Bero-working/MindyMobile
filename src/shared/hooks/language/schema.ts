import { z } from 'zod';

export const SupportedLanguages = {
  EN_EN: 'en-EN',
  VI_VN: 'vi-VN',
} as const;

export const languageSchema = z.enum([
  SupportedLanguages.VI_VN,
  SupportedLanguages.EN_EN,
]);

export type Language = z.infer<typeof languageSchema>;
