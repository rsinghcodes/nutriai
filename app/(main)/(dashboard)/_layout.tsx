import { DashboardProvider } from '@/context/DashboardContext';
import { Slot } from 'expo-router';

export default function DashboardLayout() {
  return (
    <DashboardProvider>
      <Slot />
    </DashboardProvider>
  );
}
