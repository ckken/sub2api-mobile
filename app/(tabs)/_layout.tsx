import { Tabs } from 'expo-router';
import { ActivitySquare, ChartNoAxesCombined, Users } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1d5f55',
        tabBarInactiveTintColor: '#8a8072',
        tabBarStyle: {
          backgroundColor: '#fbf8f2',
          borderTopWidth: 0,
          height: 84,
          paddingTop: 10,
          paddingBottom: 18,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '概览',
          tabBarIcon: ({ color, size }) => <ChartNoAxesCombined color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: '用户',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="monitor"
        options={{
          title: '运维监控',
          tabBarIcon: ({ color, size }) => <ActivitySquare color={color} size={size} />,
        }}
      />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="groups" options={{ href: null }} />
      <Tabs.Screen name="keys" options={{ href: null }} />
      <Tabs.Screen name="accounts" options={{ href: null }} />
    </Tabs>
  );
}
