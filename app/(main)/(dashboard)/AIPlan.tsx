import client from '@/api/client';
import { colors, fontSizes, spacing } from '@/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Plan {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export default function AIPlan() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await client.get('/plans');
      setPlans(res.data || []);
    } catch (error) {
      console.error('Error fetching plans', error);
    } finally {
      setLoading(false);
    }
  };

  const getTodayDayNumber = (): number => {
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 7 : jsDay;
  };

  const generateNewPlan = async () => {
    try {
      setLoading(true);
      const todayDayNum = getTodayDayNumber();
      await client.post('/generate-plan', null, {
        params: { days: todayDayNum },
      });
      fetchPlans();
    } catch (error) {
      console.error('Error generating plan', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const renderItem = ({ item }: { item: Plan }) => (
    <TouchableOpacity
      style={styles.cardWrapper}
      onPress={() => router.push(`/plans/${item.id}`)}
    >
      <LinearGradient
        colors={[colors.primary, colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="food-apple" size={22} color="#fff" />
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#fff" />
        </View>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDesc}>{item.description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleBox}>
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
          <Text style={styles.headerTitle}>AI Meal Plans</Text>
        </View>

        <TouchableOpacity onPress={fetchPlans}>
          <MaterialCommunityIcons
            name="refresh"
            size={22}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <CookingLoader />
      ) : plans.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="food-variant-off"
            size={48}
            color={colors.muted}
          />
          <Text style={styles.emptyText}>No plans yet 🤔</Text>
          <Text style={styles.emptySubText}>
            Tap below to generate your first AI plan!
          </Text>
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={generateNewPlan}>
        <MaterialCommunityIcons
          name="robot-excited-outline"
          size={28}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
}

function CookingLoader() {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim]);

  return (
    <View style={styles.loadingState}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <MaterialCommunityIcons
          name="chef-hat"
          size={60}
          color={colors.primary}
        />
      </Animated.View>
      <Text style={styles.loadingText}>Cooking up your meal plan… 🍳</Text>
      <Text style={styles.loadingSubText}>
        Sit tight while our AI preps something tasty for you!
      </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTitleBox: { flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: spacing.sm },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  cardWrapper: {
    marginBottom: spacing.md,
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    padding: spacing.lg,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  cardDesc: {
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  loadingSubText: {
    marginTop: spacing.xs,
    fontSize: fontSizes.sm,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  emptyText: {
    marginTop: spacing.sm,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  emptySubText: {
    marginTop: spacing.xs,
    fontSize: fontSizes.sm,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  fab: {
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
