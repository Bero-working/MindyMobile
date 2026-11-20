import type { ImageSourcePropType } from 'react-native';
import start from '@/assets/images/home/start.jpg';
import mentor from '@/assets/images/home/mentor.jpg';
import project from '@/assets/images/home/project.jpg';

// Bundled web photos; source credits are in assets/images/home/CREDITS.md.
export const HOME_INTRO_IMAGES: Record<
  'start' | 'mentor' | 'project',
  ImageSourcePropType | undefined
> = {
  start,
  mentor,
  project,
};
