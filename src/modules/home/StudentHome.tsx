import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ScreenState } from '@/components/common/ScreenState';
import { PressableScale } from '@/components/common/PressableScale';
import { colors } from '@/theme/colors';
import { motion } from '@/theme/motion';
import { useHomeController } from './hooks/useHomeController';
import { CourseTile } from '@/components/common/CourseTile';
import { HomeCarousel } from './components/HomeCarousel';
import { AppTabBar as HomeTabBar } from '@/components/common/AppTabBar';
import { BrandBar as HomeNav } from '@/components/common/BrandBar';
import { HomeButton } from './components/HomeButton';
import { HomeCompiler } from './components/HomeCompiler';
import type { HomeProps } from './types/home.type';
import mindyMascot from '@/assets/illustrations/mindy-mascot-laptop.png';

export function StudentHome(props: HomeProps) {
  const { t, i18n } = useTranslation();
  const home = useHomeController(props),
    actions = props.actions ?? {};
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const mascotWidth = width < 360 ? 128 : 196;
  const scroll = useRef<ScrollView>(null),
    previousY = useRef(0);
  const [compact, setCompact] = useState(false),
    [hidden, setHidden] = useState(false),
    [screenReader, setScreenReader] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isScreenReaderEnabled().then((value) => {
      if (mounted) setScreenReader(value);
    });
    const sub = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setScreenReader
    );
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  const layout = useMemo(
    () => ({
      hero: { paddingTop: insets.top, minHeight: insets.top + 190 },
      top: { paddingTop: insets.top },
      tabs: { bottom: Math.max(insets.bottom - 12, 0) },
      footer: { paddingBottom: 130 + insets.bottom },
      mascot: { width: mascotWidth, height: mascotWidth * 0.8 },
      greeting: { maxWidth: width < 360 ? width - mascotWidth - 4 : 218 },
    }),
    [insets.top, insets.bottom, width, mascotWidth]
  );
  const tabHidden = hidden && !reduced && !screenReader;
  const tabsStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withTiming(tabHidden ? 160 : 0, {
          duration: reduced ? 0 : 200,
        }),
      },
    ],
  }));
  const compactStyle = useAnimatedStyle(() => ({
    opacity: withTiming(compact ? 1 : 0, {
      duration: reduced ? 0 : 200,
      easing: motion.easing,
    }),
    transform: [
      {
        translateY: withTiming(compact ? 0 : -(insets.top + 52), {
          duration: reduced ? 0 : 200,
          easing: motion.easing,
        }),
      },
    ],
  }));
  const top = () => {
    scroll.current?.scrollTo({ y: 0, animated: !reduced });
    setHidden(false);
  };
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y,
      delta = y - previousY.current;
    setCompact(y > 150);
    if (y < 20 || delta < -3) setHidden(false);
    else if (y > 60 && delta > 3) setHidden(true);
    previousY.current = y;
  };
  const regionError = (code?: string) => {
    const key =
      code === 'NETWORK_ERROR'
        ? 'errors.NETWORK_UNAVAILABLE'
        : `errors.${code}`;
    return t(i18n.exists(key) ? key : 'errors.generic');
  };
  const locale = i18n.language === 'vi-VN' ? 'vi-VN' : 'en-GB';
  const time = home.upcoming
    ? new Intl.DateTimeFormat(locale, {
        timeZone: props.timeZone,
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      }).format(new Date(home.upcoming.startsAt))
    : '';
  return (
    <View
      testID="home-screen"
      className="flex-1 bg-canvas"
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.mint}
      />
      <ScrollView
        ref={scroll}
        testID="home-content"
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            testID="home-refresh"
            refreshing={home.refreshing}
            onRefresh={home.refresh}
            enabled={!!props.onRefresh}
            colors={[colors.mint]}
            tintColor={colors.mint}
          />
        }
      >
        <View
          testID="home-header"
          style={layout.hero}
          className="relative z-10 bg-mint pb-[26px]"
        >
          <HomeNav
            onTop={top}
            onCart={actions.onCart}
            cartCount={props.cartCount ?? 0}
          />
          <View
            style={layout.greeting}
            className="pl-[18px] pt-[18px]"
          >
            <Text className="font-nunito-bold text-[14px] text-line">
              {t('home.greeting', { name: props.displayName })}
            </Text>
            <Text
              accessibilityRole="header"
              className="mt-[12px] font-nunito-extrabold text-[27px] leading-[30.2px] tracking-[-0.54px] text-canvas"
            >
              {t('home.title')}
            </Text>
          </View>
          <Image
            testID="home-mascot"
            source={props.mascot ?? mindyMascot}
            resizeMode="contain"
            accessible={false}
            style={layout.mascot}
            className="absolute -bottom-[14px] -right-[4px]"
          />
        </View>
        {home.refreshError && (
          <View className="px-[16px] pt-[16px]">
            <ScreenState
              title={t('home.errorTitle')}
              description={t('errors.generic')}
              onRetry={home.refresh}
              retryTestID="home-refresh-retry-button"
            />
          </View>
        )}
        {(props.schedule.status !== 'success' || home.upcoming) && (
          <View
            testID="home-next-session"
            className="mx-[16px] mt-[26px] rounded-[20px] bg-sunshine px-[16px] py-[14px]"
          >
            {props.schedule.status === 'error' && (
              <ScreenState
                testID="home-schedule-error"
                title={t('home.errorTitle')}
                description={regionError(props.schedule.error?.code)}
                onRetry={props.schedule.onRetry}
                requestId={props.schedule.error?.requestId}
                retryTestID="home-schedule-retry-button"
              />
            )}
            {props.schedule.status === 'loading' && !props.schedule.data ? (
              <Skeleton
                testID="home-schedule-loading"
                className="h-[72px] rounded-[20px] bg-sunshine/50"
              />
            ) : (
              home.upcoming && (
                <View className="flex-row flex-wrap items-center gap-[12px]">
                  <View className="min-w-[144px] flex-1">
                    <Text className="font-nunito-extrabold text-[12px] text-forest">
                      {t('home.sections.nextSession')}
                      {' · '}
                      {time}
                    </Text>
                    <Text
                      numberOfLines={2}
                      className="mt-[2px] font-nunito-extrabold text-[15.5px] text-black"
                    >
                      {home.upcoming.className}
                      {' · '}
                      {home.upcoming.sessionTitle}
                    </Text>
                  </View>
                  <Button
                    testID="home-join-class-button"
                    label={t(
                      home.upcoming.accessMode === 'CASH_PREVIEW'
                        ? 'home.actions.previewClass'
                        : 'home.actions.join'
                    )}
                    variant="solid"
                    className="min-h-[44px] rounded-[12px] px-[14px] py-[8px]"
                    disabled={!actions.onSession}
                    accessibilityHint={
                      !actions.onSession
                        ? t('home.actions.unavailable')
                        : undefined
                    }
                    onPress={() => {
                      if (home.upcoming) {
                        const { classId, sessionId, accessMode } =
                          home.upcoming;
                        actions.onSession?.({ classId, sessionId, accessMode });
                      }
                    }}
                  />
                </View>
              )
            )}
          </View>
        )}
        <View
          testID="home-featured-courses"
          className="px-[16px] pt-[28px]"
        >
          <Text
            accessibilityRole="header"
            className="mb-[14px] font-nunito-extrabold text-[22px] tracking-[-0.44px] text-black"
          >
            {t('home.sections.courses')}
          </Text>
          {props.courses.status === 'error' && (
            <ScreenState
              testID="home-error"
              title={t('home.errorTitle')}
              description={regionError(props.courses.error?.code)}
              onRetry={props.courses.onRetry}
              requestId={props.courses.error?.requestId}
              retryTestID="home-retry-button"
            />
          )}
          {props.courses.status === 'loading' && !props.courses.data ? (
            <View
              testID="home-loading"
              accessible
              accessibilityLabel={t('common.loading')}
              className="-mx-[6px] flex-row flex-wrap"
            >
              {[0, 1, 2, 3].map((index) => (
                <View
                  key={index}
                  className="mb-[12px] w-1/2 px-[6px]"
                >
                  <Skeleton className="aspect-[3/4] h-auto rounded-[20px]" />
                </View>
              ))}
            </View>
          ) : home.courses.length > 0 ? (
            <View className="-mx-[6px] flex-row flex-wrap">
              {home.courses.map((course, index) => (
                <CourseTile
                  key={course.id}
                  index={index}
                  course={course}
                  actions={actions}
                />
              ))}
            </View>
          ) : (
            props.courses.status !== 'error' && (
              <ScreenState
                testID="home-empty"
                title={t('home.empty.title')}
                description={t('home.empty.description')}
              />
            )
          )}
          <View className="mt-[16px]">
            <HomeButton
              testID="home-explore-courses-button"
              label={t('home.actions.explore')}
              className="min-h-[52px]"
              disabled={!actions.onExplore}
              accessibilityHint={
                !actions.onExplore ? t('home.actions.unavailable') : undefined
              }
              onPress={actions.onExplore}
            />
          </View>
        </View>
        <HomeCarousel
          kind="intro"
          onAction={actions.onIntro}
        />
        <HomeCompiler
          name={props.displayName}
          onPress={actions.onCompiler}
        />
        <HomeCarousel kind="about" />
        <View
          testID="home-footer"
          style={layout.footer}
          className="bg-forest px-[16px] pt-[28px]"
        >
          <View className="flex-row items-center gap-[8px]">
            <View className="h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-canvas">
              <Text className="font-nunito-extrabold text-[16px] text-forest">
                {t('home.brand.initial')}
              </Text>
            </View>
            <Text className="font-nunito-extrabold text-[17px] text-canvas">
              {t('auth.brandName')}
            </Text>
          </View>
          <Text className="mb-[18px] mt-[10px] font-nunito text-[14px] leading-[21.7px] text-line">
            {t('home.footer.tagline')}
          </Text>
          <View className="w-1/2 gap-[8px]">
            <Text className="font-nunito-extrabold text-[13px] text-sunshine">
              {t('home.footer.learn')}
            </Text>
            {(['courses', 'schedule', 'account'] as const).map((tab) => (
              <PressableScale
                key={tab}
                accessibilityRole="link"
                accessibilityLabel={t(
                  tab === 'account'
                    ? 'home.footer.myClasses'
                    : `home.tabs.${tab}`
                )}
                accessibilityHint={
                  !(tab === 'account' ? actions.onMyClasses : actions.onTab)
                    ? t('home.actions.unavailable')
                    : undefined
                }
                disabled={
                  !(tab === 'account' ? actions.onMyClasses : actions.onTab)
                }
                accessibilityState={{
                  disabled: !(tab === 'account'
                    ? actions.onMyClasses
                    : actions.onTab),
                }}
                onPress={() =>
                  tab === 'account'
                    ? actions.onMyClasses?.()
                    : actions.onTab?.(tab)
                }
                className="min-h-[44px] justify-center"
              >
                <Text className="font-nunito text-[14px] text-canvas">
                  {t(
                    tab === 'account'
                      ? 'home.footer.myClasses'
                      : `home.tabs.${tab}`
                  )}
                </Text>
              </PressableScale>
            ))}
          </View>
          <Text className="mt-[18px] font-nunito text-[13.5px] leading-[23px] text-line">
            {t('home.footer.contact')}
          </Text>
          {props.sessionControls}
          <Text className="mt-[16px] border-t border-canvas/20 pt-[12px] font-nunito text-[12px] text-banner">
            {t('home.footer.copyright')}
          </Text>
        </View>
      </ScrollView>
      <Animated.View
        testID="home-compact-header"
        style={[layout.top, compactStyle]}
        pointerEvents={compact ? 'auto' : 'none'}
        accessibilityElementsHidden={!compact}
        importantForAccessibility={compact ? 'auto' : 'no-hide-descendants'}
        className="absolute inset-x-[0px] top-[0px] bg-mint pb-[8px] shadow-lg shadow-forest/20"
      >
        <HomeNav
          onTop={top}
          onCart={actions.onCart}
          compact
        />
      </Animated.View>
      <Animated.View
        style={[layout.tabs, tabsStyle]}
        accessibilityElementsHidden={tabHidden}
        importantForAccessibility={tabHidden ? 'no-hide-descendants' : 'auto'}
        className="absolute inset-x-[12px]"
      >
        <HomeTabBar
          onTab={actions.onTab}
          onTop={top}
        />
      </Animated.View>
    </View>
  );
}
