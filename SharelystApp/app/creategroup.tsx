import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, Text, View, TextInput, ActivityIndicator, Alert } from "react-native";
import { useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';

export default function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<number | null>(null);
  const { token } = useAuth();
  const router = useRouter();

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/groups/create`,
        {
          name: groupName.trim(),
          description: description.trim() || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setGeneratedCode(response.data.data.groupCode);
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Error creating group:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create group. Please try again.';
      Alert.alert('Error', errorMessage);
      setIsLoading(false);
    }
  };

  const handleContinue = useCallback(() => {
    try {
      // Use push instead of replace to ensure proper navigation stack
      router.push('/(tabs)/maingroup');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to navigate. Please try again.');
    }
  }, [router]);

  if (generatedCode) {
    return (
      <SafeAreaView className="flex-1 bg-[#F2F2F2]">
        <View className="flex-1 px-6 pt-8 justify-center">
          {/* Success Message */}
          <View className="flex flex-row justify-center mb-8">
            <Text className="text-3xl font-extrabold text-gray-800 text-center">
              Group Created Successfully! 🎉
            </Text>
          </View>

          {/* Group Code Display */}
          <View className="bg-white rounded-3xl p-8 mb-8 items-center shadow-lg">
            <Text className="text-lg text-gray-600 mb-4 text-center">
              Your Group Code:
            </Text>
            <Text className="text-6xl font-bold text-[#8B5CF6] tracking-widest mb-4">
              {generatedCode}
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              Share this code with others to invite them to your group
            </Text>
          </View>

          {/* Group Info */}
          <View className="bg-white rounded-2xl p-6 mb-8 shadow-md">
            <Text className="text-lg font-bold text-gray-800 mb-2">Group Name:</Text>
            <Text className="text-base text-gray-600 mb-4">{groupName}</Text>
            {description && (
              <>
                <Text className="text-lg font-bold text-gray-800 mb-2">Description:</Text>
                <Text className="text-base text-gray-600">{description}</Text>
              </>
            )}
          </View>

          {/* Continue Button */}
          <Pressable
            onPress={handleContinue}
            className="w-full rounded-full bg-[#8B5CF6] py-5 items-center justify-center shadow-lg"
          >
            <Text className="text-white text-xl font-semibold">Continue to Group</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F2F2F2]">
      <View className="flex-1 px-6 pt-8">
        {/* Header */}
        <View className="flex flex-row justify-center mb-8">
          <Text className="text-3xl font-extrabold text-gray-800">Create New Group</Text>
        </View>

        <View className="flex flex-row justify-center mb-8">
          <Text className="text-base text-gray-600 text-center">
            Enter a name for your group and get a unique 6-digit code
          </Text>
        </View>

        {/* Group Name Input */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-2">Group Name *</Text>
          <TextInput
            className="w-full bg-white rounded-2xl px-6 py-4 text-base border border-gray-300 shadow-sm"
            placeholder="Enter group name"
            value={groupName}
            onChangeText={setGroupName}
            maxLength={50}
            editable={!isLoading}
          />
        </View>

        {/* Description Input */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-700 mb-2">Description (Optional)</Text>
          <TextInput
            className="w-full bg-white rounded-2xl px-6 py-4 text-base border border-gray-300 shadow-sm"
            placeholder="Enter group description"
            value={description}
            onChangeText={setDescription}
            maxLength={200}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isLoading}
          />
        </View>

        {/* Create Button */}
        <Pressable
          onPress={handleCreateGroup}
          disabled={isLoading || !groupName.trim()}
          className={`w-full rounded-full py-5 items-center justify-center shadow-lg ${
            isLoading || !groupName.trim() ? 'bg-gray-400' : 'bg-[#8B5CF6]'
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-xl font-semibold">Create Group</Text>
          )}
        </Pressable>

        {/* Back Button */}
        <Pressable
          onPress={() => {
            try {
              router.replace('/groupchoice');
            } catch (error) {
              console.error('Navigation error:', error);
            }
          }}
          disabled={isLoading}
          className="w-full rounded-full bg-white border-2 border-gray-300 py-5 items-center justify-center mt-4"
        >
          <Text className="text-gray-700 text-lg font-semibold">Back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
