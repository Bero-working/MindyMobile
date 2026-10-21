import { useMemo, type ReactNode, type RefObject } from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BrandBar } from '@/components/common/BrandBar';
import { AppTabBar } from '@/components/common/AppTabBar';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ScreenState } from '@/components/common/ScreenState';
import type { DataRegion, HomeTab } from '../../home/types/home.type';
import { colors } from '@/theme/colors';
import { cn } from '@/shared/utilities/cn';

export function LearningLayout({
  title,
  prefix,
  children,
  tab,
  onTab,
  onBack,
  refreshing = false,
  onRefresh,
  scrollRef,
  header,
  showTitle = true,
  contentClassName,
  tintedStatusBar = false,
  statusTintTone = 'mint',
  footer,
  floatingFooter = false,
}: {
  title: string;
  prefix: string;
  children: ReactNode;
  tab?: 'home' | 'courses' | 'schedule' | 'account';
  onTab?: ((tab: HomeTab) => void) | undefined;
  onBack?: (() => void) | undefined;
  refreshing?: boolean;
  onRefresh?: (() => void) | undefined;
  scrollRef?: RefObject<ScrollView | null>;
  header?: ReactNode;
  showTitle?: boolean;
  contentClassName?: string;
  tintedStatusBar?: boolean;
  statusTintTone?: 'mint' | 'forest';
  footer?: ReactNode;
  floatingFooter?: boolean;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const statusTint = useMemo(() => ({ height: insets.top }), [insets.top]);
  const floatingPosition = useMemo(
    () => ({ bottom: insets.bottom }),
    [insets.bottom]
  );
  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      className="flex-1 bg-canvas"
      testID={`${prefix}-screen`}
    >
      {!tintedStatusBar && (
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.canvas}
        />
      )}
      {tintedStatusBar && (
        <>
          <StatusBar
            barStyle="light-content"
            backgroundColor={
              statusTintTone === 'forest' ? colors.forestDeep : colors.mint
            }
          />
          <View
            pointerEvents="none"
            style={statusTint}
            className={
              statusTintTone === 'forest'
                ? 'absolute inset-x-[0px] top-[0px] bg-forest-deep'
                : 'absolute inset-x-[0px] top-[0px] bg-mint'
            }
          />
        </>
      )}
      {!onBack && (
        <View className="bg-mint">
          <BrandBar
            onTop={() => onTab?.('home')}
            onCart={undefined}
          />
        </View>
      )}
      {showTitle && (
        <View className="flex-row items-center gap-[8px] px-[16px] py-[12px]">
          {onBack && (
            <Button
              testID={`${prefix}-back`}
              variant="ghost"
              label={t('learning.back')}
              onPress={onBack}
            />
          )}
          <Text
            accessibilityRole="header"
            className="flex-1 font-nunito-extrabold text-[22px] leading-[28px] text-forest"
          >
            {title}
          </Text>
        </View>
      )}
      {header}
      <ScrollView
        ref={scrollRef}
        contentContainerClassName={cn(
          'gap-[16px] px-[16px] pb-[24px]',
          contentClassName
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
      {floatingFooter ? (
        <View
          pointerEvents="box-none"
          className="absolute inset-x-[0px]"
          style={floatingPosition}
        >
          {footer}
        </View>
      ) : (
        footer
      )}
      {tab && (
        <AppTabBar
          prefix={prefix}
          selected={tab}
          learningEnabled
          onTab={onTab}
          onTop={() => onTab?.('home')}
        />
      )}
    </SafeAreaView>
  );
}
export function LearningState<T>({
  region,
  prefix,
  empty,
  children,
}: {
  region: DataRegion<T>;
  prefix: string;
  empty: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const namespace =
    prefix === 'my-classes'
      ? 'myClasses'
      : prefix === 'class-detail'
        ? 'classDetail'
        : prefix;
  if (!region.data && region.status === 'loading')
    return (
      <View
        testID={`${prefix}-loading`}
        className="gap-[16px]"
      >
        {[0, 1, 2].map((id) => (
          <Skeleton
            key={id}
            className="h-[100px] rounded-[18px]"
          />
        ))}
      </View>
    );
  if (!region.data && region.status === 'error')
    return (
      <ScreenState
        title={t('home.errorTitle')}
        description={t('errors.generic')}
        onRetry={region.onRetry}
        requestId={region.error?.requestId}
        retryTestID={`${prefix}-retry`}
      />
    );
  return (
    <>
      {region.status === 'error' && (
        <ScreenState
          title={t('learning.stale')}
          description={t('errors.generic')}
          onRetry={region.onRetry}
          requestId={region.error?.requestId}
          retryTestID={`${prefix}-retry`}
        />
      )}
      {region.status === 'loading' && (
        <Text
          accessibilityLiveRegion="polite"
          className="font-nunito text-[14px] text-muted"
        >
          {t('learning.refreshing')}
        </Text>
      )}
      {empty ? (
        <ScreenState
          testID={`${prefix}-empty`}
          title={t(`${namespace}.state.empty`)}
          description={t(`${namespace}.state.description`)}
        />
      ) : (
        children
      )}
    </>
  );
}
