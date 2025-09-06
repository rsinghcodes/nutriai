import client from '@/api/client';
import FoodLogModal from '@/components/FoodLogModal';
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

export default function FoodLog() {
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
      const res = await client.get(`/food-logs/summary?days=${daysMap[range]}`);
      const daily = res.data?.daily || [];
      const normalized = daily.map((d: any) => ({
        date: d.date,
        calories: d.calories,
        protein: d.protein,
        carbs: d.carbs,
        fats: d.fats,
      }));
      setSummaries(normalized);

      const totalCalories = res.data?.total_calories || 0;
      if (totalCalories > daysMap[range] * 2000 * 0.8) {
        setMotivation('🥗 Great job keeping your nutrition consistent!');
      } else if (totalCalories > 0) {
        setMotivation('🍎 Nice progress! Keep logging your meals.');
      } else {
        setMotivation('✨ Start by logging your first meal today!');
      }
    } catch (e) {
      console.log('Error fetching food summary', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDayLogs = async (date: string) => {
    if (dayLogs[date]) return;
    try {
      const res = await client.get(`/food-logs?date=${date}`);
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
    const { date, calories } = item;
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
          <Text style={styles.calories}>{calories.toFixed(1)} kcal</Text>
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
              <Text style={styles.meta}>No food logged</Text>
            ) : (
              dayLogs[date].map((log) => (
                <View key={log.id} style={styles.logRow}>
                  <MaterialCommunityIcons
                    name="food-apple"
                    size={20}
                    color={colors.primary}
                  />
                  <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                    <Text style={styles.foodName}>{log.food_name}</Text>
                    <Text style={styles.meta}>
                      {log.quantity} {log.unit} • {log.calories.toFixed(1)} kcal
                      {' • P:'}
                      {log.protein.toFixed(1)}g C:{log.carbs.toFixed(1)}g F:
                      {log.fats.toFixed(1)}g
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
        <Text style={styles.text}>Loading your food logs...</Text>
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
        data: sortedSummaries.map((d) => d.calories),
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
        <Text style={styles.title}>Food Log</Text>
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

      <FoodLogModal
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
  backButton: { marginRight: spacing.sm },
  headerSpacer: { width: 40 },
  title: { fontSize: fontSizes.xl, fontWeight: '700', color: colors.text },
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
  toggleText: { fontSize: fontSizes.sm, color: colors.text },
  chart: { borderRadius: 12, marginBottom: spacing.md },
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
  dateText: { fontSize: fontSizes.md, fontWeight: '600', color: colors.text },
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
  foodName: { fontSize: fontSizes.md, fontWeight: '600', color: colors.text },
  meta: { fontSize: fontSizes.sm, color: colors.muted, textAlign: 'center' },
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
