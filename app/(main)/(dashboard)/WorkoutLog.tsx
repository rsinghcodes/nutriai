import client from '@/api/client';
import WorkoutLogModal from '@/components/WorkoutLogModal';
import { colors, fontSizes, spacing } from '@/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function WorkoutLog() {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [dayLogs, setDayLogs] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [range, setRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [motivation, setMotivation] = useState('');

  const daysMap = { week: 7, month: 30, quarter: 90 };

  const fetchSummary = async () => {
    try {
      const res = await client.get(
        `/workout-logs/summary?days=${daysMap[range]}`
      );
      const daily = res.data?.daily || [];
      const normalized = daily.map((d: any) => ({
        date: d.date,
        total_calories: d.calories,
        workouts: d.workouts,
      }));
      setSummaries(normalized);

      // Simple motivation logic
      const totalWorkouts = res.data?.total_workouts || 0;
      if (totalWorkouts > daysMap[range] * 0.6) {
        setMotivation('🔥 Amazing consistency! Keep going strong.');
      } else if (totalWorkouts > 0) {
        setMotivation('🚀 You’re building momentum, keep pushing!');
      } else {
        setMotivation('✨ Start small, even one workout makes a difference!');
      }
    } catch (e) {
      console.log('Error fetching workout summary', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDayLogs = async (date: string) => {
    if (dayLogs[date]) return;
    try {
      const res = await client.get(`/workout-logs?date=${date}`);
      setDayLogs((prev) => ({ ...prev, [date]: res.data }));
    } catch (e) {
      console.log(`Error fetching logs for ${date}`, e);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [range]);

  const toggleExpand = (date: string) => {
    if (expandedDate === date) {
      setExpandedDate(null);
    } else {
      setExpandedDate(date);
      fetchDayLogs(date);
    }
  };

  const handleAdded = () => {
    setDayLogs({});
    fetchSummary();
  };

  const renderDay = ({ item }: any) => {
    const { date, total_calories } = item;
    const expanded = expandedDate === date;

    return (
      <View style={styles.dayCard}>
        <TouchableOpacity
          style={styles.summaryRow}
          onPress={() => toggleExpand(date)}
        >
          <Text style={styles.dateText}>
            {new Date(date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
          <Text style={styles.calories}>{total_calories.toFixed(1)} kcal</Text>
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={22}
            color={colors.muted}
          />
        </TouchableOpacity>

        {expanded && (
          <View style={styles.logsContainer}>
            {!dayLogs[date] ? (
              <Text style={styles.meta}>Loading...</Text>
            ) : dayLogs[date].length === 0 ? (
              <Text style={styles.meta}>No workouts logged</Text>
            ) : (
              dayLogs[date].map((log) => (
                <View key={log.id} style={styles.logRow}>
                  <MaterialCommunityIcons
                    name="dumbbell"
                    size={20}
                    color={colors.primary}
                  />
                  <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                    <Text style={styles.workoutName}>{log.workout_name}</Text>
                    <Text style={styles.meta}>
                      {log.unit === 'minutes'
                        ? `${log.duration_minutes} mins`
                        : `${log.sets} × ${log.reps_per_set} reps`}
                      {' • '}
                      {log.estimated_calories.toFixed(1)} kcal
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Loading your workout logs...</Text>
      </View>
    );
  }

  const sortedSummaries = [...summaries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const chartData = {
    labels: sortedSummaries.map((d) =>
      new Date(d.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    ),
    datasets: [
      {
        data: sortedSummaries.map((d) => d.total_calories),
        color: () => colors.primary,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Workout Log</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.toggleRow}>
        {(['week', 'month', 'quarter'] as const).map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setRange(r)}
            style={[
              styles.toggleBtn,
              range === r && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                range === r && { color: colors.card, fontWeight: '700' },
              ]}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {summaries.length > 0 ? (
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={{
            backgroundColor: colors.card,
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            // decimalPlaces: 0,
            color: () => colors.primary,
            labelColor: () => colors.text,
          }}
          style={styles.chart}
          bezier
        />
      ) : (
        <LineChart
          data={{
            labels: ['0', '0', '0', '0', '0', '0', '0'],
            datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }],
          }}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={{
            backgroundColor: colors.card,
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            color: () => colors.primary,
            labelColor: () => colors.text,
          }}
          style={styles.chart}
          bezier
        />
      )}

      <Text style={styles.motivation}>{motivation}</Text>

      <FlatList
        data={summaries}
        keyExtractor={(item) => item.date}
        renderItem={renderDay}
        contentContainerStyle={{ paddingBottom: spacing.lg }}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <MaterialCommunityIcons name="plus" size={28} color={colors.card} />
      </TouchableOpacity>

      <WorkoutLogModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdded={handleAdded}
      />
    </View>
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
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backButton: {
    marginRight: spacing.sm,
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.border,
  },
  toggleText: {
    fontSize: fontSizes.sm,
    color: colors.text,
  },
  chart: {
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  motivation: {
    textAlign: 'center',
    fontSize: fontSizes.md,
    marginBottom: spacing.lg,
    color: colors.muted,
  },
  dayCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginVertical: spacing.sm,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  calories: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.primary,
  },
  logsContainer: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  workoutName: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  meta: {
    fontSize: fontSizes.sm,
    color: colors.muted,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: fontSizes.md, color: colors.muted },
  addButton: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
});
