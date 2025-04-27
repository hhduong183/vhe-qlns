import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateLastActivity, checkSessionTimeout, clearLastActivity } from '../utils/activityTracker';
import { saveAuthToken, removeAuthToken, getAuthToken } from '../utils/auth';
import { Alert } from 'react-native';

interface User {
  id: number;
  ten_nv: string;
  // Add other user properties if needed
}

interface AuthContextType {
  user: User | null;
  token: string | null; // Add token state
  isLoading: boolean;
  signIn: (userData: User, token: string) => Promise<void>; // Accept token
  signOut: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  updateActivity: () => Promise<void>; // Expose activity update
  checkSessionTimeout: () => Promise<void>; // Expose timeout check
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signIn = async (userData: User, receivedToken: string) => {
    try {
      console.log('[AuthContext signIn] Start. Received userData:', userData, 'Token:', receivedToken); // Log data received

      // Lưu userData
      const userDataString = JSON.stringify(userData);
      await AsyncStorage.setItem('userData', userDataString);
      console.log('[AuthContext signIn] AsyncStorage.setItem("userData", ...) executed.'); // Log after saving userData

      // Lưu token
      await saveAuthToken(receivedToken);
      console.log('[AuthContext signIn] saveAuthToken(...) executed.'); // Log after saving token (assuming saveAuthToken doesn't log internally)

      // Cập nhật activity timestamp
      await updateLastActivity();
      console.log('[AuthContext signIn] updateLastActivityTimestamp() executed.'); // Log after updating timestamp

      // Cập nhật state nội bộ
      setUser(userData);
      setToken(receivedToken);
      console.log('[AuthContext signIn] State updates set (setUser, setToken)');

    } catch (error) {
      console.error("Failed to sign in and save data:", error); // Log error during saving
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
      console.log('[AuthContext signIn] Finish - isLoading set to false');
    }
  };

  const signOut = async () => {
    try {
      console.log('[AuthContext signOut] Start');
      setIsLoading(true);
      await AsyncStorage.removeItem('userData');
      console.log('[AuthContext signOut] AsyncStorage.removeItem("userData") executed.'); // Log removal
      await removeAuthToken();
      console.log('[AuthContext signOut] removeAuthToken() executed.'); // Log removal
      await clearLastActivity();
      console.log('[AuthContext signOut] clearLastActivityTimestamp() executed.'); // Log clear
      setUser(null);
      setToken(null);
      console.log('[AuthContext signOut] State updates set (setUser, setToken to null)');

    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setIsLoading(false);
      console.log('[AuthContext signOut] Finish - isLoading set to false');
    }
  };

  const checkAuthStatus = async () => {
    try {
      console.log('[AuthContext checkAuthStatus] Start');
      setIsLoading(true);
      const userDataStr = await AsyncStorage.getItem('userData');
      const storedToken = await getAuthToken();
      console.log('[AuthContext checkAuthStatus] Read from AsyncStorage - userData:', userDataStr, 'Token:', storedToken); // Log data read

      if (userDataStr && storedToken) {
        console.log('[AuthContext checkAuthStatus] User data and token found');
        const userData = JSON.parse(userDataStr);
        setUser(userData);
        setToken(storedToken);
        setIsLoading(false);
      } else {
         console.log('[AuthContext checkAuthStatus] No user data or token found');
         setUser(null);
         setToken(null);
         setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to check auth status:", error);
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
    console.log('[AuthContext checkAuthStatus] Finish');
  };


  const updateActivity = async () => {
      if (user && token) {
          // console.log('[AuthContext updateActivity] Updating timestamp');
          await updateLastActivity();
      }
  };

  const checkSessionExpired = async () => {
    if (user && token) {
      // console.log('[AuthContext checkSessionTimeout] Checking for inactivity');
      const hasTimedOut = await checkSessionTimeout(); // This calls the imported function
      if (hasTimedOut) {
        signOut();
      }
    }
  };


  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading, 
      signIn, 
      signOut, 
      checkAuthStatus, 
      updateActivity, 
      checkSessionTimeout: checkSessionExpired // Rename this
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};