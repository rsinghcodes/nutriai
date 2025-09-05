import client from '@/api/client';
import { colors, fontSizes, spacing } from '@/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface PlanItem {
  food_name: string;
  quantity: number;
  unit: string;
}

interface Meal {
  meal: string;
  items: PlanItem[];
}

interface DayPlan {
  day: string;
  meals: Meal[];
}

interface PlanDetail {
  id: number;
  name: string;
  description: string;
  days: DayPlan[];
}

const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function PlanDetail() {
  const { plan_id } = useLocalSearchParams<{ plan_id: string }>();
  const [plan, setPlan] = useState<PlanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  function dayNameToNumber(dayName: string): number {
    const index = WEEKDAYS.indexOf(dayName);
    return index === -1 ? 1 : index + 1;
  }

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const res = await client.get(`/plans/${plan_id}`);
      setPlan(res.data);
    } catch (error) {
      console.error('Error fetching plan detail', error);
    } finally {
      setLoading(false);
    }
  };

  const regenerateDayPlan = async (day: string) => {
    try {
      setRegenerating(true);
      const dayNum = dayNameToNumber(day);
      await client.post('/generate-plan', null, {
        params: { days: dayNum },
      });
      await fetchPlan();
    } catch (error) {
      console.error('Error regenerating day plan', error);
    } finally {
      setRegenerating(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [plan_id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Could not load plan details 😕</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
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
        <Text style={styles.title}>{plan.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {plan.days.map((day) => (
        <View key={day.day} style={styles.dayCard}>
          <Text style={styles.dayTitle}>Day {day.day}</Text>

          {day.meals.map((meal, idx) => (
            <View key={idx} style={styles.mealCard}>
              <Text style={styles.mealTitle}>{meal.meal}</Text>

              {meal.items.map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  <MaterialCommunityIcons
                    name="circle-small"
                    size={18}
                    color={colors.muted}
                    style={{ marginRight: spacing.xs }}
                  />
                  <Text style={styles.itemText}>
                    {item.quantity} {item.unit} – {item.food_name}
                  </Text>
                </View>
              ))}
            </View>
          ))}

          {/* Regenerate Button */}
          <TouchableOpacity
            style={styles.regenBtn}
            disabled={regenerating}
            onPress={() => regenerateDayPlan(day.day)}
          >
            <Text style={styles.regenText}>
              {regenerating ? 'Cooking up fresh... 🍳' : 'Remix this day 🎲'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: spacing.md,
//   },
//   title: {
//     fontSize: fontSizes.lg,
//     fontWeight: '700',
//     color: colors.text,
//   },
//   headerSpacer: {
//     width: 40,
//   },
//   description: {
//     fontSize: fontSizes.md,
//     color: colors.muted,
//     marginBottom: spacing.md,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: fontSizes.md,
//     color: colors.muted,
//   },
//   hero: {
//     paddingTop: spacing.lg,
//     paddingHorizontal: spacing.md,
//     paddingBottom: spacing.xl,
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//   },
//   backButton: {
//     marginBottom: spacing.md,
//   },
//   heroTitle: {
//     fontSize: fontSizes.xl,
//     fontWeight: '700',
//     color: '#fff',
//     marginBottom: spacing.xs,
//   },
//   heroDesc: {
//     fontSize: fontSizes.md,
//     color: 'rgba(255,255,255,0.85)',
//   },
//   dayCard: {
//     backgroundColor: colors.card,
//     borderRadius: 20,
//     padding: spacing.md,
//     marginHorizontal: spacing.md,
//     marginTop: spacing.lg,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   dayTitle: {
//     fontSize: fontSizes.lg,
//     fontWeight: '600',
//     color: colors.primary,
//     marginBottom: spacing.sm,
//   },
//   mealCard: {
//     marginBottom: spacing.md,
//   },
//   mealHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: spacing.xs,
//   },
//   mealTitle: {
//     fontSize: fontSizes.md,
//     fontWeight: '600',
//     color: colors.text,
//     marginLeft: spacing.xs,
//   },
//   itemRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: spacing.xs,
//     marginLeft: spacing.lg,
//   },
//   itemText: {
//     fontSize: fontSizes.sm,
//     color: colors.muted,
//   },
//   regenBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     alignSelf: 'center',
//     backgroundColor: colors.primary,
//     paddingVertical: spacing.sm,
//     paddingHorizontal: spacing.lg,
//     borderRadius: 30,
//     marginTop: spacing.md,
//   },
//   regenText: {
//     color: '#fff',
//     fontSize: fontSizes.sm,
//     fontWeight: '600',
//   },
// });
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSizes.md,
    color: colors.muted,
  },
  backButton: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  headerSpacer: {
    width: 24,
  },
  dayCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
  },
  dayTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.text,
  },
  mealCard: {
    marginBottom: spacing.sm,
  },
  mealTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
    color: colors.text,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    marginLeft: spacing.sm,
  },
  itemText: {
    fontSize: fontSizes.sm,
    color: colors.muted,
  },
  regenBtn: {
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
    marginTop: spacing.md,
  },
  regenText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
});
