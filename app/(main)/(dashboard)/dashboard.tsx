import client from '@/api/client';
import MinimalButton from '@/components/MinimalButton';
import { AuthContext } from '@/context/AuthContext';
import { useDashboard } from '@/context/DashboardContext';
import { colors, fontSizes, spacing } from '@/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
  const { refreshFlag } = useDashboard();
  const { logout, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await client.get('/dashboard/trends?days=7');
        setTrends(res.data);
      } catch (e) {
        console.log('Error fetching trends', e);
      }
    };
    fetchTrends();
  }, [refreshFlag]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hi, {user?.name}</Text>
        <View style={styles.headerActionItems}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/profile')}
            style={styles.accountBtn}
          >
            <MaterialCommunityIcons name="account" size={18} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <MinimalButton
          title="🍽 Log Food"
          onPress={() => router.push('/FoodLog')}
        />
        <MinimalButton
          title="🏋️ Log Workout"
          onPress={() => router.push('/WorkoutLog')}
        />
        <MinimalButton
          title="🤖 AI Plan"
          onPress={() => router.push('/AIPlan')}
        />
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
        <Text style={styles.sectionTitle}>Today's Net Calories</Text>
        <Text style={styles.netCalories}>
          {Math.floor(trends?.trends?.[6]?.net) || 0} kcal
        </Text>
        <Text style={styles.subText}>
          Consumed: {Math.floor(trends?.trends?.[6]?.consumed) || 0} kcal •
          Burned: {Math.floor(trends?.trends?.[6]?.burned) || 0} kcal
        </Text>
      </View>

      {/* Calories Trend */}
      <Text style={styles.sectionTitle}>7-Day Calories Trend</Text>
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
        width={screenWidth - spacing.md * 2}
        height={220}
        chartConfig={{
          backgroundGradientFrom: colors.card,
          backgroundGradientTo: colors.card,
          // decimalPlaces: 0,
          color: () => colors.primary,
          labelColor: () => colors.muted,
        }}
        style={styles.chart}
        bezier
      />
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
  headerActionItems: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    marginBottom: spacing.md,
    color: colors.text,
  },
  accountBtn: {
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.border,
    marginLeft: spacing.md,
  },
  logoutBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
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
    borderRadius: spacing.lg,
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
  chart: {
    borderRadius: 12,
    marginBottom: spacing.md,
  },
});
