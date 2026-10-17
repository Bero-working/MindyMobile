import Svg, { Defs, Pattern, Path, Rect } from 'react-native-svg';
import { colors } from '@/theme/colors';
const covers = [
  [colors.coverA, colors.coverASoft],
  [colors.coverB, colors.coverBSoft],
  [colors.coverC, colors.coverCSoft],
  [colors.coverD, colors.coverDSoft],
] as const;
export function CourseCover({ index }: { index: number }) {
  const [stripe, background] = covers[index % 4] ?? covers[0];
  return (
    <Svg
      width="100%"
      height="100%"
      accessible={false}
    >
      <Defs>
        <Pattern
          id="cover-stripes"
          width={18}
          height={18}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <Rect
            width={18}
            height={18}
            fill={background}
          />
          <Path
            d="M0 0h9v18H0z"
            fill={stripe}
          />
        </Pattern>
      </Defs>
      <Rect
        width="100%"
        height="100%"
        fill="url(#cover-stripes)"
      />
    </Svg>
  );
}
