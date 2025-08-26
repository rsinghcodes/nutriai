import client from '@/api/client';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

const router = useRouter();

export default function Onboarding() {
  const { user, token } = useContext(AuthContext);

  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('male');
  const [dietaryPrefs, setDietaryPrefs] = useState('veg'); // veg | non-veg | vegan
  const [goals, setGoals] = useState('maintain healthy'); // weight loss | weight gain | maintain healthy

  const handleOnboard = async () => {
    try {
      await client.post(
        '/v1/onboarding',
        {
          age: Number(age),
          weight: Number(weight),
          height: Number(height),
          gender,
          dietary_prefs: dietaryPrefs,
          goals,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Onboarding Complete', 'You can now access your dashboard.');
      router.replace('/dashboard');
    } catch (e: any) {
      Alert.alert('Onboarding failed', e.response?.data?.detail || e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Your Onboarding</Text>

      <TextInput
        placeholder="Age"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
        style={styles.input}
      />
      <TextInput
        placeholder="Weight (kg)"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
        style={styles.input}
      />
      <TextInput
        placeholder="Height (cm)"
        keyboardType="numeric"
        value={height}
        onChangeText={setHeight}
        style={styles.input}
      />
      <TextInput
        placeholder="Gender (male / female)"
        value={gender}
        onChangeText={setGender}
        style={styles.input}
      />
      <TextInput
        placeholder="Dietary Preference (veg / non-veg / vegan)"
        value={dietaryPrefs}
        onChangeText={setDietaryPrefs}
        style={styles.input}
      />
      <TextInput
        placeholder="Goal (weight loss / gain / maintain healthy)"
        value={goals}
        onChangeText={setGoals}
        style={styles.input}
      />

      <Button title="Submit Onboarding" onPress={handleOnboard} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
  },
});
