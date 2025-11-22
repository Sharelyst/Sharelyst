// app/(tabs)/people.tsx
import { router } from "expo-router";
import React from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function People() {
  const people = ["MZ", "AB", "JK", "RS", "TT", "LW", "MD"];

  return (
    <SafeAreaView className="flex-1 bg-white">


                <View className="flex flex-row justify-between mb-5">
                                <Pressable onPress={() => router.back()}>
                                <Image source={require('@/assets/images/arrow_back.png')} className="width: 6, height: 6"  />
                                </Pressable>
                              
                                 
                              <Text className="text-3xl font-extrabold">Recent Activities</Text>
                              <View className='w-6 h-6'></View>
                  </View>




          <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-extrabold mb-4">Group Members</Text>

      {people.map((p, index) => (
        <View
          key={index}
          className="flex-row items-center py-3 border-b border-gray-300"
        >
          <View className="w-12 h-12 bg-blue-500 rounded-full justify-center items-center mr-4">
            <Text className="text-white text-base font-bold">{p}</Text>
          </View>

          <Text className="text-base font-medium">
            Person {index + 1}
          </Text>
        </View>
      ))}
          </ScrollView>
    </SafeAreaView>
  );
}
