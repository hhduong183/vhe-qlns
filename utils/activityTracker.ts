import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_ACTIVITY_KEY = 'lastUserActivity';
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Updates the timestamp of the user's last activity
 */
export const updateLastActivity = async (): Promise<void> => {
  try {
    const timestamp = Date.now().toString();
    await AsyncStorage.setItem(LAST_ACTIVITY_KEY, timestamp);
  } catch (error) {
    console.error('Failed to update last activity timestamp', error);
  }
};

/**
 * Checks if the session has timed out based on the last activity
 * @returns {Promise<boolean>} True if session has timed out, false otherwise
 */
export const checkSessionTimeout = async (): Promise<boolean> => {
  try {
    const lastActivity = await AsyncStorage.getItem(LAST_ACTIVITY_KEY);
    
    if (!lastActivity) {
      return false; // No activity recorded yet
    }
    
    const lastActivityTime = parseInt(lastActivity, 10);
    const now = Date.now();
    
    return (now - lastActivityTime) >= SESSION_TIMEOUT;
  } catch (error) {
    console.error('Error checking session timeout', error);
    return false;
  }
};

/**
 * Clears the last activity timestamp
 */
export const clearLastActivity = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(LAST_ACTIVITY_KEY);
  } catch (error) {
    console.error('Failed to clear last activity timestamp', error);
  }
};