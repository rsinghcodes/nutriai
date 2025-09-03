import client from '@/api/client';
import MinimalButton from '@/components/MinimalButton';
import { AuthContext } from '@/context/AuthContext';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { ProgressBar, RadioButton } from 'react-native-paper';

export default function OnboardingStepper() {
  const { token, setUser } = useContext(AuthContext);
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('male');
  const [dietaryPrefs, setDietaryPrefs] = useState('veg');
  const [goals, setGoals] = useState('maintain healthy');

  const handleOnboard = async () => {
    try {
      await client.post(
        '/auth/onboarding',
        {
          age: Number(age),
          weight_kg: Number(weight),
          height_cm: Number(height),
          gender,
          dietary_prefs: [dietaryPrefs],
          goals,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { data: updatedUser } = await client.get('/user/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(updatedUser);
      router.replace('/success');
    } catch (e: any) {
      Alert.alert('Onboarding failed', e.response?.data?.detail || e.message);
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <View style={styles.container}>
      <ProgressBar
        progress={step / 3}
        color="#4CAF50"
        style={styles.progress}
      />
      <Text style={styles.stepText}>Step {step} of 3</Text>

      {step === 1 && (
        <View>
          <Text style={styles.title}>Your Basics</Text>
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
        </View>
      )}

      {step === 2 && (
        <View>
          <Text style={styles.title}>Lifestyle</Text>

          <Text>Gender</Text>
          <Picker
            selectedValue={gender}
            onValueChange={setGender}
            style={styles.picker}
          >
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
          </Picker>

          <Text style={styles.title}>Dietary Preference</Text>
          <Picker
            selectedValue={dietaryPrefs}
            onValueChange={setDietaryPrefs}
            style={styles.picker}
          >
            <Picker.Item label="Vegetarian" value="veg" />
            <Picker.Item label="Non-Vegetarian" value="non-veg" />
            <Picker.Item label="Vegan" value="vegan" />
          </Picker>
        </View>
      )}

      {step === 3 && (
        <View>
          <Text style={styles.title}>Your Goal</Text>

          <RadioButton.Group onValueChange={setGoals} value={goals}>
            <View style={styles.radioRow}>
              <RadioButton value="weight loss" />
              <Text>Weight Loss</Text>
            </View>
            <View style={styles.radioRow}>
              <RadioButton value="weight gain" />
              <Text>Weight Gain</Text>
            </View>
            <View style={styles.radioRow}>
              <RadioButton value="maintain healthy" />
              <Text>Maintain Healthy</Text>
            </View>
          </RadioButton.Group>
        </View>
      )}

      <View style={styles.buttonRow}>
        {step > 1 && <MinimalButton title="Back" onPress={prevStep} />}
        {step < 3 && <MinimalButton title="Next" onPress={nextStep} />}
        {step === 3 && <MinimalButton title="Finish" onPress={handleOnboard} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  progress: { height: 8, borderRadius: 4, marginBottom: 10 },
  stepText: { textAlign: 'center', marginBottom: 15, fontWeight: '600' },
  input: {
    backgroundColor: '#FAFAFA',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
  },
  picker: { marginBottom: 15 },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  illustration: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 10,
    resizeMode: 'contain',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});
