import client from '@/api/client';
import { useDashboard } from '@/context/DashboardContext';
import { colors, fontSizes, spacing } from '@/theme';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import MinimalButton from './MinimalButton';

export default function FoodLogModal({ visible, onClose, onAdded }: any) {
  const [foodQuery, setFoodQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [quantity, setQuantity] = useState('');
  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState('g');
  const [items, setItems] = useState([
    { label: 'Grams (g)', value: 'g' },
    { label: 'Milliliters (ml)', value: 'ml' },
    { label: 'Piece', value: 'piece' },
  ]);
  const [loading, setLoading] = useState(false);

  // Filters & pagination
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Optional nutrition filters
  const [minCalories, setMinCalories] = useState('');
  const [maxCalories, setMaxCalories] = useState('');

  const { refreshDashboard } = useDashboard();

  useEffect(() => {
    if (!visible) return; // Reset when modal opens
    fetchFoods(true);
  }, [foodQuery, sortBy, order, minCalories, maxCalories, visible]);

  const fetchFoods = async (reset = false) => {
    try {
      const params = new URLSearchParams();
      if (foodQuery) params.append('search', foodQuery);
      if (sortBy) params.append('sort_by', sortBy);
      if (order) params.append('order', order);
      if (minCalories) params.append('min_calories', minCalories);
      if (maxCalories) params.append('max_calories', maxCalories);
      params.append('page', reset ? '1' : page.toString());
      params.append('per_page', '10');

      const res = await client.get(`/foods?${params.toString()}`);
      const { items, total } = res.data;

      if (reset) {
        setSearchResults(items);
        setPage(2);
      } else {
        setSearchResults((prev) => [...prev, ...items]);
        setPage((p) => p + 1);
      }

      setHasMore(
        items.length > 0 && searchResults.length + items.length < total
      );
    } catch (err) {
      console.log('Error fetching foods', err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFood) return;
    setLoading(true);
    try {
      const payload = {
        food_id: selectedFood.id,
        quantity: Number(quantity),
        unit,
      };
      const res = await client.post('/food-logs', payload);

      onAdded(res.data);
      refreshDashboard();
      resetForm();
      onClose();
    } catch (err: any) {
      console.log('Error saving food log', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFoodQuery('');
    setSearchResults([]);
    setSelectedFood(null);
    setQuantity('');
    setUnit('g');
    setPage(1);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Add Food Log</Text>

        {/* 🔍 Search */}
        <TextInput
          placeholder="Search food..."
          value={foodQuery}
          onChangeText={setFoodQuery}
          style={styles.input}
        />

        {/* 🔽 Sort + Filters */}
        <View style={styles.row}>
          <Picker
            selectedValue={sortBy}
            style={styles.picker}
            onValueChange={setSortBy}
          >
            <Picker.Item label="Name" value="name" />
            <Picker.Item label="Calories" value="calories" />
            <Picker.Item label="Protein" value="protein" />
            <Picker.Item label="Carbs" value="carbs" />
            <Picker.Item label="Fats" value="fats" />
          </Picker>

          <Picker
            selectedValue={order}
            style={styles.picker}
            onValueChange={setOrder}
          >
            <Picker.Item label="Asc" value="asc" />
            <Picker.Item label="Desc" value="desc" />
          </Picker>
        </View>

        <View style={styles.row}>
          <TextInput
            placeholder="Min kcal"
            keyboardType="numeric"
            value={minCalories}
            onChangeText={setMinCalories}
            style={[styles.input, { flex: 1, marginRight: spacing.sm }]}
          />
          <TextInput
            placeholder="Max kcal"
            keyboardType="numeric"
            value={maxCalories}
            onChangeText={setMaxCalories}
            style={[styles.input, { flex: 1 }]}
          />
        </View>

        {/* Autocomplete / Food List */}
        {searchResults.length > 0 && !selectedFood && (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestion}
                onPress={() => setSelectedFood(item)}
              >
                <Text style={styles.suggestionText}>{item.name}</Text>
                <Text style={styles.suggestionMeta}>
                  {item.calories} kcal / {item.reference_amount}
                  {item.reference_unit}
                </Text>
              </TouchableOpacity>
            )}
            ListFooterComponent={
              hasMore ? (
                <TouchableOpacity onPress={() => fetchFoods()}>
                  <Text
                    style={{
                      color: colors.primary,
                      textAlign: 'center',
                      marginVertical: 10,
                    }}
                  >
                    Load More
                  </Text>
                </TouchableOpacity>
              ) : null
            }
          />
        )}

        {selectedFood && (
          <View style={styles.selectedFood}>
            <Text style={styles.foodName}>{selectedFood.name}</Text>
            <Text style={styles.foodMeta}>
              {selectedFood.calories} kcal per {selectedFood.reference_amount}{' '}
              {selectedFood.reference_unit}
            </Text>

            <TextInput
              placeholder="Quantity"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              style={styles.input}
            />

            <DropDownPicker
              open={open}
              value={unit}
              items={items}
              setOpen={setOpen}
              setValue={setUnit}
              setItems={setItems}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
            />
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttons}>
          <MinimalButton
            title="Cancel"
            onPress={() => {
              resetForm(); // ⬅️ Clear state
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
  row: { flexDirection: 'row', marginBottom: spacing.md },
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
    backgroundColor: colors.card,
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
  selectedFood: { marginVertical: spacing.md },
  foodName: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
  foodMeta: {
    fontSize: fontSizes.sm,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  picker: {
    flex: 1,
    backgroundColor: colors.card,
    marginHorizontal: spacing.sm,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  dropdown: {
    marginTop: spacing.sm,
    borderColor: colors.border,
  },
  dropdownContainer: {
    borderColor: colors.border,
  },
});
