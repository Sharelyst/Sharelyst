// app/(tabs)/people.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PeopleScreen() {
  const people = ["MZ", "AB", "JK", "RS", "TT", "LW", "MD"];

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Group Members</Text>

      {people.map((p, index) => (
        <View key={index} style={styles.personRow}>
          <View style={styles.pfp}>
            <Text style={styles.pfpText}>{p}</Text>
          </View>
          <Text style={styles.personName}>Person {index + 1}</Text>
        </View>
      ))}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  pfp: {
    width: 48,
    height: 48,
    backgroundColor: "#007AFF",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  pfpText: { color: "white", fontSize: 16, fontWeight: "700" },
  personName: { fontSize: 16, fontWeight: "500" },
});
