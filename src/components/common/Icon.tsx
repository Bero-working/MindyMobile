import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors } from '@/theme/colors';

export type IconName =
  | 'check'
  | 'video'
  | 'folder'
  | 'folder-open'
  | 'camera'
  | 'edit'
  | 'monitor'
  | 'award'
  | 'check-calendar'
  | 'globe'
  | 'help'
  | 'document'
  | 'bag'
  | 'logout'
  | 'back'
  | 'eye'
  | 'eyeOff'
  | 'mail'
  | 'lock'
  | 'user'
  | 'phone'
  | 'plus'
  | 'home'
  | 'calendar'
  | 'book'
  | 'grid'
  | 'bell'
  | 'cart'
  | 'image'
  | 'arrow'
  | 'filter'
  | 'clock';
const paths: Record<IconName, string> = {
  check: 'M5 12l4 4L19 6',
  video: 'M3 6h12v12H3zM15 10l6-4v12l-6-4z',
  folder: 'M3 5h7l2 3h9v12H3z',
  'folder-open': 'M3 8V5h7l2 3h9M3 10h19l-3 10H4z',
  camera: 'M3 7h4l2-3h6l2 3h4v14H3zM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  edit: 'M4 16 16 4l4 4L8 20H4zM13 7l4 4',
  monitor: 'M3 4h18v13H3zM12 17v4M8 21h8',
  award: 'M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0M9 12l-1 9 4-2 4 2-1-9',
  'check-calendar': 'M3 5h18v16H3zM7 3v4M17 3v4M3 10h18M8 15l3 3 5-5',
  globe:
    'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18',
  help: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5M12 17h.01',
  document: 'M5 3h10l4 4v14H5zM14 3v5h5M8 12h8M8 16h6',
  bag: 'M5 6h14l-1 15H6zM9 6V4h6v2',
  logout: 'M10 3H4v18h6M9 12h12M17 8l4 4-4 4',
  filter: 'M4 8h9M17 8h3M4 16h3M11 16h9',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  back: 'M15 18l-6-6 6-6',
  eye: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12',
  eyeOff:
    'M3 3l18 18M10 5c1-.3 2-.3 2-.3 7 0 10 7.3 10 7.3a18 18 0 01-4 4M6 6a18 18 0 00-4 6s3 7 10 7a12 12 0 005-1',
  mail: 'M3 5h18v14H3zM3 6l9 7 9-7',
  lock: 'M7 10V7a5 5 0 0110 0v3M5 10h14v11H5zM12 14v3',
  user: 'M4 21v-2a8 8 0 0116 0v2M16 7a4 4 0 11-8 0 4 4 0 018 0',
  phone: 'M6 3l4 4-2 3a15 15 0 006 6l3-2 4 4-2 3C10 22 2 14 3 5z',
  plus: 'M12 5v14M5 12h14',
  home: 'M3 11l9-8 9 8M5 10v11h5v-7h4v7h5V10',
  calendar: 'M4 5h16v16H4zM8 3v4M16 3v4M4 10h16',
  book: 'M12 5v16M3 3c4 0 6 1 9 2 3-1 5-2 9-2v16c-3 0-6 1-9 2-3-1-6-2-9-2z',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  bell: 'M5 17h14l-2-4V9a5 5 0 00-10 0v4zM10 21h4',
  cart: 'M2 3h3l3 13h11l3-10H6M9 21h.01M18 21h.01',
  image: 'M3 3h18v18H3zM3 17l6-6 4 4 3-3 5 5',
  arrow: 'M5 12h14M13 6l6 6-6 6',
};
export function Icon({
  name,
  light = false,
  size = 22,
  color,
}: {
  name: IconName;
  light?: boolean;
  size?: number;
  color?: string;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? (light ? colors.canvas : colors.muted)}
      strokeWidth={name === 'arrow' ? 2.4 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={false}
    >
      <Path d={paths[name]} />
      {name === 'filter' && (
        <>
          <Circle
            cx={15}
            cy={8}
            r={2}
          />
          <Circle
            cx={9}
            cy={16}
            r={2}
          />
        </>
      )}
      {name === 'eye' && (
        <Circle
          cx={12}
          cy={12}
          r={3}
        />
      )}
      {name === 'calendar' && (
        <Rect
          x={8}
          y={13}
          width={2}
          height={2}
        />
      )}
    </Svg>
  );
}
