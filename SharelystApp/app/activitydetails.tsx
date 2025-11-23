// app/activitydetails.tsx
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { API_URL } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";

interface Payment {
  id: number;
  amount: number;
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
}

interface TransactionDetails {
  id: number;
  name: string;
  total: number;
  split: boolean;
  payments: Payment[];
  created_at: string;
}

export default function ActivityDetailsScreen() {
  const { token } = useAuth();
  const params = useLocalSearchParams();
  const transactionId = params.id as string;
  
  const [activity, setActivity] = useState<TransactionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token && transactionId) {
      fetchActivityDetails();
    }
  }, [token, transactionId]);

  const fetchActivityDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/transactions/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setActivity(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching activity details:", error);
      setError("Failed to load activity details");
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

  if (error || !activity) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-4 py-3 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Text className="text-blue-500 text-lg">← Back</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-extrabold">Activity Details</Text>
        </View>
        
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-red-500 text-base text-center">
            {error || "Activity not found"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-3 flex-row items-center mb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-blue-500 text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-extrabold">Activity Details</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Transaction Name */}
        <View className="bg-neutral-100 p-4 rounded-2xl mb-4">
          <Text className="text-gray-600 text-sm mb-1">Transaction Name</Text>
          <Text className="text-xl font-bold">{activity.name}</Text>
        </View>

        {/* Total Amount */}
        <View className="bg-neutral-100 p-4 rounded-2xl mb-4">
          <Text className="text-gray-600 text-sm mb-1">Total Amount</Text>
          <Text className="text-3xl font-bold text-green-600">
            ${activity.total.toFixed(2)}
          </Text>
        </View>

        {/* Split Status */}
        <View className="bg-neutral-100 p-4 rounded-2xl mb-4">
          <Text className="text-gray-600 text-sm mb-1">Split Type</Text>
          <View className="flex-row items-center">
            <View
              className={`px-3 py-1 rounded-full ${
                activity.split ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              <Text
                className={`font-semibold ${
                  activity.split ? "text-blue-700" : "text-gray-700"
                }`}
              >
                {activity.split ? "Split Equally" : "Custom Split"}
              </Text>
            </View>
          </View>
        </View>

        {/* People Who Paid */}
        <View className="bg-neutral-100 p-4 rounded-2xl mb-4">
          <Text className="text-gray-600 text-sm mb-3">People Who Paid</Text>
          
          {activity.payments.length === 0 ? (
            <Text className="text-gray-500 italic">No payments recorded</Text>
          ) : (
            <View className="space-y-3">
              {activity.payments.map((payment) => (
                <View
                  key={payment.id}
                  className="flex-row items-center justify-between py-2 border-b border-gray-200 last:border-b-0"
                >
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mr-3">
                      <Text className="text-white font-semibold">
                        {getInitials(payment.first_name, payment.last_name)}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold">
                        {payment.first_name} {payment.last_name}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        @{payment.username}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="items-end">
                    <Text className="text-lg font-bold text-green-600">
                      ${payment.amount.toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Created Date */}
        <View className="bg-neutral-100 p-4 rounded-2xl mb-6">
          <Text className="text-gray-600 text-sm mb-1">Created</Text>
          <Text className="text-base">
            {new Date(activity.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
