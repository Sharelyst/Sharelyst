import { Tabs, router } from 'expo-router';
import '../globals.css';
import React, { useState } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Home, BookOpen, Users, User, Menu, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { navigationPreference } = useAuth();
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);

  // Calculate dynamic tab bar height based on safe area insets
  const tabBarHeight = 50 + insets.bottom;

  const handleNavigation = (route: string) => {
    setIsHamburgerOpen(false);
    router.push(route as any);
  };

  const navItems = [
    { name: 'maingroup', title: 'Home', icon: Home, route: '/(tabs)/maingroup' },
    { name: 'activities', title: 'Activities', icon: BookOpen, route: '/(tabs)/activities' },
    { name: 'people', title: 'People', icon: Users, route: '/(tabs)/people' },
    { name: 'profile', title: 'Profile', icon: User, route: '/(tabs)/profile' },
  ];

  return (
    <View style={{ flex: 1 }} pointerEvents="box-none">
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: navigationPreference === 'navbar' ? {
            backgroundColor: '#D3D3D3',
            height: tabBarHeight,
            paddingBottom: Math.max(insets.bottom, 8),
            paddingTop: 8,
          } : {
            display: 'none', // Hide tab bar when hamburger menu is active
          },
          tabBarShowLabel: false,
        }}>
        <Tabs.Screen
          name="maingroup"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Home color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="activities"
          options={{
            title: 'Activities',
            tabBarIcon: ({ color }) => <BookOpen color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="people"
          options={{
            title: 'People',
            tabBarIcon: ({ color }) => <Users color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <User color={color} size={24} />,
          }}
        />
      </Tabs>
      
      {/* Floating Add Activity Button - only show with navbar */}
      {navigationPreference === 'navbar' && (
        <TouchableOpacity
          style={[styles.floatingButton, { bottom: tabBarHeight - 20 }]}
          onPress={() => router.push("/addactivity")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      )}

      {/* Hamburger Menu */}
      {navigationPreference === 'hamburger' && (
        <>
          {/* Navigation Menu - Vertical Icons */}
          {isHamburgerOpen && (
            <View style={[styles.hamburgerMenu, { bottom: 80 + insets.bottom }]}>
              {navItems.map((item, index) => (
                <TouchableOpacity
                  key={item.name}
                  style={styles.menuItem}
                  onPress={() => handleNavigation(item.route)}
                  activeOpacity={0.7}
                >
                  <item.icon color="#007AFF" size={28} />
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Hamburger Button */}
          <TouchableOpacity
            style={[styles.hamburgerButton, { bottom: 20 + insets.bottom }]}
            onPress={() => setIsHamburgerOpen(!isHamburgerOpen)}
            activeOpacity={0.8}
          >
            {isHamburgerOpen ? (
              <X color="white" size={28} />
            ) : (
              <Menu color="white" size={28} />
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 40, // Adjusted for the 60px tab bar height
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  buttonText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 32,
  },
  hamburgerButton: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    zIndex: 9999,
  },
  hamburgerMenu: {
    position: 'absolute',
    right: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 9,
    zIndex: 9998,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
    backgroundColor: '#F5F5F5',
    minWidth: 160,
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
