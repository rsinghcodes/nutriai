import client from '@/api/client';
import { colors, fontSizes, spacing } from '@/theme';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MinimalButton from './MinimalButton';

export default function WorkoutLogModal({ visible, onClose, onAdded }: any) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // pagination + filters
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // filters
  const [muscleGroup, setMuscleGroup] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [sort, setSort] = useState('name');

  // 🔎 Fetch workouts
  const fetchWorkouts = async (reset = false) => {
    if (fetching) return;
    setFetching(true);

    try {
      const params = new URLSearchParams();
      params.append('limit', '10');
      params.append('offset', reset ? '0' : String(page * 10));
      if (query.length >= 2) params.append('search', query);
      if (muscleGroup) params.append('muscle_group', muscleGroup);
      if (difficulty) params.append('difficulty', difficulty);
      if (sort) params.append('sort', sort);

      const res = await client.get(`/workouts?${params.toString()}`);
      const data = res.data;

      if (reset) {
        setResults(data.items);
        setPage(1);
      } else {
        setResults((prev) => [...prev, ...data.items]);
        setPage((p) => p + 1);
      }

      setHasMore(
        data.items.length > 0 && results.length + data.items.length < data.total
      );
    } catch (err) {
      console.log('Error fetching workouts', err);
    } finally {
      setFetching(false);
    }
  };

  // refetch whenever query or filters change
  useEffect(() => {
    if (visible) {
      fetchWorkouts(true);
    }
  }, [query, muscleGroup, difficulty, sort, visible]);

  // calories preview
  const estimatedCalories = useMemo(() => {
    if (!selectedWorkout) return 0;
    if (selectedWorkout.unit === 'minutes') {
      if (!duration) return 0;
      return Number(duration) * Number(selectedWorkout.calories_per_unit);
    } else {
      if (!sets || !reps) return 0;
      return (
        Number(sets) * Number(reps) * Number(selectedWorkout.calories_per_unit)
      );
    }
  }, [selectedWorkout, sets, reps, duration]);

  const handleSubmit = async () => {
    if (!selectedWorkout) return;
    setLoading(true);
    try {
      const payload: any = { workout_id: selectedWorkout.id };
      if (selectedWorkout.unit === 'minutes') {
        if (!duration) return;
        payload.duration_minutes = Number(duration);
      } else {
        if (!sets || !reps) return;
        payload.sets = Number(sets);
        payload.reps_per_set = Number(reps);
      }

      const res = await client.post('/workout-logs', payload);
      onAdded(res.data);

      resetForm();
      onClose();
    } catch (err: any) {
      console.log(
        'Error saving workout log',
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setQuery('');
    setResults([]);
    setSelectedWorkout(null);
    setSets('');
    setReps('');
    setDuration('');
    setPage(0);
    setHasMore(true);
    setMuscleGroup('');
    setDifficulty('');
    setSort('name');
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Add Workout Log</Text>

        {/* Search */}
        <TextInput
          placeholder="Search workout..."
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            setPage(0);
          }}
          style={styles.input}
        />

        {/* Filters */}
        <View style={styles.filterRow}>
          <Picker
            selectedValue={muscleGroup}
            style={styles.picker}
            onValueChange={(v) => setMuscleGroup(v)}
          >
            <Picker.Item label="All Muscles" value="" />
            <Picker.Item label="Chest" value="chest" />
            <Picker.Item label="Back" value="back" />
            <Picker.Item label="Legs" value="legs" />
            <Picker.Item label="Arms" value="arms" />
            <Picker.Item label="Shoulders" value="shoulders" />
            <Picker.Item label="Core" value="core" />
          </Picker>

          <Picker
            selectedValue={difficulty}
            style={styles.picker}
            onValueChange={(v) => setDifficulty(v)}
          >
            <Picker.Item label="All Levels" value="" />
            <Picker.Item label="Easy" value="easy" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="Hard" value="hard" />
          </Picker>

          <Picker
            selectedValue={sort}
            style={styles.picker}
            onValueChange={(v) => setSort(v)}
          >
            <Picker.Item label="Sort by Name" value="name" />
            <Picker.Item label="Calories" value="calories" />
            <Picker.Item label="Difficulty" value="difficulty" />
          </Picker>
        </View>

        {/* List */}
        {results.length > 0 && !selectedWorkout && (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestion}
                onPress={() => setSelectedWorkout(item)}
              >
                <Text style={styles.suggestionText}>{item.name}</Text>
                <Text style={styles.suggestionMeta}>
                  {item.calories_per_unit} kcal / {item.unit}
                </Text>
              </TouchableOpacity>
            )}
            onEndReached={() => {
              if (hasMore && !fetching) fetchWorkouts();
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              fetching ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : null
            }
          />
        )}

        {/* Selected Workout Form */}
        {selectedWorkout && (
          <View style={styles.selectedWorkout}>
            <Text style={styles.workoutName}>{selectedWorkout.name}</Text>
            <Text style={styles.workoutMeta}>
              {selectedWorkout.calories_per_unit} kcal per{' '}
              {selectedWorkout.unit}
            </Text>

            {selectedWorkout.unit === 'minutes' ? (
              <TextInput
                placeholder="Duration (mins)"
                keyboardType="numeric"
                value={duration}
                onChangeText={setDuration}
                style={styles.input}
              />
            ) : (
              <>
                <TextInput
                  placeholder="Sets"
                  keyboardType="numeric"
                  value={sets}
                  onChangeText={setSets}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Reps per set"
                  keyboardType="numeric"
                  value={reps}
                  onChangeText={setReps}
                  style={styles.input}
                />
              </>
            )}

            {estimatedCalories > 0 && (
              <Text style={styles.preview}>
                Estimated: {estimatedCalories.toFixed(1)} kcal
              </Text>
            )}
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttons}>
          <MinimalButton
            title="Cancel"
            onPress={() => {
              resetForm();
              onClose();
            }}
          />
          <MinimalButton
            title={loading ? 'Saving...' : 'Save'}
            onPress={handleSubmit}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  picker: {
    flex: 1,
    backgroundColor: colors.card,
    marginHorizontal: spacing.xs,
  },
  suggestion: {
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  suggestionMeta: { fontSize: fontSizes.sm, color: colors.muted },
  selectedWorkout: { marginVertical: spacing.md },
  workoutName: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  workoutMeta: {
    fontSize: fontSizes.sm,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  preview: {
    marginTop: spacing.sm,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.primary,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
});
