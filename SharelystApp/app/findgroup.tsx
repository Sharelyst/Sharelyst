import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, Text, View, Alert, ActivityIndicator } from "react-native";
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import CodeInput from './CodeInput';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';

export default function FindGroup() {
  const [groupCode, setGroupCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

  const handleJoin = async () => {
    if (groupCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a complete 6-digit group code');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/groups/join`,
        {
          groupCode: parseInt(groupCode),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        Alert.alert(
          'Success!',
          `You have joined "${response.data.data.name}"`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)/maingroup'),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Error joining group:', error);
      const errorMessage = error.response?.data?.message || 'Failed to join group. Please try again.';
      Alert.alert('Error', errorMessage);
      setGroupCode(''); // Clear the input field
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F2F2F2]">
      <View className="flex-1 px-6 pt-8">
        {/* Header */}
        <View className="flex flex-row justify-center mb-8">
          <Text className="text-3xl font-extrabold text-gray-800">Join a Group</Text>
        </View>

        <View className="flex flex-row justify-center mb-12">
          <Text className="text-base text-gray-600 text-center">
            Enter the 6-digit code shared by your group
          </Text>
        </View>

        {/* Code Input */}
        <View className="mb-12">
          <Text className="text-lg font-semibold text-gray-700 mb-4 text-center">Group Code</Text>
          <View className="flex-row justify-center">
            <CodeInput onCodeChange={setGroupCode} />
          </View>
        </View>

        {/* Join Button */}
        <View className="mb-4">
          <Pressable
            onPress={handleJoin}
            disabled={isLoading || groupCode.length !== 6}
            className={`w-full rounded-full py-5 items-center justify-center shadow-lg ${
              isLoading || groupCode.length !== 6 ? 'bg-gray-400' : 'bg-[#8B5CF6]'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-xl font-semibold">Join Group</Text>
            )}
          </Pressable>
        </View>

        {/* Back Button */}
        <Pressable
          onPress={() => router.replace('/groupchoice')}
          disabled={isLoading}
          className="w-full rounded-full bg-white border-2 border-gray-300 py-5 items-center justify-center"
        >
          <Text className="text-gray-700 text-lg font-semibold">Back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}