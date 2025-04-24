import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const [user_name, setUsername] = useState('');
  const [mat_khau, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!user_name || !mat_khau) {
      Alert.alert('Error', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      const response = await fetch('https://bakup.vhe.com.vn/login_app.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_name: user_name, mat_khau }),
      });

      const result = await response.json();
      if (result.success) {
        Alert.alert('Đăng nhập thành công', `Chào mừng, ${result.username}!`);
        navigation.navigate('Home'); // Điều hướng đến màn hình chính
      } else {
        Alert.alert('Đăng nhập thất bại', result.message || 'Thông tin đăng nhập không chính xác');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối đến server. Vui lòng thử lại.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>
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
      <Button title="Đăng nhập" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1d243d',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
});