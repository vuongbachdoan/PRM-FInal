import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF9900', 
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: '#FFF',
          paddingTop: 15, 
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
          tabBarLabel: () => null,
        }}
      />
      
      <Tabs.Screen
        name="detail"
        options={{
          title: 'Detail',
          tabBarButton: () => null, // Hides the Detail tab from the bottom tab bar
        }}
      />
      
      <Tabs.Screen
        name="favorite"
        options={{
          title: 'Favorite',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <TabBarIcon name={focused ? 'heart' : 'heart-outline'} color={color} />
          ),
          tabBarLabel: () => null,
        }}
      />
    </Tabs>
  );
}
