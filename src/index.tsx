import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  ThemeProvider,
  UiPortalProvider,
  type ThemeStorageAdapter,
} from '@sohantalukder/rn-kit';

import { queryClient } from '@/config/queryClient';
import Navigation from '@/navigation';
import '@/config/i18n.config';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import localStore from '@/services/storage/localStore.service';
import logo from '@/assets/images/logo.png';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

const themeStorageAdapter: ThemeStorageAdapter = {
  getTheme: () => {
    return 'default';
  },
  setTheme: () => {
    localStore.setTheme('default');
  },
};

const MainIndex = () => {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <View
          testID="app-root"
          collapsable={false}
          className="flex-1 bg-background"
        >
          <QueryClientProvider client={queryClient}>
            <ThemeProvider
              logo={logo}
              storageAdapter={themeStorageAdapter}
            >
              <UiPortalProvider>
                <Navigation />
              </UiPortalProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default MainIndex;
