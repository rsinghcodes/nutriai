import { colors, fontSizes, spacing } from '@/theme';
import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import MinimalButton from './MinimalButton';

export default function ProfileModal({
  visible,
  title,
  children,
  onClose,
  onSave,
}: {
  visible: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>

          <View style={{ marginTop: spacing.sm }}>{children}</View>

          <View style={styles.actions}>
            <MinimalButton
              title="Close"
              onPress={onClose}
              variant="secondary"
            />
            <MinimalButton title="Save" onPress={onSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: 12,
    width: '85%',
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  btn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginLeft: spacing.sm,
  },
});
