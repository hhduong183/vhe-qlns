import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Linking,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router'; // Thêm import này

export default function TabIndex() {
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [websiteNews, setWebsiteNews] = useState([]);
  const [facebookPosts, setFacebookPosts] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState('');
  const router = useRouter(); // Thêm router hook
  
  // Cập nhật hàm fetchUserInfo
  const fetchUserInfo = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setUsername(user.ten_nv || 'Người dùng');
      } else {
        // Không tìm thấy dữ liệu người dùng, chuyển hướng đến trang đăng nhập
        console.log('Không tìm thấy thông tin người dùng, chuyển hướng đến trang đăng nhập');
        router.replace('/login');
        return false; // Không có người dùng
      }
      return true; // Có người dùng
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      router.replace('/login');
      return false;
    }
  };
  
  // Cập nhật hàm fetchAllData
  const fetchAllData = async () => {
    const hasUser = await fetchUserInfo();
    if (!hasUser) return; // Dừng lại nếu không có người dùng
    
    fetchWeather();
    fetchWebsiteNews();
    fetchFacebookPosts();
  };

  // Handle pull to refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAllData().then(() => setRefreshing(false));
  }, []);
  
  // Fetch weather data for Hai Phong
  const fetchWeather = async () => {
    try {
      setWeatherLoading(true);
      const response = await fetch(
        'https://api.openweathermap.org/data/2.5/weather?q=Hải Phòng,VN&units=metric&appid=28669ac9ec33aa9f2d834f2254166571'
      );
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu thời tiết:', error);
    } finally {
      setWeatherLoading(false);
    }
  };
  
  // Fetch latest news from VHE website - only 5 Vietnamese posts
  const fetchWebsiteNews = async () => {
    try {
      setNewsLoading(true);
      
      // Cập nhật URL với các tham số:
      // - per_page=5: Giới hạn 5 bài
      // - lang=vi: Lọc bài viết tiếng Việt (nếu website dùng plugin đa ngôn ngữ)
      // - _embed: Để lấy thêm hình ảnh và metadata
      // - orderby=date&order=desc: Sắp xếp theo ngày mới nhất
      const response = await fetch('https://vhe.com.vn/wp-json/wp/v2/posts?_embed&per_page=5&lang=vi&orderby=date&order=desc');
      
      if (!response.ok) {
        throw new Error('Không thể kết nối WordPress API');
      }
      
      const posts = await response.json();
      console.log('Số lượng bài viết tìm được:', posts.length);
      
      const news = posts.map(post => ({
        id: post.id,
        title: post.title.rendered
                .replace(/&#8211;/g, '-')  // Thay thế HTML entities với ký tự thật
                .replace(/&#8217;/g, "'")
                .replace(/&amp;/g, '&'),   // Cleanup HTML encoding
        date: new Date(post.date).toLocaleDateString('vi-VN'),
        url: post.link,
        image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 
              'https://vhe.com.vn/wp-content/uploads/2023/04/default-image.jpg'
      }));
      
      setWebsiteNews(news);
      
      // Nếu không tìm thấy bài nào, thử không lọc ngôn ngữ
      if (news.length === 0) {
        console.log('Không tìm thấy bài viết tiếng Việt, thử lấy mặc định');
        const fallbackResponse = await fetch('https://vhe.com.vn/wp-json/wp/v2/posts?_embed&per_page=5&orderby=date&order=desc');
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
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy tin tức từ website:', error);
      
      // Fallback to mockup data
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
    } finally {
      setNewsLoading(false);
    }
  };
  
  // Fetch posts from Facebook page
  const fetchFacebookPosts = async () => {
    try {
      // This would typically use the Facebook Graph API
      // For now, using mockup data
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
    } catch (error) {
      console.error('Lỗi khi lấy bài viết Facebook:', error);
    }
  };
  
  useEffect(() => {
    fetchAllData();
  }, []);
  
  // Weather icons mapping
  const getWeatherIcon = (iconCode) => {
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
  };
  
  // Format date
  const formatDate = (dateStr) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('vi-VN', options);
  };
  
  // Open URL
  const openURL = (url) => {
    Linking.openURL(url).catch(err => console.error("Không thể mở URL: ", err));
  };

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
          <Image 
            source={require('../../assets/images/vhe_logo.png')} 
            style={styles.logo} 
          />
        </View>
        
        {/* Weather Section */}
        <View style={styles.weatherCard}>
          <Text style={styles.sectionTitle}>Thời tiết Hải Phòng</Text>
          
          {weatherLoading ? (
            <ActivityIndicator size="large" color="#0056b3" />
          ) : weatherData && weatherData.weather && weatherData.weather.length > 0 && weatherData.main ? (
            <View style={styles.weatherContent}>
              <View style={styles.weatherMain}>
                <FontAwesome5 
                  name={getWeatherIcon(weatherData.weather[0].icon)} 
                  size={50} 
                  color="#0056b3" 
                />
                <Text style={styles.temperature}>{Math.round(weatherData.main.temp)}°C</Text>
              </View>
              
              <View style={styles.weatherDetails}>
                <Text style={styles.weatherDescription}>
                  {weatherData.weather[0].description || 'Đang cập nhật...'}
                </Text>
                <Text style={styles.weatherInfo}>
                  Độ ẩm: {weatherData.main.humidity}%
                </Text>
                <Text style={styles.weatherInfo}>
                  Gió: {weatherData.wind?.speed || 0} m/s
                </Text>
                <Text style={styles.weatherDate}>
                  {formatDate(new Date())}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.errorText}>Không thể tải dữ liệu thời tiết</Text>
          )}
        </View>
        
        {/* Website News Section */}
        <View style={styles.newsSection}>
          <Text style={styles.sectionTitle}>Tin tức mới nhất từ VHE</Text>
          
          {newsLoading ? (
            <ActivityIndicator size="small" color="#0056b3" />
          ) : websiteNews.length > 0 ? (
            <View style={styles.newsList}>
              {websiteNews.map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.newsItem}
                  onPress={() => openURL(item.url)}
                >
                  <Image 
                    source={{ uri: item.image }} 
                    style={styles.newsImage} 
                    resizeMode="cover"
                  />
                  <View style={styles.newsContent}>
                    <Text style={styles.newsTitle}>{item.title}</Text>
                    <Text style={styles.newsDate}>{item.date}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Không có tin tức mới</Text>
          )}
        </View>
        
        {/* Facebook Posts Section */}
        <View style={styles.fbSection}>
          <Text style={styles.sectionTitle}>Bài viết từ Facebook</Text>
          
          {facebookPosts.length > 0 ? (
            <View style={styles.fbList}>
              {facebookPosts.map(post => (
                <TouchableOpacity 
                  key={post.id} 
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
              ))}
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
});
