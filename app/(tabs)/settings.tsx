import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../_layout';
import Constants from 'expo-constants'; // Add this import

export default function Settings() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const { setUser } = useAuth();
  
  // Get app version from app.json
  const appVersion = Constants.expoConfig?.version || 'Ôi zồi ôi!'; // Fallback version if not found

  // Fetch user info on component mount
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          setUsername(user.username || user.fullname || 'Người dùng');
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      }
    };

    getUserInfo();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              // Xóa dữ liệu người dùng
              await AsyncStorage.removeItem('userData');
              // Xóa các dữ liệu khác nếu cần
              // await AsyncStorage.multiRemove(['token', 'otherData']);
              // Update auth context
              setUser(null);
              // Chuyển hướng về trang đăng nhập
              router.replace('/login');
            } catch (error) {
              console.error('Lỗi khi đăng xuất:', error);
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.userInfoContainer}>
        <FontAwesome name="user-circle" size={60} color="#3c8dbc" />
        <Text style={styles.username}>{username}</Text>
      </View>

      <Text style={styles.sectionTitle}>Tài khoản</Text>

      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => router.push('/account-info')}
      >
        <FontAwesome name="user" size={20} color="#333" />
        <Text style={styles.settingText}>Thông tin tài khoản</Text>
        <FontAwesome name="angle-right" size={20} color="#999" style={styles.chevron} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => router.push('/change-password')}
      >
        <FontAwesome name="lock" size={20} color="#333" />
        <Text style={styles.settingText}>Đổi mật khẩu</Text>
        <FontAwesome name="angle-right" size={20} color="#999" style={styles.chevron} />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Cài đặt chung</Text>

      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => router.push('/notifications')}
      >
        <FontAwesome name="bell" size={20} color="#333" />
        <Text style={styles.settingText}>Thông báo</Text>
        <FontAwesome name="angle-right" size={20} color="#999" style={styles.chevron} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <FontAwesome name="sign-out" size={20} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Phiên bản {appVersion}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
    color: '#666',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingText: {
    marginLeft: 15,
    fontSize: 16,
    flex: 1,
  },
  chevron: {
    marginLeft: 'auto',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  versionText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
    fontSize: 12,
  }
});