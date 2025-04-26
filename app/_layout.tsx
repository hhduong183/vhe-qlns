import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create auth context
const AuthContext = createContext(null);

// Hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component that wraps your app
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Load user data from storage on app start
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Handle routing based on authentication
  useEffect(() => {
    if (isLoading) return;
    
    console.log('Auth state changed:', user ? 'User authenticated' : 'No user');
    
    const inAuthGroup = segments[0] === '(auth)';
    const inLoginScreen = segments[0] === 'login';
    
    if (!user && !inLoginScreen) {
      console.log('No user found, redirecting to login');
      router.replace('/login');
    } else if (user && inLoginScreen) {
      console.log('User is authenticated, redirecting to tabs');
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading]);

  if (isLoading) {
    // You could add a loading screen here
    return null; // or return a loading component
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Main layout component
export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
