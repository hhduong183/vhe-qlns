import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="salary"
        options={{
          title: 'Bảng Lương',
          tabBarIcon: ({ color }) => <FontAwesome name="money" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Cài đặt',
          tabBarIcon: ({ color }) => <FontAwesome name="gear" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
