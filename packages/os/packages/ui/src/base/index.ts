/**
 * WebOS Base Components
 * 基础UI组件库 - 亚克力/毛玻璃设计风格
 * 
 * 组件列表:
 * - Button: 按钮组件
 * - Icon: 图标组件
 * - Typography: 排版组件
 * - Color: 颜色组件
 * - Spacer: 间距组件
 * - Divider: 分隔线组件
 */

// Import styles
import './styles.css';

// ============================================
// Button Exports
// ============================================

export {
  Button,
  ButtonGroup,
  IconButton,
  default as ButtonDefault,
} from './Button';

export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  ButtonGroupProps,
  IconButtonProps,
} from './Button';

// ============================================
// Icon Exports
// ============================================

export {
  Icon,
  IconStack,
  Icons,
  iconNames,
  default as IconDefault,
} from './Icon';

export type {
  IconProps,
  IconSize,
  IconColor,
  IconStackProps,
  LucideIconName,
} from './Icon';

// ============================================
// Typography Exports
// ============================================

export {
  Heading,
  Text,
  Paragraph,
  Link,
  Code,
  withTruncation,
  default as TypographyDefault,
} from './Typography';

export type {
  HeadingProps,
  HeadingLevel,
  TextProps,
  TextSize,
  TextWeight,
  TextColor,
  ParagraphProps,
  LinkProps,
  CodeProps,
} from './Typography';

// ============================================
// Color Exports
// ============================================

export {
  ColorSwatch,
  ColorPicker,
  ColorPalette,
  webOSColors,
  grayScale,
  default as ColorDefault,
} from './Color';

export type {
  ColorFormat,
  ColorValue,
  ColorSwatchProps,
  ColorPickerProps,
  ColorPaletteProps,
} from './Color';

// ============================================
// Spacer Exports
// ============================================

export {
  Spacer,
  Spacer2XS,
  SpacerXS,
  SpacerSM,
  SpacerMD,
  SpacerLG,
  SpacerXL,
  Spacer2XL,
  Spacer3XL,
  Spacer4XL,
  FlexSpacer,
  InlineSpacer,
  Box,
  Stack,
  default as SpacerDefault,
} from './Spacer';

export type {
  SpacerProps,
  SpacerSize,
  SpacerDirection,
  FlexSpacerProps,
  InlineSpacerProps,
  BoxProps,
  StackProps,
} from './Spacer';

// ============================================
// Divider Exports
// ============================================

export {
  Divider,
  HorizontalDivider,
  VerticalDivider,
  DashedDivider,
  DottedDivider,
  GradientDivider,
  GlowDivider,
  AcrylicDivider,
  default as DividerDefault,
} from './Divider';

export type {
  DividerProps,
  DividerDirection,
  DividerStyle,
  DividerSize,
  HorizontalDividerProps,
  VerticalDividerProps,
  DashedDividerProps,
  DottedDividerProps,
  GradientDividerProps,
  GlowDividerProps,
  AcrylicDividerProps,
} from './Divider';

// ============================================
// Version Info
// ============================================

export const BASE_COMPONENTS_VERSION = '1.0.0';
