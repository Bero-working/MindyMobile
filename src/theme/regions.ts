// src/theme/regions.ts
import { vars } from 'nativewind';

const BLACK = '0 0 0';
const CATALOG_INK = '38 38 38';

export const regionVars = {
  // Trang chủ: forest và muted thành đen
  home: vars({
    '--forest': BLACK,
    '--muted': BLACK,
    '--foreground': BLACK,
    '--muted-foreground': BLACK,
  }),
  // Giỏ hàng: các token *-foreground thành đen
  cart: vars({
    '--foreground': BLACK,
    '--card-foreground': BLACK,
    '--popover-foreground': BLACK,
    '--secondary-foreground': BLACK,
    '--accent-foreground': BLACK,
    '--muted-foreground': BLACK,
  }),
  // Chi tiết khoá học: chữ forest/muted/mint thành đen. SVG lấy màu từ colors.ts nên không bị ảnh hưởng.
  courseDetail: vars({
    '--forest': BLACK,
    '--muted': BLACK,
    '--mint': BLACK,
    '--foreground': BLACK,
    '--muted-foreground': BLACK,
  }),
  // Danh sách khoá học: thành catalog-ink. Bộ lọc đặt ngoài View này để giữ màu gốc.
  catalog: vars({
    '--forest': CATALOG_INK,
    '--muted': CATALOG_INK,
    '--mint': CATALOG_INK,
    '--foreground': CATALOG_INK,
    '--muted-foreground': CATALOG_INK,
  }),
} as const;
