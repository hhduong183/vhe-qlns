import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, Image } from 'react-native';
import { router } from 'expo-router';
// import * as Linking from 'expo-linking';
import { TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
    const [user_name, setUsername] = useState('');
    const [mat_khau, setPassword] = useState('');

    const handleLogin = async () => {
        if (!user_name || !mat_khau) {
            Alert.alert('Error', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }

        try {
            const response = await fetch('https://bakup.vhe.com.vn/api/login_app.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_name, mat_khau }),
            });

            const result = await response.json();
            console.log('Kết quả API:', result);

            if (result.success) {
                // Lưu thông tin người dùng vào AsyncStorage
                await AsyncStorage.setItem('userData', JSON.stringify({
                    id: result.id,  // ID người dùng từ API
                    ten_nv: result.ten_nv,
                    // Thông tin khác nếu cần
                }));

                Alert.alert('Đăng nhập thành công', `Chào mừng, ${result.ten_nv}!`);
                router.replace('/(tabs)');
            } else {
                Alert.alert('Đăng nhập thất bại', result.message || 'Thông tin đăng nhập không chính xác');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể kết nối đến server. Vui lòng thử lại.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image
                    source={require('../assets/images/vhe_logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>
            {/* <Text style={styles.title}>Đăng nhập</Text> */}
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
            {/* <Button style={styles.loginButton} title="Đăng nhập" onPress={handleLogin} /> */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text >Đăng nhập</Text>
            </TouchableOpacity>
        </View>
    );
}
//style={styles.logoutButton}

const styles = StyleSheet.create({
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#99ffff',
        padding: 15,
        borderRadius: 8,
        marginTop: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#1d243d',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 150,
        height: 150,
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