import AsyncStorage from '@react-native-async-storage/async-storage';

export const CACHE_KEYS = {
  WEATHER: 'weatherCache',
  NEWS: 'newsCache',
  FACEBOOK_POSTS: 'fbPostsCache',
};

export const CACHE_EXPIRY = {
  WEATHER: 30 * 60 * 1000, // 30 phút
  NEWS: 60 * 60 * 1000, // 1 giờ
  FACEBOOK_POSTS: 60 * 60 * 1000, // 1 giờ
};

interface CacheData<T> {
  data: T;
  timestamp: number;
}

export async function getCache<T>(key: string, expiryMs: number): Promise<T | null> {
  try {
    const cachedData = await AsyncStorage.getItem(key);
    
    if (cachedData) {
      const { data, timestamp }: CacheData<T> = JSON.parse(cachedData);
      const now = Date.now();
      
      if (now - timestamp < expiryMs) {
        console.log(`✅ Using cached ${key}`);
        return data;
      }
      console.log(`⏱️ Cache expired for ${key}`);
    }
    return null;
  } catch (error) {
    console.error(`Error reading cache for ${key}:`, error);
    return null;
  }
}

export async function setCache<T>(key: string, data: T): Promise<void> {
  try {
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    console.log(`💾 Saved to cache: ${key}`);
  } catch (error) {
    console.error(`Error setting cache for ${key}:`, error);
  }
}