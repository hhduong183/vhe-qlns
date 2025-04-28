import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { forced } = useLocalSearchParams();
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Force password change mode if 'forced' parameter is present
  const isForced = forced === 'true';

  // Prevent going back if this is a forced password change
  useEffect(() => {
    if (isForced) {
      // Implement this logic if needed to prevent hardware back navigation
      // This depends on your navigation setup
    }
  }, [isForced]);

  const handleBack = () => {
    if (isForced) {
      Alert.alert(
        'Yêu cầu đổi mật khẩu',
        'Bạn cần phải đổi mật khẩu trước khi tiếp tục sử dụng ứng dụng.',
        [{ text: 'OK' }]
      );
      return;
    }
    router.back();
  };

  const handleChangePassword = async () => {
    // Remove the console log in production code
    // console.log(oldPassword, newPassword, confirmPassword);
    console.log(oldPassword, newPassword, confirmPassword);

    // Check fields individually - this is sufficient without the combined check
    if (!oldPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    
    if (!newPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu mới.');
      return;
    }
    
    if (!confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng xác nhận mật khẩu mới.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      // Get user info
      const userDataString = await AsyncStorage.getItem('userData');
      const token = await AsyncStorage.getItem('authToken');
      
      if (!userDataString || !token) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const userData = JSON.parse(userDataString);
      
      // Log request body for debugging
      const requestBody = {
        user_id: userData.id,
        current_password: oldPassword,
        new_password: newPassword
      };
      console.log('Request body:', requestBody);
      
      // Call API to change password
      const response = await fetch('https://test.vhe.com.vn/api/change_password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      // Check response status and log it
      console.log('Response status:', response.status);
      
      // Get response text first to check what we're receiving
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      // Only try to parse as JSON if there's content
      let result;
      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON Parse error:', parseError);
          throw new Error('Server response is not valid JSON');
        }
      } else {
        throw new Error('Server returned empty response');
      }
      
      if (result && result.success) {
        Alert.alert(
          'Thành công',
          'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.',
          [
            {
              text: 'OK',
              onPress: async () => {
                // Sign out and redirect to login
                await signOut();
                router.replace('/login');
              }
            }
          ]
        );
      } else {
        Alert.alert('Lỗi', (result && result.message) || 'Đổi mật khẩu thất bại.');
      }
    } catch (error) {
      console.error('Change password error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with back button (disabled if forced change) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Đổi mật khẩu</Text>
        <View style={{ width: 20 }} />
      </View>

      {isForced && (
        <View style={styles.warningBanner}>
          <FontAwesome name="exclamation-triangle" size={18} color="#ff9800" />
          <Text style={styles.warningText}>
            Bạn cần đổi mật khẩu trước khi tiếp tục sử dụng ứng dụng
          </Text>
        </View>
      )}

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu hiện tại</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu hiện tại"
            secureTextEntry
            value={oldPassword}
            onChangeText={setOldPassword}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu mới</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu mới"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập lại mật khẩu mới"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Đổi mật khẩu</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    padding: 12,
    marginVertical: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  warningText: {
    marginLeft: 10,
    color: '#795548',
    flex: 1,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#3c8dbc',
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});