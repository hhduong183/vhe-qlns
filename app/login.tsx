import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, Image } from 'react-native';
import { router } from 'expo-router';
// import * as Linking from 'expo-linking';
import { TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const [user_name, setUsername] = useState('');
  const [mat_khau, setPassword] = useState('');
  const { expired } = useLocalSearchParams();

  const router = useRouter();
  const { signIn } = useAuth();
  
  useEffect(() => {
    // Hiển thị thông báo nếu phiên đăng nhập hết hạn
    if (expired === 'true') {
      Alert.alert(
        'Phiên đăng nhập hết hạn',
        'Phiên đăng nhập của bạn đã hết hạn do không hoạt động. Vui lòng đăng nhập lại.',
        [{ text: 'OK' }]
      );
    }
  }, [expired]);

  const handleLogin = async () => {
    if (!user_name || !mat_khau) {
      Alert.alert('Error', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      const response = await fetch('https://test.vhe.com.vn/api/login_app.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_name, mat_khau }),
      });

      const result = await response.json();
      console.log('Kết quả API:', result);

      if (result.success) {
        // Lưu thông tin người dùng vào AsyncStorage
        const userData = {
          id: result.user_info.id,
          ten_nv: result.user_info.ten_nv,
          hinh_anh: result.user_info.hinh_anh,
          must_change_password: result.user_info.must_change_password,
          ngay_sinh: result.user_info.ngay_sinh || null,
        };
        
        // Use the signIn function instead of setUser
        await signIn(userData, result.token || ''); // Pass the token if it exists
        
        // Di chuyển router.replace ra khỏi Alert
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
        
        // Hiện thông báo sau khi đã bắt đầu chuyển trang
        Alert.alert(
          'Đăng nhập thành công', 
          `Chào mừng, ${result.user_info.ten_nv}!`
        );
      } else {
        Alert.alert('Đăng nhập thất bại', result.message || 'Thông tin đăng nhập không chính xác');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến server. Vui lòng thử lại.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/vhe_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      {/* <Text style={styles.title}>Đăng nhập</Text> */}
      <TextInput
        style={styles.input}
        placeholder="Tên đăng nhập"
        value={user_name}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={mat_khau}
        onChangeText={setPassword}
        secureTextEntry
      />
      {/* <Button style={styles.loginButton} title="Đăng nhập" onPress={handleLogin} /> */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text >Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
}
//style={styles.logoutButton}

const styles = StyleSheet.create({
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#99ffff',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start', // Changed from 'center' to 'flex-start'
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1d243d',
    paddingTop: 70, // Added padding at the top
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30, // Adjusted margin
    flexDirection: 'row',
    marginBottom: 10, // Increased bottom margin
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    width: '70%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
});