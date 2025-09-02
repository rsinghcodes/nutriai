import MinimalButton from '@/components/MinimalButton';
import { AuthContext } from '@/context/AuthContext';
import { spacing } from '@/theme';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

const router = useRouter();

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace('/dashboard'); // redirect
    } catch (e: any) {
      Alert.alert('Login failed', e.response?.data?.detail || e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NutriAI Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <MinimalButton title="Login" onPress={handleLogin} />
      <Text onPress={() => router.replace('/register')} style={styles.link}>
        New user? Register
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
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
  link: { marginTop: 15, textAlign: 'center', color: 'blue' },
});
