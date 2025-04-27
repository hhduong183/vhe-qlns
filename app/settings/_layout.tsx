import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';

export default function SettingsLayout() {
  // Xử lý phím back vật lý trên Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Kiểm tra xem có đang ở trong một màn hình con không
      // Nếu đúng - để mặc định xử lý (trở về settings/index)
      // Nếu đang ở settings/index - cần xử lý back đến tabs/settings
      return false; // Để xử lý mặc định
    });

    return () => backHandler.remove();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Quay lại',
        headerTitleStyle: {
          fontWeight: 'bold',
        }
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="account-info" 
        options={{ 
          title: 'Thông tin tài khoản',
          headerBackTitleVisible: true,
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="change-password" 
        options={{ 
          title: 'Đổi mật khẩu',
          headerBackTitleVisible: true,
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="notifications" 
        options={{ 
          title: 'Thông báo',
          headerBackTitleVisible: true,
          presentation: 'card',
        }} 
      />
    </Stack>
  );
}