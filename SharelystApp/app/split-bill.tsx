import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SplitBillScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-xl font-bold mb-2">Split Bill</Text>
        <Text className="text-gray-500 text-center">
          This feature is coming soon!
        </Text>
      </View>
    </SafeAreaView>
  );
}
