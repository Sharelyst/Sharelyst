// app/persondetails.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
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

interface Transaction {
  id: number;
  name: string;
  total: number;
  split: boolean;
  payments: Payment[];
  created_at: string;
}

export default function PersonDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const personId = parseInt(params.id as string);
  const personName = params.name as string;
  const personInitials = params.initials as string;

  useEffect(() => {
    if (token) {
      fetchPersonTransactions();
    }
  }, [token]);

  const fetchPersonTransactions = async () => {
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
        // Filter transactions that include this person
        const personTransactions = response.data.data.filter(
          (transaction: Transaction) =>
            transaction.payments.some((payment) => payment.user_id === personId)
        );
        setTransactions(personTransactions);
      }
    } catch (error) {
      console.error("Error fetching person transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPersonAmount = (transaction: Transaction) => {
    const payment = transaction.payments.find((p) => p.user_id === personId);
    return payment ? payment.amount : 0;
  };

  const getTotalSpent = () => {
    return transactions.reduce((sum, transaction) => {
      return sum + getPersonAmount(transaction);
    }, 0);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
        {/* Header */}
        <View className="px-6 py-4 border-b border-gray-200">
          {/* <TouchableOpacity
            onPress={() => router.back()}
            className="mb-4"
          >
            <Text className="text-lg text-blue-500 font-semibold">← Back</Text>
          </TouchableOpacity> */}

          <View className="flex-row items-center">
            <View className="w-16 h-16 border-[3px] border-black rounded-full items-center justify-center mr-4">
              <Text className="font-extrabold text-2xl">
                {personInitials}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-2xl font-extrabold">{personName}</Text>
              <Text className="text-lg text-gray-600 mt-1">
                Total Spent: ${getTotalSpent().toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Transactions List */}
        <ScrollView className="flex-1 px-6 py-4">
          <Text className="text-xl font-extrabold mb-4">
            Transactions ({transactions.length})
          </Text>

          {transactions.length === 0 ? (
            <View className="items-center py-20">
              <Text className="text-gray-500 text-base">
                No transactions found
              </Text>
            </View>
          ) : (
            transactions.map((transaction) => (
              <View
                key={transaction.id}
                className="bg-neutral-100 p-4 rounded-2xl mb-3"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-base font-semibold flex-1 mr-2">
                    {transaction.name}
                  </Text>
                  <Text className="text-lg font-extrabold">
                    ${getPersonAmount(transaction).toFixed(2)}
                  </Text>
                </View>

                <Text className="text-sm text-gray-600 mb-3">
                  {formatDate(transaction.created_at)}
                </Text>

                <View className="flex-row items-center justify-between pt-2 border-t border-gray-300">
                  <View className="flex-row">
                    <Text className="text-sm text-gray-600 mr-2">With:</Text>
                    {transaction.payments
                      .filter((p) => p.user_id !== personId)
                      .slice(0, 3)
                      .map((payment) => (
                        <View
                          key={payment.id}
                          className="w-8 h-8 border-[3px] border-black rounded-full items-center justify-center mr-1"
                        >
                          <Text className="font-extrabold text-xs">
                            {getInitials(payment.first_name, payment.last_name)}
                          </Text>
                        </View>
                      ))}
                    {transaction.payments.filter((p) => p.user_id !== personId)
                      .length > 3 && (
                      <View className="w-8 h-8 bg-gray-400 rounded-full items-center justify-center">
                        <Text className="text-white font-bold text-xs">
                          +
                          {transaction.payments.filter(
                            (p) => p.user_id !== personId
                          ).length - 3}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text className="text-sm text-gray-500">
                    Total: ${transaction.total.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
