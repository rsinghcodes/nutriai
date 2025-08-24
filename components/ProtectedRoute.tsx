import { Redirect, Slot } from 'expo-router';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { token, user } = useContext(AuthContext);

  if (!token) {
    return <Redirect href="/login" />;
  }

  if (user && !user.is_onboarded) {
    return <Redirect href="/onboarding" />;
  }

  return <Slot />; // renders the child route
}
