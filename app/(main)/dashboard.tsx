import { AuthContext } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import React, { useContext } from 'react';
import { Text, View } from 'react-native';

export default function Onboarding() {
  const { token, user } = useContext(AuthContext);

  if (!token) {
    return <Redirect href="/login" />;
  }

  if (user && !user.is_onboarded) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>Dashboard Screen</Text>
    </View>
  );
}
