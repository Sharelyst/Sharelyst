import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { API_URL } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";
import { useFocusEffect } from "@react-navigation/native";

interface Member {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface GroupData {
  id: number;
  groupCode: number;
  name: string;
  description: string | null;
  members: Member[];
  createdAt: string;
}

interface Payment {
  id: number;
  amount: number;
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
}

interface Transaction {
  id: number;
  name: string;
  total: number;
  split: boolean;
  payments: Payment[];
  created_at: string;
}

export default function Home() {
  const router = useRouter();
  const { token } = useAuth();
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [totalBill, setTotalBill] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchGroupData();
    }, [])
  );

  const fetchGroupData = async () => {
    try {
      setIsLoading(true);
      const [groupResponse, totalResponse, activitiesResponse] = await Promise.all([
        axios.get(`${API_URL}/groups/my-group`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${API_URL}/transactions/total`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${API_URL}/transactions/my-group`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (groupResponse.data.success && groupResponse.data.data) {
        setGroupData(groupResponse.data.data);
      }

      if (totalResponse.data.success) {
        setTotalBill(totalResponse.data.data.total || 0);
      }

      if (activitiesResponse.data.success) {
        // Get only the 5 most recent activities
        setRecentActivities(activitiesResponse.data.data.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching group data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const displayedPeople = groupData?.members.slice(0, 4) || [];
  const hasOverflow = (groupData?.members.length || 0) > 4;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
       <View className="flex flex-row justify-center">
                  <Text className="text-3xl font-extrabold">{groupData?.name || "No Group"}</Text>
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
              ${totalBill.toFixed(2)}
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
            {displayedPeople.map((member, index) => (
              <View
                key={member.id}
                className="w-10 h-10 rounded-full border-[3px] border-black items-center justify-center mr-1">  
              
                <Text className="font-extrabold">{getInitials(member.first_name, member.last_name)}</Text>
              </View>
            ))}
            {hasOverflow && (
              <View className="w-10 h-10 rounded-full border-[3px] border-black items-center justify-center mr-1">
                <Text className="font-extrabold">+{(groupData?.members.length || 0) - 4}</Text>
              </View>
            )}
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
          
          {recentActivities.length === 0 ? (
            <View className="py-8 items-center">
              <Text className="text-gray-500 text-base">No recent activities</Text>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="-mx-2"
            >
              {recentActivities.map((activity) => (
                <View
                  key={activity.id}
                  className="bg-neutral-100 p-4 rounded-2xl mr-3 ml-2"
                  style={{ width: 200 }}
                >
                  <Text className="text-base font-semibold mb-2" numberOfLines={2}>
                    {activity.name}
                  </Text>

                  <Text className="text-2xl font-extrabold mb-3">
                    ${activity.total.toFixed(2)}
                  </Text>

                  <View className="flex-row flex-wrap">
                    {activity.payments.map((payment) => (
                      <View
                        key={payment.id}
                        className="w-10 h-10 rounded-full border-[3px] border-black items-center justify-center mr-1 mb-1"
                      >
                        <Text className="text-sm font-extrabold">
                          {getInitials(payment.first_name, payment.last_name)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      {/* Floating Add Button - Centered */}
      <TouchableOpacity
        className="absolute bottom-6 self-center bg-blue-500 w-16 h-16 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push("/addactivity")}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Text className="text-white text-4xl font-light">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
