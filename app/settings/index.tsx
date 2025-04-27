import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, BackHandler, Platform } from 'react-native';

export default function SettingsIndexRedirect() {
  const [redirected, setRedirected] = useState(false);
  
  useEffect(() => {
    // Thêm timeout nhỏ để đảm bảo router đã sẵn sàng
    const timer = setTimeout(() => {
      if (!redirected) {
        setRedirected(true);
        router.replace('/(tabs)/settings');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [redirected]);
  
  // Xử lý nút back trên Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          router.replace('/(tabs)/settings');
          return true;
        }
      );
      
      return () => backHandler.remove();
    }
  }, []);
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#3c8dbc" />
    </View>
  );
}