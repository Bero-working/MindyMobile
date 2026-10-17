// Based on Mobilecn-UI/nativecn-ui components/Skeleton.tsx (MIT).
// Static skeletons avoid a repeating animation and respect Reduce Motion by default.
import { View, type ViewProps } from 'react-native';
import { cn } from '@/shared/utilities/cn';
export function Skeleton({
  className,
  ...props
}: ViewProps & { className?: string }) {
  return (
    <View
      {...props}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      className={cn('h-5 rounded-xl bg-line', className)}
    />
  );
}
