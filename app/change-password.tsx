import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới không khớp');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      // Get user ID from storage
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
        router.replace('/login');
        return;
      }

      const userDataObj = JSON.parse(userData);
      const userId = userDataObj.id;

      // // TEMPORARY: Use a mock response instead of the actual API
      // console.log('Using mock response while API is being fixed');
      
      // // Simulate network delay
      // await new Promise(resolve => setTimeout(resolve, 1000));
      
      // // Simulate successful response (you can modify for testing error scenarios)
      // const mockSuccess = true;
      
      // if (mockSuccess) {
      //   Alert.alert('Thành công', ' client Mật khẩu đã được thay đổi', [
      //     { text: 'OK', onPress: () => router.back() }
      //   ]);
      // } else {
      //   Alert.alert('Lỗi', 'Mật khẩu hiện tại không đúng');
      // }
      
      // /* COMMENTED OUT: Original API call code
      const authToken = await AsyncStorage.getItem('authToken');

      const response = await fetch('https://bakup.vhe.com.vn/api/change_password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          user_id: userId,
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      
      const responseText = await response.text();
      console.log('Raw response:', responseText.substring(0, 200));
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        Alert.alert('Lỗi', 'Máy chủ trả về dữ liệu không hợp lệ. Vui lòng thử lại sau.');
        setLoading(false);
        return;
      }
      
      if (result && result.success) {
        Alert.alert('Thành công', 'Mật khẩu đã được thay đổi', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Lỗi', result.message || 'Đổi mật khẩu không thành công');
      }
      // */
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Đổi mật khẩu</Text>
          <View style={{ width: 20 }} />
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Mật khẩu hiện tại</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu hiện tại"
              secureTextEntry={!showCurrentPassword}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              style={styles.eyeIcon}
            >
              <FontAwesome 
                name={showCurrentPassword ? "eye-slash" : "eye"} 
                size={20} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Mật khẩu mới</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu mới"
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.eyeIcon}
            >
              <FontAwesome 
                name={showNewPassword ? "eye-slash" : "eye"} 
                size={20} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <FontAwesome 
                name={showConfirmPassword ? "eye-slash" : "eye"} 
                size={20} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Đổi mật khẩu</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.noticeContainer}>
          <FontAwesome name="info-circle" size={20} color="#3c8dbc" style={styles.infoIcon} />
          <Text style={styles.noticeText}>
            Mật khẩu mới phải có ít nhất 6 ký tự. Khuyến khích sử dụng kết hợp chữ cái, số và ký tự đặc biệt để tăng tính bảo mật.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    padding: 20,
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    marginTop: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  submitButton: {
    backgroundColor: '#3c8dbc',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  noticeContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#e1f5fe',
    borderRadius: 8,
    marginHorizontal: 15,
    marginTop: 10,
  },
  infoIcon: {
    marginRight: 10,
  },
  noticeText: {
    flex: 1,
    color: '#555',
    fontSize: 14,
    lineHeight: 20,
  },
});