import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ConfirmModal } from '@/components/ConfirmModal';
import { ToastBanner } from '@/components/ToastBanner';
import { AppProvider, useApp } from '@/hooks/useAppContext';

const queryClient = new QueryClient();

function AppNavigationShell() {
  const { theme, colors, isDbReady, isAuthReady, dbError, retryDbInit, t } = useApp();

  if (!isDbReady || !isAuthReady) {
    return (
      <View style={[styles.bootScreen, { backgroundColor: colors.background }]}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        {dbError ? (
          <View
            style={[
              styles.errorCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
              {t.appName}
            </Text>
            <Text style={[styles.errorText, { color: colors.roseText }]}>{dbError}</Text>
            <Pressable
              onPress={retryDbInit}
              style={[styles.retryBtn, { backgroundColor: colors.emerald }]}
            >
              <Text style={styles.retryBtnText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.emerald} />
            <Text style={[styles.loadingTitle, { color: colors.textPrimary }]}>
              {t.appName}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <ConfirmModal />
      <ToastBanner />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <AppNavigationShell />
          </AppProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  bootScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingWrap: {
    alignItems: 'center',
    gap: 12,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  errorCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 12,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryBtn: {
    height: 42,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
