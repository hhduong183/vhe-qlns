import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,  
  TouchableOpacity, 
  Linking,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import CachedImage from '../../components/CachedImage';
import { getCache, setCache, CACHE_KEYS, CACHE_EXPIRY } from '../../utils/cacheManager';
import { getFormattedDate } from '../../utils/dateUtils';

// Weather display component with memoization
const WeatherDisplay = memo(({ data, loading, getWeatherIcon, formatDate }) => {
  if (loading) {
    return <ActivityIndicator size="large" color="#0056b3" />;
  }
  
  if (!data || !data.weather || !data.weather.length || !data.main) {
    return <Text style={styles.errorText}>Không thể tải dữ liệu thời tiết</Text>;
  }
  
  return (
    <View style={styles.weatherContent}>
      <View style={styles.weatherMain}>
        <FontAwesome5 
          name={getWeatherIcon(data.weather[0].icon)} 
          size={50} 
          color="#0056b3" 
        />
        <Text style={styles.temperature}>{Math.round(data.main.temp)}°C</Text>
      </View>
      
      <View style={styles.weatherDetails}>
        <Text style={styles.weatherDescription}>
          {data.weather[0].description || 'Đang cập nhật...'}
        </Text>
        <Text style={styles.weatherInfo}>
          Độ ẩm: {data.main.humidity}%
        </Text>
        <Text style={styles.weatherInfo}>
          Gió: {data.wind?.speed || 0} m/s
        </Text>
        <Text style={styles.weatherDate}>
          {formatDate(new Date())}
        </Text>
      </View>
    </View>
  );
});

// News item component with memoization
const NewsItem = memo(({ item, openURL }) => {
  // Tạo thumbnail URL tối ưu từ URL gốc
  const getThumbnailUrl = (originalUrl) => {
    if (!originalUrl) return null;
    
    // Nếu là ảnh WordPress, thêm tham số kích thước
    if (originalUrl.includes('wp-content/uploads')) {
      return `${originalUrl}?w=300&quality=60`;
    }
    return originalUrl;
  };
  
  // Tạo thumbnail URL độ phân giải thấp
  const getLowQualityUrl = (originalUrl) => {
    if (!originalUrl) return null;
    
    // Nếu là ảnh WordPress, thêm tham số kích thước rất nhỏ
    if (originalUrl.includes('wp-content/uploads')) {
      return `${originalUrl}?w=50&quality=30`;
    }
    return originalUrl;
  };
  
  return (
    <TouchableOpacity 
      style={styles.newsItem}
      onPress={() => openURL(item.url)}
    >
      <CachedImage 
        source={{ uri: getThumbnailUrl(item.image) }} 
        lowQualityUri={getLowQualityUrl(item.image)}
        style={styles.newsImage} 
        resizeMode="cover"
        cacheKey={`news-img-${item.id}`}
        thumbnailSize="medium"
      />
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle} numberOfLines={2} ellipsizeMode="tail">
          {item.title}
        </Text>
        <Text style={styles.newsDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );
});

// Facebook post item component with memoization
const FacebookPost = memo(({ post, openURL }) => (
  <TouchableOpacity 
    style={styles.fbPost}
    onPress={() => openURL(post.url)}
  >
    <View style={styles.fbContent}>
      <View style={styles.fbIconContainer}>
        <FontAwesome5 name="facebook" size={24} color="#1877F2" />
      </View>
      <View style={styles.fbTextContent}>
        <Text style={styles.fbTitle}>{post.title}</Text>
        <Text style={styles.fbDate}>{post.date}</Text>
      </View>
    </View>
  </TouchableOpacity>
));

// Birthday card component with memoization
const BirthdayCard = memo(({ userBirthday, isBirthdayToday }) => {
  // Nếu không có sinh nhật, không hiển thị component
  if (!userBirthday) {
    return null;
  }

  // Lấy ngày hiện tại
  const today = new Date();
  const currentMonth = today.toLocaleDateString('vi-VN', { month: 'long' });
  
  return (
    <View style={styles.birthdayCard}>
      <View style={styles.birthdayHeader}>
        <FontAwesome5 
          name="birthday-cake" 
          size={20} 
          color="#0066cc" // Thay đổi từ '#FF4B8A' sang xanh dương đậm
        />
        <Text style={styles.birthdayTitle}>
          {isBirthdayToday 
            ? 'Hôm nay là sinh nhật của bạn!' 
            : `Sinh nhật ${currentMonth}`
          }
        </Text>
      </View>
      
      <View style={styles.userBirthdaySection}>
        {isBirthdayToday ? (
          <>
            <Text style={styles.userBirthdayText}>
              🎉 Chúc mừng sinh nhật!
            </Text>
            <Text style={styles.birthdayWish}>
              Công ty VHE chúc bạn một ngày sinh nhật vui vẻ và hạnh phúc!
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.userBirthdayText}>
              🎂 Sinh nhật của bạn: {userBirthday}
            </Text>
            <Text style={styles.birthdayWish}>
            Công ty VHE chúc mừng sinh nhật của bạn trong tháng {currentMonth}!
            </Text>
          </>
        )}
        
        {!isBirthdayToday && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Sắp tới</Text>
          </View>
        )}
      </View>
    </View>
  );
});

// Main component
export default function TabIndex() {
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [websiteNews, setWebsiteNews] = useState([]);
  const [facebookPosts, setFacebookPosts] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [fbLoading, setFbLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState('');
  const [userBirthday, setUserBirthday] = useState(null);
  const [isBirthdayToday, setIsBirthdayToday] = useState(false);
  const router = useRouter();
  
  // Memoize functions
  const openURL = useCallback((url) => {
    Linking.openURL(url).catch(err => console.error("Không thể mở URL: ", err));
  }, []);
  
  const getWeatherIcon = useCallback((iconCode) => {
    const iconMap = {
      '01d': 'sun',
      '01n': 'moon',
      '02d': 'cloud-sun',
      '02n': 'cloud-moon',
      '03d': 'cloud',
      '03n': 'cloud',
      '04d': 'cloud',
      '04n': 'cloud',
      '09d': 'cloud-rain',
      '09n': 'cloud-rain',
      '10d': 'cloud-sun-rain',
      '10n': 'cloud-moon-rain',
      '11d': 'bolt',
      '11n': 'bolt',
      '13d': 'snowflake',
      '13n': 'snowflake',
      '50d': 'smog',
      '50n': 'smog'
    };
    
    return iconMap[iconCode] || 'cloud';
  }, []);
  
  const formatDate = useCallback((dateStr) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('vi-VN', options);
  }, []);
  
  // Optimized fetch user info
  const fetchUserInfo = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setUsername(user.ten_nv || 'Người dùng');
        return true;
      } else {
        console.log('Không tìm thấy thông tin người dùng, chuyển hướng đến trang đăng nhập');
        setTimeout(() => router.replace('/login'), 0);
        return false;
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      setTimeout(() => router.replace('/login'), 0);
      return false;
    }
  }, [router]);
  
  // Optimized fetch weather with caching
  const fetchWeather = useCallback(async () => {
    try {
      setWeatherLoading(true);
      
      // Check cache first
      const cachedWeather = await getCache(CACHE_KEYS.WEATHER, CACHE_EXPIRY.WEATHER);
      if (cachedWeather) {
        setWeatherData(cachedWeather);
        setWeatherLoading(false);
        return;
      }
      
      // Create controller for fetch timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(
        'https://api.openweathermap.org/data/2.5/weather?q=Hải Phòng,VN&units=metric&appid=28669ac9ec33aa9f2d834f2254166571',
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      setWeatherData(data);
      
      // Save to cache
      await setCache(CACHE_KEYS.WEATHER, data);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch thời tiết đã hết thời gian chờ');
      } else {
        console.error('Lỗi khi lấy dữ liệu thời tiết:', error);
      }
      
      // Try to get old cache if fetch fails
      const oldCache = await getCache(CACHE_KEYS.WEATHER, CACHE_EXPIRY.WEATHER * 3);
      if (oldCache) setWeatherData(oldCache);
    } finally {
      setWeatherLoading(false);
    }
  }, []);
  
  // Optimized fetch news with caching
  const fetchWebsiteNews = useCallback(async () => {
    try {
      setNewsLoading(true);
      
      // Check cache first
      const cachedNews = await getCache(CACHE_KEYS.NEWS, CACHE_EXPIRY.NEWS);
      if (cachedNews) {
        setWebsiteNews(cachedNews);
        setNewsLoading(false);
        return;
      }
      
      // Create controller for fetch timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(
        'https://vhe.com.vn/wp-json/wp/v2/posts?_embed&per_page=5&lang=vi&orderby=date&order=desc',
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Không thể kết nối WordPress API');
      }
      
      const posts = await response.json();
      
      const news = posts.map(post => ({
        id: post.id,
        title: post.title.rendered
                .replace(/&#8211;/g, '-')
                .replace(/&#8217;/g, "'")
                .replace(/&amp;/g, '&'),
        date: new Date(post.date).toLocaleDateString('vi-VN'),
        url: post.link,
        image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 
              'https://vhe.com.vn/wp-content/uploads/2023/04/default-image.jpg'
      }));
      
      if (news.length > 0) {
        setWebsiteNews(news);
        // Save to cache
        await setCache(CACHE_KEYS.NEWS, news);
      } else {
        // Fallback if no Vietnamese posts
        const fallbackResponse = await fetch(
          'https://vhe.com.vn/wp-json/wp/v2/posts?_embed&per_page=5&orderby=date&order=desc',
          { signal: controller.signal }
        );
        
        if (fallbackResponse.ok) {
          const fallbackPosts = await fallbackResponse.json();
          const fallbackNews = fallbackPosts.map(post => ({
            id: post.id,
            title: post.title.rendered
                    .replace(/&#8211;/g, '-')
                    .replace(/&#8217;/g, "'")
                    .replace(/&amp;/g, '&'),
            date: new Date(post.date).toLocaleDateString('vi-VN'),
            url: post.link,
            image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 
                  'https://vhe.com.vn/wp-content/uploads/2023/04/default-image.jpg'
          }));
          
          setWebsiteNews(fallbackNews);
          // Save to cache
          await setCache(CACHE_KEYS.NEWS, fallbackNews);
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch tin tức đã hết thời gian chờ');
      } else {
        console.error('Lỗi khi lấy tin tức từ website:', error);
      }
      
      // Try to get old cache if fetch fails
      const oldCache = await getCache(CACHE_KEYS.NEWS, CACHE_EXPIRY.NEWS * 3);
      if (oldCache && oldCache.length > 0) {
        setWebsiteNews(oldCache);
      } else {
        // Fallback to mockup data if no cache
        const mockNews = [
          {
            id: 1,
            title: 'VHE tham gia giải chạy OTSUKA PLUS 2023',
            date: '20/04/2023',
            image: 'https://vhe.com.vn/wp-content/uploads/2023/04/giay-chung-nhan-hop-chuang-cho-he-thong-quan-ly-ti-vhe-1.jpg',
            url: 'https://vhe.com.vn/vhe-tham-gia-giai-chay-otsuka-plus-2023/'
          },
          {
            id: 2,
            title: 'Khách hàng đánh giá chất lượng dịch vụ của VHE',
            date: '15/04/2023',
            image: 'https://vhe.com.vn/wp-content/uploads/2023/04/giay-chung-nhan-hop-chuang-cho-he-thong-quan-ly-ti-vhe.jpg',
            url: 'https://vhe.com.vn/khach-hang-danh-gia-chat-luong-dich-vu-cua-vhe/'
          },
          {
            id: 3,
            title: 'VHE nhận chứng nhận ISO 9001:2015',
            date: '10/04/2023',
            image: 'https://vhe.com.vn/wp-content/uploads/2023/04/vhe-to-chuc-dao-tao-noi-bo-ve-an-toan-trong-cong-nghiep.jpg',
            url: 'https://vhe.com.vn/vhe-nhan-chung-nhan-iso-90012015/'
          }
        ];
        setWebsiteNews(mockNews);
      }
    } finally {
      setNewsLoading(false);
    }
  }, []);
  
  // Optimized fetch Facebook posts with caching
  const fetchFacebookPosts = useCallback(async () => {
    try {
      setFbLoading(true);
      
      // Check cache first
      const cachedPosts = await getCache(CACHE_KEYS.FACEBOOK_POSTS, CACHE_EXPIRY.FACEBOOK_POSTS);
      if (cachedPosts) {
        setFacebookPosts(cachedPosts);
        setFbLoading(false);
        return;
      }
      
      // For now using mockup data since we don't have real FB API access
      // In a real implementation, you'd fetch from Facebook Graph API
      const mockPosts = [
        {
          id: 'fb1',
          title: 'VHE tham gia hội thảo kỹ thuật tại Hà Nội',
          date: '18/04/2023',
          url: 'https://www.facebook.com/viethanengineering/'
        },
        {
          id: 'fb2',
          title: 'Chúc mừng sinh nhật các thành viên VHE tháng 4',
          date: '12/04/2023',
          url: 'https://www.facebook.com/viethanengineering/'
        },
        {
          id: 'fb3',
          title: 'Hoàn thành dự án lắp đặt thiết bị cho khách hàng',
          date: '05/04/2023',
          url: 'https://www.facebook.com/viethanengineering/'
        }
      ];
      
      setFacebookPosts(mockPosts);
      
      // Save to cache
      await setCache(CACHE_KEYS.FACEBOOK_POSTS, mockPosts);
    } catch (error) {
      console.error('Lỗi khi lấy bài viết Facebook:', error);
      
      // Try to get old cache if fetch fails
      const oldCache = await getCache(CACHE_KEYS.FACEBOOK_POSTS, CACHE_EXPIRY.FACEBOOK_POSTS * 3);
      if (oldCache) {
        setFacebookPosts(oldCache);
      }
    } finally {
      setFbLoading(false);
    }
  }, []);
  
  // Điều chỉnh hàm checkUserBirthday

const checkUserBirthday = useCallback(async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    if (!userData) return;
    
    const user = JSON.parse(userData);
    console.log("User data birthday:", user.ngay_sinh);
    
    if (!user.ngay_sinh) {
      // Mock dữ liệu ngày sinh để test nếu API không trả về
      // Uncomment dòng dưới để test với ngày sinh là ngày hiện tại
      // user.ngay_sinh = new Date().toISOString().split('T')[0];
      
      console.log("Không có dữ liệu ngày sinh");
      return;
    }
    
    // Định dạng ngày sinh - xử lý nhiều định dạng có thể có
    let birthDate;
    try {
      // Xử lý chuỗi ngày tháng từ API - có thể có nhiều định dạng
      if (user.ngay_sinh.includes('/')) {
        // Định dạng DD/MM/YYYY
        const parts = user.ngay_sinh.split('/');
        birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      } else if (user.ngay_sinh.includes('-')) {
        // Định dạng YYYY-MM-DD hoặc DD-MM-YYYY
        const parts = user.ngay_sinh.split('-');
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else {
          // DD-MM-YYYY
          birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
      } else {
        // Thử parse trực tiếp
        birthDate = new Date(user.ngay_sinh);
      }
    } catch (error) {
      console.error("Lỗi parse ngày sinh:", error);
      
      // Nếu không parse được, thử dùng ngày hiện tại cho mục đích test
      console.log("Sử dụng ngày hiện tại để test");
      birthDate = new Date();
      
      // Hoặc return nếu không muốn dùng dữ liệu test
      // return;
    }
    
    const today = new Date();
    
    // Log để debug
    console.log("Ngày sinh:", birthDate);
    console.log("Tháng sinh:", birthDate.getMonth() + 1);
    console.log("Tháng hiện tại:", today.getMonth() + 1);
    
    // Format ngày sinh để hiển thị
    const formattedBirthDay = `${birthDate.getDate()}/${birthDate.getMonth() + 1}`;
    
    // Kiểm tra tháng sinh nhật - luôn hiển thị nếu cùng tháng
    if (birthDate.getMonth() === today.getMonth()) {
      console.log("THÁNG SINH NHẬT TRÙNG KHỚP!");
      setUserBirthday(formattedBirthDay);
      
      // Kiểm tra xem hôm nay có phải là sinh nhật không
      if (birthDate.getDate() === today.getDate()) {
        console.log("NGÀY SINH NHẬT HÔM NAY!");
        setIsBirthdayToday(true);
      } else {
        setIsBirthdayToday(false);
      }
    } else {
  
      // Không phải tháng sinh nhật
      console.log("Không phải tháng sinh nhật");
      setUserBirthday(null);
      setIsBirthdayToday(false);
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra sinh nhật:', error);
  }
}, []);
  
  // Optimized fetchAllData with Promise.all
  const fetchAllData = useCallback(async () => {
    const hasUser = await fetchUserInfo();
    if (!hasUser) return;
    
    // Use Promise.all to fetch in parallel
    Promise.all([
      fetchWeather(),
      fetchWebsiteNews(),
      fetchFacebookPosts(),
      checkUserBirthday() // Giờ đã có thể sử dụng hàm này
    ]).catch(error => console.error('Error in parallel fetching:', error));
  }, [fetchUserInfo, fetchWeather, fetchWebsiteNews, fetchFacebookPosts, checkUserBirthday]);
  
  // Optimized onRefresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllData().then(() => setRefreshing(false));
  }, [fetchAllData]);
  
  // Initialize data with loading cached data first
  useEffect(() => {
    let isMounted = true;
    
    const initializeData = async () => {
      try {
        // Check user
        const userData = await AsyncStorage.getItem('userData');
        if (!userData && isMounted) {
          console.log('Không tìm thấy thông tin người dùng');
          router.replace('/login');
          return;
        }
        
        if (userData && isMounted) {
          const user = JSON.parse(userData);
          setUsername(user.ten_nv || 'Người dùng');
        }
        
        // Load cached data first
        const cachedWeather = await getCache(CACHE_KEYS.WEATHER, CACHE_EXPIRY.WEATHER);
        if (cachedWeather && isMounted) {
          setWeatherData(cachedWeather);
          setWeatherLoading(false);
        }
        
        const cachedNews = await getCache(CACHE_KEYS.NEWS, CACHE_EXPIRY.NEWS);
        if (cachedNews && isMounted) {
          setWebsiteNews(cachedNews);
          setNewsLoading(false);
        }
        
        const cachedFbPosts = await getCache(CACHE_KEYS.FACEBOOK_POSTS, CACHE_EXPIRY.FACEBOOK_POSTS);
        if (cachedFbPosts && isMounted) {
          setFacebookPosts(cachedFbPosts);
          setFbLoading(false);
        }
        
        // Then fetch fresh data
        if (isMounted) {
          fetchAllData();
        }
      } catch (error) {
        console.error('Error in initialization:', error);
        if (isMounted) {
          router.replace('/login');
        }
      }
    };
    
    initializeData();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [router, fetchAllData]);

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Xin chào,</Text>
            <Text style={styles.username}>{username}</Text>
          </View>
          <CachedImage 
            source={require('../../assets/images/vhe_logo.png')} 
            style={styles.logo} 
            cacheKey="vhe_logo"
          />
        </View>
                {/* Birthday Section */}
                {userBirthday && (
          <BirthdayCard
            userBirthday={userBirthday}
            isBirthdayToday={isBirthdayToday}
          />
        )}
        
        {/* Weather Section */}
        <View style={styles.weatherCard}>
          <Text style={styles.sectionTitle}>Thời tiết Hải Phòng</Text>
          <WeatherDisplay 
            data={weatherData} 
            loading={weatherLoading}
            getWeatherIcon={getWeatherIcon}
            formatDate={formatDate}
          />
        </View>

        {/* Debug info - Uncomment để xem thông tin */}
        {/* <View style={{padding: 10, backgroundColor: '#f0f0f0', margin: 16}}>
          <Text>userBirthday: {userBirthday || 'null'}</Text>
          <Text>isBirthdayToday: {isBirthdayToday ? 'true' : 'false'}</Text>
        </View> */}



        {/* Website News Section */}
        <View style={styles.newsSection}>
          <Text style={styles.sectionTitle}>Tin tức mới nhất từ VHE</Text>
          
          {newsLoading ? (
            <ActivityIndicator size="small" color="#0056b3" />
          ) : websiteNews.length > 0 ? (
            <View >
              <FlashList
                data={websiteNews}
                renderItem={({ item }) => (
                  <NewsItem item={item} openURL={openURL} />
                )}
                estimatedItemSize={120}
                showsVerticalScrollIndicator={false}
              />
            </View>
          ) : (
            <Text style={styles.emptyText}>Không có tin tức mới</Text>
          )}
        </View>
        
        {/* Facebook Posts Section */}
        <View style={styles.fbSection}>
          <Text style={styles.sectionTitle}>Bài viết từ Facebook</Text>
          
          {fbLoading ? (
            <ActivityIndicator size="small" color="#0056b3" />
          ) : facebookPosts.length > 0 ? (
            <View>
              <FlashList
                data={facebookPosts}
                renderItem={({ item }) => (
                  <FacebookPost post={item} openURL={openURL} />
                )}
                estimatedItemSize={80}
                showsVerticalScrollIndicator={false}
              />
            </View>
          ) : (
            <Text style={styles.emptyText}>Không có bài viết Facebook mới</Text>
          )}
          
          <TouchableOpacity 
            style={styles.viewMoreButton}
            onPress={() => openURL('https://www.facebook.com/viethanengineering/')}
          >
            <Text style={styles.viewMoreText}>Xem thêm trên Facebook</Text>
            <FontAwesome5 name="arrow-right" size={16} color="#0056b3" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  weatherCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherMain: {
    alignItems: 'center',
  },
  temperature: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#333',
  },
  weatherDetails: {
    flex: 1,
    marginLeft: 20,
  },
  weatherDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
    textTransform: 'capitalize',
  },
  weatherInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  weatherDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  newsSection: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newsList: {
    marginTop: 8,
  },
  newsItem: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 16,
  },
  newsImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  newsContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  newsDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  fbSection: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  fbList: {
    marginTop: 8,
  },
  fbPost: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 16,
  },
  fbContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fbIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fbTextContent: {
    flex: 1,
    marginLeft: 12,
  },
  fbTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  fbDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#0056b3',
    marginRight: 8,
  },
  errorText: {
    color: '#d9534f',
    textAlign: 'center',
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 20,
    fontStyle: 'italic',
  },
  birthdayCard: {
    margin: 16,
    marginTop: 0,
    padding: 16, 
    backgroundColor: '#e6f3ff', // Thay đổi từ '#fff8f9' (hồng nhạt) sang xanh nhạt
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  birthdayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  birthdayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066cc', // Thay đổi từ '#FF4B8A' (hồng) sang xanh dương đậm
    marginLeft: 8,
  },
  userBirthdaySection: {
    backgroundColor: '#ebf5ff', // Thay đổi từ '#ffebf2' (hồng nhẹ) sang xanh dương nhẹ
    borderRadius: 6,
    padding: 12,
  },
  userBirthdayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0056b3', // Thay đổi từ '#FF4B8A' (hồng) sang xanh dương đậm
    textAlign: 'center',
  },
  birthdayWish: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#0066cc', // Thay đổi từ '#FF4B8A' (hồng) sang xanh dương đậm
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  comingSoonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
