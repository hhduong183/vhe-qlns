import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  
  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const isLoggedIn = false; // Thay đổi logic này để kiểm tra xem người dùng đã đăng nhập chưa
    
    // Nếu segment đầu tiên không phải là (tabs), người dùng đang ở màn hình đăng nhập
    const isInAuthGroup = segments[0] === '(tabs)';

    if (!isLoggedIn && isInAuthGroup) {
      // Nếu người dùng chưa đăng nhập nhưng đang cố gắng truy cập màn hình đã xác thực
      router.replace('/login');
    } else if (isLoggedIn && !isInAuthGroup) {
      // Nếu người dùng đã đăng nhập nhưng vẫn ở màn hình đăng nhập
      router.replace('/(tabs)');
    }
  }, [segments]);

  return <Slot />;
}
