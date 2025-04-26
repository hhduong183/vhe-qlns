import { Platform, Linking } from 'react-native';
import Constants from 'expo-constants';

interface VersionCheckResponse {
  success: boolean;
  data?: {
    is_supported: boolean;
    needs_update: boolean;
    force_update: boolean;
    current_version: string;
    latest_version: string;
    store_url: string;
    message: string;
  };
  message?: string;
}

export async function checkAppVersion(): Promise<VersionCheckResponse> {
  try {
    // Get current version from app.json
    const currentVersion = Constants.expoConfig?.version || '0.0.0';
    const bundleId = Platform.OS === 'android' 
      ? Constants.expoConfig?.android?.package 
      : Constants.expoConfig?.ios?.bundleIdentifier;
    
    // Call API to check version
    const response = await fetch(
      `https://test.vhe.com.vn/api/version_check.php?platform=${Platform.OS}&version=${currentVersion}&app_id=${bundleId}`
    );
    
    const result = await response.json();
    
    console.log('Version check result:', result);
    
    return result as VersionCheckResponse;
  } catch (error) {
    console.error('Error checking app version:', error);
    
    // Return default result if error occurs (allow continued use)
    return {
      success: true,
      data: {
        is_supported: true,
        needs_update: false,
        force_update: false,
        current_version: Constants.expoConfig?.version || '0.0.0',
        latest_version: Constants.expoConfig?.version || '0.0.0',
        store_url: '',
        message: 'Could not check for updates. Please try again later.'
      }
    };
  }
}

export function openAppStore(url: string): void {
  Linking.canOpenURL(url).then(supported => {
    if (supported) {
      Linking.openURL(url);
    } else {
      console.log("Cannot open app store URL");
    }
  });
}