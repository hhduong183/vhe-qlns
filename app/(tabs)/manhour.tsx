import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ManhourEntry() {
  // State for form fields
  const [project, setProject] = useState('');
  const [workType, setWorkType] = useState('');
  const [isOvertime, setIsOvertime] = useState(false);
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // State for data loading
  const [projects, setProjects] = useState([]);
  const [workTypes, setWorkTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch projects and work types when component mounts
  useEffect(() => {
    fetchProjects();
    fetchWorkTypes();
  }, []);

  // Function to fetch projects from API
  const fetchProjects = async () => {
    setLoading(true);
    try {
      // Replace with your actual API call
      // For now, using mock data
      const mockProjects = [
        { id: '1', name: 'VHE Headquarters Renovation' },
        { id: '2', name: 'Chevron Maintenance' },
        { id: '3', name: 'Samsung Equipment Installation' },
        { id: '4', name: 'PV GAS Inspection' },
        { id: '5', name: 'Internal Project' }
      ];
      setProjects(mockProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách dự án. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch work types
  const fetchWorkTypes = async () => {
    try {
      // Replace with your actual API call
      // For now, using mock data
      const mockWorkTypes = [
        { id: '1', name: 'Kỹ thuật' },
        { id: '2', name: 'Thiết kế' },
        { id: '3', name: 'Lắp đặt' },
        { id: '4', name: 'Bảo trì' },
        { id: '5', name: 'Quản lý dự án' },
        { id: '6', name: 'Hành chính' }
      ];
      setWorkTypes(mockWorkTypes);
    } catch (error) {
      console.error('Error fetching work types:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách loại công việc. Vui lòng thử lại sau.');
    }
  };

  // Handle date change from date picker
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN');
  };

  // Validate form before submission
  const validateForm = () => {
    if (!project) {
      Alert.alert('Lỗi', 'Vui lòng chọn dự án');
      return false;
    }
    if (!workType) {
      Alert.alert('Lỗi', 'Vui lòng chọn loại công việc');
      return false;
    }
    if (!hours || isNaN(Number(hours)) || Number(hours) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số giờ hợp lệ');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      // Prepare data for submission
      const manhourData = {
        projectId: project,
        workTypeId: workType,
        date: date.toISOString().split('T')[0],
        hours: Number(hours),
        isOvertime,
        description,
        timestamp: new Date().toISOString()
      };
      
      // Get user data to add employee ID
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        manhourData.employeeId = user.id;
      }
      
      console.log('Submitting manhour data:', manhourData);
      
      // Replace with your API call to save data
      // For demo, just show success message
      setTimeout(() => {
        Alert.alert(
          'Thành công', 
          'Đã lưu giờ công thành công',
          [{ text: 'OK', onPress: resetForm }]
        );
        setIsSubmitting(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error submitting manhour data:', error);
      Alert.alert('Lỗi', 'Không thể lưu giờ công. Vui lòng thử lại sau.');
      setIsSubmitting(false);
    }
  };

  // Reset form after submission
  const resetForm = () => {
    setProject('');
    setWorkType('');
    setIsOvertime(false);
    setHours('');
    setDescription('');
    setDate(new Date());
  };

  return (
    // <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nhập giờ công</Text>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#0056b3" style={styles.loader} />
        ) : (
          <View style={styles.formContainer}>
            {/* Date Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Ngày làm việc</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(date)}</Text>
                <FontAwesome5 name="calendar-alt" size={20} color="#0056b3" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>
            
            {/* Project Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Dự án</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={project}
                  onValueChange={(value) => setProject(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="-- Chọn dự án --" value="" />
                  {projects.map(p => (
                    <Picker.Item key={p.id} label={p.name} value={p.id} />
                  ))}
                </Picker>
              </View>
            </View>
            
            {/* Work Type Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Loại công việc</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={workType}
                  onValueChange={(value) => setWorkType(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="-- Chọn loại công việc --" value="" />
                  {workTypes.map(wt => (
                    <Picker.Item key={wt.id} label={wt.name} value={wt.id} />
                  ))}
                </Picker>
              </View>
            </View>
            
            {/* Hours Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Số giờ</Text>
              <TextInput
                style={styles.input}
                value={hours}
                onChangeText={setHours}
                placeholder="Nhập số giờ làm việc"
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
            
            {/* Overtime Toggle */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Làm ngoài giờ (OT)</Text>
              <Switch
                value={isOvertime}
                onValueChange={setIsOvertime}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isOvertime ? "#0056b3" : "#f4f3f4"}
              />
            </View>
            
            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Mô tả công việc</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Mô tả chi tiết công việc đã làm"
                multiline
                numberOfLines={4}
              />
            </View>
            
            {/* Submit Button */}
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Lưu giờ công</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    // </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  loader: {
    marginTop: 50,
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#0056b3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});