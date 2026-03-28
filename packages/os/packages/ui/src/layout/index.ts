/**
 * @fileoverview WebOS Layout Components
 * @module @webos/ui/layout
 *
 * A comprehensive layout system with:
 * - Grid: 12-column responsive grid
 * - Container: Fixed/fluid width containers
 * - Stack: Vertical/horizontal stacking
 * - Flex: Flexible box layout
 * - Box: Universal layout primitive
 * - SplitPanel: Resizable split layouts
 *
 * All components support:
 * - Acrylic/glassmorphism effects
 * - Responsive design
 * - Theme switching
 * - Full TypeScript support
 *
 * @example
 * ```tsx
 * import {
 *   Box,
 *   Container,
 *   Flex,
 *   FlexItem,
 *   Grid,
 *   GridItem,
 *   Stack,
 *   VStack,
 *   HStack,
 *   Divider,
 *   SplitPanel,
 *   SplitPanelItem,
 * } from '@webos/ui/layout';
 *
 * // Import styles
 * import '@webos/ui/layout/styles.css';
 * ```
 */

// Import styles
import './styles.css';

// ============================================================================
// Box Component
// ============================================================================
export { Box } from './Box';
export type {
  BoxProps,
  BoxVariant,
  BorderRadius,
  OverflowValue,
  PositionValue,
} from './Box';

// ============================================================================
// Flex Component
// ============================================================================
export { Flex, FlexItem } from './Flex';
export type {
  FlexProps,
  FlexItemProps,
  FlexDirection,
  FlexWrap,
  FlexJustify,
  FlexAlign,
} from './Flex';

// ============================================================================
// Stack Component
// ============================================================================
export { Stack, VStack, HStack, Divider } from './Stack';
export type {
  StackProps,
  VStackProps,
  HStackProps,
  StackDirection,
  StackAlign,
  StackJustify,
  DividerVariant,
  DividerProps,
} from './Stack';

// ============================================================================
// Grid Component
// ============================================================================
export { Grid, GridItem } from './Grid';
export type {
  GridProps,
  GridItemProps,
  GridColumns,
  ResponsiveColumns,
} from './Grid';

// ============================================================================
// Container Component
// ============================================================================
export { Container, Section, Center } from './Container';
export type {
  ContainerProps,
  ContainerSize,
  ContainerVariant,
  SectionProps,
  CenterProps,
} from './Container';

// ============================================================================
// SplitPanel Component
// ============================================================================
export { SplitPanel, SplitPanelItem } from './SplitPanel';
export type {
  SplitPanelProps,
  SplitPanelItemProps,
  SplitPanelHandle,
  SplitDirection,
} from './SplitPanel';

// ============================================================================
// Version
// ============================================================================
export const LAYOUT_VERSION = '1.0.0';
