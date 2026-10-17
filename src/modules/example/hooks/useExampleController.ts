import { logger } from '@/shared/utilities/logger';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  EXAMPLE_FEATURE_LIST,
  type ExampleFeatureAction,
} from '@/modules/example/constants/example.constant';
import { useHealthQuery } from '@/modules/example/hooks/useHealthQuery';
import type { ExampleFeatureViewItem } from '@/modules/example/types/example.type';
import { useI18n } from '@/shared/hooks/language/useI18n';
import { useTheme } from '@sohantalukder/rn-kit';

export function useExampleController() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { toggleLanguage } = useI18n();
  const { isSuccess, isError, error, isFetching, refetch } = useHealthQuery();

  const { changeTheme } = theme;

  const onChangeTheme = useCallback(() => {
    changeTheme('default');
  }, [changeTheme]);

  const checkHealth = useCallback(async () => {
    try {
      await refetch({
        throwOnError: true,
      });
    } catch (failure) {
      logger.error(
        'API health check failed',
        failure instanceof Error ? failure : undefined
      );
    }
  }, [refetch]);

  const featureActions = useMemo<Record<ExampleFeatureAction, () => void>>(
    () => ({
      checkHealth,
      toggleTheme: onChangeTheme,
      toggleLanguage,
    }),
    [checkHealth, onChangeTheme, toggleLanguage]
  );

  const features = useMemo<ExampleFeatureViewItem[]>(
    () =>
      EXAMPLE_FEATURE_LIST.map((feature) => ({
        title: t(feature.titleKey),
        description: t(feature.descriptionKey),
        icon: feature.icon,
        onPress: featureActions[feature.action],
        isLoading: feature.action === 'checkHealth' ? isFetching : false,
        buttonText: t(feature.buttonTextKey),
        ...(feature.action === 'checkHealth'
          ? {
              testID: 'example-api-check',
              ...(!isFetching && (isSuccess || isError)
                ? {
                    feedback: {
                      message: isError
                        ? t(
                            'boilerplate.screen_example.api_messages.error_message',
                            {
                              code: error.code,
                              status: error.status,
                            }
                          )
                        : t(
                            'boilerplate.screen_example.api_messages.success_message'
                          ),
                      testID: isError
                        ? 'example-api-error'
                        : 'example-api-success',
                    },
                  }
                : {}),
            }
          : {}),
      })),
    [featureActions, isFetching, isSuccess, isError, error, t]
  );

  return {
    features,
  };
}
