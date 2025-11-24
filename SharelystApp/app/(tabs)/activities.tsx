// app/(tabs)/activities.tsx
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { API_URL } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";
import { useFocusEffect } from "@react-navigation/native";

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

export default function ActivitiesScreen() {
  const { token } = useAuth();
  const [activities, setActivities] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      if (token) {
        fetchActivities();
      }
    }, [token])
  );

  const fetchActivities = async () => {
    if (!token) {
      console.log("No token available, skipping fetch");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/transactions/my-group`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setActivities(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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
      <View className="flex-1">
        <View className="px-4 py-3 flex-row items-center justify-center">
          <Text className="text-2xl font-extrabold">Activities</Text>
        </View>

        <ScrollView className="flex-1 px-4">
          {activities.length === 0 ? (
            <View className="items-center justify-center py-20">
              <Text className="text-gray-500 text-base mb-4">No activities yet</Text>
              <Text className="text-gray-400 text-sm text-center">
                Create your first activity by tapping the button below
              </Text>
            </View>
          ) : (
            activities.map((activity) => (
              <Pressable
                key={activity.id}
                onPress={() => router.push(`/activitydetails?id=${activity.id}`)}
                className="bg-neutral-100 p-4 rounded-2xl mb-3 active:bg-neutral-200"
              >
                <Text className="text-base font-semibold mb-1">
                  {activity.name}
                </Text>

                <Text className="text-lg font-bold mb-2">
                  ${activity.total.toFixed(2)}
                </Text>

                <View className="flex-row flex-wrap">
                  {activity.payments.map((payment) => (
                    <View
                      key={payment.id}
                      className="w-10 h-10 border-[3px] border-black rounded-full items-center justify-center mr-2 mb-2"
                    >
                      <Text className="font-extrabold text-xs">
                        {getInitials(payment.first_name, payment.last_name)}
                      </Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>

        {/* Floating Add Button */}
        {/* <TouchableOpacity
          className="absolute bottom-6 right-6 bg-blue-500 w-16 h-16 rounded-full items-center justify-center shadow-lg"
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
        </TouchableOpacity> */}
      </View>
    </SafeAreaView>
  );
}
