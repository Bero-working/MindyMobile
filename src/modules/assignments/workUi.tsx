import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, AppState, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/shared/utilities/apiError';
import { scopeKey, useStudentScope } from '@/shared/hooks/useStudentScope';

export function useWorkScope(id: string) {
  const scope = useStudentScope();
  const focused = useIsFocused();
  const [foreground, setForeground] = useState(
    AppState.currentState === 'active'
  );
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) =>
      setForeground(state === 'active')
    );
    return () => subscription.remove();
  }, []);
  return {
    enabled: scope.enabled && focused && foreground,
    key: ['assignment-work', ...scopeKey(scope), id],
  };
}

// Keep the original closure, body and receipt key on uncertain failure.
// Retrying cannot consume another submission attempt.
export function useWorkAction() {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef<(() => Promise<void>) | null>(null);
  const locked = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const execute = async () => {
    if (locked.current || !pending.current) return;
    locked.current = true;
    setBusy(true);
    setError(null);
    try {
      await pending.current();
      pending.current = null;
    } catch (failure) {
      if (mounted.current)
        setError(
          String(
            failure instanceof ApiError
              ? t(`assignmentWork.errors.${failure.code}`, {
                  defaultValue: t('assignmentWork.actionError'),
                })
              : t('assignmentWork.actionError')
          )
        );
      if (
        failure instanceof ApiError &&
        failure.status >= 400 &&
        failure.status < 500 &&
        failure.status !== 408
      )
        pending.current = null;
    } finally {
      locked.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  return {
    busy,
    error,
    unresolved: !!pending.current,
    clearError: () => {
      if (!locked.current && !pending.current) setError(null);
    },
    run: (fn: (key: string) => Promise<void>) => {
      if (locked.current || pending.current) return;
      const key = uuid();
      pending.current = () => fn(key);
      execute().catch(() => {});
    },
    retry: () => {
      execute().catch(() => {});
    },
  };
}
export function WorkError({
  message,
  retry,
}: {
  message: string | null;
  retry?: (() => void) | undefined;
}) {
  const { t } = useTranslation();
  if (!message) return null;
  return (
    <View className="gap-[8px] rounded-[16px] bg-peach p-[14px]">
      <Text
        accessibilityRole="alert"
        className="font-nunito text-[14px] text-headsup"
      >
        {message}
      </Text>
      {retry && (
        <Button
          label={t('common.retry')}
          variant="outline"
          onPress={retry}
        />
      )}
    </View>
  );
}
export function WorkLoading() {
  return (
    <View className="items-center py-[24px]">
      <ActivityIndicator />
    </View>
  );
}
export function WorkText({
  children,
  heading = false,
}: {
  children: ReactNode;
  heading?: boolean;
}) {
  return (
    <Text
      selectable
      accessibilityRole={heading ? 'header' : undefined}
      className={
        heading
          ? 'font-nunito-extrabold text-[18px] leading-[25px] text-black'
          : 'font-nunito text-[14px] leading-[23px] text-forest'
      }
    >
      {children}
    </Text>
  );
}
