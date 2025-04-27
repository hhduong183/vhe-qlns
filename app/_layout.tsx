import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import React from 'react';
import { Slot } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkAppVersion } from '../utils/versionCheck';
import { SessionProvider } from '../contexts/SessionContext';
import { AuthProvider } from '../contexts/AuthContext';

// Main layout component
export default function RootLayout() {
  return (
    <AuthProvider>
      <SessionProvider>
        <Slot />
      </SessionProvider>
    </AuthProvider>
  );
}
