import client from '@/api/client';
import AlertDialog from '@/components/AlertDialog';
import ProfileModal from '@/components/ProfileModal';
import { AuthContext } from '@/context/AuthContext';
import { colors, fontSizes, spacing } from '@/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Profile() {
  const { logout } = useContext(AuthContext);
  const [user, setUser] = useState<any>(null);

  // Local states
  const [goal, setGoal] = useState<
    'maintain healthy' | 'weight gain' | 'weight loss'
  >('maintain healthy');
  const [targetWeight, setTargetWeight] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [dietaryPrefs, setDietaryPrefs] = useState('');

  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title?: string;
    message: string;
    variant?: 'info' | 'success' | 'warning' | 'danger';
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  } | null>(null);

  const showAlert = (config: typeof alertConfig) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await client.get('/user/me');
      setUser(res.data);
      setGoal(res.data.goals || 'maintain healthy');
      setTargetWeight(res.data.target_weight?.toString() || '');
      setName(res.data.name || '');
      setAge(res.data.age?.toString() || '');
      setWeight(res.data.weight_kg?.toString() || '');
      setHeight(res.data.height_cm?.toString() || '');
      setDietaryPrefs(res.data.dietary_prefs?.join(', ') || '');
    } catch (err) {
      console.log('Error fetching profile', err);
    }
  };

  const handleSaveGoals = async () => {
    try {
      await client.post('/user/goals', {
        goals: goal,
        target_weight: Number(targetWeight),
      });
      setGoalModalVisible(false);
      fetchProfile();
      showAlert({
        title: 'Success',
        message: 'Your goals have been updated.',
        variant: 'success',
        confirmText: 'OK',
        onConfirm: () => setAlertVisible(false),
      });
    } catch (err) {
      console.log('Error saving goals', err);
      showAlert({
        title: 'Error',
        message: 'Could not save goals',
        variant: 'danger',
        confirmText: 'OK',
        onConfirm: () => setAlertVisible(false),
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      await client.put('/user/me', {
        name,
        age: age ? Number(age) : null,
        height_cm: height ? Number(height) : null,
        weight_kg: weight ? Number(weight) : null,
        dietary_prefs: dietaryPrefs
          ? dietaryPrefs.split(',').map((p) => p.trim())
          : null,
      });
      setProfileModalVisible(false);
      fetchProfile();
      showAlert({
        title: 'Success',
        message: 'Profile updated successfully.',
        variant: 'success',
        confirmText: 'OK',
        onConfirm: () => setAlertVisible(false),
      });
    } catch (err) {
      console.log('Error updating profile', err);
      showAlert({
        title: 'Error',
        message: 'Could not update profile',
        variant: 'danger',
        confirmText: 'OK',
        onConfirm: () => setAlertVisible(false),
      });
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const handleDeleteAccount = () => {
    showAlert({
      title: 'Delete Account',
      message:
        'This action is permanent. Do you really want to delete your account?',
      variant: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await client.delete('/user');
          handleLogout();
        } catch (err) {
          showAlert({
            title: 'Error',
            message: 'Could not delete account',
            variant: 'danger',
            confirmText: 'OK',
            onConfirm: () => setAlertVisible(false),
          });
        }
      },
      onCancel: () => setAlertVisible(false),
    });
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Loading profile...</Text>
      </View>
    );
  }

  const bmi = user.bmi || 0;
  const segments = [
    { label: 'Underweight', min: 0, max: 18.49, color: '#3b82f6' },
    { label: 'Normal', min: 18.5, max: 24.99, color: '#22c55e' },
    { label: 'Overweight', min: 25, max: 29.9, color: '#facc15' },
    { label: 'Obese', min: 30, max: 100, color: '#ef4444' },
  ];
  const activeSegment = segments.find((s) => bmi >= s.min && bmi <= s.max);

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
        <Text style={styles.title}>User Account</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <TouchableOpacity onPress={() => setProfileModalVisible(true)}>
            <MaterialCommunityIcons
              name="pencil"
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
        <View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.meta}>
            {user?.age} yrs • {user?.gender} • {user?.height_cm} cm •{' '}
            {user?.weight_kg} kg • {user?.dietary_prefs?.join(', ')}
          </Text>
        </View>
      </View>

      {/* Goals Card */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>🎯 Goals</Text>
          <TouchableOpacity onPress={() => setGoalModalVisible(true)}>
            <MaterialCommunityIcons
              name="pencil"
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.goalValue}>{user.goals || 'Not set'}</Text>
        <Text style={styles.goalValue}>
          Target Weight: {user.target_weight ? `${user.target_weight} kg` : '—'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📊 BMI</Text>

        <View style={styles.bmiLabels}>
          {segments.map((seg) => (
            <View key={seg.label} style={styles.bmiLabelContainer}>
              <Text style={styles.bmiLabelText}>{seg.label}</Text>
              <Text style={styles.bmiRangeText}>
                {seg.min}–{seg.max >= 40 ? '40+' : seg.max}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.bmiBar}>
          {segments.map((seg) => (
            <View
              key={seg.label}
              style={[
                styles.bmiSegment,
                {
                  backgroundColor: seg.color,
                  flex: Math.min(seg.max, 40) - seg.min,
                },
              ]}
            />
          ))}
          <View
            style={[
              styles.bmiPointer,
              { left: `${(Math.min(bmi, 40) / 40) * 100}%` },
            ]}
          />
        </View>

        <Text style={styles.bmiText}>
          Your BMI: {bmi.toFixed(1)} ({activeSegment?.label || 'N/A'})
        </Text>
        <Text style={styles.motivation}>
          {activeSegment?.label === 'Normal'
            ? '🔥 Great! Keep maintaining your healthy lifestyle!'
            : activeSegment?.label === 'Underweight'
            ? '💡 Time to fuel your body with more nutrients!'
            : activeSegment?.label === 'Overweight'
            ? '⚡ Small steps daily will bring big results!'
            : activeSegment?.label === 'Obese'
            ? '💪 Every workout brings you closer to a healthier you!'
            : 'Start your fitness journey today!'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>⚙️ Account</Text>
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

      {/* Modals */}
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

      <ProfileModal
        visible={profileModalVisible}
        title="Update Profile"
        onClose={() => setProfileModalVisible(false)}
        onSave={handleSaveProfile}
      >
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />
        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />
        <Text style={styles.label}>Height (cm)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
        />
        <Text style={styles.label}>Dietary Preferences</Text>
        <Picker selectedValue={dietaryPrefs} onValueChange={setDietaryPrefs}>
          <Picker.Item label="Vegetarian" value="veg" />
          <Picker.Item label="Non-Vegetarian" value="non-veg" />
          <Picker.Item label="Vegan" value="vegan" />
        </Picker>
      </ProfileModal>
      {alertConfig && (
        <AlertDialog
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          variant={alertConfig.variant || 'info'}
          confirmText={alertConfig.confirmText}
          cancelText={alertConfig.cancelText}
          onConfirm={() => {
            setAlertVisible(false);
            alertConfig.onConfirm?.();
          }}
          onCancel={() => {
            setAlertVisible(false);
            alertConfig.onCancel?.();
          }}
        />
      )}
    </View>
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
  name: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
  email: { fontSize: fontSizes.sm, color: colors.muted },
  meta: { fontSize: fontSizes.sm, color: colors.muted },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  goalValue: {
    fontSize: fontSizes.md,
    color: colors.text,
    marginTop: spacing.xs,
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
  bmiLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  bmiLabelContainer: {
    flex: 1,
    alignItems: 'center',
  },
  bmiLabelText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  bmiRangeText: {
    fontSize: fontSizes.sm,
    color: colors.muted,
  },
  bmiPointer: {
    position: 'absolute',
    alignItems: 'center',
    top: -20,
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
  goalText: { fontSize: fontSizes.md, color: colors.text },
  item: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  itemText: { fontSize: fontSizes.md, color: colors.text },
  bmiBar: {
    flexDirection: 'row',
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  bmiSegment: { height: '100%' },
  bmiText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    marginTop: spacing.sm,
    color: colors.text,
  },
  motivation: {
    fontSize: fontSizes.sm,
    color: colors.muted,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
});
