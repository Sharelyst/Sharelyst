// app/(tabs)/profile.tsx
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import axios from "axios";
import { API_URL } from "@/config/api";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
}

export default function ProfileScreen() {
  const { logout, token, user, navigationPreference, setNavigationPreference } = useAuth();
  const [isLeavingGroup, setIsLeavingGroup] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Editable fields
  const [editedFirstName, setEditedFirstName] = useState("");
  const [editedLastName, setEditedLastName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [editedUsername, setEditedUsername] = useState("");

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token, user]);

  const fetchUserProfile = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && response.data.data) {
        const profile = response.data.data;
        setUserProfile(profile);
        // Initialize editable fields
        setEditedFirstName(profile.first_name);
        setEditedLastName(profile.last_name);
        setEditedEmail(profile.email);
        setEditedPhone(profile.phone || "");
        setEditedUsername(profile.username);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editedFirstName.trim() || !editedLastName.trim() || !editedEmail.trim() || !editedUsername.trim()) {
      Alert.alert("Error", "First name, last name, email, and username are required");
      return;
    }

    try {
      setIsSaving(true);
      const response = await axios.put(
        `${API_URL}/auth/profile`,
        {
          firstName: editedFirstName.trim(),
          lastName: editedLastName.trim(),
          email: editedEmail.trim(),
          phone: editedPhone.trim() || null,
          username: editedUsername.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUserProfile(response.data.data);
        setIsEditing(false);
        Alert.alert("Success", "Profile updated successfully");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update profile. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (userProfile) {
      setEditedFirstName(userProfile.first_name);
      setEditedLastName(userProfile.last_name);
      setEditedEmail(userProfile.email);
      setEditedPhone(userProfile.phone || "");
      setEditedUsername(userProfile.username);
    }
    setIsEditing(false);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

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

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="items-center px-6 pt-8">
            {/* Profile Avatar */}
            <View className="w-24 h-24 rounded-full border-[3px] border-black items-center justify-center mb-4">
              <Text className="text-black text-4xl font-extrabold">
                {userProfile ? getInitials(userProfile.first_name, userProfile.last_name) : 'NA'}
              </Text>
            </View>

            {/* Profile Header */}
            <Text className="text-2xl font-extrabold mb-2">
              {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'User'}
            </Text>
            <Text className="text-base text-gray-500 mb-6">
              @{userProfile?.username || 'username'}
            </Text>

            {/* Edit/Save Buttons */}
            <View className="flex-row mb-6">
              {!isEditing ? (
                <TouchableOpacity
                  className="py-2 px-6 bg-blue-500 rounded-xl"
                  onPress={() => setIsEditing(true)}
                >
                  <Text className="text-white font-semibold">Edit Profile</Text>
                </TouchableOpacity>
              ) : (
                <View className="flex-row space-x-3">
                  <TouchableOpacity
                    className="py-2 px-6 bg-green-500 rounded-xl"
                    onPress={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text className="text-white font-semibold">Save</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="py-2 px-6 bg-gray-400 rounded-xl"
                    onPress={handleCancelEdit}
                    disabled={isSaving}
                  >
                    <Text className="text-white font-semibold">Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Profile Information Section */}
            <View className="w-full mb-6">
              <Text className="text-xl font-bold mb-4">Profile Information</Text>
              
              {/* First Name */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-1">First Name</Text>
                {isEditing ? (
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                    value={editedFirstName}
                    onChangeText={setEditedFirstName}
                    placeholder="First Name"
                    editable={!isSaving}
                  />
                ) : (
                  <View className="bg-gray-100 rounded-lg px-4 py-3">
                    <Text className="text-base">{userProfile?.first_name || 'N/A'}</Text>
                  </View>
                )}
              </View>

              {/* Last Name */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-1">Last Name</Text>
                {isEditing ? (
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                    value={editedLastName}
                    onChangeText={setEditedLastName}
                    placeholder="Last Name"
                    editable={!isSaving}
                  />
                ) : (
                  <View className="bg-gray-100 rounded-lg px-4 py-3">
                    <Text className="text-base">{userProfile?.last_name || 'N/A'}</Text>
                  </View>
                )}
              </View>

              {/* Username */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-1">Username</Text>
                {isEditing ? (
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                    value={editedUsername}
                    onChangeText={setEditedUsername}
                    placeholder="Username"
                    autoCapitalize="none"
                    editable={!isSaving}
                  />
                ) : (
                  <View className="bg-gray-100 rounded-lg px-4 py-3">
                    <Text className="text-base">{userProfile?.username || 'N/A'}</Text>
                  </View>
                )}
              </View>

              {/* Email */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-1">Email</Text>
                {isEditing ? (
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                    value={editedEmail}
                    onChangeText={setEditedEmail}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isSaving}
                  />
                ) : (
                  <View className="bg-gray-100 rounded-lg px-4 py-3">
                    <Text className="text-base">{userProfile?.email || 'N/A'}</Text>
                  </View>
                )}
              </View>

              {/* Phone */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-1">Phone Number</Text>
                {isEditing ? (
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                    value={editedPhone}
                    onChangeText={setEditedPhone}
                    placeholder="Phone Number (optional)"
                    keyboardType="phone-pad"
                    editable={!isSaving}
                  />
                ) : (
                  <View className="bg-gray-100 rounded-lg px-4 py-3">
                    <Text className="text-base">{userProfile?.phone || 'Not provided'}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Settings Section */}
            <View className="w-full mb-6">
              <Text className="text-xl font-bold mb-4">Settings</Text>
              
              {/* Navigation Style */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Navigation Style</Text>
                <View className="flex-row space-x-3">
                  <TouchableOpacity
                    className={`flex-1 py-3 rounded-lg ${navigationPreference === 'navbar' ? 'bg-blue-500' : 'bg-gray-200'}`}
                    onPress={() => setNavigationPreference('navbar')}
                  >
                    <Text className={`font-semibold text-center ${navigationPreference === 'navbar' ? 'text-white' : 'text-gray-700'}`}>
                      Navigation Bar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 py-3 rounded-lg ${navigationPreference === 'hamburger' ? 'bg-blue-500' : 'bg-gray-200'}`}
                    onPress={() => setNavigationPreference('hamburger')}
                  >
                    <Text className={`font-semibold text-center ${navigationPreference === 'hamburger' ? 'text-white' : 'text-gray-700'}`}>
                      Hamburger
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Actions Section */}
            <View className="w-full mb-8">
              <Text className="text-xl font-bold mb-4">Actions</Text>
              
              {/* Leave Group Button */}
              <TouchableOpacity
                className="w-full py-3 bg-orange-500 rounded-xl mb-3"
                onPress={handleLeaveGroup}
                disabled={isLeavingGroup}
              >
                {isLeavingGroup ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-base font-semibold text-center">
                    Leave Group
                  </Text>
                )}
              </TouchableOpacity>

              {/* Logout Button */}
              <TouchableOpacity
                className="w-full py-3 bg-red-500 rounded-xl"
                onPress={logout}
              >
                <Text className="text-white text-base font-semibold text-center">
                  Log Out
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
