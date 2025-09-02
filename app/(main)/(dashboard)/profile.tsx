import client from '@/api/client';
import ProfileModal from '@/components/ProfileModal';
import { AuthContext } from '@/context/AuthContext';
import { colors, fontSizes, spacing } from '@/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Profile() {
  const { logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [goalModalVisible, setGoalModalVisible] = useState<boolean>(false);

  const [goal, setGoal] = useState<
    'maintain healthy' | 'weight gain' | 'weight loss'
  >('maintain healthy');
  const [targetWeight, setTargetWeight] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');

  const fetchProfile = async () => {
    try {
      const res = await client.get('/user/me');
      setUser(res.data);
      setGoal((res.data.goals as any) || 'maintain healthy');
      if (res.data.target_weight)
        setTargetWeight(res.data.target_weight.toString());
    } catch (err) {
      console.log('Error fetching profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // helper
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5)
      return {
        label: 'Underweight',
        color: '#3b82f6',
        quote: 'Fuel up 💪 Your body needs more energy.',
      };
    if (bmi < 25)
      return {
        label: 'Healthy',
        color: '#10b981',
        quote: 'Great job! 🌟 Keep maintaining your balance.',
      };
    if (bmi < 30)
      return {
        label: 'Overweight',
        color: '#f59e0b',
        quote: 'Small steps 🚶 daily add up to big results.',
      };
    return {
      label: 'Obese',
      color: '#ef4444',
      quote: 'You’re stronger than you think ❤️ Start today, not someday.',
    };
  };

  // inside component
  const bmi = user?.bmi || 0;
  const bmiData = getBMICategory(bmi);

  // normalize BMI to position arrow (scale: 0–40 for simplicity)
  const positionPercent = Math.min((bmi / 40) * 100, 100);

  const handleSaveGoals = async () => {
    try {
      await client.post('/user/goals', {
        goals: goal,
        target_weight: Number(targetWeight),
        unit,
      });
      Alert.alert('✅ Saved', 'Your goals have been updated.');
      setGoalModalVisible(false);
      fetchProfile();
    } catch (err) {
      console.log('Error saving goals', err);
      Alert.alert('Error', 'Could not save goals');
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent. Do you really want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // await client.delete('/user');
              handleLogout();
            } catch (err) {
              Alert.alert('Error', 'Could not delete account');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Loading profile...</Text>
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
        <Text style={styles.title}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* User Card */}
      <View style={styles.card}>
        <View style={styles.avatar} />
        <View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.meta}>
            {user?.age} yrs • {user?.gender} • {user?.height_cm} cm •{' '}
            {user?.weight_kg} kg
          </Text>
        </View>
      </View>

      {/* BMI Section */}
      {/* BMI Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📊 BMI Status</Text>
        <Text style={{ fontSize: fontSizes.sm, color: colors.muted }}>
          Your BMI: {bmi.toFixed(1)} ({bmiData.label})
        </Text>

        {/* Segmented Bar */}
        <View style={styles.scaleContainer}>
          <View
            style={[styles.segment, { backgroundColor: '#3b82f6', flex: 18.5 }]}
          />
          <View
            style={[styles.segment, { backgroundColor: '#10b981', flex: 6.4 }]}
          />
          <View
            style={[styles.segment, { backgroundColor: '#f59e0b', flex: 5 }]}
          />
          <View
            style={[styles.segment, { backgroundColor: '#ef4444', flex: 10 }]}
          />
        </View>

        {/* Arrow marker */}
        <View
          style={{ marginTop: -6, width: '100%', alignItems: 'flex-start' }}
        >
          <Text style={{ left: `${positionPercent}%`, position: 'absolute' }}>
            🔻
          </Text>
        </View>

        {/* Labels for ranges */}
        <View style={styles.labelsRow}>
          <Text style={[styles.labelText, { color: '#3b82f6' }]}>Under</Text>
          <Text style={[styles.labelText, { color: '#10b981' }]}>Healthy</Text>
          <Text style={[styles.labelText, { color: '#f59e0b' }]}>Over</Text>
          <Text style={[styles.labelText, { color: '#ef4444' }]}>Obese</Text>
        </View>

        {/* Motivational Quote */}
        <Text
          style={{
            marginTop: spacing.sm,
            fontStyle: 'italic',
            color: bmiData.color,
          }}
        >
          "{bmiData.quote}"
        </Text>
      </View>

      {/* Goals */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>🎯 Goals</Text>
          <TouchableOpacity onPress={() => setGoalModalVisible(true)}>
            <MaterialCommunityIcons
              name="pencil"
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Display saved goal */}
        <Text style={styles.goalValue}>{user?.goals || 'No goal set yet'}</Text>
        <Text style={styles.goalSub}>
          Target Weight:{' '}
          {user?.target_weight ? `${user.target_weight} kg` : '—'}
        </Text>
      </View>

      {/* Account */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>⚙️ Account</Text>

        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemText}>Update Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={handleLogout}>
          <Text style={styles.itemText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.item, { backgroundColor: '#fee2e2' }]}
          onPress={handleDeleteAccount}
        >
          <Text style={[styles.itemText, { color: '#dc2626' }]}>
            Delete Account
          </Text>
        </TouchableOpacity>
      </View>

      <ProfileModal
        visible={goalModalVisible}
        title="Update Goals"
        onClose={() => setGoalModalVisible(false)}
        onSave={handleSaveGoals}
      >
        <View style={styles.row}>
          {['maintain healthy', 'weight gain', 'weight loss'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[
                styles.goalBtn,
                goal === g && { backgroundColor: colors.primary },
              ]}
              onPress={() => setGoal(g as any)}
            >
              <Text style={[styles.goalText, goal === g && { color: '#fff' }]}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Target Weight (kg)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={targetWeight}
          onChangeText={setTargetWeight}
        />
      </ProfileModal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: fontSizes.md, color: colors.muted },
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.border,
    marginRight: spacing.md,
  },
  name: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
  email: { fontSize: fontSizes.sm, color: colors.muted },
  meta: { fontSize: fontSizes.sm, color: colors.muted },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  label: { fontSize: fontSizes.sm, color: colors.muted, marginTop: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  scaleContainer: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  segment: {
    height: '100%',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  labelText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalBtn: {
    flex: 1,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
  },
  goalText: { fontSize: fontSizes.sm, color: colors.text, textAlign: 'center' },
  goalValue: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
  },
  goalSub: {
    fontSize: fontSizes.sm,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  item: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  itemText: { fontSize: fontSizes.md, color: colors.text },
});
