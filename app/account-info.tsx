import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

export default function AccountInfoScreen() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const data = await AsyncStorage.getItem('userData');
        console.log('Raw AsyncStorage userData:', data);
        
        if (data) {
          const parsedData = JSON.parse(data);
          console.log('Parsed userData object:', parsedData);
          console.log('userData properties:', Object.keys(parsedData));
          setUserData(parsedData);
        } else {
          console.log('No userData found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  // Add this before the conditional rendering to see userData right before rendering
  console.log('Current userData state before rendering:', userData);
  
  if (loading) {//
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3c8dbc" />
      </View>
    );
  }

  // Log specific fields we're trying to display
  console.log('User Details:', {
    name: userData?.ten_nv,
    position: userData?.ten_chuc_vu,
    employeeId: userData?.ma_nv,
    email: userData?.email,
    phone: userData?.phone,
    department: userData?.department,
    joinDate: userData?.join_date,
    avatar: userData?.hinh_anh
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Thông tin tài khoản</Text>
        <View style={{ width: 20 }} />
      </View>

      <View style={styles.profileHeader}>
        <Image 
          source={           
              userData?.hinh_anh 
                ? { uri: `https://qlns.vhe.com.vn/uploads/staffs/${userData?.hinh_anh}` }
                : require('../assets/default-avatar.png')
          }
          style={styles.avatar}
        />
        <Text style={styles.name}>{userData?.ten_nv || 'Người dùng'}</Text>
        <Text style={styles.position}>{userData?.ten_chuc_vu || 'Chức vụ chưa được cập nhật'}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        
        <View style={styles.infoItem}>
          <FontAwesome name="id-card" size={20} color="#3c8dbc" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Mã nhân viên</Text>
            <Text style={styles.infoValue}>{userData?.ma_nv || 'Chưa cập nhật'}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <FontAwesome name="envelope" size={20} color="#3c8dbc" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{userData?.email || 'Chưa cập nhật'}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <FontAwesome name="phone" size={20} color="#3c8dbc" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Số điện thoại</Text>
            <Text style={styles.infoValue}>{userData?.phone || 'Chưa cập nhật'}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <FontAwesome name="building" size={20} color="#3c8dbc" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phòng ban</Text>
            <Text style={styles.infoValue}>{userData?.department || 'Chưa cập nhật'}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <FontAwesome name="calendar" size={20} color="#3c8dbc" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Ngày vào công ty</Text>
            <Text style={styles.infoValue}>{userData?.join_date || 'Chưa cập nhật'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/change-password')}
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
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  position: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  infoSection: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#555',
  },
  infoItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#888',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    marginTop: 3,
  },
  actionsSection: {
    padding: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3c8dbc',
    padding: 15,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  note: {
    margin: 15,
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});