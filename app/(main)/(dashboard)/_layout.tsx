import { DashboardProvider } from '@/context/DashboardContext';
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function DashboardLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DashboardProvider>
        <Slot />
      </DashboardProvider>
    </GestureHandlerRootView>
  );
}
