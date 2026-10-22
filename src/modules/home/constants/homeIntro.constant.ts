import type { ImageSourcePropType } from 'react-native';

// Replace a slot with require('@/assets/images/home/...') or { uri } when artwork is supplied.
export const HOME_INTRO_IMAGES: Record<
  'start' | 'mentor' | 'project',
  ImageSourcePropType | undefined
> = {
  start: undefined,
  mentor: undefined,
  project: undefined,
};
