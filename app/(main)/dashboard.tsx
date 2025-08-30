import client from '@/api/client';
import { AuthContext } from '@/context/AuthContext';
import { colors, fontSizes, spacing } from '@/theme';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart, ProgressChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function Dashboard() {
  const [trends, setTrends] = useState<any>(null);
  const router = useRouter();
  const { logout, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await client.get('/dashboard/trends');
        setTrends(res.data);
      } catch (e) {
        console.log('Error fetching trends', e);
      }
    };
    fetchTrends();
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hi, {user?.name}</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/foodlog')}
        >
          <Text style={styles.actionText}>🍽 Log Food</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          // onPress={() => router.push("/workout-log")}
        >
          <Text style={styles.actionText}>🏋️ Log Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          // onPress={() => router.push("/generate-plan")}
        >
          <Text style={styles.actionText}>🤖 AI Plan</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Progress Rings */}
      <Text style={styles.sectionTitle}>Daily Progress</Text>
      <View style={styles.dailyProgress}>
        <View style={styles.progressItem}>
          <ProgressChart
            data={{
              labels: ['Steps'],
              data: [0.65], // e.g., 6500/10000 steps
            }}
            width={screenWidth / 2.5}
            height={160}
            strokeWidth={12}
            radius={40}
            chartConfig={{
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              color: () => colors.primary,
              labelColor: () => colors.muted,
            }}
            hideLegend={false}
          />
        </View>

        <View style={styles.progressItem}>
          <ProgressChart
            data={{
              labels: ['Water'],
              data: [0.8], // e.g., 1.6L / 2L
            }}
            width={screenWidth / 2.5}
            height={160}
            strokeWidth={12}
            radius={40}
            chartConfig={{
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              color: () => '#06b6d4', // teal
              labelColor: () => colors.muted,
            }}
            hideLegend={false}
          />
        </View>
      </View>

      {/* Net Calories */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Today’s Net Calories</Text>
        <Text style={styles.netCalories}>
          {trends?.trends?.[0]?.net || 0} kcal
        </Text>
        <Text style={styles.subText}>
          Consumed: {trends?.trends?.[0]?.consumed || 0} kcal • Burned:{' '}
          {trends?.trends?.[0]?.burned || 0} kcal
        </Text>
      </View>

      {/* Calories Trend */}
      <Text style={styles.sectionTitle}>7-Day Calories Trend</Text>
      <View style={styles.card}>
        <LineChart
          data={{
            labels:
              trends?.trends?.map((t: any) =>
                new Date(t.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              ) || [],
            datasets: [
              {
                data: trends?.trends?.map((t: any) => t.net) || [
                  0, 0, 0, 0, 0, 0, 0,
                ],
              },
            ],
          }}
          width={screenWidth - spacing.lg * 2}
          height={220}
          chartConfig={{
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            decimalPlaces: 0,
            color: () => colors.primary,
            labelColor: () => colors.muted,
          }}
          bezier
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    marginBottom: spacing.md,
    color: colors.text,
  },
  logoutBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.border,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: fontSizes.sm,
    color: colors.muted,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    marginVertical: spacing.sm,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.card,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  netCalories: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.primary,
    marginVertical: spacing.sm,
  },
  subText: {
    fontSize: fontSizes.sm,
    color: colors.muted,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  dailyProgress: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  progressItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
