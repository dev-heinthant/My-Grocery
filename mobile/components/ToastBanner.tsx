import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/hooks/useAppContext';

export const ToastBanner: React.FC = () => {
  const { toast, dismissToast, colors } = useApp();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(dismissToast, 2800);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) return null;

  const renderIcon = () => {
    if (toast.type === 'warning') {
      return <AlertCircle size={17} color="#FBBF24" />;
    }
    if (toast.type === 'info') {
      return <Info size={17} color="#38BDF8" />;
    }
    return <CheckCircle2 size={17} color="#34D399" />;
  };

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom: Math.max(insets.bottom, 12) + 64 }]}
    >
      <View
        style={[
          styles.banner,
          {
            backgroundColor: '#0F172A',
            borderColor: colors.border,
          },
        ]}
      >
        {renderIcon()}
        <Text style={styles.text} numberOfLines={2}>
          {toast.text}
        </Text>
        <Pressable
          onPress={dismissToast}
          hitSlop={8}
          accessibilityLabel="Dismiss toast"
        >
          <X size={15} color="#94A3B8" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 50,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    width: '100%',
    maxWidth: 460,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  text: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
});
