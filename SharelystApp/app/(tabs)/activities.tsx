// app/(tabs)/activities.tsx
import { router } from "expo-router";
import React from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ActivitiesScreen() {
  const activities = [
    { id: 1, title: "Dinner at GrillHouse", amount: "$42.50", people: ["MZ", "AB"] },
    { id: 2, title: "Coffee Run", amount: "$8.00", people: ["JK"] },
    { id: 3, title: "Snacks & Drinks", amount: "$19.25", people: ["RS", "TT"] },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1 p-4" bg-white>
      

              <View className="flex flex-row justify-between mb-5">
                                <Pressable onPress={() => router.back()}>
                                <Image source={require('@/assets/images/arrow_back.png')} className="width: 6, height: 6"  />
                                </Pressable>
                              
                                 
                              <Text className="text-3xl font-extrabold">Recent Activities</Text>
                              <View className='w-6 h-6'></View>
                  </View>

      {activities.map((a) => (
        <View
          key={a.id}
          className="bg-neutral-100 p-4 rounded-2xl mb-3"
        >
          <Text className="text-base font-semibold mb-1">
            {a.title}
          </Text>

          <Text className="text-lg font-bold mb-2">
            {a.amount}
          </Text>

          <View className="flex-row space-x-3">
            {a.people.map((p, index) => (
              <View
                key={index}
                className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center"
              >
                <Text className="text-white font-semibold text-xs">
                  {p}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
    </SafeAreaView>
    
  );
}
