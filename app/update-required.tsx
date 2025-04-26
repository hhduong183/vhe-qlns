import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { openAppStore } from '../utils/versionCheck';

export default function UpdateRequired() {
  const { storeUrl, forceUpdate, message } = useLocalSearchParams<{ 
    storeUrl: string;
    forceUpdate: string;
    message: string;
  }>();

  const isForceUpdate = forceUpdate === 'true';

  return (
    <View style={styles.container}>
      {/* Using FontAwesome icon instead of image */}
      <View style={styles.iconContainer}>
        <FontAwesome name="refresh" size={80} color="#3c8dbc" />
      </View>
      
      <Text style={styles.title}>
        {isForceUpdate ? 'Cập nhật bắt buộc' : 'Có phiên bản mới'}
      </Text>
      
      <Text style={styles.message}>
        {message || 'Vui lòng cập nhật ứng dụng để tiếp tục sử dụng với các tính năng mới nhất.'}
      </Text>
      
      <TouchableOpacity 
        style={styles.updateButton}
        onPress={() => openAppStore(storeUrl || '')}
      >
        <Text style={styles.updateButtonText}>Cập nhật ngay</Text>
      </TouchableOpacity>
      
      {!isForceUpdate && (
        <TouchableOpacity 
          style={styles.laterButton}
          onPress={() => {
            // Go back to the previous screen
            window.history.back();
          }}
        >
          <Text style={styles.laterButtonText}>Để sau</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 22,
  },
  updateButton: {
    backgroundColor: '#3c8dbc',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  laterButton: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  laterButtonText: {
    color: '#666',
    fontSize: 16,
  },
});