import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { Platform, View } from 'react-native'

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#ABE7B2',
                tabBarInactiveTintColor: '#D1D5DB',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#F3F4F6',
                    height: Platform.OS === 'ios' ? 90 : 70,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                    paddingTop: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '500',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "home" : "home-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="challenges"
                options={{
                    title: 'Challenges',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "game-controller" : "game-controller-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="health"
                options={{
                    title: '',
                    tabBarIcon: ({ color, focused }) => (
                        <View
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                backgroundColor: focused ? '#ABE7B2' : '#93BFC7',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: 30,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.15,
                                shadowRadius: 12,
                                elevation: 8,
                            }}
                        >
                            <Ionicons
                                name={focused ? "medkit" : "medkit-outline"}
                                size={32}
                                color="#FFFFFF"
                            />
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="community"
                options={{
                    title: 'Community',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "people" : "people-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "person" : "person-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    )
}