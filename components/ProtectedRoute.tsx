import { Redirect, Slot, usePathname } from 'expo-router';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { token, user } = useContext(AuthContext);
  const pathname = usePathname();

  if (!token) {
    return <Redirect href="/login" />;
  }

  if (user && !user.is_onboarded && pathname !== '/onboarding') {
    return <Redirect href="/onboarding" />;
  }

  return <Slot />; // renders the child route
}
