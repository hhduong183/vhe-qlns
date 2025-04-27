import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext'; // Make sure this import is correct

type SessionContextType = {
  resetTimer: () => void;
};

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Thời gian timeout: 5 phút (300000 ms)
const SESSION_TIMEOUT = 5 * 60 * 1000;

export function SessionProvider({ children }) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const appState = useRef(AppState.currentState);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Đặt lại timer khi có hoạt động của người dùng
  const resetTimer = () => {
    if (!user) return;
    
    lastActivityRef.current = Date.now();
    
    // Xóa timer cũ nếu có
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Đặt timer mới
    timeoutRef.current = setTimeout(handleSessionTimeout, SESSION_TIMEOUT);
    
    // Lưu thời gian hoạt động cuối cùng vào AsyncStorage
    AsyncStorage.setItem('lastActivity', lastActivityRef.current.toString());
  };

  // Xử lý khi hết phiên làm việc
  const handleSessionTimeout = async () => {
    if (!user) return;
    
    const now = Date.now();
    const lastActivity = lastActivityRef.current;
    
    // Kiểm tra xem đã quá thời gian timeout chưa
    if (now - lastActivity >= SESSION_TIMEOUT) {
      console.log('Phiên làm việc đã hết hạn do không hoạt động');
      await signOut();
      router.replace('/login?expired=true');
    }
  };

  // Xử lý khi trạng thái app thay đổi (background, active)
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (!user) return;
    
    // Khi app quay lại foreground
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      const lastActivityStr = await AsyncStorage.getItem('lastActivity');
      const lastActivity = lastActivityStr ? parseInt(lastActivityStr) : Date.now();
      const now = Date.now();
      
      // Nếu quá thời gian timeout khi app ở background
      if (now - lastActivity >= SESSION_TIMEOUT) {
        console.log('Phiên làm việc đã hết hạn sau khi mở lại ứng dụng');
        await signOut();
        router.replace('/login?expired=true');
      } else {
        // Nếu chưa timeout, đặt lại timer
        resetTimer();
      }
    }
    
    appState.current = nextAppState;
  };

  useEffect(() => {
    // Nếu đã đăng nhập thì bắt đầu theo dõi hoạt động
    if (user) {
      // Khởi tạo timer lần đầu
      resetTimer();
      
      // Theo dõi trạng thái app (foreground/background)
      const subscription = AppState.addEventListener('change', handleAppStateChange);
      
      // Kiểm tra xem có phải đã timeout khi load app không
      const checkInitialTimeout = async () => {
        const lastActivityStr = await AsyncStorage.getItem('lastActivity');
        if (lastActivityStr) {
          const lastActivity = parseInt(lastActivityStr);
          const now = Date.now();
          
          if (now - lastActivity >= SESSION_TIMEOUT) {
            console.log('Phiên làm việc đã hết hạn khi khởi động ứng dụng');
            await signOut();
            router.replace('/login?expired=true');
          }
        }
      };
      
      checkInitialTimeout();
      
      return () => {
        subscription.remove();
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [user, router, signOut]);

  return (
    <SessionContext.Provider value={{ resetTimer }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};