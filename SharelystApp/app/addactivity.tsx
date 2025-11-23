// app/addactivity.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import axios from "axios";
import { API_URL } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";

interface Member {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  amount: string;
  selected: boolean;
}

export default function AddActivity() {
  const router = useRouter();
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [total, setTotal] = useState("");
  const [split, setSplit] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (token) {
      fetchGroupMembers();
    }
  }, [token]);

  useEffect(() => {
    // When split or total changes, recalculate amounts
    if (split && total && members.length > 0) {
      distributeSplitAmounts();
    }
  }, [split, total]);

  const fetchGroupMembers = async () => {
    if (!token) {
      console.log("No token available, skipping fetch");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/groups/my-group`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success && response.data.data) {
        const membersWithAmount = response.data.data.members.map(
          (member: any) => ({
            ...member,
            amount: "0",
            selected: false,
          })
        );
        setMembers(membersWithAmount);
      }
    } catch (error) {
      console.error("Error fetching group members:", error);
      Alert.alert("Error", "Failed to fetch group members");
    } finally {
      setIsLoading(false);
    }
  };

  const distributeSplitAmounts = () => {
    const selectedMembers = members.filter((m) => m.selected);
    if (selectedMembers.length === 0) return;

    const totalAmount = parseFloat(total) || 0;
    const splitAmount = (totalAmount / selectedMembers.length).toFixed(2);

    setMembers((prevMembers) =>
      prevMembers.map((member) => ({
        ...member,
        amount: member.selected ? splitAmount : "0",
      }))
    );
  };

  const toggleMemberSelection = (memberId: number) => {
    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === memberId
          ? { ...member, selected: !member.selected }
          : member
      )
    );

    // If split is on, recalculate after state update
    if (split) {
      setTimeout(distributeSplitAmounts, 0);
    }
  };

  const updateMemberAmount = (memberId: number, amount: string) => {
    // Only allow if split is OFF
    if (split) return;

    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === memberId ? { ...member, amount } : member
      )
    );
  };

  const validateAndSubmit = async () => {
    // Validate name
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a transaction name");
      return;
    }

    // Validate total
    const totalAmount = parseFloat(total);
    if (!total || isNaN(totalAmount) || totalAmount <= 0) {
      Alert.alert("Error", "Please enter a valid total amount");
      return;
    }

    // Get selected members with amounts
    const selectedMembers = members.filter((m) => m.selected);
    if (selectedMembers.length === 0) {
      Alert.alert("Error", "Please select at least one person");
      return;
    }

    // Validate amounts
    let sumOfAmounts = 0;
    const payments = [];

    for (const member of selectedMembers) {
      const amount = parseFloat(member.amount);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert(
          "Error",
          `Please enter a valid amount for ${member.first_name} ${member.last_name}`
        );
        return;
      }
      sumOfAmounts += amount;
      payments.push({
        user_id: member.id,
        amount: amount,
      });
    }

    // Validate sum equals total (within 0.01 tolerance)
    if (Math.abs(sumOfAmounts - totalAmount) > 0.01) {
      Alert.alert(
        "Error",
        `The sum of amounts ($${sumOfAmounts.toFixed(
          2
        )}) must equal the total ($${totalAmount.toFixed(2)})`
      );
      return;
    }

    // Submit to backend
    try {
      setIsSaving(true);
      const response = await axios.post(
        `${API_URL}/transactions/create`,
        {
          name: name.trim(),
          total: totalAmount,
          split: split,
          payments: payments,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        Alert.alert("Success", "Transaction created successfully", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to create transaction"
      );
    } finally {
      setIsSaving(false);
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
      <ScrollView className="flex-1 p-6">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-lg text-blue-500 font-semibold">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-extrabold">New Activity</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Transaction Name */}
        <View className="mb-6">
          <Text className="text-base font-semibold mb-2">Transaction Name</Text>
          <TextInput
            className="border border-gray-300 rounded-xl p-4 text-base"
            placeholder="e.g., Dinner at Restaurant"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Total Amount */}
        <View className="mb-6">
          <Text className="text-base font-semibold mb-2">Total Amount</Text>
          <View className="flex-row items-center border border-gray-300 rounded-xl p-4">
            <Text className="text-lg font-semibold mr-2">$</Text>
            <TextInput
              className="flex-1 text-base"
              placeholder="0.00"
              value={total}
              onChangeText={setTotal}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Split Toggle */}
        <View className="mb-6 flex-row items-center justify-between bg-gray-100 rounded-xl p-4">
          <View>
            <Text className="text-base font-semibold">Split Equally</Text>
            <Text className="text-sm text-gray-600">
              Divide amount equally among selected people
            </Text>
          </View>
          <Switch
            value={split}
            onValueChange={(value) => {
              setSplit(value);
              if (value) {
                distributeSplitAmounts();
              }
            }}
            trackColor={{ false: "#D1D5DB", true: "#60A5FA" }}
            thumbColor={split ? "#3B82F6" : "#F3F4F6"}
          />
        </View>

        {/* Select People */}
        <View className="mb-6">
          <Text className="text-base font-semibold mb-3">Select People</Text>
          {members.map((member) => (
            <View
              key={member.id}
              className="flex-row items-center justify-between mb-3 p-3 bg-gray-50 rounded-xl"
            >
              <TouchableOpacity
                className="flex-row items-center flex-1"
                onPress={() => toggleMemberSelection(member.id)}
              >
                <View
                  className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
                    member.selected
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-400"
                  }`}
                >
                  {member.selected && (
                    <Text className="text-white font-bold text-xs">✓</Text>
                  )}
                </View>

                <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-3">
                  <Text className="text-white font-bold text-xs">
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
              </TouchableOpacity>

              {member.selected && (
                <View className="flex-row items-center">
                  <Text className="text-lg font-semibold mr-2">$</Text>
                  <TextInput
                    className={`border border-gray-300 rounded-lg p-2 w-24 text-base ${
                      split ? "bg-gray-200" : "bg-white"
                    }`}
                    value={member.amount}
                    onChangeText={(text) => updateMemberAmount(member.id, text)}
                    keyboardType="decimal-pad"
                    editable={!split}
                  />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="bg-blue-500 rounded-xl p-4 items-center mb-6"
          onPress={validateAndSubmit}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg font-bold">
              Create Transaction
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
