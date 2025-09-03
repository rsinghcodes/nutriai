import { colors, fontSizes, spacing } from '@/theme';
import React from 'react';
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface MinimalButtonProps {
  title: string;
  onPress: (e: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  style?: ViewStyle;
  disabled?: boolean;
}

export default function MinimalButton({
  title,
  onPress,
  variant = 'primary',
  style,
  disabled = false,
}: MinimalButtonProps) {
  return (
    <Pressable
      onPress={!disabled ? onPress : undefined}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        buttonVariants[variant].button,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          buttonVariants[variant].text,
          disabled && styles.disabledText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xs,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }], // subtle feedback
  },
  text: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  disabledButton: {
    backgroundColor: colors.border,
    borderColor: colors.border,
  },
  disabledText: {
    color: colors.muted,
  },
});

const buttonVariants: Record<
  ButtonVariant,
  { button: ViewStyle; text: TextStyle }
> = {
  primary: {
    button: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    text: {
      color: '#fff',
    },
  },
  secondary: {
    button: {
      backgroundColor: 'transparent',
      borderColor: colors.border,
    },
    text: {
      color: colors.text,
    },
  },
  danger: {
    button: {
      backgroundColor: 'transparent',
      borderColor: '#ef4444', // red-500
    },
    text: {
      color: '#ef4444',
    },
  },
};
