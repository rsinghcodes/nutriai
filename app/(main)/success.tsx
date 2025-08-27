import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import * as Progress from 'react-native-progress';

export default function OnboardingSuccess() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  const messages = [
    'Setting up your dashboard...',
    'Building a tailored experience for you...',
    'Fetching personalized meal plans...',
    'Almost there 🚀',
  ];
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    let interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          clearInterval(interval);
          router.replace('/dashboard');
          return 1;
        }
        return prev + 0.25;
      });

      setMessageIndex((prev) => (prev < messages.length - 1 ? prev + 1 : prev));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 Onboarding Complete!</Text>

      <Progress.Bar
        progress={progress}
        width={250}
        color="#4CAF50"
        borderRadius={10}
        style={{ marginTop: 30 }}
      />

      <Text style={styles.message}>{messages[messageIndex]}</Text>

      <ActivityIndicator
        size="large"
        color="#4CAF50"
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});
