import { Tabs } from 'expo-router';
import '../globals.css';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Image } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#D3D3D3',
        },
      }}>
      <Tabs.Screen
        name="maingroup"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Image     source={require("@/assets/images/homeIcon.png")}/>,
        }}
      />
           <Tabs.Screen
        name="activities"
        options={{
          title: 'activities',
          tabBarIcon: ({ color }) => <Image     source={require("@/assets/images/bookIcon.png")}/>,
        }}
      />
           <Tabs.Screen
        name="people"
        options={{
          title: 'people',
          tabBarIcon: ({ color }) => <Image     source={require("@/assets/images/peopleIcon.png")}/>,
        }}
      />
           <Tabs.Screen
        name="profile"
        options={{
          title: 'profile',
          tabBarIcon: ({ color }) => <Image     source={require("@/assets/images/profileIcon.png")}/>,
        }}/>
    </Tabs>
  );
}
