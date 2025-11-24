import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import axios from "axios";
import { API_URL } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";

interface UserSummary {
  id: number;
  name: string;
  amountPaid: string;
  shouldPay: string;
  difference: string;
}

interface Transaction {
  from: string;
  to: string;
  amount: number;
}

interface SplitData {
  total: number;
  perPersonAmount: number;
  usersSummary: UserSummary[];
  transactions: Transaction[];
}

export default function SplitBillScreen() {
  const { token } = useAuth();
  const [splitData, setSplitData] = useState<SplitData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettling, setIsSettling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSplitData();
  }, []);

  const fetchSplitData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/transactions/splitBills`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setSplitData(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching split data:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to fetch split calculation"
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSplitData();
  };

  const handleSettleBills = (action: "reset" | "delete") => {
    const title = action === "reset" ? "Reset Transactions?" : "Delete Group?";
    const message =
      action === "reset"
        ? "This will clear all transactions but keep your group. Are you sure?"
        : "This will delete all transactions AND the group. All members will be removed. Are you sure?";

    Alert.alert(title, message, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: action === "reset" ? "Reset" : "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setIsSettling(true);
            const response = await axios.post(
              `${API_URL}/transactions/settleBills`,
              { action },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.data.success) {
              Alert.alert(
                "Success",
                response.data.message,
                [
                  {
                    text: "OK",
                    onPress: () => {
                      if (action === "delete") {
                        // Navigate back to main screen after group deletion
                        router.replace("/(tabs)/maingroup");
                      } else {
                        // Refresh the data after reset
                        fetchSplitData();
                      }
                    },
                  },
                ],
                { cancelable: false }
              );
            }
          } catch (error: any) {
            console.error("Error settling bills:", error);
            Alert.alert(
              "Error",
              error.response?.data?.error || "Failed to settle bills"
            );
          } finally {
            setIsSettling(false);
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  if (!splitData || splitData.total === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-4 py-3 flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </Pressable>
          <Text className="text-2xl font-extrabold">Split Bill</Text>
        </View>

        <View className="flex-1 items-center justify-center px-4">
          <Ionicons name="calculator-outline" size={64} color="#D1D5DB" />
          <Text className="text-gray-500 text-lg font-semibold mt-4">
            No Transactions Yet
          </Text>
          <Text className="text-gray-400 text-sm text-center mt-2">
            Add some transactions to your group to see how bills should be split
          </Text>
          <Pressable
            onPress={() => router.push("/addactivity")}
            className="mt-6 bg-blue-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Add Activity</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-2xl font-extrabold">Split Bill</Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Total Summary Card */}
        <View className="mx-4 mt-2 mb-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-600 text-sm font-medium">
              Total Group Expenses
            </Text>
            <Text className="text-3xl font-bold text-blue-600">
              ${splitData.total.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between items-center pt-3 border-t border-blue-200">
            <Text className="text-gray-600 text-sm font-medium">
              Per Person
            </Text>
            <Text className="text-xl font-semibold text-blue-600">
              ${splitData.perPersonAmount.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* User Summary Section */}
        <View className="mx-4 mb-4">
          <Text className="text-lg font-bold mb-3">Member Summary</Text>
          {splitData.usersSummary.map((user) => {
            const diff = parseFloat(user.difference);
            const isOwed = diff > 0.01;
            const owes = diff < -0.01;

            return (
              <View
                key={user.id}
                className="bg-neutral-50 p-4 rounded-xl mb-2 border border-neutral-100"
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-base font-semibold">{user.name}</Text>
                  {isOwed && (
                    <View className="bg-green-100 px-3 py-1 rounded-full">
                      <Text className="text-green-700 text-xs font-semibold">
                        Should Receive
                      </Text>
                    </View>
                  )}
                  {owes && (
                    <View className="bg-red-100 px-3 py-1 rounded-full">
                      <Text className="text-red-700 text-xs font-semibold">
                        Should Pay
                      </Text>
                    </View>
                  )}
                </View>

                <View className="flex-row justify-between mt-2">
                  <View>
                    <Text className="text-xs text-gray-500">Paid</Text>
                    <Text className="text-sm font-medium">
                      ${parseFloat(user.amountPaid).toFixed(2)}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-xs text-gray-500">Should Pay</Text>
                    <Text className="text-sm font-medium">
                      ${parseFloat(user.shouldPay).toFixed(2)}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-xs text-gray-500">Difference</Text>
                    <Text
                      className={`text-sm font-bold ${
                        isOwed
                          ? "text-green-600"
                          : owes
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {isOwed ? "+" : ""}${Math.abs(diff).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Settlement Transactions */}
        {splitData.transactions.length > 0 && (
          <View className="mx-4 mb-4">
            <Text className="text-lg font-bold mb-3">Settlement Plan</Text>
            <View className="bg-yellow-50 p-3 rounded-xl mb-3 border border-yellow-200">
              <View className="flex-row items-center">
                <Ionicons name="information-circle" size={20} color="#D97706" />
                <Text className="text-yellow-800 text-xs font-medium ml-2 flex-1">
                  Follow these transactions to settle all balances
                </Text>
              </View>
            </View>

            {splitData.transactions.map((transaction, index) => (
              <View
                key={index}
                className="bg-white p-4 rounded-xl mb-2 border border-gray-200"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <View className="bg-red-100 px-2 py-1 rounded">
                        <Text className="text-red-700 text-xs font-semibold">
                          {transaction.from}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center my-2">
                      <Ionicons name="arrow-forward" size={20} color="#9CA3AF" />
                      <Text className="text-gray-500 text-xs ml-2">pays</Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="bg-green-100 px-2 py-1 rounded">
                        <Text className="text-green-700 text-xs font-semibold">
                          {transaction.to}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="ml-4 bg-blue-500 px-4 py-2 rounded-xl">
                    <Text className="text-white text-lg font-bold">
                      ${transaction.amount.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View className="mx-4 mb-6">
          <Text className="text-lg font-bold mb-3">Settlement Actions</Text>
          
          <Pressable
            onPress={() => handleSettleBills("reset")}
            disabled={isSettling}
            className={`bg-orange-500 p-4 rounded-xl mb-3 ${
              isSettling ? "opacity-50" : ""
            }`}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">
                Reset All Transactions
              </Text>
            </View>
            <Text className="text-orange-100 text-xs text-center mt-1">
              Clears all transactions but keeps the group
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleSettleBills("delete")}
            disabled={isSettling}
            className={`bg-red-500 p-4 rounded-xl ${
              isSettling ? "opacity-50" : ""
            }`}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="trash" size={20} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">
                Delete Group
              </Text>
            </View>
            <Text className="text-red-100 text-xs text-center mt-1">
              Removes all transactions and deletes the group
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
