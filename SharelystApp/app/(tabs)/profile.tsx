// app/(tabs)/profile.tsx
import React from "react";
import { View, Text, TouchableOpacity, Pressable, Image } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { logout } = useAuth();

  return (

        <SafeAreaView className="flex-1 bg-white">



                    <View className="flex flex-row justify-between mb-5">
                                <Pressable onPress={() => router.back()}>
                                <Image source={require('@/assets/images/arrow_back.png')} className="width: 6, height: 6"  />
                                </Pressable>
                              
                              <View className='w-6 h-6'></View>
                  </View>
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
