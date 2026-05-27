import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                tabBarActiveTintColor: '#3C6F44',
                tabBarStyle: {
                    borderTopColor: '#E0E0E0',
                },
            }}>
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
                    headerTitle: 'Dashboard',
                }}
            />
            <Tabs.Screen
                name="accounts"
                options={{
                    title: 'Accounts',
                    tabBarIcon: ({ color }) => <Ionicons name="wallet-outline" size={24} color={color} />,
                    headerTitle: 'My Accounts',
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
                    headerTitle: 'My Profile',
                }}
            />
        </Tabs>
    );
}
