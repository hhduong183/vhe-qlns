import React from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';
import { useSession } from '../contexts/SessionContext';

// HOC để bọc các screen và theo dõi hoạt động người dùng
export default function withActivityTracker(Component) {
  return function WithActivityTracker(props) {
    const { resetTimer } = useSession();
    
    const handleUserActivity = () => {
      resetTimer();
    };
    
    return (
      <TouchableWithoutFeedback onPress={handleUserActivity}>
        <View style={{ flex: 1 }}>
          <Component {...props} />
        </View>
      </TouchableWithoutFeedback>
    );
  };
}