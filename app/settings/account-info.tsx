import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

interface UserData {
  id?: number;
  ten_nv?: string;
  ma_nv?: string;
  ten_chuc_vu?: string;
  hinh_anh?: string;
  email?: string;
  phone?: string;
  department?: string;
  join_date?: string;
  ngay_sinh?: string;
}

export default function AccountInfoScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const parsedData = JSON.parse(userDataString);
          console.log('User data loaded:', parsedData);
          setUserData(parsedData);
        } else {
          Alert.alert(
            'Thông báo',
            'Không tìm thấy dữ liệu người dùng. Vui lòng đăng nhập lại.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Add a short delay before navigation
                  setTimeout(() => {
                    router.replace('/login');
                  }, 100);
                }
              }
            ]
          );
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu người dùng:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  // Return to settings screen
  const handleBack = () => {
    try {
      // Try explicit navigation to settings instead of relying on history
      router.replace('/settings');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback approach
      setTimeout(() => {
        router.push('/settings');
      }, 100);
    }
  };

  // Navigate to change password screen
  const handleChangePassword = () => {
    setTimeout(() => {
      router.push('/settings/change-password');
    }, 0);
  };

  // Display loading indicator while fetching data
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3c8dbc" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Thông tin tài khoản</Text>
        <View style={{ width: 20 }} />
      </View>

      {/* Profile photo and name section */}
      <View style={styles.profileHeader}>
        <Image
          source={userData?.hinh_anh
            ? { uri: `https://qlns.vhe.com.vn/uploads/staffs/${userData.hinh_anh}` }
            : require('../../assets/default-avatar.png')
          }
          style={styles.avatar}
          defaultSource={require('../../assets/default-avatar.png')}
        />
        <Text style={styles.name}>{userData?.ten_nv || 'Chưa cập nhật'}</Text>
        <Text style={styles.position}>{userData?.ten_chuc_vu || 'Chưa cập nhật chức vụ'}</Text>
      </View>

      {/* Personal information section */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

        <InfoItem icon="id-card" label="Mã nhân viên" value={userData?.ma_nv} />

        <InfoItem
          icon="envelope"
          label="Email"
          value={userData?.email}
        />

        <InfoItem
          icon="phone"
          label="Số điện thoại"
          value={userData?.phone}
        />

        <InfoItem
          icon="building"
          label="Phòng ban"
          value={userData?.department}
        />

        <InfoItem
          icon="calendar"
          label="Ngày vào công ty"
          value={userData?.join_date}
        />

        <InfoItem
          icon="birthday-cake"
          label="Ngày sinh"
          value={userData?.ngay_sinh}
        />
      </View>

      {/* Actions section */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleChangePassword}
        >
          <FontAwesome name="lock" size={20} color="white" />
          <Text style={styles.actionButtonText}>Đổi mật khẩu</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>
        * Để cập nhật thông tin cá nhân, vui lòng liên hệ với phòng Nhân sự.
      </Text>
    </ScrollView>
  );
}

// Reusable component for info items
function InfoItem({ icon, label, value }) {
  return (
    <View style={styles.infoItem}>
      <FontAwesome name={icon} size={20} color="#3c8dbc" />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Chưa cập nhật'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    backgroundColor: '#e1e1e1',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  position: {
    fontSize: 16,
    color: '#666',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  actionsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3c8dbc',
    borderRadius: 8,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  note: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    paddingHorizontal: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
});