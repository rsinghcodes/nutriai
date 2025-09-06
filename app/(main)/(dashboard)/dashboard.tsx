import client from '@/api/client';
import MinimalButton from '@/components/MinimalButton';
import ProgressRing from '@/components/ProgressRing';
import { AuthContext } from '@/context/AuthContext';
import { useDashboard } from '@/context/DashboardContext';
import { colors, fontSizes, spacing } from '@/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function Dashboard() {
  const [trends, setTrends] = useState<any>(null);
  const [water, setWater] = useState(0);
  const [steps, setSteps] = useState(0);
  const [activeSheet, setActiveSheet] = useState<'water' | 'steps' | null>(
    null
  );
  const [manualValue, setManualValue] = useState('');

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['25%', '40%'], []);

  const router = useRouter();
  const { refreshFlag } = useDashboard();
  const { logout, user } = useContext(AuthContext);

  const WATER_GOAL = 2000; // ml
  const STEP_GOAL = 10000; // steps

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendRes, waterRes, stepRes] = await Promise.all([
          client.get('/dashboard/trends?days=7'),
          client.get('/tracking/water/today'),
          client.get('/tracking/steps/today'),
        ]);
        setTrends(trendRes.data);
        setWater(waterRes.data.amount);
        setSteps(stepRes.data.steps);
      } catch (e) {
        console.log('Error fetching data', e);
      }
    };
    fetchData();
  }, [refreshFlag]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const logWater = async (amount: number) => {
    try {
      const res = await client.post('/tracking/water', { amount });
      setWater(res.data.amount);
    } catch (e) {
      console.log('Error logging water', e);
    }
  };

  const logSteps = async (count: number) => {
    try {
      const res = await client.post('/tracking/steps', { steps: count });
      setSteps(res.data.steps);
    } catch (e) {
      console.log('Error logging steps', e);
    }
  };

  const openSheet = useCallback((type: 'water' | 'steps') => {
    setActiveSheet(type);
    setManualValue('');
    bottomSheetRef.current?.expand();
  }, []);

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setActiveSheet(null);
    setManualValue('');
  }, []);

  const handleSave = () => {
    const value = parseInt(manualValue, 10);
    if (!isNaN(value) && value > 0) {
      if (activeSheet === 'water') logWater(value);
      if (activeSheet === 'steps') logSteps(value);
      closeSheet();
    }
  };

  return (
    <>
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

        <Text style={styles.sectionTitle}>Daily Progress</Text>
        <View style={styles.dailyProgress}>
          <TouchableOpacity
            style={styles.progressItem}
            onPress={() => openSheet('steps')}
          >
            <ProgressRing
              value={steps}
              goal={STEP_GOAL}
              label="Steps"
              color={colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.progressItem}
            onPress={() => openSheet('water')}
          >
            <ProgressRing
              value={water}
              goal={WATER_GOAL}
              label="Water (ml)"
              color={colors.accent}
            />
          </TouchableOpacity>
        </View>

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
            color: () => colors.primary,
            labelColor: () => colors.muted,
          }}
          style={styles.chart}
          bezier
        />
      </ScrollView>

      {activeSheet && (
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={() => setActiveSheet(null)}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>
            {activeSheet === 'water' ? 'Log Water' : 'Log Steps'}
          </Text>

          <View style={styles.sheetBtns}>
            {activeSheet === 'water' ? (
              <>
                <MinimalButton
                  title="+100ml"
                  variant="secondary"
                  onPress={() => logWater(100)}
                />
                <MinimalButton
                  title="+250ml"
                  variant="secondary"
                  onPress={() => logWater(250)}
                />
                <MinimalButton
                  title="+500ml"
                  variant="secondary"
                  onPress={() => logWater(500)}
                />
              </>
            ) : (
              <>
                <MinimalButton
                  title="+500"
                  variant="secondary"
                  onPress={() => logSteps(500)}
                />
                <MinimalButton
                  title="+1000"
                  variant="secondary"
                  onPress={() => logSteps(1000)}
                />
                <MinimalButton
                  title="+2000"
                  variant="secondary"
                  onPress={() => logSteps(2000)}
                />
              </>
            )}
          </View>
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>
          <View>
            <TextInput
              placeholder={
                activeSheet === 'water' ? 'Enter ml' : 'Enter steps count'
              }
              keyboardType="numeric"
              style={styles.input}
              value={manualValue}
              onChangeText={setManualValue}
            />
            <MinimalButton onPress={handleSave} title="Save" />
          </View>
        </BottomSheetView>
      </BottomSheet>
    </>
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
  headerActionItems: { flexDirection: 'row', alignItems: 'center' },
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
  subText: { fontSize: fontSizes.sm, color: colors.muted },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
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
  chart: { borderRadius: 12, marginBottom: spacing.md },
  sheetContent: { flex: 1, padding: spacing.lg },
  sheetTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  sheetBtns: { flexDirection: 'row', justifyContent: 'space-around' },
  input: {
    backgroundColor: '#FAFAFA',
    borderRadius: spacing.lg,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  orText: {
    marginHorizontal: spacing.sm,
    fontSize: fontSizes.sm,
    color: colors.muted,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
});
