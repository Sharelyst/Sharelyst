import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, Text, View, ActivityIndicator } from "react-native";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';

export default function GroupChoice() {
  const [isCheckingGroup, setIsCheckingGroup] = useState(true);
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      checkExistingGroup();
    } else {
      setIsCheckingGroup(false);
    }
  }, [token]);

  const checkExistingGroup = async () => {
    if (!token) {
      console.log("No token available, skipping check");
      setIsCheckingGroup(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/groups/my-group`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success && response.data.data) {
        // User is already in a group, redirect to main group page
        router.replace('/(tabs)/maingroup');
      } else {
        // User is not in a group, show options
        setIsCheckingGroup(false);
      }
    } catch (error) {
      console.error('Error checking group:', error);
      // On error, show the options anyway
      setIsCheckingGroup(false);
    }
  };

  if (isCheckingGroup) {
    return (
      <SafeAreaView className="flex-1 bg-[#F2F2F2] items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text className="text-gray-600 mt-4">Checking your group status...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F2F2F2]">
      <View className="flex-1 px-6 pt-8">
        {/* Header */}
        <View className="flex flex-row justify-center mb-12">
          <Text className="text-3xl font-extrabold text-gray-800">Welcome to Sharelyst!</Text>
        </View>

        <View className="flex flex-row justify-center mb-8">
          <Text className="text-lg text-gray-600 text-center">
            To get started, create a new group or join an existing one
          </Text>
        </View>

        {/* Create Group Button */}
        <View className="mb-6">
          <Pressable 
            onPress={() => router.push('/creategroup')}
            className="w-full rounded-2xl bg-[#8B5CF6] py-5 items-center justify-center shadow-lg"
          >
            <Text className="text-white text-xl font-bold mb-1">Create New Group</Text>
            <Text className="text-white text-sm opacity-90">Start a new group and invite others</Text>
          </Pressable>
        </View>

        {/* Divider */}
        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-4 text-gray-500 font-semibold">OR</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* Join Group Button */}
        <View className="mb-6">
          <Pressable 
            onPress={() => router.push('/findgroup')}
            className="w-full rounded-2xl bg-white border-2 border-[#8B5CF6] py-5 items-center justify-center shadow-lg"
          >
            <Text className="text-[#8B5CF6] text-xl font-bold mb-1">Join Existing Group</Text>
            <Text className="text-[#8B5CF6] text-sm opacity-90">Enter a 6-digit group code</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
