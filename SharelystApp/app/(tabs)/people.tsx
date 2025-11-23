// app/(tabs)/people.tsx
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator, TouchableOpacity } from "react-native";
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
  totalSpent: number;
}

interface Payment {
  id: number;
  amount: number;
  user_id: number;
}

interface Transaction {
  id: number;
  name: string;
  total: number;
  payments: Payment[];
}

export default function People() {
  const { token } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchGroupMembers();
    }, [])
  );

  const fetchGroupMembers = async () => {
    try {
      setIsLoading(true);
      const [groupResponse, transactionsResponse] = await Promise.all([
        axios.get(`${API_URL}/groups/my-group`, {
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
        const groupMembers = groupResponse.data.data.members;
        const transactions: Transaction[] = transactionsResponse.data.success 
          ? transactionsResponse.data.data 
          : [];

        // Calculate total spent for each member
        const membersWithSpending = groupMembers.map((member: any) => {
          const totalSpent = transactions.reduce((sum, transaction) => {
            const userPayment = transaction.payments.find(
              (payment) => payment.user_id === member.id
            );
            return sum + (userPayment ? userPayment.amount : 0);
          }, 0);

          return {
            ...member,
            totalSpent,
          };
        });

        setMembers(membersWithSpending);
      }
    } catch (error) {
      console.error("Error fetching group members:", error);
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
          <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-extrabold mb-4">Group Members</Text>

      {members.map((member, index) => (
        <TouchableOpacity
          key={member.id}
          className="flex-row items-center py-3 border-b border-gray-300"
          onPress={() =>
            router.push({
              pathname: "/persondetails",
              params: {
                id: member.id,
                name: `${member.first_name} ${member.last_name}`,
                initials: getInitials(member.first_name, member.last_name),
              },
            })
          }
        >
          <View className="w-12 h-12 bg-blue-500 rounded-full justify-center items-center mr-4">
            <Text className="text-white text-base font-bold">
              {getInitials(member.first_name, member.last_name)}
            </Text>
          </View>

          <View className="flex-1">
            <Text className="text-base font-medium">
              {member.first_name} {member.last_name}
            </Text>
            <Text className="text-sm text-gray-500">
              @{member.username}
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-lg font-bold text-gray-800">
              ${member.totalSpent.toFixed(2)}
            </Text>
            <Text className="text-xs text-gray-500">spent</Text>
            <Text className="text-xs text-blue-500 mt-1">View →</Text>
          </View>
        </TouchableOpacity>
      ))}
          </ScrollView>
    </SafeAreaView>
  );
}
