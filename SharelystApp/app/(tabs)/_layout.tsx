// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Home, Users, Activity, User, Plus } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          tabBarLabel: "Home",
        }}
      />

      <Tabs.Screen
        name="activities"
        options={{
          tabBarIcon: ({ color, size }) => <Activity color={color} size={size} />,
          tabBarLabel: "Activities",
        }}
      />

      {/* Custom Middle Add Button */}
      <Tabs.Screen
        name="add"
        options={{
          tabBarLabel: "",
          tabBarIcon: () => (
            <View style={styles.addButtonContainer}>
              <TouchableOpacity style={styles.addButton}>
                <Plus size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="people"
        options={{
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
          tabBarLabel: "Group",
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          tabBarLabel: "Profile",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addButtonContainer: {
    position: "absolute",
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    width: 65,
    height: 65,
    borderRadius: 50,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
});
