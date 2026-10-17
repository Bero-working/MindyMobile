import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors } from '@/theme/colors';

export type IconName =
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
  | 'arrow';
const paths: Record<IconName, string> = {
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
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={false}
    >
      <Path d={paths[name]} />
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
