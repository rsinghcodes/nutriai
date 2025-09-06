import { colors, fontSizes } from '@/theme';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

type Props = {
  value: number;
  goal: number;
  label: string;
  color?: string;
  size?: number;
};

const screenWidth = Dimensions.get('window').width;

export default function ProgressRing({
  value,
  goal,
  label,
  color = colors.primary,
  size = 120,
}: Props) {
  const fill = Math.min((value / goal) * 100, 100);

  return (
    <View style={styles.container}>
      <AnimatedCircularProgress
        size={screenWidth / 2.5}
        width={12}
        fill={fill}
        tintColor={color}
        backgroundColor={colors.border}
        rotation={0}
        lineCap="round"
      >
        {() => (
          <View style={styles.centerText}>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.goal}>/{goal}</Text>
          </View>
        )}
      </AnimatedCircularProgress>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  centerText: { flexDirection: 'row', alignItems: 'flex-end' },
  value: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text },
  goal: { fontSize: fontSizes.sm, color: colors.muted },
  label: { fontSize: fontSizes.sm, color: colors.muted, marginTop: 6 },
});
