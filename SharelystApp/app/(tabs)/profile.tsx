// app/(tabs)/profile.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Pressable, Image, Alert, ActivityIndicator } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import axios from "axios";
import { API_URL } from "@/config/api";

export default function ProfileScreen() {
  const { logout, token } = useAuth();
  const [isLeavingGroup, setIsLeavingGroup] = useState(false);

  const handleLeaveGroup = async () => {
    Alert.alert(
      "Leave Group",
      "Are you sure you want to leave your current group?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            setIsLeavingGroup(true);
            try {
              const response = await axios.post(
                `${API_URL}/groups/leave`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.data.success) {
                Alert.alert("Success", "You have left the group", [
                  {
                    text: "OK",
                    onPress: () => {
                      router.replace("/groupchoice");
                    },
                  },
                ]);
              }
            } catch (error: any) {
              console.error("Error leaving group:", error);
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to leave group. Please try again."
              );
            } finally {
              setIsLeavingGroup(false);
            }
          },
        },
      ]
    );
  };

  return (

        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 items-center pt-20">
      <View className="w-24 h-24 rounded-full bg-blue-500 items-center justify-center">
        <Text className="text-white text-4xl font-bold">MZ</Text>
      </View>

      <Text className="text-2xl font-extrabold mt-5">
        Muhammad Zamin
      </Text>
      <Text className="text-base text-gray-500 mb-10">
        example@email.com
      </Text>

      <TouchableOpacity
        className="py-3 px-6 bg-orange-500 rounded-xl mb-4"
        onPress={handleLeaveGroup}
        disabled={isLeavingGroup}
      >
        {isLeavingGroup ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-base font-semibold">
            Leave Group
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="py-3 px-6 bg-red-500 rounded-xl"
        onPress={logout}
      >
        <Text className="text-white text-base font-semibold">
          Log Out
        </Text>
      </TouchableOpacity>
    </View>
        </SafeAreaView>
    
  );
}
