import React, { useState, useEffect } from 'react';
import { Image, ImageProps, ActivityIndicator, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { BlurView } from 'expo-blur';

interface CachedImageProps extends ImageProps {
  cacheKey?: string;
  lowQualityUri?: string;
  thumbnailSize?: string; // "small", "medium", "large"
}

export default function CachedImage({
  source,
  cacheKey,
  style,
  lowQualityUri,
  thumbnailSize = "medium",
  ...props
}: CachedImageProps) {
  const [cachedSource, setCachedSource] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);

  // Tạo URI cho thumbnail nếu có source.uri 
  const getThumbnailUri = (uri: string) => {
    if (!uri) return null;
    
    // Nếu URI đã có tham số kích thước, không thêm nữa
    if (uri.includes('?w=') || uri.includes('&w=')) return uri;
    
    // Kiểm tra nếu đây là WordPress URI
    if (uri.includes('wp-content/uploads')) {
      // Định kích thước dựa trên thumbnailSize
      const sizeMap = {
        small: 150,
        medium: 300,
        large: 600
      };
      const width = sizeMap[thumbnailSize] || 300;
      
      // Thêm tham số để yêu cầu ảnh nhỏ hơn từ WordPress
      return `${uri}?w=${width}&quality=80`;
    }
    
    return uri;
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadImage = async () => {
      // Nếu không phải URL thì không cần cache
      if (!source || typeof source !== 'object' || !source.uri) {
        if (isMounted) {
          setCachedSource(source);
          setLoading(false);
        }
        return;
      }

      try {
        const { uri } = source as { uri: string };
        // Sử dụng uri thu nhỏ để tải nhanh hơn
        const optimizedUri = getThumbnailUri(uri);
        
        const key = cacheKey || await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA1,
          optimizedUri || uri
        );
        
        const fileUri = `${FileSystem.cacheDirectory}${key}`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        
        // Kiểm tra tuổi thọ cache (7 ngày)
        const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 ngày
        const now = new Date().getTime();
        
        if (fileInfo.exists && fileInfo.modificationTime && 
            (now - fileInfo.modificationTime * 1000) < CACHE_EXPIRY) {
          // Nếu file đã được cache và còn "tươi"
          if (isMounted) {
            setCachedSource({ uri: fileUri });
            setLoading(false);
          }
        } else {
          // Nếu file chưa cache hoặc đã quá hạn - tải và cache
          console.log("Đang tải và cache ảnh:", optimizedUri || uri);
          
          // Tạo timeout cho tải xuống
          const TIMEOUT_MS = 10000; // 10 giây
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
          
          try {
            // Thêm header cache control để làm mới cache
            const downloadOptions = {
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            };
            
            const downloadResult = await FileSystem.downloadAsync(
              optimizedUri || uri, 
              fileUri,
              downloadOptions
            );
            
            clearTimeout(timeoutId);
            
            if (downloadResult.status === 200) {
              if (isMounted) {
                setCachedSource({ uri: downloadResult.uri });
                setLoading(false);
              }
            } else {
              throw new Error(`Download failed: ${downloadResult.status}`);
            }
          } catch (downloadError) {
            clearTimeout(timeoutId);
            console.error("Lỗi khi tải ảnh:", downloadError);
            
            if (fileInfo.exists) {
              // Nếu file đã cache nhưng không tải được mới, dùng file cũ
              if (isMounted) {
                setCachedSource({ uri: fileUri });
                setLoading(false);
              }
            } else {
              // Dùng source gốc nếu không cache được
              if (isMounted) {
                setError(true);
                setCachedSource(source);
                setLoading(false);
              }
            }
          }
        }
      } catch (error) {
        console.error('Lỗi cache ảnh:', error);
        if (isMounted) {
          setError(true);
          setCachedSource(source); // Fallback về source ban đầu
          setLoading(false);
        }
      }
    };
    
    loadImage();
    
    return () => {
      isMounted = false;
    };
  }, [source, cacheKey, thumbnailSize]);
  
  // Xử lý hiển thị progressive loading
  if (loading) {
    return (
      <View style={[style, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }]}>
        <ActivityIndicator size="small" color="#0056b3" />
      </View>
    );
  }
  
  if (lowQualityUri && !thumbnailLoaded) {
    return (
      <View style={[style, { overflow: 'hidden' }]}>
        <Image 
          source={{ uri: lowQualityUri }}
          style={[
            style, 
            { position: 'absolute', top: 0, left: 0 }
          ]}
          blurRadius={2}
        />
        <Image
          source={cachedSource || source}
          style={style}
          onLoad={() => setThumbnailLoaded(true)}
          {...props}
        />
      </View>
    );
  }
  
  return (
    <Image 
      source={cachedSource || source} 
      style={style} 
      {...props}
      onError={(e) => {
        console.log('Image load error:', e.nativeEvent.error);
        setError(true);
      }} 
    />
  );
}