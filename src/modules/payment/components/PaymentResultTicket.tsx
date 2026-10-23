import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  Modal,
  ScrollView,
  Text,
  View,
  findNodeHandle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Svg, { Circle, Path } from 'react-native-svg';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { formatVnd } from '@/shared/utilities/formatVnd';
import type { PaymentResult } from '../resultModel';

export type PaymentResultTicketProps = {
  result: PaymentResult;
  onHome: () => void;
  onCourses: () => void;
};

export function PaymentResultTicket({
  result,
  onHome,
  onCourses,
}: PaymentResultTicketProps) {
  const { t } = useTranslation();
  const title = useRef<Text>(null);
  const departed = useRef(false);
  const announced = useRef('');
  const state = result.state;
  const success = state === 'PAID';
  const heading = t(`payment.result.${state}.title`);
  const identity = `${result.orderCode ?? ''}:${state}`;
  useEffect(() => {
    departed.current = false;
    if (announced.current !== identity) {
      announced.current = identity;
      AccessibilityInfo.announceForAccessibility(heading);
    }
  }, [identity, heading]);
  const focus = () => {
    const handle = findNodeHandle(title.current);
    if (typeof handle === 'number')
      AccessibilityInfo.setAccessibilityFocus(handle);
  };
  const navigate = () => {
    if (departed.current) return;
    departed.current = true;
    if (success) onHome();
    else onCourses();
  };
  return (
    <Modal
      transparent
      visible
      animationType="none"
      onShow={focus}
      onRequestClose={navigate}
      statusBarTranslucent
    >
      <SafeAreaView className="flex-1 bg-black/60">
        <ScrollView
          bounces={false}
          className="flex-1"
          contentContainerClassName="grow justify-center px-[24px] py-[32px]"
          showsVerticalScrollIndicator={false}
        >
          <View
            testID="payment-result-surface"
            accessibilityViewIsModal
            importantForAccessibility="yes"
            className="w-full max-w-[360px] self-center"
          >
            <TicketPaper>
              <View
                accessible={false}
                className="h-[56px] w-[56px] items-center justify-center self-center"
              >
                <Svg
                  width={56}
                  height={56}
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke={success ? colors.forest : colors.statusRed}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  accessible={false}
                >
                  <Circle
                    cx={24}
                    cy={24}
                    r={19}
                  />
                  <Path
                    d={
                      success
                        ? 'M14 24l7 7 14-16'
                        : state === 'CANCELLED'
                          ? 'M17 17l14 14M31 17 17 31'
                          : 'M24 13v12l8 5'
                    }
                  />
                </Svg>
              </View>
              <Text
                ref={title}
                testID="payment-result-title"
                accessibilityRole="header"
                accessible
                className="mt-[16px] text-center font-nunito-extrabold text-[22px] leading-[28px] text-forest"
              >
                {heading}
              </Text>
              <Text
                testID="payment-result-description"
                className="mt-[8px] text-center font-nunito text-[14px] leading-[21px] text-muted"
              >
                {t(`payment.result.${state}.description`)}
              </Text>
              {(result.orderCode || result.amount !== undefined) && (
                <View
                  testID="payment-result-order"
                  className="mt-[24px] gap-[8px] border-t border-dashed border-line pt-[20px]"
                >
                  {result.orderCode && (
                    <>
                      <Text className="font-nunito text-[13px] text-muted">
                        {t('payment.result.orderLabel')}
                      </Text>
                      <Text className="font-nunito-bold text-[13px] leading-[19px] text-forest">
                        {result.orderCode}
                      </Text>
                    </>
                  )}
                  {result.amount !== undefined && (
                    <View className="mt-[12px] gap-[6px] border-t border-line pt-[16px]">
                      <Text className="font-nunito text-[13px] text-muted">
                        {t('payment.result.totalLabel')}
                      </Text>
                      <Text className="font-nunito-extrabold text-[28px] leading-[34px] text-forest">
                        {formatVnd(result.amount)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              {!success && (
                <Text className="mt-[16px] text-center font-nunito text-[13px] leading-[19px] text-muted">
                  {t('payment.result.retryHint')}
                </Text>
              )}
            </TicketPaper>
            <View className="mt-[20px]">
              <Button
                testID={
                  success ? 'payment-result-home' : 'payment-result-retry'
                }
                label={t(
                  success
                    ? 'payment.result.actions.home'
                    : 'payment.result.actions.retry'
                )}
                variant="solid"
                className="min-h-[52px] rounded-[2px]"
                onPress={navigate}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function TicketPaper({ children }: { children: ReactNode }) {
  const [size, setSize] = useState({ width: 360, height: 480 });
  const { width, height } = size;
  const count = Math.max(1, Math.round(width / 14));
  const step = width / count;
  let paper = `M2 0H${width - 2}Q${width} 0 ${width} 2V${height - 10}`;
  for (let index = count; index > 0; index--) {
    const x = index * step;
    const nextX = (index - 1) * step;
    paper += `Q${x - step * 0.25} ${height - 10} ${x - step * 0.5} ${height - 5}Q${x - step * 0.75} ${height} ${nextX} ${height - 5}`;
  }
  paper += 'V2Q0 0 2 0Z';
  return (
    <View
      testID="payment-result-ticket"
      className="px-[24px] pb-[34px] pt-[24px]"
      onLayout={({ nativeEvent }) => {
        const { width: nextWidth, height: nextHeight } = nativeEvent.layout;
        if (
          nextWidth > 0 &&
          nextHeight > 0 &&
          (nextWidth !== width || nextHeight !== height)
        )
          setSize({ width: nextWidth, height: nextHeight });
      }}
    >
      <View
        pointerEvents="none"
        accessible={false}
        className="absolute inset-[0px]"
      >
        <Svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          accessible={false}
        >
          <Path
            d={paper}
            fill={colors.canvas}
          />
        </Svg>
      </View>
      {children}
    </View>
  );
}
