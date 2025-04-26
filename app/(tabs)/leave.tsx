import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function LeaveScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [leaveInfo, setLeaveInfo] = useState({
    so_ngay_nam_cu: 0,
    so_ngay_nam_hien_tai: 0,
    so_ngay_da_nghi: 0,
    so_ngay_con_lai: 0
  });
  const [leaveHistory, setLeaveHistory] = useState([]);
  
  // Form state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [leaveDate, setLeaveDate] = useState(new Date());
  const [leaveType, setLeaveType] = useState('');
  const [reason, setReason] = useState('');
  const [showTypePicker, setShowTypePicker] = useState(false);
  
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchLeaveData();
    setRefreshing(false);
  }, [userId]);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Lỗi khi đọc AsyncStorage:', error);
      }
    };

    getUserId().then(() => {
      fetchLeaveData();
    });
  }, []);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      
      // Lấy dữ liệu người dùng từ AsyncStorage
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(userData);
      const id = user.id;
      
      if (!id) {
        Alert.alert('Lỗi', 'ID người dùng không hợp lệ');
        setLoading(false);
        return;
      }
      
      // Gọi API để lấy thông tin ngày phép
      const response = await fetch(`https://test.vhe.com.vn/api/leave_info.php?id=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setLeaveInfo({
          so_ngay_nam_cu: result.data.so_ngay_nam_cu || 0,
          so_ngay_nam_hien_tai: result.data.so_ngay_nam_hien_tai || 0,
          so_ngay_da_nghi: result.data.so_ngay_da_nghi || 0,
          so_ngay_con_lai: result.data.so_ngay_con_lai || 0
        });
        
        setLeaveHistory(result.data.leave_history || []);
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể tải thông tin ngày phép');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setLeaveDate(selectedDate);
    }
  };

  const submitLeaveRequest = async () => {
    // Kiểm tra form
    if (!leaveType) {
      Alert.alert('Lỗi', 'Vui lòng chọn loại ngày nghỉ');
      return;
    }

    if (!reason) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do nghỉ phép');
      return;
    }

    try {
      const userData = await AsyncStorage.getItem('userData');
      const user = JSON.parse(userData);
      const id = user.id;

      const formattedDate = format(leaveDate, 'yyyy-MM-dd');

      const response = await fetch('https://test.vhe.com.vn/api/request_leave.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nhanvien_id: id,
          ngay_nghi: formattedDate,
          loai_ngay_nghi: leaveType,
          ly_do: reason
        }),
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert('Thành công', 'Đã gửi yêu cầu nghỉ phép thành công!');
        setLeaveDate(new Date());
        setLeaveType('');
        setReason('');
        // Làm mới dữ liệu
        fetchLeaveData();
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể gửi yêu cầu nghỉ phép');
      }
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0056b3" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý nghỉ phép</Text>
      </View>

      {/* Thông tin ngày phép */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Thông tin ngày phép</Text>
        
        <View style={styles.infoRow}>
          <View style={[styles.infoCard, { backgroundColor: '#3498db' }]}>
            <Text style={styles.infoLabel}>Số ngày phép {lastYear}</Text>
            <Text style={styles.infoValue}>{leaveInfo.so_ngay_nam_cu}</Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: '#2ecc71' }]}>
            <Text style={styles.infoLabel}>Số ngày phép {currentYear}</Text>
            <Text style={styles.infoValue}>{leaveInfo.so_ngay_nam_hien_tai}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={[styles.infoCard, { backgroundColor: '#f39c12' }]}>
            <Text style={styles.infoLabel}>Số ngày đã nghỉ</Text>
            <Text style={styles.infoValue}>{leaveInfo.so_ngay_da_nghi}</Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: '#e74c3c' }]}>
            <Text style={styles.infoLabel}>Số ngày phép còn lại</Text>
            <Text style={styles.infoValue}>{leaveInfo.so_ngay_con_lai}</Text>
          </View>
        </View>
      </View>

      {/* Form xin nghỉ phép */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Đề xuất xin nghỉ</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Ngày nghỉ:</Text>
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{format(leaveDate, 'dd/MM/yyyy')}</Text>
            <FontAwesome name="calendar" size={20} color="#777" />
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={leaveDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Loại ngày nghỉ:</Text>
          {Platform.OS === 'android' ? (
            // Trên Android giữ nguyên Picker
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={leaveType}
                onValueChange={(itemValue) => setLeaveType(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="-- Chọn loại ngày nghỉ --" value="" />
                <Picker.Item label="Nghỉ phép năm" value="Nghỉ phép năm" />
                <Picker.Item label="Nghỉ không lương" value="Nghỉ không lương" />
                <Picker.Item label="Nghỉ ốm" value="Nghỉ ốm" />
                <Picker.Item label="Nghỉ thai sản" value="Nghỉ thai sản" />
                <Picker.Item label="Nghỉ nuôi con dưới 1 tuổi" value="Nghỉ nuôi con dưới 1 tuổi" />
                <Picker.Item label="Nghỉ cưới hỏi" value="Nghỉ cưới hỏi" />
                <Picker.Item label="Nghỉ tang" value="Nghỉ tang" />
              </Picker>
            </View>
          ) : (
            // Trên iOS sử dụng button và modal
            <>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setShowTypePicker(true)}
              >
                <Text style={leaveType ? styles.pickerValueText : styles.pickerPlaceholderText}>
                  {leaveType || '-- Chọn loại ngày nghỉ --'}
                </Text>
                <FontAwesome name="chevron-down" size={16} color="#777" />
              </TouchableOpacity>
              
              <Modal
                animationType="slide"
                transparent={true}
                visible={showTypePicker}
                onRequestClose={() => setShowTypePicker(false)}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Chọn loại ngày nghỉ</Text>
                      <TouchableOpacity onPress={() => setShowTypePicker(false)}>
                        <Text style={styles.modalDoneButton}>Xong</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <Picker
                      selectedValue={leaveType}
                      onValueChange={(itemValue) => {
                        setLeaveType(itemValue);
                        // Nếu muốn tự động đóng sau khi chọn
                        // setShowTypePicker(false);
                      }}
                      style={{height: 215}}
                    >
                      <Picker.Item label="-- Chọn loại ngày nghỉ --" value="" />
                      <Picker.Item label="Nghỉ phép năm" value="Nghỉ phép năm" />
                      <Picker.Item label="Nghỉ không lương" value="Nghỉ không lương" />
                      <Picker.Item label="Nghỉ ốm" value="Nghỉ ốm" />
                      <Picker.Item label="Nghỉ thai sản" value="Nghỉ thai sản" />
                      <Picker.Item label="Nghỉ nuôi con dưới 1 tuổi" value="Nghỉ nuôi con dưới 1 tuổi" />
                      <Picker.Item label="Nghỉ cưới hỏi" value="Nghỉ cưới hỏi" />
                      <Picker.Item label="Nghỉ tang" value="Nghỉ tang" />
                    </Picker>
                  </View>
                </View>
              </Modal>
            </>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Lý do:</Text>
          <TextInput
            style={styles.textInput}
            value={reason}
            onChangeText={setReason}
            multiline={true}
            numberOfLines={3}
            placeholder="Nhập lý do nghỉ phép"
          />
        </View>
        
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={submitLeaveRequest}
        >
          <Text style={styles.submitButtonText}>Gửi đề xuất</Text>
          <FontAwesome name="send" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Lịch sử nghỉ phép */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Lịch sử nghỉ phép</Text>
        
        {leaveHistory.length > 0 ? (
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Ngày nghỉ</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Loại nghỉ</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Lý do</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Trạng thái</Text>
            </View>
            
            {leaveHistory.map((item, index) => (
              <View 
                key={index} 
                style={[
                  styles.tableRow, 
                  item.trang_thai !== 'Đã duyệt' && styles.pendingRow
                ]}
              >
                <Text style={[styles.tableCell, { flex: 1 }]}>{item.ngay_nghi}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{item.loai_ngay_nghi}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.ly_do}</Text>
                <View style={[
                  styles.statusBadge,
                  item.trang_thai === 'Đã duyệt' ? styles.approvedBadge : 
                  item.trang_thai === 'Từ chối' ? styles.rejectedBadge : styles.pendingBadge
                ]}>
                  <Text style={styles.statusText}>{item.trang_thai}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>Không có dữ liệu nghỉ phép</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    backgroundColor: '#3c8dbc',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoCard: {
    flex: 1,
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  infoLabel: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
  },
  infoValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  formSection: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#3c8dbc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  historySection: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tableContainer: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f7f7f7',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
    paddingHorizontal: 5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  pendingRow: {
    backgroundColor: '#fff9f8',
  },
  tableCell: {
    fontSize: 14,
    color: '#333',
    paddingHorizontal: 5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    flex: 1,
  },
  approvedBadge: {
    backgroundColor: '#2ecc71',
  },
  pendingBadge: {
    backgroundColor: '#f39c12',
  },
  rejectedBadge: {
    backgroundColor: '#e74c3c',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    padding: 15,
    color: '#777',
    fontStyle: 'italic',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    backgroundColor: '#fff',
  },
  
  pickerValueText: {
    fontSize: 14,
    color: '#333',
  },
  
  pickerPlaceholderText: {
    fontSize: 14,
    color: '#aaa',
  },
  
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingBottom: 20,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  
  modalDoneButton: {
    fontSize: 16,
    color: '#3c8dbc',
    fontWeight: '500',
  },
});