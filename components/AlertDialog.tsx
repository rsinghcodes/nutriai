// components/AlertDialog.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  GestureResponderEvent,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, fontSizes, spacing } from '../theme';
import MinimalButton from './MinimalButton';

type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

interface AlertDialogProps {
  visible: boolean;
  title?: string;
  message: string;
  onConfirm?: (event: GestureResponderEvent) => void;
  onCancel?: (event: GestureResponderEvent) => void;
  confirmText?: string;
  cancelText?: string;
  variant?: AlertVariant;
}

export default function AlertDialog({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
  variant = 'info',
}: AlertDialogProps) {
  // Local mounted state so Modal is only mounted while animating
  const [mounted, setMounted] = useState(visible);
  const anim = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(anim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, anim]);

  const overlayOpacity = anim;
  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
  });
  const cardAnimatedStyle = {
    transform: [{ scale }, { translateY }],
    opacity: anim,
  };

  const { icon, color } = variantStyles[variant];

  // If not mounted, don't render modal
  if (!mounted) return null;

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none" // use custom animation to avoid initial corner flash
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Animated.View
        // absolute overlay so initial mount can't appear in a corner
        style={[styles.overlay, { opacity: overlayOpacity }]}
        pointerEvents="auto"
      >
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          <View style={[styles.iconWrapper, { backgroundColor: color + '20' }]}>
            <MaterialCommunityIcons name={icon} size={28} color={color} />
          </View>

          {title ? <Text style={styles.title}>{title}</Text> : null}
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            {onCancel && (
              <MinimalButton
                variant="secondary"
                onPress={onCancel}
                title={cancelText}
              />
            )}

            {onConfirm && (
              <MinimalButton
                variant="primary"
                onPress={onConfirm}
                title={confirmText}
              />
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // absolute overlay prevents the "corner flash" by guaranteeing fill immediately
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    // on Android, ensure the overlay sits above status bar if translucent
    paddingTop: Platform.OS === 'android' ? spacing.lg : spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: spacing.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSizes.md,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  btn: {
    borderRadius: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 80,
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  btnText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  primaryText: {
    color: '#fff',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    color: colors.text,
  },
});

const variantStyles: Record<
  AlertVariant,
  { icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string }
> = {
  info: {
    icon: 'information',
    color: '#2563eb',
  },
  success: {
    icon: 'check-circle',
    color: '#16a34a',
  },
  warning: {
    icon: 'alert-circle',
    color: '#f59e0b',
  },
  danger: {
    icon: 'close-circle',
    color: '#dc2626',
  },
};
