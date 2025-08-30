import ProtectedRoute from '@/components/ProtectedRoute';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MainLayout() {
  return (
    <SafeAreaView style={styles.safe}>
      <ProtectedRoute>
        <Stack screenOptions={{ headerShown: false }} />
      </ProtectedRoute>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
});
