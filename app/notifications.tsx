import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Notification settings
  const [allNotifications, setAllNotifications] = useState(true);
  const [salaryNotifications, setSalaryNotifications] = useState(true);
  const [leaveNotifications, setLeaveNotifications] = useState(true);
  const [attendanceNotifications, setAttendanceNotifications] = useState(true);
  const [newsNotifications, setNewsNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  
  // Load notification settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsStr = await AsyncStorage.getItem('notificationSettings');
        if (settingsStr) {
          const settings = JSON.parse(settingsStr);
          setAllNotifications(settings.allNotifications ?? true);
          setSalaryNotifications(settings.salaryNotifications ?? true);
          setLeaveNotifications(settings.leaveNotifications ?? true);
          setAttendanceNotifications(settings.attendanceNotifications ?? true);
          setNewsNotifications(settings.newsNotifications ?? true);
          setEmailNotifications(settings.emailNotifications ?? false);
        }
      } catch (error) {
        console.error('Lỗi khi tải cài đặt thông báo:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  // Handle All Notifications toggle
  const toggleAllNotifications = (value) => {
    setAllNotifications(value);
    setSalaryNotifications(value);
    setLeaveNotifications(value);
    setAttendanceNotifications(value);
    setNewsNotifications(value);
  };
  
  // Save notification settings
  const saveSettings = async () => {
    try {
      const settings = {
        allNotifications,
        salaryNotifications,
        leaveNotifications,
        attendanceNotifications,
        newsNotifications,
        emailNotifications
      };
      
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
      
      // Here you would also update server-side notification preferences
      // if you have a backend API for that
      
      Alert.alert('Thành công', 'Cài đặt thông báo đã được lưu');
    } catch (error) {
      console.error('Lỗi khi lưu cài đặt thông báo:', error);
      Alert.alert('Lỗi', 'Không thể lưu cài đặt thông báo');
    }
  };
  
  // Check if any category notification is disabled
  useEffect(() => {
    const anyDisabled = !(
      salaryNotifications && 
      leaveNotifications && 
      attendanceNotifications && 
      newsNotifications
    );
    
    if (anyDisabled && allNotifications) {
      setAllNotifications(false);
    } else if (!anyDisabled && !allNotifications) {
      setAllNotifications(true);
    }
  }, [salaryNotifications, leaveNotifications, attendanceNotifications, newsNotifications]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Cài đặt thông báo</Text>
        <View style={{ width: 20 }} />
      </View>
      
      <View style={styles.section}>
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Tất cả thông báo</Text>
            <Text style={styles.settingDescription}>
              Bật/tắt tất cả các loại thông báo
            </Text>
          </View>
          <Switch
            value={allNotifications}
            onValueChange={toggleAllNotifications}
            trackColor={{ false: '#d1d1d1', true: '#81b0ff' }}
            thumbColor={allNotifications ? '#3c8dbc' : '#f4f3f4'}
          />
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Loại thông báo</Text>
      
      <View style={styles.section}>
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Lương và phụ cấp</Text>
            <Text style={styles.settingDescription}>
              Thông báo khi có cập nhật lương
            </Text>
          </View>
          <Switch
            value={salaryNotifications}
            onValueChange={setSalaryNotifications}
            trackColor={{ false: '#d1d1d1', true: '#81b0ff' }}
            thumbColor={salaryNotifications ? '#3c8dbc' : '#f4f3f4'}
            disabled={!allNotifications}
          />
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Nghỉ phép</Text>
            <Text style={styles.settingDescription}>
              Thông báo về đơn nghỉ phép và phê duyệt
            </Text>
          </View>
          <Switch
            value={leaveNotifications}
            onValueChange={setLeaveNotifications}
            trackColor={{ false: '#d1d1d1', true: '#81b0ff' }}
            thumbColor={leaveNotifications ? '#3c8dbc' : '#f4f3f4'}
            disabled={!allNotifications}
          />
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Chấm công</Text>
            <Text style={styles.settingDescription}>
              Thông báo về chấm công và giờ làm thêm
            </Text>
          </View>
          <Switch
            value={attendanceNotifications}
            onValueChange={setAttendanceNotifications}
            trackColor={{ false: '#d1d1d1', true: '#81b0ff' }}
            thumbColor={attendanceNotifications ? '#3c8dbc' : '#f4f3f4'}
            disabled={!allNotifications}
          />
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Tin tức</Text>
            <Text style={styles.settingDescription}>
              Cập nhật mới và thông báo công ty
            </Text>
          </View>
          <Switch
            value={newsNotifications}
            onValueChange={setNewsNotifications}
            trackColor={{ false: '#d1d1d1', true: '#81b0ff' }}
            thumbColor={newsNotifications ? '#3c8dbc' : '#f4f3f4'}
            disabled={!allNotifications}
          />
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Phương thức nhận thông báo</Text>
      
      <View style={styles.section}>
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Email</Text>
            <Text style={styles.settingDescription}>
              Gửi thông báo qua email
            </Text>
          </View>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{ false: '#d1d1d1', true: '#81b0ff' }}
            thumbColor={emailNotifications ? '#3c8dbc' : '#f4f3f4'}
            disabled={!allNotifications}
          />
        </View>
      </View>
      
      <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
        <Text style={styles.saveButtonText}>Lưu cài đặt</Text>
      </TouchableOpacity>
      
      <View style={styles.noticeContainer}>
        <FontAwesome name="info-circle" size={20} color="#3c8dbc" style={styles.infoIcon} />
        <Text style={styles.noticeText}>
          Các thay đổi cài đặt thông báo sẽ được áp dụng cho ứng dụng này và trang web VHE QLNS.
        </Text>
      </View>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
    marginLeft: 15,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 15,
    marginTop: 5,
    marginBottom: 5,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#888',
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 15,
  },
  saveButton: {
    backgroundColor: '#3c8dbc',
    padding: 15,
    borderRadius: 8,
    margin: 15,
    alignItems: 'center',
  },
  saveButtonText: {
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
    marginBottom: 25,
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