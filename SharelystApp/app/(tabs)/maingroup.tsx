import React from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const router = useRouter();

  const people = ["M", "A", "J", "R", "T"];

  const recentActivities = [
    {
      id: 1,
      title: "Dinner at GrillHouse",
      people: ["D", "A"],
      amount: "$20",
    },
    {
      id: 2,
      title: "Coffee Run",
      people: ["S", "D"],
      amount: "$7",
    },
      {
      id: 3,
      title: "Coffee Run",
      people: ["Y"],
      amount: "$50",
    },
      {
      id: 4,
      title: "Coffee Run",
      people: ["M"],
      amount: "$10",
    },
  ];

  const displayedPeople = people.slice(0, 4);
  const hasOverflow = people.length > 4;

  return (
    <SafeAreaView className="flex-1 bg-white">
      
       <View className="flex flex-row justify-between">
                    <Pressable onPress={() => router.back()}>
                    <Image source={require('@/assets/images/arrow_back.png')} className="width: 6, height: 6"  />
                    </Pressable>
                  
                     
                  <Text className="text-3xl font-extrabold">Trip to Vegas !</Text>
                  <View className='w-6 h-6'></View>
      </View>
      
      
      <ScrollView className="flex-1 px-6 pt-6">
        {/* Top Total Bill Image Background */}
        <ImageBackground
          source={require("@/assets/images/gradient-1.png")}
          className="h-52 justify-end mb-5"
          imageStyle={{ borderRadius: 16 }}
        >
          <View className="p-4">
            <Text className="text-lg font-semibold text-white">Total Bill</Text>
            <Text className="text-3xl font-bold text-white my-1">
              $123.45
            </Text>

            <TouchableOpacity
              className="self-end bg-white py-1.5 px-3.5 rounded-lg mt-1.5"
              onPress={() => router.push("/split-bill")}
            >
              <Text className="text-[#007AFF] font-semibold">Split Bill</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* List of People */}
        <View className="mb-6">
          <View className="flex-row justify-between mb-3">
            <Text className="text-lg font-extrabold">List of People</Text>
            <TouchableOpacity onPress={() => router.push("/people")}>
              <Text className="text-lg font-extrabold">More</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row space-x-3">
            {displayedPeople.map((p, index) => (
              <View
                key={index}
                className="w-10 h-10 rounded-full border-[3px] border-black items-center justify-center mr-1">  
              
                <Text className="font-extrabold">{p}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View className="mb-6">
          <View className="flex-row justify-between mb-3">
            <Text className="text-lg font-extrabold">Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push("/activities")}>
              <Text className="text-lg font-extrabold">See All</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row justify-between">
  {/* Left column: initials */}
  <View>
    {recentActivities.map((item) => (
      <View key={item.id} className="flex-row mb-3">
        {item.people.map((initial, idx) => (
          <View
            key={idx}
            className="w-10 h-10 rounded-full border-[3px] border-black items-center justify-center mr-1"
          >
            <Text className="text-lg font-extrabold">{initial}</Text>
          </View>
        ))}
      </View>
    ))}
  </View>

  {/* Right column: amounts */}
  <View className="items-end">
    {recentActivities.map((item) => (
      <Text
        key={item.id}
        className="text-2xl font-extrabold mb-5"
      >
        {item.amount}
      </Text>
    ))}
  </View>
</View>


          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
