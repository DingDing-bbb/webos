// 组件导出

// Base UI Components
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './Button';
export { IconButton, type IconButtonProps, type IconButtonVariant, type IconButtonSize, type IconButtonShape, type TooltipPosition } from './IconButton';
export {
  Typography,
  H1, H2, H3, H4, H5, H6,
  Text, TextSmall, TextLarge,
  Label, Caption,
  type TypographyProps,
  type TypographyElement,
  type TypographyVariant,
  type TypographyColor,
  type TypographyAlign,
  type TypographyWeight,
} from './Typography';
export {
  Icon,
  IconClose, IconCheck,
  IconChevronUp, IconChevronDown, IconChevronLeft, IconChevronRight,
  IconArrowUp, IconArrowDown, IconArrowLeft, IconArrowRight,
  IconPlus, IconMinus,
  IconSearch, IconSettings, IconHome,
  IconUser, IconMail, IconHeart, IconStar,
  IconInfoCircle, IconAlertCircle, IconAlertTriangle,
  IconLoader, IconRefresh,
  IconMore, IconMenu, IconExternal,
  IconCopy, IconTrash, IconEdit,
  IconDownload, IconUpload,
  IconFolder, IconFile, IconImage, IconVideo, IconMusic,
  IconBell, IconCalendar, IconClock,
  IconLock, IconUnlock,
  IconWifi, IconWifiOff,
  IconBattery, IconBatteryCharging,
  IconVolume, IconVolumeMute,
  IconGlobe, IconSun, IconMoon, IconPower,
  IconMaximize, IconMinimize,
  type IconProps,
  type IconSize,
  type IconColor,
  type IconRotation,
} from './Icon';

// System Components
export { Desktop, type WallpaperConfig, type WallpaperType } from './Desktop';
export { Taskbar, StartMenu } from './Taskbar';
export { BootScreen } from './Boot';
export { NotificationContainer } from './Notification';
export { ErrorDialog, ErrorDialogContainer } from './ErrorDialog';
export { BlueScreen, BlueScreenContainer } from './BlueScreen';
export { UpdateNotification } from './UpdateNotification';
export { LockScreen, type LockScreenProps } from './LockScreen';
export { Spinner } from './Spinner';

// Layout Components
export { Box } from './Box';
export { Stack, VStack, HStack } from './Stack';
export { Flex, FlexItem } from './Flex';
export { Grid, GridItem } from './Grid';
export { Container } from './Container';
export { Divider, VerticalDivider, HorizontalDivider } from './Divider';

// Feedback Components
// Toast Component
export {
  Toast,
  ToastProvider,
  useToast,
  type ToastProps,
  type ToastOptions,
  type ToastType,
  type ToastPosition,
  type ToastProviderProps,
} from './Toast';

// Modal Component
export {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ConfirmModal,
  type ModalProps,
  type ModalHeaderProps,
  type ModalBodyProps,
  type ModalFooterProps,
  type ModalSize,
  type ModalAnimation,
  type ConfirmModalProps,
} from './Modal';

// Progress Component
export {
  Progress,
  CircularProgress,
  ProgressGroup,
  SegmentedProgress,
  type ProgressProps,
  type CircularProgressProps,
  type ProgressGroupProps,
  type SegmentedProgressProps,
  type ProgressColor,
} from './Progress';

// Skeleton Component
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonImage,
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
  type SkeletonProps,
  type SkeletonTextProps,
  type SkeletonAvatarProps,
  type SkeletonImageProps,
  type SkeletonCardProps,
  type SkeletonListProps,
  type SkeletonTableProps,
  type SkeletonAnimation,
} from './Skeleton';

// Tooltip Component
export {
  Tooltip,
  TooltipProvider,
  SimpleTooltip,
  type TooltipProps,
  type TooltipProviderProps,
  type SimpleTooltipProps,
  type TooltipPosition as FeedbackTooltipPosition,
  type TooltipTrigger,
  type TooltipVariant,
} from './Tooltip';

// Alert Component
export {
  Alert,
  AlertAction,
  AlertLink,
  InlineAlert,
  AlertGroup,
  BannerAlert,
  type AlertProps,
  type AlertActionProps,
  type AlertLinkProps,
  type InlineAlertProps,
  type AlertGroupProps,
  type BannerAlertProps,
  type AlertType,
} from './Alert';
